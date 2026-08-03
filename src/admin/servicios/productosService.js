import client from '../../servicios/apolloClient'
import { gql } from '@apollo/client'

const IDIOMA = 'es'

const FACETAS = {
  marca: {
    codigo: 'marca',
    nombre: 'Marca',
  },
  genero: {
    codigo: 'genero',
    nombre: 'Género',
  },
  tipoProducto: {
    codigo: 'tipo-producto',
    nombre: 'Tipo de producto',
  },
  color: {
    codigo: 'color',
    nombre: 'Color',
  },
}

const GRUPOS_OPCIONES = {
  color: {
    codigo: 'color',
    nombre: 'Color',
  },
  talleAlfabetico: {
    codigo: 'talle-alfabetico',
    nombre: 'Talle alfabético',
  },
  talleNumerico: {
    codigo: 'talle-numerico',
    nombre: 'Talle numérico',
  },
}

const OBTENER_PRODUCTOS = gql`
  query ObtenerProductos($options: ProductListOptions) {
    products(options: $options) {
      items {
        id
        name
        description
        enabled
        facetValues {
          id
          name
          code
          facet {
            id
            name
            code
          }
        }
        variants {
          id
          name
          sku
          enabled
          price
          stockOnHand
          options {
            id
            name
            code
            group {
              id
              name
              code
            }
          }
          facetValues {
            id
            name
            code
            facet {
              id
              name
              code
            }
          }
        }
      }
      totalItems
    }
  }
`

const OBTENER_PRODUCTO = gql`
  query ObtenerProducto($id: ID!) {
    product(id: $id) {
      id
      name
      description
      enabled
      facetValues {
        id
        name
        code
        facet {
          id
          name
          code
        }
      }
      optionGroups {
        id
        name
        code
        options {
          id
          name
          code
        }
      }
      variants {
        id
        name
        sku
        enabled
        price
        stockOnHand
        options {
          id
          name
          code
          group {
            id
            name
            code
          }
        }
      }
    }
  }
`

const OBTENER_FACETAS = gql`
  query ObtenerFacetas($options: FacetListOptions) {
    facets(options: $options) {
      items {
        id
        name
        code
        values {
          id
          name
          code
        }
      }
      totalItems
    }
  }
`

const OBTENER_GRUPOS_OPCIONES = gql`
  query ObtenerGruposOpciones(
    $options: ProductOptionGroupListOptions
  ) {
    productOptionGroups(options: $options) {
      items {
        id
        name
        code
        productCount
        options {
          id
          name
          code
        }
      }
      totalItems
    }
  }
`

const CREAR_PRODUCTO = gql`
  mutation CrearProducto($input: CreateProductInput!) {
    createProduct(input: $input) {
      id
      name
      description
      enabled
      facetValues {
        id
        name
        code
        facet {
          id
          name
          code
        }
      }
    }
  }
`

const CREAR_FACETA = gql`
  mutation CrearFaceta($input: CreateFacetInput!) {
    createFacet(input: $input) {
      id
      name
      code
      values {
        id
        name
        code
      }
    }
  }
`

const CREAR_VALOR_FACETA = gql`
  mutation CrearValorFaceta($input: CreateFacetValueInput!) {
    createFacetValue(input: $input) {
      id
      name
      code
      facetId
    }
  }
`

const AGREGAR_GRUPO_AL_PRODUCTO = gql`
  mutation AgregarGrupoAlProducto(
    $productId: ID!
    $optionGroupId: ID!
  ) {
    addOptionGroupToProduct(
      productId: $productId
      optionGroupId: $optionGroupId
    ) {
      id
      name
      optionGroups {
        id
        name
        code
      }
    }
  }
`

const CREAR_VARIANTE = gql`
  mutation CrearVariante(
    $input: [CreateProductVariantInput!]!
  ) {
    createProductVariants(input: $input) {
      id
      name
      sku
      enabled
      price
      stockOnHand
      options {
        id
        name
        code
        group {
          id
          name
          code
        }
      }
      facetValues {
        id
        name
        code
        facet {
          id
          name
          code
        }
      }
    }
  }
`

function generarCodigo(valor) {
  return String(valor || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

function generarSlug(nombre) {
  return generarCodigo(nombre)
}

function pesosACentavos(precio) {
  const valorNormalizado = String(precio ?? '')
    .trim()
    .replace(/\s/g, '')
    .replace(',', '.')

  const numero = Number(valorNormalizado)

  if (!Number.isFinite(numero) || numero < 0) {
    throw new Error('El precio ingresado no es válido.')
  }

  return Math.round(numero * 100)
}

function formatearPrecio(precioEnCentavos = 0) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
  }).format(precioEnCentavos / 100)
}

function obtenerValorFaceta(valoresFaceta, codigoFaceta) {
  return (
    valoresFaceta?.find(
      (valor) => valor.facet?.code === codigoFaceta,
    )?.name || ''
  )
}

function obtenerOpcionPorGrupo(opciones, codigoGrupo) {
  return (
    opciones?.find(
      (opcion) => opcion.group?.code === codigoGrupo,
    )?.name || ''
  )
}

function obtenerTalle(opciones) {
  return (
    obtenerOpcionPorGrupo(
      opciones,
      GRUPOS_OPCIONES.talleAlfabetico.codigo,
    ) ||
    obtenerOpcionPorGrupo(
      opciones,
      GRUPOS_OPCIONES.talleNumerico.codigo,
    )
  )
}

function obtenerTipoTalle(opciones) {
  const tieneTalleAlfabetico = opciones?.some(
    (opcion) =>
      opcion.group?.code ===
      GRUPOS_OPCIONES.talleAlfabetico.codigo,
  )

  if (tieneTalleAlfabetico) {
    return 'alfabetico'
  }

  const tieneTalleNumerico = opciones?.some(
    (opcion) =>
      opcion.group?.code ===
      GRUPOS_OPCIONES.talleNumerico.codigo,
  )

  if (tieneTalleNumerico) {
    return 'numerico'
  }

  return 'sin-talle'
}

function mapearVariante(variante) {
  const opciones = variante.options || []

  return {
    id: variante.id,
    nombre:
      variante.name ||
      opciones.map((opcion) => opcion.name).join(' / ') ||
      'Variante',
    sku: variante.sku || '—',
    precio: variante.price ?? 0,
    precioFormateado: formatearPrecio(variante.price),
    activo: variante.enabled,
    stock: variante.stockOnHand ?? 0,
    color: obtenerOpcionPorGrupo(
      opciones,
      GRUPOS_OPCIONES.color.codigo,
    ),
    talle: obtenerTalle(opciones),
    tipoTalle: obtenerTipoTalle(opciones),
    opciones: opciones.map((opcion) => ({
      id: opcion.id,
      nombre: opcion.name,
      codigo: opcion.code,
      grupo: opcion.group?.name || '',
      codigoGrupo: opcion.group?.code || '',
    })),
  }
}

function mapearProducto(producto) {
  const valoresFaceta = producto.facetValues || []
  const variantes = (producto.variants || []).map(mapearVariante)

  return {
    id: producto.id,
    nombre: producto.name,
    descripcion: producto.description || '',
    activo: producto.enabled,
    marca: obtenerValorFaceta(
      valoresFaceta,
      FACETAS.marca.codigo,
    ),
    genero: obtenerValorFaceta(
      valoresFaceta,
      FACETAS.genero.codigo,
    ),
    tipoProducto: obtenerValorFaceta(
      valoresFaceta,
      FACETAS.tipoProducto.codigo,
    ),
    variantes,
    cantidadVariantes: variantes.length,
  }
}

function mapearGrupo(grupo) {
  return {
    id: grupo.id,
    nombre: grupo.name,
    codigo: grupo.code,
    opciones: (grupo.options || []).map((opcion) => ({
      id: opcion.id,
      nombre: opcion.name,
      codigo: opcion.code,
    })),
  }
}

async function obtenerProductoPorId(productId) {
  const { data } = await client.query({
    query: OBTENER_PRODUCTO,
    variables: {
      id: productId,
    },
    fetchPolicy: 'network-only',
  })

  if (!data.product) {
    throw new Error('No se encontró el producto seleccionado.')
  }

  return data.product
}

async function obtenerFacetas() {
  const { data } = await client.query({
    query: OBTENER_FACETAS,
    variables: {
      options: {
        take: 1000,
      },
    },
    fetchPolicy: 'network-only',
  })

  return data.facets.items
}

async function obtenerGruposOpciones() {
  const { data } = await client.query({
    query: OBTENER_GRUPOS_OPCIONES,
    variables: {
      options: {
        take: 1000,
      },
    },
    fetchPolicy: 'network-only',
  })

  return data.productOptionGroups.items
}

async function obtenerOCrearFaceta(configuracion) {
  const facetas = await obtenerFacetas()

  const facetaExistente = facetas.find(
    (faceta) => faceta.code === configuracion.codigo,
  )

  if (facetaExistente) {
    return facetaExistente
  }

  const { data } = await client.mutate({
    mutation: CREAR_FACETA,
    variables: {
      input: {
        code: configuracion.codigo,
        isPrivate: false,
        translations: [
          {
            languageCode: IDIOMA,
            name: configuracion.nombre,
          },
        ],
      },
    },
  })

  return data.createFacet
}

async function obtenerOCrearValorFaceta({
  configuracionFaceta,
  valor,
}) {
  const nombreValor = String(valor || '').trim()

  if (!nombreValor) {
    return null
  }

  const codigoValor = generarCodigo(nombreValor)
  const faceta = await obtenerOCrearFaceta(configuracionFaceta)

  const valorExistente = faceta.values?.find(
    (valorFaceta) => valorFaceta.code === codigoValor,
  )

  if (valorExistente) {
    return valorExistente.id
  }

  const { data } = await client.mutate({
    mutation: CREAR_VALOR_FACETA,
    variables: {
      input: {
        facetId: faceta.id,
        code: codigoValor,
        translations: [
          {
            languageCode: IDIOMA,
            name: nombreValor,
          },
        ],
      },
    },
  })

  return data.createFacetValue.id
}

async function asegurarGrupoEnProducto({
  producto,
  grupo,
}) {
  const grupoYaAsignado = producto.optionGroups?.some(
    (grupoProducto) => grupoProducto.id === grupo.id,
  )

  if (grupoYaAsignado) {
    return
  }

  await client.mutate({
    mutation: AGREGAR_GRUPO_AL_PRODUCTO,
    variables: {
      productId: producto.id,
      optionGroupId: grupo.id,
    },
  })
}

function buscarGrupoPorCodigo(grupos, codigo) {
  return grupos.find((grupo) => grupo.code === codigo)
}

function buscarOpcionPorId(grupo, opcionId) {
  return grupo?.options?.find(
    (opcion) => String(opcion.id) === String(opcionId),
  )
}

export async function obtenerCatalogosOpciones() {
  const grupos = await obtenerGruposOpciones()

  const grupoColor = buscarGrupoPorCodigo(
    grupos,
    GRUPOS_OPCIONES.color.codigo,
  )

  const grupoTalleAlfabetico = buscarGrupoPorCodigo(
    grupos,
    GRUPOS_OPCIONES.talleAlfabetico.codigo,
  )

  const grupoTalleNumerico = buscarGrupoPorCodigo(
    grupos,
    GRUPOS_OPCIONES.talleNumerico.codigo,
  )

  if (!grupoColor) {
    throw new Error(
      'No existe el grupo de opciones Color en Vendure.',
    )
  }

  if (!grupoTalleAlfabetico) {
    throw new Error(
      'No existe el grupo Talle alfabético en Vendure.',
    )
  }

  if (!grupoTalleNumerico) {
    throw new Error(
      'No existe el grupo Talle numérico en Vendure.',
    )
  }

  return {
    color: mapearGrupo(grupoColor),
    talleAlfabetico: mapearGrupo(grupoTalleAlfabetico),
    talleNumerico: mapearGrupo(grupoTalleNumerico),
  }
}

export async function obtenerProductos({
  pagina = 1,
  take = 50,
} = {}) {
  const { data } = await client.query({
    query: OBTENER_PRODUCTOS,
    variables: {
      options: {
        skip: (pagina - 1) * take,
        take,
      },
    },
    fetchPolicy: 'network-only',
  })

  return {
    productos: data.products.items.map(mapearProducto),
    total: data.products.totalItems,
  }
}

export async function crearProducto({
  nombre,
  descripcion,
  activo,
  marca,
  genero,
  tipoProducto,
}) {
  const nombreProducto = String(nombre || '').trim()

  if (!nombreProducto) {
    throw new Error('El nombre del producto es obligatorio.')
  }

  if (!marca?.trim()) {
    throw new Error('La marca es obligatoria.')
  }

  if (!genero?.trim()) {
    throw new Error('El género es obligatorio.')
  }

  if (!tipoProducto?.trim()) {
    throw new Error('El tipo de producto es obligatorio.')
  }

  const facetValueIds = await Promise.all([
    obtenerOCrearValorFaceta({
      configuracionFaceta: FACETAS.marca,
      valor: marca,
    }),
    obtenerOCrearValorFaceta({
      configuracionFaceta: FACETAS.genero,
      valor: genero,
    }),
    obtenerOCrearValorFaceta({
      configuracionFaceta: FACETAS.tipoProducto,
      valor: tipoProducto,
    }),
  ])

  const { data } = await client.mutate({
    mutation: CREAR_PRODUCTO,
    variables: {
      input: {
        enabled: Boolean(activo),
        facetValueIds: facetValueIds.filter(Boolean),
        translations: [
          {
            languageCode: IDIOMA,
            name: nombreProducto,
            description: String(descripcion || '').trim(),
            slug: generarSlug(nombreProducto),
          },
        ],
      },
    },
  })

  return data.createProduct
}

export async function crearVariante({
  productId,
  colorId,
  tipoTalle,
  talleId,
  sku,
  precio,
  activo,
}) {
  if (!productId) {
    throw new Error('Debés seleccionar un producto.')
  }

  const codigoSku = String(sku || '').trim()

  if (!codigoSku) {
    throw new Error('El barcode o SKU es obligatorio.')
  }

  if (!colorId) {
    throw new Error('Debés seleccionar un color.')
  }

  const tiposTalleValidos = [
    'alfabetico',
    'numerico',
    'sin-talle',
  ]

  if (!tiposTalleValidos.includes(tipoTalle)) {
    throw new Error('Debés seleccionar un tipo de talle.')
  }

  if (tipoTalle !== 'sin-talle' && !talleId) {
    throw new Error('Debés seleccionar un talle.')
  }

  const producto = await obtenerProductoPorId(productId)
  const grupos = await obtenerGruposOpciones()

  const grupoColor = buscarGrupoPorCodigo(
    grupos,
    GRUPOS_OPCIONES.color.codigo,
  )

  if (!grupoColor) {
    throw new Error(
      'No existe el grupo de opciones Color en Vendure.',
    )
  }

  const opcionColor = buscarOpcionPorId(grupoColor, colorId)

  if (!opcionColor) {
    throw new Error(
      'El color seleccionado no pertenece al catálogo de colores.',
    )
  }

  const optionIds = [opcionColor.id]

  await asegurarGrupoEnProducto({
    producto,
    grupo: grupoColor,
  })

  let opcionTalle = null

  if (tipoTalle === 'alfabetico') {
    const grupoTalleAlfabetico = buscarGrupoPorCodigo(
      grupos,
      GRUPOS_OPCIONES.talleAlfabetico.codigo,
    )

    if (!grupoTalleAlfabetico) {
      throw new Error(
        'No existe el grupo Talle alfabético en Vendure.',
      )
    }

    opcionTalle = buscarOpcionPorId(
      grupoTalleAlfabetico,
      talleId,
    )

    if (!opcionTalle) {
      throw new Error(
        'El talle seleccionado no pertenece al catálogo alfabético.',
      )
    }

    await asegurarGrupoEnProducto({
      producto,
      grupo: grupoTalleAlfabetico,
    })

    optionIds.push(opcionTalle.id)
  }

  if (tipoTalle === 'numerico') {
    const grupoTalleNumerico = buscarGrupoPorCodigo(
      grupos,
      GRUPOS_OPCIONES.talleNumerico.codigo,
    )

    if (!grupoTalleNumerico) {
      throw new Error(
        'No existe el grupo Talle numérico en Vendure.',
      )
    }

    opcionTalle = buscarOpcionPorId(
      grupoTalleNumerico,
      talleId,
    )

    if (!opcionTalle) {
      throw new Error(
        'El talle seleccionado no pertenece al catálogo numérico.',
      )
    }

    await asegurarGrupoEnProducto({
      producto,
      grupo: grupoTalleNumerico,
    })

    optionIds.push(opcionTalle.id)
  }

  const colorFacetValueId = await obtenerOCrearValorFaceta({
    configuracionFaceta: FACETAS.color,
    valor: opcionColor.name,
  })

  const nombreVariante = [
    opcionColor.name,
    opcionTalle?.name,
  ]
    .filter(Boolean)
    .join(' / ')

  const { data } = await client.mutate({
    mutation: CREAR_VARIANTE,
    variables: {
      input: [
        {
          productId,
          enabled: Boolean(activo),
          sku: codigoSku,
          price: pesosACentavos(precio),
          optionIds,
          facetValueIds: [colorFacetValueId].filter(Boolean),
          translations: [
            {
              languageCode: IDIOMA,
              name: nombreVariante,
            },
          ],
        },
      ],
    },
  })

  const varianteCreada = data.createProductVariants?.[0]

  if (!varianteCreada) {
    throw new Error('Vendure no pudo crear la variante.')
  }

  return varianteCreada
}

export function contarPorEstado(productos) {
  const totalProductos = productos.length

  const productosActivos = productos.filter(
    (producto) => producto.activo,
  ).length

  const productosInactivos =
    totalProductos - productosActivos

  const totalVariantes = productos.reduce(
    (cantidad, producto) =>
      cantidad + producto.variantes.length,
    0,
  )

  return [
    {
      nombre: 'Productos',
      cantidad: totalProductos,
      color: 'fondo-azul',
    },
    {
      nombre: 'Variantes',
      cantidad: totalVariantes,
      color: 'fondo-amarillo',
    },
    {
      nombre: 'Inactivos',
      cantidad: productosInactivos,
      color: 'fondo-violeta',
    },
    {
      nombre: 'Activos',
      cantidad: productosActivos,
      color: 'fondo-verde',
    },
  ]
}