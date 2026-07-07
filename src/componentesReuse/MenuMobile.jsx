import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FiChevronDown, FiX } from 'react-icons/fi'
import logoSimbolo from '../recursos/logos/logo-simbolo.svg'
import logoMarca from '../recursos/logos/logo-marca.svg'

function MenuMobile({
  abierto,
  alCerrar,
  categoriasMujer,
  categoriasHombre,
  gruposSale,
}) {
  const [seccionAbierta, setSeccionAbierta] = useState(null)

  if (!abierto) return null

  function alternarSeccion(seccion) {
    setSeccionAbierta((actual) => (actual === seccion ? null : seccion))
  }

  return (
    <div className="menu-mobile">
      <button
        type="button"
        className="menu-mobile__fondo"
        onClick={alCerrar}
        aria-label="Cerrar menú"
      />

      <aside className="menu-mobile__panel">
        <div className="menu-mobile__encabezado">
          <div className="menu-mobile__marca">
            <img className="menu-mobile__simbolo" src={logoSimbolo} alt="" />
            <img className="menu-mobile__logo" src={logoMarca} alt="El Vestidor" />
          </div>

          <button
            type="button"
            className="menu-mobile__cerrar"
            onClick={alCerrar}
            aria-label="Cerrar menú"
          >
            <FiX />
          </button>
        </div>

        <nav className="menu-mobile__nav" aria-label="Navegación mobile">
          <button
            type="button"
            className="menu-mobile__principal"
            onClick={() => alternarSeccion('mujer')}
          >
            MUJER
            <FiChevronDown />
          </button>

          {seccionAbierta === 'mujer' && (
            <ul className="menu-mobile__sublista">
              {categoriasMujer.map((item) => (
                <li key={item.titulo}>
                  <Link to={item.ruta} onClick={alCerrar}>
                    {item.titulo}
                  </Link>
                </li>
              ))}
            </ul>
          )}

          <button
            type="button"
            className="menu-mobile__principal"
            onClick={() => alternarSeccion('hombre')}
          >
            HOMBRE
            <FiChevronDown />
          </button>

          {seccionAbierta === 'hombre' && (
            <ul className="menu-mobile__sublista">
              {categoriasHombre.map((item) => (
                <li key={item.titulo}>
                  <Link to={item.ruta} onClick={alCerrar}>
                    {item.titulo}
                  </Link>
                </li>
              ))}
            </ul>
          )}

          <button
            type="button"
            className="menu-mobile__principal menu-mobile__principal--sale"
            onClick={() => alternarSeccion('sale')}
          >
            SALE
            <FiChevronDown />
          </button>

          {seccionAbierta === 'sale' && (
            <div className="menu-mobile__sale">
              {gruposSale.map((grupo) => (
                <div className="menu-mobile__grupo" key={grupo.titulo}>
                  <p className="menu-mobile__grupo-titulo">{grupo.titulo}</p>

                  <ul className="menu-mobile__sublista">
                    {grupo.items.map((item) => (
                      <li key={`${grupo.titulo}-${item.titulo}`}>
                        <Link to={item.ruta} onClick={alCerrar}>
                          {item.titulo}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          <button type="button" className="menu-mobile__principal">
            SEASONS
            <FiChevronDown />
          </button>
        </nav>
      </aside>
    </div>
  )
}

export default MenuMobile
