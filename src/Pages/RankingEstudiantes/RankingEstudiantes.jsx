import React, { useEffect, useState } from 'react';
import NavbarE from '../Navbar/NavbarE';
import Table from '../../components/Table/Table';
import './RankingEstudiantes.css';

const RankingEstudiantes = () => {
  const [rankingData, setRankingData] = useState([]);
  const [collapsed, setCollapsed] = useState(false);
  const [error, setError] = useState('');
  const columns = ['Pos', 'Nombre', 'Apellido', 'Carrera', 'Puntos'];

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/estudiante/TopEstudiantesCarrera`, {
      method: 'GET',
      credentials: 'include',
    })
      .then(async (response) => {
        const ct = response.headers.get('content-type') || '';
        if (!response.ok) {
          if (ct.includes('application/json')) {
            const data = await response.json();
            throw new Error(data?.message || `HTTP ${response.status}`);
          } else {
            const text = await response.text();
            throw new Error(text || `HTTP ${response.status}`);
          }
        }
        if (ct.includes('application/json')) {
          return response.json();
        }
        return [];
      })
      .then((data) => {
        setRankingData(Array.isArray(data) ? data : []);
      })
      .catch((error) => {
        console.error('Error al obtener el ranking:', error);
        setError('No se pudo cargar el ranking. Intenta más tarde.');
        setRankingData([]);
      });
  }, []);

  useEffect(() => {
    const handleNavbarToggle = (e) => {
      if (e.detail && e.detail.collapsed !== undefined) {
        setCollapsed(e.detail.collapsed);
      }
    };
    window.addEventListener('navbarToggle', handleNavbarToggle);
    // Estado inicial
    const navbarElement = document.querySelector('.navbar-container');
    if (navbarElement) {
      setCollapsed(navbarElement.classList.contains('collapsed'));
    }
    return () => window.removeEventListener('navbarToggle', handleNavbarToggle);
  }, []);

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
        return row.nombre_carrera || row.carrera;
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
          <p>Top nacional · actualizado en tiempo real según tus créditos Wiñay</p>
        </div>

        {error && <div className="ranking-error">{error}</div>}

        <div className="ranking-card">
          <div>
            <h2>Top 10</h2>
            <p>Reconocemos a los estudiantes con mayor crecimiento académico en Wiñay XP.</p>
          </div>

          {rankingData.length > 0 ? (
            <Table columns={columns} data={rankingData.slice(0, 10)} customRender={customRender} />
          ) : (
            <div className="ranking-empty">
              No se pudo cargar el ranking en este momento. Intenta nuevamente más tarde.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RankingEstudiantes;
