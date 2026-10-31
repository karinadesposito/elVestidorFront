import { useState } from 'react'

import ModalAdmin from './ModalAdmin'
import { LARGO_MINIMO_CLAVE, cambiarMiClave } from '../servicios/authService'

const FORM_INICIAL = { claveActual: '', claveNueva: '', repetirClave: '' }

// Modal para que cada usuario del panel cambie su propia contraseña.
// Al terminar se cierran sus sesiones, así que onListo lo manda a ingresar.
function CambiarClave({ onClose, onListo }) {
  const [form, setForm] = useState(FORM_INICIAL)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  const [listo, setListo] = useState(false)

  function manejarCampo(evento) {
    const { name, value } = evento.target
    setForm((anterior) => ({ ...anterior, [name]: value }))
    setError('')
  }

  async function guardar(evento) {
    evento.preventDefault()
    if (guardando) return

    if (listo) {
      onListo()
      return
    }
    if (form.claveNueva !== form.repetirClave) {
      setError('Las contraseñas nuevas no coinciden.')
      return
    }

    setGuardando(true)
    setError('')
    try {
      await cambiarMiClave(form)
      setForm(FORM_INICIAL)
      setListo(true)
    } catch (err) {
      setError(err.message || 'No se pudo cambiar la contraseña.')
    } finally {
      setGuardando(false)
    }
  }

  const completo =
    form.claveActual && form.claveNueva.length >= LARGO_MINIMO_CLAVE && form.repetirClave

  return (
    <ModalAdmin
      titulo="Cambiar mi contraseña"
      onClose={listo ? onListo : onClose}
      formId="formulario-cambiar-clave"
      botonConfirmar={listo ? 'Ingresar de nuevo' : guardando ? 'Guardando...' : 'Cambiar contraseña'}
      botonConfirmarDeshabilitado={guardando || (!listo && !completo)}
    >
      <form
        id="formulario-cambiar-clave"
        className="estructura__formulario"
        onSubmit={guardar}
      >
        {listo ? (
          <p role="status">
            Listo, tu contraseña se cambió. Por seguridad cerramos tu sesión: ingresá con la contraseña nueva.
          </p>
        ) : (
          <>
            {error && (
              <p className="login-admin__error" role="alert">
                {error}
              </p>
            )}
            <div className="estructura__campo">
              <label htmlFor="clave-actual">Contraseña actual</label>
              <input
                id="clave-actual"
                name="claveActual"
                type="password"
                autoComplete="current-password"
                value={form.claveActual}
                onChange={manejarCampo}
                required
                autoFocus
              />
            </div>
            <div className="estructura__campo">
              <label htmlFor="clave-nueva">Contraseña nueva</label>
              <input
                id="clave-nueva"
                name="claveNueva"
                type="password"
                autoComplete="new-password"
                value={form.claveNueva}
                onChange={manejarCampo}
                minLength={LARGO_MINIMO_CLAVE}
                maxLength={72}
                required
              />
              <span>Al menos {LARGO_MINIMO_CLAVE} caracteres.</span>
            </div>
            <div className="estructura__campo">
              <label htmlFor="clave-repetir">Repetí la contraseña nueva</label>
              <input
                id="clave-repetir"
                name="repetirClave"
                type="password"
                autoComplete="new-password"
                value={form.repetirClave}
                onChange={manejarCampo}
                maxLength={72}
                required
              />
            </div>
          </>
        )}
      </form>
    </ModalAdmin>
  )
}

export default CambiarClave
