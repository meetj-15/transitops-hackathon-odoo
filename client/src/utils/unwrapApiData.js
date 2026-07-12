export function unwrapApiData(response, fallback = []) {
  return response?.data?.data ?? response?.data ?? fallback;
}

export function unwrapApiList(response, fallback = []) {
  const value = unwrapApiData(response, fallback);

  if (Array.isArray(value)) {
    return value;
  }

  if (!value || typeof value !== "object") {
    return fallback;
  }

  const firstList = Object.values(value).find(Array.isArray);

  return firstList ?? fallback;
}
