function Card({ imagen, ancho, alto, nombre, onClick }) {
  return (
    <article
      className="card"
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="card__visual" aria-hidden="true">
        <img src={imagen} alt="" width={ancho} height={alto} />
      </div>

      <h3 className="card__nombre">{nombre}</h3>
    </article>
  )
}

export default Card
