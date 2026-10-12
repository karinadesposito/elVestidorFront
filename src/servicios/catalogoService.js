import { gql } from '@apollo/client'
import clienteTienda from './clienteTienda'

const TAMANO_PAGINA = 12

const ORDENAMIENTOS = {
  'nombre-asc': 'NOMBRE_ASC',
  'nombre-desc': 'NOMBRE_DESC',
  'precio-asc': 'PRECIO_ASC',
  'precio-desc': 'PRECIO_DESC',
}

const OBTENER_FILTROS = gql`
  query ObtenerFiltrosCatalogo($input: SearchInput!) {
    search(input: $input) {
      facetValues {
        count
        facetValue {
          id
          code
          name
          facet {
            code
          }
        }
      }
    }
  }
`

const OBTENER_CATALOGO = gql`
  query ObtenerCatalogoTienda($input: CatalogoTiendaInput!) {
    catalogoTienda(input: $input) {
      totalItems
      siguienteDesplazamiento
      hayMas
      items {
        id
        productoId
        nombre
        marca
        colorId
        color
        imagen {
          id
          preview
        }
        precioDesde
        precioHasta
        preciosDiferentes
        moneda
        disponible
        variantes {
          id
          nombre
          colorId
          color
          talleId
          talle
          precioConImpuestos
          moneda
          estadoStock
          disponible
          imagen {
            id
            preview
          }
        }
      }
    }
  }
`

function construirFiltros({
  generoId = null,
  tiposProductoIds = [],
  marcaIds = [],
} = {}) {
  const filtros = []

  if (generoId) {
    filtros.push({ and: String(generoId) })
  }

  if (tiposProductoIds.length > 0) {
    filtros.push({
      or: [...new Set(tiposProductoIds.map(String))],
    })
  }

  if (marcaIds.length > 0) {
    filtros.push({
      or: [...new Set(marcaIds.map(String))],
    })
  }

  return filtros
}

function mapearVariante(variante) {
  return {
    id: variante.id,
    nombre: variante.nombre,
    colorId: variante.colorId,
    color: variante.color,
    talleId: variante.talleId,
    talle: variante.talle,
    precio: variante.precioConImpuestos / 100,
    moneda: variante.moneda,
    estadoStock: variante.estadoStock,
    disponible: variante.disponible,
    imagen: variante.imagen?.preview?.trim() || null,
  }
}

function mapearCard(card) {
  return {
    id: card.id,
    productoId: card.productoId,
    nombre: card.nombre,
    marca: card.marca,
    colorId: card.colorId,
    color: card.color,
    moneda: card.moneda,
    imagen: card.imagen?.preview?.trim() || null,
    imagenAlt: card.color
      ? `${card.nombre} - ${card.color}`
      : card.nombre,
    precioDesde: card.precioDesde / 100,
    precioHasta: card.precioHasta / 100,
    preciosDiferentes: card.preciosDiferentes,
    disponible: card.disponible,
    variantes: card.variantes.map(mapearVariante),
  }
}

export async function obtenerFiltrosCatalogo({
  generoId = null,
  tiposProductoIds = [],
} = {}) {
  const { data } = await clienteTienda.query({
    query: OBTENER_FILTROS,
    variables: {
      input: {
        groupByProduct: true,
        take: 1,
        facetValueFilters: construirFiltros({
          generoId,
          tiposProductoIds,
        }),
      },
    },
  })

  const valores = data.search.facetValues.map(
    ({ count, facetValue }) => ({
      id: facetValue.id,
      codigo: facetValue.code,
      nombre: facetValue.name,
      faceta: facetValue.facet.code,
      cantidad: count,
    }),
  )

  function obtenerValores(codigoFaceta) {
    return valores
      .filter(valor => valor.faceta === codigoFaceta)
      .sort((primero, segundo) =>
        primero.nombre.localeCompare(segundo.nombre, 'es'),
      )
  }

  return {
    generos: obtenerValores('genero'),
    marcas: obtenerValores('marca'),
    tiposProducto: obtenerValores('tipo-producto'),
  }
}

export async function obtenerCatalogo({
  generoId = null,
  tiposProductoIds = [],
  marcaIds = [],
  orden = 'nombre-asc',
  desplazamiento = 0,
} = {}) {
  if (
    !Number.isInteger(desplazamiento) ||
    desplazamiento < 0
  ) {
    throw new Error('La posición del catálogo no es válida.')
  }

  const { data } = await clienteTienda.query({
    query: OBTENER_CATALOGO,
    variables: {
      input: {
        generoId: generoId ? String(generoId) : null,
        tiposProductoIds: [
          ...new Set(tiposProductoIds.map(String)),
        ],
        marcaIds: [
          ...new Set(marcaIds.map(String)),
        ],
        orden:
          ORDENAMIENTOS[orden] ||
          ORDENAMIENTOS['nombre-asc'],
        skip: desplazamiento,
        take: TAMANO_PAGINA,
      },
    },
  })

  const resultado = data.catalogoTienda

  return {
    productos: resultado.items.map(mapearCard),
    total: resultado.totalItems,
    siguienteDesplazamiento:
      resultado.siguienteDesplazamiento,
    hayMas: resultado.hayMas,
  }
}