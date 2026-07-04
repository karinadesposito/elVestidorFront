function ItemMenu({
  titulo,
  items = [],
  abierto,
  alAlternar,
  alCerrar,
}) {
  return (
    <li className={`barra__item barra__item--menu${abierto ? ' barra__item--abierto' : ''}`}>
      <button
        type="button"
        className="barra__boton-menu"
        onClick={alAlternar}
        aria-expanded={abierto}
      >
        {titulo}
      </button>

      {abierto && (
        <div className="barra__dropdown">
          <ul className="barra__dropdown-lista">
            {items.map((item) => (
              <li key={item}>
                <button
                  type="button"
                  className="barra__dropdown-item"
                  onClick={alCerrar}
                >
                  {item}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </li>
  )
}

export default ItemMenu