const formatoPrecio = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0,
})

function ProductoCard({ producto, precioDesde }) {
  const imagenPrincipal = producto.imagenes[0]

  return (
    <article className="tarjeta producto-card">
      <div className="producto-card__imagen">
        <img src={imagenPrincipal.src} alt={imagenPrincipal.alt} />
      </div>

      <div className="producto-card__info">
        <span className="texto-etiqueta">{producto.marca}</span>
        <h2>{producto.nombre}</h2>
        <p>{precioDesde ? formatoPrecio.format(precioDesde) : 'Consultar'}</p>
      </div>
    </article>
  )
}

export default ProductoCard
