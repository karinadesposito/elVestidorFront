import { useEffect, useRef, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  FiBox,
  FiLogOut,
  FiMenu,
  FiPackage,
  FiTag,
  FiUser,
  FiX,
} from 'react-icons/fi'

import Contenedor from '../../componentesReuse/Contenedor'
import Boton from '../../componentesReuse/Boton'
import logoSimbolo from '../../recursos/logos/logo-simbolo.svg'
import logoMarca from '../../recursos/logos/logo-marca.svg'
import { useAuth } from '../contexto/AuthContext'

import '../../estilos/admin-barra-superior.css'

const enlaces = [
  {
    texto: 'Pedidos',
    ruta: '/admin/pedidos',
    icono: FiPackage,
  },
  {
    texto: 'Productos',
    ruta: '/admin/productos',
    icono: FiBox,
  },
  {
    texto: 'Promociones',
    ruta: '/admin/promociones',
    icono: FiTag,
  },
  {
    texto: 'Stock',
    ruta: '/admin/stock',
    icono: FiPackage,
  },
]

function BarraSuperior() {
  const [menuAbierto, setMenuAbierto] = useState(false)
  const [usuarioAbierto, setUsuarioAbierto] = useState(false)

  const menuUsuarioRef = useRef(null)

  const navigate = useNavigate()
  const { logout } = useAuth()

const fechaActual = new Date()

const meses = [
  'ene',
  'feb',
  'mar',
  'abr',
  'may',
  'jun',
  'jul',
  'ago',
  'sep',
  'oct',
  'nov',
  'dic',
]

const fecha = `${fechaActual.getDate()} ${
  meses[fechaActual.getMonth()]
} ${fechaActual.getFullYear()}`

  useEffect(() => {
    function manejarClickFuera(evento) {
      if (
        menuUsuarioRef.current &&
        !menuUsuarioRef.current.contains(evento.target)
      ) {
        setUsuarioAbierto(false)
      }
    }

    document.addEventListener('mousedown', manejarClickFuera)

    return () => {
      document.removeEventListener('mousedown', manejarClickFuera)
    }
  }, [])

  function cerrarSesion() {
    logout()
    navigate('/admin', { replace: true })
  }

  return (
    <>
      <header className="barra-admin">
        <Contenedor className="barra-admin__contenedor">
          <Boton
            variante="icono"
            className="barra-admin__hamburguesa"
            aria-label="Abrir menú"
            aria-expanded={menuAbierto}
            onClick={() => setMenuAbierto(true)}
          >
            <FiMenu />
          </Boton>

          <NavLink
            to="/admin"
            className="barra-admin__marca"
            aria-label="Volver al inicio del panel"
          >
            <img
              className="barra-admin__simbolo"
              src={logoSimbolo}
              alt=""
              aria-hidden="true"
            />

            <img
              className="barra-admin__logo"
              src={logoMarca}
              alt="El Vestidor"
            />
          </NavLink>

          <nav
            className="barra-admin__navegacion"
            aria-label="Navegación del administrador"
          >
            {enlaces.map(({ texto, ruta, icono: Icono }) => (
              <NavLink
                key={ruta}
                to={ruta}
                className={({ isActive }) =>
                  `barra-admin__enlace${
                    isActive ? ' barra-admin__enlace--activo' : ''
                  }`
                }
              >
                <Icono aria-hidden="true" />
                <span>{texto}</span>
              </NavLink>
            ))}
          </nav>

          <div className="barra-admin__acciones">
            <time className="barra-admin__fecha">{fecha}</time>

            <div
              className="barra-admin__usuario"
              ref={menuUsuarioRef}
            >
              <Boton
                variante="icono"
                className="barra-admin__usuario-boton"
                aria-label="Opciones de usuario"
                aria-expanded={usuarioAbierto}
                onClick={() =>
                  setUsuarioAbierto((actual) => !actual)
                }
              >
                <FiUser />
              </Boton>

              {usuarioAbierto && (
                <div className="barra-admin__usuario-menu">
                  <button
                    type="button"
                    onClick={cerrarSesion}
                  >
                    <FiLogOut aria-hidden="true" />
                    <span>Cerrar sesión</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </Contenedor>
      </header>

      {menuAbierto && (
        <div className="barra-admin-mobile">
          <button
            type="button"
            className="barra-admin-mobile__fondo"
            aria-label="Cerrar menú"
            onClick={() => setMenuAbierto(false)}
          />

          <aside className="barra-admin-mobile__panel">
            <div className="barra-admin-mobile__encabezado">
              <NavLink
                to="/admin"
                className="barra-admin-mobile__marca"
                aria-label="Volver al inicio del panel"
                onClick={() => setMenuAbierto(false)}
              >
                <img
                  src={logoSimbolo}
                  alt=""
                  aria-hidden="true"
                />

                <img
                  src={logoMarca}
                  alt="El Vestidor"
                />
              </NavLink>

              <Boton
                variante="icono"
                className="barra-admin-mobile__cerrar"
                aria-label="Cerrar menú"
                onClick={() => setMenuAbierto(false)}
              >
                <FiX />
              </Boton>
            </div>

            <nav
              className="barra-admin-mobile__navegacion"
              aria-label="Navegación del administrador"
            >
              {enlaces.map(({ texto, ruta, icono: Icono }) => (
                <NavLink
                  key={ruta}
                  to={ruta}
                  onClick={() => setMenuAbierto(false)}
                >
                  <Icono aria-hidden="true" />
                  <span>{texto}</span>
                </NavLink>
              ))}

              <button
                type="button"
                onClick={cerrarSesion}
              >
                <FiLogOut aria-hidden="true" />
                <span>Cerrar sesión</span>
              </button>
            </nav>
          </aside>
        </div>
      )}
    </>
  )
}

export default BarraSuperior
