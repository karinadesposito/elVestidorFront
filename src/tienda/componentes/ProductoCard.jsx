import { useId, useRef, useState } from 'react'

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
  const [imagenFallida, setImagenFallida] = useState(null)
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

  const imagen =
    selectorAbierto && varianteSeleccionada?.imagen
      ? varianteSeleccionada.imagen
      : producto.imagen

  const mostrarImagen = imagen && imagenFallida !== imagen

  const precio = selectorAbierto
    ? varianteSeleccionada?.precio
    : producto.precioDesde

  const tienePrecio = Number.isFinite(precio)
  const mostrarDesde =
    !selectorAbierto && producto.preciosDiferentes

  const ocupado = agregando || cargandoCarrito

  const compraHabilitada =
    tieneStock &&
    tienePrecio &&
    typeof alAgregarAlCarrito === 'function'

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

  return (
    <article className="tarjeta producto-card">
      <div className="producto-card__imagen">
        {mostrarImagen ? (
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

        <h2>{producto.nombre}</h2>

        {producto.color && (
          <span className="texto-etiqueta">
            Color: {producto.color}
          </span>
        )}

        <p aria-live="polite" aria-atomic="true">
          {tienePrecio
            ? `${mostrarDesde ? 'Desde ' : ''}${formatoPrecio.format(precio)}`
            : 'Precio no disponible'}
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