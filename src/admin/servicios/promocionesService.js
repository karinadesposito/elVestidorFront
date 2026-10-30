import { gql } from "@apollo/client";
import client from "../../servicios/apolloClient";

const TAMANIO_PAGINA = 50;

const OBTENER_PROMOCIONES = gql`
  query ObtenerPromociones($options: PromotionListOptions) {
    promotions(options: $options) {
      totalItems
      items { id name description enabled startsAt endsAt couponCode }
    }
  }
`;

const OBTENER_PROMOCION = gql`
  query ObtenerPromocionParaEditar($id: ID!) {
    promotion(id: $id) {
      id name description enabled startsAt endsAt couponCode
      actions { code args { name value } }
      conditions { code args { name value } }
    }
  }
`;

const BUSCAR_VARIANTES = gql`
  query BuscarVariantesPromocion($options: ProductVariantListOptions) {
    productVariants(options: $options) {
      items { id name sku product { id name } }
    }
  }
`;

const OBTENER_VARIANTE = gql`
  query ObtenerVariantePromocion($id: ID!) {
    productVariant(id: $id) {
      id name sku product { id name }
    }
  }
`;

const CREAR_PROMOCION = gql`
  mutation CrearPromocion($input: CreatePromotionInput!) {
    createPromotion(input: $input) {
      __typename
      ... on Promotion { id }
      ... on MissingConditionsError { message }
    }
  }
`;

const ACTUALIZAR_PROMOCION = gql`
  mutation ActualizarPromocion($input: UpdatePromotionInput!) {
    updatePromotion(input: $input) {
      __typename
      ... on Promotion { id }
      ... on MissingConditionsError { message }
    }
  }
`;

export async function obtenerPromociones(pagina = 1) {
  const paginaNormalizada = Math.max(1, Math.floor(Number(pagina) || 1));
  const { data } = await client.query({
    query: OBTENER_PROMOCIONES,
    variables: { options: { skip: (paginaNormalizada - 1) * TAMANIO_PAGINA, take: TAMANIO_PAGINA } },
    fetchPolicy: "network-only",
  });
  if (!data?.promotions) throw new Error("Vendure no devolvió el listado de promociones.");
  return {
    promociones: data.promotions.items || [],
    total: data.promotions.totalItems || 0,
    tamanioPagina: TAMANIO_PAGINA,
  };
}

export async function obtenerPromocion(id) {
  const { data } = await client.query({
    query: OBTENER_PROMOCION,
    variables: { id },
    fetchPolicy: "network-only",
  });
  if (!data?.promotion) throw new Error("No se encontró la promoción.");
  return data.promotion;
}

export async function buscarVariantesPromocion(texto) {
  const termino = String(texto || "").trim();
  if (!termino) return [];
  const { data } = await client.query({
    query: BUSCAR_VARIANTES,
    variables: {
      options: {
        take: 50,
        filter: { _or: [{ name: { contains: termino } }, { sku: { contains: termino } }] },
      },
    },
    fetchPolicy: "network-only",
  });
  return data?.productVariants?.items || [];
}

export async function obtenerVariantesPorIds(ids) {
  const variantes = await Promise.all(ids.map(async (id) => {
    const { data } = await client.query({
      query: OBTENER_VARIANTE,
      variables: { id: String(id) },
      fetchPolicy: "network-only",
    });
    if (!data?.productVariant) {
      throw new Error(`No se encontró la variante ${id}. Revisá si sigue disponible.`);
    }
    return data.productVariant;
  }));
  return variantes;
}

export async function guardarPromocion({ id, nombre, descripcion, porcentaje, variantes, inicio, fin, habilitada }) {
  const ids = [...new Set(variantes.map((variante) => String(variante.id)))];
  const descuento = Number(String(porcentaje).trim());
  if (!nombre.trim()) throw new Error("Ingresá el nombre de la promoción.");
  if (!Number.isInteger(descuento) || descuento < 1 || descuento > 100) {
    throw new Error("Ingresá un porcentaje entero entre 1 y 100 (por ejemplo: 5, 10, 15 o 20).");
  }
  if (!ids.length) throw new Error("Seleccioná al menos una variante.");
  if (inicio && fin && new Date(inicio) >= new Date(fin)) {
    throw new Error("La fecha de finalización debe ser posterior al inicio.");
  }

  const input = {
    enabled: Boolean(habilitada),
    startsAt: inicio ? new Date(inicio).toISOString() : null,
    endsAt: fin ? new Date(fin).toISOString() : null,
    couponCode: null,
    conditions: [{
      code: "contains_products",
      arguments: [
        { name: "minimum", value: "1" },
        { name: "productVariantIds", value: JSON.stringify(ids) },
      ],
    }],
    actions: [{
      code: "products_percentage_discount",
      arguments: [
        { name: "discount", value: String(descuento) },
        { name: "productVariantIds", value: JSON.stringify(ids) },
      ],
    }],
    translations: [{ languageCode: "es", name: nombre.trim(), description: descripcion.trim() }],
  };
  if (id) input.id = id;

  const { data } = await client.mutate({
    mutation: id ? ACTUALIZAR_PROMOCION : CREAR_PROMOCION,
    variables: { input },
  });
  const resultado = id ? data?.updatePromotion : data?.createPromotion;
  if (resultado?.__typename !== "Promotion") {
    throw new Error(resultado?.message || "Vendure no pudo guardar la promoción.");
  }
  return resultado;
}
