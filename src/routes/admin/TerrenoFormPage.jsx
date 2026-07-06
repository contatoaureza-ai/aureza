import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../../context/AuthContext";
import { BO_COLORS, fontSerif, fontSans } from "../../theme/tokens";
import TerrenoMap from "../../components/map/TerrenoMap";

const emptyForm = {
  nome: "",
  municipio: "",
  bairro: "",
  endereco: "",
  lat: null,
  lng: null,
  poligono: null,
  area_poligono_m2: null,
  superficie_m2: "",
  preco_pedido: "",
  matricula: "",
  zoneamento: "",
  infra_agua: false,
  infra_luz: false,
  infra_esgoto: false,
  infra_asfalto: false,
  notas: "",
  analise: "",
  status: "bruto",
  publicado: false,
  exibir_preco: false,
  resumo_publico: "",
};

export default function TerrenoFormPage() {
  const { id } = useParams();
  const isNew = !id;
  const navigate = useNavigate();
  const { user } = useAuth();

  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isNew) return;
    (async () => {
      setLoading(true);
      const { data, error: fetchError } = await supabase.from("terrenos").select("*").eq("id", id).single();
      if (fetchError) setError(fetchError.message);
      else setForm({ ...emptyForm, ...data });
      setLoading(false);
    })();
  }, [id, isNew]);

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  const handleChange = (e) => {
    const { name, value } = e.target;
    set({ [name]: value });
  };

  const handleCheck = (e) => {
    const { name, checked } = e.target;
    set({ [name]: checked });
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    const payload = { ...form };
    delete payload.id;
    delete payload.created_at;
    delete payload.updated_at;

    const numericFields = ["superficie_m2", "preco_pedido", "area_poligono_m2", "lat", "lng"];
    numericFields.forEach((field) => {
      if (payload[field] === "" || payload[field] === undefined) payload[field] = null;
    });

    let resultError;
    if (isNew) {
      payload.created_by = user.id;
      const { error: insertError } = await supabase.from("terrenos").insert(payload);
      resultError = insertError;
    } else {
      const { error: updateError } = await supabase.from("terrenos").update(payload).eq("id", id);
      resultError = updateError;
    }

    setSaving(false);
    if (resultError) {
      setError(resultError.message);
      return;
    }
    navigate("/admin");
  };

  const handleDelete = async () => {
    if (!confirm("Excluir este terreno definitivamente?")) return;
    await supabase.from("terrenos").delete().eq("id", id);
    navigate("/admin");
  };

  if (loading) {
    return <p style={{ fontFamily: fontSans, color: BO_COLORS.textMuted }}>Carregando...</p>;
  }

  const labelStyle = {
    display: "block",
    fontFamily: fontSans,
    fontSize: "0.75rem",
    fontWeight: 600,
    color: BO_COLORS.ink,
    marginBottom: "6px",
  };
  const inputStyle = {
    width: "100%",
    padding: "9px 10px",
    border: "1px solid " + BO_COLORS.border,
    borderRadius: "3px",
    background: BO_COLORS.surfaceAlt,
    fontFamily: fontSans,
    fontSize: "0.9rem",
    color: BO_COLORS.ink,
  };
  const sectionStyle = {
    background: BO_COLORS.surfaceAlt,
    border: "1px solid " + BO_COLORS.border,
    borderRadius: "3px",
    padding: "22px",
    marginBottom: "20px",
  };
  const sectionTitleStyle = {
    fontFamily: fontSans,
    fontSize: "0.75rem",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: BO_COLORS.ink,
    marginBottom: "16px",
    paddingBottom: "10px",
    borderBottom: "1px solid " + BO_COLORS.border,
  };
  const fieldStyle = { marginBottom: "14px" };
  const gridStyle = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" };

  return (
    <div style={{ maxWidth: "760px" }}>
      <Link
        to="/admin"
        style={{ fontFamily: fontSans, fontSize: "0.8rem", color: BO_COLORS.textMuted, textDecoration: "none" }}
      >
        ← Voltar
      </Link>
      <h1 style={{ fontFamily: fontSerif, fontSize: "1.8rem", color: BO_COLORS.ink, margin: "8px 0 24px" }}>
        {isNew ? "Novo terreno" : form.nome || "Editar terreno"}
      </h1>

      {error && <p style={{ fontFamily: fontSans, color: BO_COLORS.danger, marginBottom: "16px" }}>{error}</p>}

      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "20px" }}>
        {["bruto", "estudo", "pronto"].map((s) => (
          <button
            key={s}
            onClick={() => set({ status: s })}
            style={{
              fontFamily: fontSans,
              fontSize: "0.8rem",
              padding: "7px 14px",
              borderRadius: "20px",
              cursor: "pointer",
              border: "1px solid " + BO_COLORS.border,
              background: form.status === s ? BO_COLORS.ink : BO_COLORS.surfaceAlt,
              color: form.status === s ? "#fff" : BO_COLORS.ink,
            }}
          >
            {s === "bruto" ? "Bruto" : s === "estudo" ? "Em estudo" : "Pronto"}
          </button>
        ))}
      </div>

      <div style={sectionStyle}>
        <h4 style={sectionTitleStyle}>Localização</h4>
        <TerrenoMap
          value={{ lat: form.lat, lng: form.lng, poligono: form.poligono, area_poligono_m2: form.area_poligono_m2 }}
          onChange={(patch) => {
            set({
              ...patch,
              ...(patch.area_poligono_m2 != null ? { superficie_m2: Math.round(patch.area_poligono_m2) } : {}),
            });
          }}
          editable
        />
      </div>

      <div style={sectionStyle}>
        <h4 style={sectionTitleStyle}>Dados gerais</h4>
        <div style={gridStyle}>
          <div style={fieldStyle}>
            <label style={labelStyle}>Nome / referência interna</label>
            <input name="nome" value={form.nome || ""} onChange={handleChange} style={inputStyle} />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Município</label>
            <input name="municipio" value={form.municipio || ""} onChange={handleChange} style={inputStyle} />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Bairro</label>
            <input name="bairro" value={form.bairro || ""} onChange={handleChange} style={inputStyle} />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Endereço</label>
            <input name="endereco" value={form.endereco || ""} onChange={handleChange} style={inputStyle} />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Superfície (m²)</label>
            <input
              type="number"
              name="superficie_m2"
              value={form.superficie_m2 ?? ""}
              onChange={handleChange}
              style={inputStyle}
            />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Preço pedido (R$)</label>
            <input
              type="number"
              name="preco_pedido"
              value={form.preco_pedido ?? ""}
              onChange={handleChange}
              style={inputStyle}
            />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Matrícula / ITR</label>
            <input name="matricula" value={form.matricula || ""} onChange={handleChange} style={inputStyle} />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Zoneamento</label>
            <input name="zoneamento" value={form.zoneamento || ""} onChange={handleChange} style={inputStyle} />
          </div>
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>Infraestrutura disponível</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", fontFamily: fontSans, fontSize: "0.85rem" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <input type="checkbox" name="infra_agua" checked={!!form.infra_agua} onChange={handleCheck} /> Água
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <input type="checkbox" name="infra_luz" checked={!!form.infra_luz} onChange={handleCheck} /> Luz
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <input type="checkbox" name="infra_esgoto" checked={!!form.infra_esgoto} onChange={handleCheck} /> Esgoto
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <input type="checkbox" name="infra_asfalto" checked={!!form.infra_asfalto} onChange={handleCheck} /> Asfalto
            </label>
          </div>
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>Notas complementares (privado)</label>
          <textarea
            name="notas"
            value={form.notas || ""}
            onChange={handleChange}
            rows={4}
            style={{ ...inputStyle, resize: "vertical" }}
          />
        </div>
      </div>

      <div style={sectionStyle}>
        <h4 style={sectionTitleStyle}>Análise fundiária (privado)</h4>
        <textarea
          name="analise"
          value={form.analise || ""}
          onChange={handleChange}
          rows={6}
          style={{ ...inputStyle, resize: "vertical" }}
        />
      </div>

      <div style={sectionStyle}>
        <h4 style={sectionTitleStyle}>Publicação no catálogo</h4>
        <label style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px", fontFamily: fontSans, fontSize: "0.9rem" }}>
          <input type="checkbox" name="publicado" checked={!!form.publicado} onChange={handleCheck} />
          Publicar este terreno no catálogo
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px", fontFamily: fontSans, fontSize: "0.9rem" }}>
          <input type="checkbox" name="exibir_preco" checked={!!form.exibir_preco} onChange={handleCheck} />
          Exibir preço pedido no catálogo
        </label>
        <div style={fieldStyle}>
          <label style={labelStyle}>Resumo público (visível no catálogo)</label>
          <textarea
            name="resumo_publico"
            value={form.resumo_publico || ""}
            onChange={handleChange}
            rows={3}
            style={{ ...inputStyle, resize: "vertical" }}
          />
        </div>
        <p style={{ fontFamily: fontSans, fontSize: "0.75rem", color: BO_COLORS.textMuted }}>
          Matrícula, notas privadas e análise completa nunca aparecem no catálogo.
        </p>
      </div>

      <div style={{ display: "flex", gap: "10px" }}>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            fontFamily: fontSans,
            fontSize: "0.9rem",
            fontWeight: 600,
            padding: "12px 24px",
            borderRadius: "3px",
            border: "none",
            background: BO_COLORS.ink,
            color: "#fff",
            cursor: saving ? "not-allowed" : "pointer",
            opacity: saving ? 0.6 : 1,
          }}
        >
          {saving ? "Salvando..." : "Salvar ficha"}
        </button>
        {!isNew && (
          <button
            onClick={handleDelete}
            style={{
              fontFamily: fontSans,
              fontSize: "0.9rem",
              padding: "12px 24px",
              borderRadius: "3px",
              border: "1px solid " + BO_COLORS.danger,
              background: "transparent",
              color: BO_COLORS.danger,
              cursor: "pointer",
            }}
          >
            Excluir terreno
          </button>
        )}
      </div>
    </div>
  );
}
