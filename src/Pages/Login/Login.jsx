import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import './Login.css';
import Button from '../../components/button/Button';
import Table from '../../components/Table/Table';
import TextField from '../../components/TextField/TextField';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { rol, setRol } = useContext(AuthContext);
  const [rankingData, setRankingData] = useState([]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState(''); // Estado para el mensaje de error

  useEffect(() => {
    // Mostrar error si viene desde una ruta protegida
    if (location.state && location.state.error) {
      setErrorMessage(location.state.error);
      // Limpiar el estado de navegación para que no reaparezca al refrescar
      navigate('/', { replace: true, state: null });
    }
  }, [location.state, navigate]);

  useEffect(() => {
    if (rol === 'administrador' || rol === 'tutor' || rol === 'estudiante') {
      navigate('/dashboard');
    } else if (rol === null || rol === undefined) {
      navigate('/');
    }
  }, [rol]);

  // Redirige al backend para iniciar el flujo de Google OAuth
  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/api/auth/google`;
  };

  // Fetch ranking data on component mount
  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/login`)
      .then((response) => response.json())
      .then((data) => {
        const sortedData = data.sort((a, b) => b.credito_total - a.credito_total);
        setRankingData(sortedData);
      })
      .catch((error) => {
        console.error('Error al obtener el ranking:', error);
      });
  }, []);

  useEffect(() => {
    console.log(rankingData);
  }, [rankingData]);

  // Columnas para la tabla, actualizadas para mostrar solo las que necesitamos
  const columns = ['Pos', 'Nombre', 'Apellido', 'Carrera', 'Puntos CEDHI'];

  // Custom render para las filas
  const customRender = (column, row, index) => {
    switch (column) {
      case 'Pos':
        return index + 1;
      case 'Nombre':
        return row.nombre;
      case 'Apellido':
        return row.apellido;
      case 'Carrera':
        return row.carrera;
      case 'Puntos CEDHI':
        return row.credito_total;
      default:
        return row[column];
    }
  };

  const handleLogin = (e) => {
    e.preventDefault(); // Evita que el formulario recargue la página

    // Resetear cualquier mensaje de error previo
    setErrorMessage('');

    // Validaciones básicas
    if (!email.trim()) {
      setErrorMessage('El correo electrónico es obligatorio');
      return;
    }

    if (!password.trim()) {
      setErrorMessage('La contraseña es obligatoria');
      return;
    }

    const loginData = {
      email: email,
      password: password,
    };

    // Realiza el POST para enviar email y password
    fetch(`${import.meta.env.VITE_API_URL}/api/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loginData),
      credentials: 'include',
    })
      .then((response) => {
        if (response.ok) {
          return response.json(); // Respuesta exitosa
        } else {
          // Verificar el tipo de error según el código de estado
          if (response.status === 401) {
            throw new Error('Credenciales incorrectas. Verifica tu correo y contraseña.');
          } else if (response.status === 404) {
            throw new Error('Usuario no encontrado. Verifica tu correo electrónico.');
          } else if (response.status === 403) {
            throw new Error('Acceso denegado. Tu cuenta podría estar desactivada.');
          } else {
            throw new Error('Error en el servidor. Intenta más tarde.');
          }
        }
      })
      .then((data) => {
        setRol(data.rol); // Guardamos el rol en el contexto
        switch (data.rol) {
          case 'administrador':
            navigate('/dashboard');
            break;
          case 'estudiante':
            navigate('/dashboard');
            break;
          case 'tutor':
            navigate('/dashboard');
            break;
          default:
            setErrorMessage('Rol de usuario no reconocido');
        }
      })
      .catch((error) => {
        console.error('Error en la autenticación:', error);
        setErrorMessage(error.message || 'Error al iniciar sesión. Intenta nuevamente.');
      });
  };

  return (
    <div className="login-container">
      <div className="login-grid">
        {/* Contenedor 1 */}
        <div className="login-box">
          <div className="logo-container">
            <img src="/CEDHIlogo.png" alt="CEDHI Logo" className="login-logo" />
          </div>
          <h2>Iniciar Sesión</h2>
          <form onSubmit={handleLogin}>
            {' '}
            {/* Usar onSubmit para evitar recargar la página */}
            <div className="form-group">
              <label htmlFor="email">Correo Electrónico</label>
              <TextField
                placeholder="ejemplo@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)} // Maneja el cambio del email
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Contraseña</label>
              <TextField
                type="password" // Cambiar tipo a "password"
                placeholder="contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)} // Maneja el cambio de la contraseña
              />
            </div>
            {errorMessage && <div className="error-message">{errorMessage}</div>}{' '}
            {/* Muestra el mensaje de error si existe */}
            <Button text="Iniciar Sesión" styleType="black" type="submit" />
          </form>
          <Button
            text="Iniciar sesión con Google"
            styleType="google"
            type="button"
            onClick={handleGoogleLogin}
          />
        </div>

        {/* Contenedor 2 */}
        <div className="login-box">
          <div className="logo-container">
            <img src="/Wiñay.png" alt="Wiñay Logo" className="login-logo" />
          </div>
          <h2>Ranking de Estudiantes</h2>
          <Table columns={columns} data={rankingData.slice(0, 10)} customRender={customRender} />
        </div>
      </div>
    </div>
  );
};

export default Login;
