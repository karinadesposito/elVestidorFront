import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

import Contenedor from '../../componentesReuse/Contenedor'
import Boton from '../../componentesReuse/Boton'

import {
  obtenerPedidoCheckout,
  guardarDatosCheckout,
  obtenerMetodosEntrega,
  seleccionarMetodoEntrega,
  obtenerMetodosPago,
  iniciarPagoMercadoPago,
} from '../../servicios/checkoutService'

import '../../estilos/FinalizarCompra.css'

const CODIGO_MERCADO_PAGO = 'mercado-pago-checkout-pro'

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

function FinalizarCompra() {
  const [pedido, setPedido] = useState(null)
  const [comprador, setComprador] = useState(COMPRADOR_INICIAL)
  const [direccion, setDireccion] = useState(DIRECCION_INICIAL)
  const [metodosEntrega, setMetodosEntrega] = useState([])
  const [entregaSeleccionada, setEntregaSeleccionada] = useState('')
  const [metodoPago, setMetodoPago] = useState(null)
  const [datosGuardados, setDatosGuardados] = useState(false)
  const [cargando, setCargando] = useState(true)
  const [procesando, setProcesando] = useState(false)
  const [error, setError] = useState('')

  const solicitudEnCurso = useRef(false)

  const editable = pedido?.state === 'AddingItems'
  const esperandoPago = pedido?.state === 'ArrangingPayment'
  const ocupado = cargando || procesando
  const tieneProductos = Boolean(pedido?.totalQuantity > 0)

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
      setMetodosEntrega([])
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
      return {
        entregas: [],
        pago: null,
      }
    }

    const puedeConsultarEntregas =
      resultado.state === 'AddingItems' &&
      resultado.customer &&
      resultado.shippingAddress?.streetLine1

    const entregas = puedeConsultarEntregas
      ? await obtenerMetodosEntrega()
      : []

    const pagos = await obtenerMetodosPago()

    return {
      entregas,
      pago:
        pagos.find(
          metodo => metodo.code === CODIGO_MERCADO_PAGO,
        ) || null,
    }
  }

  useEffect(() => {
    let activo = true

    async function cargarCheckout() {
      try {
        const resultado = await obtenerPedidoCheckout()

        if (!activo) {
          return
        }

        aplicarDatosPedido(resultado)

        const opciones = await consultarOpciones(resultado)

        if (activo) {
          setMetodosEntrega(opciones.entregas)
          setMetodoPago(opciones.pago)
        }
      } catch (fallo) {
        if (activo) {
          setError(
            fallo.message || 'No pudimos cargar tu compra.',
          )
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
    }
  }, [])

  function invalidarDatosGuardados() {
    setDatosGuardados(false)
    setMetodosEntrega([])
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

  function cambiarDireccion(evento) {
    const { name, value } = evento.target

    setDireccion(actual => ({
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
    setMetodosEntrega([])
    setEntregaSeleccionada('')
    setMetodoPago(null)
    setDatosGuardados(false)

    try {
      const resultado = await guardarDatosCheckout({
        comprador,
        direccion,
      })

      aplicarDatosPedido(resultado)

      const opciones = await consultarOpciones(resultado)

      setMetodosEntrega(opciones.entregas)
      setMetodoPago(opciones.pago)

      const entregaActual = String(
        resultado.shippingLines?.[0]?.shippingMethod?.id || '',
      )

      setEntregaSeleccionada(
        opciones.entregas.some(
          metodo => String(metodo.id) === entregaActual,
        )
          ? entregaActual
          : '',
      )
    } catch (fallo) {
      setError(
        fallo.message || 'No pudimos guardar tus datos.',
      )
    } finally {
      solicitudEnCurso.current = false
      setProcesando(false)
    }
  }

  async function elegirEntrega(evento) {
    const id = evento.target.value

    if (
      !id ||
      solicitudEnCurso.current ||
      !datosGuardados ||
      !editable
    ) {
      return
    }

    solicitudEnCurso.current = true
    setProcesando(true)
    setError('')

    try {
      const resultado = await seleccionarMetodoEntrega(id)
      setPedido(resultado)
      setEntregaSeleccionada(id)

      const pagos = await obtenerMetodosPago()

      setMetodoPago(
        pagos.find(
          metodo => metodo.code === CODIGO_MERCADO_PAGO,
        ) || null,
      )
    } catch (fallo) {
      setEntregaSeleccionada('')
      setMetodoPago(null)
      setError(
        fallo.message || 'No pudimos seleccionar la entrega.',
      )
    } finally {
      solicitudEnCurso.current = false
      setProcesando(false)
    }
  }

  async function actualizarResumen() {
    if (solicitudEnCurso.current) {
      return
    }

    solicitudEnCurso.current = true
    setProcesando(true)
    setError('')

    try {
      const resultado = await obtenerPedidoCheckout()
      aplicarDatosPedido(resultado)

      const opciones = await consultarOpciones(resultado)
      setMetodosEntrega(opciones.entregas)
      setMetodoPago(opciones.pago)

      if (resultado?.state === 'AddingItems') {
        const entregaActual = String(
          resultado.shippingLines?.[0]?.shippingMethod?.id || '',
        )

        setEntregaSeleccionada(
          opciones.entregas.some(
            metodo => String(metodo.id) === entregaActual,
          )
            ? entregaActual
            : '',
        )
      }
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
    tieneProductos &&
    (editable || esperandoPago) &&
    datosGuardados &&
    Boolean(entregaSeleccionada) &&
    Boolean(metodoPago?.isEligible || pagoPendiente)

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

      // Actualizamos el estado si el pedido ya pasó a pago.
      // Conservamos los datos escritos en el formulario.
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

  return (
    <main className="finalizar-compra seccion">
      <Contenedor>
        <header className="finalizar-compra__encabezado">
          <h1>Finalizar compra</h1>
          <p>Completá tus datos y elegí cómo recibir tu pedido.</p>
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
          <p role="status">Cargando tu compra...</p>
        ) : !tieneProductos ? (
          <section className="finalizar-compra__vacio">
            <h2>No hay productos en tu carrito</h2>
            <Link to="/">Volver a la tienda</Link>
          </section>
        ) : (
          <div className="finalizar-compra__grilla">
            <div className="finalizar-compra__datos">
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
                    <legend>Dirección de entrega</legend>

                    <div className="finalizar-compra__campos">
                      <div className="estructura__campo">
                        <label htmlFor="compra-calle">
                          Calle y número
                        </label>
                        <input
                          id="compra-calle"
                          name="calle"
                          autoComplete="address-line1"
                          value={direccion.calle}
                          onChange={cambiarDireccion}
                          maxLength={200}
                          required
                        />
                      </div>

                      <div className="estructura__campo">
                        <label htmlFor="compra-departamento">
                          Piso y departamento (opcional)
                        </label>
                        <input
                          id="compra-departamento"
                          name="departamento"
                          autoComplete="address-line2"
                          value={direccion.departamento}
                          onChange={cambiarDireccion}
                          maxLength={200}
                        />
                      </div>

                      <div className="estructura__campo">
                        <label htmlFor="compra-ciudad">
                          Ciudad
                        </label>
                        <input
                          id="compra-ciudad"
                          name="ciudad"
                          autoComplete="address-level2"
                          value={direccion.ciudad}
                          onChange={cambiarDireccion}
                          maxLength={100}
                          required
                        />
                      </div>

                      <div className="estructura__campo">
                        <label htmlFor="compra-provincia">
                          Provincia
                        </label>
                        <input
                          id="compra-provincia"
                          name="provincia"
                          autoComplete="address-level1"
                          value={direccion.provincia}
                          onChange={cambiarDireccion}
                          maxLength={100}
                          required
                        />
                      </div>

                      <div className="estructura__campo">
                        <label htmlFor="compra-codigo-postal">
                          Código postal
                        </label>
                        <input
                          id="compra-codigo-postal"
                          name="codigoPostal"
                          autoComplete="postal-code"
                          value={direccion.codigoPostal}
                          onChange={cambiarDireccion}
                          maxLength={12}
                          required
                        />
                      </div>
                    </div>
                  </fieldset>

                  <Boton type="submit" disabled={ocupado}>
                    {procesando
                      ? 'Procesando...'
                      : 'Guardar datos y consultar entrega'}
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

                  {esperandoPago ? (
                    <p>Tu pedido está preparado para el pago.</p>
                  ) : (
                    <p>
                      El estado actual del pedido no permite
                      iniciar un nuevo pago desde esta página.
                    </p>
                  )}
                </section>
              )}

              {editable && datosGuardados && (
                <section className="finalizar-compra__panel">
                  <h2>Forma de entrega</h2>

                  {metodosEntrega.length > 0 ? (
                    <div className="estructura__campo">
                      <label htmlFor="compra-entrega">
                        Elegí una opción
                      </label>

                      <select
                        id="compra-entrega"
                        value={entregaSeleccionada}
                        onChange={elegirEntrega}
                        disabled={ocupado}
                      >
                        <option value="" disabled>
                          Seleccionar entrega
                        </option>

                        {metodosEntrega.map(metodo => (
                          <option
                            key={metodo.id}
                            value={String(metodo.id)}
                          >
                            {metodo.name}
                            {' — '}
                            {mostrarPrecio(metodo.priceWithTax)}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <p>
                      No hay formas de entrega disponibles
                      para esta dirección.
                    </p>
                  )}
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
                    {entregaSeleccionada
                      ? mostrarPrecio(pedido.shippingWithTax)
                      : 'A seleccionar'}
                  </dd>
                </div>

                <div>
                  <dt>
                    {entregaSeleccionada
                      ? 'Total'
                      : 'Total sin entrega'}
                  </dt>
                  <dd>{mostrarPrecio(pedido.totalWithTax)}</dd>
                </div>
              </dl>

              {!datosGuardados && editable && (
                <p>Guardá tus datos para continuar.</p>
              )}

              {datosGuardados &&
                !entregaSeleccionada &&
                editable && (
                  <p>Seleccioná una forma de entrega.</p>
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
            </aside>
          </div>
        )}
      </Contenedor>
    </main>
  )
}

export default FinalizarCompra