
import { useEffect, useRef, useState } from "react";

import Contenedor from "../../componentesReuse/Contenedor";
import Boton from "../../componentesReuse/Boton";

import ventana from "../../recursos/imagenes/el_vestidor_4.webp";

const slides = [
  {
    id: "navidad",
    titulo: "Navidad en El Vestidor",
    imagen: "/imagenes/carrusel/el-vestidor-christmas.webp",
    descripcion:
      "Campaña de Navidad de El Vestidor. This Christmas, Be You.",
    navidad: true,
  },
  {
    id: "online",
    titulo: "Comprá cómodo",
    etiqueta: "Especial online",
    texto: "Armá tu look favorito y comprá desde donde quieras.",
    imagen: ventana,
    descripcion: "",
    accion: "Explorar",
    navidad: false,
  },
];

const tiempoSlide = 5000;

function BloqueEditorial() {
  const [slideActivo, setSlideActivo] = useState(0);
  const [altura, setAltura] = useState(null);

  const slidesRef = useRef([]);
  const carruselRef = useRef(null);

  useEffect(() => {
    const intervalo = window.setInterval(() => {
      setSlideActivo(
        (actual) => (actual + 1) % slides.length
      );
    }, tiempoSlide);

    return () => window.clearInterval(intervalo);
  }, []);

  useEffect(() => {
    const slide = slidesRef.current[slideActivo];

    if (!slide) return;

    const actualizarAltura = () => {
      setAltura(slide.getBoundingClientRect().height);
    };

    actualizarAltura();

    const observador = new ResizeObserver(actualizarAltura);
    observador.observe(slide);

    return () => observador.disconnect();
  }, [slideActivo]);

  function cambiarSlide(direccion) {
    setSlideActivo(
      (actual) =>
        (actual + direccion + slides.length) % slides.length
    );
  }

  return (
    <section
      className="bloque-editorial"
      aria-label="Promociones de El Vestidor"
    >
      <Contenedor className="bloque-editorial__contenedor">
        <div
          ref={carruselRef}
          className="bloque-editorial__carrusel"
          style={
            altura !== null
              ? { height: `${altura}px` }
              : undefined
          }
        >
          <div
            className="bloque-editorial__pista"
            style={{
              transform: `translateX(-${slideActivo * 100}%)`,
            }}
          >
            {slides.map((slide, indice) => (
              <article
                ref={(elemento) => {
                  slidesRef.current[indice] = elemento;
                }}
                className={`bloque-editorial__slide ${
                  slide.navidad
                    ? "bloque-editorial__slide--navidad"
                    : ""
                }`}
                key={slide.id}
                aria-hidden={slideActivo !== indice}
                inert={slideActivo !== indice}
              >
                <div className="bloque-editorial__imagen">
                  <img
                    src={slide.imagen}
                    alt={slide.descripcion}
                    loading={indice === 0 ? "eager" : "lazy"}
                    onLoad={() => {
                      if (slideActivo === indice) {
                        const elemento =
                          slidesRef.current[indice];

                        if (elemento) {
                          setAltura(
                            elemento.getBoundingClientRect().height
                          );
                        }
                      }
                    }}
                  />
                </div>

                {!slide.navidad && (
                  <div className="bloque-editorial__texto">
                    <p className="texto-etiqueta bloque-editorial__etiqueta">
                      {slide.etiqueta}
                    </p>

                    <h3>{slide.titulo}</h3>

                    <p className="bloque-editorial__descripcion">
                      {slide.texto}
                    </p>

                    <Boton
                      className="bloque-editorial__accion"
                      tipo="promocional"
                    >
                      {slide.accion} →
                    </Boton>
                  </div>
                )}
              </article>
            ))}
          </div>

          <button
            type="button"
            className="bloque-editorial__flecha bloque-editorial__flecha--previa"
            aria-label="Promoción anterior"
            onClick={() => cambiarSlide(-1)}
          />

          <button
            type="button"
            className="bloque-editorial__flecha bloque-editorial__flecha--siguiente"
            aria-label="Promoción siguiente"
            onClick={() => cambiarSlide(1)}
          />
        </div>

        <div
          className="bloque-editorial__indicadores"
          aria-label="Elegir promoción"
        >
          {slides.map((slide, indice) => (
            <button
              type="button"
              key={slide.id}
              aria-label={`Ver ${slide.titulo}`}
              aria-current={slideActivo === indice}
              className={
                slideActivo === indice
                  ? "bloque-editorial__indicador bloque-editorial__indicador--activo"
                  : "bloque-editorial__indicador"
              }
              onClick={() => setSlideActivo(indice)}
            />
          ))}
        </div>
      </Contenedor>
    </section>
  );
}

export default BloqueEditorial;
