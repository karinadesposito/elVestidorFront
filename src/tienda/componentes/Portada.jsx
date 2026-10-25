
import { useEffect, useState } from "react";
import Contenedor from "../../componentesReuse/Contenedor";
import Boton from "../../componentesReuse/Boton";

const IMAGEN = "/imagenes/carrusel/summer2027_collage.webp";

function Portada() {
  const [pausado, setPausado] = useState(false);
  const [movimientoReducido, setMovimientoReducido] = useState(false);

  useEffect(() => {
    const consulta = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );

    const actualizar = () => {
      setMovimientoReducido(consulta.matches);
    };

    actualizar();

    consulta.addEventListener("change", actualizar);

    return () => {
      consulta.removeEventListener("change", actualizar);
    };
  }, []);

  const animar = !pausado && !movimientoReducido;

  return (
    <section
      className="portada"
      aria-label="Colección Summer 2027 de El Vestidor"
    >
      <Contenedor className="portada__contenedor">
        <div
          className={`portada__layout ${
            animar ? "portada__layout--animada" : ""
          }`}
        >
          <div className="portada__carrusel">
            <div className="portada__escenario">
              <img
                className="portada__imagen"
                src={IMAGEN}
                alt="Collage editorial Summer 2027 con escenas de verano, ilustraciones de comida y stickers"
                draggable="false"
              />

              <div
                className="portada__tarjeta portada__tarjeta--hamburguesa"
                aria-hidden="true"
              />

              <div
                className="portada__tarjeta portada__tarjeta--helado"
                aria-hidden="true"
              />

              <div className="portada__contenido">
                <Boton
                  variante="promocional"
                  className="portada__boton"
                  onClick={() => {
                    window.location.href = "/mujer";
                  }}
                >
                  DESCUBRÍ LA COLECCIÓN
                  <span aria-hidden="true"> →</span>
                </Boton>
              </div>

              <button
                type="button"
                className="portada__pausa"
                aria-label={
                  pausado
                    ? "Reanudar animaciones"
                    : "Pausar animaciones"
                }
                aria-pressed={pausado}
                onClick={() => setPausado((actual) => !actual)}
              >
                {pausado ? "Reproducir" : "Pausar"}
              </button>
            </div>
          </div>
        </div>
      </Contenedor>
    </section>
  );
}

export default Portada;
