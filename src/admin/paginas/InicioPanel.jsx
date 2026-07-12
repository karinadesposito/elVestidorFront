import Contenedor from "../../componentesReuse/Contenedor";
import Boton from "../../componentesReuse/Boton";
import "../../estilos/admin-inicio.css";
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
              <div className="estructura__fila estructura__fila--cabecera">
                <span>Hora</span>
                <span>Cliente</span>
                <span>Estado</span>
                <span>Importe</span>
              </div>

              <div className="estructura__fila">
                <span>10:35</span>
                <span>María López</span>
                <span>Pendiente</span>
                <span>$48.900</span>
              </div>

              <div className="estructura__fila">
                <span>11:20</span>
                <span>Juan Pérez</span>
                <span>Pagado</span>
                <span>$72.300</span>
              </div>

              <div className="estructura__fila">
                <span>12:05</span>
                <span>Ana Ruiz</span>
                <span>Pendiente</span>
                <span>$39.500</span>
              </div>
            </div>
          </article>

          <aside className="estructura__panel">
            <h2>Alertas de stock</h2>

            <div className="admin-inicio__alerta">
              <strong>Jean Slim Negro</strong>
              <span>Quedan 2 unidades.</span>
            </div>

            <div className="admin-inicio__alerta">
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
