import { gql } from '@apollo/client'
import clienteTienda from './clienteTienda'

const SELECCIONAR = gql`mutation SeleccionarEnvioPorZona { seleccionarEnvioPorZona }`
const CODIGOS = new Set(['envio-zona-tandil', 'envio-zona-buenos-aires-caba', 'envio-zona-resto-pais'])
export function envioZonaConfirmado(pedido) {
  return pedido?.shippingLines?.length === 1 &&
    CODIGOS.has(pedido.shippingLines[0].shippingMethod?.code) &&
    Number.isSafeInteger(pedido.shippingWithTax) && pedido.shippingWithTax > 0 && pedido.currencyCode === 'ARS'
}
export async function seleccionarEnvioPorZona() {
  const { data } = await clienteTienda.mutate({ mutation: SELECCIONAR })
  if (data?.seleccionarEnvioPorZona !== true) throw new Error('No pudimos confirmar la tarifa de envío.')
  return true
}

const LOCALIDADES = gql`query LocalidadesEnvioPorCodigoPostal($provincia: String!, $codigoPostal: String!) {
  localidadesEnvioPorCodigoPostal(provincia: $provincia, codigoPostal: $codigoPostal)
}`
const normalizar = valor => String(valor ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .trim().replace(/\s+/g, ' ').toUpperCase()
export async function obtenerLocalidadesEnvio(provincia, codigoPostal) {
  if (!provincia || !/^(?:\d{4}|[A-Za-z]\d{4})$/.test(String(codigoPostal).trim())) return []
  const { data } = await clienteTienda.query({ query: LOCALIDADES,
    variables: { provincia: provincia.trim(), codigoPostal: codigoPostal.trim().toUpperCase() },
    fetchPolicy: 'network-only' })
  if (!Array.isArray(data?.localidadesEnvioPorCodigoPostal)) throw new Error('No pudimos comprobar el destino. Intentá nuevamente.')
  return data.localidadesEnvioPorCodigoPostal
}
export async function validarDireccionEnvioZona(direccion) {
  const opciones = await obtenerLocalidadesEnvio(direccion.provincia, direccion.codigoPostal)
  let ciudad = normalizar(direccion.ciudad)
  if (['C', 'CABA', 'CAPITAL FEDERAL', 'CIUDAD AUTONOMA DE BUENOS AIRES',
    'CIUDAD AUTONOMA BUENOS AIRES'].includes(normalizar(direccion.provincia)) &&
    ['CABA', 'CAPITAL FEDERAL', 'BUENOS AIRES', 'CIUDAD AUTONOMA DE BUENOS AIRES'].includes(ciudad)) {
    ciudad = 'CIUDAD AUTONOMA BUENOS AIRES'
  }
  if (!opciones.some(nombre => normalizar(nombre) === ciudad)) {
    throw new Error('El código postal y la localidad no coinciden con la provincia. Seleccioná una localidad de la lista antes de guardar.')
  }
  return true
}
