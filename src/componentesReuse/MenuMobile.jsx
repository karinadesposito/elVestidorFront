
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FiChevronDown, FiX } from 'react-icons/fi'

import logoSimbolo from '../recursos/logos/logo-simbolo.svg'
import logoMarca from '../recursos/logos/logo-marca.svg'

function MenuMobile({
  abierto,
  alCerrar,
  categoriasMujer = [],
  categoriasHombre = [],
  gruposSale = [],
}) {
  const [seccionAbierta, setSeccionAbierta] = useState(null)

  if (!abierto) return null

  function alternarSeccion(seccion) {
    setSeccionAbierta(actual =>
      actual === seccion ? null : seccion,
    )
  }

  function cerrarMenu() {
    setSeccionAbierta(null)
    alCerrar()
  }

  function renderizarCategorias(categorias, prefijo = '') {
    return categorias.map((item, indice) => {
      const clave = `${prefijo}${item.titulo}-${indice}`

      if (item.tipo === 'separador') {
        return (
          <li
            key={clave}
            className="menu-mobile__separador"
          >
            <span className="menu-mobile__separador-titulo">
              {item.titulo}
            </span>
          </li>
        )
      }

      return (
        <li key={clave}>
          <Link
            to={item.ruta}
            onClick={cerrarMenu}
          >
            {item.titulo}
          </Link>
        </li>
      )
    })
  }

  return (
    <div className="menu-mobile">
      <button
        type="button"
        className="menu-mobile__fondo"
        onClick={cerrarMenu}
        aria-label="Cerrar menú"
      />

      <aside className="menu-mobile__panel">
        <div className="menu-mobile__encabezado">
          <div className="menu-mobile__marca">
            <img
              className="menu-mobile__simbolo"
              src={logoSimbolo}
              alt=""
            />

            <img
              className="menu-mobile__logo"
              src={logoMarca}
              alt="El Vestidor"
            />
          </div>

          <button
            type="button"
            className="menu-mobile__cerrar"
            onClick={cerrarMenu}
            aria-label="Cerrar menú"
          >
            <FiX />
          </button>
        </div>

        <nav
          className="menu-mobile__nav"
          aria-label="Navegación mobile"
        >
          <button
            type="button"
            className="menu-mobile__principal"
            onClick={() => alternarSeccion('mujer')}
            aria-expanded={seccionAbierta === 'mujer'}
          >
            MUJER
            <FiChevronDown />
          </button>

          {seccionAbierta === 'mujer' && (
            <ul className="menu-mobile__sublista">
              {renderizarCategorias(
                categoriasMujer,
                'mujer-',
              )}
            </ul>
          )}

          <button
            type="button"
            className="menu-mobile__principal"
            onClick={() => alternarSeccion('hombre')}
            aria-expanded={seccionAbierta === 'hombre'}
          >
            HOMBRE
            <FiChevronDown />
          </button>

          {seccionAbierta === 'hombre' && (
            <ul className="menu-mobile__sublista">
              {renderizarCategorias(
                categoriasHombre,
                'hombre-',
              )}
            </ul>
          )}

          <button
            type="button"
            className="menu-mobile__principal menu-mobile__principal--sale"
            onClick={() => alternarSeccion('sale')}
            aria-expanded={seccionAbierta === 'sale'}
          >
            SALE
            <FiChevronDown />
          </button>

          {seccionAbierta === 'sale' && (
            <div className="menu-mobile__sale">
              {gruposSale.map(grupo => (
                <div
                  className="menu-mobile__grupo"
                  key={grupo.titulo}
                >
                  <p className="menu-mobile__grupo-titulo">
                    {grupo.titulo}
                  </p>

                  <ul className="menu-mobile__sublista">
                    {renderizarCategorias(
                      grupo.items,
                      `sale-${grupo.titulo}-`,
                    )}
                  </ul>
                </div>
              ))}
            </div>
          )}

          <button
            type="button"
            className="menu-mobile__principal"
          >
            SEASONS
            <FiChevronDown />
          </button>
        </nav>
      </aside>
    </div>
  )
}

export default MenuMobile

