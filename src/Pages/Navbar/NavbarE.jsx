import React, { useState, useEffect, useContext } from 'react';
import './Navbar.css';
import Button from '../../components/button/Button';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const MOBILE_BREAKPOINT = 768;

const NavbarE = ({ onCollapsedChange }) => {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);
  const [collapsedDesktop, setCollapsedDesktop] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [openMobile, setOpenMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= MOBILE_BREAKPOINT;
      setIsMobile(mobile);
      if (!mobile) {
        setOpenMobile(false);
      }
    };

    handleResize();
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

  return (
    <>
      {/* Boton hamburguesa */}
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

      {/* Navbar principal */}
      <div
        className={`navbar-container 
                    ${collapsedDesktop ? 'collapsed' : ''} 
                    ${isMobile ? (openMobile ? 'open' : 'hidden') : ''}`}
        onDoubleClick={() => !isMobile && setCollapsedDesktop((prev) => !prev)}
      >
        <div className="navbar-inner-scroll">
          <div className="navbar-main">
            <div className="navbar-header">
              <img src="/Wi%C3%B1ay.png" alt="Winay XP Logo" className="navbar-logo" />
            </div>
            <div className="navbar-buttons">
              <Button text="Perfil" styleType="white" onClick={() => handleNavigate('/perfil')} />
              <Button text="Ranking de estudiantes" styleType="white" onClick={() => handleNavigate('/ranking')} />
            </div>
          </div>

          <div className="navbar-footer">
            <div className="navbar-footer-logo">
              <img src="/CEDHIlogo.png" alt="CEDHI Logo" className="cedhi-logo" />
            </div>

            <div className="navbar-user-container">
              <button className="navbar-photo" onClick={() => alert('Perfil')}>
                <img
                  src="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
                  alt="Foto de perfil"
                />
              </button>

              {(!collapsedDesktop || openMobile) && (
                <div className="navbar-footer-text">
                  <button className="navbar-username" onClick={() => alert('Usuario')}>
                    Alumno
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

export default NavbarE;

