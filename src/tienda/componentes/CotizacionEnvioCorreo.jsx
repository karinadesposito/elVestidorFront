import Boton from '../../componentesReuse/Boton'

function CotizacionEnvioCorreo({ envio, ocupado, ahora, onCotizar, onSeleccionar, formatoPrecio }) {
  const cotizacion = envio?.cotizacion
  const vencida = cotizacion && Date.parse(cotizacion.vence) <= ahora
  const paquetePendiente = !envio?.paquete || envio.estadoCotizacion === 'PENDIENTE_PAQUETE'
  const pendiente = paquetePendiente || envio.estadoCotizacion === 'PENDIENTE_ACCESO'
  return <section className="finalizar-compra__panel" aria-live="polite">
    <h2>Costo del envío</h2>
    {paquetePendiente ? <p>Falta confirmar el peso y las dimensiones del paquete para calcular el envío.</p>
      : envio.estadoCotizacion === 'PENDIENTE_ACCESO' ? <p>La cotización de Correo Argentino todavía no está disponible.</p>
      : <>
        {(envio.estadoCotizacion === 'VENCIDA' || vencida) &&
          <p>La cotización venció o cambió el pedido. Consultá el costo nuevamente antes de pagar.</p>}
        <Boton onClick={onCotizar} disabled={ocupado || pendiente}>
          {ocupado ? 'Consultando...' : cotizacion ? 'Actualizar cotización' : 'Consultar costo de envío'}
        </Boton>
        {cotizacion && !vencida && <>
          <div className="estructura__campo">
            <label htmlFor="correo-tarifa">Servicio de Correo Argentino</label>
            <select id="correo-tarifa" value={cotizacion.productoSeleccionado || ''}
              onChange={evento => onSeleccionar(evento.target.value)} disabled={ocupado}>
              <option value="" disabled>Seleccionar servicio</option>
              {cotizacion.tarifas.map(tarifa => <option key={tarifa.producto} value={tarifa.producto}>
                {tarifa.nombre} — {formatoPrecio(tarifa.importeCentavos)}
              </option>)}
            </select>
          </div>
          <p>Tarifa válida hasta {new Date(cotizacion.vence).toLocaleString('es-AR')}.</p>
        </>}
      </>}
    <p>Productos y envío se cobran juntos en Mercado Pago cuando confirmás la compra.</p>
  </section>
}
export default CotizacionEnvioCorreo
