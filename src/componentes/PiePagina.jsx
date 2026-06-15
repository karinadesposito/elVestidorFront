import { FaInstagram } from 'react-icons/fa'
import Contenedor from './Contenedor'
import logoMarca from '../recursos/logos/logo-marca.svg'
import logoSimbolo from '../recursos/logos/logo-simbolo.svg'
import logoJuarezdevs from '../recursos/logos/logo.Juarezdevs.png'

function PiePagina() {
  return (
    <footer className="pie-pagina">
      <Contenedor className="pie-pagina__contenedor">
        <div className="pie-pagina__marca">
          <div className="pie-pagina__logos">
            <img className="pie-pagina__simbolo" src={logoSimbolo} alt="" />
            <img className="pie-pagina__logo" src={logoMarca} alt="El Vestidor" />
          </div>

         
        </div>

        <div className="pie-pagina__grupo">
          <p>Ayuda</p>
          <a href="/">Envíos</a>
          <a href="/">Cambios</a>
          <a href="/">Contacto</a>
        </div>

        <div className="pie-pagina__grupo">
          <p>Información</p>
          <a href="/">Nosotros</a>
          <a href="/">Locales</a>
          <a href="/">Términos</a>
        </div>

        <div className="pie-pagina__derecha">
          <a className="pie-pagina__instagram" href="/" aria-label="Instagram">
            <FaInstagram />
          </a>

          <a
            className="pie-pagina__juarezdevs"
            href="https://juarezdevs.com.ar"
            target="_blank"
            rel="noreferrer"
            aria-label="JuarezDevs"
          >
            <img src={logoJuarezdevs} alt="JuarezDevs" />
          </a>
        </div>
      </Contenedor>
    </footer>
  )
}

export default PiePagina
