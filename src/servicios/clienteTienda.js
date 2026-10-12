import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
} from '@apollo/client'

const CLAVE_SESION_TIENDA = 'elvestidor-sesion-tienda'

let tokenEnMemoria = null

function obtenerTokenTienda() {
  try {
    return (
      window.localStorage.getItem(CLAVE_SESION_TIENDA) ||
      tokenEnMemoria
    )
  } catch {
    return tokenEnMemoria
  }
}

function guardarTokenTienda(token) {
  tokenEnMemoria = token

  try {
    window.localStorage.setItem(CLAVE_SESION_TIENDA, token)
  } catch {
    // Si el navegador no permite guardar, conservamos
    // la sesión en memoria mientras la página siga abierta.
  }
}

async function solicitarTienda(uri, opciones = {}) {
  const tokenEnviado = obtenerTokenTienda()
  const headers = new Headers(opciones.headers)

  // Este cliente usa únicamente la sesión de la tienda.
  headers.delete('Authorization')

  if (tokenEnviado) {
    headers.set('Authorization', `Bearer ${tokenEnviado}`)
  }

  const respuesta = await fetch(uri, {
    ...opciones,
    headers,
    credentials: 'omit',
  })

  const tokenRecibido = respuesta.headers.get(
    'vendure-auth-token',
  )

  if (tokenRecibido && respuesta.ok) {
    const tokenActual = obtenerTokenTienda()

    // Evita que una respuesta anterior sin sesión
    // sobrescriba una sesión creada por otra solicitud.
    if (!tokenActual || tokenActual === tokenEnviado) {
      guardarTokenTienda(tokenRecibido)
    }
  }

  return respuesta
}

const enlaceTienda = createHttpLink({
  uri: '/shop-api?languageCode=es',
  credentials: 'omit',
  fetch: solicitarTienda,
})

const clienteTienda = new ApolloClient({
  link: enlaceTienda,
  cache: new InMemoryCache(),
  defaultOptions: {
    query: {
      fetchPolicy: 'network-only',
    },
    watchQuery: {
      fetchPolicy: 'network-only',
    },
  },
})

export default clienteTienda