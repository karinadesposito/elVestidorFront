import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { iniciarSesion, cerrarSesion, obtenerSesion } from '../servicios/authService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [sesion, setSesion] = useState(() => obtenerSesion())
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const datos = obtenerSesion()
    if (datos) setSesion(datos)
  }, [])

  const login = useCallback(async ({ email, password }) => {
    setCargando(true)
    setError(null)
    try {
      const datos = await iniciarSesion({ email, password })
      setSesion(datos)
      return datos
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setCargando(false)
    }
  }, [])

  const logout = useCallback(() => {
    cerrarSesion()
    setSesion(null)
    setError(null)
  }, [])

  return (
    <AuthContext.Provider value={{ sesion, cargando, error, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de un AuthProvider')
  return ctx
}
