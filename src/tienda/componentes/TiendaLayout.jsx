
import { useEffect, useRef, useState } from 'react'
import { Outlet } from 'react-router-dom'

import Barra from './Barra'
import PiePagina from './PiePagina'
import CarritoLateral from './CarritoLateral'
import { recuperarCarritoParaEditar } from '../../servicios/checkoutService'

import {
  obtenerCarrito,
  agregarAlCarrito,
  eliminarDelCarrito,
  actualizarCantidadCarrito,
} from '../../servicios/carritoService'

function TiendaLayout() {
  const [carrito, setCarrito] = useState(null)
  const [carritoAbierto, setCarritoAbierto] = useState(false)
  const [cargandoCarrito, setCargandoCarrito] = useState(true)
  const [errorCarrito, setErrorCarrito] = useState('')
  const [lineaEliminandoId, setLineaEliminandoId] = useState(null)
  const [lineaActualizandoId, setLineaActualizandoId] = useState(null)
  const [errorLinea, setErrorLinea] = useState(null)

  const solicitudEnCurso = useRef(true)

  useEffect(() => {
    let activo = true
    solicitudEnCurso.current = true

    async function cargarCarritoInicial() {
      try {
        const resultado = await obtenerCarrito()

        if (activo) {
          setCarrito(resultado)
          setErrorCarrito('')
        }
      } catch (fallo) {
        if (activo) {
          setErrorCarrito(
            fallo.message || 'No pudimos consultar el carrito.',
          )
        }
      } finally {
        if (activo) {
          solicitudEnCurso.current = false
          setCargandoCarrito(false)
        }
      }
    }

    cargarCarritoInicial()

    return () => {
      activo = false
    }
  }, [])

  async function abrirCarrito() {
    setCarritoAbierto(true)

    if (solicitudEnCurso.current) return

    solicitudEnCurso.current = true
    setCargandoCarrito(true)
    setErrorCarrito('')
    setErrorLinea(null)

    try {
      setCarrito(await obtenerCarrito())
    } catch (fallo) {
      setErrorCarrito(
        fallo.message || 'No pudimos consultar el carrito.',
      )
    } finally {
      solicitudEnCurso.current = false
      setCargandoCarrito(false)
    }
  }

  // Cierra el panel lateral del carrito.
  function cerrarCarrito() {
    setCarritoAbierto(false)
  }

  async function agregarProductoAlCarrito(varianteId, cantidad = 1) {
    if (solicitudEnCurso.current) {
      throw new Error(
        'Esperá a que termine la actualización del carrito.',
      )
    }

    if (!Number.isInteger(cantidad) || cantidad < 1) {
      throw new Error('La cantidad seleccionada no es válida.')
    }

    solicitudEnCurso.current = true
    setCargandoCarrito(true)
    setErrorCarrito('')
    setErrorLinea(null)

    try {
      const resultado = await agregarAlCarrito(varianteId, cantidad)

      setCarrito(resultado)
      setCarritoAbierto(true)

      return resultado
    } catch (fallo) {
      if (fallo.carrito) {
        setCarrito(fallo.carrito)
      }

      setErrorCarrito(
        fallo.message || 'No pudimos agregar el producto.',
      )

      setCarritoAbierto(true)
      throw fallo
    } finally {
      solicitudEnCurso.current = false
      setCargandoCarrito(false)
    }
  }

  async function recuperarCarrito() {
    if (solicitudEnCurso.current) return

    const id = carrito?.id
    if (!id) {
      setErrorCarrito('No encontramos el pedido para recuperar.')
      return
    }

    solicitudEnCurso.current = true
    setCargandoCarrito(true)
    setErrorCarrito('')
    setErrorLinea(null)

    try {
      await recuperarCarritoParaEditar(id)
      setCarrito(await obtenerCarrito())
    } catch (fallo) {
      setErrorCarrito(
        fallo.message || 'No pudimos volver a editar tu carrito.',
      )
      try {
        setCarrito(await obtenerCarrito())
      } catch {
        // Conservamos el error y el estado previo si falla la consulta.
      }
    } finally {
      solicitudEnCurso.current = false
      setCargandoCarrito(false)
    }
  }

  async function eliminarProductoDelCarrito(lineaId) {
    if (solicitudEnCurso.current) return

    const id = String(lineaId ?? '').trim()

    if (!id) {
      setErrorCarrito('No pudimos identificar el producto.')
      return
    }

    solicitudEnCurso.current = true
    setCargandoCarrito(true)
    setLineaEliminandoId(id)
    setErrorCarrito('')
    setErrorLinea(null)

    try {
      setCarrito(await eliminarDelCarrito(id))
    } catch (fallo) {
      if (fallo.carrito) {
        setCarrito(fallo.carrito)
      }

      setErrorLinea({
        id,
        mensaje: fallo.message || 'No pudimos eliminar el producto.',
      })
    } finally {
      solicitudEnCurso.current = false
      setCargandoCarrito(false)
      setLineaEliminandoId(null)
    }
  }

  async function cambiarCantidadProducto(lineaId, cantidad) {
    if (solicitudEnCurso.current) return

    const id = String(lineaId ?? '').trim()

    if (!id || !Number.isInteger(cantidad) || cantidad < 1) {
      return
    }

    const linea = carrito?.lineas?.find(
      item => String(item.id) === id,
    )

    if (!linea || linea.cantidad === cantidad) return

    if (carrito?.estado !== 'AddingItems') {
      setErrorLinea({
        id,
        mensaje:
          'Este pedido está en proceso de pago y no puede modificarse.',
      })
      return
    }

    solicitudEnCurso.current = true
    setCargandoCarrito(true)
    setLineaActualizandoId(id)
    setErrorCarrito('')
    setErrorLinea(null)

    try {
      const resultado = await actualizarCantidadCarrito(id, cantidad)
      setCarrito(resultado)
    } catch (fallo) {
      if (fallo.carrito) {
        setCarrito(fallo.carrito)
      }

      setErrorLinea({
        id,
        mensaje: fallo.message || 'No pudimos cambiar la cantidad.',
      })
    } finally {
      solicitudEnCurso.current = false
      setCargandoCarrito(false)
      setLineaActualizandoId(null)
    }
  }

  return (
    <>
      <Barra
        alAbrirCarrito={abrirCarrito}
        cantidadCarrito={carrito?.cantidadTotal || 0}
      />

      <Outlet
        context={{
          carrito,
          agregarProductoAlCarrito,
          eliminarProductoDelCarrito,
          cargandoCarrito,
        }}
      />

      <PiePagina />

      <CarritoLateral
        abierto={carritoAbierto}
        carrito={carrito}
        cargando={cargandoCarrito}
        error={errorCarrito}
        errorLinea={errorLinea}
        lineaEliminandoId={lineaEliminandoId}
        lineaActualizandoId={lineaActualizandoId}
        alEliminar={eliminarProductoDelCarrito}
        alRecuperar={recuperarCarrito}
        alCambiarCantidad={cambiarCantidadProducto}
        alCerrar={cerrarCarrito}
      />
    </>
  )
}

export default TiendaLayout
