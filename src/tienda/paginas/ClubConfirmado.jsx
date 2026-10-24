import { Link } from "react-router-dom";
import Contenedor from "../../componentesReuse/Contenedor";

// Brevo redirige acá cuando el cliente toca "Confirmar suscripción" en el correo.
function ClubConfirmado() {
  return (
    <section className="beneficios beneficios--pagina">
      <Contenedor className="beneficios__contenedor">
        <div className="beneficios__tarjeta">
          <p className="beneficios__etiqueta">El Vestidor Club</p>
          <h1 className="beneficios__titulo">¡Bienvenido al Club!</h1>
          <p className="beneficios__texto">
            Confirmaste tu suscripción. Vas a ser de los primeros en enterarte
            de las novedades y promociones.
          </p>
          <Link className="boton boton--promocional" to="/">
            Ir a la tienda →
          </Link>
        </div>
      </Contenedor>
    </section>
  );
}

export default ClubConfirmado;
