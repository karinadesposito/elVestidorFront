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
        <div className={`barra__dropdown${tieneGrupos ? ' barra__dropdown--grupos' : ''}`}>
          {tieneGrupos ? (
            <div className="barra__dropdown-grupos">
              {grupos.map((grupo) => (
                <div className="barra__dropdown-grupo" key={grupo.titulo}>
                  <p className="barra__dropdown-titulo">{grupo.titulo}</p>

                  <ul className="barra__dropdown-lista">
                    {grupo.items.map((item) => (
                      <li key={`${grupo.titulo}-${item.titulo}`}>
                        <button
                          type="button"
                          className="barra__dropdown-item"
                          onClick={alCerrar}
                        >
                          {item.titulo}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ) : (
            <ul className="barra__dropdown-lista">
              {items.map((item) => (
                <li key={item.titulo}>
                  <button
                    type="button"
                    className="barra__dropdown-item"
                    onClick={alCerrar}
                  >
                    {item.titulo}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </li>
  )
}

export default ItemMenu