import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Contenedor from "../../componentesReuse/Contenedor";
import Boton from "../../componentesReuse/Boton";
import { obtenerDetallePedido } from "../servicios/pedidosService";
import "../../estilos/admin-productos.css";
import "../../estilos/admin-pedidos.css";

const formatoPesos = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
});

function mostrarImporte(centavos) {
  return typeof centavos === "number"
    ? formatoPesos.format(centavos / 100)
    : "No informado";
}

function DireccionPedido({ titulo, direccion }) {
  const campos = [
    ["Calle", direccion?.streetLine1],
    ["Ciudad", direccion?.city],
    ["Provincia", direccion?.province],
    ["Código postal", direccion?.postalCode],
    ["Teléfono", direccion?.phoneNumber],
  ].filter(([, valor]) => Boolean(valor?.trim()));

  return (
    <article className="estructura__panel">
      <div className="estructura__panel-encabezado"><h2>{titulo}</h2></div>
      {campos.length === 0 ? (
        <p>{titulo === "Facturación" ? "Dirección de facturación no informada" : "Dirección de entrega no informada"}</p>
      ) : (
        <dl>
          {campos.map(([etiqueta, valor]) => (
            <div key={etiqueta}><dt><strong>{etiqueta}</strong></dt><dd>{valor}</dd></div>
          ))}
        </dl>
      )}
    </article>
  );
}

function DetallePedido() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [pedido, setPedido] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let activo = true;
    async function cargar() {
      setCargando(true);
      setError("");
      try {
        const resultado = await obtenerDetallePedido(id);
        if (!activo) return;
        setPedido(resultado);
      } catch (err) {
        if (activo) setError(err.message || "No se pudo cargar el pedido.");
      } finally {
        if (activo) setCargando(false);
      }
    }
    cargar();
    return () => { activo = false; };
  }, [id]);

  function volver() {
    navigate("/admin/pedidos", { state: location.state });
  }

  return (
    <main className="estructura">
      <Contenedor>
        <header className="estructura__encabezado">
          <div><h1 className="estructura__titulo">Detalle del pedido</h1></div>
          <Boton variante="admin" onClick={volver}>Volver a Pedidos</Boton>
        </header>

        {cargando && <p>Cargando detalle del pedido...</p>}
        {error && <p role="alert" className="login-admin__error">{error}</p>}
        {!cargando && !error && !pedido && <p>No se encontró el pedido solicitado.</p>}

        {!cargando && !error && pedido && (
          <>
            <section className="estructura__panel">
              <div className="estructura__panel-encabezado"><h2>Pedido #{pedido.code}</h2></div>
              <p><strong>Estado:</strong> {pedido.state}</p>
            </section>
            <section className="estructura__panel">
              <div className="estructura__panel-encabezado"><h2>Cliente</h2></div>
              <p><strong>Nombre:</strong> {[pedido.customer?.firstName, pedido.customer?.lastName].filter(Boolean).join(" ") || "No informado"}</p>
              <p><strong>Correo:</strong> {pedido.customer?.emailAddress || "No informado"}</p>
            </section>
            <DireccionPedido titulo="Entrega" direccion={pedido.shippingAddress} />
            <DireccionPedido titulo="Facturación" direccion={pedido.billingAddress} />
            <section className="estructura__panel">
              <div className="estructura__panel-encabezado"><h2>Productos del pedido</h2></div>
              {pedido.lines?.length ? (
                <div>
                  {pedido.lines.map((linea) => (
                    <article className="estructura__lista-item" key={linea.id}>
                      <strong>{linea.productVariant?.product?.name || "Sin nombre"}</strong>
                      <span>Variante: {linea.productVariant?.name || "No informada"}</span>
                      <span>Cantidad: {linea.quantity}</span>
                    </article>
                  ))}
                </div>
              ) : <p>Este pedido no tiene productos registrados.</p>}
            </section>
            <section className="estructura__panel">
              <div className="estructura__panel-encabezado"><h2>Totales del pedido</h2></div>
              <p><strong>Subtotal de productos:</strong> {mostrarImporte(pedido.subTotalWithTax)}</p>
              {pedido.discounts?.length ? (
                <div>
                  {pedido.discounts.map((descuento, indice) => (
                    <p key={`${descuento.description || "descuento"}-${indice}`}>
                      <strong>{descuento.description || "Descuento"}:</strong> {mostrarImporte(descuento.amountWithTax)}
                    </p>
                  ))}
                </div>
              ) : (
                <p><strong>Descuentos:</strong> {mostrarImporte(0)}</p>
              )}
              <p><strong>Envío:</strong> {mostrarImporte(pedido.shippingWithTax)}</p>
              <p><strong>Total del pedido:</strong> {mostrarImporte(pedido.totalWithTax)}</p>
            </section>
          </>
        )}
      </Contenedor>
    </main>
  );
}

export default DetallePedido;
