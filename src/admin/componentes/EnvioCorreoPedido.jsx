import { useEffect, useState } from 'react'
import Boton from '../../componentesReuse/Boton'
import { obtenerEnvioCorreoPedido, guardarPaqueteCorreoPedido } from '../servicios/envioCorreoService'

function EnvioCorreoPedido({ pedidoId }) {
  const [envio, setEnvio] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [revision, setRevision] = useState(0)
  const [paquete, setPaquete] = useState({ pesoGramos: '', altoCm: '', anchoCm: '', largoCm: '' })
  const [guardando, setGuardando] = useState(false)
  const [errorPaquete, setErrorPaquete] = useState('')
  const [medido, setMedido] = useState(false)
  useEffect(() => {
    let vigente = true
    setCargando(true)
    setError('')
    setEnvio(null)
    obtenerEnvioCorreoPedido(pedidoId).then(resultado => {
      if (vigente) {
        setEnvio(resultado)
        setPaquete(resultado?.paquete || { pesoGramos: '', altoCm: '', anchoCm: '', largoCm: '' })
        setMedido(false)
      }
    }).catch(() => {
      if (vigente) setError('No se pudo consultar el destino de Correo Argentino.')
    }).finally(() => { if (vigente) setCargando(false) })
    return () => { vigente = false }
  }, [pedidoId, revision])

  async function confirmarPaquete(evento) {
    evento.preventDefault()
    if (guardando || !medido || !envio?.editable) return
    setGuardando(true)
    setErrorPaquete('')
    try {
      const actualizado = await guardarPaqueteCorreoPedido(pedidoId, paquete, envio.revision)
      setEnvio(actualizado)
      setMedido(false)
    } catch (fallo) { setErrorPaquete(fallo.message || 'No se pudo confirmar el paquete.') }
    finally { setGuardando(false) }
  }

  if (!cargando && !error && !envio) return null
  return <section className="estructura__panel admin-detalle-pedido__direccion">
    <div className="estructura__panel-encabezado"><h2>Correo Argentino</h2></div>
    {cargando ? <p role="status">Consultando envío...</p> : error ? <>
      <p role="alert">{error}</p>
      <Boton variante="secundario" onClick={() => setRevision(actual => actual + 1)}>Reintentar</Boton>
    </> : <>
      <p><strong>Entrega:</strong> {envio.modalidad === 'S' ? 'Retiro en sucursal' : 'A domicilio'}</p>
      {envio.sucursal && <p><strong>Sucursal:</strong> {envio.sucursal.nombre} ({envio.sucursal.codigo})</p>}
      <p><strong>Destino:</strong> {envio.destino.calle} {envio.destino.numero}
        {envio.destino.piso ? `, piso ${envio.destino.piso}` : ''}
        {envio.destino.departamento ? `, departamento ${envio.destino.departamento}` : ''}
        , {envio.destino.localidad} — {envio.destino.codigoPostal}</p>
      <p><strong>Origen:</strong> {envio.origen.calle} {envio.origen.numero}, {' '}
        {envio.origen.localidad} — {envio.origen.codigoPostal}</p>
      {envio.paquete ? <p><strong>Paquete:</strong> {envio.paquete.pesoGramos} g; {' '}
        {envio.paquete.altoCm} × {envio.paquete.anchoCm} × {envio.paquete.largoCm} cm</p>
        : <p>Peso y dimensiones pendientes de confirmar.</p>}
      {envio.paquete && !envio.paqueteConfirmado && envio.editable &&
        <p>Las prendas cambiaron o falta confirmar el paquete para este pedido.</p>}
      {envio.cotizacion && <>
        <p><strong>Cotización:</strong> {envio.estadoCotizacion}</p>
        {envio.cotizacion.tarifas.filter(tarifa => tarifa.producto === envio.cotizacion.productoSeleccionado)
          .map(tarifa => <p key={tarifa.producto}>{tarifa.nombre}: {' '}
            {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(tarifa.importeCentavos / 100)}</p>)}
      </>}
      {envio.editable && <form onSubmit={confirmarPaquete}>
        <fieldset disabled={guardando || cargando}>
          <legend>Confirmar paquete embalado</legend>
          {[
            ['pesoGramos', 'Peso total (gramos)', 25000], ['altoCm', 'Alto (cm)', 150],
            ['anchoCm', 'Ancho (cm)', 150], ['largoCm', 'Largo (cm)', 150],
          ].map(([campo, etiqueta, maximo]) => <div className="estructura__campo" key={campo}>
            <label htmlFor={`paquete-${campo}`}>{etiqueta}</label>
            <input id={`paquete-${campo}`} type="number" min="1" max={maximo} step="1" required
              value={paquete[campo]} onChange={evento => {
                setPaquete(actual => ({ ...actual, [campo]: evento.target.value }))
                setMedido(false)
              }} />
          </div>)}
          <label><input type="checkbox" checked={medido} required
            onChange={evento => setMedido(evento.target.checked)} />{' '}
            El peso y las medidas corresponden al paquete embalado de estas prendas.</label>
          {errorPaquete && <p role="alert">{errorPaquete}</p>}
          <Boton type="submit" disabled={guardando || !medido}>
            {guardando ? 'Guardando...' : 'Confirmar paquete'}
          </Boton>
        </fieldset>
      </form>}
      <p>Destino registrado. Todavía no se generó un envío en MiCorreo.</p>
      <Boton variante="secundario" disabled={guardando}
        onClick={() => setRevision(actual => actual + 1)}>Actualizar envío</Boton>
    </>}
  </section>
}

export default EnvioCorreoPedido
