import { useEffect, useState } from 'react'
import { PROVINCIAS_CORREO } from '../../servicios/envioCorreoDatos'
import { obtenerLocalidadesEnvio } from '../../servicios/envioZonaService'

const normalizar = valor => String(valor ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .trim().replace(/\s+/g, ' ').toUpperCase()

export default function FormularioEnvioZona({ valor, onCambiar, deshabilitado }) {
  const provincia = String(valor.provincia || '').trim()
  const postal = String(valor.codigoPostal || '').trim().toUpperCase()
  const formatoValido = /^(?:\d{4}|[A-Z]\d{4})$/.test(postal)
  const clave = `${provincia}|${postal}`
  const [consulta, setConsulta] = useState({ clave: '', opciones: [], error: '' })
  useEffect(() => {
    if (!provincia || !formatoValido) return
    let vigente = true
    const demora = setTimeout(() => {
      obtenerLocalidadesEnvio(provincia, postal).then(opciones => {
        if (vigente) setConsulta({ clave, opciones, error: opciones.length ? ''
          : 'No encontramos ese código postal en la provincia elegida. Revisalo o consultanos antes de comprar.' })
      }).catch(() => {
        if (vigente) setConsulta({ clave, opciones: [], error: 'No pudimos consultar las localidades. Revisá tu conexión y volvé a ingresar el código postal.' })
      })
    }, 300)
    return () => { vigente = false; clearTimeout(demora) }
  }, [provincia, postal, formatoValido, clave])
  const actual = consulta.clave === clave
  const opciones = actual && formatoValido ? consulta.opciones : []
  const cargando = Boolean(provincia && formatoValido && !actual)
  const error = actual && formatoValido ? consulta.error : ''
  let ciudad = normalizar(valor.ciudad)
  if (opciones.includes('CIUDAD AUTONOMA BUENOS AIRES') && ['CABA', 'CAPITAL FEDERAL', 'BUENOS AIRES',
    'CIUDAD AUTONOMA DE BUENOS AIRES'].includes(ciudad)) ciudad = 'CIUDAD AUTONOMA BUENOS AIRES'
  const seleccion = opciones.find(nombre => normalizar(nombre) === ciudad) || ''
  function cambiar(evento) {
    const { name, value } = evento.target
    onCambiar({ ...valor, [name]: value, ...(['provincia', 'codigoPostal'].includes(name) ? { ciudad: '' } : {}) })
  }
  return <fieldset disabled={deshabilitado}>
    <legend>Dirección de entrega</legend>
    <div className="finalizar-compra__campos">
      <div className="estructura__campo">
        <label htmlFor="zona-provincia">Provincia</label>
        <select id="zona-provincia" name="provincia" value={valor.provincia} onChange={cambiar}
          autoComplete="address-level1" required>
          <option value="">Seleccionar provincia</option>
          {PROVINCIAS_CORREO.map(([codigo, nombre]) => <option key={codigo} value={nombre}>{nombre}</option>)}
        </select>
      </div>
      <div className="estructura__campo">
        <label htmlFor="zona-codigoPostal">Código postal</label>
        <input id="zona-codigoPostal" name="codigoPostal" value={valor.codigoPostal} onChange={cambiar}
          autoComplete="postal-code" required maxLength={8} pattern="([0-9]{4}|[A-Za-z][0-9]{4})"
          title="Usá cuatro números (7000) o la letra provincial y cuatro números (B7000)." aria-describedby="zona-ayuda-postal" />
        <small id="zona-ayuda-postal">Usá el CP de cuatro números, por ejemplo 7000 o B7000. No incluyas las tres letras finales del CPA.</small>
        {postal && !formatoValido && <p role="alert">Ingresá cuatro números o la letra de provincia seguida de cuatro números.</p>}
      </div>
      <div className="estructura__campo">
        <label htmlFor="zona-ciudad">Localidad</label>
        <select id="zona-ciudad" name="ciudad" value={seleccion} onChange={cambiar} required
          autoComplete="address-level2" disabled={deshabilitado || !opciones.length} aria-describedby="zona-estado-postal">
          <option value="">{cargando ? 'Consultando localidades...' : 'Seleccionar localidad'}</option>
          {opciones.map(nombre => <option key={nombre} value={nombre}>{nombre}</option>)}
        </select>
        <span id="zona-estado-postal" role="status">{cargando ? 'Consultando localidades...' : ''}</span>
        {error && <p role="alert">{error}</p>}
      </div>
      <div className="estructura__campo">
        <label htmlFor="zona-calle">Calle y número</label>
        <input id="zona-calle" name="calle" value={valor.calle} onChange={cambiar}
          autoComplete="address-line1" required maxLength={150} />
      </div>
      <div className="estructura__campo">
        <label htmlFor="zona-departamento">Piso o departamento (opcional)</label>
        <input id="zona-departamento" name="departamento" value={valor.departamento} onChange={cambiar}
          autoComplete="address-line2" maxLength={150} />
      </div>
    </div>
    <p>Elegí provincia, ingresá el código postal y seleccioná tu localidad. Al guardar confirmamos el costo del envío.</p>
    <small>Localidades y códigos postales de referencia: <a href="https://www.oca.com.ar/Busquedas/CodigosPostales" target="_blank" rel="noreferrer">OCA</a>.</small>
  </fieldset>
}
