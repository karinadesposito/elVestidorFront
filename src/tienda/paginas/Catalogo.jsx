
import { useEffect, useRef, useState } from 'react'
import { useOutletContext, useParams } from 'react-router-dom'

import Contenedor from '../../componentesReuse/Contenedor'
import Boton from '../../componentesReuse/Boton'
import ProductoCard from '../componentes/ProductoCard'

import {
  obtenerCatalogo,
  obtenerFiltrosCatalogo,
} from '../../servicios/catalogoService'

import '../../estilos/Categoria.css'

const TIPOS_POR_CATEGORIA = {
  jeans: ['jean'],
  camperas: ['campera'],
  'sweaters-y-buzos': ['sweater', 'buzo'],
  camisas: ['camisa'],
  'camisas-y-tops': ['camisa', 'top'],
  pantalones: ['pantalon'],
  remeras: ['remera'],
  'remeras-y-polos': ['remera', 'polo'],
  bermudas: ['bermuda'],
  'faldas-vestidos-y-monos': ['falda', 'vestido', 'mono'],
  'faldas-y-vestidos': ['falda', 'vestido'],
  'shorts-y-bermudas': ['bermuda'],
  'cinturones-y-billeteras': ['cinturon', 'billetera'],
  'mochilas-y-bolsos': ['mochila', 'bolso'],
  'caps-y-gorros': ['cap', 'gorra', 'gorro'],
  'boxers-y-medias': ['boxer', 'media'],
  bufandas: ['bufanda'],
  accesorios: [
    'cinturon',
    'billetera',
    'mochila',
    'bolso',
    'cap',
    'gorra',
    'gorro',
    'boxer',
    'media',
    'bufanda',
  ],
}

const TITULOS_CATEGORIA = {
  jeans: 'Jeans',
  camperas: 'Camperas',
  'sweaters-y-buzos': 'Sweaters y Buzos',
  camisas: 'Camisas',
  'camisas-y-tops': 'Camisas y Tops',
  pantalones: 'Pantalones',
  remeras: 'Remeras',
  'remeras-y-polos': 'Remeras y Polos',
  bermudas: 'Bermudas',
  'faldas-vestidos-y-monos': 'Faldas, Vestidos y Monos',
  'faldas-y-vestidos': 'Faldas y Vestidos',
  'shorts-y-bermudas': 'Shorts y Bermudas',
  'cinturones-y-billeteras': 'Cinturones y Billeteras',
  'mochilas-y-bolsos': 'Mochilas y Bolsos',
  'caps-y-gorros': 'Caps y Gorros',
  'boxers-y-medias': 'Boxers y Medias',
  bufandas: 'Bufandas',
  accesorios: 'Accesorios',
}

function normalizarTexto(texto = '') {
  return texto
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function formatearTitulo(texto = '') {
  return texto
    .split('-')
    .map(parte => parte.charAt(0).toUpperCase() + parte.slice(1))
    .join(' ')
}

function obtenerTitulo(genero, categoria) {
  if (genero === 'sale') {
    return categoria
      ? `Sale ${TITULOS_CATEGORIA[categoria] || formatearTitulo(categoria)}`
      : 'Sale'
  }

  if (categoria) {
    return TITULOS_CATEGORIA[categoria] || formatearTitulo(categoria)
  }

  return formatearTitulo(genero)
}

function coincideValor(valor, nombres) {
  return nombres.some(
    nombre =>
      normalizarTexto(valor.codigo) === normalizarTexto(nombre) ||
      normalizarTexto(valor.nombre) === normalizarTexto(nombre),
  )
}

function ContenidoCatalogo({
  genero,
  categoria,
  alAgregarAlCarrito,
  cargandoCarrito,
}) {
  const esSale = genero === 'sale'
  const titulo = obtenerTitulo(genero, categoria)

  const [configuracion, setConfiguracion] = useState(null)
  const [marcas, setMarcas] = useState([])
  const [tiposProducto, setTiposProducto] = useState([])

  const [marcaSeleccionada, setMarcaSeleccionada] = useState('')
  const [tipoSeleccionado, setTipoSeleccionado] = useState('')
  const [orden, setOrden] = useState('nombre-asc')

  const [productos, setProductos] = useState([])
  const [total, setTotal] = useState(0)
  const [desplazamiento, setDesplazamiento] = useState(0)
  const [hayMas, setHayMas] = useState(false)

  const [cargando, setCargando] = useState(!esSale)
  const [cargandoMas, setCargandoMas] = useState(false)
  const [error, setError] = useState('')

  const versionConsulta = useRef(0)
  const solicitudMas = useRef(false)

  useEffect(() => {
    if (esSale) {
      return
    }

    let activo = true

    async function prepararCatalogo() {
      try {
        const filtrosGenerales = await obtenerFiltrosCatalogo()

        if (!activo) {
          return
        }

        const generoEncontrado = filtrosGenerales.generos.find(
          valor => coincideValor(valor, [genero]),
        )

        if (!generoEncontrado) {
          setCargando(false)
          return
        }

        const filtrosGenero = await obtenerFiltrosCatalogo({
          generoId: generoEncontrado.id,
        })

        if (!activo) {
          return
        }

        const nombresTipo = categoria
          ? TIPOS_POR_CATEGORIA[categoria] || []
          : []

        const tiposCategoria = categoria
          ? filtrosGenero.tiposProducto.filter(valor =>
              coincideValor(valor, nombresTipo),
            )
          : filtrosGenero.tiposProducto

        if (categoria && tiposCategoria.length === 0) {
          setCargando(false)
          return
        }

        const tiposProductoIds = categoria
          ? tiposCategoria.map(valor => valor.id)
          : []

        const filtrosPagina = categoria
          ? await obtenerFiltrosCatalogo({
              generoId: generoEncontrado.id,
              tiposProductoIds,
            })
          : filtrosGenero

        if (!activo) {
          return
        }

        setMarcas(filtrosPagina.marcas)
        setTiposProducto(tiposCategoria)

        setConfiguracion({
          generoId: generoEncontrado.id,
          tiposProductoIds,
        })
      } catch (fallo) {
        if (activo) {
          setError(
            fallo.message || 'No pudimos cargar el catálogo.',
          )
          setCargando(false)
        }
      }
    }

    prepararCatalogo()

    return () => {
      activo = false
    }
  }, [genero, categoria, esSale])

  useEffect(() => {
    if (!configuracion) {
      return
    }

    let activo = true

    versionConsulta.current += 1
    solicitudMas.current = false

    setCargando(true)
    setCargandoMas(false)
    setError('')
    setProductos([])
    setTotal(0)
    setDesplazamiento(0)
    setHayMas(false)

    async function cargarPrimeraPagina() {
      try {
        const resultado = await obtenerCatalogo({
          generoId: configuracion.generoId,
          tiposProductoIds: tipoSeleccionado
            ? [tipoSeleccionado]
            : configuracion.tiposProductoIds,
          marcaIds: marcaSeleccionada
            ? [marcaSeleccionada]
            : [],
          orden,
          desplazamiento: 0,
        })

        if (!activo) {
          return
        }

        setProductos(resultado.productos)
        setTotal(resultado.total)
        setDesplazamiento(resultado.siguienteDesplazamiento)
        setHayMas(resultado.hayMas)
      } catch (fallo) {
        if (activo) {
          setError(
            fallo.message || 'No pudimos cargar los productos.',
          )
        }
      } finally {
        if (activo) {
          setCargando(false)
        }
      }
    }

    cargarPrimeraPagina()

    return () => {
      activo = false
      versionConsulta.current += 1
    }
  }, [
    configuracion,
    marcaSeleccionada,
    tipoSeleccionado,
    orden,
  ])

  async function mostrarMas() {
    if (
      !configuracion ||
      cargando ||
      !hayMas ||
      solicitudMas.current
    ) {
      return
    }

    const versionActual = versionConsulta.current

    solicitudMas.current = true
    setCargandoMas(true)
    setError('')

    try {
      const resultado = await obtenerCatalogo({
        generoId: configuracion.generoId,
        tiposProductoIds: tipoSeleccionado
          ? [tipoSeleccionado]
          : configuracion.tiposProductoIds,
        marcaIds: marcaSeleccionada
          ? [marcaSeleccionada]
          : [],
        orden,
        desplazamiento,
      })

      if (versionActual !== versionConsulta.current) {
        return
      }

      setProductos(anteriores => {
        const idsExistentes = new Set(
          anteriores.map(producto => producto.id),
        )

        const nuevos = resultado.productos.filter(
          producto => !idsExistentes.has(producto.id),
        )

        return [...anteriores, ...nuevos]
      })

      setTotal(resultado.total)
      setDesplazamiento(resultado.siguienteDesplazamiento)
      setHayMas(resultado.hayMas)
    } catch (fallo) {
      if (versionActual === versionConsulta.current) {
        setError(
          fallo.message || 'No pudimos cargar más productos.',
        )
      }
    } finally {
      if (versionActual === versionConsulta.current) {
        solicitudMas.current = false
        setCargandoMas(false)
      }
    }
  }

  function limpiarFiltros() {
    setMarcaSeleccionada('')
    setTipoSeleccionado('')
  }

  return (
    <main className="categoria seccion">
      <Contenedor>
        <header className="categoria__encabezado">
          <h1>{titulo}</h1>
        </header>

        {configuracion && (
          <div className="tienda-catalogo__herramientas">
            <div className="estructura__campo">
              <label htmlFor="tienda-catalogo-marca">
                Marca
              </label>

              <select
                id="tienda-catalogo-marca"
                value={marcaSeleccionada}
                onChange={evento =>
                  setMarcaSeleccionada(evento.target.value)
                }
              >
                <option value="">Todas las marcas</option>

                {marcas.map(marca => (
                  <option key={marca.id} value={marca.id}>
                    {marca.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="estructura__campo">
              <label htmlFor="tienda-catalogo-tipo">
                Tipo de producto
              </label>

              <select
                id="tienda-catalogo-tipo"
                value={tipoSeleccionado}
                onChange={evento =>
                  setTipoSeleccionado(evento.target.value)
                }
              >
                <option value="">Todos los tipos</option>

                {tiposProducto.map(tipo => (
                  <option key={tipo.id} value={tipo.id}>
                    {tipo.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="estructura__campo">
              <label htmlFor="tienda-catalogo-orden">
                Ordenar por
              </label>

              <select
                id="tienda-catalogo-orden"
                value={orden}
                onChange={evento =>
                  setOrden(evento.target.value)
                }
              >
                <option value="nombre-asc">
                  Nombre: A a Z
                </option>
                <option value="nombre-desc">
                  Nombre: Z a A
                </option>
                <option value="precio-asc">
                  Precio: menor a mayor
                </option>
                <option value="precio-desc">
                  Precio: mayor a menor
                </option>
              </select>
            </div>

            {(marcaSeleccionada || tipoSeleccionado) && (
              <Boton
                variante="secundario"
                onClick={limpiarFiltros}
              >
                Limpiar filtros
              </Boton>
            )}
          </div>
        )}

        {error && <p role="alert">{error}</p>}

        {cargando ? (
          <p role="status">Cargando productos...</p>
        ) : productos.length > 0 ? (
          <section
            className="grilla grilla--productos categoria__grilla"
            aria-label={`Productos de ${titulo}`}
          >
            {productos.map(producto => (
              <ProductoCard
                key={producto.id}
                producto={producto}
                alAgregarAlCarrito={alAgregarAlCarrito}
                cargandoCarrito={cargandoCarrito}
              />
            ))}
          </section>
        ) : !error ? (
          <section className="categoria__vacio">
            <h2>
              {esSale
                ? 'Sin ofertas disponibles'
                : 'Sin productos disponibles'}
            </h2>

            <p>
              {esSale
                ? 'Todavía no hay ofertas publicadas en esta sección.'
                : marcaSeleccionada || tipoSeleccionado
                  ? 'No encontramos productos con estos filtros.'
                  : 'Todavía no hay productos publicados en esta categoría.'}
            </p>
          </section>
        ) : null}

        {!cargando && configuracion && (
          <div className="tienda-catalogo__paginacion">
            <p role="status" aria-live="polite">
              Mostrando {productos.length} de {total}
            </p>

            {hayMas && (
              <Boton
                onClick={mostrarMas}
                disabled={cargandoMas}
              >
                {cargandoMas
                  ? 'Cargando...'
                  : 'Mostrar más'}
              </Boton>
            )}
          </div>
        )}
      </Contenedor>
    </main>
  )
}

function Catalogo() {
  const { genero, categoria } = useParams()

  const {
    agregarProductoAlCarrito,
    cargandoCarrito,
  } = useOutletContext()

  return (
    <ContenidoCatalogo
      key={`${genero}/${categoria || ''}`}
      genero={genero}
      categoria={categoria}
      alAgregarAlCarrito={agregarProductoAlCarrito}
      cargandoCarrito={cargandoCarrito}
    />
  )
}

export default Catalogo
