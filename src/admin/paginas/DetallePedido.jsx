
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import Contenedor from "../../componentesReuse/Contenedor";
import Boton from "../../componentesReuse/Boton";
import ModalAdmin from "../componentes/ModalAdmin";
import { useAuth } from "../contexto/AuthContext";

import {
  ESTADO_MAP,
  cancelarPedido,
  despacharPedido,
  entregarPedido,
  obtenerDetallePedido,
  transicionarEstado,
} from "../servicios/pedidosService";

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

const ESTADOS_PAGO = {
  Created: "Pendiente de confirmación",
  Authorized: "Autorizado",
  Settled: "Confirmado",
  Declined: "Rechazado",
  Cancelled: "Cancelado",
  Error: "Error en el pago",
};

const COLORES_ESTADO = {
  PaymentSettled: "fondo-azul",
  EnPreparacion: "fondo-violeta",
  Shipped: "fondo-amarillo",
  Delivered: "fondo-verde",
  Cancelled: "fondo-gris",
};

const EMPRESAS_ENVIO = ["Correo Argentino", "Andreani", "OCA", "Via Cargo", "Envío propio"];

const DATOS_ENVIO_INICIALES = { empresaEnvio: "", codigoSeguimiento: "" };

function mostrarMetodoPago(metodo) {
  if (!metodo) return "No informado";
  if (metodo === "mercado-pago-checkout-pro") return "Mercado Pago";
  return metodo;
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
    <article className="estructura__panel admin-detalle-pedido__direccion">
      <div className="estructura__panel-encabezado">
        <h2>{titulo}</h2>
      </div>

      {campos.length === 0 ? (
        <p>
          {titulo === "Facturación"
            ? "Dirección de facturación no informada"
            : "Dirección de entrega no informada"}
        </p>
      ) : (
        <dl>
          {campos.map(([etiqueta, valor]) => (
            <div key={etiqueta}>
              <dt>
                <strong>{etiqueta}</strong>
              </dt>
              <dd>{valor}</dd>
            </div>
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
  const { puede } = useAuth();
  // Cancelar requiere UpdateOrder: los vendedores solo avanzan el circuito de envío.
  const puedeCancelar = puede("UpdateOrder");

  const [pedido, setPedido] = useState(null);
  const [datosEnvio, setDatosEnvio] = useState(DATOS_ENVIO_INICIALES);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [errorTransicion, setErrorTransicion] = useState("");
  const [transicionando, setTransicionando] = useState(false);
  const [despachando, setDespachando] = useState(false);
  const [entregando, setEntregando] = useState(false);
  const [cancelando, setCancelando] = useState(false);
  const [motivoCancelacion, setMotivoCancelacion] = useState("");
  const [accionConfirmar, setAccionConfirmar] = useState(null);

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
        if (activo) {
          setError(err.message || "No se pudo cargar el pedido.");
        }
      } finally {
        if (activo) setCargando(false);
      }
    }

    cargar();

    return () => {
      activo = false;
    };
  }, [id]);

  async function pasarAPreparacion() {
    if (!pedido || pedido.state !== "PaymentSettled" || transicionando) return;

    setTransicionando(true);
    setErrorTransicion("");

    try {
      await transicionarEstado(pedido.id, "EnPreparacion");
      const actualizado = await obtenerDetallePedido(id);
      setPedido(actualizado);
    } catch (err) {
      setErrorTransicion(
        err.message || "No se pudo actualizar el estado del pedido."
      );
    } finally {
      setTransicionando(false);
    }
  }

  async function confirmarDespacho() {
    if (
      !pedido ||
      pedido.state !== "EnPreparacion" ||
      despachando ||
      transicionando
    ) return;

    setDespachando(true);
    setErrorTransicion("");

    try {
      const actualizado = await despacharPedido(pedido.id, datosEnvio);
      setPedido(actualizado);
      setDatosEnvio(DATOS_ENVIO_INICIALES);
    } catch (err) {
      setErrorTransicion(
        err.message || "No se pudo despachar el pedido."
      );

      try {
        setPedido(await obtenerDetallePedido(id));
      } catch {
        // Conservamos el error original.
      }
    } finally {
      setDespachando(false);
    }
  }

  async function confirmarEntrega() {
    if (
      !pedido ||
      pedido.state !== "Shipped" ||
      entregando ||
      despachando ||
      transicionando
    ) return;

    setEntregando(true);
    setErrorTransicion("");

    try {
      const actualizado = await entregarPedido(pedido.id);
      setPedido(actualizado);
    } catch (err) {
      setErrorTransicion(
        err.message || "No se pudo marcar el pedido como entregado."
      );

      try {
        setPedido(await obtenerDetallePedido(id));
      } catch {
        // Conservamos el error original.
      }
    } finally {
      setEntregando(false);
    }
  }

  async function confirmarCancelacion() {
    if (!pedido || !["PaymentSettled", "EnPreparacion"].includes(pedido.state) ||
        cancelando || despachando || entregando || transicionando) return;
    if (!motivoCancelacion.trim()) {
      setErrorTransicion("Ingresá un motivo para cancelar el pedido.");
      return;
    }
    setCancelando(true);
    setErrorTransicion("");
    try {
      const actualizado = await cancelarPedido(pedido.id, motivoCancelacion);
      setPedido(actualizado);
      setAccionConfirmar(null);
      setMotivoCancelacion("");
    } catch (err) {
      setErrorTransicion(err.message || "No se pudo cancelar el pedido.");
      try {
        const actualizado = await obtenerDetallePedido(id);
        setPedido(actualizado);
        if (!["PaymentSettled", "EnPreparacion"].includes(actualizado?.state)) {
          setAccionConfirmar(null);
        }
      } catch {
        // Mantenemos el error original para informar al administrador.
      }
    } finally {
      setCancelando(false);
    }
  }

  const procesando = transicionando || despachando || entregando || cancelando;

  const accionesPorEstado = {
    PaymentSettled: {
      tipo: "preparar",
      titulo: "Confirmar preparación",
      mensaje: "¿Querés pasar este pedido a En preparación?",
      boton: "Pasar a En preparación",
    },
    EnPreparacion: {
      tipo: "despachar",
      titulo: "Confirmar despacho",
      mensaje: "¿Confirmás que el pedido fue despachado?",
      boton: "Marcar como despachado",
    },
    Shipped: {
      tipo: "entregar",
      titulo: "Confirmar entrega",
      mensaje: "¿Confirmás que el pedido fue entregado?",
      boton: "Marcar como entregado",
    },
  };

  const accionDisponible = pedido
    ? accionesPorEstado[pedido.state]
    : null;

  const colorEstado = pedido
    ? COLORES_ESTADO[pedido.state] || "fondo-gris"
    : "";

  function cerrarConfirmacion() {
    if (!procesando) {
      setAccionConfirmar(null);
      setMotivoCancelacion("");
    }
  }

  async function ejecutarAccion(evento) {
    evento.preventDefault();

    if (procesando || !accionConfirmar) return;
    if (accionConfirmar === "cancelar") {
      await confirmarCancelacion();
      return;
    }
    if (!accionDisponible || accionConfirmar !== accionDisponible.tipo) return;
    if (accionConfirmar === "despachar" && !datosEnvio.empresaEnvio.trim()) return;
    const tipo = accionConfirmar;

    setAccionConfirmar(null);

    if (tipo === "preparar") await pasarAPreparacion();
    if (tipo === "despachar") await confirmarDespacho();
    if (tipo === "entregar") await confirmarEntrega();
  }

  function volver() {
    navigate("/admin/pedidos", { state: location.state });
  }

  return (
    <main className="estructura admin-detalle-pedido">
      <Contenedor>
        <header className="estructura__encabezado">
          <div>
            <h1 className="estructura__titulo">
              Detalle del pedido
            </h1>
          </div>

          <Boton variante="admin" onClick={volver}>
            Volver a Pedidos
          </Boton>
        </header>

        {cargando && <p>Cargando detalle del pedido...</p>}

        {error && (
          <p role="alert" className="login-admin__error">
            {error}
          </p>
        )}

        {!cargando && !error && !pedido && (
          <p>No se encontró el pedido solicitado.</p>
        )}

        {!cargando && !error && pedido && (
          <div className="admin-detalle-pedido__contenido">
            <section
              className={`estructura__panel admin-detalle-pedido__principal ${colorEstado}`}
            >
              <div className="estructura__panel-encabezado">
                <h2>Pedido #{pedido.code}</h2>
              </div>

              <div className="admin-detalle-pedido__estado">
                <p>
                  <strong>Estado:</strong>{" "}
                  {ESTADO_MAP[pedido.state] || pedido.state}
                </p>

                {accionDisponible && (
                  <Boton
                    onClick={() => {
                      setErrorTransicion("");
                      setAccionConfirmar(accionDisponible.tipo);
                    }}
                    disabled={procesando}
                  >
                    {procesando
                      ? "Actualizando..."
                      : accionDisponible.boton}
                  </Boton>
                )}
                {puedeCancelar &&
                  ["PaymentSettled", "EnPreparacion"].includes(pedido.state) &&
                  pedido.lines?.length > 0 &&
                  pedido.lines.every(linea => Number.isInteger(linea.quantity) && linea.quantity > 0) &&
                  !pedido.fulfillments?.some(despacho => despacho.state !== "Cancelled") &&
                  !pedido.lines.some(linea => (linea.fulfillmentLines || []).some(asignacion => asignacion.quantity > 0)) && (
                    <Boton
                      variante="admin"
                      disabled={procesando}
                      onClick={() => {
                        setErrorTransicion("");
                        setMotivoCancelacion("");
                        setAccionConfirmar("cancelar");
                      }}
                    >
                      Cancelar pedido
                    </Boton>
                  )}
              </div>

              {pedido.fulfillments?.length > 0 && (
                <div className="admin-detalle-pedido__despachos">
                  <h3>Despachos registrados</h3>

                  {pedido.fulfillments.map((despacho) => (
                    <p key={despacho.id}>
                      <strong>Despacho #{despacho.id}:</strong>{" "}
                      {despacho.state === "Shipped"
                        ? "Enviado"
                        : despacho.state === "Pending"
                        ? "Pendiente"
                        : despacho.state === "Delivered"
                        ? "Entregado"
                        : despacho.state}
                      {" · "}
                      {despacho.method || "Sin método"}
                      {despacho.trackingCode
                        ? ` · Seguimiento: ${despacho.trackingCode}`
                        : ""}
                    </p>
                  ))}
                </div>
              )}

              {errorTransicion && (
                <p role="alert" className="login-admin__error">
                  {errorTransicion}
                </p>
              )}
            </section>

            <div className="admin-detalle-pedido__informacion">
              <div className="admin-detalle-pedido__cliente-facturacion">
                <section className="estructura__panel">
                  <div className="estructura__panel-encabezado">
                    <h2>Cliente</h2>
                  </div>

                  <p>
                    <strong>Nombre:</strong>{" "}
                    {[
                      pedido.customer?.firstName,
                      pedido.customer?.lastName,
                    ].filter(Boolean).join(" ") || "No informado"}
                  </p>

                  <p>
                    <strong>Correo:</strong>{" "}
                    {pedido.customer?.emailAddress || "No informado"}
                  </p>
                </section>

                <DireccionPedido
                  titulo="Facturación"
                  direccion={pedido.billingAddress}
                />
              </div>

              <DireccionPedido
                titulo="Entrega"
                direccion={pedido.shippingAddress}
              />

              <section className="estructura__panel admin-detalle-pedido__totales">
                <div className="estructura__panel-encabezado">
                  <h2>Totales del pedido</h2>
                </div>

                <p>
                  <strong>Subtotal de productos:</strong>{" "}
                  {mostrarImporte(pedido.subTotalWithTax)}
                </p>

                {pedido.discounts?.length ? (
                  <div>
                    {pedido.discounts.map((descuento, indice) => (
                      <p
                        key={`${descuento.description || "descuento"}-${indice}`}
                      >
                        <strong>
                          {descuento.description || "Descuento"}:
                        </strong>{" "}
                        {mostrarImporte(descuento.amountWithTax)}
                      </p>
                    ))}
                  </div>
                ) : (
                  <p>
                    <strong>Descuentos:</strong> {mostrarImporte(0)}
                  </p>
                )}

                <p>
                  <strong>Envío:</strong>{" "}
                  {mostrarImporte(pedido.shippingWithTax)}
                </p>

                <p className="admin-detalle-pedido__total">
                  <strong>Total del pedido:</strong>{" "}
                  {mostrarImporte(pedido.totalWithTax)}
                </p>
              </section>
            </div>

            <section className="estructura__panel admin-detalle-pedido__productos">
              <div className="estructura__panel-encabezado">
                <h2>Productos del pedido</h2>
              </div>

              {pedido.lines?.length ? (
                <div>
                  {pedido.lines.map((linea) => (
                    <article
                      className="estructura__lista-item"
                      key={linea.id}
                    >
                      <strong>
                        {linea.productVariant?.product?.name ||
                          "Sin nombre"}
                      </strong>

                      <span>
                        Variante:{" "}
                        {linea.productVariant?.name || "No informada"}
                      </span>

                      <span>Cantidad: {linea.quantity}</span>

                      <span>
                        Unidades asociadas a despachos:{" "}
                        {(linea.fulfillmentLines || []).reduce(
                          (total, item) => total + item.quantity,
                          0
                        )}
                      </span>
                    </article>
                  ))}
                </div>
              ) : (
                <p>Este pedido no tiene productos registrados.</p>
              )}
            </section>

            <section className="estructura__panel admin-detalle-pedido__pagos">
              <div className="estructura__panel-encabezado">
                <h2>Pagos del pedido</h2>
              </div>

              {pedido.payments?.length ? (
                <div>
                  {pedido.payments.map((pago, indice) => (
                    <article
                      className="estructura__lista-item admin-detalle-pedido__pago"
                      key={`${pago.transactionId || "pago"}-${indice}`}
                    >
                      <p>
                        <strong>Método de pago:</strong>{" "}
                        {mostrarMetodoPago(pago.method)}
                      </p>

                      <p>
                        <strong>Importe:</strong>{" "}
                        {mostrarImporte(pago.amount)}
                      </p>

                      <p>
                        <strong>Estado:</strong>{" "}
                        {ESTADOS_PAGO[pago.state] ||
                          pago.state ||
                          "No informado"}
                      </p>

                      <p>
                        <strong>ID de transacción:</strong>{" "}
                        {pago.transactionId || "No informado"}
                      </p>
                    </article>
                  ))}
                </div>
              ) : (
                <p>Este pedido todavía no tiene pagos registrados.</p>
              )}
            </section>
          </div>
        )}
      </Contenedor>

      {accionConfirmar === "cancelar" && pedido &&
        ["PaymentSettled", "EnPreparacion"].includes(pedido.state) && (
        <ModalAdmin
          titulo="Confirmar cancelación"
          onClose={cerrarConfirmacion}
          formId="confirmar-cancelacion-pedido"
          botonConfirmar={cancelando ? "Cancelando..." : "Confirmar cancelación"}
          botonConfirmarDeshabilitado={procesando || !motivoCancelacion.trim()}
        >
          <form id="confirmar-cancelacion-pedido" onSubmit={ejecutarAccion}>
            <p>¿Querés cancelar el pedido #{pedido.code}? Esta acción no se puede deshacer.</p>
            <p>La cancelación se procesa en Vendure y el stock se gestiona desde el backend.</p>
            {pedido.payments?.some(pago => pago.state === "Settled") && (
              <p><strong>Atención:</strong> el pedido tiene un pago confirmado. Cancelarlo no implica reembolsar el dinero. Los reembolsos se gestionarán por separado.</p>
            )}
            <label htmlFor="motivo-cancelacion-pedido"><strong>Motivo de cancelación</strong></label>
            <textarea
              id="motivo-cancelacion-pedido"
              value={motivoCancelacion}
              onChange={evento => setMotivoCancelacion(evento.target.value)}
              required
              maxLength={500}
              rows={3}
              style={{ display: "block", width: "100%", marginTop: "0.5rem" }}
              placeholder="Indicá por qué se cancela el pedido"
              disabled={procesando}
            />
            {errorTransicion && <p role="alert" className="login-admin__error">{errorTransicion}</p>}
          </form>
        </ModalAdmin>
      )}
      {accionConfirmar &&
        accionDisponible?.tipo === accionConfirmar && (
          <ModalAdmin
            titulo={accionDisponible.titulo}
            onClose={cerrarConfirmacion}
            formId="confirmar-accion-pedido"
            botonConfirmar={
              procesando ? "Procesando..." : accionDisponible.boton
            }
            botonConfirmarDeshabilitado={
              procesando ||
              (accionConfirmar === "despachar" && !datosEnvio.empresaEnvio.trim())
            }
          >
            <form
              id="confirmar-accion-pedido"
              onSubmit={ejecutarAccion}
            >
              <p>{accionDisponible.mensaje}</p>
              <p>
                <strong>Pedido:</strong> #{pedido.code}
              </p>
              {accionConfirmar === "despachar" && (
                <>
                  <div className="estructura__campo">
                    <label htmlFor="despacho-empresa">Empresa de envío</label>
                    <input
                      id="despacho-empresa"
                      type="text"
                      list="despacho-empresas"
                      value={datosEnvio.empresaEnvio}
                      onChange={(evento) =>
                        setDatosEnvio({ ...datosEnvio, empresaEnvio: evento.target.value })
                      }
                      maxLength={100}
                      required
                      autoFocus
                      disabled={procesando}
                    />
                    <datalist id="despacho-empresas">
                      {EMPRESAS_ENVIO.map((empresa) => (
                        <option key={empresa} value={empresa} />
                      ))}
                    </datalist>
                  </div>
                  <div className="estructura__campo">
                    <label htmlFor="despacho-seguimiento">Código de seguimiento (opcional)</label>
                    <input
                      id="despacho-seguimiento"
                      type="text"
                      value={datosEnvio.codigoSeguimiento}
                      onChange={(evento) =>
                        setDatosEnvio({ ...datosEnvio, codigoSeguimiento: evento.target.value })
                      }
                      maxLength={100}
                      disabled={procesando}
                    />
                  </div>
                  <p>Al confirmar, el cliente recibe un correo con estos datos.</p>
                </>
              )}
            </form>
          </ModalAdmin>
        )}
    </main>
  );
}

export default DetallePedido;
