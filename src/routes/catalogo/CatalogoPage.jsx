import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../../context/AuthContext";
import { BO_COLORS, fontSerif, fontSans } from "../../theme/tokens";
import TerrenoMap from "../../components/map/TerrenoMap";

const STATUS_LABEL = { bruto: "Bruto", estudo: "Em estudo", pronto: "Pronto" };

function fmtM2(v) {
  return v ? Number(v).toLocaleString("pt-BR") + " m²" : "—";
}
function fmtBRL(v) {
  return v ? "R$ " + Number(v).toLocaleString("pt-BR") : "Sob consulta";
}

export default function CatalogoPage() {
  const { role, signOut } = useAuth();
  const [items, setItems] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      const { data, error: fetchError } = await supabase
        .from("terrenos_publicos")
        .select("*")
        .order("nome", { ascending: true });
      if (fetchError) setError(fetchError.message);
      else {
        setItems(data || []);
        if (data && data.length) setSelectedId(data[0].id);
      }
      setLoading(false);
    })();
  }, []);

  const selected = items.find((i) => i.id === selectedId);

  return (
    <div style={{ minHeight: "100vh", background: BO_COLORS.surface }}>
      <header
        style={{
          background: BO_COLORS.ink,
          color: BO_COLORS.surface,
          padding: "18px 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
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
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          {role === "admin" && (
            <Link to="/admin" style={{ fontFamily: fontSans, fontSize: "0.85rem", color: BO_COLORS.surface }}>
              Voltar ao painel
            </Link>
          )}
          <button
            onClick={() => signOut()}
            style={{
              fontFamily: fontSans,
              fontSize: "0.8rem",
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.2)",
              color: BO_COLORS.surface,
              padding: "8px 14px",
              borderRadius: "3px",
              cursor: "pointer",
            }}
          >
            Sair
          </button>
        </div>
      </header>

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "36px 24px" }}>
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
          Catálogo Aureza
        </p>
        <h1 style={{ fontFamily: fontSerif, fontSize: "1.8rem", color: BO_COLORS.ink, marginBottom: "28px" }}>
          Terrenos disponíveis na Região dos Lagos
        </h1>

        {loading && <p style={{ fontFamily: fontSans, color: BO_COLORS.textMuted }}>Carregando...</p>}
        {error && <p style={{ fontFamily: fontSans, color: BO_COLORS.danger }}>{error}</p>}

        {!loading && !items.length && (
          <p style={{ fontFamily: fontSans, color: BO_COLORS.textMuted }}>
            Nenhum terreno publicado no catálogo por enquanto.
          </p>
        )}

        {!loading && items.length > 0 && (
          <div className="aureza-catalogo-grid" style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: "24px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {items.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedId(item.id)}
                  style={{
                    background: BO_COLORS.surfaceAlt,
                    border: "1px solid " + (item.id === selectedId ? BO_COLORS.accent : BO_COLORS.border),
                    borderRadius: "3px",
                    padding: "14px 16px",
                    cursor: "pointer",
                  }}
                >
                  <div style={{ fontFamily: fontSerif, fontSize: "1rem", color: BO_COLORS.ink }}>
                    {item.nome || "Terreno"}
                  </div>
                  <div style={{ fontFamily: fontSans, fontSize: "0.78rem", color: BO_COLORS.textMuted }}>
                    {[item.bairro, item.municipio].filter(Boolean).join(", ") || "Localização a definir"}
                  </div>
                </div>
              ))}
            </div>

            {selected && (
              <div>
                <div style={{ marginBottom: "8px" }}>
                  <h2 style={{ fontFamily: fontSerif, fontSize: "1.5rem", color: BO_COLORS.ink, margin: 0 }}>
                    {selected.nome || "Terreno"}
                  </h2>
                  <p style={{ fontFamily: fontSans, fontSize: "0.85rem", color: BO_COLORS.textMuted }}>
                    {[selected.bairro, selected.municipio].filter(Boolean).join(", ") || "Localização a definir"} ·{" "}
                    {STATUS_LABEL[selected.status]}
                  </p>
                </div>

                <div
                  style={{
                    background: BO_COLORS.surfaceAlt,
                    border: "1px solid " + BO_COLORS.border,
                    borderRadius: "3px",
                    padding: "16px",
                    marginBottom: "16px",
                  }}
                >
                  <TerrenoMap
                    value={{
                      lat: selected.lat,
                      lng: selected.lng,
                      poligono: selected.poligono,
                      area_poligono_m2: selected.area_poligono_m2,
                    }}
                    editable={false}
                  />
                </div>

                <div
                  style={{
                    background: BO_COLORS.surfaceAlt,
                    border: "1px solid " + BO_COLORS.border,
                    borderRadius: "3px",
                    padding: "20px",
                  }}
                >
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                    <div>
                      <div style={{ fontFamily: fontSans, fontSize: "0.75rem", color: BO_COLORS.textMuted }}>
                        Superfície
                      </div>
                      <div style={{ fontFamily: fontSans, fontSize: "1rem", color: BO_COLORS.ink }}>
                        {fmtM2(selected.area_poligono_m2 || selected.superficie_m2)}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontFamily: fontSans, fontSize: "0.75rem", color: BO_COLORS.textMuted }}>
                        Preço
                      </div>
                      <div style={{ fontFamily: fontSans, fontSize: "1rem", color: BO_COLORS.ink }}>
                        {fmtBRL(selected.preco_pedido)}
                      </div>
                    </div>
                  </div>
                  <div style={{ fontFamily: fontSans, fontSize: "0.75rem", color: BO_COLORS.textMuted, marginBottom: "4px" }}>
                    Descrição
                  </div>
                  <p style={{ fontFamily: fontSans, fontSize: "0.9rem", color: BO_COLORS.ink, lineHeight: 1.6, margin: 0 }}>
                    {selected.resumo_publico || "Sem descrição adicional."}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 720px) {
          .aureza-catalogo-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
