
import { useEffect, useState } from 'react'
import {
  Link,
  useOutletContext,
  useParams,
} from 'react-router-dom'

import Boton from '../../componentesReuse/Boton'
import { obtenerDetalleProducto } from '../../servicios/catalogoService'

import '../../estilos/DetalleProducto.css'

const formatoPrecio = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
})

function DetalleProducto() {
  const { genero, productoId } = useParams()

  const {
    agregarProductoAlCarrito,
    cargandoCarrito,
  } = useOutletContext()

  const [producto, setProducto] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [errorCarga, setErrorCarga] = useState('')

  const [colorId, setColorId] = useState('')
  const [talleId, setTalleId] = useState('')
  const [indiceImagen, setIndiceImagen] = useState(0)
  const [cantidad, setCantidad] = useState(1)

  const [agregando, setAgregando] = useState(false)
  const [errorCompra, setErrorCompra] = useState('')

  useEffect(() => {
    let activo = true

    async function cargarProducto() {
      setCargando(true)
      setErrorCarga('')
      setProducto(null)

      try {
        const resultado = await obtenerDetalleProducto(productoId)

        if (!activo) return

        setProducto(resultado)

        const primerColor =
          resultado.colores.find(color => color.disponible) ||
          resultado.colores[0]

        setColorId(
          primerColor
            ? String(primerColor.id ?? 'unico')
            : '',
        )

        setTalleId('')
        setIndiceImagen(0)
        setCantidad(1)
        setErrorCompra('')
      } catch (fallo) {
        if (activo) {
          setErrorCarga(
            fallo.message || 'No pudimos cargar el producto.',
          )
        }
      } finally {
        if (activo) {
          setCargando(false)
        }
      }
    }

    cargarProducto()

    return () => {
      activo = false
    }
  }, [productoId])

  const colorSeleccionado = producto?.colores.find(
    color => String(color.id ?? 'unico') === colorId,
  ) || null

  const variantesColor = colorSeleccionado?.variantes || []

  const tallesDisponibles = variantesColor.filter(
    variante => variante.disponible,
  )

  const varianteSeleccionada =
    variantesColor.find(
      variante =>
        String(variante.talleId ?? variante.id) === talleId,
    ) || null

  const imagenes = colorSeleccionado?.imagenes?.length
    ? colorSeleccionado.imagenes
    : producto?.imagenes || []

  const indiceActual =
    indiceImagen % Math.max(imagenes.length, 1)

  const imagenActual = imagenes[indiceActual] || null

  const precioReferencia =
    varianteSeleccionada ||
    tallesDisponibles[0] ||
    variantesColor[0]

  const disponible = Boolean(
    varianteSeleccionada?.disponible,
  )

  function seleccionarColor(nuevoColorId) {
    setColorId(nuevoColorId)
    setTalleId('')
    setIndiceImagen(0)
    setCantidad(1)
    setErrorCompra('')
  }

  function seleccionarTalle(nuevoTalleId) {
    setTalleId(nuevoTalleId)
    setCantidad(1)
    setErrorCompra('')
  }

  function cambiarImagen(direccion) {
    if (imagenes.length <= 1) return

    setIndiceImagen(actual =>
      (actual + direccion + imagenes.length) %
      imagenes.length,
    )
  }

  function cambiarCantidad(direccion) {
    setCantidad(actual => Math.max(1, actual + direccion))
    setErrorCompra('')
  }

  async function agregarProducto() {
    if (agregando || cargandoCarrito) return

    if (!varianteSeleccionada) {
      setErrorCompra('Seleccioná un talle.')
      return
    }

    if (!disponible) {
      setErrorCompra('El talle seleccionado no tiene stock.')
      return
    }

    setAgregando(true)
    setErrorCompra('')

    try {
      await agregarProductoAlCarrito(
        varianteSeleccionada.id,
        cantidad,
      )
    } catch (fallo) {
      setErrorCompra(
        fallo.message || 'No pudimos agregar el producto.',
      )
    } finally {
      setAgregando(false)
    }
  }

  if (cargando) {
    return (
      <main className="detalle-producto">
        <div className="detalle-producto__contenedor">
          <p role="status">Cargando producto...</p>
        </div>
      </main>
    )
  }

  if (errorCarga || !producto) {
    return (
      <main className="detalle-producto">
        <div className="detalle-producto__contenedor">
          <p role="alert">
            {errorCarga || 'Producto no encontrado.'}
          </p>

          <Link to={`/${genero}`}>
            Volver al catálogo
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="detalle-producto">
      <div className="detalle-producto__contenedor">
        <nav
          className="detalle-producto__migas"
          aria-label="Ruta de navegación"
        >
          <Link to="/">Inicio</Link>
          <span aria-hidden="true">/</span>
          <Link to={`/${genero}`}>
            {genero}
          </Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">
            {producto.nombre}
          </span>
        </nav>

        <div className="detalle-producto__principal">
          <section
            className="detalle-producto__galeria"
            aria-label="Fotografías del producto"
          >
            <div className="detalle-producto__imagen-principal">
              {imagenActual ? (
                <img
                  src={imagenActual.url}
                  alt={`${producto.nombre} - ${colorSeleccionado?.nombre || ''}`}
                />
              ) : (
                <span>Sin imagen</span>
              )}

              {imagenes.length > 1 && (
                <div className="detalle-producto__flechas">
                  <button
                    type="button"
                    onClick={() => cambiarImagen(-1)}
                    aria-label="Fotografía anterior"
                  >
                    ‹
                  </button>

                  <button
                    type="button"
                    onClick={() => cambiarImagen(1)}
                    aria-label="Fotografía siguiente"
                  >
                    ›
                  </button>
                </div>
              )}
            </div>

            {imagenes.length > 1 && (
              <div className="detalle-producto__miniaturas">
                {imagenes.map((imagen, indice) => (
                  <button
                    key={`${imagen.id}-${indice}`}
                    type="button"
                    className={
                      indice === indiceActual
                        ? 'detalle-producto__miniatura detalle-producto__miniatura--activa'
                        : 'detalle-producto__miniatura'
                    }
                    onClick={() => setIndiceImagen(indice)}
                    aria-label={`Ver fotografía ${indice + 1}`}
                    aria-pressed={indice === indiceActual}
                  >
                    <img
                      src={imagen.url}
                      alt=""
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
            )}
          </section>

          <section className="detalle-producto__informacion">
            <h1>{producto.nombre}</h1>

            {precioReferencia && (
              <p className="detalle-producto__precio">
                {formatoPrecio.format(precioReferencia.precio)}
              </p>
            )}

            <div className="detalle-producto__campo">
              <h2>Color</h2>

              <div className="detalle-producto__opciones">
                {producto.colores.map(color => {
                  const id = String(color.id ?? 'unico')

                  return (
                    <button
                      key={id}
                      type="button"
                      className={
                        id === colorId
                          ? 'detalle-producto__opcion detalle-producto__opcion--activa'
                          : 'detalle-producto__opcion'
                      }
                      onClick={() => seleccionarColor(id)}
                      aria-pressed={id === colorId}
                    >
                      {color.nombre}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="detalle-producto__campo">
              <h2>Talle</h2>

              <div className="detalle-producto__opciones">
                {variantesColor.map(variante => {
                  const id = String(
                    variante.talleId ?? variante.id,
                  )

                  return (
                    <button
                      key={variante.id}
                      type="button"
                      className={
                        id === talleId
                          ? 'detalle-producto__opcion detalle-producto__opcion--activa'
                          : 'detalle-producto__opcion'
                      }
                      onClick={() => seleccionarTalle(id)}
                      disabled={!variante.disponible}
                      aria-pressed={id === talleId}
                    >
                      {variante.talle}
                    </button>
                  )
                })}
              </div>

              {tallesDisponibles.length === 0 && (
                <p className="detalle-producto__sin-stock">
                  No hay talles disponibles para este color.
                </p>
              )}
            </div>

            <div className="detalle-producto__campo">
              <h2>Cantidad</h2>

              <div className="detalle-producto__cantidad">
                <button
                  type="button"
                  onClick={() => cambiarCantidad(-1)}
                  disabled={cantidad <= 1}
                  aria-label="Disminuir cantidad"
                >
                  −
                </button>

                <output aria-live="polite">
                  {cantidad}
                </output>

                <button
                  type="button"
                  onClick={() => cambiarCantidad(1)}
                  disabled={!disponible}
                  aria-label="Aumentar cantidad"
                >
                  +
                </button>
              </div>
            </div>

            <Boton
              onClick={agregarProducto}
              disabled={
                !disponible ||
                agregando ||
                cargandoCarrito
              }
            >
              {agregando
                ? 'Agregando...'
                : 'Agregar al carrito'}
            </Boton>

            {errorCompra && (
              <p role="alert" className="detalle-producto__error">
                {errorCompra}
              </p>
            )}

            {producto.descripcion && (
              <div className="detalle-producto__descripcion">
                <h2>Descripción</h2>
                <div>{producto.descripcion}</div>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  )
}

export default DetalleProducto
