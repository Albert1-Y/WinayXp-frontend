import { useEffect, useState } from 'react';
import { fetchHistorialMovimientos } from '../utils/historialApi';

const useHistorialSection = (dni, tipo_movimiento, batchSize = 10) => {
  const [limit, setLimit] = useState(batchSize);
  const [data, setData] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setLimit(batchSize);
    setData([]);
    setCount(0);
    setError('');
  }, [dni, tipo_movimiento, batchSize]);

  useEffect(() => {
    if (!dni) {
      setData([]);
      setCount(0);
      setLoading(false);
      setError('');
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    setError('');

    fetchHistorialMovimientos({ dni, tipo_movimiento, limit }, { signal: controller.signal })
      .then((payload) => {
        setData(Array.isArray(payload?.data) ? payload.data : []);
        setCount(payload?.count ?? 0);
      })
      .catch((err) => {
        if (err.name === 'AbortError') return;
        console.error('Error al cargar historial:', err);
        setError('No se pudo cargar esta sección.');
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [dni, tipo_movimiento, limit]);

  const canLoadMore = count > data.length;
  const loadMore = () => setLimit((prev) => prev + batchSize);

  return { data, count, loading, error, canLoadMore, loadMore };
};

export default useHistorialSection;
