import { useState, useEffect } from "react";
import Contenedor from "../../componentesReuse/Contenedor";
import { obtenerPedidos, contarPorEstado } from "../servicios/pedidosService";

import "../../estilos/admin-pedidos.css";

function Pedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function cargar() {
      try {
        const { pedidos: datos } = await obtenerPedidos();
        setPedidos(datos);
        setCategorias(contarPorEstado(datos));
      } catch (err) {
        setError(err.message);
      } finally {
        setCargando(false);
      }
    }
    cargar();
  }, []);

  return (
    <main className="estructura">
      <Contenedor>
        <header className="estructura__encabezado">
          <div>
            <h1 className="estructura__titulo">Pedidos</h1>
          </div>
        </header>

        {cargando && <p>Cargando pedidos...</p>}
        {error && <p className="login-admin__error">{error}</p>}

        {!cargando && (
          <>
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

              <div className="estructura__tabla">
                <div className="estructura__tabla-cabecera admin-pedidos__cabecera">
                  <span>Pedido</span>
                  <span>Cliente</span>
                  <span>Fecha</span>
                  <span>Estado</span>
                  <span>Unidades</span>
                  <span>Total</span>
                </div>

                {pedidos.length === 0 && (
                  <p>No hay pedidos para mostrar.</p>
                )}

                {pedidos.map((pedido) => (
                  <article
                    className={`estructura__tabla-fila admin-pedidos__fila ${pedido.color}`}
                    key={pedido.id}
                  >
                    <div className="estructura__tabla-dato">
                      <span className="estructura__tabla-etiqueta">Pedido</span>
                      <strong>#{pedido.codigo || pedido.id}</strong>
                    </div>

                    <div className="estructura__tabla-dato">
                      <span className="estructura__tabla-etiqueta">Cliente</span>
                      <button className="estructura__tabla-boton" type="button">
                        {pedido.cliente}
                      </button>
                    </div>

                    <div className="estructura__tabla-dato">
                      <span className="estructura__tabla-etiqueta">Fecha</span>
                      <span>{pedido.fecha}</span>
                    </div>

                    <div className="estructura__tabla-dato">
                      <span className="estructura__tabla-etiqueta">Estado</span>
                      <span>{pedido.estado}</span>
                    </div>

                    <div className="estructura__tabla-dato">
                      <span className="estructura__tabla-etiqueta">Unidades</span>
                      <strong>{pedido.unidades}</strong>
                    </div>

                    <div className="estructura__tabla-dato">
                      <span className="estructura__tabla-etiqueta">Total</span>
                      <strong>{pedido.total}</strong>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </>
        )}
      </Contenedor>
    </main>
  );
}

export default Pedidos;
