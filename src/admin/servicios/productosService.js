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

const TIPOS_GRUPO = {
  color: {
    codigo: 'color',
    nombre: 'Color',
  },
  talle: {
    codigo: 'talle',
    nombre: 'Talle',
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
        productCount

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

const CREAR_GRUPO_OPCIONES = gql`
  mutation CrearGrupoOpciones($input: CreateProductOptionGroupInput!) {
    createProductOptionGroup(input: $input) {
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
  }
`

const CREAR_OPCION_PRODUCTO = gql`
  mutation CrearOpcionProducto($input: CreateProductOptionInput!) {
    createProductOption(input: $input) {
      id
      name
      code
      groupId
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
        productCount

        options {
          id
          name
          code
        }
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

function normalizarTexto(valor) {
  return String(valor || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
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

function obtenerValorFaceta(
  valoresFaceta,
  codigoFaceta,
) {
  return (
    valoresFaceta?.find(
      (valor) =>
        valor.facet?.code === codigoFaceta,
    )?.name || ''
  )
}

function esGrupoColor(grupo) {
  const codigo = normalizarTexto(grupo?.code)
  const nombre = normalizarTexto(grupo?.name)

  return (
    nombre === 'color' ||
    codigo === 'color' ||
    codigo.startsWith('color-')
  )
}

function esGrupoTalle(grupo) {
  const codigo = normalizarTexto(grupo?.code)
  const nombre = normalizarTexto(grupo?.name)

  return (
    nombre === 'talle' ||
    nombre.startsWith('talle ') ||
    codigo === 'talle' ||
    codigo.startsWith('talle-')
  )
}

function obtenerOpcionColor(opciones = []) {
  return (
    opciones.find((opcion) =>
      esGrupoColor(opcion.group),
    )?.name || ''
  )
}

function obtenerOpcionTalle(opciones = []) {
  return (
    opciones.find((opcion) =>
      esGrupoTalle(opcion.group),
    )?.name || ''
  )
}

function mapearVariante(variante) {
  const opciones = variante.options || []

  return {
    id: variante.id,

    nombre:
      variante.name ||
      opciones
        .map((opcion) => opcion.name)
        .join(' / ') ||
      'Variante',

    sku: variante.sku || '—',

    precio: variante.price ?? 0,

    precioFormateado: formatearPrecio(
      variante.price,
    ),

    activo: variante.enabled,

    stock: variante.stockOnHand ?? 0,

    color: obtenerOpcionColor(opciones),

    talle: obtenerOpcionTalle(opciones),

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
  const valoresFaceta =
    producto.facetValues || []

  const variantes = (
    producto.variants || []
  ).map(mapearVariante)

  return {
    id: producto.id,

    nombre: producto.name,

    descripcion:
      producto.description || '',

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

    cantidadVariantes:
      variantes.length,
  }
}

function mapearGrupoProducto(grupo) {
  return {
    id: grupo.id,

    nombre: grupo.name,

    codigo: grupo.code,

    productCount:
      grupo.productCount ?? 0,

    opciones: (
      grupo.options || []
    ).map((opcion) => ({
      id: opcion.id,
      nombre: opcion.name,
      codigo: opcion.code,
    })),
  }
}

async function obtenerProductoPorId(
  productId,
) {
  const { data } = await client.query({
    query: OBTENER_PRODUCTO,

    variables: {
      id: productId,
    },

    fetchPolicy: 'network-only',
  })

  if (!data.product) {
    throw new Error(
      'No se encontró el producto seleccionado.',
    )
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

async function obtenerOCrearFaceta(
  configuracion,
  facetas,
) {
  const facetaExistente =
    facetas.find(
      (faceta) =>
        faceta.code ===
        configuracion.codigo,
    )

  if (facetaExistente) {
    return facetaExistente
  }

  const { data } = await client.mutate({
    mutation: CREAR_FACETA,

    variables: {
      input: {
        code:
          configuracion.codigo,

        isPrivate: false,

        translations: [
          {
            languageCode: IDIOMA,

            name:
              configuracion.nombre,
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
  facetas,
}) {
  const nombreValor =
    String(valor || '').trim()

  if (!nombreValor) {
    return null
  }

  const codigoValor =
    generarCodigo(nombreValor)

  const faceta =
    await obtenerOCrearFaceta(
      configuracionFaceta,
      facetas,
    )

  const valorExistente =
    faceta.values?.find(
      (valorFaceta) =>
        valorFaceta.code ===
        codigoValor,
    )

  if (valorExistente) {
    return valorExistente.id
  }

  const { data } =
    await client.mutate({
      mutation:
        CREAR_VALOR_FACETA,

      variables: {
        input: {
          facetId: faceta.id,

          code: codigoValor,

          translations: [
            {
              languageCode:
                IDIOMA,

              name: nombreValor,
            },
          ],
        },
      },
    })

  return data.createFacetValue.id
}

function obtenerGruposSemanticos(
  producto,
) {
  const grupos =
    producto.optionGroups || []

  const gruposColor =
    grupos.filter(esGrupoColor)

  const gruposTalle =
    grupos.filter(esGrupoTalle)

  if (gruposColor.length > 1) {
    throw new Error(
      'El producto tiene más de un grupo de opciones de Color. Revisá su estructura en Vendure antes de agregar variantes.',
    )
  }

  if (gruposTalle.length > 1) {
    throw new Error(
      'El producto tiene más de un grupo de opciones de Talle. Revisá su estructura en Vendure antes de agregar variantes.',
    )
  }

  return {
    color:
      gruposColor[0] || null,

    talle:
      gruposTalle[0] || null,
  }
}

function validarGrupoPropioProducto(
  grupo,
  tipoGrupo,
) {
  if (!grupo) {
    return
  }

  if (
    Number(
      grupo.productCount,
    ) > 1
  ) {
    throw new Error(
      `El grupo ${tipoGrupo.nombre} de este producto está compartido con otros productos. Pertenece al modelo anterior de grupos globales y no se utilizará para crear nuevas variantes.`,
    )
  }
}

async function crearGrupoProducto({
  productId,
  tipoGrupo,
}) {
  const codigoGrupo =
    `${tipoGrupo.codigo}-${productId}`

  const { data } =
    await client.mutate({
      mutation:
        CREAR_GRUPO_OPCIONES,

      variables: {
        input: {
          code: codigoGrupo,

          translations: [
            {
              languageCode:
                IDIOMA,

              name:
                tipoGrupo.nombre,
            },
          ],
        },
      },
    })

  const grupoCreado =
    data.createProductOptionGroup

  await client.mutate({
    mutation:
      AGREGAR_GRUPO_AL_PRODUCTO,

    variables: {
      productId,

      optionGroupId:
        grupoCreado.id,
    },
  })

  return {
    ...grupoCreado,

    productCount: 1,

    options:
      grupoCreado.options || [],
  }
}

async function obtenerOCrearGrupoProducto({
  producto,
  tipoGrupo,
  grupoExistente,
}) {
  if (grupoExistente) {
    validarGrupoPropioProducto(
      grupoExistente,
      tipoGrupo,
    )

    return grupoExistente
  }

  if (
    (producto.variants || [])
      .length > 0
  ) {
    throw new Error(
      `El producto ya tiene variantes pero no posee un grupo propio de ${tipoGrupo.nombre}. Revisá el producto antes de modificar su estructura de opciones.`,
    )
  }

  return crearGrupoProducto({
    productId:
      producto.id,

    tipoGrupo,
  })
}

function buscarOpcionPorNombre(
  grupo,
  nombreOpcion,
) {
  const codigo =
    generarCodigo(nombreOpcion)

  return grupo.options?.find(
    (opcion) =>
      opcion.code === codigo ||
      generarCodigo(
        opcion.name,
      ) === codigo,
  )
}

async function crearOpcionEnGrupo({
  grupo,
  nombre,
}) {
  const nombreOpcion =
    String(nombre || '').trim()

  if (!nombreOpcion) {
    throw new Error(
      'El nombre de la opción es obligatorio.',
    )
  }

  const codigoOpcion =
    generarCodigo(
      nombreOpcion,
    )

  const { data } =
    await client.mutate({
      mutation:
        CREAR_OPCION_PRODUCTO,

      variables: {
        input: {
          productOptionGroupId:
            grupo.id,

          code: codigoOpcion,

          translations: [
            {
              languageCode:
                IDIOMA,

              name:
                nombreOpcion,
            },
          ],
        },
      },
    })

  return data.createProductOption
}

async function obtenerOCrearOpcionGrupo({
  grupo,
  nombre,
}) {
  const nombreOpcion =
    String(nombre || '').trim()

  const opcionExistente =
    buscarOpcionPorNombre(
      grupo,
      nombreOpcion,
    )

  if (opcionExistente) {
    return opcionExistente
  }

  return crearOpcionEnGrupo({
    grupo,
    nombre:
      nombreOpcion,
  })
}

export async function obtenerCatalogosProducto() {
  const facetas =
    await obtenerFacetas()

  const facetaMarca =
    facetas.find(
      (faceta) =>
        faceta.code ===
        FACETAS.marca.codigo,
    )

  const facetaGenero =
    facetas.find(
      (faceta) =>
        faceta.code ===
        FACETAS.genero.codigo,
    )

  const facetaTipoProducto =
    facetas.find(
      (faceta) =>
        faceta.code ===
        FACETAS.tipoProducto
          .codigo,
    )

  const facetaColor =
    facetas.find(
      (faceta) =>
        faceta.code ===
        FACETAS.color.codigo,
    )

  return {
    marcas: (
      facetaMarca?.values || []
    ).map((valor) => ({
      id: valor.id,
      nombre: valor.name,
      codigo: valor.code,
    })),

    generos: (
      facetaGenero?.values || []
    ).map((valor) => ({
      id: valor.id,
      nombre: valor.name,
      codigo: valor.code,
    })),

    tiposProducto: (
      facetaTipoProducto?.values ||
      []
    ).map((valor) => ({
      id: valor.id,
      nombre: valor.name,
      codigo: valor.code,
    })),

    colores: (
      facetaColor?.values || []
    ).map((valor) => ({
      id: valor.id,
      nombre: valor.name,
      codigo: valor.code,
    })),
  }
}

export async function obtenerOpcionesProducto(
  productId,
) {
  if (!productId) {
    return {
      color: null,
      talle: null,
    }
  }

  const producto =
    await obtenerProductoPorId(
      productId,
    )

  const grupos =
    obtenerGruposSemanticos(
      producto,
    )

  return {
    color: grupos.color
      ? mapearGrupoProducto(
          grupos.color,
        )
      : null,

    talle: grupos.talle
      ? mapearGrupoProducto(
          grupos.talle,
        )
      : null,
  }
}

export async function obtenerProductos({
  pagina = 1,
  take = 50,
} = {}) {
  const { data } =
    await client.query({
      query: OBTENER_PRODUCTOS,

      variables: {
        options: {
          skip:
            (pagina - 1) *
            take,

          take,
        },
      },

      fetchPolicy:
        'network-only',
    })

  return {
    productos:
      data.products.items.map(
        mapearProducto,
      ),

    total:
      data.products.totalItems,
  }
}

export async function buscarProductosPorNombre(
  nombre,
) {
  const nombreBuscado =
    String(nombre || '').trim()

  if (!nombreBuscado) {
    return []
  }

  const palabras =
    nombreBuscado
      .toLowerCase()
      .split(/\s+/)
      .map((palabra) =>
        palabra.trim(),
      )
      .filter(Boolean)

  const filtros =
    palabras.map(
      (palabra) => ({
        name: {
          contains:
            palabra,
        },
      }),
    )

  const { data } =
    await client.query({
      query: OBTENER_PRODUCTOS,

      variables: {
        options: {
          filter: {
            _or: filtros,
          },

          take: 50,
        },
      },

      fetchPolicy:
        'network-only',
    })

  return data.products.items.map(
    mapearProducto,
  )
}

function normalizarNombreParaComparacion(
  nombre,
) {
  return String(nombre || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(
      /[\u0300-\u036f]/g,
      '',
    )
    .replace(
      /[^a-z0-9]+/g,
      ' ',
    )
    .replace(/\s+/g, ' ')
    .trim()
}

export function analizarCoincidenciasNombre(
  nombre,
  productos,
) {
  const nombreNormalizado =
    normalizarNombreParaComparacion(
      nombre,
    )

  if (!nombreNormalizado) {
    return []
  }

  return productos
    .map((producto) => {
      const productoNormalizado =
        normalizarNombreParaComparacion(
          producto.nombre,
        )

      if (
        !productoNormalizado
      ) {
        return null
      }

      if (
        productoNormalizado ===
        nombreNormalizado
      ) {
        return {
          tipo: 'exacta',

          producto,
        }
      }

      if (
        productoNormalizado.includes(
          nombreNormalizado,
        ) ||
        nombreNormalizado.includes(
          productoNormalizado,
        )
      ) {
        return {
          tipo: 'similar',

          producto,
        }
      }

      return null
    })
    .filter(Boolean)
}

export async function crearProducto({
  nombre,
  descripcion,
  activo,
  marca,
  genero,
  tipoProducto,
}) {
  const nombreProducto =
    String(nombre || '').trim()

  if (!nombreProducto) {
    throw new Error(
      'El nombre del producto es obligatorio.',
    )
  }

  if (!marca?.trim()) {
    throw new Error(
      'La marca es obligatoria.',
    )
  }

  if (!genero?.trim()) {
    throw new Error(
      'El género es obligatorio.',
    )
  }

  if (!tipoProducto?.trim()) {
    throw new Error(
      'El tipo de producto es obligatorio.',
    )
  }

  const facetas =
    await obtenerFacetas()

  const facetValueIds = []

  const configuraciones = [
    {
      configuracionFaceta:
        FACETAS.marca,

      valor: marca,
    },
    {
      configuracionFaceta:
        FACETAS.genero,

      valor: genero,
    },
    {
      configuracionFaceta:
        FACETAS.tipoProducto,

      valor: tipoProducto,
    },
  ]

  for (
    const configuracion
    of configuraciones
  ) {
    const facetValueId =
      await obtenerOCrearValorFaceta({
        ...configuracion,

        facetas,
      })

    if (facetValueId) {
      facetValueIds.push(
        facetValueId,
      )
    }
  }

  const { data } =
    await client.mutate({
      mutation:
        CREAR_PRODUCTO,

      variables: {
        input: {
          enabled:
            Boolean(activo),

          facetValueIds,

          translations: [
            {
              languageCode:
                IDIOMA,

              name:
                nombreProducto,

              description:
                String(
                  descripcion || '',
                ).trim(),

              slug:
                generarSlug(
                  nombreProducto,
                ),
            },
          ],
        },
      },
    })

  return data.createProduct
}

export async function crearVariante({
  productId,
  color,
  talle,
  sku,
  precio,
  activo,
}) {
  if (!productId) {
    throw new Error(
      'Debés seleccionar un producto.',
    )
  }

  const nombreColor =
    String(color || '').trim()

  if (!nombreColor) {
    throw new Error(
      'Debés indicar un color.',
    )
  }

  const nombreTalle =
    String(talle || '').trim()

  const codigoSku =
    String(sku || '').trim()

  if (!codigoSku) {
    throw new Error(
      'El barcode o SKU es obligatorio.',
    )
  }

  const producto =
    await obtenerProductoPorId(
      productId,
    )

  const gruposActuales =
    obtenerGruposSemanticos(
      producto,
    )

  validarGrupoPropioProducto(
    gruposActuales.color,
    TIPOS_GRUPO.color,
  )

  validarGrupoPropioProducto(
    gruposActuales.talle,
    TIPOS_GRUPO.talle,
  )

  if (
    gruposActuales.talle &&
    !nombreTalle
  ) {
    throw new Error(
      'Este producto utiliza talle. Debés indicar un talle para la variante.',
    )
  }

  if (
    !gruposActuales.talle &&
    !nombreTalle &&
    (
      producto.variants || []
    ).some(
      (variante) =>
        obtenerOpcionTalle(
          variante.options || [],
        ),
    )
  ) {
    throw new Error(
      'Las variantes existentes del producto utilizan talle. Revisá la estructura del producto.',
    )
  }

  const grupoColor =
    await obtenerOCrearGrupoProducto({
      producto,

      tipoGrupo:
        TIPOS_GRUPO.color,

      grupoExistente:
        gruposActuales.color,
    })

  const opcionColor =
    await obtenerOCrearOpcionGrupo({
      grupo: grupoColor,

      nombre: nombreColor,
    })

  const optionIds = [
    opcionColor.id,
  ]

  let opcionTalle = null

  if (nombreTalle) {
    const grupoTalle =
      await obtenerOCrearGrupoProducto({
        producto,

        tipoGrupo:
          TIPOS_GRUPO.talle,

        grupoExistente:
          gruposActuales.talle,
      })

    opcionTalle =
      await obtenerOCrearOpcionGrupo({
        grupo: grupoTalle,

        nombre:
          nombreTalle,
      })

    optionIds.push(
      opcionTalle.id,
    )
  }

  const facetas =
    await obtenerFacetas()

  const colorFacetValueId =
    await obtenerOCrearValorFaceta({
      configuracionFaceta:
        FACETAS.color,

      valor: nombreColor,

      facetas,
    })

  const nombreVariante = [
    opcionColor.name,
    opcionTalle?.name,
  ]
    .filter(Boolean)
    .join(' / ')

  const { data } =
    await client.mutate({
      mutation:
        CREAR_VARIANTE,

      variables: {
        input: [
          {
            productId,

            enabled:
              Boolean(activo),

            sku:
              codigoSku,

            price:
              pesosACentavos(
                precio,
              ),

            optionIds,

            facetValueIds:
              colorFacetValueId
                ? [
                    colorFacetValueId,
                  ]
                : [],

            translations: [
              {
                languageCode:
                  IDIOMA,

                name:
                  nombreVariante,
              },
            ],
          },
        ],
      },
    })

  const varianteCreada =
    data.createProductVariants?.[0]

  if (!varianteCreada) {
    throw new Error(
      'Vendure no pudo crear la variante.',
    )
  }

  return varianteCreada
}

export function contarPorEstado(
  productos,
) {
  const totalProductos =
    productos.length

  const productosActivos =
    productos.filter(
      (producto) =>
        producto.activo,
    ).length

  const productosInactivos =
    totalProductos -
    productosActivos

  const totalVariantes =
    productos.reduce(
      (
        cantidad,
        producto,
      ) =>
        cantidad +
        producto.variantes
          .length,
      0,
    )

  return [
    {
      nombre: 'Productos',

      cantidad:
        totalProductos,

      color: 'fondo-azul',
    },
    {
      nombre: 'Variantes',

      cantidad:
        totalVariantes,

      color:
        'fondo-amarillo',
    },
    {
      nombre: 'Inactivos',

      cantidad:
        productosInactivos,

      color:
        'fondo-violeta',
    },
    {
      nombre: 'Activos',

      cantidad:
        productosActivos,

      color:
        'fondo-verde',
    },
  ]
}