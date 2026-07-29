const LOGIN_MUTATION = `
  mutation Login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      ... on CurrentUser {
        id
        identifier
      }
      ... on ErrorResult {
        errorCode
        message
      }
    }
  }
`

const LOGOUT_MUTATION = `
  mutation Logout {
    logout {
      success
    }
  }
`

export async function iniciarSesion({ email, password }) {
  const response = await fetch('/admin-api', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: LOGIN_MUTATION,
      variables: { username: email, password },
    }),
  })

  const result = await response.json()

  if (result.errors) {
    throw new Error(result.errors[0].message)
  }

  const loginResult = result.data.login

  if (loginResult.errorCode) {
    throw new Error(loginResult.message)
  }

  const token = response.headers.get('vendure-auth-token')

  if (!token) {
    throw new Error('No se recibió token de autenticación')
  }

  const sesion = {
    usuario: { email, nombre: loginResult.identifier },
    token,
  }

  localStorage.setItem('admin_sesion', JSON.stringify(sesion))
  return sesion
}

export async function cerrarSesion() {
  const sesion = obtenerSesion()
  if (sesion?.token) {
    try {
      await fetch('/admin-api', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sesion.token}`,
        },
        body: JSON.stringify({ query: LOGOUT_MUTATION }),
      })
    } finally {
      localStorage.removeItem('admin_sesion')
    }
  } else {
    localStorage.removeItem('admin_sesion')
  }
}

export function obtenerSesion() {
  try {
    const datos = localStorage.getItem('admin_sesion')
    return datos ? JSON.parse(datos) : null
  } catch {
    return null
  }
}
