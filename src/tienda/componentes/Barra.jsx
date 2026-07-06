import { Fragment, useEffect, useState } from 'react'
import { FiMenu, FiSearch, FiShoppingCart } from 'react-icons/fi'
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

function Barra() {
  const [compacta, setCompacta] = useState(false)
  const [menuAbierto, setMenuAbierto] = useState(null)
  const [menuMobileAbierto, setMenuMobileAbierto] = useState(false)

  useEffect(() => {
    const manejarScroll = () => setCompacta(window.scrollY > 0)

    window.addEventListener('scroll', manejarScroll, { passive: true })
    manejarScroll()

    return () => window.removeEventListener('scroll', manejarScroll)
  }, [])

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

  function alternarMenu(menu) {
    setMenuAbierto((actual) => (actual === menu ? null : menu))
  }

  function cerrarMenu() {
    setMenuAbierto(null)
  }

  return (
    <>
      <header className={`barra${compacta ? ' barra--compacta' : ''}`}>
        <div className="barra__beneficio">
          <div className="barra__cinta">
            {Array.from({ length: 8 }, () => promos)
              .flat()
              .map((texto, i) => (
                <Fragment key={i}>
                  <span className="barra__promo">{texto}</span>
                  <img
                    className="barra__divisor"
                    src={logoSimbolo}
                    alt=""
                    width="512"
                    height="512"
                  />
                </Fragment>
              ))}
          </div>
        </div>

        <Contenedor className="barra__contenedor">
          <button
            type="button"
            className="barra__hamburguesa"
            onClick={() => setMenuMobileAbierto(true)}
            aria-label="Abrir menú"
          >
            <FiMenu />
          </button>

          <div className="barra__marca">
            <img
              aria-hidden="true"
              className="barra__simbolo"
              src={logoSimbolo}
              alt=""
            />
            <img className="barra__logo" src={logoMarca} alt="El Vestidor" />
          </div>

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

              <li className="barra__item">SEASONS</li>

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
              aria-label="Carrito"
              className="barra__accion"
              variante="icono"
            >
              <FiShoppingCart />
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
