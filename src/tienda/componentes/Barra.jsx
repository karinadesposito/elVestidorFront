
import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  FiMenu,
  FiSearch,
  FiX,
  FiShoppingCart,
  FiChevronLeft,
  FiChevronRight,
} from 'react-icons/fi'

import logoSimbolo from '../../recursos/logos/logo-simbolo.svg'
import logoMarca from '../../recursos/logos/logo-marca.svg'
import Boton from '../../componentesReuse/Boton'
import ItemMenu from '../../componentesReuse/ItemMenu'
import MenuMobile from '../../componentesReuse/MenuMobile'
import Contenedor from '../../componentesReuse/Contenedor'
import {
  categoriasHombre,
  categoriasMujer,
  gruposSale,
} from '../../datos/navegacion'

const promos = [
  '3 cuotas sin interés',
  'Envíos a todo el país',
  'Cambios simples',
]

const UMBRAL_COMPACTAR = 100
const UMBRAL_EXPANDIR = 40

function Barra({ alAbrirCarrito, cantidadCarrito = 0, alAbrirSale }) {
  const { pathname } = useLocation()
  const navegar = useNavigate()
  const esInicio = pathname === '/'

  const [compacta, setCompacta] = useState(false)
  const [menuAbierto, setMenuAbierto] = useState(null)
  const [menuMobileAbierto, setMenuMobileAbierto] = useState(false)
  const [promoActual, setPromoActual] = useState(0)
  const [buscadorAbierto, setBuscadorAbierto] = useState(false)
  const [busqueda, setBusqueda] = useState('')

  const compactaRef = useRef(false)

  useEffect(() => {
    const intervalo = window.setInterval(() => {
      setPromoActual(actual => (actual + 1) % promos.length)
    }, 5000)
    return () => window.clearInterval(intervalo)
  }, [])

  useEffect(() => {
    if (!esInicio) {
      compactaRef.current = false
      setCompacta(false)
      return undefined
    }

    let cuadro = null
    const actualizar = () => {
      cuadro = null
      const scroll = Math.max(0, window.scrollY)
      if (!compactaRef.current && scroll >= UMBRAL_COMPACTAR) {
        compactaRef.current = true
        setCompacta(true)
      } else if (compactaRef.current && scroll <= UMBRAL_EXPANDIR) {
        compactaRef.current = false
        setCompacta(false)
      }
    }

    const manejarScroll = () => {
      if (cuadro !== null) return
      cuadro = window.requestAnimationFrame(actualizar)
    }

    window.addEventListener('scroll', manejarScroll, { passive: true })
    manejarScroll()

    return () => {
      window.removeEventListener('scroll', manejarScroll)
      if (cuadro !== null) window.cancelAnimationFrame(cuadro)
    }
  }, [esInicio])

  useEffect(() => {
    function manejarClickFuera(evento) {
      if (!evento.target.closest('.barra__item--menu')) {
        setMenuAbierto(null)
      }
    }
    document.addEventListener('mousedown', manejarClickFuera)
    return () => document.removeEventListener('mousedown', manejarClickFuera)
  }, [])

  useEffect(() => {
    setMenuAbierto(null)
    setMenuMobileAbierto(false)
    setBuscadorAbierto(false)
  }, [pathname])

  function buscar(evento) {
    evento.preventDefault()
    buscarTexto(busqueda)
  }

  function buscarTexto(valor) {
    const texto = valor.trim()
    if (!texto) return
    setBusqueda(texto)
    setBuscadorAbierto(false)
    setMenuMobileAbierto(false)
    navegar(`/catalogo?q=${encodeURIComponent(texto)}`)
  }

  function cambiarPromo(direccion) {
    setPromoActual(actual => (actual + direccion + promos.length) % promos.length)
  }

  function alternarMenu(menu) {
    setMenuAbierto(actual => (actual === menu ? null : menu))
  }

  function cerrarMenu() {
    setMenuAbierto(null)
  }

  function abrirCarrito() {
    setMenuAbierto(null)
    setMenuMobileAbierto(false)
    alAbrirCarrito?.()
  }

  function abrirSale() {
    setMenuAbierto(null)
    setMenuMobileAbierto(false)
    alAbrirSale?.()
  }

  const claseBarra = esInicio
    ? `barra${compacta ? ' barra--compacta' : ''}`
    : 'barra barra--compacta barra--catalogo'

  const etiquetaCarrito = cantidadCarrito > 0
    ? `Abrir carrito, ${cantidadCarrito} ${cantidadCarrito === 1 ? 'unidad' : 'unidades'}`
    : 'Abrir carrito, vacío'

  return (
    <>
      <header className={claseBarra}>
        <div className="barra__beneficio">
          <div className="barra__cinta">
            <button type="button" className="barra__flecha" onClick={() => cambiarPromo(-1)} aria-label="Beneficio anterior">
              <FiChevronLeft />
            </button>
            <div className="barra__promo-contenido">
              <img className="barra__divisor" src={logoSimbolo} alt="" />
              <span className="barra__promo">{promos[promoActual]}</span>
              <img className="barra__divisor" src={logoSimbolo} alt="" />
            </div>
            <button type="button" className="barra__flecha" onClick={() => cambiarPromo(1)} aria-label="Beneficio siguiente">
              <FiChevronRight />
            </button>
          </div>
        </div>

        <Contenedor className="barra__contenedor">
          <button
            type="button"
            className="barra__hamburguesa"
            onClick={() => setMenuMobileAbierto(true)}
            aria-label="Abrir menú"
            aria-expanded={menuMobileAbierto}
          >
            <FiMenu />
          </button>

          <Link to="/" className="barra__marca" aria-label="Volver al inicio">
            <img aria-hidden="true" className="barra__simbolo" src={logoSimbolo} alt="" />
            <img className="barra__logo" src={logoMarca} alt="El Vestidor" />
          </Link>

          <nav className="barra__nav" aria-label="Navegación principal">
            <ul className="barra__lista">
              <ItemMenu
                titulo="MUJER"
                items={categoriasMujer}
                abierto={menuAbierto === 'mujer'}
                alAlternar={() => alternarMenu('mujer')}
                alCerrar={cerrarMenu}
              />
              <ItemMenu
                titulo="HOMBRE"
                items={categoriasHombre}
                abierto={menuAbierto === 'hombre'}
                alAlternar={() => alternarMenu('hombre')}
                alCerrar={cerrarMenu}
              />
              <li className="barra__item">
                <Link to="/seasons" onClick={cerrarMenu}>SEASONS</Link>
              </li>
              <ItemMenu
                titulo="SALE"
                grupos={gruposSale}
                abierto={false}
                alAlternar={() => alternarMenu('sale')}
                alCerrar={cerrarMenu}
                alAbrirSale={abrirSale}
                destacado
              />
            </ul>
          </nav>

          <div className="barra__acciones">
            <Boton aria-label="Buscar" aria-expanded={buscadorAbierto || menuMobileAbierto} className="barra__accion" variante="icono" onClick={() => {
              if (window.matchMedia('(max-width: 47.99rem)').matches) {
                setMenuMobileAbierto(true)
              } else {
                setBuscadorAbierto(actual => !actual)
              }
            }}>
              <FiSearch />
            </Boton>
            {buscadorAbierto && (
            <form className="barra__buscador" role="search" onSubmit={buscar}>
              <input
                aria-label="Buscar productos"
                maxLength={100}
                onChange={evento => setBusqueda(evento.target.value)}
                placeholder="Ingrese su búsqueda"
                type="search"
                value={busqueda}
              />
             
            </form>
            )}
            <Boton
              aria-label={etiquetaCarrito}
              aria-haspopup="dialog"
              className="barra__accion"
              variante="icono"
              onClick={abrirCarrito}
            >
              <FiShoppingCart aria-hidden="true" />
              {cantidadCarrito > 0 && <span aria-hidden="true">{cantidadCarrito}</span>}
            </Boton>
          </div>
        </Contenedor>
      </header>

      {buscadorAbierto && (
        <div className="menu-mobile barra__buscador">
          <button type="button" className="menu-mobile__fondo" onClick={() => setBuscadorAbierto(false)} aria-label="Cerrar búsqueda" />
          <aside className="menu-mobile__panel" aria-label="Buscar productos">
            <div className="menu-mobile__encabezado">
              <button type="button" className="menu-mobile__cerrar" onClick={() => setBuscadorAbierto(false)} aria-label="Cerrar búsqueda"><FiX /></button>
            </div>
            <form role="search" onSubmit={buscar} onKeyDown={evento => {
              if (evento.key === 'Escape') setBuscadorAbierto(false)
            }}>
              <FiSearch aria-hidden="true" />
              <input
                aria-label="Buscar productos"
                autoFocus
                maxLength={100}
                onChange={evento => setBusqueda(evento.target.value)}
                placeholder="Buscá tu producto aquí"
                type="search"
                value={busqueda}
              />
            </form>
            <nav className="menu-mobile__nav" aria-label="Términos sugeridos">
              <h2 className="menu-mobile__grupo-titulo">TÉRMINOS MÁS BUSCADOS</h2>
              {['Jeans', 'Remeras', 'Camperas', 'Pantalones'].map(termino => (
                <button key={termino} type="button" className="menu-mobile__principal" onClick={() => buscarTexto(termino)}>{termino}</button>
              ))}
            </nav>
          </aside>
        </div>
      )}

      <MenuMobile
        abierto={menuMobileAbierto}
        alCerrar={() => setMenuMobileAbierto(false)}
        categoriasMujer={categoriasMujer}
        categoriasHombre={categoriasHombre}
        gruposSale={gruposSale}
        alAbrirSale={abrirSale}
        busqueda={busqueda}
        alCambiarBusqueda={setBusqueda}
        alBuscar={buscarTexto}
      />
    </>
  )
}

export default Barra
