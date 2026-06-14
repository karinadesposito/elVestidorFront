import Contenedor from './Contenedor'

const promociones = [
  '3 cuotas sin interes',
  'Envios a todo el pais',
  'Cambios simples',
  'Retiro en tienda',
]

function CarruselPromociones() {
  return (
    <section className="banda carrusel-promociones">
      <Contenedor className="banda__contenido carrusel-promociones__contenedor">
        {promociones.map((promocion) => (
          <p className="carrusel-promociones__item" key={promocion}>
            {promocion}
          </p>
        ))}
      </Contenedor>
    </section>
  )
}

export default CarruselPromociones
