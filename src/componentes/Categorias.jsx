import Contenedor from './Contenedor'
import Card from '../componentesReuse/Cards'
import ventanaImg from '../recursos/imagenes/zapatillasMontania.webp'
import saleImg from '../recursos/imagenes/sale.webp'
import modeloLocalImg from '../recursos/imagenes/modeloLocal.webp'
import accesoriosImg from '../recursos/imagenes/accesorios.webp'

const categorias = [
  { nombre: 'Calzado', imagen: ventanaImg, ancho: 987, alto: 1593 },
  { nombre: 'Ropa', imagen: modeloLocalImg, ancho: 960, alto: 1280 },
  { nombre: 'Accesorios', imagen: accesoriosImg, ancho: 308, alto: 403 },
  { nombre: 'Sale', imagen: saleImg, ancho: 721, alto: 1600 },
]

function Categorias() {
  return (
    <section className="seccion categorias">
      <Contenedor>
        <div className="categorias__encabezado">
        
        </div>

        <div className="grilla categorias__grilla">
          {categorias.map((categoria) => (
            <Card
              key={categoria.nombre}
              imagen={categoria.imagen}
              ancho={categoria.ancho}
              alto={categoria.alto}
              nombre={categoria.nombre}
            />
          ))}
        </div>
      </Contenedor>
    </section>
  )
}

export default Categorias
