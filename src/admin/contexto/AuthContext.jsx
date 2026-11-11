import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import {
  iniciarSesion, cerrarSesion, obtenerSesion, tienePermiso,
  EVENTO_SESION_ADMIN_VENCIDA, MENSAJE_SESION_ADMIN_VENCIDA,
} from '../servicios/authService'
import client from '../../servicios/apolloClient'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [sesion, setSesion] = useState(() => obtenerSesion())
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const actualizar = () => {
      const datos = obtenerSesion()
      setSesion(datos)
      setError(datos ? null : MENSAJE_SESION_ADMIN_VENCIDA)
      void client.clearStore().catch(() => {})
    }
    const sincronizar = (evento) => {
      if (evento.key === 'admin_sesion' || evento.key === null) actualizar()
    }
    window.addEventListener(EVENTO_SESION_ADMIN_VENCIDA, actualizar)
    window.addEventListener('storage', sincronizar)
    return () => {
      window.removeEventListener(EVENTO_SESION_ADMIN_VENCIDA, actualizar)
      window.removeEventListener('storage', sincronizar)
    }
  }, [])

  const login = useCallback(async ({ email, password }) => {
    setCargando(true)
    setError(null)
    try {
      const datos = await iniciarSesion({ email, password })
      await client.clearStore()
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
    void cerrarSesion()
    setSesion(null)
    setError(null)
    void client.clearStore().catch(() => {})
  }, [])

  const puede = useCallback(permiso => tienePermiso(sesion, permiso), [sesion])

  return (
    <AuthContext.Provider value={{ sesion, cargando, error, login, logout, puede }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de un AuthProvider')
  return ctx
}
