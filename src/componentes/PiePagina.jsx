import Contenedor from './Contenedor'

function PiePagina() {
  return (
    <footer className="seccion pie-pagina">
      <Contenedor className="grilla pie-pagina__contenedor">
        <div className="pie-pagina__newsletter">
          <p className="texto-etiqueta">Primera compra</p>
          <h2>Recibi novedades y beneficios antes que nadie.</h2>
          <p>Sumate para enterarte de promos, lanzamientos y selecciones.</p>
        </div>

        <div>
          <p className="pie-pagina__marca">El Vestidor</p>
          <p>Moda, calzado y accesorios con mirada editorial.</p>
        </div>

        <div className="pie-pagina__grupo">
          <p>Ayuda</p>
          <span>Envios</span>
          <span>Cambios</span>
          <span>Contacto</span>
        </div>

        <div className="pie-pagina__grupo">
          <p>Informacion</p>
          <span>Sobre nosotros</span>
          <span>Locales</span>
          <span>Terminos</span>
        </div>
      </Contenedor>
    </footer>
  )
}

export default PiePagina
