import { useState } from "react";
import { FiMoreVertical } from "react-icons/fi";

import Boton from "../../componentesReuse/Boton";

function VariantesProducto({ variantes = [], onEditar, onCambiarEstado }) {
  const [menuAccionesAbiertoId, setMenuAccionesAbiertoId] = useState(null);

  if (!variantes.length) {
    return null;
  }

  function seleccionarAccion(accion) {
    setMenuAccionesAbiertoId(null);
    accion();
  }

  return (
    <div className="estructura__tabla">
      <div className="estructura__tabla-cabecera">
        <span>Color</span>
        <span>Talle</span>
        <span>Barcode/SKU</span>
        <span>Precio</span>
        <span>Activo</span>
        <span>Acciones</span>
      </div>

      {variantes.map((variante) => (
        <article
          className="estructura__tabla-fila admin-productos__variante-fila"
          key={variante.id}
        >
          <div className="estructura__tabla-dato">
            <span className="estructura__tabla-etiqueta">Color</span>
            <span>{variante.color || "—"}</span>
          </div>

          <div className="estructura__tabla-dato">
            <span className="estructura__tabla-etiqueta">Talle</span>
            <span>{variante.talle || "—"}</span>
          </div>

          <div className="estructura__tabla-dato">
            <span className="estructura__tabla-etiqueta">Barcode/SKU</span>
            <span>{variante.sku || "—"}</span>
          </div>

          <div className="estructura__tabla-dato">
            <span className="estructura__tabla-etiqueta">Precio</span>
            <span>
              Sin IVA: {variante.precioSinIvaFormateado || "—"}
              <br />
              IVA: {variante.ivaFormateado || "—"}
              <br />
              <strong>Final: {variante.precioFormateado || "—"}</strong>
            </span>
          </div>

          <div className="estructura__tabla-dato">
            <span className="estructura__tabla-etiqueta">Activo</span>
            <span>{variante.activo ? "Sí" : "No"}</span>
          </div>

          <div className="estructura__tabla-dato">
            <span className="estructura__tabla-etiqueta">Acciones</span>

            <div className="admin-productos__acciones-mobile">
              <button
                className="admin-productos__acciones-disparador"
                type="button"
                onClick={() =>
                  setMenuAccionesAbiertoId((idActual) =>
                    String(idActual) === String(variante.id) ? null : variante.id,
                  )
                }
                aria-label={`Acciones de la variante ${variante.color || "sin color"}, talle ${variante.talle || "sin talle"}`}
                aria-expanded={String(menuAccionesAbiertoId) === String(variante.id)}
              >
                <FiMoreVertical aria-hidden="true" />
              </button>

              {String(menuAccionesAbiertoId) === String(variante.id) && (
                <div className="admin-productos__acciones-menu">
                  <button
                    type="button"
                    onClick={() => seleccionarAccion(() => onEditar?.(variante))}
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      seleccionarAccion(() => onCambiarEstado?.(variante))
                    }
                  >
                    {variante.activo ? "Desactivar" : "Activar"}
                  </button>
                </div>
              )}
            </div>

            <div className="admin-productos__acciones-desktop">
              <Boton variante="admin" type="button" onClick={() => onEditar?.(variante)}>
                Editar
              </Boton>
              <Boton
                variante="admin"
                type="button"
                onClick={() => onCambiarEstado?.(variante)}
              >
                {variante.activo ? "Desactivar" : "Activar"}
              </Boton>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

export default VariantesProducto;
