import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './estilos/variables.css'
import './estilos/tipografias.css'
import './estilos/global.css'
import './estilos/Barra.css'
import './estilos/Portada.css'
import './estilos/Categorias.css'
import './estilos/CarruselPromociones.css'
import './estilos/CintaMarcas.css'
import './estilos/BloqueEditorial.css'
import './estilos/PiePagina.css'
import './estilos/Boton.css'
import './estilos/Contenedor.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
