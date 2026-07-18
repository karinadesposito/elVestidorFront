import { useParams } from 'react-router-dom'
import Contenedor from '../componentesReuse/Contenedor'
import ProductoCard from '../componentesReuse/ProductoCard'
import { productos } from '../datos/productos'
import '../estilos/Categoria.css'

function obtenerVariantesActivas(producto) {
  return producto.variantes.filter((variante) => variante.activo)
}

function obtenerPrecioDesde(producto) {
  const precios = obtenerVariantesActivas(producto).map((variante) => variante.precio)

  if (!precios.length) {
    return null
  }

  return Math.min(...precios)
}

function formatearTitulo(texto) {
  if (!texto) {
    return 'Todo'
  }

  return texto
    .split('-')
    .map((parte) => parte.charAt(0).toUpperCase() + parte.slice(1))
    .join(' ')
}

function Categoria() {
  const { genero, categoria } = useParams()
  const esSale = genero === 'sale'
  const generoFiltro = esSale ? categoria : genero
  const categoriaFiltro = esSale ? null : categoria
  const productosFiltrados = productos.filter((producto) => {
    if (esSale) {
      return false
    }

    const coincideGenero = producto.genero === generoFiltro
    const coincideCategoria =
      !categoriaFiltro || producto.categorias.includes(categoriaFiltro)

    return coincideGenero && coincideCategoria
  })
  const titulo = esSale
    ? `Sale ${formatearTitulo(categoria)}`
    : categoria
      ? formatearTitulo(categoria)
      : formatearTitulo(genero)

  return (
    <main className="categoria seccion">
      <Contenedor>
        <header className="categoria__encabezado">
          <h1>{titulo}</h1>
        </header>

        {productosFiltrados.length > 0 ? (
          <section className="grilla grilla--productos categoria__grilla" aria-label={`Productos de ${titulo}`}>
            {productosFiltrados.map((producto) => {
              const precioDesde = obtenerPrecioDesde(producto)

              return (
                <ProductoCard
                  key={producto.id}
                  producto={producto}
                  precioDesde={precioDesde}
                />
              )
            })}
          </section>
        ) : (
          <section className="categoria__vacio">
            <h2>Sin productos cargados</h2>
            <p>Volveremos a sumar novedades en esta categoria.</p>
          </section>
        )}
      </Contenedor>
    </main>
  )
}

export default Categoria
