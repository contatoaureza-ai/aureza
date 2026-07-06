import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { BO_COLORS, fontSans } from "../theme/tokens";

export default function ProtectedRoute({ role, children }) {
  const { session, role: userRole, loading } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: BO_COLORS.surface,
          color: BO_COLORS.textMuted,
          fontFamily: fontSans,
          fontSize: "0.9rem",
        }}
      >
        Carregando...
      </div>
    );
  }

  if (!session) return <Navigate to="/login" replace />;

  if (role && userRole !== role) {
    const fallback = userRole === "admin" ? "/admin" : "/catalogo";
    return <Navigate to={fallback} replace />;
  }

  return children;
}
