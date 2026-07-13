import { ApolloClient, InMemoryCache, createHttpLink, ApolloLink } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'

const httpLink = createHttpLink({
  uri: '/admin-api',
})

const authLink = setContext((_, { headers }) => {
  let token = null
  try {
    const sesion = JSON.parse(localStorage.getItem('admin_sesion'))
    token = sesion?.token
  } catch {
    // sesión corrupta, se ignora
  }

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
