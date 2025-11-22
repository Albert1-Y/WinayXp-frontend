import React, { useState, useEffect, useContext } from 'react';
import './Navbar.css';
import Button from '../../components/button/Button';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const MOBILE_BREAKPOINT = 576;

const NavbarT = ({ onCollapsedChange }) => {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);
  const [collapsedDesktop, setCollapsedDesktop] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= MOBILE_BREAKPOINT);
  const [openMobile, setOpenMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= MOBILE_BREAKPOINT;
      setIsMobile(mobile);
      if (!mobile) {
        setOpenMobile(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (onCollapsedChange) {
      onCollapsedChange(collapsedDesktop);
    }
  }, [collapsedDesktop, onCollapsedChange]);

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

  const toggleMenu = () => {
    if (isMobile) {
      setOpenMobile((prev) => !prev);
    } else {
      setCollapsedDesktop((prev) => !prev);
    }
  };

  const handleNavigate = (path) => {
    navigate(path);
    setOpenMobile(false);
  };

  const toggleButton = (
    <button
      className={`mobile-menu-toggle ${(isMobile && openMobile) || (!isMobile && collapsedDesktop) ? 'active' : ''}`}
      onClick={toggleMenu}
      aria-label={
        isMobile
          ? openMobile
            ? 'Cerrar menu'
            : 'Abrir menu'
          : collapsedDesktop
            ? 'Expandir menu'
            : 'Colapsar menu'
      }
    >
      <span></span>
      <span></span>
      <span></span>
    </button>
  );

  return (
    <>
      {isMobile ? (
        <div className="navbar-mobile-header">
          {toggleButton}
          <span className="navbar-mobile-title">Wiñay XP</span>
        </div>
      ) : (
        toggleButton
      )}

      <div
        className={`navbar-container 
                    ${collapsedDesktop ? 'collapsed' : ''} 
                    ${isMobile ? (openMobile ? 'open' : 'hidden') : ''}`}
        onDoubleClick={() => !isMobile && setCollapsedDesktop((prev) => !prev)}
      >
        <div className="navbar-inner-scroll">
          <div className="navbar-main">
            <div className="navbar-header">
              <img src="/Winay.png" alt="Winay XP Logo" className="navbar-logo" />
            </div>
            <div className="navbar-buttons">
              <button className="btn white" onClick={() => handleNavigate('/dashboard')}>
                <span>Dashboard</span>
              </button>
              <button className="btn white" onClick={() => handleNavigate('/estudiante')}>
                <span>Estudiantes</span>
              </button>
              <button className="btn white" onClick={() => handleNavigate('/create_estudiante')}>
                <span>Crear estudiantes</span>
              </button>
              <button className="btn white" onClick={() => handleNavigate('/actividad')}>
                <span>Actividad</span>
              </button>
              <button className="btn white" onClick={() => handleNavigate('/create_actividad')}>
                <span>Crear actividad</span>
              </button>
              <button className="btn white" onClick={() => handleNavigate('/asistencia')}>
                <span>Tomar asistencia</span>
              </button>
              <button className="btn white" onClick={() => handleNavigate('/creditos')}>
                <span>Créditos</span>
              </button>
            </div>
          </div>

          <div className="navbar-footer">
            <div className="navbar-footer-logo">
              <img src="/CEDHIlogo.png" alt="CEDHI Logo" className="cedhi-logo" />
            </div>

            <div className="navbar-user-card">
              <button className="navbar-photo" onClick={() => alert('Perfil')}>
                <img
                  src="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
                  alt="Foto de perfil"
                />
              </button>

              {(!collapsedDesktop || openMobile) && (
                <div className="navbar-user-meta">
                  <span className="navbar-user-role">Tutor</span>
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

export default NavbarT;
