# Manual Técnico - Sistema de Gamificación CEDHI2 (Frontend)

## 1. Introducción

Este documento describe la versión actual del Frontend del Sistema de Gamificación CEDHI2 (Winay XP). Se centra únicamente en la implementación vigente: arquitectura, dependencias, módulos y operación. No incluye notas ni comparativas con versiones anteriores.

## 2. Stack y dependencias

- **Framework**: React 19.0.0
- **Build**: Vite 6.3.1
- **Router**: React Router DOM 7.5.2 (HashRouter)
- **Gráficos**: Chart.js 4.4.9 + React-ChartJS-2 5.3.0
- **Escáner**: @zxing/browser 0.1.5 y react-barcode-reader 0.0.2
- **Linting/Formato**: ESLint 9.22.0, Prettier 3.6.2
- **Backend consumido**: API REST Node.js + PostgreSQL (el frontend no accede directamente a la base de datos)

## 3. Requisitos previos

- Node.js 18+ y npm.
- Acceso a la API configurada (URL base en `VITE_API_URL`).
- Puerto local disponible 5173 para desarrollo.

## 4. Estructura del proyecto

```
Sistema-de-gamificacion-CEDHI2/
Frontend/
├── public/                # Recursos estáticos
│   ├── CEDHIlogo.png
│   ├── Listados.png
│   ├── Winay.png
│   └── ImagenNiveles/
├── src/
│   ├── assets/            # Imágenes y multimedia
│   ├── components/        # Componentes reutilizables
│   │   ├── AuthHandler/
│   │   ├── button/
│   │   ├── Table/
│   │   └── TextField/
│   ├── context/           # Contextos globales (AuthContext)
│   ├── Pages/             # Páginas principales
│   │   ├── Actividad/
│   │   ├── Asistencia/
│   │   ├── Dashboard/
│   │   ├── Estudiante/
│   │   ├── Login/
│   │   ├── Navbar/
│   │   └── ...
│   ├── utils/             # Utilidades y helpers
│   ├── App.jsx            # Rutas y layout raíz
│   ├── main.jsx           # Punto de entrada
│   └── index.css          # Estilos globales
├── eslint.config.js
├── package.json
└── vite.config.js
```

## 5. Arquitectura de la aplicación

### 5.1 Gestión de estado
React Context (AuthContext) maneja autenticación, roles (admin, tutor, estudiante) y persistencia básica de sesión en `localStorage`.

### 5.2 Sistema de rutas
HashRouter con rutas principales:
- `/` inicio de sesión
- `/dashboard`
- `/tutores`
- `/estudiante`
- `/actividad`
- `/asistencia`
- `/perfil`
- `/ranking`

### 5.3 Autenticación
Uso de tokens JWT consumidos desde el backend:
- Interceptores y manejadores de error 401 en `AuthHandler`.
- Redirección a login al expirar la sesión.
- Cierre de sesión según rol desde los componentes de Navbar.

## 6. Componentes principales

- **AuthHandler**: intercepta respuestas no autorizadas y fuerza re-login.
- **Navbar / NavbarT / NavbarE**: navegación adaptada por rol.
- **Dashboard**: panel con estadísticas, descargas de reportes y accesos a módulos.

## 7. Módulos funcionales

- Gestión de usuarios (admin, tutor, estudiante).
- Actividades (creación, edición, eliminación, exportación a Excel).
- Asistencia (registro manual y por escaneo).
- Gamificación (niveles, ranking, historial de créditos).

## 8. Estilos y UX

- CSS modular por página/componente.
- Layouts responsivos usando flex y grid.
- Feedback visual en formularios y tablas.

## 9. Integración con backend

- Consumo vía `fetch` contra `import.meta.env.VITE_API_URL`.
- Flujos cubiertos: login tradicional, OAuth Google, carga/descarga de reportes, historial de créditos, niveles, ranking y asistencia.
- Para entornos locales, el backend debe exponer los mismos endpoints que producción.

## 10. Ejecución local del frontend

1. Instalar dependencias:
   ```bash
   npm install
   ```
2. Configurar variables de entorno (crear `.env.local` o ajustar `.env`):
   ```
   VITE_API_URL=http://localhost:3000
   URL_FRONT=http://localhost:5173
   ```
   - Usa el puerto y host que exponga tu backend local.
3. Levantar el servidor de desarrollo:
   ```bash
   npm run dev
   ```
   La aplicación quedará disponible en http://localhost:5173.
4. Build de producción (opcional):
   ```bash
   npm run build
   npm run preview   # sirve el build generado
   ```

## 11. Consideraciones de seguridad

- Validar entradas en formularios antes de enviarlas al backend.
- Proteger rutas según rol; limpiar estado al cerrar sesión.
- Manejo de tokens únicamente a través del backend y `fetch` configurado.

## 12. Solución de problemas comunes

- **Errores 401/403**: revisar expiración del token y que `VITE_API_URL` apunte al backend correcto con CORS habilitado.
- **Fallos de renderizado**: verificar que las dependencias estén instaladas y que no existan errores en consola.
- **Recursos no cargan**: comprobar rutas de imágenes en `public/` y caché del navegador.
