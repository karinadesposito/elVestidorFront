
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
        imagenes {
          id
          preview
        }
        precioDesde
        precioHasta
        descuentoPorcentaje
        precioOfertaDesdeEstimado
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
          descuentoPorcentaje
          precioOfertaEstimado
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

/*
 * Consulta individual para la ficha de producto.
 *
 * La Shop API devuelve las variantes, sus opciones
 * y los assets asociados a cada variante.
 */
const OBTENER_DETALLE_PRODUCTO = gql`
  query ObtenerDetalleProducto($id: ID!) {
    product(id: $id) {
      id
      name
      description
      featuredAsset {
        id
        preview
      }
      assets {
        id
        preview
      }
      variants {
        id
        name
        sku
        stockLevel
        priceWithTax
        currencyCode
        featuredAsset {
          id
          preview
        }
        assets {
          id
          preview
        }
        options {
          id
          code
          name
          group {
            id
            code
            name
          }
        }
      }
    }
  }
`

// Consultamos ofertas anunciadas por el mismo catalogo de Vendure.
// El detalle de `product` devuelve el precio base, sin las promociones
// automaticas que nuestro plugin expone por variante.
const OBTENER_OFERTAS_DETALLE = gql`
  query ObtenerOfertasDetalle($input: CatalogoTiendaInput!) {
    catalogoTienda(input: $input) {
      items {
        productoId
        variantes {
          id
          descuentoPorcentaje
          precioOfertaEstimado
        }
      }
      siguienteDesplazamiento
      hayMas
    }
  }
`

async function obtenerOfertasPorVariante(productoId) {
  const ofertas = new Map()
  let desplazamiento = 0
  let hayMas = true

  // La paginacion se realiza sobre tarjetas de catalogo (producto/color).
  // Puede haber mas de un color para el mismo producto.
  while (hayMas) {
    const { data } = await clienteTienda.query({
      query: OBTENER_OFERTAS_DETALLE,
      variables: {
        input: {
          soloOfertas: true,
          skip: desplazamiento,
          take: TAMANO_PAGINA,
        },
      },
      fetchPolicy: 'network-only',
    })

    const resultado = data?.catalogoTienda
    if (!resultado) break

    for (const card of resultado.items || []) {
      if (String(card.productoId) !== String(productoId)) continue

      for (const variante of card.variantes || []) {
        const porcentaje = variante.descuentoPorcentaje
        const importe = variante.precioOfertaEstimado
        if (
          Number.isInteger(porcentaje) &&
          porcentaje > 0 &&
          importe != null &&
          Number.isFinite(Number(importe))
        ) {
          ofertas.set(String(variante.id), {
            descuentoPorcentaje: porcentaje,
            precioOfertaEstimado: Number(importe) / 100,
          })
        }
      }
    }

    const siguiente = resultado.siguienteDesplazamiento
    if (!resultado.hayMas || !Number.isInteger(siguiente) || siguiente <= desplazamiento) {
      hayMas = false
    } else {
      desplazamiento = siguiente
    }
  }

  return ofertas
}

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
    descuentoPorcentaje: variante.descuentoPorcentaje ?? null,
    precioOfertaEstimado: variante.precioOfertaEstimado == null
      ? null
      : variante.precioOfertaEstimado / 100,
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
    imagenes: (card.imagenes || [])
      .map(asset => asset.preview?.trim())
      .filter(Boolean),
    imagenAlt: card.color
      ? `${card.nombre} - ${card.color}`
      : card.nombre,
    precioDesde: card.precioDesde / 100,
    precioHasta: card.precioHasta / 100,
    descuentoPorcentaje: card.descuentoPorcentaje ?? null,
    precioOfertaDesdeEstimado: card.precioOfertaDesdeEstimado == null
      ? null
      : card.precioOfertaDesdeEstimado / 100,
    preciosDiferentes: card.preciosDiferentes,
    disponible: card.disponible,
    variantes: card.variantes.map(mapearVariante),
  }
}

function obtenerOpcion(variante, tipo) {
  return (variante.options || []).find(opcion => {
    const codigoGrupo = String(
      opcion.group?.code || '',
    ).toLowerCase()

    const nombreGrupo = String(
      opcion.group?.name || '',
    ).toLowerCase()

    if (tipo === 'color') {
      return (
        codigoGrupo === 'color' ||
        nombreGrupo === 'color'
      )
    }

    return (
      codigoGrupo.includes('talle') ||
      nombreGrupo.includes('talle')
    )
  }) || null
}

function mapearImagenes(assets = []) {
  return assets
    .map(asset => ({
      id: asset.id,
      url: asset.preview?.trim() || null,
    }))
    .filter(asset => asset.url)
}

function mapearVarianteDetalle(variante) {
  const opcionColor = obtenerOpcion(variante, 'color')
  const opcionTalle = obtenerOpcion(variante, 'talle')

  return {
    id: variante.id,
    nombre: variante.name,
    sku: variante.sku,
    colorId: opcionColor?.id || null,
    color: opcionColor?.name || 'Único',
    talleId: opcionTalle?.id || null,
    talle: opcionTalle?.name || 'Único',
    precio: variante.priceWithTax / 100,
    moneda: variante.currencyCode,
    estadoStock: variante.stockLevel,
    disponible: variante.stockLevel !== 'OUT_OF_STOCK',
    imagen: variante.featuredAsset?.preview?.trim() || null,
    imagenes: mapearImagenes(variante.assets || []),
  }
}

function agruparColores(variantes, imagenesProducto) {
  const grupos = new Map()

  for (const variante of variantes) {
    const clave = String(variante.colorId || 'unico')

    if (!grupos.has(clave)) {
      grupos.set(clave, {
        id: variante.colorId,
        nombre: variante.color,
        imagenes: [],
        variantes: [],
        disponible: false,
      })
    }

    const grupo = grupos.get(clave)

    grupo.variantes.push(variante)

    if (variante.disponible) {
      grupo.disponible = true
    }

    for (const imagen of variante.imagenes) {
      if (!grupo.imagenes.some(item => item.id === imagen.id)) {
        grupo.imagenes.push(imagen)
      }
    }

    if (
      variante.imagen &&
      !grupo.imagenes.some(item => item.url === variante.imagen)
    ) {
      grupo.imagenes.unshift({
        id: `principal-${variante.id}`,
        url: variante.imagen,
      })
    }
  }

  const colores = [...grupos.values()]

  /*
   * Si el producto no tiene imágenes asignadas
   * a sus variantes, usamos las imágenes generales.
   */
  if (colores.length === 1 && colores[0].imagenes.length === 0) {
    colores[0].imagenes = imagenesProducto
  }

  return colores
}

function mapearDetalleProducto(producto) {
  const variantes = (producto.variants || [])
    .map(mapearVarianteDetalle)

  const imagenes = mapearImagenes(producto.assets || [])

  if (
    imagenes.length === 0 &&
    producto.featuredAsset?.preview
  ) {
    imagenes.push({
      id: producto.featuredAsset.id,
      url: producto.featuredAsset.preview,
    })
  }

  return {
    id: producto.id,
    nombre: producto.name,
    descripcion: producto.description || '',
    imagenes,
    variantes,
    colores: agruparColores(variantes, imagenes),
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
  soloOfertas = false,
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
        soloOfertas: Boolean(soloOfertas),
      },
    },
    fetchPolicy: 'network-only',
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

export async function obtenerDetalleProducto(productoId) {
  const id = String(productoId ?? '').trim()

  if (!id) {
    throw new Error('No pudimos identificar el producto.')
  }

  const { data } = await clienteTienda.query({
    query: OBTENER_DETALLE_PRODUCTO,
    variables: { id },
    fetchPolicy: 'network-only',
  })

  if (!data?.product) {
    throw new Error('El producto no está disponible.')
  }

  const detalle = mapearDetalleProducto(data.product)

  // La ficha debe seguir funcionando incluso si falla la consulta
  // complementaria de ofertas; en ese caso exhibimos el precio base.
  let ofertas = new Map()
  try {
    ofertas = await obtenerOfertasPorVariante(id)
  } catch (error) {
    console.warn('No se pudieron recuperar las ofertas del producto.', error)
  }

  const variantes = detalle.variantes.map(variante => ({
    ...variante,
    ...(ofertas.get(String(variante.id)) || {
      descuentoPorcentaje: null,
      precioOfertaEstimado: null,
    }),
  }))

  return {
    ...detalle,
    variantes,
    colores: agruparColores(variantes, detalle.imagenes),
  }
}
