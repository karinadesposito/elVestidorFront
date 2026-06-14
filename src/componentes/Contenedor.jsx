function Contenedor({ children, className = '' }) {
  return <div className={`contenedor ${className}`.trim()}>{children}</div>
}

export default Contenedor
