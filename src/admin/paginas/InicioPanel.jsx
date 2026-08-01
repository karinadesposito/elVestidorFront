import { useState, useEffect } from "react";
import Contenedor from "../../componentesReuse/Contenedor";
import Boton from "../../componentesReuse/Boton";
import { obtenerPedidos } from "../servicios/pedidosService";
import { obtenerProductos } from "../servicios/productosService";
import "../../estilos/admin-inicio.css";

const MAPA_ESTADO = {
  Added: "Nuevo",
  ArrangingPayment: "Pendiente de pago",
  PaymentSettled: "En preparación",
  Shipped: "Enviado",
  Delivered: "Finalizado",
  Cancelled: "Cancelado",
};

function InicioPanel() {
  const [pedidos, setPedidos] = useState([]);
  const [stats, setStats] = useState({ nuevos: 0, cobrado: 0, pendientes: 0 });
  const [alertasStock, setAlertasStock] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function cargar() {
      try {
        const [resPedidos, resProductos] = await Promise.all([
          obtenerPedidos({ pagina: 1, take: 50 }),
          obtenerProductos({ pagina: 1, take: 100 }),
        ]);

        setPedidos(resPedidos.pedidos.slice(0, 5));

        const nuevos = resPedidos.pedidos.filter(
          (p) => p.estadoVendure === "Added"
        ).length;
        const cobrado = resPedidos.pedidos
          .filter((p) => p.estadoVendure === "PaymentSettled")
          .reduce((sum, p) => {
            const num = Number(String(p.total).replace(/[^0-9]/g, ""));
            return sum + num;
          }, 0);
        const pendientes = resPedidos.pedidos.filter(
          (p) => p.estadoVendure === "PaymentSettled"
        ).length;

        setStats({
          nuevos,
          cobrado: new Intl.NumberFormat("es-AR", {
            style: "currency",
            currency: "ARS",
          }).format(cobrado),
          pendientes,
        });

        const sinStock = resProductos.productos.filter((p) => p.stock <= 3);
        setAlertasStock(sinStock.slice(0, 5));
      } catch {
        // silencioso
      } finally {
        setCargando(false);
      }
    }
    cargar();
  }, []);

  return (
    <main className="estructura">
      <Contenedor>
        <section className="estructura__resumen">
          <article className="estructura__tarjeta">
            <span>Pedidos nuevos</span>
            <strong>{stats.nuevos}</strong>
          </article>

          <article className="estructura__tarjeta">
            <span>Cobrado online</span>
            <strong>{stats.cobrado}</strong>
          </article>

          <article className="estructura__tarjeta">
            <span>Pendientes de preparar</span>
            <strong>{stats.pendientes}</strong>
          </article>
        </section>

        <section className="estructura__grilla">
          <article className="estructura__panel">
            <div className="estructura__panel-encabezado">
              <h2>Pedidos recientes</h2>

              <div className="estructura__panel-acciones">
                <Boton variante="admin">Ver pedidos</Boton>
              </div>
            </div>

            <div className="estructura__tabla admin-inicio__tabla">
              <div className="estructura__tabla-cabecera admin-inicio__cabecera">
                <span>Pedido</span>
                <span>Cliente</span>
                <span>Estado</span>
                <span>Importe</span>
              </div>

              {!cargando && pedidos.length === 0 && (
                <p>No hay pedidos recientes.</p>
              )}

              {pedidos.map((pedido) => (
                <article
                  className="estructura__tabla-fila admin-inicio__fila"
                  key={pedido.id}
                >
                  <div className="estructura__tabla-dato">
                    <span className="estructura__tabla-etiqueta">Pedido</span>
                    <span>#{pedido.codigo}</span>
                  </div>

                  <div className="estructura__tabla-dato">
                    <span className="estructura__tabla-etiqueta">Cliente</span>
                    <span>{pedido.cliente}</span>
                  </div>

                  <div className="estructura__tabla-dato">
                    <span className="estructura__tabla-etiqueta">Estado</span>
                    <span>{pedido.estado}</span>
                  </div>

                  <div className="estructura__tabla-dato">
                    <span className="estructura__tabla-etiqueta">Importe</span>
                    <strong>{pedido.total}</strong>
                  </div>
                </article>
              ))}
            </div>
          </article>

          <aside className="estructura__panel">
            <h2>Alertas de stock</h2>

            {alertasStock.length === 0 && (
              <p>Sin alertas de stock.</p>
            )}

            {alertasStock.map((producto) => (
              <div className="estructura__lista-item" key={producto.id}>
                <strong>{producto.nombre}</strong>
                <span>
                  {producto.stock === 0
                    ? "Sin stock."
                    : `Quedan ${producto.stock} unidades.`}
                </span>
              </div>
            ))}
          </aside>
        </section>
      </Contenedor>
    </main>
  );
}

export default InicioPanel;
