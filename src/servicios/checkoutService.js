import { gql } from '@apollo/client'
import clienteTienda from './clienteTienda'

const CLAVE_PEDIDO_PAGO = 'elvestidor-pedido-pago'

const DATOS_CHECKOUT = gql`
  fragment DatosCheckoutTienda on Order {
    id
    code
    state
    active
    currencyCode
    totalQuantity
    subTotalWithTax
    shippingWithTax
    totalWithTax
    customer {
      id
      firstName
      lastName
      emailAddress
      phoneNumber
    }
    shippingAddress {
      fullName
      streetLine1
      streetLine2
      city
      province
      postalCode
      countryCode
      phoneNumber
    }
    shippingLines {
      id
      shippingMethod {
        id
        code
        name
      }
    }
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
          name
          group {
            code
          }
        }
      }
    }
    payments {
      id
      method
      state
      amount
      metadata
    }
  }
`

const OBTENER_PEDIDO = gql`
  query ObtenerPedidoCheckout {
    activeOrder {
      ...DatosCheckoutTienda
    }
  }
  ${DATOS_CHECKOUT}
`

const OBTENER_COMPRA_REALIZADA = gql`
  query ObtenerCompraRealizada($codigo: String!) {
    orderByCode(code: $codigo) {
      ...DatosCheckoutTienda
    }
  }
  ${DATOS_CHECKOUT}
`

const GUARDAR_COMPRADOR = gql`
  mutation GuardarCompradorCheckout(
    $input: CreateCustomerInput!
  ) {
    setCustomerForOrder(input: $input) {
      __typename
      ... on Order {
        ...DatosCheckoutTienda
      }
      ... on ErrorResult {
        errorCode
        message
      }
    }
  }
  ${DATOS_CHECKOUT}
`

const GUARDAR_DIRECCION = gql`
  mutation GuardarDireccionCheckout(
    $input: CreateAddressInput!
  ) {
    setOrderShippingAddress(input: $input) {
      __typename
      ... on Order {
        ...DatosCheckoutTienda
      }
      ... on ErrorResult {
        errorCode
        message
      }
    }
  }
  ${DATOS_CHECKOUT}
`

const OBTENER_ENTREGAS = gql`
  query ObtenerMetodosEntregaCheckout {
    eligibleShippingMethods {
      id
      code
      name
      description
      priceWithTax
    }
  }
`

const SELECCIONAR_ENTREGA = gql`
  mutation SeleccionarEntregaCheckout($ids: [ID!]!) {
    setOrderShippingMethod(shippingMethodId: $ids) {
      __typename
      ... on Order {
        ...DatosCheckoutTienda
      }
      ... on ErrorResult {
        errorCode
        message
      }
    }
  }
  ${DATOS_CHECKOUT}
`

const OBTENER_PAGOS = gql`
  query ObtenerMetodosPagoCheckout {
    eligiblePaymentMethods {
      id
      code
      name
      description
      isEligible
      eligibilityMessage
    }
  }
`

const PREPARAR_PAGO = gql`
  mutation PrepararPagoCheckout($estado: String!) {
    transitionOrderToState(state: $estado) {
      __typename
      ... on Order {
        ...DatosCheckoutTienda
      }
      ... on ErrorResult {
        errorCode
        message
      }
    }
  }
  ${DATOS_CHECKOUT}
`

const INICIAR_PAGO = gql`
  mutation IniciarPagoCheckout($input: PaymentInput!) {
    addPaymentToOrder(input: $input) {
      __typename
      ... on Order {
        ...DatosCheckoutTienda
      }
      ... on ErrorResult {
        errorCode
        message
      }
    }
  }
  ${DATOS_CHECKOUT}
`

let pagoEnCurso = false

function texto(valor) {
  return String(valor ?? '').trim()
}

function guardarCodigoPedidoPago(pedido) {
  const codigo = texto(pedido?.code)

  if (!codigo) {
    throw new Error(
      'No pudimos identificar el pedido para consultar el pago al regresar.',
    )
  }

  try {
    window.sessionStorage.setItem(CLAVE_PEDIDO_PAGO, codigo)
  } catch {
    throw new Error(
      'No pudimos guardar la referencia de tu compra. Permití el almacenamiento de la tienda antes de continuar.',
    )
  }
}

export function obtenerCodigoPedidoPago() {
  try {
    return texto(
      window.sessionStorage.getItem(CLAVE_PEDIDO_PAGO),
    )
  } catch {
    return ''
  }
}

export function olvidarCodigoPedidoPago() {
  try {
    window.sessionStorage.removeItem(CLAVE_PEDIDO_PAGO)
  } catch {
    // No modifica el pedido ni la sesión de Vendure.
  }
}

export async function obtenerCompraRealizada(
  codigoPedido = obtenerCodigoPedidoPago(),
) {
  const codigo = texto(codigoPedido)

  if (!codigo) {
    throw new Error(
      'No encontramos la referencia de esta compra. No vuelvas a pagar; consultá el estado de tu pedido.',
    )
  }

  const { data } = await clienteTienda.query({
    query: OBTENER_COMPRA_REALIZADA,
    variables: { codigo },
    fetchPolicy: 'network-only',
  })

  if (!data || !('orderByCode' in data)) {
    throw new Error('No pudimos consultar tu compra.')
  }

  if (!data.orderByCode) {
    throw new Error(
      'No pudimos recuperar esta compra con tu sesión actual. No vuelvas a pagar; consultá el estado de tu pedido.',
    )
  }

  if (data.orderByCode.code !== codigo) {
    throw new Error(
      'La compra consultada no coincide con el pedido iniciado.',
    )
  }

  return data.orderByCode
}

function comprobarPedido(pedido) {
  if (!pedido || pedido.totalQuantity < 1) {
    throw new Error('Tu carrito está vacío.')
  }

  if (pedido.currencyCode !== 'ARS') {
    throw new Error('La compra debe estar expresada en pesos.')
  }
}

function comprobarEditable(pedido) {
  comprobarPedido(pedido)

  if (pedido.state !== 'AddingItems') {
    throw new Error(
      'El pedido ya inició el proceso de pago y no permite cambiar estos datos.',
    )
  }
}

function resolverResultado(resultado, mensaje) {
  if (!resultado) {
    throw new Error(mensaje)
  }

  if (resultado.__typename !== 'Order') {
    const error = new Error(resultado.message || mensaje)
    error.codigo = resultado.errorCode || resultado.__typename
    throw error
  }

  return resultado
}

async function ejecutarMutacion(
  mutation,
  variables,
  campo,
  mensaje,
) {
  const { data } = await clienteTienda.mutate({
    mutation,
    variables,
  })

  return resolverResultado(data?.[campo], mensaje)
}

function validarEnlace(valor) {
  if (typeof valor !== 'string' || !valor.trim()) {
    throw new Error('El pago no contiene un enlace válido.')
  }

  let url

  try {
    url = new URL(valor)
  } catch {
    throw new Error('El pago no contiene un enlace válido.')
  }

  if (
    url.protocol !== 'https:' ||
    url.hostname !== 'www.mercadopago.com.ar' ||
    url.username ||
    url.password
  ) {
    throw new Error(
      'El enlace no corresponde a Mercado Pago Argentina.',
    )
  }

  return url.href
}

function obtenerEnlacePendiente(pedido, codigoMetodo) {
  const pendientes = (pedido.payments || []).filter(
    pago =>
      pago.state === 'Created' ||
      pago.state === 'Authorized' ||
      pago.state === 'Settled',
  )

  if (pendientes.length === 0) {
    return null
  }

  if (pendientes.length !== 1) {
    throw new Error(
      'El pedido tiene varios pagos registrados. Requiere revisión.',
    )
  }

  const pago = pendientes[0]

  if (
    pago.state === 'Authorized' ||
    pago.state === 'Settled'
  ) {
    throw new Error(
      'Este pedido ya tiene un pago autorizado o acreditado.',
    )
  }

  if (
    pago.method !== codigoMetodo ||
    pago.amount !== pedido.totalWithTax
  ) {
    throw new Error(
      'El pago pendiente no coincide con el método o el total del pedido.',
    )
  }

  // Shop API expone la metadata pública del pago.
  const enlace =
    pago.metadata?.checkoutUrl ||
    pago.metadata?.public?.checkoutUrl

  return validarEnlace(enlace)
}

export async function obtenerPedidoCheckout() {
  const { data } = await clienteTienda.query({
    query: OBTENER_PEDIDO,
    fetchPolicy: 'network-only',
  })

  if (!data || !('activeOrder' in data)) {
    throw new Error('No pudimos consultar tu pedido.')
  }

  return data.activeOrder
}

export async function guardarDatosCheckout({
  comprador,
  direccion,
}) {
  const pedido = await obtenerPedidoCheckout()
  comprobarEditable(pedido)

  const datosComprador = {
    firstName: texto(comprador?.nombre),
    lastName: texto(comprador?.apellido),
    emailAddress: texto(comprador?.email),
    phoneNumber: texto(comprador?.telefono),
  }

  if (
    !datosComprador.firstName ||
    !datosComprador.lastName ||
    !datosComprador.phoneNumber ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      datosComprador.emailAddress,
    )
  ) {
    throw new Error(
      'Completá nombre, apellido, email válido y teléfono.',
    )
  }

  const datosDireccion = {
    fullName:
      `${datosComprador.firstName} ${datosComprador.lastName}`,
    streetLine1: texto(direccion?.calle),
    streetLine2: texto(direccion?.departamento),
    city: texto(direccion?.ciudad),
    province: texto(direccion?.provincia),
    postalCode: texto(direccion?.codigoPostal),
    countryCode: 'AR',
    phoneNumber: datosComprador.phoneNumber,
  }

  if (
    !datosDireccion.streetLine1 ||
    !datosDireccion.city ||
    !datosDireccion.province ||
    !datosDireccion.postalCode
  ) {
    throw new Error(
      'Completá calle y número, ciudad, provincia y código postal.',
    )
  }

  await ejecutarMutacion(
    GUARDAR_COMPRADOR,
    { input: datosComprador },
    'setCustomerForOrder',
    'No pudimos guardar los datos del comprador.',
  )

  return ejecutarMutacion(
    GUARDAR_DIRECCION,
    { input: datosDireccion },
    'setOrderShippingAddress',
    'No pudimos guardar la dirección.',
  )
}

export async function obtenerMetodosEntrega() {
  const { data } = await clienteTienda.query({
    query: OBTENER_ENTREGAS,
    fetchPolicy: 'network-only',
  })

  if (!data?.eligibleShippingMethods) {
    throw new Error('No pudimos consultar las formas de entrega.')
  }

  return data.eligibleShippingMethods
}

export async function seleccionarMetodoEntrega(metodoId) {
  const id = texto(metodoId)

  if (!id) {
    throw new Error('Seleccioná una forma de entrega.')
  }

  const pedido = await obtenerPedidoCheckout()
  comprobarEditable(pedido)

  const metodos = await obtenerMetodosEntrega()

  if (!metodos.some(metodo => String(metodo.id) === id)) {
    throw new Error(
      'La entrega seleccionada ya no está disponible.',
    )
  }

  return ejecutarMutacion(
    SELECCIONAR_ENTREGA,
    { ids: [id] },
    'setOrderShippingMethod',
    'No pudimos seleccionar la entrega.',
  )
}

export async function obtenerMetodosPago() {
  const { data } = await clienteTienda.query({
    query: OBTENER_PAGOS,
    fetchPolicy: 'network-only',
  })

  if (!data?.eligiblePaymentMethods) {
    throw new Error('No pudimos consultar los métodos de pago.')
  }

  return data.eligiblePaymentMethods
}

export async function iniciarPagoMercadoPago({
  codigoMetodo,
  pedidoId,
  totalConfirmado,
}) {
  if (pagoEnCurso) {
    throw new Error('El pago ya se está preparando.')
  }

  const codigo = texto(codigoMetodo)

  if (
    !codigo ||
    !texto(pedidoId) ||
    !Number.isSafeInteger(totalConfirmado) ||
    totalConfirmado <= 0
  ) {
    throw new Error(
      'Revisá el pedido y el método de pago antes de continuar.',
    )
  }

  pagoEnCurso = true

  try {
    let pedido = await obtenerPedidoCheckout()
    comprobarPedido(pedido)

    if (
      String(pedido.id) !== String(pedidoId) ||
      pedido.totalWithTax !== totalConfirmado
    ) {
      throw new Error(
        'El pedido o su total cambió. Actualizá el resumen antes de pagar.',
      )
    }

    if (
      pedido.state !== 'AddingItems' &&
      pedido.state !== 'ArrangingPayment'
    ) {
      throw new Error(
        'El estado actual del pedido no permite iniciar este pago.',
      )
    }

    const enlaceExistente = obtenerEnlacePendiente(
      pedido,
      codigo,
    )

    if (enlaceExistente) {
      guardarCodigoPedidoPago(pedido)

      return {
        pedido,
        checkoutUrl: enlaceExistente,
      }
    }

    if (
      !pedido.customer ||
      !pedido.shippingAddress?.streetLine1 ||
      !pedido.shippingLines?.length
    ) {
      throw new Error(
        'Completá los datos del comprador y seleccioná la entrega.',
      )
    }

    const metodos = await obtenerMetodosPago()
    const metodo = metodos.find(
      item => item.code === codigo && item.isEligible,
    )

    if (!metodo) {
      throw new Error(
        'El método de pago seleccionado no está disponible.',
      )
    }

    // Comprobamos el almacenamiento antes de iniciar el pago.
    // Se guarda sólo el código, nunca una confirmación de pago.
    guardarCodigoPedidoPago(pedido)

    if (pedido.state === 'AddingItems') {
      pedido = await ejecutarMutacion(
        PREPARAR_PAGO,
        { estado: 'ArrangingPayment' },
        'transitionOrderToState',
        'No pudimos preparar el pedido para pagar.',
      )
    }

    if (pedido.totalWithTax !== totalConfirmado) {
      throw new Error(
        'El total cambió al preparar el pago. Revisá el resumen.',
      )
    }

    try {
      pedido = await ejecutarMutacion(
        INICIAR_PAGO,
        {
          input: {
            method: codigo,
            metadata: {},
          },
        },
        'addPaymentToOrder',
        'No pudimos iniciar el pago con Mercado Pago.',
      )
    } catch (fallo) {
      // Si se perdió la respuesta, consultamos el pedido.
      // No repetimos automáticamente la creación del pago.
      try {
        const actualizado = await obtenerPedidoCheckout()

        if (
          actualizado &&
          String(actualizado.id) === String(pedidoId) &&
          actualizado.totalWithTax === totalConfirmado &&
          actualizado.state === 'ArrangingPayment'
        ) {
          const enlace = obtenerEnlacePendiente(
            actualizado,
            codigo,
          )

          if (enlace) {
            guardarCodigoPedidoPago(actualizado)

            return {
              pedido: actualizado,
              checkoutUrl: enlace,
            }
          }
        }
      } catch {
        // Conservamos el error de la operación original.
      }

      throw fallo
    }

    const checkoutUrl = obtenerEnlacePendiente(
      pedido,
      codigo,
    )

    if (!checkoutUrl) {
      throw new Error(
        'El pedido no devolvió un enlace de pago pendiente.',
      )
    }

    guardarCodigoPedidoPago(pedido)

    return {
      pedido,
      checkoutUrl,
    }
  } finally {
    pagoEnCurso = false
  }
}

// Recuperación explícita desde el carrito. Ante cualquier pago registrado,
// no modificamos el pedido: primero debe verificarse su estado en el backend.
export async function recuperarCarritoParaEditar(pedidoId) {
  if (pagoEnCurso) {
    throw new Error('Hay un pago preparándose. No podemos modificar el pedido todavía.')
  }

  const pedido = await obtenerPedidoCheckout()

  if (!pedido || String(pedido.id) !== String(pedidoId)) {
    throw new Error('El carrito cambió. Actualizá la página antes de continuar.')
  }

  if (!pedido.active || pedido.totalQuantity < 1) {
    throw new Error('Este pedido ya no está disponible para editar.')
  }

  if (pedido.state === 'AddingItems') return pedido

  if (pedido.state !== 'ArrangingPayment') {
    throw new Error('El estado actual de este pedido no permite editarlo.')
  }

  if (!Array.isArray(pedido.payments)) {
    throw new Error('No pudimos comprobar los pagos del pedido. No se realizaron cambios.')
  }

  if (pedido.payments.length > 0) {
    throw new Error(
      'Este pedido tiene un intento de pago registrado. Para proteger tu compra, no podemos modificarlo hasta verificar su estado.',
    )
  }

  const recuperado = await ejecutarMutacion(
    PREPARAR_PAGO,
    { estado: 'AddingItems' },
    'transitionOrderToState',
    'No pudimos volver a habilitar el carrito.',
  )

  if (recuperado.state !== 'AddingItems' || String(recuperado.id) !== String(pedidoId)) {
    throw new Error('No pudimos confirmar que el carrito esté editable.')
  }

  olvidarCodigoPedidoPago()
  return recuperado
}
