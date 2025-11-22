import React, { useEffect, useState, useContext } from 'react';
import NavbarE from '../Navbar/NavbarE';
import './Niveles.css';
import { AuthContext } from '../../context/AuthContext';

const estadoNivel = (nivelId, nivelActualId) => {
  if (!nivelActualId) return 'pendiente';
  if (nivelId < nivelActualId) return 'completado';
  if (nivelId === nivelActualId) return 'actual';
  return 'pendiente';
};

const Niveles = () => {
  const { rol } = useContext(AuthContext);
  const [niveles, setNiveles] = useState([]);
  const [nivelActual, setNivelActual] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();

    const cargarNiveles = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/estudiante/niveles`, {
          method: 'GET',
          credentials: 'include',
          signal: controller.signal,
        });

        if (!response.ok) {
          const text = await response.text();
          throw new Error(text || `HTTP ${response.status}`);
        }

        const payload = await response.json();
        setNiveles(Array.isArray(payload?.niveles) ? payload.niveles : []);
        setNivelActual(payload?.nivel_actual || null);
      } catch (err) {
        if (err.name === 'AbortError') return;
        console.error('Error al cargar niveles:', err);
        setError('No se pudieron cargar tus niveles. Intenta nuevamente.');
      } finally {
        setLoading(false);
      }
    };

    cargarNiveles();
    return () => controller.abort();
  }, []);

  return (
    <div className="niveles-page">
      {rol === 'estudiante' && <NavbarE />}
      <div className="niveles-content">
        <header className="niveles-header">
          <div>
            <p className="niveles-breadcrumb">Inicio / Niveles</p>
            <h1>Tu progreso en Wiñay XP</h1>
            <p className="niveles-subtitle">
              Revisa los niveles completados, tu estado actual y lo que viene a continuación.
            </p>
          </div>
        </header>

        {loading ? (
          <div className="niveles-state-card">Cargando niveles...</div>
        ) : error ? (
          <div className="niveles-state-card error">{error}</div>
        ) : (
          <div className="niveles-grid">
            {niveles.map((nivel) => {
              const estado = estadoNivel(nivel.id_nivel, nivelActual?.id_nivel);
              return (
                <article key={nivel.id_nivel} className={`nivel-card ${estado}`}>
                  <div className="nivel-card-header">
                    <div className="nivel-icon">
                      <img
                        src={`/ImagenNiveles/${nivel.nombre_imagen || 'semilla.png'}`}
                        alt={nivel.nombre_nivel}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = '/ImagenNiveles/semilla.png';
                        }}
                      />
                    </div>
                    <div>
                      <p className="nivel-id">Nivel {nivel.id_nivel}</p>
                      <h3>{nivel.nombre_nivel}</h3>
                    </div>
                    <span className={`nivel-status-badge ${estado}`}>
                      {estado === 'completado' && 'Completado'}
                      {estado === 'actual' && 'Nivel actual'}
                      {estado === 'pendiente' && 'Pendiente'}
                    </span>
                  </div>

                  <p className="nivel-descripcion">{nivel.descripcion || 'Sin descripción.'}</p>

                  <div className="nivel-range">
                    <div className="nivel-range-bar">
                      <div
                        className="nivel-range-fill"
                        style={{
                          width:
                            estado === 'completado'
                              ? '100%'
                              : estado === 'pendiente'
                                ? '0%'
                                : `${nivelActual?.progreso ?? 0}%`,
                        }}
                      ></div>
                    </div>
                    <div className="nivel-range-info">
                      <span>{nivel.rango_inicio} pts</span>
                      <span>{nivel.rango_fin} pts</span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Niveles;
