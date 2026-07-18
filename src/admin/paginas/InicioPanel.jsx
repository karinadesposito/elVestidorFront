import Contenedor from "../../componentesReuse/Contenedor";
import Boton from "../../componentesReuse/Boton";
import "../../estilos/admin-inicio.css";

const pedidosPendientes = [
  {
    hora: "10:35",
    cliente: "Maria Lopez",
    estado: "Pendiente",
    importe: "$48.900",
  },
  {
    hora: "11:20",
    cliente: "Juan Perez",
    estado: "Pagado",
    importe: "$72.300",
  },
  {
    hora: "12:05",
    cliente: "Ana Ruiz",
    estado: "Pendiente",
    importe: "$39.500",
  },
];

function InicioPanel() {
  return (
    <main className="estructura">
      <Contenedor>
        <section className="estructura__resumen">
          <article className="estructura__tarjeta">
            <span>Pedidos nuevos</span>
            <strong>8</strong>
          </article>

          <article className="estructura__tarjeta">
            <span>Cobrado online</span>
            <strong>$362.450</strong>
          </article>

          <article className="estructura__tarjeta">
            <span>Pendientes de preparar</span>
            <strong>3</strong>
          </article>
        </section>

        <section className="estructura__grilla">
          <article className="estructura__panel">
            <div className="estructura__panel-encabezado">
              <h2>Pedidos pendientes</h2>

              <div className="estructura__panel-acciones">
                <Boton variante="admin">Ver pedidos</Boton>
              </div>
            </div>

            <div className="estructura__tabla admin-inicio__tabla">
              <div className="estructura__tabla-cabecera admin-inicio__cabecera">
                <span>Hora</span>
                <span>Cliente</span>
                <span>Estado</span>
                <span>Importe</span>
              </div>

              {pedidosPendientes.map((pedido) => (
                <article
                  className="estructura__tabla-fila admin-inicio__fila"
                  key={`${pedido.hora}-${pedido.cliente}`}
                >
                  <div className="estructura__tabla-dato">
                    <span className="estructura__tabla-etiqueta">Hora</span>
                    <span>{pedido.hora}</span>
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
                    <strong>{pedido.importe}</strong>
                  </div>
                </article>
              ))}
            </div>
          </article>

          <aside className="estructura__panel">
            <h2>Alertas de stock</h2>

            <div className="estructura__lista-item">
              <strong>Jean Slim Negro</strong>
              <span>Quedan 2 unidades.</span>
            </div>

            <div className="estructura__lista-item">
              <strong>Buzo Vans Gris</strong>
              <span>Sin stock.</span>
            </div>
          </aside>
        </section>
      </Contenedor>
    </main>
  );
}

export default InicioPanel;
