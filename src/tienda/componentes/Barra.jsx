
import { useEffect, useRef, useState } from 'react'
import { Link, matchPath, useLocation } from 'react-router-dom'
import {
  FiMenu,
  FiSearch,
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

function Barra({
  alAbrirCarrito,
  cantidadCarrito = 0,
}) {
  const { pathname } = useLocation()

  const esCatalogo = Boolean(
    matchPath({ path: '/:genero', end: true }, pathname) ||
    matchPath({ path: '/:genero/:categoria', end: true }, pathname),
  )

  const [compacta, setCompacta] = useState(false)
  const [menuAbierto, setMenuAbierto] = useState(null)
  const [menuMobileAbierto, setMenuMobileAbierto] = useState(false)
  const [promoActual, setPromoActual] = useState(0)

  const compactaRef = useRef(false)

  useEffect(() => {
    const intervalo = window.setInterval(() => {
      setPromoActual(actual => (actual + 1) % promos.length)
    }, 5000)

    return () => window.clearInterval(intervalo)
  }, [])

  useEffect(() => {
    if (esCatalogo) {
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
      } else if (
        compactaRef.current &&
        scroll <= UMBRAL_EXPANDIR
      ) {
        compactaRef.current = false
        setCompacta(false)
      }
    }

    const manejarScroll = () => {
      if (cuadro !== null) return
      cuadro = window.requestAnimationFrame(actualizar)
    }

    window.addEventListener('scroll', manejarScroll, {
      passive: true,
    })

    manejarScroll()

    return () => {
      window.removeEventListener('scroll', manejarScroll)
      if (cuadro !== null) window.cancelAnimationFrame(cuadro)
    }
  }, [esCatalogo])

  useEffect(() => {
    function manejarClickFuera(evento) {
      if (!evento.target.closest('.barra__item--menu')) {
        setMenuAbierto(null)
      }
    }

    document.addEventListener('mousedown', manejarClickFuera)

    return () => {
      document.removeEventListener('mousedown', manejarClickFuera)
    }
  }, [])

  useEffect(() => {
    setMenuAbierto(null)
    setMenuMobileAbierto(false)
  }, [pathname])

  function cambiarPromo(direccion) {
    setPromoActual(actual =>
      (actual + direccion + promos.length) % promos.length,
    )
  }

  function alternarMenu(menu) {
    setMenuAbierto(actual => actual === menu ? null : menu)
  }

  function cerrarMenu() {
    setMenuAbierto(null)
  }

  function abrirCarrito() {
    setMenuAbierto(null)
    setMenuMobileAbierto(false)
    alAbrirCarrito?.()
  }

  const claseBarra = esCatalogo
    ? 'barra barra--catalogo'
    : `barra${compacta ? ' barra--compacta' : ''}`

  const etiquetaCarrito = cantidadCarrito > 0
    ? `Abrir carrito, ${cantidadCarrito} ${
        cantidadCarrito === 1 ? 'unidad' : 'unidades'
      }`
    : 'Abrir carrito, vacío'

  return (
    <>
      <header className={claseBarra}>
        <div className="barra__beneficio">
          <div className="barra__cinta">
            <button
              type="button"
              className="barra__flecha"
              onClick={() => cambiarPromo(-1)}
              aria-label="Beneficio anterior"
            >
              <FiChevronLeft />
            </button>

            <div className="barra__promo-contenido">
              <img
                className="barra__divisor"
                src={logoSimbolo}
                alt=""
              />

              <span className="barra__promo">
                {promos[promoActual]}
              </span>

              <img
                className="barra__divisor"
                src={logoSimbolo}
                alt=""
              />
            </div>

            <button
              type="button"
              className="barra__flecha"
              onClick={() => cambiarPromo(1)}
              aria-label="Siguiente beneficio"
            >
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

          <Link
            to="/"
            className="barra__marca"
            aria-label="Volver al inicio"
          >
            <img
              aria-hidden="true"
              className="barra__simbolo"
              src={logoSimbolo}
              alt=""
            />

            <img
              className="barra__logo"
              src={logoMarca}
              alt="El Vestidor"
            />
          </Link>

          <nav
            className="barra__nav"
            aria-label="Navegación principal"
          >
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
                SEASONS
              </li>

              <ItemMenu
                titulo="SALE"
                grupos={gruposSale}
                abierto={menuAbierto === 'sale'}
                alAlternar={() => alternarMenu('sale')}
                alCerrar={cerrarMenu}
                destacado
              />
            </ul>
          </nav>

          <div className="barra__acciones">
            <Boton
              aria-label="Buscar"
              className="barra__accion"
              variante="icono"
            >
              <FiSearch />
            </Boton>

            <Boton
              aria-label={etiquetaCarrito}
              aria-haspopup="dialog"
              className="barra__accion"
              variante="icono"
              onClick={abrirCarrito}
            >
              <FiShoppingCart aria-hidden="true" />

              {cantidadCarrito > 0 && (
                <span aria-hidden="true">
                  {cantidadCarrito}
                </span>
              )}
            </Boton>
          </div>
        </Contenedor>
      </header>

      <MenuMobile
        abierto={menuMobileAbierto}
        alCerrar={() => setMenuMobileAbierto(false)}
        categoriasMujer={categoriasMujer}
        categoriasHombre={categoriasHombre}
        gruposSale={gruposSale}
      />
    </>
  )
}

export default Barra
