import logoSimbolo from '../recursos/logos/logo-simbolo.svg'
import logoMarca from '../recursos/logos/logo-marca.svg'
import Boton from './Boton'
import Contenedor from './Contenedor'

function Barra() {
  return (
    <header className="barra">
      <p className="barra__beneficio">
        3 cuotas sin interes / Envios a todo el pais / Cambios simples
      </p>

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
            <li className="barra__item">Indumentaria</li>
            <li className="barra__item">Accesorios</li>
            <li className="barra__item">Sale</li>
          </ul>
        </nav>

        <div className="barra__acciones">
          <Boton
            aria-label="Buscar"
            className="barra__accion barra__accion--buscar"
            variante="icono"
          >
            <span className="barra__accion-texto">Buscar</span>
          </Boton>
          <Boton
            aria-label="Carrito"
            className="barra__accion barra__accion--carrito"
            variante="icono"
          >
            <span className="barra__accion-texto">Carrito</span>
          </Boton>
        </div>
      </Contenedor>
    </header>
  )
}

export default Barra
