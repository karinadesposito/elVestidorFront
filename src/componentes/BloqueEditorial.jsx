import { useEffect, useState } from 'react'
import Contenedor from './Contenedor'
import ventana from '../recursos/imagenes/ventana.jpeg'
import pasillo from '../recursos/imagenes/pasillo.jpeg'
import magic from '../recursos/imagenes/magicTandil.png'

const promociones = [
  {
    etiqueta: 'Especial online',
    titulo: '3 cuotas sin interes',
    texto: 'Arma tu look completo y pagalo comodo desde la tienda.',
    imagen: ventana,
  },
  {
    etiqueta: 'Todo el pais',
    titulo: 'Envios para salir sin esperar',
    texto: 'Recibi calzado, ropa y accesorios donde estes.',
    imagen: pasillo,
  },
  {
    etiqueta: 'Temporada',
    titulo: 'Sale de favoritos',
    texto: 'Seleccionamos piezas clave para renovar el vestidor.',
    imagen: magic,
  },
]

const tiempoSlide = 5000

function BloqueEditorial() {
  const [slideActivo, setSlideActivo] = useState(0)

  useEffect(() => {
    const intervalo = window.setInterval(() => {
      setSlideActivo((slideActual) => (slideActual + 1) % promociones.length)
    }, tiempoSlide)

    return () => window.clearInterval(intervalo)
  }, [])

  return (
    <section className="bloque-editorial">
      <Contenedor className="portada__contenedor bloque-editorial__contenedor">
        <div
          className="portada__carrusel"
          aria-label="Promociones destacadas"
        >
          <div
            className={`portada__pista portada__pista--${slideActivo}`}
          >
            {promociones.map((promocion) => (
              <article className="portada__slide" key={promocion.titulo}>
                <img src={promocion.imagen} alt="" />
                <div className="portada__contenido">
                  <p className="texto-etiqueta portada__etiqueta">
                    {promocion.etiqueta}
                  </p>
                  <h2>{promocion.titulo}</h2>
                  <p>{promocion.texto}</p>
                </div>
              </article>
            ))}
          </div>

          <button
            aria-label="Promocion anterior"
            className="portada__flecha portada__flecha--previa"
            onClick={() =>
              setSlideActivo(
                (slideActivo - 1 + promociones.length) % promociones.length,
              )
            }
            type="button"
          ></button>
          <button
            aria-label="Promocion siguiente"
            className="portada__flecha portada__flecha--siguiente"
            onClick={() =>
              setSlideActivo((slideActivo + 1) % promociones.length)
            }
            type="button"
          ></button>
        </div>

        <div className="portada__indicadores" aria-label="Elegir promocion">
          {promociones.map((promocion, indice) => (
            <button
              aria-label={`Ver ${promocion.titulo}`}
              aria-current={slideActivo === indice}
              className={
                slideActivo === indice
                  ? 'portada__indicador portada__indicador--activo'
                  : 'portada__indicador'
              }
              key={promocion.titulo}
              onClick={() => setSlideActivo(indice)}
              type="button"
            ></button>
          ))}
        </div>
      </Contenedor>
    </section>
  )
}

export default BloqueEditorial
