import { Fragment, useEffect, useState } from 'react'
import { FiSearch, FiShoppingCart } from 'react-icons/fi'
import logoSimbolo from '../recursos/logos/logo-simbolo.svg'
import logoMarca from '../recursos/logos/logo-marca.svg'
import Boton from './Boton'
import Contenedor from './Contenedor'

const promos = [
  '3 cuotas sin interés',
  'Envíos a todo el país',
  'Cambios simples',
]

function Barra() {
  const [compacta, setCompacta] = useState(false)

  useEffect(() => {
    const manejarScroll = () => setCompacta(window.scrollY > 0)
    window.addEventListener('scroll', manejarScroll, { passive: true })
    manejarScroll()
    return () => window.removeEventListener('scroll', manejarScroll)
  }, [])

  return (
    <header className={`barra${compacta ? ' barra--compacta' : ''}`}>
      <div className="barra__beneficio">
        <div className="barra__cinta">
          {Array.from({ length: 8 }, () => promos).flat().map((texto, i) => (
            <Fragment key={i}>
              <span className="barra__promo">{texto}</span>
              <img className="barra__divisor" src={logoSimbolo} alt="" width="512" height="512" />
            </Fragment>
          ))}
        </div>
      </div>

      <Contenedor className="barra__contenedor">
        <div className="barra__marca">
          <img
            aria-hidden="true"
            className="barra__simbolo"
            src={logoSimbolo}
            alt=""
          />
          <img className="barra__logo" src={logoMarca} alt="El Vestidor" />
        </div>

        <nav className="barra__nav" aria-label="Navegacion principal">
          <ul className="barra__lista">
            <li className="barra__item">Calzado</li>
            <li className="barra__item">Ropa</li>
            <li className="barra__item">Accesorios</li>
            <li className="barra__item barra__item--sale">Sale</li>
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
  )
}

export default Barra
