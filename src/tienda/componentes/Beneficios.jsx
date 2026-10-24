import { useState } from "react";
import Contenedor from "../../componentesReuse/Contenedor";
import Boton from "../../componentesReuse/Boton";
import { suscribirseClub } from "../../servicios/clubService";

const FORM_INICIAL = {
  nombre: "",
  email: "",
  sitioWeb: "",
};

function Beneficios() {
  const [formAbierto, setFormAbierto] = useState(false);
  const [form, setForm] = useState(FORM_INICIAL);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState(null);
  const [emailEnviado, setEmailEnviado] = useState("");

  function manejarCampo(e) {
    const { name, value } = e.target;
    setForm((anterior) => ({ ...anterior, [name]: value }));
    setError(null);
  }

  async function manejarEnvio(e) {
    e.preventDefault();
    if (enviando) {
      return;
    }
    setEnviando(true);
    setError(null);
    try {
      const email = await suscribirseClub(form);
      setEmailEnviado(email);
      setForm(FORM_INICIAL);
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <section className="beneficios">
      <Contenedor className="beneficios__contenedor">
        <div className="beneficios__tarjeta">
          <div className="beneficios__particulas" aria-hidden="true">
            {Array.from({ length: 18 }).map((_, index) => (
              <span key={index} />
            ))}
          </div>

          <p className="beneficios__etiqueta">El Vestidor Club</p>

          {emailEnviado ? (
            <div className="beneficios__resultado" role="status">
              <h2 className="beneficios__titulo">¡Listo!</h2>
              <p className="beneficios__texto">
                Si es la primera vez que te anotás, te va a llegar un correo a{" "}
                <strong>{emailEnviado}</strong> para confirmar. Si ya eras parte
                del Club, no tenés que hacer nada.
              </p>
            </div>
          ) : (
            <>
              <h2 className="beneficios__titulo">No enviamos spam.</h2>

              <p className="beneficios__texto">
                Sólo avisamos cuando llega algo que realmente vale la pena.
              </p>

              {formAbierto ? (
                <form className="beneficios__formulario" onSubmit={manejarEnvio} noValidate>
                  <label className="beneficios__campo" htmlFor="club-nombre">
                    <span>Nombre</span>
                    <input
                      id="club-nombre"
                      name="nombre"
                      type="text"
                      value={form.nombre}
                      onChange={manejarCampo}
                      maxLength="60"
                      autoComplete="given-name"
                      required
                      autoFocus
                    />
                  </label>
                  <label className="beneficios__campo" htmlFor="club-email">
                    <span>Email</span>
                    <input
                      id="club-email"
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={manejarCampo}
                      maxLength="254"
                      autoComplete="email"
                      inputMode="email"
                      required
                    />
                  </label>

                  {/* Campo trampa: invisible para las personas, los robots lo completan. */}
                  <input
                    className="beneficios__trampa"
                    name="sitioWeb"
                    type="text"
                    value={form.sitioWeb}
                    onChange={manejarCampo}
                    tabIndex="-1"
                    autoComplete="off"
                    aria-hidden="true"
                  />

                  {error && (
                    <p className="beneficios__error" role="alert">
                      {error}
                    </p>
                  )}

                  <Boton variante="promocional" type="submit" disabled={enviando}>
                    {enviando ? "Enviando..." : "Unirme al Club →"}
                  </Boton>

                  <p className="beneficios__aclaracion">
                    Te vamos a pedir que confirmes tu correo. Podés darte de
                    baja cuando quieras.
                  </p>
                </form>
              ) : (
                <Boton variante="promocional" onClick={() => setFormAbierto(true)}>
                  Unirme ahora →
                </Boton>
              )}
            </>
          )}
        </div>
      </Contenedor>
    </section>
  );
}

export default Beneficios;
