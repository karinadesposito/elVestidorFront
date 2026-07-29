import client from '../../servicios/apolloClient'
import { gql } from '@apollo/client'

const OBTENER_PRODUCTOS = gql`
  query Products($options: ProductListOptions) {
    products(options: $options) {
      items {
        id
        name
        description
        variants {
          id
          name
          sku
          price
          stockOnHand
          options {
            name
            code
          }
        }
      }
      totalItems
    }
  }
`

const CREAR_PRODUCTO = gql`
  mutation CreateProduct($input: CreateProductInput!) {
    createProduct(input: $input) {
      id
      name
    }
  }
`

const OBTENER_PRODUCTO = gql`
  query Product($id: ID!) {
    product(id: $id) {
      id
      name
      description
    }
  }
`

const CREAR_VARIANTE = gql`
  mutation CreateProductVariants($input: [CreateProductVariantInput!]!) {
    createProductVariants(input: $input) {
      id
      name
      sku
      price
      stockOnHand
    }
  }
`

function pesosACentavos(precio) {
  const str = String(precio).trim()
  const [enteros = '0', decimales = ''] = str.split('.')
  return parseInt(enteros, 10) * 100 + parseInt((decimales + '00').slice(0, 2), 10)
}

function formatPrecio(precioEnCentavos) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
  }).format(precioEnCentavos / 100)
}

function mapearProducto(product) {
  const variants = product.variants || []
  const primeraVariante = variants[0]

  const variantes = variants.map((v) => ({
    id: v.id,
    nombre: v.name || v.options?.map((o) => o.name).join(' / ') || 'Sin variante',
    sku: v.sku || '—',
    stock: v.stockOnHand ?? 0,
    precio: formatPrecio(v.price),
    precioNumerico: v.price,
  }))

  return {
    id: product.id,
    nombre: product.name,
    descripcion: product.description || '',
    barcode: primeraVariante?.sku || '—',
    variante: primeraVariante?.name || '—',
    stock: primeraVariante?.stockOnHand ?? 0,
    precio: formatPrecio(primeraVariante?.price || 0),
    variantes,
    color: (primeraVariante?.stockOnHand ?? 0) === 0
      ? 'fondo-violeta'
      : (primeraVariante?.stockOnHand ?? 0) <= 5
        ? 'fondo-amarillo'
        : 'fondo-azul',
  }
}

export async function obtenerProductos({ pagina = 1, take = 50 } = {}) {
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

  const productos = data.products.items.map(mapearProducto)

  return {
    productos,
    total: data.products.totalItems,
  }
}

export async function crearProducto({ nombre, descripcion, sku, precio, stock }) {
  const { data } = await client.mutate({
    mutation: CREAR_PRODUCTO,
    variables: {
      input: {
        translations: [{
          languageCode: 'es',
          name: nombre,
          description: descripcion || '',
          slug: nombre.toLowerCase().replace(/\s+/g, '-'),
        }],
      },
    },
  })

  const productId = data.createProduct.id

  if (sku || precio || stock) {
    await client.mutate({
      mutation: CREAR_VARIANTE,
      variables: {
        input: [{
          productId,
          sku: sku || '',
          price: precio ? pesosACentavos(precio) : 0,
          stockOnHand: stock ?? 0,
          translations: [{
            languageCode: 'es',
            name: 'Principal',
          }],
        }],
      },
    })
  }

  return data.createProduct
}

export async function crearVariante({ productId, nombre, sku, precio, stock }) {
  const { data } = await client.mutate({
    mutation: CREAR_VARIANTE,
    variables: {
      input: [{
        productId,
        sku: sku || '',
        price: precio ? pesosACentavos(precio) : 0,
        stockOnHand: stock ?? 0,
        translations: [{
          languageCode: 'es',
          name: nombre || 'Variante',
        }],
      }],
    },
  })

  return data.createProductVariants[0]
}

export function contarPorEstado(productos) {
  const total = productos.length
  const sinStock = productos.filter((p) => p.stock === 0).length
  const stockBajo = productos.filter((p) => p.stock > 0 && p.stock <= 5).length
  const activos = total - sinStock

  return [
    { nombre: 'Productos', cantidad: total, color: 'fondo-azul' },
    { nombre: 'Stock bajo', cantidad: stockBajo, color: 'fondo-amarillo' },
    { nombre: 'Sin stock', cantidad: sinStock, color: 'fondo-violeta' },
    { nombre: 'Activos', cantidad: activos, color: 'fondo-verde' },
  ]
}
