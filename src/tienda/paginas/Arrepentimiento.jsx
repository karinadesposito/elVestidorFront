import { useEffect, useState } from 'react'
import Contenedor from '../../componentesReuse/Contenedor'
import Boton from '../../componentesReuse/Boton'
import { comercio } from '../../datos/comercio'
import { solicitarArrepentimiento } from '../../servicios/arrepentimientoService'
import '../../estilos/Legales.css'

const FORM_INICIAL = {
  nombre: '',
  email: '',
  codigoPedido: '',
  comentario: '',
  sitioWeb: '',
}

// Botón de arrepentimiento exigido por la Ley 24.240 (art. 34) y la Res. 424/2020.
function Arrepentimiento() {
  const [form, setForm] = useState(FORM_INICIAL)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState(null)
  const [codigo, setCodigo] = useState('')

  useEffect(() => {
    document.title = 'Botón de arrepentimiento | El Vestidor'
  }, [])

  function manejarCampo(e) {
    const { name, value } = e.target
    setForm(anterior => ({ ...anterior, [name]: value }))
    setError(null)
  }

  async function manejarEnvio(e) {
    e.preventDefault()

    if (enviando) return

    setEnviando(true)
    setError(null)

    try {
      setCodigo(await solicitarArrepentimiento(form))
      setForm(FORM_INICIAL)
    } catch (err) {
      setError(err.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <main className="legal">
      <Contenedor className="legal__contenedor">
        <p className="legal__etiqueta">El Vestidor</p>
        <h1 className="legal__titulo">Botón de arrepentimiento</h1>

        {codigo ? (
          <div className="legal__resultado" role="status">
            <p>Recibimos tu pedido de arrepentimiento. Tu código de constancia es:</p>
            <p className="legal__codigo">{codigo}</p>
            <p>
              Guardalo. Dentro de las 24 horas te escribimos desde{' '}
              <a href={`mailto:${comercio.email}`}>{comercio.email}</a> para confirmarlo, con ese código y los pasos
              para devolver el producto.
            </p>
          </div>
        ) : (
          <>
            <div className="legal__texto">
              <p>
                Si compraste en nuestra tienda online, podés arrepentirte de la compra dentro de los{' '}
                <strong>10 días corridos</strong> desde que recibiste el producto, sin necesidad de explicar el motivo y
                sin costo, como establece el artículo 34 de la Ley 24.240 de Defensa del Consumidor.
              </p>
              <p>
                Completá el formulario y al enviarlo vas a ver un código que identifica tu pedido de arrepentimiento;
                guardalo. Dentro de las 24 horas te escribimos desde {comercio.email} para confirmarlo, con ese código y
                los pasos para devolver el producto. El envío de la devolución corre por nuestra cuenta. Una vez que
                recibimos el producto, te reintegramos el dinero por el mismo medio con el que pagaste, a través de
                Mercado Pago.
              </p>
              <p>El producto tiene que estar sin uso, con sus etiquetas y en las mismas condiciones en que lo recibiste.</p>
            </div>

            <form className="legal__formulario" onSubmit={manejarEnvio} noValidate>
              <label className="legal__campo" htmlFor="arrepentimiento-nombre">
                <span>Nombre y apellido</span>
                <input
                  id="arrepentimiento-nombre"
                  name="nombre"
                  type="text"
                  value={form.nombre}
                  onChange={manejarCampo}
                  maxLength="100"
                  autoComplete="name"
                  required
                />
              </label>

              <label className="legal__campo" htmlFor="arrepentimiento-email">
                <span>Email con el que compraste</span>
                <input
                  id="arrepentimiento-email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={manejarCampo}
                  maxLength="254"
                  autoComplete="email"
                  inputMode="email"
                  required
                />
              </label>

              <label className="legal__campo" htmlFor="arrepentimiento-pedido">
                <span>Número de pedido</span>
                <input
                  id="arrepentimiento-pedido"
                  name="codigoPedido"
                  type="text"
                  value={form.codigoPedido}
                  onChange={manejarCampo}
                  maxLength="40"
                  autoComplete="off"
                  required
                />
                <small>Figura en el correo que te enviamos al hacer la compra.</small>
              </label>

              <label className="legal__campo" htmlFor="arrepentimiento-comentario">
                <span>Comentario (opcional)</span>
                <textarea
                  id="arrepentimiento-comentario"
                  name="comentario"
                  value={form.comentario}
                  onChange={manejarCampo}
                  maxLength="1000"
                  rows="3"
                />
              </label>

              <input
                className="legal__trampa"
                name="sitioWeb"
                type="text"
                value={form.sitioWeb}
                onChange={manejarCampo}
                tabIndex="-1"
                autoComplete="off"
                aria-hidden="true"
              />

              {error && (
                <p className="legal__error" role="alert">
                  {error}
                </p>
              )}

              <Boton type="submit" disabled={enviando}>
                {enviando ? 'Enviando...' : 'Enviar pedido de arrepentimiento'}
              </Boton>
            </form>
          </>
        )}
      </Contenedor>
    </main>
  )
}

export default Arrepentimiento
