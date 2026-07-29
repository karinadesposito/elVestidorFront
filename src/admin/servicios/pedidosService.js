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
        }
      }
      totalItems
    }
  }
`

const TRANSICIONAR_ESTADO = gql`
  mutation TransitionOrderToState($orderId: ID!, $state: String!) {
    transitionOrderToState(orderId: $orderId, state: $state) {
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
  Added: 'Nuevo',
  ArrangingPayment: 'Pendiente de pago',
  PaymentSettled: 'En preparación',
  Shipped: 'Enviado',
  Delivered: 'Finalizado',
  Cancelled: 'Cancelado',
}

const COLOR_MAP = {
  Added: 'fondo-azul',
  ArrangingPayment: 'fondo-amarillo',
  PaymentSettled: 'fondo-violeta',
  Shipped: 'fondo-violeta',
  Delivered: 'fondo-verde',
  Cancelled: 'fondo-gris',
}

export async function obtenerPedidos({ pagina = 1, take = 20 } = {}) {
  const { data } = await client.query({
    query: OBTENER_PEDIDOS,
    variables: {
      options: {
        skip: (pagina - 1) * take,
        take,
        sort: { createdAt: 'DESC' },
      },
    },
    fetchPolicy: 'network-only',
  })

  const pedidos = data.orders.items.map((p) => ({
    id: p.id,
    codigo: p.code,
    cliente: p.customer
      ? `${p.customer.firstName} ${p.customer.lastName}`
      : 'Sin cliente',
    fecha: new Date(p.createdAt).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
    }),
    estadoVendure: p.state,
    estado: ESTADO_MAP[p.state] || p.state,
    unidades: p.totalQuantity,
    total: new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
    }).format(p.totalWithTax / 100),
    color: COLOR_MAP[p.state] || 'fondo-gris',
  }))

  return {
    pedidos,
    total: data.orders.totalItems,
  }
}

export function contarPorEstado(pedidos) {
  const contadores = {
    Nuevos: 0,
    'Pendientes de pago': 0,
    'En preparación': 0,
    Finalizados: 0,
  }

  pedidos.forEach((p) => {
    if (p.estado === 'Nuevo') contadores.Nuevos++
    else if (p.estado === 'Pendiente de pago') contadores['Pendientes de pago']++
    else if (p.estado === 'En preparación') contadores['En preparación']++
    else if (p.estado === 'Finalizado') contadores.Finalizados++
  })

  return [
    { nombre: 'Nuevos', cantidad: contadores.Nuevos, color: 'fondo-azul' },
    { nombre: 'Pendientes de pago', cantidad: contadores['Pendientes de pago'], color: 'fondo-amarillo' },
    { nombre: 'En preparación', cantidad: contadores['En preparación'], color: 'fondo-violeta' },
    { nombre: 'Finalizados', cantidad: contadores.Finalizados, color: 'fondo-verde' },
  ]
}

export async function transicionarEstado(orderId, nuevoEstado) {
  const { data } = await client.mutate({
    mutation: TRANSICIONAR_ESTADO,
    variables: { orderId, state: nuevoEstado },
  })

  const result = data.transitionOrderToState
  if (result.errorCode) {
    throw new Error(result.message)
  }
  return result
}
