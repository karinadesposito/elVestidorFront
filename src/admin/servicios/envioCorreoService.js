import { gql } from '@apollo/client'
import clienteAdmin from '../../servicios/apolloClient'

const CONSULTAR_ENVIO = gql`
  query ConsultarEnvioCorreoAdmin($pedidoId: ID!) {
    envioMiCorreoPedido(pedidoId: $pedidoId) {
      id modalidad revision
      origen { calle numero localidad provincia codigoPostal }
      destino { calle numero piso departamento localidad codigoProvincia codigoPostal }
      sucursal { codigo nombre }
      paquete { pesoGramos altoCm anchoCm largoCm }
      editable paqueteConfirmado estadoCotizacion
      cotizacion { id vence productoSeleccionado tarifas { producto nombre importeCentavos } }
    }
  }
`

export async function obtenerEnvioCorreoPedido(pedidoId) {
  const { data } = await clienteAdmin.query({ query: CONSULTAR_ENVIO,
    variables: { pedidoId }, fetchPolicy: 'network-only' })
  if (!data || !('envioMiCorreoPedido' in data)) throw new Error('No pudimos consultar el envío.')
  return data.envioMiCorreoPedido
}

const GUARDAR_PAQUETE = gql`
  mutation ConfirmarPaqueteCorreo($pedidoId: ID!, $paquete: PaqueteEnvioPedidoMiCorreoInput!, $revision: Int!) {
    guardarPaqueteMiCorreo(pedidoId: $pedidoId, paquete: $paquete, revisionEsperada: $revision) { id revision }
  }
`
export async function guardarPaqueteCorreoPedido(pedidoId, valores, revision) {
  const paquete = Object.fromEntries(['pesoGramos', 'altoCm', 'anchoCm', 'largoCm']
    .map(campo => [campo, Number(valores[campo])]))
  if (!Object.values(paquete).every(valor => Number.isInteger(valor) && valor > 0) ||
      paquete.pesoGramos > 25000 || [paquete.altoCm, paquete.anchoCm, paquete.largoCm].some(valor => valor > 150)) {
    throw new Error('Ingresá peso en gramos y medidas en centímetros, enteros positivos dentro de los límites indicados.')
  }
  const { data } = await clienteAdmin.mutate({ mutation: GUARDAR_PAQUETE,
    variables: { pedidoId, paquete, revision } })
  if (!data?.guardarPaqueteMiCorreo) throw new Error('No pudimos confirmar el paquete.')
  return obtenerEnvioCorreoPedido(pedidoId)
}
