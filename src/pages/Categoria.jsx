import { useParams } from 'react-router-dom'

function Categoria() {
  const { genero, categoria } = useParams()

  return (
    <main>
      <h1>{genero} / {categoria}</h1>
    </main>
  )
}

export default Categoria
