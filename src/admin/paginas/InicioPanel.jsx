import { useNavigate } from 'react-router-dom'
import Contenedor from "../../componentesReuse/Contenedor";
import Boton from "../../componentesReuse/Boton";
import { useAuth } from "../contexto/AuthContext";

import "../../estilos/admin-inicio.css";

function InicioPanel() {
  const navigate = useNavigate()
  const { logout } = useAuth()

  const cerrarSesion = () => {
    logout()
    navigate('/admin', { replace: true })
  }

  return (
    <main className="admin-inicio">
      <Contenedor>
        <section className="admin-inicio__encabezado">
          <div>
            <p className="admin-inicio__eyebrow">Panel de administración</p>

            <h1 className="admin-inicio__titulo">Buenos días, Karina.</h1>

            <p className="admin-inicio__fecha">Hoy es domingo 5 de julio.</p>
          </div>

          <div className="admin-inicio__selector-fecha">
            <Boton variante="icono">←</Boton>

            <span>Hoy</span>

            <Boton variante="icono">→</Boton>

            <Boton variante="icono" onClick={cerrarSesion}>✕</Boton>
          </div>
        </section>

        <section className="admin-inicio__resumen">
          <article className="admin-inicio__tarjeta">
            <span>Pedidos nuevos</span>
            <strong>8</strong>
          </article>

          <article className="admin-inicio__tarjeta">
            <span>Cobrado online</span>
            <strong>$362.450</strong>
          </article>

          <article className="admin-inicio__tarjeta">
            <span>Prendas vendidas</span>
            <strong>14</strong>
          </article>

          <article className="admin-inicio__tarjeta">
            <span>Pendientes de preparar</span>
            <strong>3</strong>
          </article>
        </section>

        <section className="admin-inicio__bloque-destacado">
          <h2>Resumen del día</h2>

          <p>
            Hoy ingresaron 8 pedidos online. Se vendieron 14 prendas y hay 3
            pedidos pendientes de preparar. También hay 2 productos con stock
            crítico para revisar.
          </p>
        </section>

        <section className="admin-inicio__grilla">
          <article className="admin-inicio__panel">
            <div className="admin-inicio__panel-header">
              <h2>Pedidos pendientes</h2>

              <Boton variante="admin">Ver pedidos</Boton>
            </div>

            <div className="admin-inicio__tabla">
              <div className="admin-inicio__fila admin-inicio__fila--cabecera">
                <span>Hora</span>
                <span>Cliente</span>
                <span>Estado</span>
                <span>Importe</span>
              </div>

              <div className="admin-inicio__fila">
                <span>10:35</span>
                <span>María López</span>
                <span>Pendiente</span>
                <span>$48.900</span>
              </div>

              <div className="admin-inicio__fila">
                <span>11:20</span>
                <span>Juan Pérez</span>
                <span>Pagado</span>
                <span>$72.300</span>
              </div>

              <div className="admin-inicio__fila">
                <span>12:05</span>
                <span>Ana Ruiz</span>
                <span>Pendiente</span>
                <span>$39.500</span>
              </div>
            </div>
          </article>

          <aside className="admin-inicio__panel">
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

        <section className="admin-inicio__acciones">
          <Boton variante="admin">+ Producto</Boton>
          <Boton variante="admin">Pedidos</Boton>
          <Boton variante="admin">Promociones</Boton>
          <Boton variante="admin">Stock</Boton>
        </section>
      </Contenedor>
    </main>
  );
}

export default InicioPanel;
