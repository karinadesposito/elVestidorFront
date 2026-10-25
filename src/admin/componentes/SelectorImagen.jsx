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
  imagenesActuales = [],
  archivos = [],
  onCambiarGaleria = null,
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

  const [previews, setPreviews] = useState([]);
  useEffect(() => {
    if (!onCambiarGaleria) return;
    const urls = archivos.map((item) => URL.createObjectURL(item));
    setPreviews(urls);
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [archivos, onCambiarGaleria]);
  const urlMostrar = vistaPrevia || imagenActual?.url || null;
  const hayImagen = Boolean(urlMostrar);

  function manejarCambio(e) {
    if (onCambiarGaleria) {
      const elegidos = Array.from(e.target.files || []);
      const error = elegidos.map(validarArchivo).find(Boolean) || "";
      setErrorArchivo(error);
      if (!error && elegidos.length) onCambiarGaleria(imagenesActuales, [...archivos, ...elegidos]);
      e.target.value = "";
      return;
    }
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

      {onCambiarGaleria && (
        <div className="admin-productos__galeria" style={{display:"flex",flexWrap:"wrap",gap:"var(--espacio-2)",marginBottom:"var(--espacio-2)"}}>
          {imagenesActuales.map((item, indice) => (
            <div key={`asset-${item.id}`} style={{width:96}}>
              <img src={item.url} alt={`Foto ${indice + 1}`} style={{width:96,height:110,objectFit:"contain"}} />
              <button type="button" disabled={deshabilitado} onClick={() => onCambiarGaleria(imagenesActuales.filter((_, i) => i !== indice), archivos)}>Quitar</button>
            </div>
          ))}
          {archivos.map((item, indice) => (
            <div key={`nuevo-${indice}-${item.name}`} style={{width:96}}>
              {previews[indice] && <img src={previews[indice]} alt={`Nueva foto ${indice + 1}`} style={{width:96,height:110,objectFit:"contain"}} />}
              <button type="button" disabled={deshabilitado} onClick={() => onCambiarGaleria(imagenesActuales, archivos.filter((_, i) => i !== indice))}>Quitar</button>
            </div>
          ))}
        </div>
      )}
      <div className="admin-productos__imagen">
        {!onCambiarGaleria && <div className="admin-productos__imagen-miniatura">
          {hayImagen ? (
            <img src={urlMostrar} alt={etiqueta} />
          ) : (
            <FiImage aria-hidden="true" />
          )}
        </div>}

        <div className="admin-productos__imagen-controles">
          <input
            ref={inputRef}
            id={idEntrada}
            type="file"
            multiple={Boolean(onCambiarGaleria)}
            accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
            onChange={manejarCambio}
            disabled={deshabilitado}
            className="admin-productos__imagen-entrada"
          />

          <FiUpload aria-hidden="true" />

          {!onCambiarGaleria ? <span className="admin-productos__imagen-estado">
            {archivo
              ? `${archivo.name} · ${Math.round(archivo.size / 1024)} KB`
              : imagenActual
                ? "Imagen guardada"
                : "Sin imagen"}
          </span> : <span className="admin-productos__imagen-estado">{imagenesActuales.length + archivos.length} fotografías</span>}
          {!onCambiarGaleria && hayImagen && (
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
