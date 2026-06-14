import Contenedor from './Contenedor'
import calzadoImg from '../recursos/imagenes/puerta.jpeg'
import ropaImg from '../recursos/imagenes/brooklin.jpg'
import accesoriosImg from '../recursos/imagenes/magicTandil.png'
import saleImg from '../recursos/imagenes/pasillo.jpeg'

const categorias = [
  { nombre: 'Calzado', imagen: calzadoImg, ancho: 721, alto: 1600 },
  { nombre: 'Ropa', imagen: ropaImg, ancho: 308, alto: 403 },
  { nombre: 'Accesorios', imagen: accesoriosImg, ancho: 1536, alto: 1024 },
  { nombre: 'Sale', imagen: saleImg, ancho: 721, alto: 1600 },
]

function Categorias() {
  return (
    <section className="seccion categorias">
      <Contenedor>
        <div className="categorias__encabezado">
          <p className="texto-etiqueta">Compra por categoria</p>
          <h2>Elegidos para empezar por donde quieras.</h2>
        </div>

        <div className="grilla categorias__grilla">
          {categorias.map((categoria) => (
            <article className="tarjeta categorias__item" key={categoria.nombre}>
              <div
                className="bloque-visual categorias__visual"
                aria-hidden="true"
              >
                <img src={categoria.imagen} alt="" width={categoria.ancho} height={categoria.alto} />
              </div>
              <h3>{categoria.nombre}</h3>
            </article>
          ))}
        </div>
      </Contenedor>
    </section>
  )
}

export default Categorias
