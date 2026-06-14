import { useEffect, useState } from 'react'
import Contenedor from './Contenedor'
import montania from '../recursos/imagenes/3montaña.jpeg'
import brooklin from '../recursos/imagenes/brooklin.jpg'
import vestidor from '../recursos/imagenes/el_vestidor_4.webp'

const slides = [
  { nombre: 'Salida', imagen: montania, ancho: 1200, alto: 1600 },
  { nombre: 'Ruta', imagen: brooklin, ancho: 308, alto: 403 },
  { nombre: 'Ciudad', imagen: vestidor, ancho: 363, alto: 453 },
]
const campanias = [
  {
    etiqueta: 'Especial temporada',
    titulo: 'Amigos.',
    texto: 'Calzado, ropa y accesorios. ',
  },
  {
    etiqueta: 'Promo online',
    titulo: 'Lo nuevo.',
    texto: 'Elegidos de temporada.',
  },
  {
    etiqueta: 'Nuevos ingresos',
    titulo: 'Sé vos mismo.',
    texto: 'Selección todos los dias.',
  },
]
const tiempoSlide = 4000

function Portada() {
  const [slideActivo, setSlideActivo] = useState(0)

  useEffect(() => {
    const intervalo = window.setInterval(() => {
      setSlideActivo((slideActual) => (slideActual + 1) % slides.length)
    }, tiempoSlide)

    return () => window.clearInterval(intervalo)
  }, [])

  return (
    <section className="portada">
      <Contenedor className="portada__contenedor">
        <div className="portada__carrusel" aria-label="Imagenes destacadas">
          <div className={`portada__pista portada__pista--${slideActivo}`}>
            {slides.map((slide) => (
              <div
                aria-label={slide.nombre}
                className="portada__slide"
                key={slide.nombre}
                role="img"
              >
                <img src={slide.imagen} alt="" width={slide.ancho} height={slide.alto} />
              </div>
            ))}
          </div>

          <button
            aria-label="Imagen anterior"
            className="portada__flecha portada__flecha--previa"
            onClick={() =>
              setSlideActivo(
                (slideActivo - 1 + slides.length) % slides.length,
              )
            }
            type="button"
          ></button>
          <button
            aria-label="Imagen siguiente"
            className="portada__flecha portada__flecha--siguiente"
            onClick={() => setSlideActivo((slideActivo + 1) % slides.length)}
            type="button"
          ></button>
        </div>

        <div className="portada__indicadores" aria-label="Elegir imagen">
          {slides.map((slide, indice) => (
            <button
              aria-label={`Ver ${slide.nombre}`}
              aria-current={slideActivo === indice}
              className={
                slideActivo === indice
                  ? 'portada__indicador portada__indicador--activo'
                  : 'portada__indicador'
              }
              key={slide.nombre}
              onClick={() => setSlideActivo(indice)}
              type="button"
            ></button>
          ))}
        </div>

        <div className="portada__contenido">
          <p className="texto-etiqueta portada__etiqueta">
            {campanias[slideActivo].etiqueta}
          </p>
          <h1>{campanias[slideActivo].titulo}</h1>
          <p>{campanias[slideActivo].texto}</p>
        </div>
      </Contenedor>
    </section>
  )
}

export default Portada
