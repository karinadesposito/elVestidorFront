export const EVENTO_SESION_ADMIN_VENCIDA = 'admin-sesion-vencida'
export const MENSAJE_SESION_ADMIN_VENCIDA = 'Tu sesión venció. Iniciá sesión nuevamente.'

const verificaciones = new Map()

function esErrorAutenticacion(error) {
  return ['FORBIDDEN', 'UNAUTHENTICATED', 'UNAUTHORIZED'].includes(error?.extensions?.code)
}

function invalidarSesion(token) {
  // Una respuesta demorada nunca debe cerrar una sesión recién iniciada.
  if (!token || obtenerSesion()?.token !== token) return
  localStorage.removeItem('admin_sesion')
  window.dispatchEvent(new CustomEvent(EVENTO_SESION_ADMIN_VENCIDA))
}

export function verificarSesionAdmin(token) {
  if (!token) return Promise.resolve(false)
  if (verificaciones.has(token)) return verificaciones.get(token)

  const comprobacion = (async () => {
    const respuesta = await fetch('/admin-api', {
      method: 'POST',
      credentials: 'omit',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ query: 'query VerificarSesionAdmin { me { id } }' }),
    })
    if (respuesta.status === 401) {
      invalidarSesion(token)
      return false
    }
    const datos = await respuesta.json()
    // Se consulta la identidad, no un recurso que requiera permisos de gestión.
    if (datos?.errors?.length) {
      if ((respuesta.ok || respuesta.status === 403) && datos.errors.every(esErrorAutenticacion)) {
        invalidarSesion(token)
        return false
      }
      throw new Error('No pudimos comprobar tu sesión. Intentá nuevamente.')
    }
    if (!respuesta.ok || !datos?.data || !('me' in datos.data)) {
      throw new Error('No pudimos comprobar tu sesión. Intentá nuevamente.')
    }
    if (datos.data.me === null) {
      invalidarSesion(token)
      return false
    }
    if (!datos.data.me?.id) {
      throw new Error('No pudimos comprobar tu sesión. Intentá nuevamente.')
    }
    return true
  })().finally(() => verificaciones.delete(token))

  verificaciones.set(token, comprobacion)
  return comprobacion
}

// Compartido por Apollo y las solicitudes administrativas con archivos.
// Nunca repite una operación: ante un rechazo sólo consulta la sesión.
export async function solicitarAdmin(uri, opciones = {}) {
  const respuesta = await fetch(uri, { ...opciones, credentials: 'omit' })
  const autorizacion = new Headers(opciones.headers).get('Authorization') || ''
  const token = autorizacion.replace(/^Bearer\s+/i, '')
  if (!token || obtenerSesion()?.token !== token) return respuesta

  let comprobar = respuesta.status === 401 || respuesta.status === 403
  if (!comprobar && respuesta.headers.get('content-type')?.includes('json')) {
    const datos = await respuesta.clone().json().catch(() => null)
    comprobar = datos?.errors?.some(esErrorAutenticacion) || false
  }
  if (comprobar) {
    // Si falla la red, se conserva la sesión y el error original de la operación.
    await verificarSesionAdmin(token).catch(() => {})
  }
  return respuesta
}

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
    credentials: 'omit',
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
    credentials: 'omit',
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
  // Limpiar primero evita que el logout anterior borre un nuevo ingreso.
  localStorage.removeItem('admin_sesion')
  if (!sesion?.token) return
  try {
    await fetch('/admin-api', {
      method: 'POST',
      credentials: 'omit',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sesion.token}`,
      },
      body: JSON.stringify({ query: LOGOUT_MUTATION }),
    })
  } catch {
    // El cierre local se mantiene aunque el servidor no esté disponible.
  }
}

const CAMBIAR_CLAVE_MUTATION = `
  mutation CambiarMiClave($claveActual: String!, $claveNueva: String!) {
    cambiarMiClave(claveActual: $claveActual, claveNueva: $claveNueva)
  }
`

export const LARGO_MINIMO_CLAVE = 10

// El back verifica la contraseña actual y, si sale bien, cierra todas las
// sesiones del usuario: después hay que volver a ingresar.
export async function cambiarMiClave({ claveActual, claveNueva }) {
  const sesion = obtenerSesion()
  if (!sesion?.token) {
    throw new Error('Tu sesión venció. Ingresá de nuevo.')
  }
  if (claveNueva.length < LARGO_MINIMO_CLAVE) {
    throw new Error(`La contraseña nueva tiene que tener al menos ${LARGO_MINIMO_CLAVE} caracteres.`)
  }

  const response = await solicitarAdmin('/admin-api', {
    method: 'POST',
    credentials: 'omit',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${sesion.token}`,
    },
    body: JSON.stringify({
      query: CAMBIAR_CLAVE_MUTATION,
      variables: { claveActual, claveNueva },
    }),
  })

  const result = await response.json()

  if (result.errors) {
    throw new Error(result.errors[0].message)
  }

  localStorage.removeItem('admin_sesion')
  return true
}

export function obtenerSesion() {
  try {
    const datos = localStorage.getItem('admin_sesion')
    const sesion = datos ? JSON.parse(datos) : null
    // Las sesiones guardadas antes de manejar permisos obligan a iniciar sesión de nuevo.
    return typeof sesion?.token === 'string' && sesion.token && Array.isArray(sesion.permisos) ? sesion : null
  } catch {
    return null
  }
}
