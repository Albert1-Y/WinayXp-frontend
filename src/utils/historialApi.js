const buildQueryParams = (filters = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    const stringValue = typeof value === 'string' ? value.trim() : value;
    if (stringValue === '' || Number.isNaN(stringValue)) return;
    params.append(key, stringValue);
  });
  return params.toString();
};

export const fetchHistorialMovimientos = async (filters = {}, options = {}) => {
  const query = buildQueryParams(filters);
  const url = `${import.meta.env.VITE_API_URL}/api/admin/HistorialMovimientos${
    query ? `?${query}` : ''
  }`;

  const response = await fetch(url, {
    method: 'GET',
    credentials: 'include',
    signal: options.signal,
  });

  if (!response.ok) {
    const text = await response.text();
    const message = text || `HTTP ${response.status}`;
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  return response.json();
};
