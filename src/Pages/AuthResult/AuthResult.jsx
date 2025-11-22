import { useEffect, useContext, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

export default function AuthResult() {
  const navigate = useNavigate();
  const { setRol } = useContext(AuthContext);
  const { search } = useLocation();
  const [msg, setMsg] = useState('Procesando autenticación...');

  const params = useMemo(() => new URLSearchParams(search), [search]);
  const status = params.get('status');
  const rol = params.get('rol');
  const err = params.get('msg');

  useEffect(() => {
    console.log('[AuthResult] status=', status, 'rol=', rol, 'err=', err);
    if (status === 'success' && rol) {
      setRol(rol);
      setMsg(`Autenticado como ${rol}. Redirigiendo...`);
      // Da un tick al render para evitar parpadeos en algunos routers
      setTimeout(() => navigate('/dashboard', { replace: true }), 100);
    } else if (status === 'error') {
      setMsg(err || 'Acceso denegado');
      setTimeout(() => navigate('/', { replace: true }), 1000);
    } else {
      setMsg('Respuesta inválida. Volviendo al inicio...');
      setTimeout(() => navigate('/', { replace: true }), 1000);
    }
  }, [status, rol, err, setRol, navigate]);

  return (
    <div style={{ padding: 24 }}>
      <h3>{msg}</h3>
      <p>Si no cambia de página, revisa la consola del navegador para más detalles.</p>
    </div>
  );
}
