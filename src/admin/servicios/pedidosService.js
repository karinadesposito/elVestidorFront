
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
        customer {
          firstName
          lastName
          emailAddress
        }
        shippingLines {
          shippingMethod {
            name
          }
        }
        payments {
          method
          state
        }
      }
      totalItems
    }
  }
`

const OBTENER_CONTADORES = gql`
  query ContadoresPedidos {
    confirmados: orders(options: {
      take: 1
      filter: { state: { eq: "PaymentSettled" } }
    }) {
      totalItems
    }
    preparacion: orders(options: {
      take: 1
      filter: { state: { eq: "EnPreparacion" } }
    }) {
      totalItems
    }
    enviados: orders(options: {
      take: 1
      filter: { state: { eq: "Shipped" } }
    }) {
      totalItems
    }
    entregados: orders(options: {
      take: 1
      filter: { state: { eq: "Delivered" } }
    }) {
      totalItems
    }
  }
`

const TRANSICIONAR_ESTADO = gql`
  mutation TransitionOrderToState($id: ID!, $state: String!) {
    transitionOrderToState(id: $id, state: $state) {
      ... on Order {
        id
        state
      }
      ... on ErrorResult {
        errorCode
        message
      }
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

const ESTADOS_EXCLUIDOS = ['AddingItems', 'ArrangingPayment']
const TAMANIO_BLOQUE_BUSQUEDA = 100

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

function transformarPedido(pedido) {
  const metodosEnvio = [
    ...new Set(
      (pedido.shippingLines || [])
        .map(linea => linea.shippingMethod?.name)
        .filter(Boolean)
    ),
  ]

  return {
    id: pedido.id,
    codigo: pedido.code,
    cliente: pedido.customer
      ? `${pedido.customer.firstName || ''} ${pedido.customer.lastName || ''}`.trim() || 'Sin cliente'
      : 'Sin cliente',
    correo: pedido.customer?.emailAddress || '',
    fecha: new Date(pedido.createdAt).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }),
    estadoVendure: pedido.state,
    estado: ESTADO_MAP[pedido.state] || pedido.state,
    envio: metodosEnvio.length ? metodosEnvio.join(', ') : 'Sin envío',
    pago: obtenerEstadoPago(pedido.payments || []),
    metodoPago: (pedido.payments || [])
      .map(pago => pago.method)
      .filter(Boolean)
      .join(', '),
    unidades: pedido.totalQuantity,
    total: FORMATO_PESOS.format(pedido.totalWithTax / 100),
    color: COLOR_MAP[pedido.state] || 'fondo-gris',
  }
}

async function consultarPedidos(skip, take) {
  const { data } = await client.query({
    query: OBTENER_PEDIDOS,
    variables: {
      options: {
        skip,
        take,
        sort: { createdAt: 'DESC' },
        filter: {
          state: {
            notIn: ESTADOS_EXCLUIDOS,
          },
        },
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

  return (
    codigo.includes(termino) ||
    nombre.includes(termino) ||
    correo.includes(termino)
  )
}

export async function obtenerPedidos({
  pagina = 1,
  take = 20,
  busqueda = '',
} = {}) {
  const termino = normalizarBusqueda(busqueda)

  if (!termino) {
    const resultado = await consultarPedidos(
      (pagina - 1) * take,
      take
    )

    return {
      pedidos: resultado.items.map(transformarPedido),
      total: resultado.totalItems,
    }
  }

  // Vendure no ofrece búsqueda directa por nombre o correo
  // en OrderListOptions. Consultamos en bloques para buscar
  // en todos los pedidos, no solamente en la página visible.
  const coincidencias = []
  let skip = 0
  let total = 0

  do {
    const resultado = await consultarPedidos(
      skip,
      TAMANIO_BLOQUE_BUSQUEDA
    )

    total = resultado.totalItems

    coincidencias.push(
      ...resultado.items.filter(pedido =>
        coincideBusqueda(pedido, termino)
      )
    )

    skip += resultado.items.length

    if (resultado.items.length === 0) break
  } while (skip < total)

  const inicio = (pagina - 1) * take

  return {
    pedidos: coincidencias
      .slice(inicio, inicio + take)
      .map(transformarPedido),
    total: coincidencias.length,
  }
}

export async function obtenerContadoresPedidos() {
  const { data } = await client.query({
    query: OBTENER_CONTADORES,
    fetchPolicy: 'network-only',
  })

  return [
    {
      nombre: 'Pago confirmado',
      cantidad: data.confirmados.totalItems,
      color: 'fondo-azul',
    },
    {
      nombre: 'En preparación',
      cantidad: data.preparacion.totalItems,
      color: 'fondo-violeta',
    },
    {
      nombre: 'Enviados',
      cantidad: data.enviados.totalItems,
      color: 'fondo-amarillo',
    },
    {
      nombre: 'Entregados',
      cantidad: data.entregados.totalItems,
      color: 'fondo-verde',
    },
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
    if (pedido.estado === 'Pago confirmado') {
      contadores['Pago confirmado']++
    } else if (pedido.estado === 'En preparación') {
      contadores['En preparación']++
    } else if (pedido.estado === 'Enviado') {
      contadores.Enviados++
    } else if (pedido.estado === 'Entregado') {
      contadores.Entregados++
    }
  })

  return [
    {
      nombre: 'Pago confirmado',
      cantidad: contadores['Pago confirmado'],
      color: 'fondo-azul',
    },
    {
      nombre: 'En preparación',
      cantidad: contadores['En preparación'],
      color: 'fondo-violeta',
    },
    {
      nombre: 'Enviados',
      cantidad: contadores.Enviados,
      color: 'fondo-amarillo',
    },
    {
      nombre: 'Entregados',
      cantidad: contadores.Entregados,
      color: 'fondo-verde',
    },
  ]
}

export async function transicionarEstado(orderId, nuevoEstado) {
  const { data } = await client.mutate({
    mutation: TRANSICIONAR_ESTADO,
    variables: {
      id: orderId,
      state: nuevoEstado,
    },
  })

  const result = data.transitionOrderToState

  if (result.errorCode) {
    throw new Error(result.message)
  }

  return result
}
