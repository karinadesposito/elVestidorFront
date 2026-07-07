import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Contenedor from '../../componentesReuse/Contenedor'
import Card from '../../componentesReuse/Cards'
import ModalPromocional from '../../componentesReuse/ModalPromocional'

import modeloHombreImg from '../../recursos/imagenes/modelo_hombre.webp'
import modeloMujerImg from '../../recursos/imagenes/modelo_mujer.webp'
import modeloHombreApaisadaImg from '../../recursos/imagenes/modelo_hombreApaisada.webp'
import modeloMujerApaisadaImg from '../../recursos/imagenes/modelo_mujerApaisada.webp'
import accesoriosImg from '../../recursos/imagenes/accesorios.webp'
import saleImg from '../../recursos/imagenes/sale.webp'
import estatuaVansImg from '../../recursos/imagenes/estatua-vans.webp'

const categorias = [
  {
    nombre: 'HOMBRE',
    ruta: '/hombre',
    imagen: modeloHombreImg,
    imagenDesktop: modeloHombreApaisadaImg,
  },
  {
    nombre: 'MUJER',
    ruta: '/mujer',
    imagen: modeloMujerImg,
    imagenDesktop: modeloMujerApaisadaImg,
  },
  { nombre: 'ACCESORIOS', ruta: '/mujer/accesorios', imagen: accesoriosImg },
  { nombre: 'SALE', ruta: null, imagen: saleImg },
]

function Categorias() {
  const navigate = useNavigate()
  const [mostrarModalSale, setMostrarModalSale] = useState(false)

  const abrirModalSale = () => {
    setMostrarModalSale(true)
  }

  const cerrarModalSale = () => {
    setMostrarModalSale(false)
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
          <div className="categorias__grilla">
            {categorias.map((categoria) => (
              <Card
                key={categoria.nombre}
                imagen={categoria.imagen}
                imagenDesktop={categoria.imagenDesktop}
                nombre={categoria.nombre}
                onClick={
                  categoria.nombre === 'SALE'
                    ? abrirModalSale
                    : () => navigate(categoria.ruta)
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
