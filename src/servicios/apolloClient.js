import { ApolloClient, InMemoryCache, createHttpLink, ApolloLink } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import { obtenerSesion, solicitarAdmin } from '../admin/servicios/authService'

const httpLink = createHttpLink({
  uri: '/admin-api',
  credentials: 'omit',
  fetch: solicitarAdmin,
})

const authLink = setContext((_, { headers }) => {
  const token = obtenerSesion()?.token
  return {
    headers: {
      ...headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  }
})

const client = new ApolloClient({
  link: ApolloLink.from([authLink, httpLink]),
  cache: new InMemoryCache(),
})

export default client
