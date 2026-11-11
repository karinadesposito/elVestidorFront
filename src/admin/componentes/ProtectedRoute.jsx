import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { useAuth } from '../contexto/AuthContext'
import { verificarSesionAdmin } from '../servicios/authService'
import LoginAdmin from '../paginas/LoginAdmin'
import Boton from '../../componentesReuse/Boton'

function ProtectedRoute() {
  const { sesion, logout } = useAuth()
  const token = sesion?.token
  const [comprobacion, setComprobacion] = useState({ token: null, valida: false, error: null })
  const [intento, setIntento] = useState(0)

  useEffect(() => {
    if (!token) return
    let vigente = true
    setComprobacion({ token, valida: false, error: null })
    verificarSesionAdmin(token)
      .then(valida => {
        if (vigente) setComprobacion({ token, valida, error: null })
      })
      .catch(() => {
        if (vigente) setComprobacion({
          token,
          valida: false,
          error: 'No pudimos conectar para comprobar tu sesión. Revisá tu conexión e intentá nuevamente.',
        })
      })
    return () => { vigente = false }
  }, [token, intento])

  if (!sesion) return <LoginAdmin />

  if (comprobacion.token !== token || !comprobacion.valida) {
    return (
      <main className="login-admin">
        <div className="login-admin__card" aria-live="polite">
          <h1 className="login-admin__titulo">El Vestidor</h1>
          <p className="login-admin__subtitulo">Panel de administración</p>
          {comprobacion.error ? (
            <>
              <p className="login-admin__error">{comprobacion.error}</p>
              <Boton variante="admin" onClick={() => setIntento(valor => valor + 1)}>Reintentar</Boton>
              <Boton variante="admin" onClick={logout}>Volver al ingreso</Boton>
            </>
          ) : <p>Comprobando sesión…</p>}
        </div>
      </main>
    )
  }

  return <Outlet />
}

export default ProtectedRoute
