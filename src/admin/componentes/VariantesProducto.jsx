function VariantesProducto({ variantes = [] }) {
  if (!variantes.length) {
    return null;
  }

  return (
    <div className="estructura__tabla">
      <div className="estructura__tabla-cabecera">
        <span>Color</span>
        <span>Talle</span>
        <span>Barcode/SKU</span>
        <span>Precio</span>
        <span>Activo</span>
      </div>

      {variantes.map((variante) => (
        <article
          className="estructura__tabla-fila"
          key={variante.id}
        >
          <div className="estructura__tabla-dato">
            <span className="estructura__tabla-etiqueta">
              Color
            </span>

            <span>{variante.color || "—"}</span>
          </div>

          <div className="estructura__tabla-dato">
            <span className="estructura__tabla-etiqueta">
              Talle
            </span>

            <span>{variante.talle || "—"}</span>
          </div>

          <div className="estructura__tabla-dato">
            <span className="estructura__tabla-etiqueta">
              Barcode/SKU
            </span>

            <span>{variante.sku || "—"}</span>
          </div>

          <div className="estructura__tabla-dato">
            <span className="estructura__tabla-etiqueta">
              Precio
            </span>

            <span>{variante.precioFormateado || "—"}</span>
          </div>

          <div className="estructura__tabla-dato">
            <span className="estructura__tabla-etiqueta">
              Activo
            </span>

            <span>{variante.activo ? "Sí" : "No"}</span>
          </div>
        </article>
      ))}
    </div>
  );
}

export default VariantesProducto;