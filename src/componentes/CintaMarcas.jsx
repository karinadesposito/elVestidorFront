import Contenedor from './Contenedor'

const marcas = [
  'Merrell',
  'Grimoldi',
  'Hush Puppies',
  'CAT',
  'Vans',
  'DC',
  'Topper',
  'Converse',
]

function CintaMarcas() {
  return (
    <section className="seccion cinta-marcas">
      <Contenedor>
        <p className="texto-etiqueta cinta-marcas__titulo">
          Las mejores marcas
        </p>
        <div className="cinta-marcas__lista">
          {marcas.map((marca) => (
            <span key={marca}>{marca}</span>
          ))}
        </div>
      </Contenedor>
    </section>
  )
}

export default CintaMarcas
