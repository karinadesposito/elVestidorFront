
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

const RECALCULAR_CARRITO = gql`
  mutation RecalcularCarritoVigente {
    recalcularCarritoVigente {
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

const ACTUALIZAR_CANTIDAD = gql`
  mutation ActualizarCantidadCarrito(
    $lineaId: ID!
    $cantidad: Int!
  ) {
    adjustOrderLine(
      orderLineId: $lineaId
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

function obtenerOpcion(opciones = [], tipo) {
  return opciones.find(
    opcion =>
      opcion.group?.code === tipo ||
      opcion.group?.code?.startsWith(`${tipo}-`),
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
  if (!pedido) return null

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
  mensajeInicial = 'No pudimos actualizar el carrito.',
) {
  let mensaje = mensajeInicial

  switch (resultado.errorCode) {
    case 'INSUFFICIENT_STOCK_ERROR':
      mensaje = Number.isInteger(resultado.quantityAvailable)
        ? `Solo hay ${resultado.quantityAvailable} unidades disponibles de esta variante.`
        : 'No hay stock suficiente para la cantidad solicitada.'
      break

    case 'ORDER_LIMIT_ERROR':
      mensaje = 'Alcanzaste el límite de unidades permitido por pedido.'
      break

    case 'NEGATIVE_QUANTITY_ERROR':
      mensaje = 'La cantidad solicitada no es válida.'
      break

    case 'ORDER_MODIFICATION_ERROR':
      mensaje = 'Este pedido ya está en proceso de pago y no permite modificar sus productos.'
      break

    default:
      break
  }

  const error = new Error(mensaje)
  error.codigo = resultado.errorCode || resultado.__typename

  if (resultado.order) {
    error.carrito = mapearCarrito(resultado.order)
  }

  return error
}

function procesarResultado(resultado, mensaje) {
  if (!resultado) {
    throw new Error('No recibimos una respuesta del carrito.')
  }

  if (resultado.__typename !== 'Order') {
    throw crearErrorCarrito(resultado, mensaje)
  }

  return mapearCarrito(resultado)
}

// Vendure 3.7.0 no recalcula promociones al leer activeOrder.
// Esta operación recalcula solamente pedidos editables que no tienen pagos.
export async function recalcularPedidoActivo() {
  const { data } = await clienteTienda.mutate({
    mutation: RECALCULAR_CARRITO,
    fetchPolicy: 'no-cache',
  })

  if (!data || !('recalcularCarritoVigente' in data)) {
    throw new Error('No pudimos verificar los precios vigentes del carrito.')
  }

  return data.recalcularCarritoVigente
}

export async function obtenerCarrito() {
  return mapearCarrito(await recalcularPedidoActivo())
}

export async function agregarAlCarrito(varianteId, cantidad = 1) {
  const id = String(varianteId ?? '').trim()

  if (!id) {
    throw new Error('Seleccioná una variante válida.')
  }

  if (!Number.isInteger(cantidad) || cantidad < 1) {
    throw new Error('La cantidad debe ser un entero mayor a cero.')
  }

  const { data } = await clienteTienda.mutate({
    mutation: AGREGAR_AL_CARRITO,
    variables: { varianteId: id, cantidad },
  })

  return procesarResultado(
    data?.addItemToOrder,
    'No pudimos agregar el producto al carrito.',
  )
}

export async function actualizarCantidadCarrito(lineaId, cantidad) {
  const id = String(lineaId ?? '').trim()

  if (!id) {
    throw new Error('No pudimos identificar el producto.')
  }

  if (!Number.isInteger(cantidad) || cantidad < 1) {
    throw new Error('La cantidad debe ser un entero mayor a cero.')
  }

  const { data } = await clienteTienda.mutate({
    mutation: ACTUALIZAR_CANTIDAD,
    variables: { lineaId: id, cantidad },
  })

  return procesarResultado(
    data?.adjustOrderLine,
    'No pudimos modificar la cantidad.',
  )
}

export async function eliminarDelCarrito(lineaId) {
  const id = String(lineaId ?? '').trim()

  if (!id) {
    throw new Error('Seleccioná un producto válido del carrito.')
  }

  const { data } = await clienteTienda.mutate({
    mutation: ELIMINAR_DEL_CARRITO,
    variables: { lineaId: id },
  })

  return procesarResultado(
    data?.removeOrderLine,
    'No pudimos eliminar el producto del carrito.',
  )
}
