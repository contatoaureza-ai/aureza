import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { BO_COLORS, fontSerif, fontSans } from "../../theme/tokens";

const STATUS_LABEL = { bruto: "Bruto", estudo: "Em estudo", pronto: "Pronto" };
const STATUS_COLOR = {
  bruto: BO_COLORS.statusBruto,
  estudo: BO_COLORS.statusEstudo,
  pronto: BO_COLORS.statusPronto,
};

export default function TerrenosListPage() {
  const [terrenos, setTerrenos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const load = async () => {
    setLoading(true);
    const { data, error: fetchError } = await supabase
      .from("terrenos")
      .select("*")
      .order("updated_at", { ascending: false });
    if (fetchError) setError(fetchError.message);
    else setTerrenos(data || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!confirm("Excluir este terreno definitivamente?")) return;
    await supabase.from("terrenos").delete().eq("id", id);
    load();
  };

  return (
    <div>
      <p
        style={{
          fontFamily: fontSans,
          fontSize: "0.75rem",
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: BO_COLORS.textMuted,
          marginBottom: "8px",
        }}
      >
        Meus terrenos
      </p>
      <h1 style={{ fontFamily: fontSerif, fontSize: "1.8rem", color: BO_COLORS.ink, marginBottom: "28px" }}>
        Fichas de terrenos
      </h1>

      {loading && <p style={{ fontFamily: fontSans, color: BO_COLORS.textMuted }}>Carregando...</p>}
      {error && <p style={{ fontFamily: fontSans, color: BO_COLORS.danger }}>{error}</p>}

      {!loading && !terrenos.length && (
        <div
          style={{
            border: "1px dashed " + BO_COLORS.border,
            borderRadius: "3px",
            padding: "24px",
            fontFamily: fontSans,
            color: BO_COLORS.textMuted,
            fontSize: "0.9rem",
          }}
        >
          Nenhum terreno ainda.{" "}
          <Link to="/admin/terrenos/novo" style={{ color: BO_COLORS.accentDark }}>
            Clique aqui para criar o primeiro.
          </Link>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {terrenos.map((t) => (
          <div
            key={t.id}
            onClick={() => navigate("/admin/terrenos/" + t.id)}
            style={{
              background: BO_COLORS.surfaceAlt,
              border: "1px solid " + BO_COLORS.border,
              borderRadius: "3px",
              padding: "16px 20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "16px",
              cursor: "pointer",
            }}
          >
            <div>
              <div style={{ fontFamily: fontSerif, fontSize: "1.1rem", color: BO_COLORS.ink }}>
                {t.nome || "Sem nome"}
              </div>
              <div style={{ fontFamily: fontSans, fontSize: "0.8rem", color: BO_COLORS.textMuted }}>
                {[t.bairro, t.municipio].filter(Boolean).join(", ") || "Localização não definida"}
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
              {t.publicado && (
                <span
                  style={{
                    fontFamily: fontSans,
                    fontSize: "0.7rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    padding: "3px 8px",
                    borderRadius: "20px",
                    background: "rgba(122,155,142,0.25)",
                    color: "#3f6154",
                  }}
                >
                  Publicado
                </span>
              )}
              <span
                style={{
                  fontFamily: fontSans,
                  fontSize: "0.7rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  padding: "3px 8px",
                  borderRadius: "20px",
                  color: "#fff",
                  background: STATUS_COLOR[t.status],
                }}
              >
                {STATUS_LABEL[t.status]}
              </span>
              <button
                onClick={(e) => handleDelete(t.id, e)}
                style={{
                  fontFamily: fontSans,
                  fontSize: "0.75rem",
                  background: "transparent",
                  border: "1px solid " + BO_COLORS.border,
                  color: BO_COLORS.danger,
                  borderRadius: "3px",
                  padding: "6px 10px",
                  cursor: "pointer",
                }}
              >
                Excluir
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
