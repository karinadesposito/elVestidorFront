import { gql } from '@apollo/client'
import clienteTienda from './clienteTienda'

const SUSCRIBIRSE_CLUB = gql`
  mutation SuscribirseClub($email: String!, $nombre: String!, $sitioWeb: String) {
    suscribirseClub(email: $email, nombre: $nombre, sitioWeb: $sitioWeb)
  }
`

const PATRON_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

// sitioWeb es el campo trampa para robots: el formulario real lo deja vacío.
export async function suscribirseClub({ nombre, email, sitioWeb = '' }) {
  const nombreNormalizado = String(nombre || '').trim().replace(/\s+/g, ' ')
  const emailNormalizado = String(email || '').trim().toLowerCase()

  if (!nombreNormalizado) {
    throw new Error('Ingresá tu nombre.')
  }
  if (nombreNormalizado.length > 60) {
    throw new Error('El nombre no puede superar los 60 caracteres.')
  }
  if (!PATRON_EMAIL.test(emailNormalizado)) {
    throw new Error('Ingresá un email válido.')
  }

  try {
    await clienteTienda.mutate({
      mutation: SUSCRIBIRSE_CLUB,
      variables: {
        email: emailNormalizado,
        nombre: nombreNormalizado,
        sitioWeb: sitioWeb || null,
      },
    })
  } catch (err) {
    throw new Error(
      err?.errors?.[0]?.message ||
        err?.graphQLErrors?.[0]?.message ||
        'No pudimos anotarte en este momento. Probá de nuevo en unos minutos.',
      { cause: err },
    )
  }

  return emailNormalizado
}
