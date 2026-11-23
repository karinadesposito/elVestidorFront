import { FaInstagram } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import Contenedor from '../../componentesReuse/Contenedor'
import { comercio } from '../../datos/comercio'
import logoMarca from '../../recursos/logos/logo-marca.svg'
import logoSimbolo from '../../recursos/logos/logo-simbolo.svg'
import logoJuarezdevs from '../../recursos/logos/logo.Juarezdevs.webp'
import qrDataFiscal from '../../recursos/imagenes/qr-data-fiscal.jpg'


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
          <Link to="/envios">Envíos</Link>
          <Link to="/cambios">Cambios</Link>
          <Link to="/contacto">Contacto</Link>
        </div>

        <div className="pie-pagina__grupo">
          <p>Información</p>
          <a href="/">Nosotros</a>
          <a href="/">Locales</a>
          <Link to="/terminos">Términos</Link>
          <Link to="/privacidad">Privacidad</Link>
        </div>

        <div className="pie-pagina__derecha">
          <a
            className="pie-pagina__instagram"
            href="https://www.instagram.com/elvestidor_grimolditandil/"
            target="_blank"
            rel="noreferrer"
            aria-label="Instagram de El Vestidor"
          >
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

        <div className="pie-pagina__legal">
          <Link className="pie-pagina__arrepentimiento" to="/arrepentimiento">
            Botón de arrepentimiento
          </Link>

          <div className="pie-pagina__comercio">
            <img
              className="pie-pagina__qr"
              src={qrDataFiscal}
              alt={`Data Fiscal de ARCA, CUIT ${comercio.cuit}`}
              loading="lazy"
            />
            <div>
              <p>{comercio.titular} · CUIT {comercio.cuit} · {comercio.condicionIva}</p>
              <p>{comercio.domicilio} · {comercio.horario}</p>
              <p>
                <a href={`mailto:${comercio.email}`}>{comercio.email}</a> · WhatsApp{' '}
                <a href={comercio.whatsappUrl} target="_blank" rel="noreferrer">{comercio.whatsapp}</a>
              </p>
            </div>
          </div>
        </div>
      </Contenedor>
    </footer>
  )
}

export default PiePagina
