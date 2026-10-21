
import { Link } from 'react-router-dom'

function ItemMenu({
  titulo,
  items = [],
  grupos = [],
  abierto,
  alAlternar,
  alCerrar,
  destacado = false,
}) {
  const tieneGrupos = grupos.length > 0

  function renderizarItems(lista, prefijo = '') {
    return lista.map((item, indice) => {
      const identificador = `${prefijo}${item.titulo}-${indice}`

      if (item.tipo === 'separador') {
        return (
          <li
            key={identificador}
            className="barra__dropdown-separador"
          >
            <span className="barra__dropdown-titulo">
              {item.titulo}
            </span>
          </li>
        )
      }

      return (
        <li key={identificador}>
          <Link
            to={item.ruta}
            className="barra__dropdown-item"
            onClick={alCerrar}
          >
            {item.titulo}
          </Link>
        </li>
      )
    })
  }

  return (
    <li
      className={`barra__item barra__item--menu${
        abierto ? ' barra__item--abierto' : ''
      }${destacado ? ' barra__item--sale' : ''}`}
    >
      <button
        type="button"
        className="barra__boton-menu"
        onClick={alAlternar}
        aria-expanded={abierto}
      >
        {titulo}
      </button>

      {abierto && (
        <div
          className={`barra__dropdown${
            tieneGrupos
              ? ' barra__dropdown--grupos'
              : ''
          }`}
        >
          {tieneGrupos ? (
            <div className="barra__dropdown-grupos">
              {grupos.map(grupo => (
                <div
                  className="barra__dropdown-grupo"
                  key={grupo.titulo}
                >
                  <p className="barra__dropdown-titulo">
                    {grupo.titulo}
                  </p>

                  <ul className="barra__dropdown-lista">
                    {renderizarItems(
                      grupo.items,
                      `${grupo.titulo}-`,
                    )}
                  </ul>
                </div>
              ))}
            </div>
          ) : (
            <ul className="barra__dropdown-lista">
              {renderizarItems(items)}
            </ul>
          )}
        </div>
      )}
    </li>
  )
}

export default ItemMenu
