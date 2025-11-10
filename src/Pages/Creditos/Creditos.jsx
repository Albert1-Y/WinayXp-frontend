import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '../Navbar/Navbar';
import NavbarE from '../Navbar/NavbarE';
import NavbarT from '../Navbar/NavbarT';
import Button from '../../components/button/Button';
import TextField from '../../components/TextField/TextField';
import { AuthContext } from '../../context/AuthContext';
import './Creditos.css';
import { fetchHistorialMovimientos } from '../../utils/historialApi';

const DEFAULT_FILTERS = {
  id_estudiante: '',
  dni: '',
  tipo_movimiento: '',
  fecha_inicio: '',
  fecha_fin: '',
  limit: 20,
  offset: 0,
};

const clampLimit = (value) => {
  const num = Number(value);
  if (!Number.isFinite(num) || num <= 0) return DEFAULT_FILTERS.limit;
  return Math.min(200, Math.max(1, Math.floor(num)));
};

const parseFiltersFromParams = (params) => ({
  id_estudiante: params.get('id_estudiante') || DEFAULT_FILTERS.id_estudiante,
  dni: params.get('dni') || DEFAULT_FILTERS.dni,
  tipo_movimiento: params.get('tipo_movimiento') || DEFAULT_FILTERS.tipo_movimiento,
  fecha_inicio: params.get('fecha_inicio') || DEFAULT_FILTERS.fecha_inicio,
  fecha_fin: params.get('fecha_fin') || DEFAULT_FILTERS.fecha_fin,
  limit: clampLimit(params.get('limit') ?? DEFAULT_FILTERS.limit),
  offset: Math.max(0, Number(params.get('offset')) || DEFAULT_FILTERS.offset),
});

const buildSearchParamsObject = (filters, extras = {}) => {
  const entries = {};
  Object.entries(filters).forEach(([key, value]) => {
    if (value === '' || value === null || value === undefined) return;
    entries[key] = value;
  });
  Object.entries(extras).forEach(([key, value]) => {
    if (value === '' || value === null || value === undefined) return;
    entries[key] = value;
  });
  return entries;
};

const Creditos = () => {
  const { rol } = useContext(AuthContext);
  const navigate = useNavigate();
  const [navbarCollapsed, setNavbarCollapsed] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const movimientoObjetivo = searchParams.get('movimiento') || null;

  const [appliedFilters, setAppliedFilters] = useState(() =>
    parseFiltersFromParams(searchParams)
  );
  const [formFilters, setFormFilters] = useState(() =>
    parseFiltersFromParams(searchParams)
  );

  const [historial, setHistorial] = useState([]);
  const [historialCount, setHistorialCount] = useState(0);
  const [historialLoading, setHistorialLoading] = useState(false);
  const [historialError, setHistorialError] = useState('');
  const [reloadHistorialKey, setReloadHistorialKey] = useState(0);

  const [students, setStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(false);

  const [downloadLoading, setDownloadLoading] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importLoading, setImportLoading] = useState(false);
  const [importResumen, setImportResumen] = useState(null);
  const [importErrores, setImportErrores] = useState([]);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const next = parseFiltersFromParams(searchParams);
    setAppliedFilters(next);
    setFormFilters(next);
  }, [searchParams]);

  useEffect(() => {
    const handleNavbarChange = () => {
      const collapsedNavbar = document.querySelector('.navbar-container.collapsed');
      setNavbarCollapsed(!!collapsedNavbar);
    };

    const observer = new MutationObserver(handleNavbarChange);
    observer.observe(document.body, {
      subtree: true,
      attributes: true,
      attributeFilter: ['class'],
    });

    handleNavbarChange();
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    setStudentsLoading(true);
    fetch(`${import.meta.env.VITE_API_URL}/api/admin/IntMostrarEstudiantes`, {
      method: 'GET',
      credentials: 'include',
      signal: controller.signal,
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const opciones = data.map((est) => ({
            value: est.id_persona,
            label: `${est.nombre_persona} ${est.apellido} - ${est.dni}`,
            dni: est.dni?.toString() ?? '',
          }));
          setStudents(opciones);
        } else {
          setStudents([]);
        }
      })
      .catch((error) => {
        if (error.name === 'AbortError') return;
        console.error('Error al cargar estudiantes:', error);
      })
      .finally(() => setStudentsLoading(false));

    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const cargarHistorial = async () => {
      setHistorialLoading(true);
      setHistorialError('');
      try {
        const payload = await fetchHistorialMovimientos(appliedFilters, {
          signal: controller.signal,
        });
        setHistorial(Array.isArray(payload?.data) ? payload.data : []);
        setHistorialCount(payload?.count ?? 0);
      } catch (error) {
        if (error.name === 'AbortError') return;
        console.error('Error al obtener historial:', error);
        setHistorialError('No se pudo cargar el historial de movimientos.');
      } finally {
        setHistorialLoading(false);
      }
    };

    cargarHistorial();
    return () => controller.abort();
  }, [appliedFilters, reloadHistorialKey]);

  const renderNavbar = () => {
    switch (rol) {
      case 'administrador':
        return <Navbar />;
      case 'tutor':
        return <NavbarT />;
      case 'estudiante':
        return <NavbarE />;
      default:
        navigate('/');
        return null;
    }
  };

  const handleFilterChange = (field, value) => {
    setFormFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleStudentSearchChange = (value) => {
    handleFilterChange('dni', value.trim());
  };

  const handleApplyFilters = () => {
    const normalized = {
      id_estudiante: formFilters.id_estudiante || '',
      dni: formFilters.dni || '',
      tipo_movimiento: formFilters.tipo_movimiento || '',
      fecha_inicio: formFilters.fecha_inicio || '',
      fecha_fin: formFilters.fecha_fin || '',
      limit: clampLimit(formFilters.limit),
      offset: 0,
    };
    const extras = movimientoObjetivo ? { movimiento: movimientoObjetivo } : {};
    setSearchParams(buildSearchParamsObject(normalized, extras));
  };

  const handleResetFilters = () => {
    setFormFilters({ ...DEFAULT_FILTERS });
    setSearchParams({});
    setReloadHistorialKey((prev) => prev + 1);
  };

  const handlePageChange = (direction) => {
    const nextOffset =
      direction === 'next'
        ? appliedFilters.offset + appliedFilters.limit
        : Math.max(0, appliedFilters.offset - appliedFilters.limit);
    const normalized = {
      ...appliedFilters,
      offset: nextOffset,
    };
    const extras = movimientoObjetivo ? { movimiento: movimientoObjetivo } : {};
    setSearchParams(buildSearchParamsObject(normalized, extras));
  };

  const registrosVisibles = useMemo(() => {
    if (historialCount === 0) {
      return { desde: 0, hasta: 0 };
    }
    const desde = appliedFilters.offset + 1;
    const hasta = Math.min(appliedFilters.offset + appliedFilters.limit, historialCount);
    return { desde, hasta };
  }, [appliedFilters.offset, appliedFilters.limit, historialCount]);

  const formatFecha = (value) => {
    if (!value) return '-';
    const fecha = new Date(value);
    if (Number.isNaN(fecha.getTime())) return value;
    return fecha.toLocaleString('es-PE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleDownloadPlantilla = async () => {
    setDownloadLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin/descargar-plantilla-historicos`,
        {
          method: 'GET',
          credentials: 'include',
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'plantilla_carga_historica.xlsx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error al descargar plantilla:', error);
      alert('No se pudo descargar la plantilla. Intenta nuevamente.');
    } finally {
      setDownloadLoading(false);
    }
  };

  const limpiarImportacion = () => {
    setImportResumen(null);
    setImportErrores([]);
    setImportFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleImportarHistoricos = async (event) => {
    event.preventDefault();
    if (!importFile) {
      alert('Selecciona un archivo .xlsx para continuar.');
      return;
    }

    const formData = new FormData();
    formData.append('file', importFile);

    setImportLoading(true);
    setImportResumen(null);
    setImportErrores([]);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/importar-historicos`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      const payload = await response.json();

      if (!response.ok || !payload.ok) {
        throw new Error(payload?.msg || 'Error en la importación.');
      }

      setImportResumen({
        procesados: payload.procesados,
        actividades_creadas: payload.actividades_creadas,
        movimientos_registrados: payload.movimientos_registrados,
        msg: payload.msg,
      });
      setImportErrores(payload.errores || []);
      setReloadHistorialKey((prev) => prev + 1);
    } catch (error) {
      console.error('Error al importar históricos:', error);
      alert(error.message || 'No se pudo importar el archivo.');
    } finally {
      setImportLoading(false);
    }
  };

  const handleClearMovimiento = () => {
    const paramsObj = buildSearchParamsObject(appliedFilters);
    setSearchParams(paramsObj);
  };

  const highlightedMovimiento = movimientoObjetivo
    ? movimientoObjetivo.toString().trim()
    : null;

  return (
    <div className={`creditos-container ${navbarCollapsed ? 'navbar-collapsed' : ''}`}>
      {renderNavbar()}
      <div className="creditos-content">
        <div className="creditos-header">
          <div>
            <h1>Créditos y Movimientos</h1>
            <p>Consulta, descarga e importa el historial completo de puntos.</p>
          </div>
          <div className="creditos-header-actions">
            <Button
              text={downloadLoading ? 'Descargando...' : 'Descargar plantilla histórica'}
              styleType="white"
              onClick={handleDownloadPlantilla}
              disabled={downloadLoading}
            />
          </div>
        </div>

        <div className="creditos-panel">
          <h2>Filtros</h2>
          <div className="creditos-filters">
            <div className="filter-field">
              <label htmlFor="buscador-estudiante">Estudiante (DNI)</label>
              <TextField
                id="buscador-estudiante"
                list="estudiantes-datalist"
                placeholder="Escribe el DNI para filtrar"
                value={formFilters.dni}
                onChange={(e) => handleStudentSearchChange(e.target.value)}
                disabled={studentsLoading}
              />
              <datalist id="estudiantes-datalist">
                {students.map((option) => (
                  <option key={option.value} value={option.dni || option.label}>
                    {option.label}
                  </option>
                ))}
              </datalist>
            </div>
            <div className="filter-field">
              <label>Tipo</label>
              <select
                value={formFilters.tipo_movimiento}
                onChange={(e) => handleFilterChange('tipo_movimiento', e.target.value)}
              >
                <option value="">Todos</option>
                <option value="asistencia">Asistencia</option>
                <option value="bonus">Bono</option>
                <option value="cobro">Cobro</option>
                <option value="ajuste">Ajuste</option>
              </select>
            </div>
            <div className="filter-field">
              <label>Fecha inicio</label>
              <TextField
                type="date"
                value={formFilters.fecha_inicio}
                onChange={(e) => handleFilterChange('fecha_inicio', e.target.value)}
              />
            </div>
            <div className="filter-field">
              <label>Fecha fin</label>
              <TextField
                type="date"
                value={formFilters.fecha_fin}
                onChange={(e) => handleFilterChange('fecha_fin', e.target.value)}
              />
            </div>
            <div className="filter-field">
              <label>Registros por página</label>
              <select
                value={formFilters.limit}
                onChange={(e) => handleFilterChange('limit', clampLimit(e.target.value))}
              >
                {[20, 50, 100, 200].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="filter-actions">
            <Button text="Aplicar filtros" styleType="black" onClick={handleApplyFilters} />
            <Button text="Limpiar" styleType="danger" onClick={handleResetFilters} />
            {highlightedMovimiento && (
              <Button text="Limpiar movimiento" styleType="white" onClick={handleClearMovimiento} />
            )}
          </div>
          {highlightedMovimiento && (
            <div className="movement-hint">
              Resaltando el movimiento #{highlightedMovimiento}. Cambia los filtros o usa
              &quot;Limpiar movimiento&quot; para quitar el foco.
            </div>
          )}
        </div>

        <div className="creditos-panel">
          <div className="panel-header">
            <div>
              <h2>Historial de Movimientos</h2>
              <p>
                Mostrando {registrosVisibles.desde} - {registrosVisibles.hasta} de {historialCount}{' '}
                movimientos
              </p>
            </div>
            <Button text="Refrescar" styleType="white" onClick={() => setReloadHistorialKey((prev) => prev + 1)} />
          </div>
          {historialError && <div className="error-banner">{historialError}</div>}
          <div className="historial-table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Estudiante</th>
                  <th>Tipo</th>
                  <th>Créditos</th>
                  <th>Motivo</th>
                  <th>Autor</th>
                  <th>Actividad</th>
                </tr>
              </thead>
              <tbody>
                {historialLoading && (
                  <tr>
                    <td colSpan="7" className="loading-row">
                      Cargando movimientos...
                    </td>
                  </tr>
                )}
                {!historialLoading && historial.length === 0 && (
                  <tr>
                    <td colSpan="7" className="empty-row">
                      No se encontraron movimientos con los filtros aplicados.
                    </td>
                  </tr>
                )}
                {!historialLoading &&
                  historial.map((mov) => {
                    const esDestacado =
                      highlightedMovimiento &&
                      mov.id_movimiento?.toString() === highlightedMovimiento;

                    const creditos = Number(mov.creditos ?? 0);
                    const nombreCompleto =
                      mov.estudiante?.nombre
                        ? `${mov.estudiante?.nombre} ${mov.estudiante?.apellido ?? ''}`.trim()
                        : mov.estudiante ||
                          mov.nombre_estudiante ||
                          `${mov.nombre_persona ?? ''} ${mov.apellido ?? ''}`.trim() ||
                          '-';
                    const dni = mov.estudiante?.dni ?? mov.dni_estudiante ?? mov.dni ?? 'N/A';

                    return (
                      <tr key={mov.id_movimiento ?? `${mov.created_at}-${dni}`} className={esDestacado ? 'highlight-row' : ''}>
                        <td>{formatFecha(mov.created_at)}</td>
                        <td>
                          <div className="estudiante-col">
                            <span className="nombre">{nombreCompleto}</span>
                            <small>DNI: {dni}</small>
                          </div>
                        </td>
                        <td>
                          <span className={`tipo-badge tipo-${mov.tipo_movimiento || 'otro'}`}>
                            {mov.tipo_movimiento || '-'}
                          </span>
                        </td>
                        <td>
                          <span className={`creditos ${creditos >= 0 ? 'positivo' : 'negativo'}`}>
                            {creditos > 0 ? `+${creditos}` : creditos}
                          </span>
                        </td>
                        <td>{mov.motivo || '-'}</td>
                        <td>
                          <div className="autor-col">
                            <span>{mov.autor || '-'}</span>
                            <small>{mov.rol_autor || ''}</small>
                          </div>
                        </td>
                        <td>{mov.nombre_actividad || '-'}</td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
          <div className="pagination-controls">
            <Button
              text="Anterior"
              styleType="white"
              onClick={() => handlePageChange('prev')}
              disabled={appliedFilters.offset === 0 || historialLoading}
            />
            <Button
              text="Siguiente"
              styleType="white"
              onClick={() => handlePageChange('next')}
              disabled={
                historialLoading ||
                appliedFilters.offset + appliedFilters.limit >= historialCount
              }
            />
          </div>
        </div>

        <div className="creditos-grid">
          <div className="creditos-panel">
            <h2>Descarga de plantilla</h2>
            <p>Obtén el formato oficial para cargar actividades y asistencias históricas.</p>
            <Button
              text={downloadLoading ? 'Descargando...' : 'Descargar plantilla'}
              styleType="black"
              onClick={handleDownloadPlantilla}
              disabled={downloadLoading}
            />
          </div>

          <div className="creditos-panel">
            <h2>Importar históricos</h2>
            <form onSubmit={handleImportarHistoricos} className="import-form">
              <input
                type="file"
                accept=".xlsx"
                ref={fileInputRef}
                onChange={(e) => setImportFile(e.target.files?.[0] || null)}
              />
              <div className="import-actions">
                <Button
                  text={importLoading ? 'Importando...' : 'Importar históricos'}
                  styleType="black"
                  disabled={importLoading}
                  type="submit"
                />
                <Button text="Limpiar estado" styleType="white" onClick={limpiarImportacion} />
              </div>
            </form>
            {importResumen && (
              <div className="import-resumen">
                <p>{importResumen.msg}</p>
                <ul>
                  <li>Filas procesadas: {importResumen.procesados}</li>
                  <li>Actividades creadas: {importResumen.actividades_creadas}</li>
                  <li>Movimientos registrados: {importResumen.movimientos_registrados}</li>
                </ul>
              </div>
            )}
            {importErrores.length > 0 && (
              <div className="import-errores">
                <h3>Filas con error</h3>
                <table>
                  <thead>
                    <tr>
                      <th>Fila</th>
                      <th>Error</th>
                    </tr>
                  </thead>
                  <tbody>
                    {importErrores.map((err, idx) => (
                      <tr key={`${err.fila}-${idx}`}>
                        <td>{err.fila}</td>
                        <td>{err.error}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Creditos;
