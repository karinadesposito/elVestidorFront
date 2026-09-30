import { useEffect, useId, useMemo, useState, useRef } from "react";
import { FiImage, FiTrash2, FiUpload } from "react-icons/fi";

const TAMANIO_MAXIMO = 20 * 1024 * 1024;

const TIPOS_ACEPTADOS = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
];

function validarArchivo(archivo) {
  if (!archivo.type?.startsWith("image/")) {
    return "El archivo debe ser una imagen (JPG, PNG, WebP o AVIF).";
  }

  if (!TIPOS_ACEPTADOS.includes(archivo.type)) {
    return "Formato no admitido. Usá JPG, PNG, WebP o AVIF.";
  }

  if (archivo.size > TAMANIO_MAXIMO) {
    return "La imagen supera el máximo de 20 MB.";
  }

  return "";
}

/**
 * Selector de una sola imagen.
 *
 * No sube nada por sí mismo: la imagen elegida se guarda en el formulario y se
 * manda al backend al guardar, en el mismo request que el resto de los datos.
 * Así no queda un asset huérfano en Vendure si el usuario cierra el modal sin
 * confirmar.
 */
function SelectorImagen({
  etiqueta = "Imagen",
  imagenActual = null,
  archivo = null,
  onSeleccionarArchivo,
  deshabilitado = false,
}) {
  const [errorArchivo, setErrorArchivo] = useState("");
  const inputRef = useRef(null);
  const idEntrada = useId();

  const vistaPrevia = useMemo(
    () => (archivo ? URL.createObjectURL(archivo) : null),
    [archivo],
  );

  useEffect(
    () => () => {
      if (vistaPrevia) {
        URL.revokeObjectURL(vistaPrevia);
      }
    },
    [vistaPrevia],
  );

  const urlMostrar = vistaPrevia || imagenActual?.url || null;
  const hayImagen = Boolean(urlMostrar);

  function manejarCambio(e) {
    const archivoElegido = e.target.files?.[0] || null;

    if (!archivoElegido) {
      setErrorArchivo("");
      return;
    }

    const error = validarArchivo(archivoElegido);

    setErrorArchivo(error);

    if (!error) {
      onSeleccionarArchivo(archivoElegido);
    }

    // Permite volver a elegir el mismo archivo si el usuario se arrepiente.
    e.target.value = "";
  }

  function quitar() {
    setErrorArchivo("");
    onSeleccionarArchivo(null);
  }

  return (
    <div className="estructura__campo">
      <label htmlFor={idEntrada}>{etiqueta}</label>

      <div className="admin-productos__imagen">
        <div className="admin-productos__imagen-miniatura">
          {hayImagen ? (
            <img src={urlMostrar} alt={etiqueta} />
          ) : (
            <FiImage aria-hidden="true" />
          )}
        </div>

        <div className="admin-productos__imagen-controles">
          <input
            ref={inputRef}
            id={idEntrada}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
            onChange={manejarCambio}
            disabled={deshabilitado}
            className="admin-productos__imagen-entrada"
          />

          <FiUpload aria-hidden="true" />

          <span className="admin-productos__imagen-estado">
            {archivo
              ? `${archivo.name} · ${Math.round(archivo.size / 1024)} KB`
              : imagenActual
                ? "Imagen guardada"
                : "Sin imagen"}
          </span>

          {hayImagen && (
            <button
              type="button"
              className="admin-productos__imagen-quitar"
              onClick={quitar}
              disabled={deshabilitado}
            >
              <FiTrash2 aria-hidden="true" />
              Quitar
            </button>
          )}
        </div>
      </div>

      <p className="admin-productos__imagen-ayuda">
        {errorArchivo ||
          "JPG, PNG, WebP o AVIF, hasta 20 MB. La imagen se sube al guardar el formulario."}
      </p>
    </div>
  );
}

export default SelectorImagen;
