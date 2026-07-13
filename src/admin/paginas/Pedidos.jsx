import Contenedor from "../../componentesReuse/Contenedor";

import "../../estilos/admin-pedidos.css";
const categoriasPedidos = [
  {
    nombre: "Nuevos",
    cantidad: 8,
    color: "fondo-azul",
  },
  {
    nombre: "Pendientes de pago",
    cantidad: 3,
    color: "fondo-amarillo",
  },
  {
    nombre: "En preparación",
    cantidad: 2,
    color: "fondo-violeta",
  },
  {
    nombre: "Finalizados",
    cantidad: 12,
    color: "fondo-verde",
  },
];

const pedidosIniciales = [
  {
    id: 1058,
    cliente: "María López",
    fecha: "11/07",
    estado: "Nuevo",
    unidades: 3,
    total: "$48.900",
    color: "fondo-azul",
  },
  {
    id: 1057,
    cliente: "Juan Pérez",
    fecha: "11/07",
    estado: "Pendiente de pago",
    unidades: 2,
    total: "$72.300",
    color: "fondo-amarillo",
  },
  {
    id: 1056,
    cliente: "Ana Ruiz",
    fecha: "10/07",
    estado: "En preparación",
    unidades: 4,
    total: "$39.500",
    color: "fondo-violeta",
  },
  {
    id: 1055,
    cliente: "Pedro Gómez",
    fecha: "10/07",
    estado: "Finalizado",
    unidades: 5,
    total: "$65.200",
    color: "fondo-verde",
  },
];

function Pedidos() {
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
          {categoriasPedidos.map((categoria) => (
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

            {pedidosIniciales.map((pedido) => (
              <article
                className={`estructura__tabla-fila admin-pedidos__fila ${pedido.color}`}
                key={pedido.id}
              >
                <div className="estructura__tabla-dato">
                  <span className="estructura__tabla-etiqueta">Pedido</span>

                  <strong>#{pedido.id}</strong>
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
      </Contenedor>
    </main>
  );
}

export default Pedidos;
