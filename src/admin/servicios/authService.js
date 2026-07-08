const USUARIO_VALIDO = {
  email: 'admin@elvestidor.com',
  password: 'admin123',
  nombre: 'Karina',
}

function simularRetraso(ms = 600) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function iniciarSesion({ email, password }) {
  await simularRetraso()

  if (email !== USUARIO_VALIDO.email || password !== USUARIO_VALIDO.password) {
    throw new Error('Credenciales inválidas')
  }

  const sesion = {
    usuario: { nombre: USUARIO_VALIDO.nombre, email: USUARIO_VALIDO.email },
    token: 'tok-simulado-' + Date.now(),
  }

  localStorage.setItem('admin_sesion', JSON.stringify(sesion))
  return sesion
}

export function cerrarSesion() {
  localStorage.removeItem('admin_sesion')
}

export function obtenerSesion() {
  try {
    const datos = localStorage.getItem('admin_sesion')
    return datos ? JSON.parse(datos) : null
  } catch {
    return null
  }
}
