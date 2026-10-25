
import { useEffect, useId, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiMinus, FiPlus, FiTrash2, FiX } from 'react-icons/fi'

import Boton from '../../componentesReuse/Boton'

import '../../estilos/CarritoLateral.css'

function ImagenCarrito({ imagen, nombre }) {
  const [imagenFallida, setImagenFallida] = useState(null)
  const mostrarImagen = imagen && imagenFallida !== imagen

  return (
    <div className="carrito-lateral__imagen">
      {mostrarImagen ? (
        <img
          src={imagen}
          alt={nombre}
          loading="lazy"
          decoding="async"
          onError={() => setImagenFallida(imagen)}
        />
      ) : (
        <span className="texto-etiqueta">Sin imagen</span>
      )}
    </div>
  )
}

function CarritoLateral({
  abierto = false,
  carrito = null,
  cargando = false,
  error = '',
  errorLinea = null,
  lineaEliminandoId = null,
  lineaActualizandoId = null,
  alEliminar,
  alCambiarCantidad,
  alCerrar,
}) {
  const navegar = useNavigate()
  const dialogo = useRef(null)
  const botonCerrar = useRef(null)
  const tituloId = useId()

  const lineas = carrito?.lineas || []
  const cantidadTotal = carrito?.cantidadTotal || 0

  const formatoPrecio = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: carrito?.moneda || 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })

  const permiteModificar = carrito?.estado === 'AddingItems'

  const permiteCheckout =
    lineas.length > 0 &&
    (
      carrito?.estado === 'AddingItems' ||
      carrito?.estado === 'ArrangingPayment'
    )

  useEffect(() => {
    if (!abierto) return

    const elemento = dialogo.current
    if (!elemento) return

    const raiz = document.documentElement
    const claseBloqueo = 'carrito-lateral-abierto'
    const yaEstabaBloqueado = raiz.classList.contains(claseBloqueo)

    raiz.classList.add(claseBloqueo)

    if (!elemento.open) elemento.showModal()

    botonCerrar.current?.focus()

    return () => {
      if (elemento.open) elemento.close()

      if (!yaEstabaBloqueado) {
        raiz.classList.remove(claseBloqueo)
      }
    }
  }, [abierto])

  function cerrar() {
    alCerrar?.()
  }

  function manejarEscape(evento) {
    evento.preventDefault()
    cerrar()
  }

  function irAPagar() {
    if (cargando || error || !permiteCheckout) return

    cerrar()
    navegar('/checkout')
  }

  async function eliminarLinea(lineaId) {
    if (
      cargando ||
      !permiteModificar ||
      typeof alEliminar !== 'function'
    ) {
      return
    }

    await alEliminar(lineaId)
  }

  function cambiarCantidad(linea, nuevaCantidad) {
    if (
      cargando ||
      !permiteModificar ||
      typeof alCambiarCantidad !== 'function' ||
      !Number.isInteger(nuevaCantidad) ||
      nuevaCantidad < 1 ||
      nuevaCantidad === linea.cantidad
    ) {
      return
    }

    alCambiarCantidad(linea.id, nuevaCantidad)
  }

  const estiloSelector = {
    display: 'inline-flex',
    alignItems: 'center',
    border: '1px solid currentColor',
    borderRadius: '4px',
    maxWidth: '100%',
    marginTop: '8px',
  }

  const estiloBotonCantidad = {
    display: 'grid',
    placeItems: 'center',
    width: '36px',
    height: '36px',
    border: '0',
    background: 'transparent',
    color: 'inherit',
    cursor: 'pointer',
  }

  const estiloCantidad = {
    minWidth: '32px',
    textAlign: 'center',
    fontSize: '14px',
    fontWeight: 600,
  }

  return (
    <dialog
      ref={dialogo}
      className="carrito-lateral"
      aria-labelledby={tituloId}
      onCancel={manejarEscape}
    >
      <button
        type="button"
        className="carrito-lateral__fondo"
        aria-label="Cerrar carrito"
        tabIndex={-1}
        onClick={cerrar}
      />

      <section
        className="carrito-lateral__panel"
        aria-busy={cargando}
      >
        <header className="carrito-lateral__encabezado">
          <div>
            <h2 id={tituloId}>Tu carrito</h2>
            <p aria-live="polite" aria-atomic="true">
              {cantidadTotal}{' '}
              {cantidadTotal === 1 ? 'unidad' : 'unidades'}
            </p>
          </div>

          <button
            ref={botonCerrar}
            type="button"
            className="boton boton--icono carrito-lateral__cerrar"
            aria-label="Cerrar carrito"
            onClick={cerrar}
          >
            <FiX aria-hidden="true" />
          </button>
        </header>

        <div className="carrito-lateral__contenido">
          {error && (
            <p className="carrito-lateral__mensaje" role="alert">
              {error}
            </p>
          )}

          {cargando && (
            <p className="carrito-lateral__mensaje" role="status">
              {lineaEliminandoId
                ? 'Eliminando producto...'
                : lineaActualizandoId
                  ? 'Actualizando cantidad...'
                  : 'Actualizando carrito...'}
            </p>
          )}

          {lineas.length > 0 ? (
            <ul className="carrito-lateral__lista">
              {lineas.map(linea => {
                const id = String(linea.id)
                const eliminando = id === lineaEliminandoId
                const actualizando = id === lineaActualizandoId
                const errorDeLinea =
                  errorLinea && String(errorLinea.id) === id

                const opciones = [
                  linea.color ? `Color: ${linea.color}` : '',
                  linea.talle ? `Talle: ${linea.talle}` : '',
                ].filter(Boolean)

                return (
                  <li
                    key={linea.id}
                    className="carrito-lateral__producto"
                    aria-busy={eliminando || actualizando}
                  >
                    <ImagenCarrito
                      imagen={linea.imagen}
                      nombre={linea.nombre}
                    />

                    <div className="carrito-lateral__datos">
                      <h3>{linea.nombre}</h3>

                      {opciones.length > 0 && (
                        <p>{opciones.join(' · ')}</p>
                      )}

                      <p>
                        Precio unitario:{' '}
                        {formatoPrecio.format(linea.precioUnitario)}
                      </p>

                      <div
                        role="group"
                        aria-label={`Cantidad de ${linea.nombre}`}
                        style={estiloSelector}
                      >
                        <button
                          type="button"
                          style={{
                            ...estiloBotonCantidad,
                            opacity:
                              cargando ||
                              !permiteModificar ||
                              linea.cantidad <= 1
                                ? 0.4
                                : 1,
                          }}
                          aria-label={`Restar una unidad de ${linea.nombre}`}
                          title="Restar una unidad"
                          disabled={
                            cargando ||
                            !permiteModificar ||
                            linea.cantidad <= 1
                          }
                          onClick={() =>
                            cambiarCantidad(
                              linea,
                              linea.cantidad - 1,
                            )
                          }
                        >
                          <FiMinus aria-hidden="true" />
                        </button>

                        <span
                          style={estiloCantidad}
                          aria-live="polite"
                          aria-atomic="true"
                        >
                          {linea.cantidad}
                        </span>

                        <button
                          type="button"
                          style={{
                            ...estiloBotonCantidad,
                            opacity:
                              cargando || !permiteModificar ? 0.4 : 1,
                          }}
                          aria-label={`Sumar una unidad de ${linea.nombre}`}
                          title="Sumar una unidad"
                          disabled={cargando || !permiteModificar}
                          onClick={() =>
                            cambiarCantidad(
                              linea,
                              linea.cantidad + 1,
                            )
                          }
                        >
                          <FiPlus aria-hidden="true" />
                        </button>
                      </div>

                      {errorDeLinea && (
                        <p
                          role="alert"
                          style={{
                            color: '#a52323',
                            fontWeight: 600,
                            marginTop: '6px',
                          }}
                        >
                          {errorLinea.mensaje}
                        </p>
                      )}

                      <p className="carrito-lateral__importe">
                        {formatoPrecio.format(linea.importe)}
                      </p>
                    </div>

                    <Boton
                      variante="icono"
                      className="carrito-lateral__eliminar"
                      aria-label={`Eliminar ${linea.nombre}${
                        linea.color ? `, color ${linea.color}` : ''
                      }${
                        linea.talle ? `, talle ${linea.talle}` : ''
                      } del carrito`}
                      title={
                        permiteModificar
                          ? 'Eliminar producto'
                          : 'El pedido ya está en proceso de pago'
                      }
                      disabled={
                        cargando ||
                        !permiteModificar ||
                        typeof alEliminar !== 'function'
                      }
                      onClick={() => eliminarLinea(linea.id)}
                    >
                      <FiTrash2 aria-hidden="true" />
                    </Boton>
                  </li>
                )
              })}
            </ul>
          ) : !cargando && !error ? (
            <div className="carrito-lateral__vacio">
              <h3>Tu carrito está vacío</h3>
              <p>Agregá productos para empezar tu compra.</p>
            </div>
          ) : null}
        </div>

        <footer className="carrito-lateral__pie">
          {lineas.length > 0 && (
            <>
              <div className="carrito-lateral__subtotal">
                <span>Subtotal</span>
                <strong>
                  {formatoPrecio.format(carrito.subtotal)}
                </strong>
              </div>

              <p>Envío calculado al finalizar la compra.</p>

              <Boton
                onClick={irAPagar}
                disabled={
                  cargando ||
                  Boolean(error) ||
                  Boolean(errorLinea) ||
                  !permiteCheckout
                }
              >
                Ir a pagar
              </Boton>
            </>
          )}

          <Boton variante="secundario" onClick={cerrar}>
            Seguir comprando
          </Boton>
        </footer>
      </section>
    </dialog>
  )
}

export default CarritoLateral
