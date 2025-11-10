import React, { useEffect, useState, useContext } from "react";
import Navbar from "../Navbar/Navbar";
import NavbarE from "../Navbar/NavbarE";
import NavbarT from "../Navbar/NavbarT";
import Button from "../../components/button/Button";
import TextField from "../../components/TextField/TextField";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "./Estudiante.css";
import useHistorialSection from "../../hooks/useHistorialSection";

const formatFechaMovimiento = (valor) => {
  if (!valor) return "-";
  const fecha = new Date(valor);
  if (Number.isNaN(fecha.getTime())) return valor;
  return fecha.toLocaleString("es-PE", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const HistorialTabla = ({ title, state, emptyLabel }) => (
  <div className="historial-table">
    <div className="historial-table-header">
      <h3>{title}</h3>
      {state.canLoadMore && (
        <Button
          text="Ver más"
          styleType="white"
          onClick={state.loadMore}
          disabled={state.loading}
        />
      )}
    </div>
    {state.error && <p className="historial-error">{state.error}</p>}
    <div className="historial-table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Actividad / Motivo</th>
            <th>Créditos</th>
            <th>Autor</th>
          </tr>
        </thead>
        <tbody>
          {state.loading && (
            <tr>
              <td colSpan="4" className="loading-row">
                Cargando movimientos...
              </td>
            </tr>
          )}
          {!state.loading && state.data.length === 0 && (
            <tr>
              <td colSpan="4" className="empty-row">
                {emptyLabel}
              </td>
            </tr>
          )}
          {!state.loading &&
            state.data.map((mov) => {
              const key =
                mov.id_movimiento ?? `${mov.created_at}-${mov.motivo ?? "mov"}`;
              const creditos = Number(mov.creditos ?? 0);
              return (
                <tr key={key}>
                  <td>{formatFechaMovimiento(mov.created_at)}</td>
                  <td>{mov.nombre_actividad || mov.motivo || "-"}</td>
                  <td>
                    <span
                      className={`historial-credito ${
                        creditos >= 0 ? "positivo" : "negativo"
                      }`}
                    >
                      {creditos > 0 ? `+${creditos}` : creditos}
                    </span>
                  </td>
                  <td>{mov.autor || "-"}</td>
                </tr>
              );
            })}
        </tbody>
      </table>
    </div>
  </div>
);

const Estudiante = () => {
  const { rol } = useContext(AuthContext);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [navbarCollapsed, setNavbarCollapsed] = useState(false);
  const [showCobrarForm, setShowCobrarForm] = useState(false);
  const [puntosACobrar, setPuntosACobrar] = useState(1);
  const [motivoCobro, setMotivoCobro] = useState("");
  const [cobroLoading, setCobroLoading] = useState(false);
  const [cobroError, setCobroError] = useState("");
  const [cobroSuccess, setCobroSuccess] = useState("");
  const [ultimoMovimientoId, setUltimoMovimientoId] = useState(null);
  const [estudianteACobrar, setEstudianteACobrar] = useState(null);
  const historialDni = selectedStudent?.dni || estudianteACobrar?.dni || null;
  const asistenciaHist = useHistorialSection(historialDni, "asistencia");
  const bonusHist = useHistorialSection(historialDni, "bonus");
  const cobroHist = useHistorialSection(historialDni, "cobro");

  useEffect(() => {
    const handleNavbarChange = () => {
      // Verificamos si existe un elemento con la clase .navbar-container.collapsed
      const collapsedNavbar = document.querySelector(
        ".navbar-container.collapsed",
      );
      setNavbarCollapsed(!!collapsedNavbar);
    };

    // Observamos cambios en el DOM para detectar cuando el navbar cambia
    const observer = new MutationObserver(handleNavbarChange);
    observer.observe(document.body, {
      subtree: true,
      attributes: true,
      attributeFilter: ["class"],
    });

    // Verificación inicial
    handleNavbarChange();

    return () => {
      observer.disconnect();
    };
  }, []);
  const handleCobrarPuntos = (id_persona) => {
    let estudiante = filteredData.find((est) => est.id_persona === id_persona);

    if (!estudiante) {
      estudiante = data.find((est) => est.id_persona === id_persona);
    }
    if (!estudiante) {
      alert("No se encontró el estudiante");
      return;
    }

    // Guardar el estudiante seleccionado y mostrar el formulario
    setEstudianteACobrar(estudiante);
    setPuntosACobrar(1); // Valor inicial
    setMotivoCobro("");
    setCobroError("");
    setCobroSuccess("");
    setUltimoMovimientoId(null);
    setShowCobrarForm(true);
  };
  const syncSaldoLocal = (id_persona, saldoParcial = {}) => {
    const mapper = (est) => {
      if (est.id_persona !== id_persona) return est;
      const creditoTotal = saldoParcial.credito_total ?? est.credito_total ?? 0;
      const cobroCredito = saldoParcial.cobro_credito ?? est.cobro_credito ?? 0;
      return {
        ...est,
        credito_total: Number(creditoTotal),
        cobro_credito: Number(cobroCredito),
      };
    };

    setData((prev) => prev.map(mapper));
    setFilteredData((prev) => prev.map(mapper));
  };

  const cerrarFormularioCobro = () => {
    setShowCobrarForm(false);
    setEstudianteACobrar(null);
    setPuntosACobrar(1);
    setMotivoCobro("");
    setCobroError("");
    setCobroSuccess("");
    setUltimoMovimientoId(null);
  };

  const procesarCobroPuntos = async () => {
    setCobroError("");
    setCobroSuccess("");
    setUltimoMovimientoId(null);

    if (!estudianteACobrar) {
      setCobroError("Selecciona un estudiante para cobrar puntos.");
      return;
    }

    const puntosNumerico = parseInt(puntosACobrar, 10);
    const motivo = motivoCobro.trim();
    const saldoDisponible = Number(estudianteACobrar.cobro_credito ?? 0);

    if (!Number.isFinite(puntosNumerico) || puntosNumerico <= 0) {
      setCobroError("Debes ingresar un valor válido mayor a 0.");
      return;
    }

    if (saldoDisponible <= 0) {
      setCobroError("El estudiante no tiene puntos disponibles para cobrar.");
      return;
    }

    if (puntosNumerico > saldoDisponible) {
      setCobroError(
        `El estudiante solo tiene ${saldoDisponible} puntos disponibles.`,
      );
      return;
    }

    if (motivo.length < 5) {
      setCobroError("El motivo debe tener al menos 5 caracteres.");
      return;
    }

    const datosACobrar = {
      id_persona: estudianteACobrar.id_persona,
      puntos: puntosNumerico,
      motivo,
    };

    setCobroLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin/CobrarPuntos`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(datosACobrar),
        },
      );

      const text = await response.text();
      let payload = {};
      try {
        payload = text ? JSON.parse(text) : {};
      } catch (error) {
        console.warn("Respuesta no válida JSON en CobrarPuntos:", error);
      }

      if (response.status === 200) {
        const saldo = payload?.saldo ?? {};
        syncSaldoLocal(estudianteACobrar.id_persona, saldo);
        setEstudianteACobrar((prev) =>
          prev
            ? {
                ...prev,
                credito_total: Number(
                  saldo.credito_total ?? prev.credito_total ?? 0,
                ),
                cobro_credito: Number(
                  saldo.cobro_credito ?? prev.cobro_credito ?? 0,
                ),
              }
            : prev,
        );

        setCobroSuccess(payload?.msg || "Puntos cobrados correctamente.");
        setUltimoMovimientoId(payload?.movimiento ?? null);
        setPuntosACobrar(1);
        setMotivoCobro("");
        return;
      }

      if (response.status === 400) {
        if (payload?.error?.code === "SALDO_INSUFICIENTE") {
          setCobroError(
            payload?.msg || "El saldo del estudiante es insuficiente.",
          );
        } else {
          setCobroError(payload?.msg || "Verifica los datos enviados.");
        }
        return;
      }

      if (response.status === 403) {
        setCobroError("No tienes permisos para realizar cobros.");
        return;
      }

      if (response.status === 404) {
        setCobroError("El estudiante no existe o está inactivo.");
        return;
      }

      setCobroError(payload?.msg || "Ocurrió un error al cobrar los puntos.");
    } catch (error) {
      console.error("Error en el cobro:", error);
      setCobroError("No se pudo procesar el cobro. Intenta nuevamente.");
    } finally {
      setCobroLoading(false);
    }
  };
  const navegarHistorial = () => {
    if (!estudianteACobrar) return;
    const params = new URLSearchParams({
      id_estudiante: estudianteACobrar.id_persona,
    });
    if (ultimoMovimientoId) {
      params.set("movimiento", ultimoMovimientoId);
    }
    navigate(`/creditos?${params.toString()}`);
  };
  const renderNavbar = () => {
    switch (rol) {
      case "administrador":
        return <Navbar />;
      case "estudiante":
        return <NavbarE />;
      case "tutor":
        return <NavbarT />;
      default:
        alert("Tu sesión ha expirado");
        localStorage.clear();
        navigate("/");
        return null;
    }
  };

  const navigate = useNavigate();
  const columns = [
    "ID",
    "Nombre",
    "DNI",
    "Email",
    "Semestre",
    "Puntos CEDHI",
    "Acciones",
  ];

  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/admin/IntMostrarEstudiantes`, {
      method: "GET",
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Datos iniciales:", data);
        setData(data);
        setFilteredData(data);
      })
      .catch((error) => {
        console.error("Error al obtener actividades:", error);
      });
  }, []);

  const handleSearchByDni = () => {
    if (!searchTerm.trim()) {
      alert("Ingresa un DNI para buscar.");
      return;
    }

    fetch(
      `${import.meta.env.VITE_API_URL}/api/admin/DatosEstudiante?dni=${searchTerm}`,
      {
        method: "GET",
        credentials: "include",
      },
    )
      .then((response) => response.json())
      .then((data) => {
        console.log("Resultado de búsqueda:", data);
        setFilteredData([data]);
      })
      .catch((error) => {
        console.error("Error al buscar estudiante:", error);
      });
  };
  const handleDelete = (id_persona) => {
    if (!window.confirm("¿Seguro que deseas eliminar este estudiante?")) return;

    fetch(
      `${import.meta.env.VITE_API_URL}/api/admin/EliminarEstudiante?id_persona=${id_persona}`,
      {
        method: "DELETE",
        credentials: "include",
      },
    )
      .then((response) => {
        if (response.ok) {
          setData((prev) =>
            prev.filter((estudiante) => estudiante.id_persona !== id_persona),
          );
          setFilteredData((prev) =>
            prev.filter((estudiante) => estudiante.id_persona !== id_persona),
          );
          alert("Estudiante eliminado exitosamente.");
        } else {
          alert("Error al eliminar estudiante.");
        }
      })
      .catch((error) => {
        console.error("Error en la eliminación:", error);
        alert("Error al eliminar estudiante.");
      });
  };
  const getColor = (Puntos_CEDHI) => {
    if (Puntos_CEDHI >= 90) return "#10B981"; // verde
    if (Puntos_CEDHI >= 75) return "#FBBF24"; // amarillo
    return "#EF4444"; // rojo
  };

  const customRender = (col, row) => {
    switch (col) {
      case "Nombre":
        return `${row.nombre_persona} ${row.apellido}`;
      case "DNI":
        return row.dni;
      case "Email":
        return row.email;
      case "Semestre":
        return row.semestre || "-";
      case "ID":
        return row.id_persona;
      case "Puntos CEDHI":
        return (
          <span style={{ color: getColor(row.credito_total ?? 0) }}>
            {row.credito_total ?? 0}
          </span>
        );
      case "Acciones":
        return (
          <div className="action-buttons">
            <button
              className="action-button"
              onClick={() => {
                setSelectedStudent(row);
                setIsEditing(true);
              }}
            >
              <img
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQCQKSXUQPazM3iiWHvTZs0zXzcgFzYXlJfKQ&s"
                alt="Editar"
              />
            </button>
            <button
              className="action-button"
              onClick={() => handleDelete(row.id_persona)}
            >
              <img
                src="https://media.istockphoto.com/id/928418914/es/vector/bote-de-basura-basurero-icono-de-la-papelera.jpg?s=612x612&w=0&k=20&c=rBQCvIJdlIUOaYlpEK_86WD3i7wsyLIQ6C1tjYxrTTQ="
                alt="Eliminar"
              />
            </button>
            <button
              className="action-button"
              onClick={() => handleCobrarPuntos(row.id_persona)}
            >
              <img
                src="https://cdn-icons-png.flaticon.com/512/2489/2489756.png"
                alt="Cobrar Puntos"
                title="Cobrar Puntos"
              />
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  const puntosNumero = Number(puntosACobrar);
  const puntosValidos = Number.isFinite(puntosNumero) && puntosNumero > 0;
  const motivoValido = motivoCobro.trim().length >= 5;

  return (
    <div
      className={`estudiantes-container ${navbarCollapsed ? "navbar-collapsed" : ""}`}
    >
      {renderNavbar()}
      <div className="estudiantes-content">
        {/* Header */}
        <div className="estudiantes-header">
          <h1 className="estudiantes-title">Estudiantes</h1>
          <Button
            text="Crear Estudiante"
            styleType="black"
            onClick={() => navigate("/create_estudiante")}
          />
        </div>

        {/* Búsqueda + filtros */}
        <div className="actividades-search">
          <div className="search-container">
            <div className={"date-field"}>
              <TextField
                placeholder="Buscar por DNI"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button
              text="Buscar"
              styleType="black"
              onClick={handleSearchByDni}
            />
          </div>
        </div>
        {isEditing && selectedStudent && (
          <div className="edit-estudiante-container">
            <h1 className="create-estudiante-title">Editar Estudiante</h1>
            <h3 className="create-estudiante-subtitle">
              Modifica los datos del estudiante seleccionado
            </h3>

            <form
              onSubmit={(e) => {
                e.preventDefault();

                fetch(
                  `${import.meta.env.VITE_API_URL}/api/admin/ActulizarEstudiante`,
                  {
                    method: "PUT",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify(selectedStudent),
                  },
                )
                  .then((res) => {
                    if (res.ok) {
                      alert("Estudiante actualizado correctamente.");
                      setIsEditing(false);
                      window.location.reload();
                    } else {
                      alert("Error al actualizar.");
                    }
                  })
                  .catch((err) => {
                    console.error("Error en la actualización:", err);
                    alert("Error en la actualización.");
                  });
              }}
            >
              <div className="info-container">
                <h2 className="info-title">Información Personal</h2>
                <p className="info-subtitle">
                  Actualiza los datos personales del estudiante
                </p>
                <div className="info-grid">
                  <div className="input-field">
                    <label htmlFor="dni">DNI:</label>
                    <TextField
                      id="dni"
                      placeholder="DNI"
                      value={selectedStudent.dni}
                      onChange={(e) =>
                        setSelectedStudent({
                          ...selectedStudent,
                          dni: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="input-field">
                    <label htmlFor="nombre">Nombre:</label>
                    <TextField
                      id="nombre"
                      placeholder="Nombre"
                      value={selectedStudent.nombre_persona}
                      onChange={(e) =>
                        setSelectedStudent({
                          ...selectedStudent,
                          nombre_persona: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="input-field">
                    <label htmlFor="Apellido">Apellido:</label>
                    <TextField
                      placeholder="Apellido"
                      value={selectedStudent.apellido}
                      onChange={(e) =>
                        setSelectedStudent({
                          ...selectedStudent,
                          apellido: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="input-field">
                    <label htmlFor="Correo Electrónico">
                      Correo Electrónico:
                    </label>
                    <TextField
                      placeholder="Correo Electrónico"
                      type="email"
                      value={selectedStudent.email}
                      onChange={(e) =>
                        setSelectedStudent({
                          ...selectedStudent,
                          email: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="input-field">
                    <label htmlFor="Contraseña">Contraseña:</label>
                    <TextField
                      placeholder="Contraseña"
                      type="password"
                      value={selectedStudent.password || ""}
                      onChange={(e) =>
                        setSelectedStudent({
                          ...selectedStudent,
                          password: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="info-container">
                <h2 className="info-title">Detalles Académicos</h2>
                <p className="info-subtitle">
                  Actualiza la información académica del estudiante
                </p>
                <div className="info-grid">
                  <div className="input-field">
                    <label htmlFor="semestre">Semestre:</label>
                    <TextField
                      id="semestre"
                      placeholder="Semestre"
                      value={selectedStudent.semestre}
                      onChange={(e) =>
                        setSelectedStudent({
                          ...selectedStudent,
                          semestre: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="input-field">
                    <label htmlFor="credito">Crédito Total:</label>
                    <TextField
                      id="credito"
                      placeholder="Crédito Total"
                      type="number"
                      value={selectedStudent.credito_total}
                      onChange={(e) =>
                        setSelectedStudent({
                          ...selectedStudent,
                          credito_total: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="input-field">
                    <label htmlFor="cobro">Cobro Crédito:</label>
                    <TextField
                      id="cobro"
                      placeholder="Cobro Crédito"
                      type="number"
                      value={selectedStudent.cobro_credito}
                      onChange={(e) =>
                        setSelectedStudent({
                          ...selectedStudent,
                          cobro_credito: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="input-field">
                    <label htmlFor="carrera">Carrera:</label>
                    <TextField
                      id="carrera"
                      placeholder="Carrera"
                      value={selectedStudent.carrera}
                      onChange={(e) =>
                        setSelectedStudent({
                          ...selectedStudent,
                          carrera: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              <div
                style={{ display: "flex", gap: "1rem", marginBottom: "2rem" }}
              >
                <button type="submit" className="btn-primary">
                  Guardar Cambios
                </button>
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setIsEditing(false)}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}
        {showCobrarForm && estudianteACobrar && (
          <div className="cobrar-puntos-container">
            <h2>Cobrar Puntos</h2>
            <div className="cobrar-info">
              <p>
                Estudiante:{" "}
                <strong>
                  {estudianteACobrar.nombre_persona}{" "}
                  {estudianteACobrar.apellido}
                </strong>
              </p>
              <p>
                Puntos disponibles:{" "}
                <strong>{estudianteACobrar.cobro_credito}</strong>
              </p>
              <p>
                Crédito total:{" "}
                <strong>{estudianteACobrar.credito_total ?? 0}</strong>
              </p>
            </div>

            <div className="cobrar-form">
              <TextField
                type="number"
                placeholder="Puntos a cobrar"
                value={puntosACobrar}
                onChange={(e) => setPuntosACobrar(e.target.value)}
                min="1"
                max={estudianteACobrar.cobro_credito}
              />
              <TextField
                type="text"
                placeholder="Motivo del cobro"
                value={motivoCobro}
                onChange={(e) => setMotivoCobro(e.target.value)}
                minLength={5}
              />
              {cobroError && <p className="error-message">{cobroError}</p>}
              {cobroSuccess && (
                <div className="success-message">
                  <p>{cobroSuccess}</p>
                  <div className="success-actions">
                    <span>
                      Saldo actualizado: {estudianteACobrar.credito_total ?? 0}{" "}
                      créditos totales / {estudianteACobrar.cobro_credito ?? 0}{" "}
                      disponibles
                    </span>
                    <Button
                      text={
                        ultimoMovimientoId ? "Ver movimiento" : "Ver historial"
                      }
                      styleType="white"
                      onClick={navegarHistorial}
                    />
                  </div>
                </div>
              )}

              <div className="cobrar-buttons">
                <Button
                  text={cobroLoading ? "Procesando..." : "Confirmar Cobro"}
                  styleType="black"
                  onClick={procesarCobroPuntos}
                  disabled={cobroLoading || !puntosValidos || !motivoValido}
                />
                <Button
                  text="Cancelar"
                  styleType="danger"
                  onClick={cerrarFormularioCobro}
                />
              </div>
            </div>
          </div>
        )}
        <div className="historial-creditos-container">
          <h2>Historial de Créditos</h2>
          {historialDni ? (
            <div className="historial-grid">
              <HistorialTabla
                title="Créditos obtenidos"
                state={asistenciaHist}
                emptyLabel="Sin asistencias registradas."
              />
              <HistorialTabla
                title="Bonos"
                state={bonusHist}
                emptyLabel="Sin bonificaciones registradas."
              />
              <HistorialTabla
                title="Cobros"
                state={cobroHist}
                emptyLabel="Sin cobros registrados."
              />
            </div>
          ) : (
            <p className="historial-placeholder">
              Selecciona un estudiante para ver su historial de créditos.
            </p>
          )}
        </div>
        {/* Tabla */}
        <div className="estudiantes-table">
          <table style={{ width: "100%" }}>
            <thead>
              <tr className="table-header">
                {columns.map((col) => (
                  <th key={col} className="table-cell">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredData.map((row, idx) => (
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
  );
};

export default Estudiante;
