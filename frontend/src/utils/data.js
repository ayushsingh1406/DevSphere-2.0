export function asArray(payload) {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.results)) {
    return payload.results;
  }

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  if (Array.isArray(payload?.items)) {
    return payload.items;
  }

  return [];
}

export function firstValue(source, keys, fallback = undefined) {
  for (const key of keys) {
    if (source?.[key] !== undefined && source?.[key] !== null) {
      return source[key];
    }
  }

  return fallback;
}

export function formatNumber(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return value ?? "0";
  }

  return new Intl.NumberFormat("en", {
    maximumFractionDigits: number > 100 ? 0 : 1,
  }).format(number);
}
