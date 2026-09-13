import { gql } from '@apollo/client'
import client from '../../servicios/apolloClient'

const LIMITE_CONSULTA = 100

const OBTENER_VARIANTES_STOCK = gql`
  query ObtenerVariantesStock($options: ProductVariantListOptions) {
    productVariants(options: $options) {
      items {
        id
        name
        sku
        enabled
        product {
          id
          name
        }
        options {
          id
          name
          group {
            id
            name
            code
          }
        }
        stockLevels {
          stockOnHand
          stockAllocated
        }
      }
      totalItems
    }
  }
`

const OBTENER_INGRESOS_STOCK = gql`
  query ObtenerIngresosStock($options: IngresoStockListOptions) {
    ingresosStock(options: $options) {
      items {
        id
        createdAt
        numeroComprobante
        fechaComprobante
        observaciones
        proveedor {
          id
          nombre
          cuit
          telefono
        }
        detalles {
          id
          barcode
          cantidad
          stockAnterior
          stockResultante
        }
      }
      totalItems
    }
  }
`

const OBTENER_PROVEEDORES = gql`
  query ObtenerProveedores($options: ProveedorListOptions) {
    proveedores(options: $options) {
      items {
        id
        nombre
        cuit
        telefono
      }
      totalItems
    }
  }
`

const CREAR_PROVEEDOR = gql`
  mutation CrearProveedor($input: CreateProveedorInput!) {
    createProveedor(input: $input) {
      id
      nombre
      cuit
      telefono
    }
  }
`

const REGISTRAR_INGRESO_STOCK = gql`
  mutation RegistrarIngresoStock($input: RegistrarIngresoStockInput!) {
    registrarIngresoStock(input: $input) {
      id
      createdAt
      numeroComprobante
      fechaComprobante
      observaciones
      proveedor {
        id
        nombre
        cuit
        telefono
      }
      detalles {
        id
        barcode
        cantidad
        stockAnterior
        stockResultante
      }
    }
  }
`

function normalizarTexto(valor) {
  return String(valor || '').trim().replace(/\s+/g, ' ')
}

function normalizarBusqueda(valor) {
  return normalizarTexto(valor)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function normalizarCuit(cuit) {
  const valor = String(cuit || '').trim()

  if (!valor) {
    throw new Error('El CUIT del proveedor es obligatorio.')
  }

  if (!/^[0-9\s-]+$/.test(valor)) {
    throw new Error('El CUIT solo puede contener números, espacios y guiones.')
  }

  const cuitNormalizado = valor.replace(/\D/g, '')

  if (cuitNormalizado.length !== 11) {
    throw new Error('El CUIT debe contener exactamente 11 números.')
  }

  const numeros = cuitNormalizado.split('').map(Number)
  const factores = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2]
  const suma = factores.reduce(
    (total, factor, indice) => total + factor * numeros[indice],
    0,
  )

  let digitoVerificador = 11 - (suma % 11)

  if (digitoVerificador === 11) {
    digitoVerificador = 0
  } else if (digitoVerificador === 10) {
    digitoVerificador = 9
  }

  if (numeros[10] !== digitoVerificador) {
    throw new Error('El CUIT ingresado no es válido.')
  }

  return cuitNormalizado
}

function validarNombreProveedor(nombre) {
  const nombreNormalizado = normalizarTexto(nombre)

  if (nombreNormalizado.length < 2) {
    throw new Error('El nombre del proveedor debe tener al menos 2 caracteres.')
  }

  if (nombreNormalizado.length > 100) {
    throw new Error('El nombre del proveedor no puede superar los 100 caracteres.')
  }

  return nombreNormalizado
}

function validarTelefono(telefono) {
  const telefonoNormalizado = normalizarTexto(telefono)

  if (!telefonoNormalizado) {
    return null
  }

  if (telefonoNormalizado.length > 30) {
    throw new Error('El teléfono no puede superar los 30 caracteres.')
  }

  if (!/^[0-9+\-()./\s]+$/.test(telefonoNormalizado)) {
    throw new Error('El teléfono contiene caracteres no permitidos.')
  }

  return telefonoNormalizado
}

function validarNumeroComprobante(numeroComprobante) {
  const numeroNormalizado = String(numeroComprobante || '')
    .trim()
    .replace(/\s+/g, '')

  if (!numeroNormalizado) {
    throw new Error('El número de comprobante es obligatorio.')
  }

  if (numeroNormalizado.length > 100) {
    throw new Error('El número de comprobante no puede superar los 100 caracteres.')
  }

  if (!/^[0-9-]+$/.test(numeroNormalizado)) {
    throw new Error('El número de comprobante solo puede contener números y guiones.')
  }

  return numeroNormalizado
}

function validarFechaComprobante(fechaComprobante) {
  const fechaNormalizada = String(fechaComprobante || '').trim()
  const coincidencia = /^(\d{4})-(\d{2})-(\d{2})$/.exec(fechaNormalizada)

  if (!coincidencia) {
    throw new Error('La fecha del comprobante no es válida.')
  }

  const anio = Number(coincidencia[1])
  const mes = Number(coincidencia[2])
  const dia = Number(coincidencia[3])
  const fecha = new Date(anio, mes - 1, dia)

  if (
    fecha.getFullYear() !== anio ||
    fecha.getMonth() !== mes - 1 ||
    fecha.getDate() !== dia
  ) {
    throw new Error('La fecha del comprobante no es válida.')
  }

  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)

  if (fecha > hoy) {
    throw new Error('La fecha del comprobante no puede ser futura.')
  }

  return fechaNormalizada
}

function validarObservaciones(observaciones) {
  const valor = normalizarTexto(observaciones)

  if (valor.length > 100) {
    throw new Error('Las observaciones no pueden superar los 100 caracteres.')
  }

  return valor || null
}

function validarDetalles(detalles) {
  if (!Array.isArray(detalles) || detalles.length === 0) {
    throw new Error('El ingreso debe contener al menos una variante.')
  }

  const barcodes = new Set()

  return detalles.map((detalle) => {
    const barcode = String(detalle.barcode || '').trim()
    const cantidad = Number(detalle.cantidad)

    if (!barcode) {
      throw new Error('El barcode de la variante es obligatorio.')
    }

    if (barcode.length > 100) {
      throw new Error('El barcode no puede superar los 100 caracteres.')
    }

    if (barcodes.has(barcode)) {
      throw new Error(`El barcode ${barcode} está repetido en el ingreso.`)
    }

    if (!Number.isInteger(cantidad) || cantidad < 1 || cantidad > 9999) {
      throw new Error('La cantidad debe ser un número entero entre 1 y 9999.')
    }

    barcodes.add(barcode)

    return {
      barcode,
      cantidad,
    }
  })
}

function sumarNivelesStock(niveles = []) {
  return niveles.reduce(
    (totales, nivel) => ({
      stock: totales.stock + (nivel.stockOnHand || 0),
      reservado: totales.reservado + (nivel.stockAllocated || 0),
    }),
    {
      stock: 0,
      reservado: 0,
    },
  )
}

function obtenerEstadoStock(disponible) {
  if (disponible < 0) {
    return {
      estado: 'Stock negativo',
      color: 'fondo-rojo',
    }
  }

  if (disponible === 0) {
    return {
      estado: 'Sin stock',
      color: 'fondo-violeta',
    }
  }

  if (disponible <= 5) {
    return {
      estado: 'Stock bajo',
      color: 'fondo-amarillo',
    }
  }

  return {
    estado: 'Disponible',
    color: 'fondo-azul',
  }
}

function formatearFecha(fecha) {
  const coincidencia = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(fecha || ''))

  if (!coincidencia) {
    return '—'
  }

  return `${coincidencia[3]}/${coincidencia[2]}/${coincidencia[1]}`
}

function mapearVarianteStock(variante, ultimoIngresoPorBarcode) {
  const totales = sumarNivelesStock(variante.stockLevels)
  const disponible = totales.stock - totales.reservado
  const estado = obtenerEstadoStock(disponible)

  return {
    id: variante.id,
    barcode: variante.sku,
    producto: variante.product?.name || 'Sin producto',
    variante:
      variante.options?.map((opcion) => opcion.name).join(' / ') ||
      variante.name ||
      'Variante',
    activo: variante.enabled,
    stock: totales.stock,
    reservado: totales.reservado,
    disponible,
    estado: estado.estado,
    color: estado.color,
    ultimoIngreso: ultimoIngresoPorBarcode.get(variante.sku) || '—',
  }
}

async function obtenerTodasLasPaginas(query, nombreResultado, options = {}) {
  const items = []
  let totalItems = 0
  let skip = 0

  do {
    const { data } = await client.query({
      query,
      variables: {
        options: {
          ...options,
          skip,
          take: LIMITE_CONSULTA,
        },
      },
      fetchPolicy: 'network-only',
    })

    const resultado = data[nombreResultado]
    items.push(...resultado.items)
    totalItems = resultado.totalItems
    skip += resultado.items.length

    if (resultado.items.length === 0) {
      break
    }
  } while (skip < totalItems)

  return items
}

export async function obtenerDatosStock() {
  const [variantes, ingresos] = await Promise.all([
    obtenerTodasLasPaginas(OBTENER_VARIANTES_STOCK, 'productVariants', {
      sort: {
        sku: 'ASC',
      },
    }),
    obtenerTodasLasPaginas(OBTENER_INGRESOS_STOCK, 'ingresosStock', {
      sort: {
        createdAt: 'DESC',
      },
    }),
  ])

  const ultimoIngresoPorBarcode = new Map()

  ingresos.forEach((ingreso) => {
    ingreso.detalles.forEach((detalle) => {
      if (!ultimoIngresoPorBarcode.has(detalle.barcode)) {
        ultimoIngresoPorBarcode.set(
          detalle.barcode,
          formatearFecha(ingreso.fechaComprobante),
        )
      }
    })
  })

  return {
    stock: variantes.map((variante) =>
      mapearVarianteStock(variante, ultimoIngresoPorBarcode),
    ),
    ingresos,
  }
}

export async function obtenerProveedores() {
  const proveedores = await obtenerTodasLasPaginas(
    OBTENER_PROVEEDORES,
    'proveedores',
    {
      sort: {
        nombre: 'ASC',
      },
    },
  )

  return proveedores.map((proveedor) => ({
    id: proveedor.id,
    nombre: proveedor.nombre,
    cuit: proveedor.cuit,
    telefono: proveedor.telefono || '',
  }))
}

export async function crearProveedor({ nombre, cuit, telefono }) {
  const input = {
    nombre: validarNombreProveedor(nombre),
    cuit: normalizarCuit(cuit),
    telefono: validarTelefono(telefono),
  }

  const { data } = await client.mutate({
    mutation: CREAR_PROVEEDOR,
    variables: {
      input,
    },
  })

  return data.createProveedor
}

export async function buscarVariantePorBarcode(barcode) {
  const barcodeNormalizado = String(barcode || '').trim()

  if (!barcodeNormalizado) {
    throw new Error('El barcode es obligatorio.')
  }

  if (barcodeNormalizado.length > 100) {
    throw new Error('El barcode no puede superar los 100 caracteres.')
  }

  const { data } = await client.query({
    query: OBTENER_VARIANTES_STOCK,
    variables: {
      options: {
        filter: {
          sku: {
            eq: barcodeNormalizado,
          },
        },
        take: 2,
      },
    },
    fetchPolicy: 'network-only',
  })

  if (data.productVariants.totalItems === 0) {
    return null
  }

  if (data.productVariants.totalItems > 1) {
    throw new Error(`Existe más de una variante con el barcode ${barcodeNormalizado}.`)
  }

  return mapearVarianteStock(data.productVariants.items[0], new Map())
}

export async function registrarIngresoStock({
  proveedorId,
  numeroComprobante,
  fechaComprobante,
  observaciones,
  detalles,
}) {
  if (!proveedorId) {
    throw new Error('Debés seleccionar un proveedor de la lista.')
  }

  const input = {
    proveedorId,
    numeroComprobante: validarNumeroComprobante(numeroComprobante),
    fechaComprobante: validarFechaComprobante(fechaComprobante),
    observaciones: validarObservaciones(observaciones),
    detalles: validarDetalles(detalles),
  }

  const { data } = await client.mutate({
    mutation: REGISTRAR_INGRESO_STOCK,
    variables: {
      input,
    },
  })

  return data.registrarIngresoStock
}

export function filtrarProveedores(proveedores, busqueda) {
  const termino = normalizarBusqueda(busqueda)
  const numerosBuscados = termino.replace(/\D/g, '')

  if (!termino) {
    return []
  }

  return proveedores
    .filter(
      (proveedor) =>
        normalizarBusqueda(proveedor.nombre).includes(termino) ||
        (numerosBuscados && proveedor.cuit.includes(numerosBuscados)),
    )
    .slice(0, 8)
}

export function contarStock(stock) {
  const categorias = {
    disponibles: 0,
    reservadas: 0,
    stockBajo: 0,
    sinStock: 0,
  }

  stock.forEach((item) => {
    categorias.reservadas += item.reservado

    if (item.disponible > 5) {
      categorias.disponibles += 1
    } else if (item.disponible > 0) {
      categorias.stockBajo += 1
    } else {
      categorias.sinStock += 1
    }
  })

  return [
    {
      nombre: 'Disponibles',
      cantidad: categorias.disponibles,
      color: 'fondo-azul',
    },
    {
      nombre: 'Unidades reservadas',
      cantidad: categorias.reservadas,
      color: 'fondo-amarillo',
    },
    {
      nombre: 'Stock bajo',
      cantidad: categorias.stockBajo,
      color: 'fondo-violeta',
    },
    {
      nombre: 'Sin stock',
      cantidad: categorias.sinStock,
      color: 'fondo-verde',
    },
  ]
}
