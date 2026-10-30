
import { useId, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import Boton from '../../componentesReuse/Boton'

const formatoPrecio = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
})

function ProductoCard({
  producto,
  alAgregarAlCarrito,
  cargandoCarrito = false,
}) {
  const { genero } = useParams()

  const [imagenFallida, setImagenFallida] = useState(null)
  const [indiceImagen, setIndiceImagen] = useState(0)
  const [selectorAbierto, setSelectorAbierto] = useState(false)
  const [varianteSeleccionadaId, setVarianteSeleccionadaId] =
    useState('')
  const [agregando, setAgregando] = useState(false)
  const [error, setError] = useState('')

  const solicitudEnCurso = useRef(false)
  const selectorId = useId()

  const variantesDisponibles = (producto.variantes || [])
    .filter(variante => variante.disponible === true)

  const varianteSeleccionada =
    variantesDisponibles.find(
      variante =>
        String(variante.id) === varianteSeleccionadaId,
    ) || variantesDisponibles[0] || null

  const tieneStock =
    producto.disponible !== false &&
    variantesDisponibles.length > 0

  const imagenes = producto.imagenes?.length
    ? producto.imagenes
    : producto.imagen
      ? [producto.imagen]
      : []

  const indiceActual =
    indiceImagen % Math.max(imagenes.length, 1)

  const imagen = imagenes[indiceActual] || null
  const mostrarImagen = imagen && imagenFallida !== imagen

  const precio = selectorAbierto
    ? varianteSeleccionada?.precio
    : producto.precioDesde

  // Algunas tarjetas agrupan talles con descuentos diferentes.
  // En ese caso mostramos la variante ofertada más económica;
  // al elegir un talle, mostramos solo su descuento real.
  const variantesEnOferta = (producto.variantes || [])
    .filter(variante =>
      Number.isInteger(variante.descuentoPorcentaje) &&
      variante.descuentoPorcentaje > 0 &&
      Number.isFinite(variante.precioOfertaEstimado) &&
      variante.precioOfertaEstimado < variante.precio,
    )
    .sort((a, b) =>
      a.precioOfertaEstimado - b.precioOfertaEstimado,
    )

  const ofertaRepresentativa = variantesEnOferta[0] || null
  const usaOfertaDeVariante =
    !selectorAbierto &&
    producto.descuentoPorcentaje == null &&
    ofertaRepresentativa !== null

  const precioOriginalMostrado = usaOfertaDeVariante
    ? ofertaRepresentativa.precio
    : precio

  const descuentoPorcentaje = selectorAbierto
    ? varianteSeleccionada?.descuentoPorcentaje
    : usaOfertaDeVariante
      ? ofertaRepresentativa.descuentoPorcentaje
      : producto.descuentoPorcentaje

  const precioOferta = selectorAbierto
    ? varianteSeleccionada?.precioOfertaEstimado
    : usaOfertaDeVariante
      ? ofertaRepresentativa.precioOfertaEstimado
      : producto.precioOfertaDesdeEstimado

  const tieneOferta =
    Number.isInteger(descuentoPorcentaje) &&
    descuentoPorcentaje > 0 &&
    Number.isFinite(precioOferta) &&
    Number.isFinite(precioOriginalMostrado) &&
    precioOferta < precioOriginalMostrado

  const tienePrecio = Number.isFinite(precio)

  const mostrarDesde =
    !selectorAbierto && producto.preciosDiferentes

  const ocupado = agregando || cargandoCarrito

  const compraHabilitada =
    tieneStock &&
    tienePrecio &&
    typeof alAgregarAlCarrito === 'function'

  const rutaDetalle =
    genero && producto.productoId
      ? `/${genero}/producto/${producto.productoId}`
      : null

  function cambiarImagen(direccion) {
    if (imagenes.length <= 1) return

    setIndiceImagen(indice =>
      (indice + direccion + imagenes.length) %
      imagenes.length,
    )

    setImagenFallida(null)
  }

  function cambiarTalle(evento) {
    setVarianteSeleccionadaId(evento.target.value)
    setError('')
  }

  async function manejarCompra() {
    if (
      !compraHabilitada ||
      ocupado ||
      solicitudEnCurso.current
    ) {
      return
    }

    setError('')

    if (!selectorAbierto) {
      setVarianteSeleccionadaId(
        String(variantesDisponibles[0].id),
      )
      setSelectorAbierto(true)
      return
    }

    if (!varianteSeleccionada) {
      setError('Seleccioná un talle disponible.')
      return
    }

    solicitudEnCurso.current = true
    setAgregando(true)

    try {
      await alAgregarAlCarrito(varianteSeleccionada.id)

      setSelectorAbierto(false)
      setVarianteSeleccionadaId('')
    } catch (fallo) {
      setError(
        fallo.message || 'No pudimos agregar el producto.',
      )
    } finally {
      solicitudEnCurso.current = false
      setAgregando(false)
    }
  }

  const contenidoImagen = mostrarImagen ? (
    <img
      src={imagen}
      alt={producto.imagenAlt || producto.nombre}
      loading="lazy"
      decoding="async"
      onError={() => setImagenFallida(imagen)}
    />
  ) : (
    <span className="texto-etiqueta">
      Sin imagen
    </span>
  )

  return (
    <article className="tarjeta producto-card">
      <div className="producto-card__imagen">
        {rutaDetalle ? (
          <Link
            to={rutaDetalle}
            className="producto-card__enlace-imagen"
            aria-label={`Ver detalle de ${producto.nombre}, color ${producto.color || 'único'}`}
          >
            {contenidoImagen}
          </Link>
        ) : (
          contenidoImagen
        )}

        {imagenes.length > 1 && (
          <div
            className="producto-card__navegacion"
            role="group"
            aria-label={`Fotografías de ${producto.nombre}`}
          >
            <button
              type="button"
              aria-label="Fotografía anterior"
              onClick={() => cambiarImagen(-1)}
            >
              ‹
            </button>

            <button
              type="button"
              aria-label="Fotografía siguiente"
              onClick={() => cambiarImagen(1)}
            >
              ›
            </button>
          </div>
        )}

        <div className="producto-card__compra">
          {selectorAbierto && tieneStock && (
            <div className="estructura__campo producto-card__talles">
              <label htmlFor={selectorId}>
                Talle
              </label>

              <select
                id={selectorId}
                value={
                  varianteSeleccionada
                    ? String(varianteSeleccionada.id)
                    : ''
                }
                onChange={cambiarTalle}
                disabled={ocupado}
              >
                {variantesDisponibles.map(variante => (
                  <option
                    key={variante.id}
                    value={String(variante.id)}
                  >
                    {variante.talle || 'Único'}
                  </option>
                ))}
              </select>
            </div>
          )}

          <Boton
            onClick={manejarCompra}
            disabled={!compraHabilitada || ocupado}
            aria-expanded={selectorAbierto}
          >
            {agregando
              ? 'Agregando...'
              : !tieneStock
                ? 'Sin stock'
                : 'Agregar al carrito'}
          </Boton>
        </div>
      </div>

      <div className="producto-card__info">
        {producto.marca && (
          <span className="texto-etiqueta">
            {producto.marca}
          </span>
        )}

        <h2>
          {rutaDetalle ? (
            <Link
              to={rutaDetalle}
              className="producto-card__enlace-nombre"
            >
              {producto.nombre}
            </Link>
          ) : (
            producto.nombre
          )}
        </h2>

        {producto.color && (
          <span className="texto-etiqueta">
            Color: {producto.color}
          </span>
        )}

        <p aria-live="polite" aria-atomic="true">
          {tienePrecio ? (
            tieneOferta ? (
              <>
                <span
                  style={{
                    display: 'inline-block',
                    color: '#B5121B',
                    fontSize: 'clamp(1.05rem, 2.5vw, 1.3rem)',
                    fontWeight: 700,
                    lineHeight: 1.3,
                    marginRight: '0.5rem',
                  }}
                >
                  {(mostrarDesde || usaOfertaDeVariante) ? 'Desde ' : ''}
                  {formatoPrecio.format(precioOferta)}
                </span>
                <del
                  style={{
                    color: '#858585',
                    fontSize: '0.78rem',
                    fontWeight: 400,
                    marginRight: '0.5rem',
                  }}
                >
                  {formatoPrecio.format(precioOriginalMostrado)}
                </del>
                <span
                  style={{
                    display: 'inline-block',
                    backgroundColor: '#922F2F',
                    color: '#FFFFFF',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    padding: '0.25rem 0.4rem',
                    whiteSpace: 'nowrap',
                  }}
                >
                  -{descuentoPorcentaje}%
                </span>
              </>
            ) : (
              `${mostrarDesde ? 'Desde ' : ''}${formatoPrecio.format(precio)}`
            )
          ) : (
            'Precio no disponible'
          )}
        </p>

        {!tieneStock && (
          <span className="texto-etiqueta">
            Sin stock
          </span>
        )}

        {error && <p role="alert">{error}</p>}
      </div>
    </article>
  )
}

export default ProductoCard
