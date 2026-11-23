import { gql } from '@apollo/client'
import client from '../../servicios/apolloClient'
const CAMPOS = gql`fragment TarifaZonaAdmin on TarifaEnvioZona { zona nombre importeCentavos habilitada }`
const OBTENER = gql`query TarifasEnvioZonas { tarifasEnvioZonas { ...TarifaZonaAdmin } } ${CAMPOS}`
const GUARDAR = gql`mutation GuardarTarifasEnvioZonas($input: TarifasEnvioZonasInput!) {
  guardarTarifasEnvioZonas(input: $input) { ...TarifaZonaAdmin }
} ${CAMPOS}`
export function pesosACentavos(valor) {
  const match = /^(\d+)(?:[.,](\d{1,2}))?$/.exec(String(valor ?? '').trim())
  if (!match) throw new Error('Ingresá un importe positivo con hasta dos decimales.')
  const n = Number(match[1]) * 100 + Number((match[2] || '').padEnd(2, '0'))
  if (!Number.isSafeInteger(n) || n <= 0 || n > 2147483647) throw new Error('Revisá el importe ingresado.')
  return n
}
export async function obtenerTarifasEnvioZonas() {
  const { data } = await client.query({ query: OBTENER, fetchPolicy: 'network-only' })
  return data.tarifasEnvioZonas
}
export async function guardarTarifasEnvioZonas(valores) {
  const input = Object.fromEntries(Object.entries(valores).map(([k, v]) => [k, pesosACentavos(v)]))
  const { data } = await client.mutate({ mutation: GUARDAR, variables: { input } })
  return data.guardarTarifasEnvioZonas
}
