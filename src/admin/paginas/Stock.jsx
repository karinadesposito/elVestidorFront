import { useState } from "react";

import Contenedor from "../../componentesReuse/Contenedor";
import Boton from "../../componentesReuse/Boton";
import ModalAdmin from "../componentes/ModalAdmin";

import "../../estilos/admin-stock.css";

const categoriasStock = [
  {
    nombre: "Disponible",
    cantidad: 126,
    color: "fondo-azul",
  },
  {
    nombre: "Reservado",
    cantidad: 18,
    color: "fondo-amarillo",
  },
  {
    nombre: "Stock bajo",
    cantidad: 7,
    color: "fondo-violeta",
  },
  {
    nombre: "Sin stock",
    cantidad: 4,
    color: "fondo-verde",
  },
];

const stockInicial = [
  {
    barcode: "779001",
    producto: "Remera basica",
    variante: "Negro / M",
    stock: 12,
    reservado: 2,
    disponible: 10,
    estado: "Disponible",
    ultimoIngreso: "11/07",
    color: "fondo-azul",
  },
  {
    barcode: "779002",
    producto: "Jean mom",
    variante: "Azul / 40",
    stock: 4,
    reservado: 1,
    disponible: 3,
    estado: "Stock bajo",
    ultimoIngreso: "10/07",
    color: "fondo-amarillo",
  },
  {
    barcode: "779003",
    producto: "Campera denim",
    variante: "Celeste / L",
    stock: 0,
    reservado: 0,
    disponible: 0,
    estado: "Sin stock",
    ultimoIngreso: "08/07",
    color: "fondo-violeta",
  },
  {
    barcode: "779004",
    producto: "Vestido midi",
    variante: "Rojo / S",
    stock: 7,
    reservado: 2,
    disponible: 5,
    estado: "Disponible",
    ultimoIngreso: "07/07",
    color: "fondo-verde",
  },
];

function Stock() {
  const [modalAbierto, setModalAbierto] = useState(false);

  return (
    <main className="estructura">
      <Contenedor>
        <header className="estructura__encabezado">
          <div>
            <h1 className="estructura__titulo">Stock</h1>
          </div>
        </header>

        <section className="estructura__resumen" aria-label="Resumen de stock">
          {categoriasStock.map((categoria) => (
            <article
              className={`estructura__tarjeta ${categoria.color}`}
              key={categoria.nombre}
            >
              <span>{categoria.nombre}</span>
              <strong>{categoria.cantidad}</strong>
            </article>
          ))}
        </section>

        <section className="estructura__panel">
          <div className="estructura__panel-encabezado">
            <h2>Listado de stock</h2>

            <div className="estructura__panel-acciones">
              <Boton variante="admin" onClick={() => setModalAbierto(true)}>
                Nuevo ingreso stock
              </Boton>
            </div>
          </div>

          <div className="estructura__tabla">
            <div className="estructura__tabla-cabecera admin-stock__cabecera">
              <span>Barcode</span>
              <span>Producto</span>
              <span>Variante</span>
              <span>Stock</span>
              <span>Reservado</span>
              <span>Disponible</span>
              <span>Estado</span>
              <span>Ultimo ingreso</span>
            </div>

            {stockInicial.map((item) => (
              <article
                className={`estructura__tabla-fila admin-stock__fila ${item.color}`}
                key={item.barcode}
              >
                <div className="estructura__tabla-dato">
                  <span className="estructura__tabla-etiqueta">Barcode</span>

                  <strong>{item.barcode}</strong>
                </div>

                <div className="estructura__tabla-dato">
                  <span className="estructura__tabla-etiqueta">Producto</span>

                  <button className="estructura__tabla-boton" type="button">
                    {item.producto}
                  </button>
                </div>

                <div className="estructura__tabla-dato">
                  <span className="estructura__tabla-etiqueta">Variante</span>

                  <span>{item.variante}</span>
                </div>

                <div className="estructura__tabla-dato">
                  <span className="estructura__tabla-etiqueta">Stock</span>

                  <strong>{item.stock}</strong>
                </div>

                <div className="estructura__tabla-dato">
                  <span className="estructura__tabla-etiqueta">Reservado</span>

                  <strong>{item.reservado}</strong>
                </div>

                <div className="estructura__tabla-dato">
                  <span className="estructura__tabla-etiqueta">Disponible</span>

                  <strong>{item.disponible}</strong>
                </div>

                <div className="estructura__tabla-dato">
                  <span className="estructura__tabla-etiqueta">Estado</span>

                  <span>{item.estado}</span>
                </div>

                <div className="estructura__tabla-dato">
                  <span className="estructura__tabla-etiqueta">Ultimo ingreso</span>

                  <span>{item.ultimoIngreso}</span>
                </div>
              </article>
            ))}
          </div>
        </section>
      </Contenedor>

      {modalAbierto && (
        <ModalAdmin
          titulo="Nuevo ingreso stock"
          onClose={() => setModalAbierto(false)}
        >
          <form className="estructura__formulario">
            <div className="estructura__campo">
              <label htmlFor="stock-barcode">Barcode</label>
              <input
                id="stock-barcode"
                name="barcode"
                type="text"
                placeholder="Escanear o ingresar codigo"
                autoFocus
              />
            </div>

            <div className="estructura__campo">
              <label htmlFor="stock-variante">Producto / variante</label>
              <select id="stock-variante" name="variante">
                <option value="">Seleccionar variante</option>
                {stockInicial.map((item) => (
                  <option key={item.barcode} value={item.barcode}>
                    {item.producto} - {item.variante}
                  </option>
                ))}
              </select>
            </div>

            <div className="estructura__campo">
              <label htmlFor="stock-cantidad">Cantidad</label>
              <input id="stock-cantidad" name="cantidad" type="number" min="0" />
            </div>

            <div className="estructura__campo">
              <label htmlFor="stock-observaciones">Observaciones</label>
              <textarea id="stock-observaciones" name="observaciones" />
            </div>
          </form>
        </ModalAdmin>
      )}
    </main>
  );
}

export default Stock;
