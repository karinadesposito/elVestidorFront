import { gql } from '@apollo/client'
import clienteTienda from './clienteTienda'

const SOLICITAR_ARREPENTIMIENTO = gql`
  mutation SolicitarArrepentimiento(
    $nombre: String!
    $email: String!
    $codigoPedido: String!
    $comentario: String
    $sitioWeb: String
  ) {
    solicitarArrepentimiento(
      nombre: $nombre
      email: $email
      codigoPedido: $codigoPedido
      comentario: $comentario
      sitioWeb: $sitioWeb
    )
  }
`

const PATRON_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

// Devuelve el código de constancia que el cliente tiene que guardar.
// sitioWeb es el campo trampa para robots: el formulario real lo deja vacío.
export async function solicitarArrepentimiento({ nombre, email, codigoPedido, comentario = '', sitioWeb = '' }) {
  const nombreNormalizado = String(nombre || '').trim().replace(/\s+/g, ' ')
  const emailNormalizado = String(email || '').trim().toLowerCase()
  const pedidoNormalizado = String(codigoPedido || '').trim().replace(/^#/, '').toUpperCase()

  if (!nombreNormalizado) {
    throw new Error('Ingresá tu nombre y apellido.')
  }
  if (!PATRON_EMAIL.test(emailNormalizado)) {
    throw new Error('Ingresá un email válido.')
  }
  if (!pedidoNormalizado) {
    throw new Error('Ingresá el número de pedido que figura en el correo de tu compra.')
  }

  try {
    const { data } = await clienteTienda.mutate({
      mutation: SOLICITAR_ARREPENTIMIENTO,
      variables: {
        nombre: nombreNormalizado,
        email: emailNormalizado,
        codigoPedido: pedidoNormalizado,
        comentario: String(comentario || '').trim() || null,
        sitioWeb: sitioWeb || null,
      },
    })
    return data.solicitarArrepentimiento
  } catch (err) {
    throw new Error(
      err?.errors?.[0]?.message ||
        err?.graphQLErrors?.[0]?.message ||
        'No pudimos enviar tu solicitud. Probá de nuevo o escribinos por correo o WhatsApp.',
      { cause: err },
    )
  }
}
