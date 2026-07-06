import { Link, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { BO_COLORS, fontSerif, fontSans } from "../../theme/tokens";

export default function AdminLayout() {
  const { user, signOut } = useAuth();

  return (
    <div className="aureza-admin-shell" style={{ minHeight: "100vh", display: "flex" }}>
      <aside
        style={{
          width: "260px",
          flexShrink: 0,
          background: BO_COLORS.ink,
          color: BO_COLORS.surface,
          display: "flex",
          flexDirection: "column",
          padding: "28px 20px",
        }}
      >
        <Link
          to="/"
          style={{
            fontFamily: fontSerif,
            fontSize: "1.3rem",
            color: BO_COLORS.surfaceAlt,
            letterSpacing: "0.12em",
            textDecoration: "none",
          }}
        >
          AURE<span style={{ color: BO_COLORS.accent }}>Z</span>A
        </Link>
        <p
          style={{
            fontFamily: fontSans,
            fontSize: "0.7rem",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: BO_COLORS.textFaint,
            margin: "6px 0 32px",
          }}
        >
          Estudos Fundiários
        </p>

        <nav style={{ display: "flex", flexDirection: "column", gap: "4px", marginBottom: "24px" }}>
          <NavLink
            to="/admin"
            end
            style={({ isActive }) => ({
              fontFamily: fontSans,
              fontSize: "0.9rem",
              padding: "10px 12px",
              borderRadius: "3px",
              textDecoration: "none",
              color: isActive ? BO_COLORS.ink : BO_COLORS.surface,
              background: isActive ? BO_COLORS.accent : "transparent",
            })}
          >
            Meus terrenos
          </NavLink>
          <NavLink
            to="/catalogo"
            style={({ isActive }) => ({
              fontFamily: fontSans,
              fontSize: "0.9rem",
              padding: "10px 12px",
              borderRadius: "3px",
              textDecoration: "none",
              color: isActive ? BO_COLORS.ink : BO_COLORS.surface,
              background: isActive ? BO_COLORS.accent : "transparent",
            })}
          >
            Catálogo público
          </NavLink>
        </nav>

        <Link
          to="/admin/terrenos/novo"
          style={{
            fontFamily: fontSans,
            fontSize: "0.85rem",
            fontWeight: 600,
            textAlign: "center",
            textDecoration: "none",
            background: BO_COLORS.accent,
            color: BO_COLORS.ink,
            padding: "12px 16px",
            borderRadius: "3px",
          }}
        >
          + Novo terreno
        </Link>

        <div style={{ marginTop: "auto", paddingTop: "24px", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
          <p
            style={{
              fontFamily: fontSans,
              fontSize: "0.75rem",
              color: BO_COLORS.textFaint,
              marginBottom: "10px",
              wordBreak: "break-all",
            }}
          >
            {user ? user.email : ""}
          </p>
          <button
            onClick={() => signOut()}
            style={{
              width: "100%",
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.2)",
              color: BO_COLORS.surface,
              padding: "8px 12px",
              fontFamily: fontSans,
              fontSize: "0.8rem",
              borderRadius: "3px",
              cursor: "pointer",
            }}
          >
            Sair
          </button>
        </div>
      </aside>

      <main style={{ flex: 1, background: BO_COLORS.surface, padding: "36px 40px", overflowY: "auto" }}>
        <Outlet />
      </main>

      <style>{`
        @media (max-width: 860px) {
          .aureza-admin-shell { flex-direction: column; }
          .aureza-admin-shell > aside { width: 100%; }
        }
      `}</style>
    </div>
  );
}
