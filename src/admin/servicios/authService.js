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

const PERMISOS_QUERY = `
  query PermisosUsuario {
    me {
      channels {
        code
        permissions
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

  const permisos = await obtenerPermisos(token)

  const sesion = {
    usuario: { email, nombre: loginResult.identifier },
    token,
    permisos,
  }

  localStorage.setItem('admin_sesion', JSON.stringify(sesion))
  return sesion
}

async function obtenerPermisos(token) {
  const response = await fetch('/admin-api', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ query: PERMISOS_QUERY }),
  })

  const result = await response.json()

  if (result.errors) {
    throw new Error(result.errors[0].message)
  }

  const canales = result.data.me?.channels || []
  const canal = canales.find(c => c.code === '__default_channel__') || canales[0]

  return canal?.permissions || []
}

export function tienePermiso(sesion, permiso) {
  const permisos = sesion?.permisos || []
  return permisos.includes('SuperAdmin') || permisos.includes(permiso)
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
    const sesion = datos ? JSON.parse(datos) : null
    // Las sesiones guardadas antes de manejar permisos obligan a iniciar sesión de nuevo.
    return Array.isArray(sesion?.permisos) ? sesion : null
  } catch {
    return null
  }
}
