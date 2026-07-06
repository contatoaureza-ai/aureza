import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabaseClient";
import { fontSerif, fontSans } from "../theme/tokens";

const COLORS = {
  black: "#0A0A0A",
  cream: "#FAF8F4",
  gold: "#C9A14A",
  goldLight: "#dab565",
  grayDark: "#3a3528",
  textOnBlack: "#b8b2a0",
  textOnBlackMuted: "#8d8772",
};

export default function LoginPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { data, error: signInError } = await signIn(email, password);
    if (signInError) {
      setError("E-mail ou senha incorretos.");
      setLoading(false);
      return;
    }
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single();
    navigate(profile && profile.role === "admin" ? "/admin" : "/catalogo");
  };

  const inputStyle = {
    width: "100%",
    background: "transparent",
    borderBottom: "1px solid " + COLORS.grayDark,
    padding: "12px 4px",
    color: COLORS.cream,
    outline: "none",
    fontFamily: fontSans,
    fontSize: "0.95rem",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: COLORS.black,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <div style={{ width: "100%", maxWidth: "360px" }}>
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <Link
            to="/"
            style={{
              fontFamily: fontSerif,
              fontSize: "1.6rem",
              color: COLORS.cream,
              letterSpacing: "0.15em",
              textDecoration: "none",
            }}
          >
            AURE<span style={{ color: COLORS.gold }}>Z</span>A
          </Link>
          <p
            style={{
              fontFamily: fontSans,
              color: COLORS.textOnBlackMuted,
              fontSize: "0.75rem",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              marginTop: "10px",
            }}
          >
            Estudos Fundiários
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div>
            <label
              style={{
                display: "block",
                fontFamily: fontSans,
                fontSize: "0.75rem",
                color: COLORS.textOnBlackMuted,
                marginBottom: "4px",
              }}
            >
              E-mail
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyle}
              placeholder="seu@email.com"
              required
              autoComplete="email"
            />
          </div>
          <div>
            <label
              style={{
                display: "block",
                fontFamily: fontSans,
                fontSize: "0.75rem",
                color: COLORS.textOnBlackMuted,
                marginBottom: "4px",
              }}
            >
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={inputStyle}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </div>

          {error && (
            <p style={{ fontFamily: fontSans, fontSize: "0.85rem", color: "#e0876f", margin: 0 }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              background: COLORS.gold,
              color: COLORS.black,
              border: "none",
              padding: "14px 28px",
              fontFamily: fontSans,
              fontSize: "0.9rem",
              letterSpacing: "0.02em",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.6 : 1,
              marginTop: "8px",
            }}
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
