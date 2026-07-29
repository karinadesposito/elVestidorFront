import Boton from "../../componentesReuse/Boton";

function ModalAdmin({ titulo, children, onClose, formId }) {
  return (
    <div className="estructura__modal" role="dialog" aria-modal="true">
      <button
        className="estructura__modal-fondo"
        type="button"
        aria-label="Cerrar modal"
        onClick={onClose}
      />

      <section className="estructura__modal-contenido">
        <header className="estructura__modal-encabezado">
          <h2>{titulo}</h2>

          <button
            className="estructura__modal-cerrar"
            type="button"
            aria-label="Cerrar modal"
            onClick={onClose}
          >
            x
          </button>
        </header>

        <div className="estructura__modal-cuerpo">{children}</div>

        <footer className="estructura__modal-acciones">
          <Boton variante="admin" onClick={onClose} type="button">
            Cancelar
          </Boton>

          <Boton type="submit" form={formId}>
            Guardar
          </Boton>
        </footer>
      </section>
    </div>
  );
}

export default ModalAdmin;
