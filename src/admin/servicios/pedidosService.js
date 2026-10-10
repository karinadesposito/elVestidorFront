import client from '../../servicios/apolloClient'
import { gql } from '@apollo/client'

const OBTENER_PEDIDOS = gql`
  query Orders($options: OrderListOptions) {
    orders(options: $options) {
      items {
        id
        code
        state
        createdAt
        totalQuantity
        totalWithTax
        customer { firstName lastName emailAddress }
        shippingLines { shippingMethod { name } }
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
      customer { firstName lastName emailAddress }
      shippingAddress { streetLine1 city province postalCode phoneNumber }
      billingAddress { streetLine1 city province postalCode phoneNumber }
      lines {
        id
        quantity
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
    enviados: orders(options: { take: 1, filter: { state: { eq: "Shipped" } } }) { totalItems }
    entregados: orders(options: { take: 1, filter: { state: { eq: "Delivered" } } }) { totalItems }
  }
`

const TRANSICIONAR_ESTADO = gql`
  mutation TransitionOrderToState($id: ID!, $state: String!) {
    transitionOrderToState(id: $id, state: $state) {
      ... on Order { id state }
      ... on ErrorResult { errorCode message }
    }
  }
`

const ESTADO_MAP = {
  PaymentSettled: 'Pago confirmado',
  EnPreparacion: 'En preparación',
  Shipped: 'Enviado',
  Delivered: 'Entregado',
  Cancelled: 'Cancelado',
}

const COLOR_MAP = {
  PaymentSettled: 'fondo-azul',
  EnPreparacion: 'fondo-violeta',
  Shipped: 'fondo-amarillo',
  Delivered: 'fondo-verde',
  Cancelled: 'fondo-gris',
}

const ESTADOS_EXCLUIDOS = ['AddingItems', 'ArrangingPayment', 'Draft']
const TAMANIO_BLOQUE = 100
const FORMATO_PESOS = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
})

function normalizarBusqueda(valor) {
  return String(valor || '')
    .trim()
    .toLocaleLowerCase('es-AR')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

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

function transformarPedido(pedido) {
  const metodosEnvio = obtenerMetodosEnvio(pedido)
  return {
    id: pedido.id,
    codigo: pedido.code,
    cliente: pedido.customer
      ? `${pedido.customer.firstName || ''} ${pedido.customer.lastName || ''}`.trim() || 'Sin cliente'
      : 'Sin cliente',
    correo: pedido.customer?.emailAddress || '',
    fecha: new Date(pedido.createdAt).toLocaleDateString('es-AR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
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

async function consultarPedidos(skip, take, estado = '') {
  const filtroEstado = estado
    ? { eq: estado }
    : { notIn: ESTADOS_EXCLUIDOS }

  const { data } = await client.query({
    query: OBTENER_PEDIDOS,
    variables: {
      options: {
        skip,
        take,
        sort: { createdAt: 'DESC' },
        filter: { state: filtroEstado },
      },
    },
    fetchPolicy: 'network-only',
  })
  return data.orders
}

function coincideBusqueda(pedido, termino) {
  const codigo = normalizarBusqueda(pedido.code)
  const nombre = normalizarBusqueda(
    `${pedido.customer?.firstName || ''} ${pedido.customer?.lastName || ''}`
  )
  const correo = normalizarBusqueda(pedido.customer?.emailAddress)
  return codigo.includes(termino) || nombre.includes(termino) || correo.includes(termino)
}

// Se comparan fechas de calendario locales (YYYY-MM-DD), sin convertirlas a UTC.
function fechaLocalPedido(fecha) {
  const fechaPedido = new Date(fecha)
  const anio = fechaPedido.getFullYear()
  const mes = String(fechaPedido.getMonth() + 1).padStart(2, '0')
  const dia = String(fechaPedido.getDate()).padStart(2, '0')
  return `${anio}-${mes}-${dia}`
}

function coincideFiltros(pedido, { termino, envio, fechaDesde, fechaHasta }) {
  if (termino && !coincideBusqueda(pedido, termino)) return false
  if (envio && !obtenerMetodosEnvio(pedido).includes(envio)) return false
  if (fechaDesde || fechaHasta) {
    const fecha = fechaLocalPedido(pedido.createdAt)
    if (fechaDesde && fecha < fechaDesde) return false
    if (fechaHasta && fecha > fechaHasta) return false
  }
  return true
}

export async function obtenerPedidos({
  pagina = 1,
  take = 20,
  busqueda = '',
  estado = '',
  envio = '',
  fechaDesde = '',
  fechaHasta = '',
} = {}) {
  const termino = normalizarBusqueda(busqueda)
  const necesitaFiltradoLocal = Boolean(termino || envio || fechaDesde || fechaHasta)

  // Sin filtros locales, Vendure pagina directamente en el servidor.
  if (!necesitaFiltradoLocal) {
    const resultado = await consultarPedidos((pagina - 1) * take, take, estado)
    return {
      pedidos: resultado.items.map(transformarPedido),
      total: resultado.totalItems,
    }
  }

  // Nombre, correo y método de envío no tienen un filtro combinado
  // adecuado en esta consulta. Se recorren todos los bloques antes de paginar.
  const coincidencias = []
  let skip = 0
  let total = 0
  do {
    const resultado = await consultarPedidos(skip, TAMANIO_BLOQUE, estado)
    total = resultado.totalItems
    coincidencias.push(...resultado.items.filter(pedido => coincideFiltros(pedido, {
      termino, envio, fechaDesde, fechaHasta,
    })))
    skip += resultado.items.length
    if (resultado.items.length === 0) break
  } while (skip < total)

  const inicio = (pagina - 1) * take
  return {
    pedidos: coincidencias.slice(inicio, inicio + take).map(transformarPedido),
    total: coincidencias.length,
  }
}

export async function obtenerMetodosEnvioPedidos() {
  // Las opciones salen de los pedidos reales, sin inventar nombres de envío.
  const nombres = new Set()
  let skip = 0
  let total = 0
  do {
    const resultado = await consultarPedidos(skip, TAMANIO_BLOQUE)
    total = resultado.totalItems
    resultado.items.forEach(pedido => {
      obtenerMetodosEnvio(pedido).forEach(nombre => nombres.add(nombre))
    })
    skip += resultado.items.length
    if (resultado.items.length === 0) break
  } while (skip < total)
  return [...nombres].sort((a, b) => a.localeCompare(b, 'es-AR'))
}

export async function obtenerContadoresPedidos() {
  const { data } = await client.query({
    query: OBTENER_CONTADORES,
    fetchPolicy: 'network-only',
  })
  return [
    { nombre: 'Pago confirmado', cantidad: data.confirmados.totalItems, color: 'fondo-azul' },
    { nombre: 'En preparación', cantidad: data.preparacion.totalItems, color: 'fondo-violeta' },
    { nombre: 'Enviados', cantidad: data.enviados.totalItems, color: 'fondo-amarillo' },
    { nombre: 'Entregados', cantidad: data.entregados.totalItems, color: 'fondo-verde' },
  ]
}

export function contarPorEstado(pedidos) {
  const contadores = {
    'Pago confirmado': 0,
    'En preparación': 0,
    Enviados: 0,
    Entregados: 0,
  }
  pedidos.forEach(pedido => {
    if (pedido.estado === 'Pago confirmado') contadores['Pago confirmado']++
    else if (pedido.estado === 'En preparación') contadores['En preparación']++
    else if (pedido.estado === 'Enviado') contadores.Enviados++
    else if (pedido.estado === 'Entregado') contadores.Entregados++
  })
  return [
    { nombre: 'Pago confirmado', cantidad: contadores['Pago confirmado'], color: 'fondo-azul' },
    { nombre: 'En preparación', cantidad: contadores['En preparación'], color: 'fondo-violeta' },
    { nombre: 'Enviados', cantidad: contadores.Enviados, color: 'fondo-amarillo' },
    { nombre: 'Entregados', cantidad: contadores.Entregados, color: 'fondo-verde' },
  ]
}

export async function transicionarEstado(orderId, nuevoEstado) {
  const { data } = await client.mutate({
    mutation: TRANSICIONAR_ESTADO,
    variables: { id: orderId, state: nuevoEstado },
  })
  const result = data.transitionOrderToState
  if (result.errorCode) throw new Error(result.message)
  return result
}
