import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import './Perfil.css';
import NavbarE from '../Navbar/NavbarE';

const Perfil = () => {
  const { rol } = useContext(AuthContext);
  const [collapsed, setCollapsed] = useState(false);
  const [datos, setDatos] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actividadesRecientes, setActividadesRecientes] = useState([]);
  const [imagenPerfil, setImagenPerfil] = useState(null);
  const [imagenError, setImagenError] = useState(false);
  const [nivelesPendientes, setNivelesPendientes] = useState([]);
  const [animIndex, setAnimIndex] = useState(0);
  const [mostrandoAnimacion, setMostrandoAnimacion] = useState(false);
  const [confirmandoNivel, setConfirmandoNivel] = useState(false);

  // Escuchar el cambio de colapso
  useEffect(() => {
    const handleNavbarToggle = (e) => {
      if (e.detail?.collapsed !== undefined) {
        setCollapsed(e.detail.collapsed);
      }
    };

    window.addEventListener('navbarToggle', handleNavbarToggle);
    const navbar = document.querySelector('.navbar-container');
    if (navbar) {
      setCollapsed(navbar.classList.contains('collapsed'));
    }

    return () => window.removeEventListener('navbarToggle', handleNavbarToggle);
  }, []);

  // Cargar datos del estudiante
  useEffect(() => {
    if (rol === 'estudiante') {
      const cargarDatosEstudiante = fetch(
        `${import.meta.env.VITE_API_URL}/api/estudiante/InitEstudiante`,
        {
          method: 'GET',
          credentials: 'include',
        }
      );

      const cargarActividades = fetch(
        `${import.meta.env.VITE_API_URL}/api/estudiante/getActividadesAsistidas`,
        {
          method: 'GET',
          credentials: 'include',
        }
      ).catch(() => ({ ok: false, headers: new Headers(), text: () => Promise.resolve('') }));

      Promise.all([cargarDatosEstudiante, cargarActividades])
        .then(async ([resDatos, resActividades]) => {
          // Datos del estudiante
          if (!resDatos.ok) {
            const ct = resDatos.headers.get('content-type') || '';
            if (ct.includes('application/json')) {
              const err = await resDatos.json();
              throw new Error(err?.msg || 'Error al obtener datos');
            } else {
              const txt = await resDatos.text();
              throw new Error(txt || 'Error al obtener datos');
            }
          }
          const ctDatos = resDatos.headers.get('content-type') || '';
          const datosEstudiante = ctDatos.includes('application/json')
            ? await resDatos.json()
            : null;

          // Actividades asistidas
          let actividades = [];
          if (resActividades && resActividades.ok) {
            const ctAct = resActividades.headers.get('content-type') || '';
            if (ctAct.includes('application/json')) {
              try {
                actividades = await resActividades.json();
              } catch (_) {
                actividades = [];
              }
            }
          }

          if (datosEstudiante) {
            setDatos(datosEstudiante);

            const posibleAvatar = [
              datosEstudiante.imagen_perfil,
              datosEstudiante.url_foto,
              datosEstudiante.foto_url,
              datosEstudiante.imagen_persona,
            ].find((src) => typeof src === 'string' && src.trim().length > 0);

            setImagenPerfil(posibleAvatar || null);
            setImagenError(false);
            const pendientes = Array.isArray(datosEstudiante.niveles_pendientes)
              ? datosEstudiante.niveles_pendientes
              : [];

            if (pendientes.length > 0) {
              setNivelesPendientes(pendientes);
              setAnimIndex(0);
              setMostrandoAnimacion(true);
            } else {
              setNivelesPendientes([]);
              setMostrandoAnimacion(false);
            }
          } else {
            throw new Error('Respuesta inválida de datos');
          }

          setActividadesRecientes(Array.isArray(actividades) ? actividades : []);
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setError('No se pudieron cargar tus datos. Intenta más tarde.');
          setLoading(false);
        });
    }
  }, [rol]);

  const handleImageError = () => setImagenError(true);

  const nivelActual = datos?.nivel;
  const progreso = nivelActual?.progreso ?? 0;
  const avatarNivel = nivelActual?.nombre_imagen
    ? `/ImagenNiveles/${nivelActual.nombre_imagen}`
    : '/ImagenNiveles/semilla.png';
  const nivelPendienteActual = nivelesPendientes[animIndex] || null;
  const avatarSrc = useMemo(() => {
    const isAbsoluteUrl = (value) => typeof value === 'string' && /^https?:\/\//i.test(value);
    const apiBase = import.meta.env.VITE_API_URL || '';
    const normalizeBase = apiBase.endsWith('/') ? apiBase.slice(0, -1) : apiBase;

    if (imagenPerfil && !imagenError) {
      if (isAbsoluteUrl(imagenPerfil)) {
        return imagenPerfil;
      }

      if (imagenPerfil.startsWith('/')) {
        return normalizeBase ? `${normalizeBase}${imagenPerfil}` : imagenPerfil;
      }

      const sanitizedPath = imagenPerfil.startsWith('uploads/')
        ? `/${imagenPerfil}`
        : `/uploads/${imagenPerfil}`;

      return normalizeBase ? `${normalizeBase}${sanitizedPath}` : sanitizedPath;
    }
    return avatarNivel;
  }, [imagenPerfil, imagenError, avatarNivel]);

  const confirmarNiveles = useCallback(async () => {
    const ultimo = nivelesPendientes[nivelesPendientes.length - 1];
    if (!ultimo) return;

    try {
      setConfirmandoNivel(true);
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/estudiante/confirmarNivel`,
        {
          method: 'PUT',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id_nivel: ultimo.id_nivel }),
        }
      );

      if (!response.ok) {
        console.error('No se pudo confirmar el nivel');
      }
    } catch (error) {
      console.error('Error confirmando nivel:', error);
    } finally {
      setConfirmandoNivel(false);
      setDatos((prev) =>
        prev
          ? {
              ...prev,
              nivel: nivelesPendientes[nivelesPendientes.length - 1] || prev.nivel,
              niveles_pendientes: [],
            }
          : prev
      );
      setNivelesPendientes([]);
    }
  }, [nivelesPendientes]);

  const avanzarAnimacion = useCallback(() => {
    if (animIndex < nivelesPendientes.length - 1) {
      setAnimIndex((idx) => idx + 1);
    } else {
      setMostrandoAnimacion(false);
      confirmarNiveles();
      setAnimIndex(0);
    }
  }, [animIndex, nivelesPendientes, confirmarNiveles]);

  const renderNavbar = () => {
    if (rol === 'estudiante') return <NavbarE onCollapsedChange={setCollapsed} />;
    return null;
  };

  if (rol !== 'estudiante') return null;

  return (
    <>
      {renderNavbar()}
      {mostrandoAnimacion && nivelPendienteActual && (
        <div className="nivel-overlay">
          <div className="nivel-modal">
            <h2>¡Has alcanzado un nuevo nivel!</h2>
            <p className="nivel-modal-subtitle">{nivelPendienteActual.nombre_nivel}</p>
            <div className="nivel-modal-body">
              <img
                src={
                  nivelPendienteActual.nombre_imagen
                    ? `/ImagenNiveles/${nivelPendienteActual.nombre_imagen}`
                    : '/ImagenNiveles/semilla.png'
                }
                alt={nivelPendienteActual.nombre_nivel}
              />
              <div className="nivel-modal-text">
                <p>
                  Rango: {nivelPendienteActual.rango_inicio} – {nivelPendienteActual.rango_fin}
                </p>
                {nivelPendienteActual.descripcion && (
                  <p>{nivelPendienteActual.descripcion}</p>
                )}
              </div>
            </div>
            <button
              className="nivel-modal-button"
              onClick={avanzarAnimacion}
              disabled={confirmandoNivel}
            >
              {animIndex < nivelesPendientes.length - 1
                ? 'Siguiente nivel'
                : confirmandoNivel
                  ? 'Confirmando...'
                  : 'Entendido'}
            </button>
          </div>
        </div>
      )}
      <div className={`perfil-container ${collapsed ? 'navbar-collapsed' : ''}`}>
        <div className="perfil-content">
          {loading ? (
            <div className="perfil-loading">
              <img src="/Wiñay.png" alt="Wiñay XP Logo" className="perfil-logo" />
              <div className="perfil-spinner"></div>
              <p>Cargando tu perfil...</p>
            </div>
          ) : error ? (
            <div className="perfil-error-container">
              <img src="/Wiñay.png" alt="Wiñay XP Logo" className="perfil-logo error-logo" />
              <div className="perfil-error">{error}</div>
            </div>
          ) : (
            <>
              <div className="perfil-header-logo">
                <img src="/Wiñay.png" alt="Wiñay XP Logo" className="perfil-logo" />
                <h1 className="perfil-title">Panel de Estudiante</h1>
              </div>

              <div className="perfil-grid">
                <div className="perfil-card perfil-info-card">
                  <div className="perfil-header">
                    <div className="perfil-avatar-container">
                      <img
                        src={avatarSrc}
                        alt="Avatar"
                        className="perfil-avatar"
                        onError={handleImageError}
                      />
                      <div className="perfil-nivel-badge">
                        {nivelActual?.nombre_nivel || 'Sin nivel'}
                      </div>
                    </div>
                    <div className="perfil-info-principal">
                      <h1 className="perfil-nombre">
                        {datos.nombre_persona} {datos.apellido}
                      </h1>
                      <p className="perfil-carrera">{datos.nombre_carrera}</p>
                      <div className="perfil-nivel-info">
                        <span className="nivel-actual">
                          {nivelActual?.nombre_nivel || 'Sin nivel'}
                        </span>
                        <div className="barra-nivel-container">
                          <div className="nivel-barra">
                            <div
                              className="nivel-progreso"
                              style={{
                                width: `${progreso}%`,
                              }}
                            ></div>
                          </div>
                          <div className="nivel-porcentaje">
                            {progreso}%
                          </div>
                        </div>
                        <p className="nivel-actual">
                          Nivel actual: {nivelActual?.id_nivel ?? '—'}
                        </p>
                        <p className="nivel-descripcion">
                          {nivelActual?.descripcion || ''}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="perfil-datos">
                    <div className="datos-columna">
                      <p>
                        <span className="datos-etiqueta">Semestre:</span> {datos.semestre}
                      </p>
                      <p>
                        <span className="datos-etiqueta">DNI:</span> {datos.dni}
                      </p>
                    </div>
                    <div className="datos-columna">
                      <p>
                        <span className="datos-etiqueta">Email:</span> {datos.email}
                      </p>
                      <p>
                        <span className="datos-etiqueta">Estado:</span>{' '}
                        <span className="estado-activo">{datos.rol}</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Estadísticas */}
                <div className="estadisticas-container">
                  {[
                    {
                      titulo: 'Puntos',
                      valor: datos.credito_total || 0,
                      icono: '⭐',
                      color: 'rgba(246, 199, 67, 0.25)',
                    },
                    {
                      titulo: 'Puntos Disponibles',
                      valor: datos.cobro_credito || 0,
                      icono: '💰',
                      color: 'rgba(16, 185, 129, 0.25)',
                    },
                  ].map((stat, i) => (
                    <div className="estadistica-card" key={i}>
                      <div className="estadistica-icono" style={{ backgroundColor: stat.color }}>
                        {stat.icono}
                      </div>
                      <div className="estadistica-info">
                        <h3>{stat.titulo}</h3>
                        <p className="estadistica-valor">{stat.valor}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Actividades */}
                <div className="perfil-card actividades-card">
                  <h2 className="seccion-titulo">Actividades en las que participaste</h2>
                  {actividadesRecientes.length > 0 ? (
                    <div className="actividades-lista">
                      <table className="perfil-actividades-table">
                        <thead>
                          <tr>
                            <th>Nombre</th>
                            <th>Fecha</th>
                            <th>Puntos</th>
                          </tr>
                        </thead>
                        <tbody>
                          {actividadesRecientes.slice(0, 4).map((a, i) => (
                            <tr key={i} className="perfil-actividad-item">
                              <td>{a.nombre_actividad || 'Sin nombre'}</td>
                              <td>
                                {a.fecha_asistencia
                                  ? new Date(a.fecha_asistencia).toLocaleString('es-PE')
                                  : '—'}
                              </td>
                              <td>
                                {a.creditos && (
                                  <span className="actividad-puntos">+{a.creditos}</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="no-actividades">
                      <p>No has participado en actividades recientemente</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Perfil;
