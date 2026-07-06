import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import "leaflet-draw";
import "./leafletIconFix";
import { BO_COLORS, fontSans } from "../../theme/tokens";

const DEFAULT_CENTER = [-22.75, -41.95]; // Região dos Lagos, RJ

function fmtM2(v) {
  return v ? Math.round(Number(v)).toLocaleString("pt-BR") + " m²" : "";
}

export default function TerrenoMap({ value, onChange, editable }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const initialValueRef = useRef(value);
  const currentRef = useRef({
    lat: value && value.lat != null ? value.lat : null,
    lng: value && value.lng != null ? value.lng : null,
    poligono: value && value.poligono ? value.poligono : null,
    area_poligono_m2: value && value.area_poligono_m2 != null ? value.area_poligono_m2 : null,
  });
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const [query, setQuery] = useState("");
  const [searchStatus, setSearchStatus] = useState("");
  const [coordsLabel, setCoordsLabel] = useState(
    currentRef.current.lat != null
      ? "Lat " + currentRef.current.lat.toFixed(6) + ", Lng " + currentRef.current.lng.toFixed(6)
      : "Nenhum ponto selecionado"
  );
  const [areaLabel, setAreaLabel] = useState(
    currentRef.current.area_poligono_m2 ? "Área desenhada: " + fmtM2(currentRef.current.area_poligono_m2) : ""
  );

  useEffect(() => {
    const initial = initialValueRef.current || {};
    const startLat = initial.lat != null ? initial.lat : DEFAULT_CENTER[0];
    const startLng = initial.lng != null ? initial.lng : DEFAULT_CENTER[1];

    const map = L.map(containerRef.current).setView([startLat, startLng], initial.lat != null ? 15 : 10);
    mapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "&copy; OpenStreetMap",
    }).addTo(map);

    const drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);

    if (initial.lat != null && initial.lng != null) {
      markerRef.current = L.marker([initial.lat, initial.lng]).addTo(map);
    }
    if (initial.poligono && initial.poligono.length) {
      drawnItems.addLayer(L.polygon(initial.poligono, { color: BO_COLORS.accentDark }));
    }

    if (editable) {
      const drawControl = new L.Control.Draw({
        draw: {
          polygon: { shapeOptions: { color: BO_COLORS.accentDark }, allowIntersection: false, showArea: true },
          polyline: false,
          rectangle: false,
          circle: false,
          circlemarker: false,
          marker: false,
        },
        edit: { featureGroup: drawnItems, remove: true },
      });
      map.addControl(drawControl);

      map.on(L.Draw.Event.CREATED, (e) => {
        drawnItems.clearLayers();
        drawnItems.addLayer(e.layer);
        const latlngs = e.layer.getLatLngs()[0];
        const areaM2 = L.GeometryUtil.geodesicArea(latlngs);
        const poligono = latlngs.map((p) => [p.lat, p.lng]);
        currentRef.current = { ...currentRef.current, poligono, area_poligono_m2: areaM2 };
        setAreaLabel("Área desenhada: " + fmtM2(areaM2));
        onChangeRef.current({ ...currentRef.current });
      });

      map.on(L.Draw.Event.EDITED, (e) => {
        e.layers.eachLayer((layer) => {
          const latlngs = layer.getLatLngs()[0];
          const areaM2 = L.GeometryUtil.geodesicArea(latlngs);
          const poligono = latlngs.map((p) => [p.lat, p.lng]);
          currentRef.current = { ...currentRef.current, poligono, area_poligono_m2: areaM2 };
          setAreaLabel("Área desenhada: " + fmtM2(areaM2));
          onChangeRef.current({ ...currentRef.current });
        });
      });

      map.on(L.Draw.Event.DELETED, () => {
        currentRef.current = { ...currentRef.current, poligono: null, area_poligono_m2: null };
        setAreaLabel("");
        onChangeRef.current({ ...currentRef.current });
      });

      map.on("click", (e) => {
        const target = e.originalEvent && e.originalEvent.target;
        if (target && target.closest && target.closest(".leaflet-draw-toolbar")) return;
        const { lat, lng } = e.latlng;
        if (markerRef.current) map.removeLayer(markerRef.current);
        markerRef.current = L.marker([lat, lng]).addTo(map);
        currentRef.current = { ...currentRef.current, lat, lng };
        setCoordsLabel("Lat " + lat.toFixed(6) + ", Lng " + lng.toFixed(6));
        onChangeRef.current({ ...currentRef.current });
      });
    }

    const resizeTimer = setTimeout(() => map.invalidateSize(), 150);

    return () => {
      clearTimeout(resizeTimer);
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editable]);

  const handleSearch = async () => {
    if (!query.trim() || !mapRef.current) return;
    setSearchStatus("Buscando...");
    try {
      const res = await fetch(
        "https://nominatim.openstreetmap.org/search?format=json&limit=1&q=" +
          encodeURIComponent(query + ", Região dos Lagos, RJ, Brasil")
      );
      const data = await res.json();
      if (!data || !data.length) {
        setSearchStatus("Endereço não encontrado — posicione o pino manualmente no mapa.");
        return;
      }
      const { lat, lon, display_name } = data[0];
      mapRef.current.setView([parseFloat(lat), parseFloat(lon)], 15);
      setSearchStatus("Encontrado: " + display_name);
    } catch {
      setSearchStatus("Busca indisponível no momento — posicione o pino manualmente.");
    }
  };

  return (
    <div>
      {editable && (
        <>
          <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSearch();
                }
              }}
              placeholder="Buscar endereço (ex: Búzios, Praia da Ferradura)"
              style={{
                flex: 1,
                padding: "9px 10px",
                border: "1px solid " + BO_COLORS.border,
                borderRadius: "3px",
                fontFamily: fontSans,
                fontSize: "0.9rem",
              }}
            />
            <button
              type="button"
              onClick={handleSearch}
              style={{
                fontFamily: fontSans,
                fontSize: "0.85rem",
                padding: "0 16px",
                background: BO_COLORS.ink,
                color: "#fff",
                border: "none",
                borderRadius: "3px",
                cursor: "pointer",
              }}
            >
              Buscar
            </button>
          </div>
          {searchStatus && (
            <p style={{ fontFamily: fontSans, fontSize: "0.75rem", color: BO_COLORS.textMuted, margin: "-4px 0 8px" }}>
              {searchStatus}
            </p>
          )}
          <p style={{ fontFamily: fontSans, fontSize: "0.75rem", color: BO_COLORS.textMuted, margin: "0 0 10px" }}>
            Use a ferramenta de polígono (ícone à esquerda do mapa) para desenhar o contorno do terreno — a área é
            calculada automaticamente. Um clique simples posiciona apenas o pino.
          </p>
        </>
      )}
      <div
        ref={containerRef}
        style={{ height: editable ? 340 : 280, borderRadius: "3px", border: "1px solid " + BO_COLORS.border }}
      />
      <div
        style={{
          display: "flex",
          gap: "18px",
          flexWrap: "wrap",
          fontFamily: fontSans,
          fontSize: "0.8rem",
          color: BO_COLORS.ink,
          fontWeight: 600,
          marginTop: "8px",
        }}
      >
        <span>{coordsLabel}</span>
        {areaLabel && <span>{areaLabel}</span>}
      </div>
    </div>
  );
}
