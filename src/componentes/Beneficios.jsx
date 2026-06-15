import Contenedor from './Contenedor'

function Beneficios() {
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

          <h2 className="beneficios__titulo">No enviamos spam.</h2>

          <p className="beneficios__texto">
            Sólo avisamos cuando llega algo que realmente vale la pena.
          </p>

          <button className="beneficios__boton" type="button">
            Unirme ahora →
          </button>
        </div>
      </Contenedor>
    </section>
  )
}

export default Beneficios