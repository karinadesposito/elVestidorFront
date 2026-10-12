import { useEffect, useRef, useState } from 'react'
import { Outlet } from 'react-router-dom'

import Barra from './Barra'
import PiePagina from './PiePagina'
import CarritoLateral from './CarritoLateral'

import {
  obtenerCarrito,
  agregarAlCarrito,
  eliminarDelCarrito,
} from '../../servicios/carritoService'

function TiendaLayout() {
  const [carrito, setCarrito] = useState(null)
  const [carritoAbierto, setCarritoAbierto] = useState(false)
  const [cargandoCarrito, setCargandoCarrito] = useState(true)
  const [errorCarrito, setErrorCarrito] = useState('')
  const [lineaEliminandoId, setLineaEliminandoId] = useState(null)

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

    if (solicitudEnCurso.current) {
      return
    }

    solicitudEnCurso.current = true
    setCargandoCarrito(true)
    setErrorCarrito('')

    try {
      const resultado = await obtenerCarrito()
      setCarrito(resultado)
    } catch (fallo) {
      setErrorCarrito(
        fallo.message || 'No pudimos consultar el carrito.',
      )
    } finally {
      solicitudEnCurso.current = false
      setCargandoCarrito(false)
    }
  }

  function cerrarCarrito() {
    setCarritoAbierto(false)
  }

  async function agregarProductoAlCarrito(varianteId) {
    if (solicitudEnCurso.current) {
      throw new Error(
        'Esperá a que termine la actualización del carrito.',
      )
    }

    solicitudEnCurso.current = true
    setCargandoCarrito(true)
    setErrorCarrito('')

    try {
      const resultado = await agregarAlCarrito(varianteId, 1)

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

      throw fallo
    } finally {
      solicitudEnCurso.current = false
      setCargandoCarrito(false)
    }
  }

  async function eliminarProductoDelCarrito(lineaId) {
    if (solicitudEnCurso.current) {
      return
    }

    const id = String(lineaId ?? '').trim()

    if (!id) {
      setErrorCarrito('No pudimos identificar el producto.')
      return
    }

    solicitudEnCurso.current = true
    setCargandoCarrito(true)
    setLineaEliminandoId(id)
    setErrorCarrito('')

    try {
      const resultado = await eliminarDelCarrito(id)
      setCarrito(resultado)
    } catch (fallo) {
      if (fallo.carrito) {
        setCarrito(fallo.carrito)
      }

      setErrorCarrito(
        fallo.message || 'No pudimos eliminar el producto.',
      )
    } finally {
      solicitudEnCurso.current = false
      setCargandoCarrito(false)
      setLineaEliminandoId(null)
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
        lineaEliminandoId={lineaEliminandoId}
        alEliminar={eliminarProductoDelCarrito}
        alCerrar={cerrarCarrito}
      />
    </>
  )
}

export default TiendaLayout