import "../estilosReuse/ModalPromocional.css";

function ModalPromocional({
  imagen,
  titulo,
  subtitulo,
  destacado,
  descripcion,
  boton,
  onClose,
}) {
  return (
    <div className="modal-promocional">
      <section className="modal-promocional__contenedor">
        <button
          className="modal-promocional__cerrar"
          type="button"
          onClick={onClose}
          aria-label="Cerrar promoción"
        >
          ×
        </button>

        <img className="modal-promocional__imagen" src={imagen} alt={titulo} />

        <div className="modal-promocional__capa" />

        <div className="modal-promocional__contenido">
          <p className="modal-promocional__temporada">
            {titulo.split("\n").map((linea, index) => (
              <span key={index}>
                {linea}
                {index < titulo.split("\n").length - 1 && <br />}
              </span>
            ))}
          </p>

          <p className="modal-promocional__frase">{subtitulo}</p>

          <p className="modal-promocional__descuento">{destacado}</p>

          <p className="modal-promocional__detalle">{descripcion}</p>

          <button className="boton--promocional" type="button">
            {boton}
          </button>
        </div>
      </section>
    </div>
  );
}

export default ModalPromocional;
