import React, { useState, useEffect, useContext } from 'react';
import './Navbar.css';
import Button from '../../components/button/Button';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const Navbar = ({ onCollapsedChange }) => {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);
  const [collapsedDesktop, setCollapsedDesktop] = useState(false);
  const [openMobile, setOpenMobile] = useState(false);

  useEffect(() => {
    if (onCollapsedChange) {
      onCollapsedChange(collapsedDesktop);
    }
  }, [collapsedDesktop, onCollapsedChange]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setOpenMobile(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Error de red:', error);
    } finally {
      setOpenMobile(false);
      logout();
    }
  };

  const toggleDesktopCollapse = () => {
    setCollapsedDesktop((prev) => !prev);
  };

  const toggleMobileMenu = () => {
    setOpenMobile((prev) => !prev);
  };

  const handleNavigate = (path) => {
    navigate(path);
    setOpenMobile(false);
  };

  return (
    <>
      {/* Boton hamburguesa solo visible en moviles */}
      <button
        className={`mobile-menu-toggle ${openMobile ? 'active' : ''}`}
        onClick={toggleMobileMenu}
        aria-label={openMobile ? 'Cerrar menu' : 'Abrir menu'}
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      {/* Navbar responsive */}
      <div
        className={`navbar-container 
                    ${collapsedDesktop ? 'collapsed' : ''} 
                    ${openMobile ? 'open' : 'hidden'}`}
        onDoubleClick={toggleDesktopCollapse}
      >
        <div className="navbar-inner-scroll">
          <div className="navbar-main">
            <div className="navbar-header">
              <img src="/Wi%C3%B1ay.png" alt="Winay XP Logo" className="navbar-logo" />
              <h2></h2>
            </div>

            <div className="navbar-buttons">
              <Button text="Dashboard" styleType="white" onClick={() => handleNavigate('/dashboard')} />
              <Button text="Tutores" styleType="white" onClick={() => handleNavigate('/tutores')} />
              <Button text="Crear tutores" styleType="white" onClick={() => handleNavigate('/create_tutores')} />
              <Button text="Estudiantes" styleType="white" onClick={() => handleNavigate('/estudiante')} />
              <Button
                text="Crear estudiantes"
                styleType="white"
                onClick={() => handleNavigate('/create_estudiante')}
              />
              <Button text="Actividad" styleType="white" onClick={() => handleNavigate('/actividad')} />
              <Button
                text="Crear actividad"
                styleType="white"
                onClick={() => handleNavigate('/create_actividad')}
              />
              <Button text="Tomar asistencia" styleType="white" onClick={() => handleNavigate('/asistencia')} />
            </div>
          </div>

          <div className="navbar-footer">
            {/* Logo CEDHI */}
            <div className="navbar-footer-logo">
              <img src="/CEDHIlogo.png" alt="CEDHI Logo" className="cedhi-logo" />
            </div>

            {/* Foto de perfil + logout */}
            <div className="navbar-user-container">
              <button className="navbar-photo" onClick={() => alert('Perfil')}>
                <img
                  src="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
                  alt="Foto de perfil"
                />
              </button>

              {!collapsedDesktop && (
                <div className="navbar-footer-text">
                  <button className="navbar-username" onClick={() => alert('Usuario')}>
                    Admin
                  </button>
                  <button className="navbar-logout" onClick={handleLogout}>
                    Cerrar Sesion
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
