
import client from '../../servicios/apolloClient'
import { gql } from '@apollo/client'

const OBTENER_PEDIDOS = gql`
  query ListadoPedidosAdministracion($input: FiltroPedidosAdministracionInput) {
    listadoPedidosAdministracion(input: $input) {
      items {
        id
        code
        state
        createdAt
        orderPlacedAt
        totalQuantity
        totalWithTax
        customer { firstName lastName emailAddress }
        shippingLines { shippingMethod { code name } }
        payments { method state }
      }
      totalItems
    }
  }
`

const OBTENER_DETALLE_PEDIDO = gql`
  query DetallePedido($id: ID!) {
    order(id: $id) {
      id
      code
      state
      subTotalWithTax
      shippingWithTax
      totalWithTax
      discounts { description amountWithTax }
      payments { method amount state transactionId }
      customer { firstName lastName emailAddress }
      shippingAddress { streetLine1 city province postalCode phoneNumber }
      billingAddress { streetLine1 city province postalCode phoneNumber }
      shippingLines { shippingMethod { code name } }
      fulfillments { id state method trackingCode }
      lines {
        id
        quantity
        fulfillmentLines { quantity fulfillmentId }
        productVariant { name product { name } }
      }
    }
  }
`

export async function obtenerDetallePedido(id) {
  const { data } = await client.query({
    query: OBTENER_DETALLE_PEDIDO,
    variables: { id },
    fetchPolicy: 'network-only',
  })
  return data.order
}

const OBTENER_CONTADORES = gql`
  query ContadoresPedidos {
    confirmados: orders(options: { take: 1, filter: { state: { eq: "PaymentSettled" } } }) { totalItems }
    preparacion: orders(options: { take: 1, filter: { state: { eq: "EnPreparacion" } } }) { totalItems }
    listosRetiro: orders(options: { take: 1, filter: { state: { eq: "ListoParaRetirar" } } }) { totalItems }
    enviados: orders(options: { take: 1, filter: { state: { eq: "Shipped" } } }) { totalItems }
    entregados: orders(options: { take: 1, filter: { state: { eq: "Delivered" } } }) { totalItems }
  }
`

// Todo el circuito de envío pasa por esta mutación del back: valida el paso,
// crea el despacho cuando corresponde y solo pide el permiso GestionarEnvios.
const TRANSICIONAR_ESTADO = gql`
  mutation AvanzarEstadoPedido(
    $id: ID!
    $estado: String!
    $empresaEnvio: String
    $codigoSeguimiento: String
  ) {
    avanzarEstadoPedido(
      id: $id
      estado: $estado
      empresaEnvio: $empresaEnvio
      codigoSeguimiento: $codigoSeguimiento
    ) {
      ... on Order { id state }
      ... on ErrorResult { errorCode message }
    }
  }
`

const CANCELAR_PEDIDO = gql`
  mutation CancelarPedido($input: CancelOrderInput!) {
    cancelOrder(input: $input) {
      ... on Order { id state }
      ... on ErrorResult { errorCode message }
    }
  }
`

export async function cancelarPedido(orderId, motivo) {
  const razon = String(motivo || '').trim()
  if (!razon) throw new Error('Ingresá un motivo para cancelar el pedido.')

  // Volvemos a consultar antes de cancelar para evitar acciones sobre estados viejos.
  const pedido = await obtenerDetallePedido(orderId)
  if (!pedido || !['PaymentSettled', 'EnPreparacion'].includes(pedido.state)) {
    throw new Error('El pedido ya no está en un estado que permita cancelarlo.')
  }

  // No intentar cancelar pedidos cuyas líneas ya fueron vaciadas
  // por una operación anterior fallida.
  const lineasPedido = pedido.lines || []
  if (!lineasPedido.length || lineasPedido.some(linea =>
    !linea.id || !Number.isInteger(linea.quantity) || linea.quantity <= 0
  )) {
    throw new Error('El pedido tiene productos con cantidades inválidas. Revisalo antes de cancelar.')
  }

  // Evitar cancelaciones de pedidos que ya tengan unidades asociadas a despachos.
  if (pedido.fulfillments?.some(despacho => despacho.state !== 'Cancelled') ||
      lineasPedido.some(linea => (linea.fulfillmentLines || []).some(asignacion => asignacion.quantity > 0))) {
    throw new Error('El pedido tiene despachos asociados. Revisalo antes de cancelar.')
  }

  const lines = lineasPedido.map(linea => ({
    orderLineId: linea.id,
    quantity: linea.quantity,
  }))

  const { data } = await client.mutate({
    mutation: CANCELAR_PEDIDO,
    variables: {
      input: {
        orderId,
        lines,
        cancelShipping: true,
        reason: razon,
      },
    },
  })
  const resultado = data?.cancelOrder
  if (!resultado || resultado.errorCode || resultado.state !== 'Cancelled') {
    throw new Error(resultado?.message || 'Vendure no confirmó la cancelación del pedido.')
  }
  return obtenerDetallePedido(orderId)
}

export async function despacharPedido(orderId, { empresaEnvio, codigoSeguimiento } = {}) {
  const empresa = String(empresaEnvio || '').trim()
  if (!empresa) throw new Error('Indicá la empresa de envío.')

  // El back crea el despacho, lo pasa a Enviado y manda el correo con el seguimiento.
  await transicionarEstado(orderId, 'Shipped', {
    empresaEnvio: empresa,
    codigoSeguimiento: String(codigoSeguimiento || '').trim() || null,
  })
  return obtenerDetallePedido(orderId)
}

export async function entregarPedido(orderId) {
  await transicionarEstado(orderId, 'Delivered')
  return obtenerDetallePedido(orderId)
}

export const ESTADO_MAP = {
  PaymentSettled: 'Pago confirmado',
  EnPreparacion: 'En preparación',
  ListoParaRetirar: 'Listo para retirar',
  Shipped: 'Enviado',
  Delivered: 'Entregado',
  Cancelled: 'Cancelado',
}

const COLOR_MAP = {
  PaymentSettled: 'fondo-azul',
  EnPreparacion: 'fondo-violeta',
  ListoParaRetirar: 'fondo-amarillo',
  Shipped: 'fondo-amarillo',
  Delivered: 'fondo-verde',
  Cancelled: 'fondo-gris',
}

const TAMANIO_BLOQUE = 100
const FORMATO_PESOS = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
})

function obtenerEstadoPago(pagos = []) {
  if (pagos.some(pago => pago.state === 'Settled')) return 'Confirmado'
  if (pagos.some(pago => pago.state === 'Authorized')) return 'Autorizado'
  if (pagos.some(pago => pago.state === 'Declined')) return 'Rechazado'
  if (pagos.some(pago => pago.state === 'Cancelled')) return 'Cancelado'
  if (pagos.length > 0) return pagos[0].state
  return 'Sin pago'
}

function obtenerMetodosEnvio(pedido) {
  return [...new Set((pedido.shippingLines || [])
    .map(linea => linea.shippingMethod?.name)
    .filter(Boolean))]
}

function transformarPedido(pedido, fechaConfirmacion = false) {
  const metodosEnvio = obtenerMetodosEnvio(pedido)
  return {
    id: pedido.id,
    codigo: pedido.code,
    cliente: pedido.customer
      ? `${pedido.customer.firstName || ''} ${pedido.customer.lastName || ''}`.trim() || 'Sin cliente'
      : 'Sin cliente',
    correo: pedido.customer?.emailAddress || '',
    fecha: new Date(fechaConfirmacion ? pedido.orderPlacedAt : pedido.createdAt).toLocaleDateString('es-AR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      timeZone: 'America/Argentina/Buenos_Aires',
    }),
    estadoVendure: pedido.state,
    estado: ESTADO_MAP[pedido.state] || pedido.state,
    envio: metodosEnvio.length ? metodosEnvio.join(', ') : 'Sin envío',
    pago: obtenerEstadoPago(pedido.payments || []),
    metodoPago: (pedido.payments || []).map(pago => pago.method).filter(Boolean).join(', '),
    unidades: pedido.totalQuantity,
    total: FORMATO_PESOS.format(pedido.totalWithTax / 100),
    color: COLOR_MAP[pedido.state] || 'fondo-gris',
  }
}

function filtrosConsulta({
  busqueda = '', estado = '', envio = '', fechaDesde = '', fechaHasta = '',
  soloConfirmados = false, fechaConfirmacion = false,
} = {}) {
  return { busqueda: String(busqueda || '').trim(), estado, envio, fechaDesde, fechaHasta,
    soloConfirmados, fechaConfirmacion }
}

async function consultarPedidos(skip, take, filtros) {
  const { data } = await client.query({
    query: OBTENER_PEDIDOS,
    variables: { input: { ...filtros, skip, take } },
    fetchPolicy: 'network-only',
  })
  const resultado = data?.listadoPedidosAdministracion
  if (!resultado || !Array.isArray(resultado.items) || !Number.isInteger(resultado.totalItems)) {
    throw new Error('No pudimos consultar el listado de pedidos.')
  }
  return resultado
}

export async function obtenerPedidos({ pagina = 1, take = 20, ...criterios } = {}) {
  const filtros = filtrosConsulta(criterios)
  const resultado = await consultarPedidos((pagina - 1) * take, take, filtros)
  return {
    pedidos: resultado.items.map(pedido => transformarPedido(pedido, filtros.fechaConfirmacion)),
    total: resultado.totalItems,
  }
}

const OBTENER_METODOS_ENTREGA = gql`
  query MetodosEntregaPedidos { metodosEntregaPedidos }
`
export async function obtenerMetodosEnvioPedidos() {
  const { data } = await client.query({ query: OBTENER_METODOS_ENTREGA, fetchPolicy: 'network-only' })
  if (!Array.isArray(data?.metodosEntregaPedidos)) throw new Error('No pudimos consultar los métodos de entrega.')
  return data.metodosEntregaPedidos
}

export async function obtenerContadoresPedidos() {
  const { data } = await client.query({
    query: OBTENER_CONTADORES,
    fetchPolicy: 'network-only',
  })
  return [
    { nombre: 'Pago confirmado', cantidad: data.confirmados.totalItems, color: 'fondo-azul' },
    { nombre: 'En preparación', cantidad: data.preparacion.totalItems, color: 'fondo-violeta' },
    { nombre: 'Listos para retirar', cantidad: data.listosRetiro.totalItems, color: 'fondo-amarillo' },
    { nombre: 'Enviados', cantidad: data.enviados.totalItems, color: 'fondo-amarillo' },
    { nombre: 'Entregados', cantidad: data.entregados.totalItems, color: 'fondo-verde' },
  ]
}

export function contarPorEstado(pedidos) {
  const contadores = {
    'Pago confirmado': 0,
    'En preparación': 0,
    'Listos para retirar': 0,
    Enviados: 0,
    Entregados: 0,
  }
  pedidos.forEach(pedido => {
    if (pedido.estado === 'Pago confirmado') contadores['Pago confirmado']++
    else if (pedido.estado === 'En preparación') contadores['En preparación']++
    else if (pedido.estado === 'Listo para retirar') contadores['Listos para retirar']++
    else if (pedido.estado === 'Enviado') contadores.Enviados++
    else if (pedido.estado === 'Entregado') contadores.Entregados++
  })
  return [
    { nombre: 'Pago confirmado', cantidad: contadores['Pago confirmado'], color: 'fondo-azul' },
    { nombre: 'En preparación', cantidad: contadores['En preparación'], color: 'fondo-violeta' },
    { nombre: 'Listos para retirar', cantidad: contadores['Listos para retirar'], color: 'fondo-amarillo' },
    { nombre: 'Enviados', cantidad: contadores.Enviados, color: 'fondo-amarillo' },
    { nombre: 'Entregados', cantidad: contadores.Entregados, color: 'fondo-verde' },
  ]
}

export async function transicionarEstado(orderId, nuevoEstado, datosEnvio = {}) {
  const { data } = await client.mutate({
    mutation: TRANSICIONAR_ESTADO,
    variables: { id: orderId, estado: nuevoEstado, ...datosEnvio },
  })
  const result = data.avanzarEstadoPedido
  if (result.errorCode) throw new Error(result.message)
  return result
}

// La exportación recorre únicamente las páginas que coinciden con los mismos
// filtros del listado. No descarga pedidos ajenos al resultado para filtrarlos aquí.
export async function obtenerPedidosParaExportar(criterios = {}) {
  const filtros = filtrosConsulta(criterios)
  const pedidos = []
  let skip = 0
  let total = 0
  do {
    const resultado = await consultarPedidos(skip, TAMANIO_BLOQUE, filtros)
    total = resultado.totalItems
    pedidos.push(...resultado.items.map(pedido => transformarPedido(pedido, filtros.fechaConfirmacion)))
    skip += resultado.items.length
    if (resultado.items.length === 0) break
  } while (skip < total)
  return pedidos
}

export function esPedidoRetiroLocal(pedido) {
  return Boolean(pedido?.shippingLines?.some(linea => linea.shippingMethod?.code === 'retiro-local'))
}
export async function prepararRetiroPedido(orderId) {
  await transicionarEstado(orderId, 'ListoParaRetirar')
  return obtenerDetallePedido(orderId)
}
