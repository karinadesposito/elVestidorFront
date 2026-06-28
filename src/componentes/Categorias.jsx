import { useState } from 'react'
import Contenedor from './Contenedor'
import Card from '../componentesReuse/Cards'
import ModalPromocional from '../componentesReuse/ModalPromocional'
import ventanaImg from '../recursos/imagenes/zapatillasMontania.webp'
import saleImg from '../recursos/imagenes/sale.webp'
import modeloLocalImg from '../recursos/imagenes/modeloLocal.webp'
import accesoriosImg from '../recursos/imagenes/accesorios.webp'
import estatuaVansImg from '../recursos/imagenes/estatua-vans.webp'

const categorias = [
  { nombre: 'Calzado', imagen: ventanaImg, ancho: 987, alto: 1593 },
  { nombre: 'Ropa', imagen: modeloLocalImg, ancho: 960, alto: 1280 },
  { nombre: 'Accesorios', imagen: accesoriosImg, ancho: 308, alto: 403 },
  { nombre: 'Sale', imagen: saleImg, ancho: 721, alto: 1600 },
]

function Categorias() {
  const [mostrarModalSale, setMostrarModalSale] = useState(false)

  const abrirModalSale = () => {
    setMostrarModalSale(true)
  }
const cerrarModalSale = () => {
  setMostrarModalSale(false)
  console.log('Ir a página Sale')
}

  return (
    <>
      {mostrarModalSale && (
        <ModalPromocional
          imagen={estatuaVansImg}
          titulo="LLEGARON LAS VANS"
          subtitulo="APURATE."
          destacado="10% OFF"
          descripcion="Comprando online"
          boton="VER OFERTAS"
          onClose={cerrarModalSale}
        />
      )}

      <section className="seccion categorias">
        <Contenedor>
          <div className="categorias__encabezado"></div>

          <div className="grilla categorias__grilla">
            {categorias.map((categoria) => (
              <Card
                key={categoria.nombre}
                imagen={categoria.imagen}
                ancho={categoria.ancho}
                alto={categoria.alto}
                nombre={categoria.nombre}
                onClick={
                  categoria.nombre === 'Calzado' ? abrirModalSale : undefined
                }
              />
            ))}
          </div>
        </Contenedor>
      </section>
    </>
  )
}

export default Categorias