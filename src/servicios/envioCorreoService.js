import { gql } from '@apollo/client'
import clienteTienda from './clienteTienda'
import { construirDestinoCorreo } from './envioCorreoDatos'

const CAMPOS_ENVIO = gql`
  fragment DatosEnvioCorreo on EnvioPedidoMiCorreo {
    id pedidoId modalidad revision
    destino { calle numero piso departamento localidad codigoProvincia codigoPostal }
    sucursal { codigo nombre calle numero localidad codigoProvincia codigoPostal }
    paquete { pesoGramos altoCm anchoCm largoCm }
    estadoCotizacion
    cotizacion { id vence productoSeleccionado tarifas { producto nombre importeCentavos } }
  }
`
const OBTENER_ENVIO = gql`
  query EnvioCorreoCheckout { envioMiCorreoActivo { ...DatosEnvioCorreo } }
  ${CAMPOS_ENVIO}
`
const DISPONIBILIDAD = gql`query DisponibilidadCorreoCheckout { miCorreoDisponibleTienda }`
const SUCURSALES = gql`
  query SucursalesCorreoCheckout($provincia: String!) {
    sucursalesMiCorreoTienda(codigoProvincia: $provincia) {
      codigo nombre calle numero localidad codigoProvincia codigoPostal
    }
  }
`
const GUARDAR_DESTINO = gql`
  mutation GuardarDestinoCorreoCheckout($input: DestinoEnvioMiCorreoInput!) {
    guardarDestinoMiCorreo(input: $input) { ...DatosEnvioCorreo }
  }
  ${CAMPOS_ENVIO}
`

export async function obtenerEnvioCorreoActivo(pedidoId) {
  const { data } = await clienteTienda.query({ query: OBTENER_ENVIO, fetchPolicy: 'network-only' })
  if (!data || !('envioMiCorreoActivo' in data)) throw new Error('No pudimos consultar tu envío.')
  const envio = data.envioMiCorreoActivo
  if (envio && String(envio.pedidoId) !== String(pedidoId)) {
    throw new Error('El carrito cambió. Actualizá el resumen antes de continuar.')
  }
  return envio
}

export async function obtenerSucursalesCorreo(provincia) {
  const disponibilidad = await clienteTienda.query({ query: DISPONIBILIDAD, fetchPolicy: 'network-only' })
  if (disponibilidad.data?.miCorreoDisponibleTienda !== true) {
    return { disponible: false, sucursales: [] }
  }
  const { data } = await clienteTienda.query({ query: SUCURSALES,
    variables: { provincia }, fetchPolicy: 'network-only' })
  if (!Array.isArray(data?.sucursalesMiCorreoTienda)) throw new Error('No pudimos consultar las sucursales.')
  return { disponible: true, sucursales: data.sucursalesMiCorreoTienda }
}

export async function guardarDestinoCorreo(valor, envioAnterior, pedidoId) {
  const input = construirDestinoCorreo(valor, envioAnterior?.revision ?? 0)
  const { data } = await clienteTienda.mutate({ mutation: GUARDAR_DESTINO, variables: { input } })
  const envio = data?.guardarDestinoMiCorreo
  if (!envio || String(envio.pedidoId) !== String(pedidoId)) {
    throw new Error('No pudimos confirmar el destino de este pedido. Actualizá el resumen.')
  }
  return envio
}

const COTIZAR = gql`
  mutation CotizarEnvioCorreo($revision: Int!) {
    cotizarEnvioMiCorreo(revisionEsperada: $revision) { ...DatosEnvioCorreo }
  } ${CAMPOS_ENVIO}
`
const SELECCIONAR_TARIFA = gql`
  mutation SeleccionarTarifaCorreo($id: ID!, $producto: String!, $revision: Int!) {
    seleccionarTarifaMiCorreo(cotizacionId: $id, producto: $producto, revisionEsperada: $revision) { ...DatosEnvioCorreo }
  } ${CAMPOS_ENVIO}
`
const VERIFICAR_TARIFA = gql`mutation VerificarEnvioAntesDelPago { verificarTarifaMiCorreo }`

export async function cotizarEnvioCorreo(envio) {
  const { data } = await clienteTienda.mutate({ mutation: COTIZAR, variables: { revision: envio.revision } })
  if (!data?.cotizarEnvioMiCorreo) throw new Error('No pudimos obtener una cotización.')
  return data.cotizarEnvioMiCorreo
}
export async function seleccionarTarifaCorreo(envio, producto) {
  const { data } = await clienteTienda.mutate({ mutation: SELECCIONAR_TARIFA,
    variables: { id: envio.cotizacion.id, producto, revision: envio.revision } })
  if (!data?.seleccionarTarifaMiCorreo) throw new Error('No pudimos seleccionar el envío.')
  return data.seleccionarTarifaMiCorreo
}
export async function verificarTarifaCorreo() {
  const { data } = await clienteTienda.mutate({ mutation: VERIFICAR_TARIFA })
  if (data?.verificarTarifaMiCorreo !== true) throw new Error('No pudimos verificar el costo del envío.')
}
