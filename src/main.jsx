import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ApolloProvider } from '@apollo/client/react'
import client from './servicios/apolloClient'
import './index.css'
import './estilosReuse/variables.css'
import './estilosReuse/tipografias.css'
import './estilosReuse/global.css'
import './estilos/Barra.css'
import './estilos/Portada.css'
import './estilos/Categorias.css'
import './estilos/CarruselPromociones.css'
import './estilosReuse/Cinta.css'
import './estilos/BloqueEditorial.css'
import './estilos/Beneficios.css'
import './estilos/PiePagina.css'
import './estilosReuse/Boton.css'
import './estilosReuse/Contenedor.css'
import './estilosReuse/Cards.css'
import App from './App.jsx'
import './estilosReuse/ModalPromocional.css'
import './estilosReuse/menuMobile.css'
import './estilosReuse/itemMenu.css'
import "./estilosReuse/estructura.css";
import "./estilos/admin-inicio.css";



createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ApolloProvider client={client}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ApolloProvider>
  </StrictMode>,
)
