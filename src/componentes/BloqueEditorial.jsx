import { useEffect, useState } from 'react'
import Contenedor from './Contenedor'
import diaDelPadre from '../recursos/imagenes/diaDelPadre.webp'
import ventana from '../recursos/imagenes/el_vestidor_4.webp'

const slides = [
  {
    etiqueta: 'Día del Padre',
    titulo: 'El regalo perfecto',
    texto: 'Calzado, abrigo y accesorios para elegir algo que realmente use.',
    imagen: diaDelPadre,
    ancho: 1536,
    alto: 1024,
    accion: 'Ver ideas',
  },
  {
    etiqueta: 'Especial online',
    titulo: 'Comprá cómodo',
    texto: '3 cuotas sin interés para armar tu look completo desde casa.',
    imagen: ventana,
    ancho: 721,
    alto: 1600,
    accion: 'Explorar',
  },
]

const tiempoSlide = 5000

function BloqueEditorial() {
  const [slideActivo, setSlideActivo] = useState(0)

  useEffect(() => {
    const intervalo = window.setInterval(() => {
      setSlideActivo((slideActual) => (slideActual + 1) % slides.length)
    }, tiempoSlide)

    return () => window.clearInterval(intervalo)
  }, [])

  return (
    <section className="bloque-editorial">
      <Contenedor className="bloque-editorial__contenedor">
        <div className="bloque-editorial__carrusel">
          <div
            className={`bloque-editorial__pista bloque-editorial__pista--${slideActivo}`}
          >
            {slides.map((slide) => (
              <article className="bloque-editorial__slide" key={slide.titulo}>
                <div className="bloque-editorial__imagen">
                  <img
                    src={slide.imagen}
                    alt=""
                    width={slide.ancho}
                    height={slide.alto}
                  />
                </div>

                <div className="bloque-editorial__texto">
                  <p className="texto-etiqueta bloque-editorial__etiqueta">
                    {slide.etiqueta}
                  </p>

                  <h3>{slide.titulo}</h3>

                  <p className="bloque-editorial__descripcion">
                    {slide.texto}
                  </p>

                  <button className="bloque-editorial__accion" type="button">
                    {slide.accion} →
                  </button>
                </div>
              </article>
            ))}
          </div>

          <button
            aria-label="Anterior"
            className="bloque-editorial__flecha bloque-editorial__flecha--previa"
            onClick={() =>
              setSlideActivo(
                (slideActivo - 1 + slides.length) % slides.length,
              )
            }
            type="button"
          />

          <button
            aria-label="Siguiente"
            className="bloque-editorial__flecha bloque-editorial__flecha--siguiente"
            onClick={() => setSlideActivo((slideActivo + 1) % slides.length)}
            type="button"
          />
        </div>

        <div
          className="bloque-editorial__indicadores"
          aria-label="Elegir promoción"
        >
          {slides.map((slide, indice) => (
            <button
              aria-label={`Ver ${slide.titulo}`}
              aria-current={slideActivo === indice}
              className={
                slideActivo === indice
                  ? 'bloque-editorial__indicador bloque-editorial__indicador--activo'
                  : 'bloque-editorial__indicador'
              }
              key={slide.titulo}
              onClick={() => setSlideActivo(indice)}
              type="button"
            />
          ))}
        </div>
      </Contenedor>
    </section>
  )
}

export default BloqueEditorial
