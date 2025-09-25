import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Pages/Login/Login';
import Dashboard from './Pages/Dashboard/Dashboard';
import Tutores from './Pages/Tutores/Tutores';
import Create_Tutores from './Pages/Create_Tutores/Create_Tutores';
import Create_Estudiante from './Pages/Create_Estudiante/Create_Estudiante';
import Estudiante from './Pages/Estudiante/Estudiante';
import Create_Actividad from './Pages/Create_Actividad/Create_Actividad';
import Actividad from './Pages/Actividad/Actividad';
import Asistencia from './Pages/Asistencia/Asistencia.jsx';
import Perfil from './Pages/Perfil/Perfil.jsx';
import Tomar_Asistencia from './Pages/Tomar_Asistencia/Tomar_Asistencia';
import Ranking from './Pages/RankingEstudiantes/RankingEstudiantes.jsx';
import AuthHandler from './components/AuthHandler/AuthHandler';
import AuthResult from './Pages/AuthResult/AuthResult';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      {/* Componente que maneja errores 401 globalmente */}
      <AuthHandler />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tutores"
          element={
            <ProtectedRoute allow={['administrador']}>
              <Tutores />
            </ProtectedRoute>
          }
        />
        <Route
          path="/create_tutores"
          element={
            <ProtectedRoute allow={['administrador']}>
              <Create_Tutores />
            </ProtectedRoute>
          }
        />
        <Route
          path="/create_estudiante"
          element={
            <ProtectedRoute allow={['administrador']}>
              <Create_Estudiante />
            </ProtectedRoute>
          }
        />
        <Route
          path="/estudiante"
          element={
            <ProtectedRoute allow={['administrador', 'tutor']}>
              <Estudiante />
            </ProtectedRoute>
          }
        />
        <Route
          path="/create_actividad"
          element={
            <ProtectedRoute allow={['administrador']}>
              <Create_Actividad />
            </ProtectedRoute>
          }
        />
        <Route
          path="/actividad"
          element={
            <ProtectedRoute allow={['administrador']}>
              <Actividad />
            </ProtectedRoute>
          }
        />
        <Route
          path="/asistencia"
          element={
            <ProtectedRoute allow={['administrador', 'tutor']}>
              <Asistencia />
            </ProtectedRoute>
          }
        />
        <Route
          path="/perfil"
          element={
            <ProtectedRoute allow={['estudiante']}>
              <Perfil />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tomar-asistencia"
          element={
            <ProtectedRoute allow={['tutor']}>
              <Tomar_Asistencia />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ranking"
          element={
            <ProtectedRoute allow={['estudiante']}>
              <Ranking />
            </ProtectedRoute>
          }
        />
        <Route path="/auth-result" element={<AuthResult />} />
      </Routes>
    </Router>
  );
}

export default App;
