export const PROVINCIAS_CORREO = [
  ['B', 'Buenos Aires'], ['C', 'Ciudad Autónoma de Buenos Aires'], ['K', 'Catamarca'],
  ['H', 'Chaco'], ['U', 'Chubut'], ['X', 'Córdoba'], ['W', 'Corrientes'], ['E', 'Entre Ríos'],
  ['P', 'Formosa'], ['Y', 'Jujuy'], ['L', 'La Pampa'], ['F', 'La Rioja'], ['M', 'Mendoza'],
  ['N', 'Misiones'], ['Q', 'Neuquén'], ['R', 'Río Negro'], ['A', 'Salta'], ['J', 'San Juan'],
  ['D', 'San Luis'], ['Z', 'Santa Cruz'], ['S', 'Santa Fe'], ['G', 'Santiago del Estero'],
  ['V', 'Tierra del Fuego'], ['T', 'Tucumán'],
]

export const DESTINO_CORREO_INICIAL = {
  modalidad: 'D', calle: '', numero: '', piso: '', departamento: '', localidad: '',
  codigoProvincia: '', codigoPostal: '', codigoSucursal: '',
}

export function formularioDesdeEnvioCorreo(envio) {
  if (!envio) return { ...DESTINO_CORREO_INICIAL }
  return { ...DESTINO_CORREO_INICIAL, ...envio.destino,
    modalidad: envio.modalidad, codigoSucursal: envio.sucursal?.codigo || '' }
}

export function construirDestinoCorreo(valor, revisionEsperada) {
  const normalizado = Object.fromEntries(Object.keys(DESTINO_CORREO_INICIAL)
    .map(clave => [clave, String(valor?.[clave] ?? '').trim()]))
  if (!['D', 'S'].includes(normalizado.modalidad)) throw new Error('Elegí cómo recibir tu pedido.')
  if (!PROVINCIAS_CORREO.some(([codigo]) => codigo === normalizado.codigoProvincia)) {
    throw new Error('Seleccioná la provincia de destino.')
  }
  if (!Number.isInteger(revisionEsperada) || revisionEsperada < 0) {
    throw new Error('Actualizá los datos del envío antes de guardarlos.')
  }
  if (normalizado.modalidad === 'S') {
    if (!normalizado.codigoSucursal) throw new Error('Seleccioná una sucursal disponible.')
    // El domicilio de la sucursal se resuelve exclusivamente en el servidor.
    return { modalidad: 'S', codigoProvincia: normalizado.codigoProvincia,
      codigoSucursal: normalizado.codigoSucursal, revisionEsperada }
  }
  if (!normalizado.calle || !normalizado.numero || !normalizado.localidad) {
    throw new Error('Completá calle, número y localidad.')
  }
  normalizado.codigoPostal = normalizado.codigoPostal.replace(/\s/g, '').toUpperCase()
  if (!/^(?:\d{4}|[A-Z]\d{4}(?:[A-Z]{3})?)$/.test(normalizado.codigoPostal)) {
    throw new Error('Ingresá un código postal argentino válido.')
  }
  if (/^[A-Z]/.test(normalizado.codigoPostal) &&
      normalizado.codigoPostal[0] !== normalizado.codigoProvincia) {
    throw new Error('El código postal no coincide con la provincia.')
  }
  const { codigoSucursal, ...domicilio } = normalizado
  return { ...domicilio, revisionEsperada }
}

export function tarifaConfirmadaCorreo(envio, pedido, ahora = Date.now()) {
  const cotizacion = envio?.cotizacion
  if (envio?.estadoCotizacion !== 'SELECCIONADA' || !cotizacion ||
      !Number.isFinite(Date.parse(cotizacion.vence)) || Date.parse(cotizacion.vence) <= ahora) return null
  const tarifa = cotizacion.tarifas.find(t => t.producto === cotizacion.productoSeleccionado)
  if (!tarifa || !Number.isSafeInteger(tarifa.importeCentavos) || tarifa.importeCentavos <= 0 ||
      pedido?.shippingLines?.length !== 1 ||
      pedido.shippingLines[0].shippingMethod?.code !== 'correo-argentino-micorreo' ||
      pedido.shippingWithTax !== tarifa.importeCentavos) return null
  return tarifa
}
