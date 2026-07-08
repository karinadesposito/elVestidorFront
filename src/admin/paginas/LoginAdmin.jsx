import { useState } from 'react'
import { useAuth } from '../contexto/AuthContext'
import Boton from '../../componentesReuse/Boton'
import '../../estilos/login-admin.css'

function LoginAdmin() {
  const { login, cargando, error } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const manejarEnvio = async (e) => {
    e.preventDefault()
    if (!email || !password) return
    try {
      await login({ email, password })
    } catch {
      // el error se maneja via context
    }
  }

  return (
    <main className="login-admin">
      <div className="login-admin__card">
        <div className="login-admin__encabezado">
          <h1 className="login-admin__titulo">El Vestidor</h1>
          <p className="login-admin__subtitulo">Panel de administración</p>
        </div>

        <form className="login-admin__formulario" onSubmit={manejarEnvio}>
          <div className="login-admin__campo">
            <label htmlFor="email">Correo electrónico</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@elvestidor.com"
              autoComplete="email"
              required
            />
          </div>

          <div className="login-admin__campo">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
          </div>

          {error && <p className="login-admin__error">{error}</p>}

          <Boton type="submit" disabled={cargando} variante="admin" className="login-admin__boton">
            {cargando ? 'Ingresando…' : 'Ingresar'}
          </Boton>
        </form>
      </div>
    </main>
  )
}

export default LoginAdmin
