import Contenedor from "../../componentesReuse/Contenedor";

const categoriasPedidos = [
  {
    nombre: "Nuevos",
    cantidad: 8,
  },
  {
    nombre: "Pendientes de pago",
    cantidad: 3,
  },
  {
    nombre: "En preparación",
    cantidad: 2,
  },
  {
    nombre: "Finalizados",
    cantidad: 12,
  },
];

const pedidosIniciales = [
  {
    id: 1058,
    cliente: "María López",
    estado: "Nuevo",
    importe: "$48.900",
  },
  {
    id: 1057,
    cliente: "Juan Pérez",
    estado: "Pendiente de pago",
    importe: "$72.300",
  },
  {
    id: 1056,
    cliente: "Ana Ruiz",
    estado: "En preparación",
    importe: "$39.500",
  },
];

function Pedidos() {
  return (
    <main className="estructura">
      <Contenedor>
        <header className="estructura__encabezado">
          <div>
            <p className="estructura__eyebrow">Administración</p>

            <h1 className="estructura__titulo">Pedidos</h1>

            <p className="estructura__descripcion">
              Consultá y administrá los pedidos realizados en la tienda.
            </p>
          </div>
        </header>

        <section
          className="estructura__resumen"
          aria-label="Categorías de pedidos"
        >
          {categoriasPedidos.map((categoria) => (
            <article
              className="estructura__tarjeta"
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
            <div className="estructura__fila estructura__fila--cabecera">
              <span>Pedido y cliente</span>
              <span>Estado e importe</span>
            </div>

            {pedidosIniciales.map((pedido) => (
              <article className="estructura__fila" key={pedido.id}>
                <div>
                  <strong>#{pedido.id}</strong>
                  <span>{pedido.cliente}</span>
                </div>

                <div>
                  <span>{pedido.estado}</span>
                  <strong>{pedido.importe}</strong>
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