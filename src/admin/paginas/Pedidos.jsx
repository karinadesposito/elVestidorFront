
import { useState, useEffect } from "react";
import { FiSearch, FiX } from "react-icons/fi";
import Contenedor from "../../componentesReuse/Contenedor";
import Boton from "../../componentesReuse/Boton";
import {
  obtenerPedidos,
  obtenerContadoresPedidos,
} from "../servicios/pedidosService";

import "../../estilos/admin-productos.css";
import "../../estilos/admin-pedidos.css";

const TAMANIO_PAGINA = 20;

function Pedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [pagina, setPagina] = useState(1);
  const [totalPedidos, setTotalPedidos] = useState(0);
  const [busqueda, setBusqueda] = useState("");
  const [busquedaAplicada, setBusquedaAplicada] = useState("");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const totalPaginas = Math.max(
    1,
    Math.ceil(totalPedidos / TAMANIO_PAGINA)
  );

  useEffect(() => {
    const temporizador = setTimeout(() => {
      setPagina(1);
      setBusquedaAplicada(busqueda.trim());
    }, 350);

    return () => clearTimeout(temporizador);
  }, [busqueda]);

  useEffect(() => {
    let activo = true;

    async function cargar() {
      setCargando(true);
      setError(null);

      try {
        const [respuestaPedidos, respuestaContadores] =
          await Promise.all([
            obtenerPedidos({
              pagina,
              take: TAMANIO_PAGINA,
              busqueda: busquedaAplicada,
            }),
            obtenerContadoresPedidos(),
          ]);

        if (!activo) return;

        const ultimaPagina = Math.max(
          1,
          Math.ceil(respuestaPedidos.total / TAMANIO_PAGINA)
        );

        if (pagina > ultimaPagina) {
          setPagina(ultimaPagina);
          return;
        }

        setPedidos(respuestaPedidos.pedidos);
        setTotalPedidos(respuestaPedidos.total);
        setCategorias(respuestaContadores);
      } catch (err) {
        if (!activo) return;

        setError(
          err.message || "No se pudieron cargar los pedidos."
        );
        setPedidos([]);
      } finally {
        if (activo) setCargando(false);
      }
    }

    cargar();

    return () => {
      activo = false;
    };
  }, [pagina, busquedaAplicada]);

  function cambiarPagina(paginaNueva) {
    if (
      cargando ||
      paginaNueva < 1 ||
      paginaNueva > totalPaginas ||
      paginaNueva === pagina
    ) {
      return;
    }

    setPagina(paginaNueva);
  }

  function limpiarBusqueda() {
    setBusqueda("");
    setBusquedaAplicada("");
    setPagina(1);
  }

  return (
    <main className="estructura">
      <Contenedor>
        <header className="estructura__encabezado">
          <div>
            <h1 className="estructura__titulo">Pedidos</h1>
          </div>
        </header>

        <section
          className="estructura__resumen"
          aria-label="Categorías de pedidos"
        >
          {categorias.map((categoria) => (
            <article
              className={`estructura__tarjeta ${categoria.color}`}
              key={categoria.nombre}
            >
              <span>{categoria.nombre}</span>
              <strong>{categoria.cantidad}</strong>
            </article>
          ))}
        </section>

        <section className="estructura__panel">
          <div className="estructura__panel-encabezado">
            <h2>Listado de pedidos</h2>
          </div>

          <div className="admin-productos__filtros">
            <div className="admin-productos__buscador">
              <label htmlFor="buscar-pedidos">
                Buscar pedidos
              </label>

              <div className="admin-productos__buscador-control">
                <FiSearch aria-hidden="true" />

                <input
                  id="buscar-pedidos"
                  type="search"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Número, cliente o correo"
                  autoComplete="off"
                />

                {busqueda && (
                  <button
                    type="button"
                    onClick={limpiarBusqueda}
                    aria-label="Limpiar búsqueda"
                  >
                    <FiX aria-hidden="true" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {cargando && <p>Cargando pedidos...</p>}

          {error && (
            <p className="login-admin__error" role="alert">
              {error}
            </p>
          )}

          {!cargando && !error && (
            <>
              <div className="estructura__tabla">
                <div className="estructura__tabla-cabecera admin-pedidos__cabecera">
                  <span>Pedido</span>
                  <span>Cliente</span>
                  <span>Estado</span>
                  <span>Envío</span>
                  <span>Pago</span>
                  <span>Total</span>
                  <span>Fecha</span>
                </div>

                {pedidos.length === 0 && (
                  <p>
                    {busquedaAplicada
                      ? "No se encontraron pedidos con esa búsqueda."
                      : "No hay pedidos para mostrar."}
                  </p>
                )}

                {pedidos.map((pedido) => (
                  <article
                    className={`estructura__tabla-fila admin-pedidos__fila ${pedido.color}`}
                    key={pedido.id}
                  >
                    <div className="estructura__tabla-dato">
                      <span className="estructura__tabla-etiqueta">
                        Pedido
                      </span>
                      <strong>
                        #{pedido.codigo || pedido.id}
                      </strong>
                    </div>

                    <div className="estructura__tabla-dato">
                      <span className="estructura__tabla-etiqueta">
                        Cliente
                      </span>
                      <span>{pedido.cliente}</span>
                    </div>

                    <div className="estructura__tabla-dato">
                      <span className="estructura__tabla-etiqueta">
                        Estado
                      </span>
                      <span>{pedido.estado}</span>
                    </div>

                    <div className="estructura__tabla-dato">
                      <span className="estructura__tabla-etiqueta">
                        Envío
                      </span>
                      <span>{pedido.envio}</span>
                    </div>

                    <div className="estructura__tabla-dato">
                      <span className="estructura__tabla-etiqueta">
                        Pago
                      </span>
                      <span>
                        {pedido.pago}
                        {pedido.metodoPago
                          ? ` (${pedido.metodoPago})`
                          : ""}
                      </span>
                    </div>

                    <div className="estructura__tabla-dato">
                      <span className="estructura__tabla-etiqueta">
                        Total
                      </span>
                      <strong>{pedido.total}</strong>
                    </div>

                    <div className="estructura__tabla-dato">
                      <span className="estructura__tabla-etiqueta">
                        Fecha
                      </span>
                      <span>{pedido.fecha}</span>
                    </div>
                  </article>
                ))}
              </div>

              {totalPaginas > 1 && (
                <nav
                  className="admin-productos__paginacion"
                  aria-label="Paginación de pedidos"
                >
                  <span>
                    Mostrando{" "}
                    <strong>
                      {(pagina - 1) * TAMANIO_PAGINA + 1}
                      {"–"}
                      {Math.min(
                        pagina * TAMANIO_PAGINA,
                        totalPedidos
                      )}
                    </strong>{" "}
                    de <strong>{totalPedidos}</strong>{" "}
                    {totalPedidos === 1
                      ? "pedido"
                      : "pedidos"}
                  </span>

                  <div className="estructura__panel-acciones">
                    <Boton
                      variante="admin"
                      disabled={pagina <= 1 || cargando}
                      onClick={() =>
                        cambiarPagina(pagina - 1)
                      }
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
                      onClick={() =>
                        cambiarPagina(pagina + 1)
                      }
                    >
                      Siguiente
                    </Boton>
                  </div>
                </nav>
              )}
            </>
          )}
        </section>
      </Contenedor>
    </main>
  );
}

export default Pedidos;
