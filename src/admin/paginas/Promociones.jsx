
import { useEffect, useState } from "react";
import Contenedor from "../../componentesReuse/Contenedor";
import Boton from "../../componentesReuse/Boton";
import { obtenerPromociones } from "../servicios/promocionesService";
import FormularioPromocion from "../componentes/FormularioPromocion";

const COLUMNAS_TABLA = {
  "--estructura-tabla-columnas":
    "minmax(10rem, 2fr) minmax(7rem, 1fr) minmax(8rem, 1fr) minmax(8rem, 1fr)",
  "--estructura-tabla-ancho-minimo": "0",
};

function formatearFecha(fecha) {
  if (!fecha) return "Sin definir";

  const valor = new Date(fecha);

  if (Number.isNaN(valor.getTime())) {
    return "Fecha inválida";
  }

  return valor.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function obtenerEstadoPromocion(promocion) {
  if (!promocion.enabled) {
    return "Desactivada";
  }

  const ahora = Date.now();
  const inicio = promocion.startsAt
    ? new Date(promocion.startsAt).getTime()
    : null;
  const fin = promocion.endsAt
    ? new Date(promocion.endsAt).getTime()
    : null;

  if (inicio !== null && Number.isFinite(inicio) && inicio > ahora) {
    return "Programada";
  }

  if (fin !== null && Number.isFinite(fin) && fin <= ahora) {
    return "Finalizada";
  }

  return "Activa";
}

function Promociones() {
  const [promociones, setPromociones] = useState([]);
  const [totalPromociones, setTotalPromociones] = useState(0);
  const [pagina, setPagina] = useState(1);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [recarga, setRecarga] = useState(0);
  const [modal, setModal] = useState(null);

  const tamanioPagina = 50;
  const totalPaginas = Math.max(
    1,
    Math.ceil(totalPromociones / tamanioPagina)
  );

  useEffect(() => {
    let activo = true;

    async function cargarPromociones() {
      setCargando(true);
      setError(null);

      try {
        const respuesta = await obtenerPromociones(pagina);

        if (!activo) return;

        const ultimaPagina = Math.max(
          1,
          Math.ceil(respuesta.total / respuesta.tamanioPagina)
        );

        if (pagina > ultimaPagina) {
          setPagina(ultimaPagina);
          return;
        }

        setPromociones(respuesta.promociones);
        setTotalPromociones(respuesta.total);
      } catch (err) {
        if (!activo) return;

        setError(
          err.message || "No se pudieron cargar las promociones."
        );
        setPromociones([]);
        setTotalPromociones(0);
      } finally {
        if (activo) {
          setCargando(false);
        }
      }
    }

    cargarPromociones();

    return () => {
      activo = false;
    };
  }, [pagina, recarga]);

  function actualizarListado() {
    if (!cargando) {
      setRecarga((valor) => valor + 1);
    }
  }

  return (
    <main className="estructura">
      <Contenedor>
        <header className="estructura__encabezado">
          <div>
            <h1 className="estructura__titulo">Promociones</h1>
          </div>
        </header>

        <section className="estructura__panel">
          <div className="estructura__panel-encabezado">
            <h2>Listado de promociones</h2>

            <Boton variante="admin" onClick={() => setModal("nuevo")}>Nueva promoción</Boton>
            <Boton
              variante="admin"
              onClick={actualizarListado}
              disabled={cargando}
            >
              {cargando ? "Cargando..." : "Actualizar"}
            </Boton>
          </div>

          {cargando && (
            <p role="status">Cargando promociones...</p>
          )}

          {error && (
            <p className="login-admin__error" role="alert">
              {error}
            </p>
          )}

          {!cargando && !error && (
            <>
              {promociones.length === 0 ? (
                <p>
                  Todavía no hay promociones registradas en Vendure.
                </p>
              ) : (
                <div className="estructura__tabla">
                  <div
                    className="estructura__tabla-cabecera"
                    style={COLUMNAS_TABLA}
                  >
                    <span>Promoción</span>
                    <span>Estado</span>
                    <span>Inicio</span>
                    <span>Finalización</span>
                  </div>

                  {promociones.map((promocion) => (
                    <article
                      key={promocion.id}
                      className="estructura__tabla-fila"
                      style={COLUMNAS_TABLA}
                    >
                      <div className="estructura__tabla-dato">
                        <span className="estructura__tabla-etiqueta">
                          Promoción
                        </span>
                        <div>
                          <strong>{promocion.name}</strong>{" "}
                          <Boton variante="admin" onClick={() => setModal(promocion.id)}>Editar</Boton>
                          {promocion.description && (
                            <p>{promocion.description}</p>
                          )}
                        </div>
                      </div>

                      <div className="estructura__tabla-dato">
                        <span className="estructura__tabla-etiqueta">
                          Estado
                        </span>
                        <span>
                          {obtenerEstadoPromocion(promocion)}
                        </span>
                      </div>

                      <div className="estructura__tabla-dato">
                        <span className="estructura__tabla-etiqueta">
                          Inicio
                        </span>
                        <span>
                          {formatearFecha(promocion.startsAt)}
                        </span>
                      </div>

                      <div className="estructura__tabla-dato">
                        <span className="estructura__tabla-etiqueta">
                          Finalización
                        </span>
                        <span>
                          {formatearFecha(promocion.endsAt)}
                        </span>
                      </div>
                    </article>
                  ))}
                </div>
              )}

              <nav
                className="admin-productos__paginacion"
                aria-label="Paginación de promociones"
              >
                <span>
                  {totalPromociones === 0 ? (
                    "No hay promociones"
                  ) : (
                    <>
                      Mostrando{" "}
                      <strong>
                        {(pagina - 1) * tamanioPagina + 1}–
                        {Math.min(
                          pagina * tamanioPagina,
                          totalPromociones
                        )}
                      </strong>{" "}
                      de <strong>{totalPromociones}</strong>{" "}
                      {totalPromociones === 1
                        ? "promoción"
                        : "promociones"}
                    </>
                  )}
                </span>

                {totalPaginas > 1 && (
                  <div className="estructura__panel-acciones">
                    <Boton
                      variante="admin"
                      disabled={pagina <= 1 || cargando}
                      onClick={() => setPagina(pagina - 1)}
                    >
                      Anterior
                    </Boton>

                    <span>
                      Página {pagina} de {totalPaginas}
                    </span>

                    <Boton
                      variante="admin"
                      disabled={
                        pagina >= totalPaginas || cargando
                      }
                      onClick={() => setPagina(pagina + 1)}
                    >
                      Siguiente
                    </Boton>
                  </div>
                )}
              </nav>
            </>
          )}
        </section>
      </Contenedor>
      {modal !== null && (
        <FormularioPromocion
          promocionId={modal === "nuevo" ? null : modal}
          onClose={() => setModal(null)}
          onGuardado={() => { setModal(null); setRecarga((valor) => valor + 1); }}
        />
      )}
    </main>
  );
}

export default Promociones;
