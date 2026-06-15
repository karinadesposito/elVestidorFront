import { useEffect, useState } from 'react'
import Contenedor from './Contenedor'
import montania from '../recursos/imagenes/3montaña.webp'
import videoChicas from '../recursos/imagenes/videoChicas.mp4'
import vestidor from '../recursos/imagenes/sillonAmarillo.webp'

const slides = [
  { nombre: 'Salida', imagen: montania, ancho: 1200, alto: 1600 },
  { nombre: 'Ruta', video: videoChicas, ancho: 308, alto: 403 },
  { nombre: 'Ciudad', imagen: vestidor, ancho: 363, alto: 453 },
]

const campanias = [
  {
    etiqueta: 'Especial temporada',
    titulo: 'Compartir.',
    texto: 'Todos tus días.',
    accion: 'Ver selección',
  },
  {
    etiqueta: 'Promo online',
    titulo: 'Lo nuevo.',
    texto: 'Ingresos elegidos.',
    accion: 'Descubrir',
  },
  {
    etiqueta: 'Nuevos ingresos',
    titulo: 'Sé vos.',
    texto: 'Pensados para moverte.',
    accion: 'Explorar',
  },
]

const tiempoSlide = 3000

function Portada() {
  const [slideActivo, setSlideActivo] = useState(0)
  const campaniaActiva = campanias[slideActivo]

  useEffect(() => {
    const intervalo = window.setInterval(() => {
      setSlideActivo((slideActual) => (slideActual + 1) % slides.length)
    }, tiempoSlide)

    return () => window.clearInterval(intervalo)
  }, [])

  return (
    <section className="portada">
      <Contenedor className="portada__contenedor">
        <div className="portada__layout">
          <div className="portada__carrusel" aria-label="Imágenes destacadas">
            <div className={`portada__pista portada__pista--${slideActivo}`}>
              {slides.map((slide) => (
                <div
                  aria-label={slide.nombre}
                  className="portada__slide"
                  key={slide.nombre}
                  role={slide.video ? undefined : "img"}
                >
                  {slide.video ? (
                    <video
                      src={slide.video}
                      autoPlay
                      muted
                      loop
                      playsInline
                    />
                  ) : (
                    <img
                      src={slide.imagen}
                      alt=""
                      width={slide.ancho}
                      height={slide.alto}
                    />
                  )}
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
            />

            <button
              aria-label="Imagen siguiente"
              className="portada__flecha portada__flecha--siguiente"
              onClick={() => setSlideActivo((slideActivo + 1) % slides.length)}
              type="button"
            />

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
                />
              ))}
            </div>
          </div>

          <div className="portada__contenido">
            <p className="texto-etiqueta portada__etiqueta">
              {campaniaActiva.etiqueta}
            </p>

            <h1>{campaniaActiva.titulo}</h1>

            <p>{campaniaActiva.texto}</p>

            <button className="portada__accion" type="button">
              {campaniaActiva.accion} →
            </button>
          </div>
        </div>
      </Contenedor>
    </section>
  )
}

export default Portada