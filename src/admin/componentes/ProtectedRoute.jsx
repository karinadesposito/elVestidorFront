import { Outlet } from 'react-router-dom'
import { useAuth } from '../contexto/AuthContext'
import LoginAdmin from '../paginas/LoginAdmin'

function ProtectedRoute() {
  const { sesion } = useAuth()

  if (!sesion) {
    return <LoginAdmin />
  }

  return <Outlet />
}

export default ProtectedRoute
