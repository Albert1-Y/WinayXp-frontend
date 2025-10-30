import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import NavbarE from '../Navbar/NavbarE';
import Table from '../../components/Table/Table';
import './RankingEstudiantes.css';

const RankingEstudiantes = () => {
  const [rankingData, setRankingData] = useState([]);
  const [collapsed, setCollapsed] = useState(false);
  const [error, setError] = useState('');
  const [selectedCarrera, setSelectedCarrera] = useState('');
  const [studentCarrera, setStudentCarrera] = useState('');
  const [availableCarreras, setAvailableCarreras] = useState([]);
  const [loadingRanking, setLoadingRanking] = useState(false);
  const userChangedCarreraRef = useRef(false);

  const columns = ['Pos', 'Nombre', 'Apellido', 'Carrera', 'Semestre', 'Puntos'];

  const normalizeRankingData = (data) => {
    return (Array.isArray(data) ? data : []).map((item) => {
      const semesterValue =
        item.semestre ??
        item.semestre_actual ??
        item.semestre_estudiante ??
        item.estudiante?.semestre ??
        item.detalle?.semestre ??
        item.semestre_nombre ??
        item.semester ??
        null;

      const careerValue =
        item.carrera_display ??
        item.nombre_carrera ??
        item.carrera ??
        item.carrera_nombre ??
        item.career ??
        null;

      return {
        ...item,
        semestre_display: semesterValue,
        carrera_display: careerValue,
      };
    });
  };

  const updateCarreraOptions = (rows) => {
    setAvailableCarreras((prev) => {
      const names = new Set(prev.filter(Boolean));
      rows.forEach((row) => {
        const carreraNombre = row.carrera_display ?? row.nombre_carrera ?? row.carrera;
        if (carreraNombre) {
          names.add(carreraNombre);
        }
      });
      return Array.from(names).sort((a, b) => a.localeCompare(b));
    });
  };

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();
    setLoadingRanking(true);
    setError('');

    const query = selectedCarrera ? `?carrera=${encodeURIComponent(selectedCarrera)}` : '';

    fetch(`${import.meta.env.VITE_API_URL}/api/estudiante/TopEstudiantesCarrera${query}`, {
      method: 'GET',
      credentials: 'include',
      signal: controller.signal,
    })
      .then(async (response) => {
        const ct = response.headers.get('content-type') || '';
        if (!response.ok) {
          if (ct.includes('application/json')) {
            const data = await response.json();
            throw new Error(data?.message || `HTTP ${response.status}`);
          }
          const text = await response.text();
          throw new Error(text || `HTTP ${response.status}`);
        }
        if (ct.includes('application/json')) {
          return response.json();
        }
        return [];
      })
      .then((data) => {
        if (!isMounted) {
          return;
        }
        const normalized = normalizeRankingData(data);
        setRankingData(normalized);
        updateCarreraOptions(normalized);
      })
      .catch((fetchError) => {
        if (!isMounted || fetchError.name === 'AbortError') {
          return;
        }
        console.error('Error al obtener el ranking:', fetchError);
        setError('No se pudo cargar el ranking para la carrera seleccionada. Intenta mas tarde.');
        setRankingData([]);
      })
      .finally(() => {
        if (isMounted) {
          setLoadingRanking(false);
        }
      });

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [selectedCarrera]);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    fetch(`${import.meta.env.VITE_API_URL}/api/estudiante/InitEstudiante`, {
      method: 'GET',
      credentials: 'include',
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) {
          const ct = response.headers.get('content-type') || '';
          if (ct.includes('application/json')) {
            const err = await response.json();
            throw new Error(err?.msg || `HTTP ${response.status}`);
          }
          const text = await response.text();
          throw new Error(text || `HTTP ${response.status}`);
        }
        const ct = response.headers.get('content-type') || '';
        if (ct.includes('application/json')) {
          return response.json();
        }
        return null;
      })
      .then((data) => {
        if (!isMounted || !data) {
          return;
        }
        const carreraNombre =
          data.nombre_carrera ?? data.carrera ?? data.carrera_nombre ?? data.career ?? '';
        if (carreraNombre) {
          setStudentCarrera(carreraNombre);
          if (!userChangedCarreraRef.current) {
            setSelectedCarrera(carreraNombre);
          }
        }
      })
      .catch((fetchError) => {
        if (fetchError.name === 'AbortError') {
          return;
        }
        console.debug('No se pudo obtener la carrera del estudiante actual:', fetchError?.message);
      });

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []);

  useEffect(() => {
    if (!studentCarrera) {
      return;
    }
    setAvailableCarreras((prev) => {
      if (prev.includes(studentCarrera)) {
        return prev;
      }
      const updated = [...prev, studentCarrera].sort((a, b) => a.localeCompare(b));
      return updated;
    });
  }, [studentCarrera]);

  useLayoutEffect(() => {
    const root = document.documentElement;
    const navbarElement = document.querySelector('.navbar-container');

    if (!navbarElement) {
      root.style.setProperty('--navbar-current-width', '220px');
      setCollapsed(false);
      return () => {
        root.style.removeProperty('--navbar-current-width');
      };
    }

    const updateLayoutFromNavbar = () => {
      const width = navbarElement.getBoundingClientRect().width || 0;
      root.style.setProperty('--navbar-current-width', `${width}px`);
      setCollapsed(navbarElement.classList.contains('collapsed'));
    };

    updateLayoutFromNavbar();

    let resizeObserver = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        updateLayoutFromNavbar();
      });
      resizeObserver.observe(navbarElement);
    } else {
      window.addEventListener('resize', updateLayoutFromNavbar);
    }

    let mutationObserver = null;
    if (typeof MutationObserver !== 'undefined') {
      mutationObserver = new MutationObserver(updateLayoutFromNavbar);
      mutationObserver.observe(navbarElement, { attributes: true, attributeFilter: ['class'] });
    }

    return () => {
      if (resizeObserver) {
        resizeObserver.disconnect();
      } else {
        window.removeEventListener('resize', updateLayoutFromNavbar);
      }
      if (mutationObserver) {
        mutationObserver.disconnect();
      }
      root.style.removeProperty('--navbar-current-width');
    };
  }, []);

  const handleCarreraChange = (event) => {
    userChangedCarreraRef.current = true;
    setSelectedCarrera(event.target.value);
  };

  const customRender = (column, row, index) => {
    switch (column) {
      case 'Pos':
        return (
          <span
            style={{
              fontWeight: 'bold',
              color:
                index === 0
                  ? '#FFD700'
                  : index === 1
                  ? '#C0C0C0'
                  : index === 2
                  ? '#CD7F32'
                  : '#333',
            }}
          >
            {index + 1}
          </span>
        );
      case 'Nombre':
        return row.nombre_persona || row.nombre;
      case 'Apellido':
        return row.apellido;
      case 'Carrera':
        return row.carrera_display || row.nombre_carrera || row.carrera || 'N/A';
      case 'Semestre': {
        const value = row.semestre_display ?? row.semestre;
        if (!value && value !== 0) {
          return 'N/A';
        }
        const numericValue = Number(value);
        if (!Number.isNaN(numericValue) && `${numericValue}` === `${value}`) {
          return `Semestre ${numericValue}`;
        }
        return value;
      }
      case 'Puntos':
        return (
          <span
            style={{
              fontWeight: 'bold',
              color:
                row.credito_total >= 90
                  ? '#10B981'
                  : row.credito_total >= 75
                  ? '#FBBF24'
                  : '#EF4444',
            }}
          >
            {row.credito_total}
          </span>
        );
      default:
        return row[column];
    }
  };

  return (
    <div className={`ranking-shell ${collapsed ? 'navbar-collapsed' : ''}`}>
      <NavbarE onCollapsedChange={setCollapsed} />
      <div className="ranking-content">
        <div className="ranking-hero">
          <h1>Ranking de Estudiantes</h1>
          <p>Top nacional - actualizado en tiempo real segun tus creditos Winay</p>
        </div>

        {error && <div className="ranking-error">{error}</div>}

        <div className="ranking-card">
          <div className="ranking-card-header">
            <h2>Top 10</h2>
            <p>Reconocemos a los estudiantes con mayor crecimiento academico en Winay XP.</p>
          </div>

          <div className="ranking-filters">
            <label htmlFor="rankingCarreraSelect">Carrera</label>
            <select
              id="rankingCarreraSelect"
              value={selectedCarrera}
              onChange={handleCarreraChange}
            >
              <option value="">Todas las carreras</option>
              {availableCarreras.map((carrera) => (
                <option key={carrera} value={carrera}>
                  {studentCarrera && carrera === studentCarrera
                    ? `Mi carrera (${carrera})`
                    : carrera}
                </option>
              ))}
            </select>
          </div>

          {loadingRanking ? (
            <div className="ranking-loading">Cargando ranking...</div>
          ) : rankingData.length > 0 ? (
            <Table columns={columns} data={rankingData.slice(0, 10)} customRender={customRender} />
          ) : (
            <div className="ranking-empty">
              {selectedCarrera
                ? 'No hay estudiantes registrados para la carrera seleccionada.'
                : 'No se pudo cargar el ranking en este momento. Intenta nuevamente mas tarde.'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RankingEstudiantes;
