import { useEffect, useState } from "react";
import ModalAdmin from "./ModalAdmin";
import Boton from "../../componentesReuse/Boton";
import {
  buscarVariantesPromocion,
  obtenerVariantesPorIds,
  guardarPromocion,
  obtenerPromocion,
} from "../servicios/promocionesService";

const INICIAL = {
  nombre: "", descripcion: "", porcentaje: "", inicio: "", fin: "", habilitada: true,
};

function fechaLocal(valor) {
  if (!valor) return "";
  const fecha = new Date(valor);
  if (Number.isNaN(fecha.getTime())) return "";
  const local = new Date(fecha.getTime() - fecha.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

function leerIds(valor) {
  try {
    const resultado = JSON.parse(valor);
    return Array.isArray(resultado) ? resultado.map(String) : [];
  } catch {
    return valor ? [String(valor)] : [];
  }
}

export default function FormularioPromocion({ promocionId, onClose, onGuardado }) {
  const [formulario, setFormulario] = useState(INICIAL);
  const [variantes, setVariantes] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [resultados, setResultados] = useState([]);
  const [buscando, setBuscando] = useState(false);
  const [cargando, setCargando] = useState(Boolean(promocionId));
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!promocionId) return;
    let activo = true;
    async function cargar() {
      try {
        const promocion = await obtenerPromocion(promocionId);
        const accion = promocion.actions?.find((item) => item.code === "products_percentage_discount");
        const condicion = promocion.conditions?.find((item) => item.code === "contains_products");
        if (!accion || !condicion || promocion.couponCode) {
          throw new Error("Esta promoción utiliza otra configuración y no puede editarse desde este formulario.");
        }
        const argumento = (nombre) => accion.args?.find((item) => item.name === nombre)?.value;
        const ids = leerIds(argumento("productVariantIds"));
        if (!ids.length) throw new Error("No se pudieron recuperar las variantes de esta promoción.");
        const variantesRecuperadas = await obtenerVariantesPorIds(ids);
        if (!activo) return;
        setFormulario({
          nombre: promocion.name || "",
          descripcion: promocion.description || "",
          porcentaje: argumento("discount") || "",
          inicio: fechaLocal(promocion.startsAt),
          fin: fechaLocal(promocion.endsAt),
          habilitada: Boolean(promocion.enabled),
        });
        setVariantes(variantesRecuperadas);
      } catch (err) {
        if (activo) setError(err.message || "No se pudo cargar la promoción.");
      } finally {
        if (activo) setCargando(false);
      }
    }
    cargar();
    return () => { activo = false; };
  }, [promocionId]);

  function cambiar(evento) {
    const { name, type, value, checked } = evento.target;
    setFormulario((anterior) => ({ ...anterior, [name]: type === "checkbox" ? checked : value }));
  }

  async function buscar(evento) {
    evento.preventDefault();
    setError("");
    setBuscando(true);
    try {
      setResultados(await buscarVariantesPromocion(busqueda));
    } catch (err) {
      setError(err.message || "No se pudieron buscar variantes.");
    } finally {
      setBuscando(false);
    }
  }

  async function enviar(evento) {
    evento.preventDefault();
    setError("");
    setGuardando(true);
    try {
      await guardarPromocion({
        id: promocionId,
        ...formulario,
        variantes,
      });
      onGuardado();
    } catch (err) {
      setError(err.message || "No se pudo guardar la promoción.");
    } finally {
      setGuardando(false);
    }
  }

  const bloqueado = cargando || guardando;

  return (
    <ModalAdmin
      titulo={promocionId ? "Editar promoción" : "Nueva promoción"}
      onClose={onClose}
      formId="formulario-promocion"
      botonConfirmar={guardando ? "Guardando..." : "Guardar promoción"}
      botonConfirmarDeshabilitado={bloqueado || Boolean(error && cargando)}
    >
      {cargando ? <p>Cargando promoción...</p> : (
        <form id="formulario-promocion" className="estructura__formulario" onSubmit={enviar}>
          {error && <p className="login-admin__error" role="alert">{error}</p>}
          <div className="estructura__campo">
            <label htmlFor="promocion-nombre">Nombre</label>
            <input id="promocion-nombre" name="nombre" value={formulario.nombre} onChange={cambiar} required disabled={bloqueado} />
          </div>
          <div className="estructura__campo">
            <label htmlFor="promocion-descripcion">Descripción</label>
            <textarea id="promocion-descripcion" name="descripcion" value={formulario.descripcion} onChange={cambiar} disabled={bloqueado} />
          </div>
          <div className="estructura__campo">
            <label htmlFor="promocion-porcentaje">Descuento (%)</label>
            <input id="promocion-porcentaje" name="porcentaje" type="number" min="1" max="100" step="1" inputMode="numeric" value={formulario.porcentaje} onChange={cambiar} required disabled={bloqueado} />
          </div>
          <div className="estructura__campo">
            <label htmlFor="promocion-inicio">Inicio (opcional)</label>
            <input id="promocion-inicio" name="inicio" type="datetime-local" value={formulario.inicio} onChange={cambiar} disabled={bloqueado} />
          </div>
          <div className="estructura__campo">
            <label htmlFor="promocion-fin">Finalización (opcional)</label>
            <input id="promocion-fin" name="fin" type="datetime-local" value={formulario.fin} onChange={cambiar} disabled={bloqueado} />
          </div>
          <div className="estructura__campo">
            <label htmlFor="promocion-habilitada">
              <input id="promocion-habilitada" name="habilitada" type="checkbox" checked={formulario.habilitada} onChange={cambiar} disabled={bloqueado} />
              Promoción habilitada
            </label>
          </div>
          <div className="estructura__campo">
            <label htmlFor="promocion-busqueda">Buscar variantes por nombre o SKU</label>
            <div className="estructura__panel-acciones">
              <input id="promocion-busqueda" value={busqueda} onChange={(evento) => setBusqueda(evento.target.value)} disabled={bloqueado} />
              <Boton variante="admin" onClick={buscar} disabled={bloqueado || buscando || !busqueda.trim()}>
                {buscando ? "Buscando..." : "Buscar"}
              </Boton>
            </div>
          </div>
          {resultados.length > 0 && (
            <div className="estructura__campo">
              <strong>Resultados (máximo 50)</strong>
              {resultados.map((variante) => (
                <div key={variante.id}>
                  <Boton variante="admin" disabled={bloqueado || variantes.some((item) => String(item.id) === String(variante.id))} onClick={() => setVariantes((anteriores) => [...anteriores, variante])}>
                    Agregar
                  </Boton>{" "}
                  {variante.product?.name} — {variante.name} ({variante.sku || variante.id})
                </div>
              ))}
            </div>
          )}
          <div className="estructura__campo">
            <strong>Variantes seleccionadas ({variantes.length})</strong>
            {variantes.length === 0 && <p>Seleccioná al menos una variante.</p>}
            {variantes.map((variante) => (
              <div key={variante.id}>
                <Boton variante="admin" disabled={bloqueado} onClick={() => setVariantes((anteriores) => anteriores.filter((item) => String(item.id) !== String(variante.id)))}>
                  Quitar
                </Boton>{" "}
                {variante.product?.name ? `${variante.product.name} — ` : ""}{variante.name} ({variante.sku || variante.id})
              </div>
            ))}
          </div>
        </form>
      )}
    </ModalAdmin>
  );
}
