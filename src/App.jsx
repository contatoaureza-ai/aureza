import { useState, useEffect, useRef } from "react";
import {
  MapPin,
  Building2,
  FileCheck,
  TrendingUp,
  Users,
  ChevronRight,
  Mail,
  Phone,
  ArrowRight,
  CheckCircle2,
  Share2,
  ExternalLink,
} from "lucide-react";

// Paleta de cores (estilos inline para garantir renderizacao)
const COLORS = {
  black: "#0A0A0A",
  blackAlt: "#13110d",
  cream: "#FAF8F4",
  gold: "#C9A14A",
  goldLight: "#dab565",
  goldSoft: "#8A7140",
  grayDark: "#3a3528",
  grayMuted: "#4a463a",
  textOnBlack: "#b8b2a0",
  textOnBlackMuted: "#8d8772",
  textOnBlackFaint: "#6e6952",
  navLink: "#d8d3c5",
  divider: "#23201a",
  cardDivider: "#e3ddcc",
};

function useReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

function Reveal({ children, delay, style }) {
  const [ref, visible] = useReveal();
  const d = delay || 0;
  const extra = style || {};
  return (
    <div
      ref={ref}
      style={Object.assign(
        {
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0px)" : "translateY(24px)",
          transition: "opacity 0.7s ease " + d + "ms, transform 0.7s ease " + d + "ms",
        },
        extra
      )}
    >
      {children}
    </div>
  );
}

function TopoMap() {
  const dots = [
    [120, 90],
    [340, 60],
    [480, 180],
    [200, 260],
    [420, 340],
    [90, 350],
  ];
  const lines = [0, 1, 2, 3, 4, 5, 6];
  return (
    <svg viewBox="0 0 600 460" style={{ width: "100%", height: "100%" }} fill="none">
      <defs>
        <linearGradient id="goldFade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={COLORS.gold} stopOpacity="0.9" />
          <stop offset="100%" stopColor={COLORS.gold} stopOpacity="0.15" />
        </linearGradient>
      </defs>
      {lines.map((i) => (
        <path
          key={i}
          d={
            "M " + (20 + i * 8) + " " + (40 + i * 18) +
            " C " + (150 + i * 10) + " " + (10 + i * 22) +
            ", " + (320 - i * 6) + " " + (90 + i * 14) +
            ", " + (470 + i * 6) + " " + (50 + i * 20) +
            " S " + (590 - i * 4) + " " + (160 + i * 10) +
            ", " + (560 - i * 8) + " " + (300 + i * 14)
          }
          stroke="url(#goldFade)"
          strokeWidth={i === 3 ? 1.4 : 0.6}
          opacity={0.85 - i * 0.07}
        />
      ))}
      {dots.map((d, i) => (
        <g key={i}>
          <circle cx={d[0]} cy={d[1]} r={2.5} fill={COLORS.gold} />
          <circle cx={d[0]} cy={d[1]} r={7} stroke={COLORS.gold} strokeWidth={0.5} opacity={0.5} />
        </g>
      ))}
      <line x1="60" y1="400" x2="60" y2="420" stroke={COLORS.gold} strokeWidth="0.6" opacity="0.6" />
      <line x1="60" y1="410" x2="160" y2="410" stroke={COLORS.gold} strokeWidth="0.6" opacity="0.6" />
      <text x="65" y="425" fill={COLORS.gold} fontSize="9" letterSpacing="1" opacity="0.7" fontFamily="monospace">
        22S 42W
      </text>
    </svg>
  );
}

const initialForm = {
  nome: "",
  email: "",
  telefone: "",
  perfil: "Proprietario do terreno",
  localizacao: "",
  area: "",
  valor: "",
  descricao: "",
};

const fontSerif = "Georgia, 'Times New Roman', serif";
const fontSans = "Helvetica, Arial, sans-serif";

export default function App() {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState("idle");
  const [errors, setErrors] = useState({});
  const [menuOpen, setMenuOpen] = useState(false);
  const [hoverState, setHoverState] = useState({});

  const setHover = (key, val) => setHoverState((h) => Object.assign({}, h, { [key]: val }));

  const handleChange = (e) => {
    const name = e.target.name;
    const value = e.target.value;
    setForm((f) => Object.assign({}, f, { [name]: value }));
    if (errors[name]) {
      setErrors((er) => Object.assign({}, er, { [name]: null }));
    }
  };

  const validate = () => {
    const req = ["nome", "email", "telefone", "localizacao", "area", "descricao"];
    const er = {};
    req.forEach((k) => {
      if (!form[k].trim()) er[k] = true;
    });
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
    if (form.email && !emailOk) er.email = true;
    setErrors(er);
    return Object.keys(er).length === 0;
  };

  const handleSubmit = () => {
    const ok = validate();
    if (!ok) return;
    setStatus("loading");
    setTimeout(() => {
      setStatus("success");
    }, 1400);
  };

  const resetForm = () => {
    setForm(initialForm);
    setStatus("idle");
    setErrors({});
  };

  const scrollTo = (id) => {
    setMenuOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const inputStyle = (field) => ({
    width: "100%",
    background: "transparent",
    borderBottom: "1px solid " + (errors[field] ? "#ef4444" : COLORS.grayDark),
    padding: "12px 4px",
    color: COLORS.cream,
    outline: "none",
    fontFamily: fontSans,
    fontSize: "0.95rem",
    transition: "border-color 0.3s ease",
  });

  const navItems = [
    ["Inicio", "hero"],
    ["Quem Somos", "quemsomos"],
    ["Como Funciona", "comofunciona"],
    ["Para Proprietarios", "formulario"],
    ["Para Parceiros", "parceiros"],
    ["Contato", "footer"],
  ];

  const stats = [
    ["+18%", "crescimento populacional na ultima decada"],
    ["R$ 1Bi+", "em royalties petroliferos direcionados a regiao"],
    ["#1", "destino para segunda residencia no RJ"],
    ["100%", "do nosso foco dedicado a Regiao dos Lagos"],
  ];

  const steps = [
    [FileCheck, "Voce submete seu terreno", "Preencha o formulario com as informacoes essenciais do imovel."],
    [TrendingUp, "Analisamos o potencial", "Nossa equipe avalia os aspectos juridicos, urbanisticos e comerciais."],
    [Building2, "Estruturamos o dossie", "Organizamos a documentacao para maximizar o valor de mercado."],
    [Users, "Apresentamos a nossa rede", "Conectamos o ativo a investidores qualificados e selecionados."],
  ];

  return (
    <div
      style={{
        background: COLORS.cream,
        color: COLORS.black,
        fontFamily: fontSans,
        width: "100%",
        minHeight: "100vh",
        overflowX: "hidden",
      }}
    >
      {/* HEADER */}
      <header
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          background: "rgba(10,10,10,0.96)",
          backdropFilter: "blur(6px)",
          borderBottom: "1px solid rgba(201,161,74,0.15)",
        }}
      >
        <div
          style={{
            maxWidth: "1152px",
            margin: "0 auto",
            padding: "0 24px",
            height: "80px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ fontFamily: fontSerif, fontSize: "1.6rem", color: COLORS.cream, letterSpacing: "0.15em" }}>
            AURE<span style={{ color: COLORS.gold }}>Z</span>A
          </div>
          <nav className="aureza-nav-desktop" style={{ display: "none", alignItems: "center", gap: "36px" }}>
            {navItems.map((item) => (
              <button
                key={item[1]}
                onClick={() => scrollTo(item[1])}
                onMouseEnter={() => setHover("nav-" + item[1], true)}
                onMouseLeave={() => setHover("nav-" + item[1], false)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: fontSans,
                  fontSize: "0.875rem",
                  letterSpacing: "0.02em",
                  color: hoverState["nav-" + item[1]] ? COLORS.gold : COLORS.navLink,
                  transition: "color 0.3s ease",
                }}
              >
                {item[0]}
              </button>
            ))}
          </nav>
          <button
            onClick={() => scrollTo("formulario")}
            className="aureza-cta-desktop"
            style={{
              display: "none",
              alignItems: "center",
              gap: "8px",
              border: "1px solid " + COLORS.gold,
              color: COLORS.gold,
              background: "transparent",
              padding: "10px 20px",
              fontSize: "0.875rem",
              fontFamily: fontSans,
              letterSpacing: "0.02em",
              cursor: "pointer",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = COLORS.gold;
              e.currentTarget.style.color = COLORS.black;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = COLORS.gold;
            }}
          >
            Avalie seu Terreno
          </button>
          <button
            className="aureza-burger"
            onClick={() => setMenuOpen((m) => !m)}
            aria-label="Menu"
            style={{ background: "none", border: "none", cursor: "pointer" }}
          >
            <div style={{ width: "24px", display: "flex", flexDirection: "column", gap: "6px" }}>
              <span style={{ display: "block", height: "1px", background: COLORS.gold }} />
              <span style={{ display: "block", height: "1px", background: COLORS.gold }} />
              <span style={{ display: "block", height: "1px", background: COLORS.gold }} />
            </div>
          </button>
        </div>
        {menuOpen && (
          <div
            style={{
              background: COLORS.black,
              borderTop: "1px solid rgba(201,161,74,0.15)",
              padding: "20px 24px",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            {navItems.map((item) => (
              <button
                key={item[1]}
                onClick={() => scrollTo(item[1])}
                style={{
                  background: "none",
                  border: "none",
                  textAlign: "left",
                  padding: "4px 0",
                  color: COLORS.navLink,
                  fontFamily: fontSans,
                  fontSize: "0.95rem",
                  cursor: "pointer",
                }}
              >
                {item[0]}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* HERO */}
      <section
        id="hero"
        style={{
          position: "relative",
          background: COLORS.black,
          paddingTop: "160px",
          paddingBottom: "96px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.4,
            pointerEvents: "none",
            backgroundImage:
              "repeating-linear-gradient(0deg, transparent, transparent 38px, rgba(201,161,74,0.04) 39px), repeating-linear-gradient(90deg, transparent, transparent 38px, rgba(201,161,74,0.04) 39px)",
          }}
        />
        <div
          className="aureza-hero-grid"
          style={{
            maxWidth: "1152px",
            margin: "0 auto",
            padding: "0 24px",
            position: "relative",
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: "48px",
            alignItems: "center",
          }}
        >
          <Reveal>
            <div>
              <p
                style={{
                  fontFamily: fontSans,
                  color: COLORS.gold,
                  fontSize: "0.75rem",
                  letterSpacing: "0.25em",
                  textTransform: "uppercase",
                  marginBottom: "24px",
                }}
              >
                Estruturacao Fundiaria Premium
              </p>
              <h1
                style={{
                  fontFamily: fontSerif,
                  color: COLORS.cream,
                  fontSize: "2.4rem",
                  lineHeight: 1.15,
                  marginBottom: "28px",
                }}
              >
                A referencia em estruturacao de terrenos na Regiao dos Lagos.
              </h1>
              <p
                style={{
                  fontFamily: fontSans,
                  color: COLORS.textOnBlack,
                  fontSize: "1.05rem",
                  lineHeight: 1.7,
                  marginBottom: "40px",
                  maxWidth: "480px",
                }}
              >
                Transformamos terrenos em ativos estruturados, com rigor tecnico e juridico, e os conectamos a
                uma rede seletiva de investidores qualificados.
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
                <button
                  onClick={() => scrollTo("formulario")}
                  onMouseEnter={() => setHover("btn-hero-1", true)}
                  onMouseLeave={() => setHover("btn-hero-1", false)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    background: hoverState["btn-hero-1"] ? COLORS.goldLight : COLORS.gold,
                    color: COLORS.black,
                    border: "none",
                    padding: "14px 28px",
                    fontFamily: fontSans,
                    fontSize: "0.9rem",
                    letterSpacing: "0.02em",
                    cursor: "pointer",
                    transition: "background 0.3s ease",
                  }}
                >
                  Avalie seu Terreno <ArrowRight size={16} />
                </button>
                <button
                  onClick={() => scrollTo("quemsomos")}
                  onMouseEnter={() => setHover("btn-hero-2", true)}
                  onMouseLeave={() => setHover("btn-hero-2", false)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    background: "transparent",
                    color: hoverState["btn-hero-2"] ? COLORS.gold : COLORS.navLink,
                    border: "1px solid " + (hoverState["btn-hero-2"] ? COLORS.gold : COLORS.grayDark),
                    padding: "14px 28px",
                    fontFamily: fontSans,
                    fontSize: "0.9rem",
                    letterSpacing: "0.02em",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                  }}
                >
                  Conheca a Aureza
                </button>
              </div>
            </div>
          </Reveal>
          <Reveal delay={200}>
            <div style={{ aspectRatio: "6/4.6", width: "100%", maxWidth: "420px", margin: "0 auto", opacity: 0.9 }}>
              <TopoMap />
            </div>
          </Reveal>
        </div>
      </section>

      {/* O QUE FAZEMOS */}
      <section id="quemsomos" style={{ background: COLORS.cream, padding: "96px 0" }}>
        <div style={{ maxWidth: "1152px", margin: "0 auto", padding: "0 24px" }}>
          <Reveal>
            <p
              style={{
                fontFamily: fontSans,
                color: COLORS.goldSoft,
                fontSize: "0.75rem",
                letterSpacing: "0.25em",
                textTransform: "uppercase",
                marginBottom: "16px",
              }}
            >
              O que fazemos
            </p>
            <h2 style={{ fontFamily: fontSerif, fontSize: "2rem", marginBottom: "64px", maxWidth: "560px" }}>
              Dois pilares para maximizar o valor do seu ativo fundiario.
            </h2>
          </Reveal>
          <div
            className="aureza-services-grid"
            style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1px", background: COLORS.cardDivider }}
          >
            <Reveal>
              <div style={{ background: COLORS.cream, padding: "40px" }}>
                <Building2 style={{ color: COLORS.gold, marginBottom: "24px" }} size={32} strokeWidth={1.3} />
                <h3 style={{ fontFamily: fontSerif, fontSize: "1.4rem", marginBottom: "16px" }}>
                  Estruturacao de Terrenos
                </h3>
                <p style={{ fontFamily: fontSans, color: COLORS.grayMuted, lineHeight: 1.7 }}>
                  Conduzimos estudos juridicos, urbanisticos e tecnicos completos, transformando um terreno bruto
                  em um ativo estruturado, documentado e pronto para o mercado, elevando seu valor real de
                  negociacao.
                </p>
              </div>
            </Reveal>
            <Reveal delay={150}>
              <div style={{ background: COLORS.cream, padding: "40px" }}>
                <Users style={{ color: COLORS.gold, marginBottom: "24px" }} size={32} strokeWidth={1.3} />
                <h3 style={{ fontFamily: fontSerif, fontSize: "1.4rem", marginBottom: "16px" }}>
                  Intermediacao Especializada
                </h3>
                <p style={{ fontFamily: fontSans, color: COLORS.grayMuted, lineHeight: 1.7 }}>
                  Conectamos seu terreno a uma rede qualificada de investidores, incorporadoras e promotores, com
                  curadoria criteriosa e processo de negociacao conduzido por especialistas.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* POR QUE A REGIAO DOS LAGOS */}
      <section style={{ background: COLORS.black, padding: "96px 0", position: "relative", overflow: "hidden" }}>
        <div style={{ maxWidth: "1152px", margin: "0 auto", padding: "0 24px", position: "relative" }}>
          <Reveal>
            <p
              style={{
                fontFamily: fontSans,
                color: COLORS.gold,
                fontSize: "0.75rem",
                letterSpacing: "0.25em",
                textTransform: "uppercase",
                marginBottom: "16px",
              }}
            >
              Por que a Regiao dos Lagos
            </p>
            <h2
              style={{
                fontFamily: fontSerif,
                color: COLORS.cream,
                fontSize: "2rem",
                marginBottom: "64px",
                maxWidth: "560px",
              }}
            >
              Uma especializacao exclusiva, nao uma cobertura nacional generica.
            </h2>
          </Reveal>
          <div
            className="aureza-stats-grid"
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "40px 32px" }}
          >
            {stats.map((s, i) => (
              <Reveal key={i} delay={i * 100}>
                <div style={{ borderLeft: "1px solid rgba(201,161,74,0.3)", paddingLeft: "20px" }}>
                  <div style={{ fontFamily: fontSerif, color: COLORS.gold, fontSize: "2rem", marginBottom: "12px" }}>
                    {s[0]}
                  </div>
                  <p style={{ fontFamily: fontSans, color: COLORS.textOnBlack, fontSize: "0.875rem", lineHeight: 1.6 }}>
                    {s[1]}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section id="comofunciona" style={{ background: COLORS.cream, padding: "96px 0" }}>
        <div style={{ maxWidth: "1152px", margin: "0 auto", padding: "0 24px" }}>
          <Reveal>
            <p
              style={{
                fontFamily: fontSans,
                color: COLORS.goldSoft,
                fontSize: "0.75rem",
                letterSpacing: "0.25em",
                textTransform: "uppercase",
                marginBottom: "16px",
              }}
            >
              Como Funciona
            </p>
            <h2 style={{ fontFamily: fontSerif, fontSize: "2rem", marginBottom: "64px", maxWidth: "560px" }}>
              Um processo claro, do inicio a conclusao.
            </h2>
          </Reveal>
          <div className="aureza-steps-grid" style={{ display: "grid", gridTemplateColumns: "1fr", gap: "32px" }}>
            {steps.map((s, i) => {
              const Icon = s[0];
              return (
                <Reveal key={i} delay={i * 120}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
                      <span style={{ fontFamily: fontSerif, color: "rgba(201,161,74,0.4)", fontSize: "2.2rem" }}>
                        0{i + 1}
                      </span>
                      <Icon style={{ color: COLORS.gold }} size={22} strokeWidth={1.4} />
                    </div>
                    <h3 style={{ fontFamily: fontSerif, fontSize: "1.1rem", marginBottom: "8px" }}>{s[1]}</h3>
                    <p style={{ fontFamily: fontSans, fontSize: "0.875rem", color: COLORS.grayMuted, lineHeight: 1.6 }}>
                      {s[2]}
                    </p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* FORMULARIO */}
      <section id="formulario" style={{ background: COLORS.black, padding: "96px 0", position: "relative" }}>
        <div style={{ maxWidth: "768px", margin: "0 auto", padding: "0 24px" }}>
          <Reveal>
            <p
              style={{
                fontFamily: fontSans,
                color: COLORS.gold,
                fontSize: "0.75rem",
                letterSpacing: "0.25em",
                textTransform: "uppercase",
                marginBottom: "16px",
                textAlign: "center",
              }}
            >
              Submeta seu Terreno
            </p>
            <h2
              style={{
                fontFamily: fontSerif,
                color: COLORS.cream,
                fontSize: "2rem",
                marginBottom: "16px",
                textAlign: "center",
              }}
            >
              Inicie a avaliacao do seu ativo.
            </h2>
            <p
              style={{
                fontFamily: fontSans,
                color: COLORS.textOnBlackMuted,
                fontSize: "0.875rem",
                textAlign: "center",
                marginBottom: "56px",
              }}
            >
              Atuamos exclusivamente na Regiao dos Lagos, RJ.
            </p>
          </Reveal>

          {status === "success" ? (
            <Reveal>
              <div
                style={{
                  border: "1px solid rgba(201,161,74,0.3)",
                  background: COLORS.blackAlt,
                  padding: "56px 40px",
                  textAlign: "center",
                }}
              >
                <CheckCircle2 style={{ color: COLORS.gold, margin: "0 auto 20px" }} size={42} strokeWidth={1.3} />
                <h3 style={{ fontFamily: fontSerif, color: COLORS.cream, fontSize: "1.5rem", marginBottom: "12px" }}>
                  Solicitacao recebida.
                </h3>
                <p
                  style={{
                    fontFamily: fontSans,
                    color: COLORS.textOnBlack,
                    marginBottom: "32px",
                    maxWidth: "420px",
                    margin: "0 auto 32px",
                    lineHeight: 1.7,
                  }}
                >
                  Nossa equipe analisara as informacoes submetidas e entrara em contato em breve para os
                  proximos passos.
                </p>
                <button
                  onClick={resetForm}
                  style={{
                    fontFamily: fontSans,
                    fontSize: "0.875rem",
                    color: COLORS.gold,
                    border: "1px solid rgba(201,161,74,0.4)",
                    background: "transparent",
                    padding: "12px 24px",
                    cursor: "pointer",
                  }}
                >
                  Enviar outra solicitacao
                </button>
              </div>
            </Reveal>
          ) : (
            <Reveal delay={100}>
              <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
                <div className="aureza-form-row" style={{ display: "grid", gridTemplateColumns: "1fr", gap: "28px" }}>
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
                      Nome completo *
                    </label>
                    <input
                      name="nome"
                      value={form.nome}
                      onChange={handleChange}
                      style={inputStyle("nome")}
                      placeholder="Seu nome"
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
                      E-mail *
                    </label>
                    <input
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      style={inputStyle("email")}
                      placeholder="seu@email.com"
                    />
                  </div>
                </div>

                <div className="aureza-form-row" style={{ display: "grid", gridTemplateColumns: "1fr", gap: "28px" }}>
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
                      Telefone / WhatsApp *
                    </label>
                    <input
                      name="telefone"
                      value={form.telefone}
                      onChange={handleChange}
                      style={inputStyle("telefone")}
                      placeholder="(22) 99999-9999"
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
                      Voce e *
                    </label>
                    <select
                      name="perfil"
                      value={form.perfil}
                      onChange={handleChange}
                      style={{
                        width: "100%",
                        background: COLORS.black,
                        borderBottom: "1px solid " + COLORS.grayDark,
                        border: "none",
                        borderBottomWidth: "1px",
                        borderBottomStyle: "solid",
                        borderBottomColor: COLORS.grayDark,
                        padding: "12px 4px",
                        color: COLORS.cream,
                        outline: "none",
                        fontFamily: fontSans,
                        fontSize: "0.95rem",
                      }}
                    >
                      <option>Proprietario do terreno</option>
                      <option>Intermediario</option>
                      <option>Corretor</option>
                      <option>Outro</option>
                    </select>
                  </div>
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
                    Localizacao do terreno (cidade/bairro) *
                  </label>
                  <input
                    name="localizacao"
                    value={form.localizacao}
                    onChange={handleChange}
                    style={inputStyle("localizacao")}
                    placeholder="Ex: Buzios, Cabo Frio, Sao Pedro da Aldeia..."
                  />
                  <p
                    style={{
                      fontFamily: fontSans,
                      fontSize: "10px",
                      color: COLORS.textOnBlackFaint,
                      marginTop: "6px",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <MapPin size={11} /> Atuamos exclusivamente na Regiao dos Lagos, RJ.
                  </p>
                </div>

                <div className="aureza-form-row" style={{ display: "grid", gridTemplateColumns: "1fr", gap: "28px" }}>
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
                      Area aproximada (m2) *
                    </label>
                    <input
                      name="area"
                      value={form.area}
                      onChange={handleChange}
                      style={inputStyle("area")}
                      placeholder="Ex: 5.000"
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
                      Valor pretendido (R$) - opcional
                    </label>
                    <input
                      name="valor"
                      value={form.valor}
                      onChange={handleChange}
                      style={inputStyle("valor")}
                      placeholder="Ex: 1.200.000"
                    />
                  </div>
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
                    Breve descricao do terreno *
                  </label>
                  <textarea
                    name="descricao"
                    value={form.descricao}
                    onChange={handleChange}
                    rows={4}
                    style={Object.assign({}, inputStyle("descricao"), { resize: "none" })}
                    placeholder="Zoneamento conhecido, infraestrutura disponivel, particularidades..."
                  />
                </div>

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={status === "loading"}
                  onMouseEnter={() => setHover("submit", true)}
                  onMouseLeave={() => setHover("submit", false)}
                  style={{
                    width: "100%",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    background: status === "loading" ? COLORS.gold : hoverState.submit ? COLORS.goldLight : COLORS.gold,
                    color: COLORS.black,
                    border: "none",
                    padding: "16px 36px",
                    fontFamily: fontSans,
                    fontSize: "0.9rem",
                    letterSpacing: "0.02em",
                    cursor: status === "loading" ? "not-allowed" : "pointer",
                    opacity: status === "loading" ? 0.6 : 1,
                    transition: "background 0.3s ease",
                  }}
                >
                  {status === "loading" ? (
                    <>
                      <span
                        style={{
                          width: "16px",
                          height: "16px",
                          border: "2px solid rgba(10,10,10,0.4)",
                          borderTopColor: COLORS.black,
                          borderRadius: "50%",
                          animation: "aureza-spin 0.8s linear infinite",
                        }}
                      />
                      Enviando...
                    </>
                  ) : (
                    <>
                      Enviar para Analise <ChevronRight size={16} />
                    </>
                  )}
                </button>
              </div>
            </Reveal>
          )}
        </div>
      </section>

      {/* PARA PARCEIROS */}
      <section id="parceiros" style={{ background: COLORS.cream, padding: "96px 0" }}>
        <div style={{ maxWidth: "1152px", margin: "0 auto", padding: "0 24px" }}>
          <Reveal>
            <div
              className="aureza-partners-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr",
                gap: "48px",
                alignItems: "center",
                borderTop: "1px solid " + COLORS.cardDivider,
                paddingTop: "64px",
              }}
            >
              <div>
                <p
                  style={{
                    fontFamily: fontSans,
                    color: COLORS.goldSoft,
                    fontSize: "0.75rem",
                    letterSpacing: "0.25em",
                    textTransform: "uppercase",
                    marginBottom: "16px",
                  }}
                >
                  Para Parceiros e Intermediarios
                </p>
                <h2 style={{ fontFamily: fontSerif, fontSize: "1.8rem", lineHeight: 1.3 }}>
                  Identificou uma oportunidade? Vamos avalia-la juntos.
                </h2>
              </div>
              <div>
                <p style={{ fontFamily: fontSans, color: COLORS.grayMuted, lineHeight: 1.7, marginBottom: "32px" }}>
                  Trabalhamos com intermediarios e parceiros que identificam oportunidades na regiao, entre em
                  contato para conhecer nosso modelo de parceria. Toda submissao qualificada e analisada com o
                  mesmo rigor tecnico aplicado aos nossos demais ativos.
                </p>
                <button
                  onClick={() => scrollTo("formulario")}
                  onMouseEnter={() => setHover("btn-partner", true)}
                  onMouseLeave={() => setHover("btn-partner", false)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    border: "1px solid " + COLORS.black,
                    background: hoverState["btn-partner"] ? COLORS.black : "transparent",
                    color: hoverState["btn-partner"] ? COLORS.cream : COLORS.black,
                    padding: "14px 28px",
                    fontFamily: fontSans,
                    fontSize: "0.9rem",
                    letterSpacing: "0.02em",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                  }}
                >
                  Submeter Oportunidade <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: COLORS.black, paddingTop: "80px", paddingBottom: "40px" }}>
        <div style={{ maxWidth: "1152px", margin: "0 auto", padding: "0 24px" }}>
          <div className="aureza-footer-grid" style={{ display: "grid", gridTemplateColumns: "1fr", gap: "48px", marginBottom: "64px" }}>
            <div>
              <div style={{ fontFamily: fontSerif, fontSize: "1.5rem", color: COLORS.cream, letterSpacing: "0.15em", marginBottom: "16px" }}>
                AURE<span style={{ color: COLORS.gold }}>Z</span>A
              </div>
              <p style={{ fontFamily: fontSans, fontSize: "0.875rem", color: COLORS.textOnBlackMuted, lineHeight: 1.6 }}>
                Especialistas exclusivos na Regiao dos Lagos, RJ.
              </p>
            </div>
            <div>
              <h4
                style={{
                  fontFamily: fontSans,
                  fontSize: "0.75rem",
                  color: COLORS.gold,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  marginBottom: "16px",
                }}
              >
                Contato
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontFamily: fontSans, fontSize: "0.875rem", color: COLORS.textOnBlack }}>
                <p style={{ display: "flex", alignItems: "center", gap: "8px", margin: 0 }}>
                  <Mail size={14} style={{ color: COLORS.gold }} /> contato@aureza.com.br
                </p>
                <p style={{ display: "flex", alignItems: "center", gap: "8px", margin: 0 }}>
                  <Phone size={14} style={{ color: COLORS.gold }} /> (22) 99000-0000
                </p>
                <p style={{ display: "flex", alignItems: "center", gap: "8px", margin: 0 }}>
                  <MapPin size={14} style={{ color: COLORS.gold }} /> Regiao dos Lagos, RJ
                </p>
              </div>
            </div>
            <div>
              <h4
                style={{
                  fontFamily: fontSans,
                  fontSize: "0.75rem",
                  color: COLORS.gold,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  marginBottom: "16px",
                }}
              >
                Redes
              </h4>
              <div style={{ display: "flex", gap: "16px" }}>
                <a href="#" style={{ color: COLORS.textOnBlack }}>
                  <Share2 size={18} />
                </a>
                <a href="#" style={{ color: COLORS.textOnBlack }}>
                  <ExternalLink size={18} />
                </a>
              </div>
            </div>
          </div>
          <div
            style={{
              borderTop: "1px solid " + COLORS.divider,
              paddingTop: "32px",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              fontFamily: fontSans,
              fontSize: "0.75rem",
              color: COLORS.textOnBlackFaint,
            }}
          >
            <p style={{ margin: 0 }}>Copyright {new Date().getFullYear()} Aureza. Todos os direitos reservados.</p>
            <p style={{ margin: 0 }}>Especialistas exclusivos na Regiao dos Lagos, RJ.</p>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes aureza-spin { to { transform: rotate(360deg); } }
        @media (min-width: 768px) {
          .aureza-services-grid { grid-template-columns: 1fr 1fr !important; }
          .aureza-stats-grid { grid-template-columns: 1fr 1fr 1fr 1fr !important; }
          .aureza-steps-grid { grid-template-columns: 1fr 1fr 1fr 1fr !important; }
          .aureza-form-row { grid-template-columns: 1fr 1fr !important; }
          .aureza-partners-grid { grid-template-columns: 1fr 1.3fr !important; }
          .aureza-footer-grid { grid-template-columns: 1fr 1fr 1fr !important; }
          .aureza-hero-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (min-width: 1024px) {
          .aureza-nav-desktop { display: flex !important; }
          .aureza-cta-desktop { display: inline-flex !important; }
          .aureza-burger { display: none !important; }
        }
      `}</style>
    </div>
  );
}