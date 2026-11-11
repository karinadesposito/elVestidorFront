import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

import Contenedor from '../../componentesReuse/Contenedor'
import Boton from '../../componentesReuse/Boton'

import {
  obtenerPedidoCheckout,
  guardarCompradorCheckout,
  recuperarCarritoParaEditar,
  obtenerMetodosPago,
  iniciarPagoMercadoPago,
  obtenerCompraRealizada,
  olvidarCodigoPedidoPago,
} from '../../servicios/checkoutService'

import FormularioEnvioCorreo from '../componentes/FormularioEnvioCorreo'
import CotizacionEnvioCorreo from '../componentes/CotizacionEnvioCorreo'
import {
  obtenerEnvioCorreoActivo, guardarDestinoCorreo, cotizarEnvioCorreo,
  seleccionarTarifaCorreo, verificarTarifaCorreo, seleccionarRetiroLocal, retiroLocalConfirmado
} from '../../servicios/envioCorreoService'
import {
  DESTINO_CORREO_INICIAL, formularioDesdeEnvioCorreo,
  construirDestinoCorreo, tarifaConfirmadaCorreo
} from '../../servicios/envioCorreoDatos'

import '../../estilos/FinalizarCompra.css'

const CODIGO_MERCADO_PAGO = 'mercado-pago-checkout-pro'

// La conciliación del worker puede necesitar hasta dos ciclos de dos minutos.
const MAX_CONSULTAS_RETORNO = 90
const INTERVALO_RETORNO_MS = 3000

export function consultaCompraReintentable(fallo) {
  const errores = fallo?.graphQLErrors || fallo?.errors || []
  const codigo = fallo?.extensions?.code
  const estado = fallo?.networkError?.statusCode || fallo?.statusCode
  return codigo === 'FORBIDDEN' || errores.some(error => error.extensions?.code === 'FORBIDDEN') ||
    estado >= 500 || /failed to fetch|networkerror|load failed/i.test(fallo?.message || '')
}


const COMPRADOR_INICIAL = {
  nombre: '',
  apellido: '',
  email: '',
  telefono: '',
}

const DIRECCION_INICIAL = {
  calle: '',
  departamento: '',
  ciudad: '',
  provincia: '',
  codigoPostal: '',
}

function opcionesVariante(variante) {
  return variante.options
    .filter(opcion =>
      ['color', 'talle'].some(
        tipo =>
          opcion.group.code === tipo ||
          opcion.group.code.startsWith(`${tipo}-`),
      ),
    )
    .map(opcion => opcion.name)
    .join(' · ')
}

function compraConfirmada(pedido) {
  if (!pedido || pedido.totalWithTax <= 0) {
    return false
  }

  const importeAcreditado = (pedido.payments || [])
    .filter(
      pago =>
        pago.method === CODIGO_MERCADO_PAGO &&
        pago.state === 'Settled',
    )
    .reduce((total, pago) => total + pago.amount, 0)

  return (
    !pedido.active &&
    importeAcreditado >= pedido.totalWithTax
  )
}

function pagoCerradoSinAcreditacion(pedido) {
  const pagos = (pedido?.payments || []).filter(
    pago => pago.method === CODIGO_MERCADO_PAGO,
  )

  return (
    pedido?.state === 'Cancelled' ||
    (
      pagos.length > 0 &&
      pagos.every(
        pago =>
          pago.state === 'Declined' ||
          pago.state === 'Cancelled' ||
          pago.state === 'Error',
      )
    )
  )
}

function FinalizarCompra() {
  const ubicacion = useLocation()
  const parametros = new URLSearchParams(ubicacion.search)
  const esRetornoPago = parametros.has('retornoPago')

  const [pedido, setPedido] = useState(null)
  const [comprador, setComprador] = useState(COMPRADOR_INICIAL)
  const [direccion, setDireccion] = useState(DIRECCION_INICIAL)
  const [envioCorreo, setEnvioCorreo] = useState(null)
  const [modalidadEntrega, setModalidadEntrega] = useState('correo')
  const [ahora, setAhora] = useState(Date.now())
  const [destinoCorreo, setDestinoCorreo] = useState({ ...DESTINO_CORREO_INICIAL })
  const [entregaSeleccionada, setEntregaSeleccionada] = useState('')
  const [metodoPago, setMetodoPago] = useState(null)
  const [datosGuardados, setDatosGuardados] = useState(false)
  const [cargando, setCargando] = useState(true)
  const [procesando, setProcesando] = useState(false)
  const [error, setError] = useState('')
  const [revision, setRevision] = useState(0)
  const [verificacionAgotada, setVerificacionAgotada] = useState(false)
  const [consultaRetornoPendiente, setConsultaRetornoPendiente] = useState(false)

  const solicitudEnCurso = useRef(false)

  const editable =
    !esRetornoPago && pedido?.state === 'AddingItems'

  const esperandoPago = pedido?.state === 'ArrangingPayment'
  const confirmado = compraConfirmada(pedido)
  const pagoCerrado = pagoCerradoSinAcreditacion(pedido)
  const ocupado = cargando || procesando
  const tieneProductos = Boolean(pedido?.totalQuantity > 0)
  const tarifaCorreo = tarifaConfirmadaCorreo(envioCorreo, pedido, ahora)
  const retiroConfirmado = retiroLocalConfirmado(pedido, envioCorreo)
  const entregaConfirmada = modalidadEntrega === 'local' ? retiroConfirmado : Boolean(tarifaCorreo)

  useEffect(() => {
    setAhora(Date.now())
    if (!envioCorreo?.cotizacion) return
    const temporizador = window.setInterval(() => setAhora(Date.now()), 1000)
    return () => window.clearInterval(temporizador)
  }, [envioCorreo?.cotizacion?.vence])


  const formatoPrecio = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: pedido?.currencyCode || 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })

  function mostrarPrecio(centavos) {
    return formatoPrecio.format(centavos / 100)
  }

  function aplicarDatosPedido(resultado) {
    setPedido(resultado)

    if (!resultado) {
      setDatosGuardados(false)
      setEntregaSeleccionada('')
      setMetodoPago(null)
      return
    }

    const cliente = resultado.customer
    const domicilio = resultado.shippingAddress

    setComprador({
      nombre: cliente?.firstName || '',
      apellido: cliente?.lastName || '',
      email: cliente?.emailAddress || '',
      telefono:
        cliente?.phoneNumber || domicilio?.phoneNumber || '',
    })

    setDireccion({
      calle: domicilio?.streetLine1 || '',
      departamento: domicilio?.streetLine2 || '',
      ciudad: domicilio?.city || '',
      provincia: domicilio?.province || '',
      codigoPostal: domicilio?.postalCode || '',
    })

    setDatosGuardados(
      Boolean(
        cliente &&
        domicilio?.streetLine1 &&
        domicilio?.city &&
        domicilio?.province &&
        domicilio?.postalCode,
      ),
    )

    setEntregaSeleccionada(
      String(
        resultado.shippingLines?.[0]?.shippingMethod?.id || '',
      ),
    )
  }

  async function consultarOpciones(resultado) {
    if (!resultado?.totalQuantity) {
      return { entregas: [], pago: null }
    }

    const pagos = await obtenerMetodosPago()

    return {
      entregas: [],
      pago:
        pagos.find(
          metodo => metodo.code === CODIGO_MERCADO_PAGO,
        ) || null,
    }
  }

  useEffect(() => {
    let activo = true
    let temporizador
    let consultas = 0

    setCargando(true)
    setError('')
    setPedido(null)
    setVerificacionAgotada(false)
    setConsultaRetornoPendiente(esRetornoPago)

    async function cargarCheckout() {
      consultas += 1

      try {
        // El parámetro del retorno nunca acredita el pago.
        // Consultamos el pedido guardado usando la sesión de tienda.
        const resultado = esRetornoPago
          ? await obtenerCompraRealizada()
          : await obtenerPedidoCheckout()

        if (!activo) {
          return
        }

        aplicarDatosPedido(resultado)
        setConsultaRetornoPendiente(false)
        setError('')

        if (esRetornoPago) {
          setMetodoPago(null)

          const termino =
            compraConfirmada(resultado) ||
            pagoCerradoSinAcreditacion(resultado)

          if (!termino) {
            if (consultas < MAX_CONSULTAS_RETORNO) {
              temporizador = window.setTimeout(
                cargarCheckout,
                INTERVALO_RETORNO_MS,
              )
            } else {
              setVerificacionAgotada(true)
            }
          }

          return
        }

        const envio = resultado?.active ? await obtenerEnvioCorreoActivo(resultado.id) : null
        if (!activo) return
        setEnvioCorreo(envio)
        if (resultado?.state === 'AddingItems') {
          setDestinoCorreo(formularioDesdeEnvioCorreo(envio))
          setDatosGuardados(Boolean(resultado.customer && (envio || retiroLocalConfirmado(resultado, envio))))
          setModalidadEntrega(retiroLocalConfirmado(resultado, envio) ? 'local' : 'correo')
          setEntregaSeleccionada(String(resultado.shippingLines?.[0]?.shippingMethod?.id || ''))
          const opciones = await consultarOpciones(resultado)
          if (activo) setMetodoPago(opciones.pago)
          return
        }

        const opciones = await consultarOpciones(resultado)

        if (activo) {
          setMetodoPago(opciones.pago)
        }
      } catch (fallo) {
        if (!activo) return
        if (esRetornoPago && consultaCompraReintentable(fallo)) {
          setError('')
          if (consultas < MAX_CONSULTAS_RETORNO) {
            setConsultaRetornoPendiente(true)
            temporizador = window.setTimeout(cargarCheckout, INTERVALO_RETORNO_MS)
          } else {
            setConsultaRetornoPendiente(false)
            setVerificacionAgotada(true)
            setError('Todavía no pudimos consultar la confirmación de esta compra. No vuelvas a pagar. Podés consultar de nuevo o comunicarte con la tienda indicando el código del pedido.')
          }
        } else {
          setConsultaRetornoPendiente(false)
          setError(esRetornoPago
            ? 'No pudimos consultar tu compra. No vuelvas a pagar; consultá nuevamente o comunicate con la tienda.'
            : fallo.message || 'No pudimos cargar tu compra.')
        }
      } finally {
        if (activo) {
          setCargando(false)
        }
      }
    }

    cargarCheckout()

    return () => {
      activo = false
      window.clearTimeout(temporizador)
    }
  }, [esRetornoPago, revision])

  function invalidarDatosGuardados() {
    setDatosGuardados(false)
    setEntregaSeleccionada('')
    setMetodoPago(null)
    setError('')
  }

  function cambiarComprador(evento) {
    const { name, value } = evento.target

    setComprador(actual => ({
      ...actual,
      [name]: value,
    }))

    invalidarDatosGuardados()
  }

  async function guardarDatos(evento) {
    evento.preventDefault()

    if (solicitudEnCurso.current || !editable) {
      return
    }

    solicitudEnCurso.current = true
    setProcesando(true)
    setError('')
    setEntregaSeleccionada('')
    setMetodoPago(null)
    setDatosGuardados(false)

    try {
      // Validar sólo el destino que corresponde a la entrega elegida.
      if (modalidadEntrega === 'correo') construirDestinoCorreo(destinoCorreo, envioCorreo?.revision ?? 0)
      const compradorGuardado = await guardarCompradorCheckout(comprador)
      if (String(compradorGuardado.id) !== String(pedido.id)) {
        throw new Error('El carrito cambió. Actualizá el resumen antes de continuar.')
      }
      const retiro = modalidadEntrega === 'local'
      if (retiro) await seleccionarRetiroLocal()
      const envio = retiro ? null : await guardarDestinoCorreo(destinoCorreo, envioCorreo, pedido.id)
      const resultado = await obtenerPedidoCheckout()
      if (!resultado || String(resultado.id) !== String(pedido.id)) {
        throw new Error('El carrito cambió. Actualizá el resumen para consultar el destino guardado.')
      }
      aplicarDatosPedido(resultado)
      setEnvioCorreo(envio)
      setDestinoCorreo(formularioDesdeEnvioCorreo(envio))
      setDatosGuardados(true)
      setEntregaSeleccionada(String(resultado.shippingLines?.[0]?.shippingMethod?.id || ''))
      const opciones = await consultarOpciones(resultado)
      setMetodoPago(opciones.pago)
    } catch (fallo) {
      setError(
        /failed to fetch|networkerror|load failed/i.test(fallo.message || '')
          ? 'No pudimos conectar con la tienda. Revisá tu conexión e intentá guardar nuevamente.'
          : fallo.message || 'No pudimos guardar tus datos.',
      )
    } finally {
      solicitudEnCurso.current = false
      setProcesando(false)
    }
  }

  async function actualizarResumen() {
    if (solicitudEnCurso.current || ocupado) {
      return
    }

    if (esRetornoPago) {
      setRevision(actual => actual + 1)
      return
    }

    solicitudEnCurso.current = true
    setProcesando(true)
    setError('')

    try {
      const resultado = await obtenerPedidoCheckout()

      aplicarDatosPedido(resultado)
      const envio = resultado?.active ? await obtenerEnvioCorreoActivo(resultado.id) : null
      setEnvioCorreo(envio)
      if (resultado?.state === 'AddingItems') {
        setDestinoCorreo(formularioDesdeEnvioCorreo(envio))
        setDatosGuardados(Boolean(resultado.customer && (envio || retiroLocalConfirmado(resultado, envio))))
          setModalidadEntrega(retiroLocalConfirmado(resultado, envio) ? 'local' : 'correo')
        setEntregaSeleccionada(String(resultado.shippingLines?.[0]?.shippingMethod?.id || ''))
        const opciones = await consultarOpciones(resultado)
        setMetodoPago(opciones.pago)
        return
      }

      const opciones = await consultarOpciones(resultado)

      setMetodoPago(opciones.pago)

    } catch (fallo) {
      setError(
        fallo.message || 'No pudimos actualizar tu compra.',
      )
    } finally {
      solicitudEnCurso.current = false
      setProcesando(false)
    }
  }

  const pagoPendiente = (pedido?.payments || []).some(
    pago =>
      pago.method === CODIGO_MERCADO_PAGO &&
      pago.state === 'Created',
  )

  const puedePagar =
    !esRetornoPago && tieneProductos && datosGuardados &&
    Boolean(metodoPago?.isEligible || pagoPendiente) &&
    (editable ? entregaConfirmada :
      esperandoPago && Boolean(entregaSeleccionada) && (!envioCorreo || pagoPendiente))

  async function cambiarTarifa(operacion) {
    if (solicitudEnCurso.current || !editable || !datosGuardados) return
    solicitudEnCurso.current = true
    setProcesando(true)
    setError('')
    try {
      const envio = await operacion()
      const actualizado = await obtenerPedidoCheckout()
      if (!actualizado || String(actualizado.id) !== String(pedido.id) || String(envio.pedidoId) !== String(pedido.id)) {
        throw new Error('El carrito cambió. Actualizá el resumen.')
      }
      aplicarDatosPedido(actualizado)
      setEnvioCorreo(envio)
      setDestinoCorreo(formularioDesdeEnvioCorreo(envio))
      setDatosGuardados(true)
      const opciones = await consultarOpciones(actualizado)
      setMetodoPago(opciones.pago)
      setAhora(Date.now())
    } catch (fallo) {
      setError(fallo.message || 'No pudimos actualizar el costo del envío.')
      // Conservar el error y bloquear el pago hasta volver a consultar el registro.
      setMetodoPago(null)
    } finally {
      solicitudEnCurso.current = false
      setProcesando(false)
    }
  }

  async function volverACotizar() {
    if (solicitudEnCurso.current || ocupado || !pedido) return
    solicitudEnCurso.current = true
    setProcesando(true)
    setError('')
    try {
      await recuperarCarritoParaEditar(pedido.id)
      setRevision(actual => actual + 1)
    } catch (fallo) { setError(fallo.message || 'No pudimos recuperar el pedido para cotizar.') }
    finally { solicitudEnCurso.current = false; setProcesando(false) }
  }

  async function pagar() {
    if (
      solicitudEnCurso.current ||
      !puedePagar ||
      ocupado
    ) {
      return
    }

    solicitudEnCurso.current = true
    setProcesando(true)
    setError('')

    try {
      if (editable && modalidadEntrega === 'correo' && envioCorreo) await verificarTarifaCorreo()
      const resultado = await iniciarPagoMercadoPago({
        codigoMetodo: CODIGO_MERCADO_PAGO,
        pedidoId: pedido.id,
        totalConfirmado: pedido.totalWithTax,
      })

      setPedido(resultado.pedido)
      window.location.assign(resultado.checkoutUrl)
    } catch (fallo) {
      setError(
        fallo.message || 'No pudimos iniciar el pago.',
      )

      try {
        const actualizado = await obtenerPedidoCheckout()

        if (actualizado) {
          setPedido(actualizado)
        }
      } catch {
        // El botón Actualizar resumen permite reintentarlo.
      }
    } finally {
      solicitudEnCurso.current = false
      setProcesando(false)
    }
  }

  function seguirComprando() {
    if (confirmado) {
      olvidarCodigoPedidoPago()
    }
  }

  return (
    <main className="finalizar-compra seccion">
      <Contenedor>
        <header className="finalizar-compra__encabezado">
          <h1>
            {esRetornoPago
              ? confirmado
                ? 'Compra confirmada'
                : 'Estado de tu compra'
              : 'Finalizar compra'}
          </h1>

          <p>
            {esRetornoPago
              ? confirmado
                ? 'Recibimos tu pago. Estos son los datos de tu compra.'
                : 'Consultamos el estado de tu pedido para verificar el pago.'
              : 'Completá tus datos y elegí cómo recibir tu pedido.'}
          </p>
        </header>

        {error && (
          <p
            className="finalizar-compra__mensaje"
            role="alert"
          >
            {error}
          </p>
        )}

        {cargando ? (
          <p role="status">
            {esRetornoPago
              ? 'Consultando el estado de tu compra...'
              : 'Cargando tu compra...'}
          </p>
        ) : esRetornoPago && consultaRetornoPendiente && !pedido ? (
          <section className="finalizar-compra__panel" role="status" aria-live="polite">
            <h2>Estamos verificando tu pago</h2>
            <p>La confirmación puede tardar unos minutos. Consultamos el estado automáticamente; no vuelvas a pagar ni cierres esta página.</p>
          </section>
        ) : esRetornoPago && !pedido ? (
          <section className="finalizar-compra__vacio">
            <h2>No pudimos recuperar tu compra</h2>
            <p>
              No vuelvas a pagar. Podés reintentar la consulta
              con la misma sesión de tienda.
            </p>

            <Boton
              onClick={actualizarResumen}
              disabled={ocupado}
            >
              Consultar de nuevo
            </Boton>

            <Link to="/">Volver a la tienda</Link>
          </section>
        ) : !tieneProductos ? (
          <section className="finalizar-compra__vacio">
            <h2>No hay productos en tu carrito</h2>
            <Link to="/">Volver a la tienda</Link>
          </section>
        ) : (
          <div className="finalizar-compra__grilla">
            <div className="finalizar-compra__datos">
              {esRetornoPago && (
                <section
                  className="finalizar-compra__panel"
                  role="status"
                  aria-live="polite"
                >
                  <h2>
                    {confirmado
                      ? 'Tu pago está confirmado'
                      : pagoCerrado
                        ? 'El pago no quedó acreditado'
                        : 'Estamos verificando tu pago'}
                  </h2>

                  <p>
                    {confirmado
                      ? 'Tu pedido quedó registrado correctamente.'
                      : pagoCerrado
                        ? 'Vendure informa que el pago o el pedido se cerró sin acreditación. Consultá el pedido antes de iniciar otro pago.'
                        : verificacionAgotada
                          ? 'Todavía no recibimos la confirmación. No vuelvas a pagar; usá Actualizar estado para consultar de nuevo.'
                          : 'La confirmación puede tardar unos momentos. Estamos actualizando el estado automáticamente; no vuelvas a pagar.'}
                  </p>
                </section>
              )}

              {editable ? (
                <form onSubmit={guardarDatos}>
                  <fieldset disabled={ocupado}>
                    <legend>Datos del comprador</legend>

                    <div className="finalizar-compra__campos">
                      <div className="estructura__campo">
                        <label htmlFor="compra-nombre">
                          Nombre
                        </label>
                        <input
                          id="compra-nombre"
                          name="nombre"
                          autoComplete="given-name"
                          value={comprador.nombre}
                          onChange={cambiarComprador}
                          maxLength={100}
                          required
                        />
                      </div>

                      <div className="estructura__campo">
                        <label htmlFor="compra-apellido">
                          Apellido
                        </label>
                        <input
                          id="compra-apellido"
                          name="apellido"
                          autoComplete="family-name"
                          value={comprador.apellido}
                          onChange={cambiarComprador}
                          maxLength={100}
                          required
                        />
                      </div>

                      <div className="estructura__campo">
                        <label htmlFor="compra-email">
                          Email
                        </label>
                        <input
                          id="compra-email"
                          name="email"
                          type="email"
                          autoComplete="email"
                          value={comprador.email}
                          onChange={cambiarComprador}
                          maxLength={254}
                          required
                        />
                      </div>

                      <div className="estructura__campo">
                        <label htmlFor="compra-telefono">
                          Teléfono
                        </label>
                        <input
                          id="compra-telefono"
                          name="telefono"
                          type="tel"
                          autoComplete="tel"
                          value={comprador.telefono}
                          onChange={cambiarComprador}
                          maxLength={30}
                          required
                        />
                      </div>
                    </div>
                  </fieldset>

                  <fieldset disabled={ocupado}>
                    <legend>Forma de entrega</legend>
                    <div className="estructura__campo">
                      <label htmlFor="forma-entrega">¿Cómo querés recibir tu compra?</label>
                      <select id="forma-entrega" value={modalidadEntrega} onChange={evento => {
                        setModalidadEntrega(evento.target.value)
                        invalidarDatosGuardados()
                      }}>
                        <option value="correo">Envío por Correo Argentino</option>
                        <option value="local">Retiro en el local — sin cargo</option>
                      </select>
                    </div>
                    {modalidadEntrega === 'local' && <p>Retirá en Pinto 680, Tandil, Buenos Aires. Sin costo de entrega.</p>}
                  </fieldset>

                  {modalidadEntrega === 'correo' && <FormularioEnvioCorreo
                    valor={destinoCorreo}
                    onCambiar={valor => {
                      setDestinoCorreo(valor)
                      invalidarDatosGuardados()
                    }}
                    deshabilitado={ocupado}
                  />}

                  <Boton type="submit" disabled={ocupado ||
                    (modalidadEntrega === 'correo' && destinoCorreo.modalidad === 'S' && !destinoCorreo.codigoSucursal)}>
                    {procesando
                      ? 'Procesando...'
                      : 'Guardar datos y entrega'}
                  </Boton>
                </form>
              ) : (
                <section className="finalizar-compra__panel">
                  <h2>Datos del pedido</h2>
                  <p>
                    {comprador.nombre} {comprador.apellido}
                  </p>
                  <p>{comprador.email}</p>
                  <p>{direccion.calle}</p>

                  {direccion.departamento && (
                    <p>{direccion.departamento}</p>
                  )}

                  <p>
                    {direccion.ciudad}, {direccion.provincia}
                  </p>

                  {esRetornoPago ? (
                    <p>
                      Entrega:{' '}
                      {pedido.shippingLines
                        ?.map(linea => linea.shippingMethod?.name)
                        .filter(Boolean)
                        .join(' · ') || 'Sin método informado'}
                    </p>
                  ) : esperandoPago ? (
                    <p>Tu pedido está preparado para el pago.</p>
                  ) : (
                    <p>
                      El estado actual del pedido no permite
                      iniciar un nuevo pago desde esta página.
                    </p>
                  )}
                </section>
              )}

              {editable && modalidadEntrega === 'correo' && (
                <section className="finalizar-compra__panel" aria-live="polite">
                  <h2>Envío por Correo Argentino</h2>
                  {datosGuardados && envioCorreo ? (
                    <>
                      <p>Destino guardado para este pedido.</p>
                      <p>{envioCorreo.modalidad === 'S'
                        ? `Retiro en sucursal: ${envioCorreo.sucursal?.nombre || ''}`
                        : 'Entrega a domicilio'}</p>
                      <p>{envioCorreo.destino.calle} {envioCorreo.destino.numero}, {' '}
                        {envioCorreo.destino.localidad} — {envioCorreo.destino.codigoPostal}</p>
                    </>
                  ) : <p>Completá y guardá tus datos y el destino del envío.</p>}
                  <p>El servicio elegido y su precio se confirman antes de pagar.</p>
                </section>
              )}
              {editable && modalidadEntrega === 'local' && datosGuardados && retiroConfirmado && (
                <section className="finalizar-compra__panel"><h2>Retiro en el local</h2>
                  <p>Pinto 680, Tandil, Buenos Aires. Entrega sin cargo.</p>
                </section>
              )}
              {editable && modalidadEntrega === 'correo' && datosGuardados && envioCorreo && (
                <CotizacionEnvioCorreo envio={envioCorreo} ocupado={ocupado} ahora={ahora}
                  formatoPrecio={mostrarPrecio}
                  onCotizar={() => cambiarTarifa(() => cotizarEnvioCorreo(envioCorreo))}
                  onSeleccionar={producto => producto && cambiarTarifa(() => seleccionarTarifaCorreo(envioCorreo, producto))}
                />
              )}
              {esperandoPago && envioCorreo && !pagoPendiente && (
                <section className="finalizar-compra__panel">
                  <p>El pago no llegó a iniciarse. Podés volver a revisar la cotización del envío.</p>
                  <Boton onClick={volverACotizar} disabled={ocupado}>Volver a cotizar</Boton>
                </section>
              )}
            </div>

            <aside
              className="finalizar-compra__resumen"
              aria-label="Resumen de compra"
              aria-busy={ocupado}
            >
              <h2>Tu compra</h2>
              <p>Pedido: {pedido.code}</p>

              <ul className="finalizar-compra__productos">
                {pedido.lines.map(linea => (
                  <li key={linea.id}>
                    <h3>{linea.productVariant.product.name}</h3>
                    <p>
                      {opcionesVariante(linea.productVariant)}
                    </p>
                    <p>
                      {linea.quantity}{' '}
                      {linea.quantity === 1
                        ? 'unidad'
                        : 'unidades'}
                      {' × '}
                      {mostrarPrecio(
                        linea.discountedUnitPriceWithTax,
                      )}
                    </p>
                    <strong>
                      {mostrarPrecio(
                        linea.discountedLinePriceWithTax,
                      )}
                    </strong>
                  </li>
                ))}
              </ul>

              <dl className="finalizar-compra__totales">
                <div>
                  <dt>Subtotal</dt>
                  <dd>
                    {mostrarPrecio(pedido.subTotalWithTax)}
                  </dd>
                </div>

                <div>
                  <dt>Entrega</dt>
                  <dd>
                    {editable ? (datosGuardados && entregaConfirmada ? mostrarPrecio(pedido.shippingWithTax) : modalidadEntrega === 'local' ? 'A confirmar' : 'Pendiente de cotización') :
                      esRetornoPago || entregaSeleccionada
                        ? mostrarPrecio(pedido.shippingWithTax) : 'A seleccionar'}
                  </dd>
                </div>

                <div>
                  <dt>
                    {esRetornoPago
                      ? confirmado
                        ? 'Total pagado'
                        : 'Total del pedido'
                      : (editable ? datosGuardados && entregaConfirmada : entregaSeleccionada)
                        ? 'Total'
                        : 'Total sin entrega'}
                  </dt>
                  <dd>
                    {mostrarPrecio(editable && !(datosGuardados && entregaConfirmada)
                      ? pedido.totalWithTax - pedido.shippingWithTax
                      : pedido.totalWithTax)}
                  </dd>
                </div>
              </dl>

              {esRetornoPago ? (
                <>
                  {!confirmado && (
                    <Boton
                      variante="secundario"
                      onClick={actualizarResumen}
                      disabled={ocupado}
                    >
                      Actualizar estado
                    </Boton>
                  )}

                  <Link
                    to="/"
                    className="boton"
                    onClick={seguirComprando}
                  >
                    Seguir comprando
                  </Link>
                </>
              ) : (
                <>
                  {!datosGuardados && editable && (
                    <p>Guardá tus datos para continuar.</p>
                  )}

                  {datosGuardados &&
                    !entregaConfirmada &&
                    editable && (
                      <p>{modalidadEntrega === 'local' ? 'Guardá tus datos y confirmá el retiro antes de pagar.' : 'El envío necesita una tarifa confirmada antes de pagar.'}</p>
                    )}

                  {datosGuardados &&
                    entregaSeleccionada &&
                    !metodoPago?.isEligible &&
                    !pagoPendiente && (
                      <p>
                        Mercado Pago no está disponible para
                        este pedido.
                      </p>
                    )}

                  <Boton
                    onClick={pagar}
                    disabled={ocupado || !puedePagar}
                  >
                    {procesando
                      ? 'Procesando...'
                      : editable && !entregaConfirmada
                        ? modalidadEntrega === 'local' ? 'Confirmá el retiro en el local' : 'Envío pendiente de cotización'
                        : pagoPendiente
                          ? 'Continuar pago en Mercado Pago'
                          : 'Pagar con Mercado Pago'}
                  </Boton>

                  <Boton
                    variante="secundario"
                    onClick={actualizarResumen}
                    disabled={ocupado}
                  >
                    Actualizar resumen
                  </Boton>
                </>
              )}
            </aside>
          </div>
        )}
      </Contenedor>
    </main>
  )
}

export default FinalizarCompra