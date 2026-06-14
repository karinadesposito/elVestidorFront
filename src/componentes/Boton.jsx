function Boton({
  children,
  onClick,
  type = 'button',
  disabled = false,
  className = '',
  variante = 'primario',
  ...props
}) {
  return (
    <button
      aria-disabled={disabled}
      className={`boton boton--${variante} ${className}`.trim()}
      disabled={disabled}
      onClick={onClick}
      type={type}
      {...props}
    >
      {children}
    </button>
  )
}

export default Boton
