import React, { useState, useEffect, useContext } from 'react';
import Navbar from '../Navbar/Navbar';
import NavbarE from '../Navbar/NavbarE';
import NavbarT from '../Navbar/NavbarT';
import Button from '../../components/button/Button';
import TextField from '../../components/TextField/TextField';
import { useNavigate } from 'react-router-dom';
import './Actividad.css';
import { AuthContext } from '../../context/AuthContext.jsx';

const Actividades = () => {
  const navigate = useNavigate();
  const [editingActividad, setEditingActividad] = useState(null); // Para almacenar la actividad seleccionada
  const [showEditForm, setShowEditForm] = useState(false); // Mostrar el formulario de edición
  const { rol } = useContext(AuthContext);
  const [navbarCollapsed, setNavbarCollapsed] = useState(false);
  const [showBonusForm, setShowBonusForm] = useState(false);
  const [bonusActividad, setBonusActividad] = useState(null);
  const [studentsOptions, setStudentsOptions] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [bonusForm, setBonusForm] = useState({
    id_persona: '',
    puntos: 1,
    motivo: '',
  });
  const [bonusLoading, setBonusLoading] = useState(false);
  const [bonusFeedback, setBonusFeedback] = useState({
    error: '',
    success: '',
  });
  const [bonusMovimientoId, setBonusMovimientoId] = useState(null);
  const [bonusStudentSearch, setBonusStudentSearch] = useState('');
  const filteredStudents = studentsOptions.filter((option) => {
    if (!bonusStudentSearch.trim()) return true;
    const term = bonusStudentSearch.toLowerCase();
    return option.label.toLowerCase().includes(term) || option.dni?.toLowerCase().includes(term);
  });

  // Redirección basada en rol sólo en efectos (no durante render)
  useEffect(() => {
    if (!rol) {
      alert('Tu sesión ha expirado');
      localStorage.clear();
      navigate('/', { replace: true });
    }
  }, [rol, navigate]);

  // Efecto para detectar el estado del navbar colapsado
  useEffect(() => {
    const handleNavbarChange = () => {
      // Verificamos si existe un elemento con la clase .navbar-container.collapsed
      const collapsedNavbar = document.querySelector('.navbar-container.collapsed');
      setNavbarCollapsed(!!collapsedNavbar);
    };

    // Observamos cambios en el DOM para detectar cuando el navbar cambia
    const observer = new MutationObserver(handleNavbarChange);
    observer.observe(document.body, {
      subtree: true,
      attributes: true,
      attributeFilter: ['class'],
    });

    // Verificación inicial
    handleNavbarChange();

    return () => {
      observer.disconnect();
    };
  }, []);

  const renderNavbar = () => {
    switch (rol) {
      case 'administrador':
        return <Navbar />;
      case 'estudiante':
        return <NavbarE />;
      case 'tutor':
        return <NavbarT />;
      default:
        return null;
    }
  };
  const handleBonusClick = (actividad) => {
    setBonusActividad(actividad);
    setShowBonusForm(true);
    setBonusForm({ id_persona: '', puntos: 1, motivo: '' });
    setBonusFeedback({ error: '', success: '' });
    setBonusMovimientoId(null);
    setBonusStudentSearch('');
  };

  const closeBonusForm = () => {
    setShowBonusForm(false);
    setBonusActividad(null);
    setBonusForm({ id_persona: '', puntos: 1, motivo: '' });
    setBonusFeedback({ error: '', success: '' });
    setBonusMovimientoId(null);
    setBonusStudentSearch('');
  };
  const handleEditClick = (actividad) => {
    // Guardar una copia completa de la actividad para editar
    setEditingActividad({ ...actividad });
    setShowEditForm(true);
  };

  const handleTakeAttendance = (actividad) => {
    navigate('/tomar-asistencia', { state: { actividad } });
  };

  const handleSaveActividad = () => {
    // Aseguramos que todos los datos necesarios estén presentes
    const actividadActualizada = {
      ...editingActividad,
      // Convertimos creditos a número si es necesario
      creditos: Number(editingActividad.creditos),
    };

    console.log('Enviando datos para actualizar:', actividadActualizada);

    fetch(`${import.meta.env.VITE_API_URL}/api/admin/ActualizarActividad`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(actividadActualizada),
    })
      .then(async (response) => {
        if (!response.ok) {
          // Leer el texto de la respuesta para mejor diagnóstico
          const errorText = await response.text();
          console.error('Error respuesta del servidor:', errorText);
          throw new Error(`Error al actualizar: ${response.status} ${errorText}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log('Respuesta exitosa:', data);
        alert('Actividad actualizada exitosamente.');
        // Refrescar los datos o actualizarlos localmente
        setData((prev) =>
          prev.map((a) =>
            a.id_actividad === actividadActualizada.id_actividad ? actividadActualizada : a
          )
        );
        setShowEditForm(false);
      })
      .catch((error) => {
        console.error('Error al actualizar actividad:', error);
        alert('Hubo un problema al actualizar. Revisa la consola para más detalles.');
      });
  };

  const columns = [
    'ID',
    'Nombre Actividad',
    'Lugar',
    'Puntos CEDHI',
    'Periodo',
    'Nombre Persona',
    'Apellido',
    'Acciones',
  ];
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [data, setData] = useState([]);

  useEffect(() => {
    const controller = new AbortController();
    fetch(
      `${import.meta.env.VITE_API_URL}/api/admin/MostrarActividad?fecha_inicio=2025-01-01&fecha_fin=2025-12-31`,
      {
        method: 'GET',
        credentials: 'include', // Incluye las cookies en la solicitud
        signal: controller.signal,
      }
    )
      .then(async (response) => {
        if (!response.ok) {
          const text = await response.text();
          throw new Error(`HTTP ${response.status}: ${text}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log('Datos iniciales:', data);
        setData(Array.isArray(data) ? data : []);
      })
      .catch((error) => {
        console.error('Error al obtener actividades:', error);
      });
    return () => controller.abort();
  }, []);
  useEffect(() => {
    if (rol !== 'administrador' && rol !== 'tutor') return;
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
          const mapped = data.map((est) => ({
            value: est.id_persona,
            label: `${est.nombre_persona ?? ''} ${est.apellido ?? ''}`.trim(),
            dni: est.dni?.toString() ?? '',
          }));
          setStudentsOptions(mapped);
        }
      })
      .catch((error) => {
        if (error.name === 'AbortError') return;
        console.error('Error al obtener estudiantes para bonus:', error);
      })
      .finally(() => setStudentsLoading(false));

    return () => controller.abort();
  }, [rol]);

  const handleBonusSubmit = async (event) => {
    event.preventDefault();
    setBonusFeedback({ error: '', success: '' });
    setBonusMovimientoId(null);

    if (!bonusActividad) {
      setBonusFeedback({
        error: 'Selecciona una actividad válida.',
        success: '',
      });
      return;
    }

    if (!bonusForm.id_persona) {
      setBonusFeedback({ error: 'Debes elegir un estudiante.', success: '' });
      return;
    }

    const puntos = Number(bonusForm.puntos);
    if (!Number.isFinite(puntos) || puntos <= 0) {
      setBonusFeedback({
        error: 'Ingresa un número de puntos mayor a 0.',
        success: '',
      });
      return;
    }

    const motivo = bonusForm.motivo.trim();
    if (motivo.length < 5) {
      setBonusFeedback({
        error: 'El motivo debe tener al menos 5 caracteres.',
        success: '',
      });
      return;
    }

    const payload = {
      id_persona: Number(bonusForm.id_persona),
      puntos,
      motivo,
      id_actividad: bonusActividad.id_actividad,
    };

    setBonusLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/BonificarPuntos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const text = await response.text();
      let data = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch (error) {
        console.warn('Respuesta no JSON en BonificarPuntos:', error);
      }

      if (response.status === 200 || data?.ok) {
        setBonusFeedback({
          error: '',
          success: data?.msg || 'Bonificación registrada correctamente.',
        });
        setBonusMovimientoId(data?.movimiento ?? null);
        setBonusForm((prev) => ({
          ...prev,
          puntos: 1,
          motivo: '',
        }));
        return;
      }

      if (response.status === 400) {
        setBonusFeedback({
          error: data?.msg || 'Revisa los datos enviados.',
          success: '',
        });
        return;
      }

      if (response.status === 403) {
        setBonusFeedback({
          error: 'No tienes permisos para otorgar bonificaciones.',
          success: '',
        });
        return;
      }

      if (response.status === 404) {
        setBonusFeedback({
          error: 'El estudiante o la actividad no existe.',
          success: '',
        });
        return;
      }

      setBonusFeedback({
        error: data?.msg || 'No se pudo registrar la bonificación.',
        success: '',
      });
    } catch (error) {
      console.error('Error al bonificar puntos:', error);
      setBonusFeedback({
        error: 'Ocurrió un error inesperado al bonificar.',
        success: '',
      });
    } finally {
      setBonusLoading(false);
    }
  };

  const verHistorialBonos = () => {
    if (!bonusForm.id_persona) return;
    const params = new URLSearchParams({
      id_estudiante: bonusForm.id_persona,
    });
    if (bonusMovimientoId) {
      params.set('movimiento', bonusMovimientoId);
    }
    navigate(`/creditos?${params.toString()}`);
  };
  const handleSearch = () => {
    if (!fechaInicio || !fechaFin) {
      alert('Debes ingresar ambas fechas para buscar actividades.');
      return;
    }
    console.log(`Buscar actividades entre ${fechaInicio} y ${fechaFin}`);
    fetch(
      `${import.meta.env.VITE_API_URL}/api/admin/MostrarActividad?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`,
      {
        method: 'GET',
        credentials: 'include',
      }
    )
      .then(async (response) => {
        if (!response.ok) {
          const text = await response.text();
          throw new Error(`HTTP ${response.status}: ${text}`);
        }
        return response.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          console.log('Datos filtrados:', data);
          setData(data);
        } else if (data.errores) {
          console.error('Errores del servidor:', data.errores);
          alert('Hubo un error en la búsqueda. Revisa los filtros ingresados.');
          setData([]);
        } else {
          console.warn('Respuesta inesperada:', data);
          setData([]);
        }
      })
      .catch((error) => {
        console.error('Error al obtener actividades:', error);
      });
  };
  const handleDelete = (id) => {
    alert('¡Estás a punto de eliminar esta actividad!');

    if (window.confirm('¿Estás seguro de que deseas eliminar esta actividad?')) {
      fetch(`${import.meta.env.VITE_API_URL}/api/admin/EliminarActividad?id_actividad=${id}`, {
        method: 'DELETE',
        credentials: 'include',
      })
        .then((response) => {
          if (response.ok) {
            setData((prevData) => prevData.filter((item) => item.id_actividad !== id));
            console.log(`Actividad con ID ${id} eliminada`);
          } else {
            console.error('Error al eliminar la actividad');
          }
        })
        .catch((error) => {
          console.error('Error al eliminar la actividad:', error);
        });
    }
  };
  const customRender = (column, row) => {
    const columnKeyMap = {
      ID: 'id_actividad',
      'Nombre Actividad': 'nombre_actividad',
      Lugar: 'lugar',
      'Puntos CEDHI': 'creditos',
      Periodo: 'semestre',
      'Nombre Persona': 'nombre_persona',
      Apellido: 'apellido',
    };

    if (column === 'Acciones') {
      return (
        <div className="action-buttons">
          <button className="action-button" onClick={() => handleEditClick(row)}>
            <img
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQCQKSXUQPazM3iiWHvTZs0zXzcgFzYXlJfKQ&s"
              alt="Editar"
            />
          </button>
          <button className="action-button" onClick={() => handleTakeAttendance(row)}>
            <img
              src="/icons/attendance.svg"
              alt="Tomar asistencia"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = 'https://cdn-icons-png.flaticon.com/512/1047/1047711.png';
              }}
            />
          </button>
          <button className="action-button" onClick={() => handleBonusClick(row)}>
            <img
              src="https://cdn-icons-png.flaticon.com/512/1828/1828884.png"
              alt="Otorgar bonus"
              title="Otorgar bonus"
            />
          </button>
          <button className="action-button" onClick={() => handleDelete(row.id_actividad)}>
            <img
              src="https://media.istockphoto.com/id/928418914/es/vector/bote-de-basura-basurero-icono-de-la-papelera.jpg?s=612x612&w=0&k=20&c=rBQCvIJdlIUOaYlpEK_86WD3i7wsyLIQ6C1tjYxrTTQ="
              alt="Eliminar"
            />
          </button>
        </div>
      );
    }

    return row[columnKeyMap[column]];
  };

  return (
    <div className={`actividades-container ${navbarCollapsed ? 'navbar-collapsed' : ''}`}>
      {renderNavbar()}
      <div className="actividades-content">
        <div className="actividades-header">
          <h1 className="actividades-title">Actividades</h1>
          <Button
            text="Crear Actividad"
            styleType="black"
            onClick={() => navigate('/create_actividad')}
          />
        </div>

        <div className="actividades-search">
          <div className="search-container">
            <div className="date-field">
              <label>Fecha Inicio</label>
              <TextField
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
              />
            </div>
            <div className="date-field">
              <label>Fecha Fin</label>
              <TextField
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
              />
            </div>
            <Button text="Buscar" styleType="black" onClick={handleSearch} />
          </div>
        </div>
        {showEditForm && (
          <div className="info-container">
            <h2>Editar Actividad</h2>
            <div className={'info-grid'}>
              <div className="input-field">
                <label htmlFor="nombre_actividad">Nombre de la Actividad:</label>
                <TextField
                  id="nombre_actividad"
                  placeholder="Nombre Actividad"
                  value={editingActividad.nombre_actividad}
                  onChange={(e) =>
                    setEditingActividad({
                      ...editingActividad,
                      nombre_actividad: e.target.value,
                    })
                  }
                />
              </div>
              <div className="input-field">
                <label htmlFor="lugar">Lugar:</label>
                <TextField
                  id="lugar"
                  placeholder="Lugar"
                  value={editingActividad.lugar}
                  onChange={(e) =>
                    setEditingActividad({
                      ...editingActividad,
                      lugar: e.target.value,
                    })
                  }
                />
              </div>
              <div className="input-field">
                <label htmlFor="creditos">Puntos CEDHI:</label>
                <TextField
                  id="creditos"
                  placeholder="Puntos CEDHI"
                  type="number"
                  value={editingActividad.creditos}
                  onChange={(e) =>
                    setEditingActividad({
                      ...editingActividad,
                      creditos: e.target.value,
                    })
                  }
                />
              </div>
              <div className="input-field">
                <label htmlFor="semestre">Semestre:</label>
                <TextField
                  id="semestre"
                  placeholder="Semestre"
                  value={editingActividad.semestre}
                  onChange={(e) =>
                    setEditingActividad({
                      ...editingActividad,
                      semestre: e.target.value,
                    })
                  }
                />
              </div>
              <div className="input-field">
                <label htmlFor="fecha_inicio">Fecha de Inicio:</label>
                <TextField
                  id="fecha_inicio"
                  type="datetime-local"
                  placeholder="Fecha de Inicio"
                  value={editingActividad.fecha_inicio || ''}
                  onChange={(e) =>
                    setEditingActividad({
                      ...editingActividad,
                      fecha_inicio: e.target.value,
                    })
                  }
                />
              </div>
              <div className="input-field">
                <label htmlFor="fecha_fin">Fecha de Fin:</label>
                <TextField
                  id="fecha_fin"
                  type="datetime-local"
                  placeholder="Fecha de Fin"
                  value={editingActividad.fecha_fin || ''}
                  onChange={(e) =>
                    setEditingActividad({
                      ...editingActividad,
                      fecha_fin: e.target.value,
                    })
                  }
                />
              </div>
              <Button text="Guardar Cambios" styleType="black" onClick={handleSaveActividad} />
              <Button text="Cancelar" styleType="danger" onClick={() => setShowEditForm(false)} />
            </div>
          </div>
        )}
        {showBonusForm && bonusActividad && (
          <div className="bonus-container">
            <div className="bonus-header">
              <div>
                <h2>Otorgar bonus</h2>
                <p>
                  Actividad seleccionada: <strong>{bonusActividad.nombre_actividad}</strong>
                </p>
              </div>
              <Button text="Cerrar" styleType="white" onClick={closeBonusForm} />
            </div>
            <form className="bonus-form" onSubmit={handleBonusSubmit}>
              <div className="input-field">
                <label htmlFor="bonus-estudiante-search">Buscar estudiante</label>
                <TextField
                  id="bonus-estudiante-search"
                  placeholder="Escribe nombre o DNI"
                  value={bonusStudentSearch}
                  onChange={(e) => setBonusStudentSearch(e.target.value)}
                  disabled={studentsLoading}
                />
              </div>
              <div className="input-field">
                <label htmlFor="bonus-estudiante">Estudiante</label>
                <select
                  id="bonus-estudiante"
                  value={bonusForm.id_persona}
                  onChange={(e) =>
                    setBonusForm((prev) => ({
                      ...prev,
                      id_persona: e.target.value,
                    }))
                  }
                  disabled={studentsLoading || filteredStudents.length === 0}
                >
                  <option value="">Selecciona un estudiante</option>
                  {filteredStudents.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label} — DNI: {option.dni || 'N/A'}
                    </option>
                  ))}
                </select>
                {!studentsLoading && filteredStudents.length === 0 && (
                  <small className="bonus-hint">No hay coincidencias con la búsqueda.</small>
                )}
              </div>
              <div className="input-field">
                <label htmlFor="bonus-puntos">Puntos</label>
                <TextField
                  id="bonus-puntos"
                  type="number"
                  min="1"
                  step="1"
                  value={bonusForm.puntos}
                  onChange={(e) =>
                    setBonusForm((prev) => ({
                      ...prev,
                      puntos: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="input-field">
                <label htmlFor="bonus-motivo">Motivo</label>
                <TextField
                  id="bonus-motivo"
                  type="text"
                  placeholder="Describe el motivo (mín. 5 caracteres)"
                  value={bonusForm.motivo}
                  minLength={5}
                  onChange={(e) =>
                    setBonusForm((prev) => ({
                      ...prev,
                      motivo: e.target.value,
                    }))
                  }
                />
              </div>
              {bonusFeedback.error && (
                <div className="bonus-feedback error">{bonusFeedback.error}</div>
              )}
              {bonusFeedback.success && (
                <div className="bonus-feedback success">
                  <p>{bonusFeedback.success}</p>
                  <Button
                    text="Ver historial"
                    styleType="white"
                    onClick={verHistorialBonos}
                    disabled={!bonusForm.id_persona}
                  />
                </div>
              )}
              <div className="bonus-actions">
                <Button
                  text={bonusLoading ? 'Registrando...' : 'Registrar bonus'}
                  styleType="black"
                  disabled={bonusLoading}
                  type="submit"
                />
                <Button text="Cancelar" styleType="danger" onClick={closeBonusForm} />
              </div>
            </form>
          </div>
        )}
        <div className="actividades-table">
          <div className="actividades-table__scroll">
            <table>
              <thead>
                <tr className="table-header">
                  {columns.map((col) => (
                    <td key={col} className="table-cell">
                      {col}
                    </td>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((row, idx) => (
                  <tr key={idx} className="table-row">
                    {columns.map((col) => (
                      <td key={col} className="table-cell">
                        {customRender(col, row)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Actividades;
