import { gql } from '@apollo/client'
import clienteTienda from './clienteTienda'

const DATOS_CARRITO = gql`
  fragment DatosCarritoTienda on Order {
    id
    code
    state
    currencyCode
    totalQuantity
    subTotalWithTax
    lines {
      id
      quantity
      discountedUnitPriceWithTax
      discountedLinePriceWithTax
      productVariant {
        id
        name
        featuredAsset {
          id
          preview
        }
        product {
          id
          name
        }
        options {
          id
          code
          name
          group {
            id
            code
          }
        }
      }
    }
  }
`

const OBTENER_CARRITO = gql`
  query ObtenerCarritoTienda {
    activeOrder {
      ...DatosCarritoTienda
    }
  }
  ${DATOS_CARRITO}
`

const AGREGAR_AL_CARRITO = gql`
  mutation AgregarVarianteAlCarrito(
    $varianteId: ID!
    $cantidad: Int!
  ) {
    addItemToOrder(
      productVariantId: $varianteId
      quantity: $cantidad
    ) {
      __typename
      ... on Order {
        ...DatosCarritoTienda
      }
      ... on ErrorResult {
        errorCode
        message
      }
      ... on InsufficientStockError {
        quantityAvailable
        order {
          ...DatosCarritoTienda
        }
      }
    }
  }
  ${DATOS_CARRITO}
`

const ELIMINAR_DEL_CARRITO = gql`
  mutation EliminarLineaDelCarrito($lineaId: ID!) {
    removeOrderLine(orderLineId: $lineaId) {
      __typename
      ... on Order {
        ...DatosCarritoTienda
      }
      ... on ErrorResult {
        errorCode
        message
      }
    }
  }
  ${DATOS_CARRITO}
`

function obtenerOpcion(opciones, tipo) {
  return opciones.find(
    opcion =>
      opcion.group.code === tipo ||
      opcion.group.code.startsWith(`${tipo}-`),
  )
}

function mapearLinea(linea) {
  const variante = linea.productVariant
  const color = obtenerOpcion(variante.options, 'color')
  const talle = obtenerOpcion(variante.options, 'talle')

  return {
    id: linea.id,
    varianteId: variante.id,
    productoId: variante.product.id,
    nombre: variante.product.name,
    nombreVariante: variante.name,
    color: color?.name || '',
    talle: talle?.name || '',
    imagen: variante.featuredAsset?.preview?.trim() || null,
    cantidad: linea.quantity,
    precioUnitario: linea.discountedUnitPriceWithTax / 100,
    importe: linea.discountedLinePriceWithTax / 100,
  }
}

function mapearCarrito(pedido) {
  if (!pedido) {
    return null
  }

  return {
    id: pedido.id,
    codigo: pedido.code,
    estado: pedido.state,
    moneda: pedido.currencyCode,
    cantidadTotal: pedido.totalQuantity,
    subtotal: pedido.subTotalWithTax / 100,
    lineas: pedido.lines.map(mapearLinea),
  }
}

function crearErrorCarrito(
  resultado,
  mensajeInicial = 'No pudimos agregar el producto al carrito.',
) {
  let mensaje = mensajeInicial

  switch (resultado.errorCode) {
    case 'INSUFFICIENT_STOCK_ERROR':
      mensaje =
        'No hay stock suficiente para la cantidad solicitada.'
      break

    case 'ORDER_LIMIT_ERROR':
      mensaje =
        'Alcanzaste el límite de unidades permitido por pedido.'
      break

    case 'NEGATIVE_QUANTITY_ERROR':
      mensaje = 'La cantidad solicitada no es válida.'
      break

    case 'ORDER_MODIFICATION_ERROR':
      mensaje =
        'Este pedido ya no permite modificar sus productos.'
      break

    default:
      break
  }

  const error = new Error(mensaje)

  error.codigo = resultado.errorCode || resultado.__typename

  // Vendure puede ajustar el pedido al stock disponible.
  // Conservamos ese resultado para sincronizar el panel.
  if (resultado.order) {
    error.carrito = mapearCarrito(resultado.order)
  }

  return error
}

export async function obtenerCarrito() {
  const { data } = await clienteTienda.query({
    query: OBTENER_CARRITO,
    fetchPolicy: 'network-only',
  })

  if (!data || !('activeOrder' in data)) {
    throw new Error('No pudimos consultar el carrito.')
  }

  return mapearCarrito(data.activeOrder)
}

export async function agregarAlCarrito(
  varianteId,
  cantidad = 1,
) {
  const id = String(varianteId ?? '').trim()

  if (!id) {
    throw new Error('Seleccioná una variante válida.')
  }

  if (!Number.isInteger(cantidad) || cantidad < 1) {
    throw new Error('La cantidad debe ser un entero mayor a cero.')
  }

  const { data } = await clienteTienda.mutate({
    mutation: AGREGAR_AL_CARRITO,
    variables: {
      varianteId: id,
      cantidad,
    },
  })

  const resultado = data?.addItemToOrder

  if (!resultado) {
    throw new Error('No recibimos una respuesta del carrito.')
  }

  if (resultado.__typename !== 'Order') {
    throw crearErrorCarrito(resultado)
  }

  return mapearCarrito(resultado)
}

export async function eliminarDelCarrito(lineaId) {
  const id = String(lineaId ?? '').trim()

  if (!id) {
    throw new Error('Seleccioná un producto válido del carrito.')
  }

  const { data } = await clienteTienda.mutate({
    mutation: ELIMINAR_DEL_CARRITO,
    variables: {
      lineaId: id,
    },
  })

  const resultado = data?.removeOrderLine

  if (!resultado) {
    throw new Error('No recibimos una respuesta del carrito.')
  }

  if (resultado.__typename !== 'Order') {
    throw crearErrorCarrito(
      resultado,
      'No pudimos eliminar el producto del carrito.',
    )
  }

  return mapearCarrito(resultado)
}