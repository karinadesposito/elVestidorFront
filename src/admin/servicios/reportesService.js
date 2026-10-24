import { gql } from '@apollo/client'
import client from '../../servicios/apolloClient'

const RESUMEN_PEDIDOS = gql`
  query ResumenPedidos {
    resumenPedidos {
      nuevosHoy
      porPreparar
      enPreparacion
      enviados
    }
  }
`

const RESUMEN_VENTAS = gql`
  query ResumenVentas($desde: String!, $hasta: String!) {
    resumenVentas(desde: $desde, hasta: $hasta) {
      desde
      hasta
      pedidos
      totalVendido
      totalProductos
      totalEnvios
      ticketPromedio
      porEstado { estado pedidos total }
      cancelados
      inicioActividades
    }
  }
`

const ZONA_HORARIA = 'America/Argentina/Buenos_Aires'

const FORMATO_PESOS = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
})

// Los importes llegan en centavos desde el back.
export function formatearPesos(centavos) {
  return FORMATO_PESOS.format((centavos || 0) / 100)
}

// Fecha de hoy en Argentina, en formato AAAA-MM-DD.
export function hoyArgentina() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: ZONA_HORARIA,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())
}

export function formatearFecha(fecha) {
  const [anio, mes, dia] = String(fecha || '').split('-')
  return anio && mes && dia ? `${dia}/${mes}/${anio}` : '—'
}

export async function obtenerResumenPedidos() {
  const { data } = await client.query({
    query: RESUMEN_PEDIDOS,
    fetchPolicy: 'network-only',
  })
  return data.resumenPedidos
}

export async function obtenerResumenVentas(desde, hasta) {
  const { data } = await client.query({
    query: RESUMEN_VENTAS,
    variables: { desde, hasta },
    fetchPolicy: 'network-only',
  })
  return data.resumenVentas
}
