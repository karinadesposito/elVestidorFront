import client from "../../servicios/apolloClient";
import { gql } from "@apollo/client";
const IDIOMA = "es";
const FACETAS = {
  marca: {
    codigo: "marca",
    nombre: "Marca",
  },
  genero: {
    codigo: "genero",
    nombre: "Género",
  },
  tipoProducto: {
    codigo: "tipo-producto",
    nombre: "Tipo de producto",
  },
  color: {
    codigo: "color",
    nombre: "Color",
  },
};
const TIPOS_GRUPO = {
  color: {
    codigo: "color",
    nombre: "Color",
  },
  talle: {
    codigo: "talle",
    nombre: "Talle",
  },
};
const OBTENER_PRODUCTOS = gql`
  query ObtenerProductos($options: ProductListOptions) {
    products(options: $options) {
      items {
        id
        name
        description
        enabled
        facetValues {
          id
          name
          code
          facet {
            id
            name
            code
          }
        }
        variants {
          id
          name
          sku
          enabled
          price
          priceWithTax
          stockOnHand
          featuredAsset {
            id
            preview
            width
            height
          }
          assets {
            id
            preview
          }
          options {
            id
            name
            code
            group {
              id
              name
              code
            }
          }
          facetValues {
            id
            name
            code
            facet {
              id
              name
              code
            }
          }
        }
      }
      totalItems
    }
  }
`;
const OBTENER_RESUMEN_PRODUCTOS = gql`
  query ObtenerResumenProductos($options: ProductListOptions) {
    products(options: $options) {
      items {
        id
        variants {
          id
        }
      }
      totalItems
    }
  }
`;
const OBTENER_PRODUCTO = gql`
  query ObtenerProducto($id: ID!) {
    product(id: $id) {
      id
      name
      description
      enabled
      facetValues {
        id
        name
        code
        facet {
          id
          name
          code
        }
      }
      optionGroups {
        id
        name
        code
        productCount
        options {
          id
          name
          code
        }
      }
      variants {
        id
        name
        sku
        enabled
        price
        priceWithTax
        stockOnHand
        featuredAsset {
          id
          preview
          width
          height
        }
        assets {
          id
          preview
        }
        options {
          id
          name
          code
          group {
            id
            name
            code
          }
        }
      }
    }
  }
`;
const OBTENER_FACETAS = gql`
  query ObtenerFacetas($options: FacetListOptions) {
    facets(options: $options) {
      items {
        id
        name
        code
        values {
          id
          name
          code
        }
      }
      totalItems
    }
  }
`;
const CREAR_PRODUCTO = gql`
  mutation CrearProducto($input: CreateProductInput!) {
    createProduct(input: $input) {
      id
      name
      description
      enabled
      facetValues {
        id
        name
        code
        facet {
          id
          name
          code
        }
      }
    }
  }
`;
const ACTUALIZAR_PRODUCTO = gql`
  mutation ActualizarProducto($input: UpdateProductInput!) {
    updateProduct(input: $input) {
      id
      name
      description
      enabled
      facetValues {
        id
        name
        code
        facet {
          id
          name
          code
        }
      }
    }
  }
`;
const ELIMINAR_PRODUCTO = gql`
  mutation EliminarProducto($id: ID!) {
    deleteProduct(id: $id) {
      result
      message
    }
  }
`;
const CREAR_FACETA = gql`
  mutation CrearFaceta($input: CreateFacetInput!) {
    createFacet(input: $input) {
      id
      name
      code
      values {
        id
        name
        code
      }
    }
  }
`;
const CREAR_VALOR_FACETA = gql`
  mutation CrearValorFaceta($input: CreateFacetValueInput!) {
    createFacetValue(input: $input) {
      id
      name
      code
      facetId
    }
  }
`;
const CREAR_GRUPO_OPCIONES = gql`
  mutation CrearGrupoOpciones($input: CreateProductOptionGroupInput!) {
    createProductOptionGroup(input: $input) {
      id
      name
      code
      productCount
      options {
        id
        name
        code
      }
    }
  }
`;
const CREAR_OPCION_PRODUCTO = gql`
  mutation CrearOpcionProducto($input: CreateProductOptionInput!) {
    createProductOption(input: $input) {
      id
      name
      code
      groupId
    }
  }
`;
const AGREGAR_GRUPO_AL_PRODUCTO = gql`
  mutation AgregarGrupoAlProducto($productId: ID!, $optionGroupId: ID!) {
    addOptionGroupToProduct(
      productId: $productId
      optionGroupId: $optionGroupId
    ) {
      id
      name
      optionGroups {
        id
        name
        code
        productCount
        options {
          id
          name
          code
        }
      }
    }
  }
`;
const CREAR_VARIANTE = gql`
  mutation CrearVariante($input: CreateProductVariantInput!) {
    crearVariante(input: $input) {
      id
      name
      sku
      enabled
      price
      stockOnHand
      featuredAsset {
        id
        preview
      }
      options {
        id
        name
        code
        group {
          id
          name
          code
        }
      }
      facetValues {
        id
        name
        code
        facet {
          id
          name
          code
        }
      }
    }
  }
`;
const ACTUALIZAR_VARIANTE = gql`
  mutation ActualizarVariante($input: UpdateProductVariantInput!) {
    updateProductVariant(input: $input) {
      id
      name
      sku
      enabled
      price
      stockOnHand
      featuredAsset {
        id
        preview
      }
      assets {
        id
        preview
      }
      options {
        id
        name
        code
        group {
          id
          name
          code
        }
      }
      facetValues {
        id
        name
        code
        facet {
          id
          name
          code
        }
      }
    }
  }
`;
function generarCodigo(valor) {
  return String(valor || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
function generarSlug(nombre) {
  return generarCodigo(nombre);
}
function normalizarTexto(valor) {
  return String(valor || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}
function pesosACentavos(precio) {
  const valorNormalizado = String(precio ?? "")
    .trim()
    .replace(/\s/g, "")
    .replace(",", ".");
  const numero = Number(valorNormalizado);
  if (!Number.isFinite(numero) || numero < 0) {
    throw new Error("El precio ingresado no es válido.");
  }
  return Math.round(numero * 100);
}
function formatearPrecio(precioEnCentavos = 0) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
  }).format(precioEnCentavos / 100);
}
const TAMANIO_MAXIMO_IMAGEN = 20 * 1024 * 1024;
function obtenerTokenAdmin() {
  try {
    const sesion = JSON.parse(localStorage.getItem("admin_sesion"));
    return sesion?.token || null;
  } catch {
    return null;
  }
}
function mapearImagen(asset) {
  if (!asset?.preview) {
    return null;
  }
  return {
    id: asset.id,
    url: asset.preview,
    ancho: asset.width ?? 0,
    alto: asset.height ?? 0,
  };
}
/**
 * Sube el archivo al AssetServerPlugin de Vendure.
 *
 * El upload va por fetch crudo y no por Apollo porque la mutation createAssets
 * usa el scalar Upload, que requiere un POST multipart. Apollo Client 4 no
 * arma ese multipart solo, así que se replica el mismo token que usa
 * apolloClient.js.
 */
export async function subirArchivoAAssets(archivo) {
  if (!archivo) {
    throw new Error("No se seleccionó ningún archivo.");
  }
  if (!archivo.type?.startsWith("image/")) {
    throw new Error("El archivo debe ser una imagen (JPG, PNG, WebP o AVIF).");
  }
  if (archivo.size > TAMANIO_MAXIMO_IMAGEN) {
    throw new Error("La imagen supera el máximo de 20 MB.");
  }
  const formulario = new FormData();
  formulario.append(
    "operations",
    JSON.stringify({
      query: `
        mutation SubirArchivo($input: [CreateAssetInput!]!) {
          createAssets(input: $input) {
            ...on Asset { id preview source width height }
            ...on MimeTypeError { errorCode message }
          }
        }
      `,
      variables: { input: [{ file: "variables.input.0.file" }] },
    }),
  );
  formulario.append(
    "map",
    JSON.stringify({
      "variables.input.0.file": ["variables.input.0.file"],
    }),
  );
  formulario.append("variables.input.0.file", archivo, archivo.name);
  const token = obtenerTokenAdmin();
  const respuesta = await fetch("/admin-api", {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formulario,
  });
  const datos = await respuesta.json().catch(() => null);
  if (datos?.errors?.length) {
    throw new Error(datos.errors[0].message);
  }
  if (!respuesta.ok) {
    throw new Error(
      "No se pudo conectar con el servidor para subir la imagen.",
    );
  }
  const asset = datos?.data?.createAssets?.[0];
  if (!asset) {
    throw new Error("Vendure no devolvió la imagen.");
  }
  if (asset.errorCode) {
    throw new Error(
      asset.message || "Vendure rechazó el archivo por su formato.",
    );
  }
  return mapearImagen(asset);
}
/**
 * Quitar la imagen de una entidad solo la desvincula; el archivo queda en la
 * biblioteca de assets.
 */
/**
 * Decide qué IDs de asset van en el input de create/update.
 *
 * Devuelve null cuando no hay que tocar las imágenes, para que el input se
 * arme sin esos campos y no se borren las imágenes que ya tenía la entidad.
 * Si hay un archivo nuevo se sube primero y se usa su id.
 */
async function resolverIdsImagen({ archivo, imagenActual, quitarImagen }) {
  if (archivo) {
    const imagen = await subirArchivoAAssets(archivo);
    return {
      featuredAssetId: imagen.id,
      assetIds: [imagen.id],
    };
  }
  if (quitarImagen) {
    return {
      featuredAssetId: null,
      assetIds: [],
    };
  }
  if (imagenActual?.id) {
    return {
      featuredAssetId: imagenActual.id,
      assetIds: [imagenActual.id],
    };
  }
  return null;
}
function obtenerValorFaceta(valoresFaceta, codigoFaceta) {
  return (
    valoresFaceta?.find((valor) => valor.facet?.code === codigoFaceta)?.name ||
    ""
  );
}
function esGrupoColor(grupo) {
  const codigo = normalizarTexto(grupo?.code);
  const nombre = normalizarTexto(grupo?.name);
  return (
    nombre === "color" || codigo === "color" || codigo.startsWith("color-")
  );
}
function esGrupoTalle(grupo) {
  const codigo = normalizarTexto(grupo?.code);
  const nombre = normalizarTexto(grupo?.name);
  return (
    nombre === "talle" ||
    nombre.startsWith("talle ") ||
    codigo === "talle" ||
    codigo.startsWith("talle-")
  );
}
function obtenerOpcionColor(opciones = []) {
  return opciones.find((opcion) => esGrupoColor(opcion.group))?.name || "";
}
function obtenerOpcionTalle(opciones = []) {
  return opciones.find((opcion) => esGrupoTalle(opcion.group))?.name || "";
}
function mapearVariante(variante, productoId) {
  const opciones = variante.options || [];
  return {
    id: variante.id,
    productoId,
    nombre:
      variante.name ||
      opciones.map((opcion) => opcion.name).join(" / ") ||
      "Variante",
    sku: variante.sku || "—",
    precio: variante.priceWithTax ?? 0,
    precioFormateado: formatearPrecio(variante.priceWithTax),
    precioSinIva: variante.price ?? null,
    precioSinIvaFormateado:
      variante.price != null ? formatearPrecio(variante.price) : "—",
    iva:
      variante.price != null && variante.priceWithTax != null
        ? variante.priceWithTax - variante.price
        : null,
    ivaFormateado:
      variante.price != null && variante.priceWithTax != null
        ? formatearPrecio(variante.priceWithTax - variante.price)
        : "—",
    activo: variante.enabled,
    stock: variante.stockOnHand ?? 0,
    imagen: mapearImagen(variante.featuredAsset),
    color: obtenerOpcionColor(opciones),
    talle: obtenerOpcionTalle(opciones),
    opciones: opciones.map((opcion) => ({
      id: opcion.id,
      nombre: opcion.name,
      codigo: opcion.code,
      grupo: opcion.group?.name || "",
      codigoGrupo: opcion.group?.code || "",
    })),
  };
}
function mapearProducto(producto) {
  const valoresFaceta = producto.facetValues || [];
  const variantes = (producto.variants || []).map((variante) =>
    mapearVariante(variante, producto.id),
  );
  return {
    id: producto.id,
    nombre: producto.name,
    descripcion: producto.description || "",
    activo: producto.enabled,
    marca: obtenerValorFaceta(valoresFaceta, FACETAS.marca.codigo),
    genero: obtenerValorFaceta(valoresFaceta, FACETAS.genero.codigo),
    tipoProducto: obtenerValorFaceta(
      valoresFaceta,
      FACETAS.tipoProducto.codigo,
    ),
    variantes,
    cantidadVariantes: variantes.length,
  };
}
function mapearGrupoProducto(grupo) {
  return {
    id: grupo.id,
    nombre: grupo.name,
    codigo: grupo.code,
    productCount: grupo.productCount ?? 0,
    opciones: (grupo.options || []).map((opcion) => ({
      id: opcion.id,
      nombre: opcion.name,
      codigo: opcion.code,
    })),
  };
}
async function obtenerProductoPorId(productId) {
  const { data } = await client.query({
    query: OBTENER_PRODUCTO,
    variables: {
      id: productId,
    },
    fetchPolicy: "network-only",
  });
  if (!data.product) {
    throw new Error("No se encontró el producto seleccionado.");
  }
  return data.product;
}
async function obtenerFacetas() {
  const { data } = await client.query({
    query: OBTENER_FACETAS,
    variables: {
      options: {
        take: 1000,
      },
    },
    fetchPolicy: "network-only",
  });
  return data.facets.items;
}
async function obtenerOCrearFaceta(configuracion, facetas) {
  const facetaExistente = facetas.find(
    (faceta) => faceta.code === configuracion.codigo,
  );
  if (facetaExistente) {
    return facetaExistente;
  }
  const { data } = await client.mutate({
    mutation: CREAR_FACETA,
    variables: {
      input: {
        code: configuracion.codigo,
        isPrivate: false,
        translations: [
          {
            languageCode: IDIOMA,
            name: configuracion.nombre,
          },
        ],
      },
    },
  });
  return data.createFacet;
}
async function obtenerOCrearValorFaceta({
  configuracionFaceta,
  valor,
  facetas,
}) {
  const nombreValor = String(valor || "").trim();
  if (!nombreValor) {
    return null;
  }
  const codigoValor = generarCodigo(nombreValor);
  const faceta = await obtenerOCrearFaceta(configuracionFaceta, facetas);
  const valorExistente = faceta.values?.find(
    (valorFaceta) => valorFaceta.code === codigoValor,
  );
  if (valorExistente) {
    return valorExistente.id;
  }
  const { data } = await client.mutate({
    mutation: CREAR_VALOR_FACETA,
    variables: {
      input: {
        facetId: faceta.id,
        code: codigoValor,
        translations: [
          {
            languageCode: IDIOMA,
            name: nombreValor,
          },
        ],
      },
    },
  });
  return data.createFacetValue.id;
}
function obtenerGruposSemanticos(producto) {
  const grupos = producto.optionGroups || [];
  const gruposColor = grupos.filter(esGrupoColor);
  const gruposTalle = grupos.filter(esGrupoTalle);
  if (gruposColor.length > 1) {
    throw new Error(
      "El producto tiene más de un grupo de opciones de Color. Revisá su estructura en Vendure antes de agregar variantes.",
    );
  }
  if (gruposTalle.length > 1) {
    throw new Error(
      "El producto tiene más de un grupo de opciones de Talle. Revisá su estructura en Vendure antes de agregar variantes.",
    );
  }
  return {
    color: gruposColor[0] || null,
    talle: gruposTalle[0] || null,
  };
}
function validarGrupoPropioProducto(grupo, tipoGrupo) {
  if (!grupo) {
    return;
  }
  if (Number(grupo.productCount) > 1) {
    throw new Error(
      `El grupo ${tipoGrupo.nombre} de este producto está compartido con otros productos. Pertenece al modelo anterior de grupos globales y no se utilizará para crear nuevas variantes.`,
    );
  }
}
async function crearGrupoProducto({ productId, tipoGrupo }) {
  const codigoGrupo = `${tipoGrupo.codigo}-${productId}`;
  const { data } = await client.mutate({
    mutation: CREAR_GRUPO_OPCIONES,
    variables: {
      input: {
        code: codigoGrupo,
        translations: [
          {
            languageCode: IDIOMA,
            name: tipoGrupo.nombre,
          },
        ],
      },
    },
  });
  const grupoCreado = data.createProductOptionGroup;
  await client.mutate({
    mutation: AGREGAR_GRUPO_AL_PRODUCTO,
    variables: {
      productId,
      optionGroupId: grupoCreado.id,
    },
  });
  return {
    ...grupoCreado,
    productCount: 1,
    options: grupoCreado.options || [],
  };
}
async function obtenerOCrearGrupoProducto({
  producto,
  tipoGrupo,
  grupoExistente,
}) {
  if (grupoExistente) {
    validarGrupoPropioProducto(grupoExistente, tipoGrupo);
    return grupoExistente;
  }
  if ((producto.variants || []).length > 0) {
    throw new Error(
      `El producto ya tiene variantes pero no posee un grupo propio de ${tipoGrupo.nombre}. Revisá el producto antes de modificar su estructura de opciones.`,
    );
  }
  return crearGrupoProducto({
    productId: producto.id,
    tipoGrupo,
  });
}
function buscarOpcionPorNombre(grupo, nombreOpcion) {
  const codigo = generarCodigo(nombreOpcion);
  return grupo.options?.find(
    (opcion) => opcion.code === codigo || generarCodigo(opcion.name) === codigo,
  );
}
async function crearOpcionEnGrupo({ grupo, nombre }) {
  const nombreOpcion = String(nombre || "").trim();
  if (!nombreOpcion) {
    throw new Error("El nombre de la opción es obligatorio.");
  }
  const codigoOpcion = generarCodigo(nombreOpcion);
  const { data } = await client.mutate({
    mutation: CREAR_OPCION_PRODUCTO,
    variables: {
      input: {
        productOptionGroupId: grupo.id,
        code: codigoOpcion,
        translations: [
          {
            languageCode: IDIOMA,
            name: nombreOpcion,
          },
        ],
      },
    },
  });
  return data.createProductOption;
}
async function obtenerOCrearOpcionGrupo({ grupo, nombre }) {
  const nombreOpcion = String(nombre || "").trim();
  const opcionExistente = buscarOpcionPorNombre(grupo, nombreOpcion);
  if (opcionExistente) {
    return opcionExistente;
  }
  return crearOpcionEnGrupo({
    grupo,
    nombre: nombreOpcion,
  });
}
export async function obtenerCatalogosProducto() {
  const facetas = await obtenerFacetas();
  const facetaMarca = facetas.find(
    (faceta) => faceta.code === FACETAS.marca.codigo,
  );
  const facetaGenero = facetas.find(
    (faceta) => faceta.code === FACETAS.genero.codigo,
  );
  const facetaTipoProducto = facetas.find(
    (faceta) => faceta.code === FACETAS.tipoProducto.codigo,
  );
  const facetaColor = facetas.find(
    (faceta) => faceta.code === FACETAS.color.codigo,
  );
  return {
    marcas: (facetaMarca?.values || []).map((valor) => ({
      id: valor.id,
      nombre: valor.name,
      codigo: valor.code,
    })),
    generos: (facetaGenero?.values || []).map((valor) => ({
      id: valor.id,
      nombre: valor.name,
      codigo: valor.code,
    })),
    tiposProducto: (facetaTipoProducto?.values || []).map((valor) => ({
      id: valor.id,
      nombre: valor.name,
      codigo: valor.code,
    })),
    colores: (facetaColor?.values || []).map((valor) => ({
      id: valor.id,
      nombre: valor.name,
      codigo: valor.code,
    })),
  };
}
export async function obtenerOpcionesProducto(productId) {
  if (!productId) {
    return {
      color: null,
      talle: null,
    };
  }
  const producto = await obtenerProductoPorId(productId);
  const grupos = obtenerGruposSemanticos(producto);
  return {
    color: grupos.color ? mapearGrupoProducto(grupos.color) : null,
    talle: grupos.talle ? mapearGrupoProducto(grupos.talle) : null,
  };
}
/**
 * Arma el filtro de `products` combinando la búsqueda por texto con los filtros
 * de faceta. La búsqueda por nombre y cada faceta son condiciones independientes
 * que se combinan con AND; dentro de una misma faceta se usa `in` para que
 * marcar varias opciones devuelva la unión.
 */
function componerFiltroProductos({
  termino = "",
  marcas = [],
  tiposProducto = [],
} = {}) {
  const condiciones = [];
  const texto = String(termino || "").trim();
  if (texto) {
    condiciones.push({
      name: { contains: texto },
    });
  }
  if (marcas.length > 0) {
    condiciones.push({ facetValueId: { in: marcas.map(String) } });
  }
  if (tiposProducto.length > 0) {
    condiciones.push({ facetValueId: { in: tiposProducto.map(String) } });
  }
  if (condiciones.length === 0) {
    return null;
  }
  return condiciones.length === 1 ? condiciones[0] : { _and: condiciones };
}
async function consultarProductos({
  pagina = 1,
  take = 50,
  termino = "",
  marcas = [],
  tiposProducto = [],
} = {}) {
  const filtro = componerFiltroProductos({ termino, marcas, tiposProducto });
  const { data } = await client.query({
    query: OBTENER_PRODUCTOS,
    variables: {
      options: {
        skip: (pagina - 1) * take,
        take,
        ...(filtro ? { filter: filtro } : {}),
      },
    },
    fetchPolicy: "network-only",
  });
  return {
    productos: data.products.items.map(mapearProducto),
    total: data.products.totalItems,
  };
}
export async function obtenerProductos({
  pagina = 1,
  take = 50,
  marcas = [],
  tiposProducto = [],
} = {}) {
  return consultarProductos({ pagina, take, marcas, tiposProducto });
}
export async function buscarProductos(
  termino,
  { pagina = 1, take = 50, marcas = [], tiposProducto = [] } = {},
) {
  return consultarProductos({
    pagina,
    take,
    termino,
    marcas,
    tiposProducto,
  });
}
export async function buscarProductosPorNombre(nombre) {
  const nombreBuscado = String(nombre || "").trim();
  if (!nombreBuscado) {
    return [];
  }
  const palabras = nombreBuscado
    .toLowerCase()
    .split(/\s+/)
    .map((palabra) => palabra.trim())
    .filter(Boolean);
  const filtros = palabras.map((palabra) => ({
    name: {
      contains: palabra,
    },
  }));
  const { data } = await client.query({
    query: OBTENER_PRODUCTOS,
    variables: {
      options: {
        filter: {
          _or: filtros,
        },
        take: 50,
      },
    },
    fetchPolicy: "network-only",
  });
  return data.products.items.map(mapearProducto);
}
function normalizarNombreParaComparacion(nombre) {
  return String(nombre || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
export function analizarCoincidenciasNombre(nombre, productos) {
  const nombreNormalizado = normalizarNombreParaComparacion(nombre);
  if (!nombreNormalizado) {
    return [];
  }
  return productos
    .map((producto) => {
      const productoNormalizado = normalizarNombreParaComparacion(
        producto.nombre,
      );
      if (!productoNormalizado) {
        return null;
      }
      if (productoNormalizado === nombreNormalizado) {
        return {
          tipo: "exacta",
          producto,
        };
      }
      if (
        productoNormalizado.includes(nombreNormalizado) ||
        nombreNormalizado.includes(productoNormalizado)
      ) {
        return {
          tipo: "similar",
          producto,
        };
      }
      return null;
    })
    .filter(Boolean);
}
export async function crearProducto({
  nombre,
  descripcion,
  activo,
  marca,
  genero,
  tipoProducto,
}) {
  const nombreProducto = String(nombre || "").trim();
  if (!nombreProducto) {
    throw new Error("El nombre del producto es obligatorio.");
  }
  if (!marca?.trim()) {
    throw new Error("La marca es obligatoria.");
  }
  if (!genero?.trim()) {
    throw new Error("El género es obligatorio.");
  }
  if (!tipoProducto?.trim()) {
    throw new Error("El tipo de producto es obligatorio.");
  }
  const facetas = await obtenerFacetas();
  const facetValueIds = [];
  const configuraciones = [
    {
      configuracionFaceta: FACETAS.marca,
      valor: marca,
    },
    {
      configuracionFaceta: FACETAS.genero,
      valor: genero,
    },
    {
      configuracionFaceta: FACETAS.tipoProducto,
      valor: tipoProducto,
    },
  ];
  for (const configuracion of configuraciones) {
    const facetValueId = await obtenerOCrearValorFaceta({
      ...configuracion,
      facetas,
    });
    if (facetValueId) {
      facetValueIds.push(facetValueId);
    }
  }
  const { data } = await client.mutate({
    mutation: CREAR_PRODUCTO,
    variables: {
      input: {
        enabled: Boolean(activo),
        facetValueIds,
        translations: [
          {
            languageCode: IDIOMA,
            name: nombreProducto,
            description: String(descripcion || "").trim(),
            slug: generarSlug(nombreProducto),
          },
        ],
      },
    },
  });
  return data.createProduct;
}
export async function actualizarProducto({
  productId,
  nombre,
  descripcion,
  activo,
  marca,
  genero,
  tipoProducto,
}) {
  if (!productId) {
    throw new Error("Debés seleccionar un producto.");
  }
  const nombreProducto = String(nombre || "").trim();
  if (!nombreProducto) {
    throw new Error("El nombre del producto es obligatorio.");
  }
  if (!marca?.trim()) {
    throw new Error("La marca es obligatoria.");
  }
  if (!genero?.trim()) {
    throw new Error("El género es obligatorio.");
  }
  if (!tipoProducto?.trim()) {
    throw new Error("El tipo de producto es obligatorio.");
  }
  const [facetas, productoActual] = await Promise.all([
    obtenerFacetas(),
    obtenerProductoPorId(productId),
  ]);
  const codigosFacetasEditables = new Set([
    FACETAS.marca.codigo,
    FACETAS.genero.codigo,
    FACETAS.tipoProducto.codigo,
  ]);
  const facetValueIds = (productoActual.facetValues || [])
    .filter(
      (valorFaceta) => !codigosFacetasEditables.has(valorFaceta.facet?.code),
    )
    .map((valorFaceta) => valorFaceta.id);
  const configuraciones = [
    {
      configuracionFaceta: FACETAS.marca,
      valor: marca,
    },
    {
      configuracionFaceta: FACETAS.genero,
      valor: genero,
    },
    {
      configuracionFaceta: FACETAS.tipoProducto,
      valor: tipoProducto,
    },
  ];
  for (const configuracion of configuraciones) {
    const facetValueId = await obtenerOCrearValorFaceta({
      ...configuracion,
      facetas,
    });
    if (facetValueId && !facetValueIds.includes(facetValueId)) {
      facetValueIds.push(facetValueId);
    }
  }
  const { data } = await client.mutate({
    mutation: ACTUALIZAR_PRODUCTO,
    variables: {
      input: {
        id: productId,
        enabled: Boolean(activo),
        facetValueIds,
        translations: [
          {
            languageCode: IDIOMA,
            name: nombreProducto,
            description: String(descripcion || "").trim(),
            slug: generarSlug(nombreProducto),
          },
        ],
      },
    },
  });
  return data.updateProduct;
}
export async function cambiarEstadoProducto({ productId, activo }) {
  if (!productId) {
    throw new Error("Debés seleccionar un producto.");
  }
  const { data } = await client.mutate({
    mutation: ACTUALIZAR_PRODUCTO,
    variables: {
      input: {
        id: productId,
        enabled: Boolean(activo),
      },
    },
  });
  return data.updateProduct;
}
export async function eliminarProducto(productId) {
  if (!productId) {
    throw new Error("Debés seleccionar un producto.");
  }
  const { data } = await client.mutate({
    mutation: ELIMINAR_PRODUCTO,
    variables: {
      id: productId,
    },
  });
  const respuesta = data.deleteProduct;
  if (respuesta.result !== "DELETED") {
    throw new Error(
      respuesta.message || "Vendure no pudo eliminar el producto.",
    );
  }
  return respuesta;
}
export async function crearVariante({
  productId,
  color,
  talle,
  sku,
  precio,
  activo,
  imagenArchivo,
}) {
  if (!productId) {
    throw new Error("Debés seleccionar un producto.");
  }
  const nombreColor = String(color || "").trim();
  if (!nombreColor) {
    throw new Error("Debés indicar un color.");
  }
  const nombreTalle = String(talle || "").trim();
  const codigoSku = String(sku || "").trim();
  if (!codigoSku) {
    throw new Error("El barcode o SKU es obligatorio.");
  }
  const producto = await obtenerProductoPorId(productId);
  const gruposActuales = obtenerGruposSemanticos(producto);
  validarGrupoPropioProducto(gruposActuales.color, TIPOS_GRUPO.color);
  validarGrupoPropioProducto(gruposActuales.talle, TIPOS_GRUPO.talle);
  if (gruposActuales.talle && !nombreTalle) {
    throw new Error(
      "Este producto utiliza talle. Debés indicar un talle para la variante.",
    );
  }
  if (
    !gruposActuales.talle &&
    !nombreTalle &&
    (producto.variants || []).some((variante) =>
      obtenerOpcionTalle(variante.options || []),
    )
  ) {
    throw new Error(
      "Las variantes existentes del producto utilizan talle. Revisá la estructura del producto.",
    );
  }
  const grupoColor = await obtenerOCrearGrupoProducto({
    producto,
    tipoGrupo: TIPOS_GRUPO.color,
    grupoExistente: gruposActuales.color,
  });
  const opcionColor = await obtenerOCrearOpcionGrupo({
    grupo: grupoColor,
    nombre: nombreColor,
  });
  const optionIds = [opcionColor.id];
  let opcionTalle = null;
  if (nombreTalle) {
    const grupoTalle = await obtenerOCrearGrupoProducto({
      producto,
      tipoGrupo: TIPOS_GRUPO.talle,
      grupoExistente: gruposActuales.talle,
    });
    opcionTalle = await obtenerOCrearOpcionGrupo({
      grupo: grupoTalle,
      nombre: nombreTalle,
    });
    optionIds.push(opcionTalle.id);
  }
  const facetas = await obtenerFacetas();
  const colorFacetValueId = await obtenerOCrearValorFaceta({
    configuracionFaceta: FACETAS.color,
    valor: nombreColor,
    facetas,
  });
  const nombreVariante = [opcionColor.name, opcionTalle?.name]
    .filter(Boolean)
    .join(" / ");
  const imagen = await resolverIdsImagen({ archivo: imagenArchivo });
  const { data } = await client.mutate({
    mutation: CREAR_VARIANTE,
    variables: {
      input: {
        productId,
        enabled: Boolean(activo),
        sku: codigoSku,
        price: pesosACentavos(precio),
        optionIds,
        facetValueIds: colorFacetValueId ? [colorFacetValueId] : [],
        ...(imagen
          ? {
              featuredAssetId: imagen.featuredAssetId,
              assetIds: imagen.assetIds,
            }
          : {}),
        translations: [
          {
            languageCode: IDIOMA,
            name: nombreVariante,
          },
        ],
      },
    },
  });
  const varianteCreada = data.crearVariante;
  if (!varianteCreada) {
    throw new Error("Vendure no pudo crear la variante.");
  }
  return varianteCreada;
}
export async function actualizarVariante({
  variantId,
  sku,
  precio,
  activo,
  optionIds = [],
  imagenArchivo,
  imagenActual,
  quitarImagen,
}) {
  if (!variantId) {
    throw new Error("Debés seleccionar una variante.");
  }
  const codigoSku = String(sku || "").trim();
  if (!codigoSku) {
    throw new Error("El barcode o SKU es obligatorio.");
  }
  const imagen = await resolverIdsImagen({
    archivo: imagenArchivo,
    imagenActual,
    quitarImagen,
  });
  const { data } = await client.mutate({
    mutation: ACTUALIZAR_VARIANTE,
    variables: {
      input: {
        id: variantId,
        sku: codigoSku,
        price: pesosACentavos(precio),
        enabled: Boolean(activo),
        optionIds,
        ...(imagen
          ? {
              featuredAssetId: imagen.featuredAssetId,
              assetIds: imagen.assetIds,
            }
          : {}),
      },
    },
  });
  const varianteActualizada = data.updateProductVariant;
  if (!varianteActualizada) {
    throw new Error("Vendure no pudo actualizar la variante.");
  }
  return varianteActualizada;
}
export async function obtenerResumenProductos() {
  const take = 50;
  let skip = 0;
  let totalProductos;
  let totalVariantes = 0;
  do {
    const { data } = await client.query({
      query: OBTENER_RESUMEN_PRODUCTOS,
      variables: {
        options: { skip, take },
      },
      fetchPolicy: "network-only",
    });
    const productos = data.products.items;
    totalProductos = data.products.totalItems;
    totalVariantes += productos.reduce(
      (cantidad, producto) => cantidad + (producto.variants || []).length,
      0,
    );
    if (productos.length === 0 && skip < totalProductos) {
      throw new Error("No se pudo completar el resumen de productos.");
    }
    skip += productos.length;
  } while (skip < totalProductos);
  return [
    {
      nombre: "Modelos de producto",
      cantidad: totalProductos,
    },
    {
      nombre: "Productos diferentes",
      cantidad: totalVariantes,
    },
  ];
}


const BUSCAR_VARIANTES_LISTADO = gql`
  query BuscarVariantesListado($options: ProductVariantListOptions) {
    productVariants(options: $options) {
      totalItems
      items {
        id
        name
        sku
        enabled
        price
        priceWithTax
        stockOnHand
        featuredAsset { id preview width height }
        options {
          id name code
          group { id name code }
        }
        product {
          id name description enabled
          facetValues {
            id name code
            facet { id name code }
          }
        }
      }
    }
  }
`;

export async function buscarVariantes(
  termino,
  { pagina = 1, take = 50, marcas = [], tiposProducto = [] } = {},
) {
  const texto = String(termino || "").trim();
  if (!texto) return { variantes: [], productos: [], total: 0 };

  const filter = {
    _or: [{ name: { contains: texto } }, { sku: { contains: texto } }],
  };
  const filtrarPorFacetas = marcas.length > 0 || tiposProducto.length > 0;
  const variantesEncontradas = [];
  let total = 0;
  let skip = filtrarPorFacetas ? 0 : (pagina - 1) * take;

  do {
    const { data } = await client.query({
      query: BUSCAR_VARIANTES_LISTADO,
      variables: {
        options: { filter, skip, take: filtrarPorFacetas ? 100 : take },
      },
      fetchPolicy: "network-only",
    });
    const resultado = data.productVariants;
    total = resultado.totalItems;
    if (resultado.items.length === 0 && skip < total) {
      throw new Error("No se pudo completar la búsqueda de variantes.");
    }
    variantesEncontradas.push(...resultado.items.filter((variante) => {
      const ids = new Set((variante.product?.facetValues || []).map((valor) => String(valor.id)));
      return (!marcas.length || marcas.some((id) => ids.has(String(id)))) &&
        (!tiposProducto.length || tiposProducto.some((id) => ids.has(String(id))));
    }));
    skip += resultado.items.length;
    if (!filtrarPorFacetas || resultado.items.length === 0) break;
  } while (skip < total);

  const variantesPagina = filtrarPorFacetas
    ? variantesEncontradas.slice((pagina - 1) * take, pagina * take)
    : variantesEncontradas;
  if (filtrarPorFacetas) total = variantesEncontradas.length;

  const productosPorId = new Map();
  variantesPagina.forEach((variante) => {
    const producto = variante.product;
    if (!producto) return;
    const id = String(producto.id);
    if (!productosPorId.has(id)) {
      productosPorId.set(id, mapearProducto({ ...producto, variants: [] }));
    }
    const padre = productosPorId.get(id);
    padre.variantes.push(mapearVariante(variante, producto.id));
    padre.cantidadVariantes = padre.variantes.length;
  });
  const productos = Array.from(productosPorId.values());
  return {
    productos,
    variantes: productos.flatMap((producto) => producto.variantes),
    total,
  };
}
