import { useEffect, useState } from 'react'
import Boton from '../../componentesReuse/Boton'
import { PROVINCIAS_CORREO } from '../../servicios/envioCorreoDatos'
import { obtenerSucursalesCorreo } from '../../servicios/envioCorreoService'

function FormularioEnvioCorreo({ valor, onCambiar, deshabilitado }) {
  const [sucursales, setSucursales] = useState([])
  const [cargando, setCargando] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const [reintento, setReintento] = useState(0)

  useEffect(() => {
    let vigente = true
    setSucursales([])
    setMensaje('')
    setCargando(false)
    if (valor.modalidad !== 'S' || !valor.codigoProvincia) return () => { vigente = false }
    setCargando(true)
    obtenerSucursalesCorreo(valor.codigoProvincia).then(resultado => {
      if (!vigente) return
      setSucursales(resultado.sucursales)
      if (!resultado.disponible) {
        setMensaje('El retiro en sucursal todavía no está disponible. Podés guardar un destino a domicilio.')
      } else if (!resultado.sucursales.length) {
        setMensaje('No hay sucursales disponibles para retirar en esta provincia.')
      }
    }).catch(() => {
      if (vigente) setMensaje('No pudimos consultar las sucursales. Reintentá la consulta.')
    }).finally(() => { if (vigente) setCargando(false) })
    return () => { vigente = false }
  }, [valor.modalidad, valor.codigoProvincia, reintento])

  function cambiar(evento) {
    const { name, value } = evento.target
    onCambiar({ ...valor, [name]: value,
      ...(['modalidad', 'codigoProvincia'].includes(name) ? { codigoSucursal: '' } : {}) })
  }

  const campos = [
    ['calle', 'Calle', 'address-line1', 150, true],
    ['numero', 'Número', 'off', 20, true],
    ['piso', 'Piso (opcional)', 'off', 20, false],
    ['departamento', 'Departamento (opcional)', 'address-line2', 30, false],
    ['localidad', 'Localidad', 'address-level2', 100, true],
    ['codigoPostal', 'Código postal', 'postal-code', 12, true],
  ]

  return (
    <fieldset disabled={deshabilitado}>
      <legend>Envío por Correo Argentino</legend>
      <div className="finalizar-compra__campos">
        <div className="estructura__campo">
          <label htmlFor="correo-modalidad">¿Cómo querés recibirlo?</label>
          <select id="correo-modalidad" name="modalidad" value={valor.modalidad} onChange={cambiar}>
            <option value="D">Entrega a domicilio</option>
            <option value="S">Retiro en sucursal de Correo Argentino</option>
          </select>
        </div>
        <div className="estructura__campo">
          <label htmlFor="correo-provincia">Provincia de destino</label>
          <select id="correo-provincia" name="codigoProvincia" value={valor.codigoProvincia}
            onChange={cambiar} autoComplete="address-level1" required>
            <option value="">Seleccionar provincia</option>
            {PROVINCIAS_CORREO.map(([codigo, nombre]) => <option key={codigo} value={codigo}>{nombre}</option>)}
          </select>
        </div>
        {valor.modalidad === 'D' ? campos.map(([nombre, etiqueta, autocomplete, maximo, requerido]) => (
          <div key={nombre} className="estructura__campo">
            <label htmlFor={`correo-${nombre}`}>{etiqueta}</label>
            <input id={`correo-${nombre}`} name={nombre} value={valor[nombre]}
              onChange={cambiar} autoComplete={autocomplete} maxLength={maximo} required={requerido} />
          </div>
        )) : (
          <div className="estructura__campo">
            <label htmlFor="correo-sucursal">Sucursal para retirar</label>
            <select id="correo-sucursal" name="codigoSucursal" value={valor.codigoSucursal}
              onChange={cambiar} required disabled={deshabilitado || cargando || sucursales.length === 0}>
              <option value="">{cargando ? 'Consultando sucursales...' : 'Seleccionar sucursal'}</option>
              {sucursales.map(sucursal => <option key={sucursal.codigo} value={sucursal.codigo}>
                {sucursal.nombre} — {sucursal.calle} {sucursal.numero}, {sucursal.localidad}
              </option>)}
            </select>
          </div>
        )}
      </div>
      {valor.modalidad === 'S' && !valor.codigoProvincia && <p>Seleccioná una provincia para consultar sus sucursales.</p>}
      {cargando && <p role="status">Consultando sucursales de Correo Argentino...</p>}
      {mensaje && <div role="status"><p>{mensaje}</p>
        <Boton variante="secundario" onClick={() => setReintento(actual => actual + 1)}
          disabled={deshabilitado || cargando}>Reintentar consulta</Boton>
      </div>}
      <p>Guardá el destino para consultar el costo del envío antes de pagar.</p>
    </fieldset>
  )
}

export default FormularioEnvioCorreo
