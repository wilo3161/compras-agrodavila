// -*- coding: utf-8 -*-
// Fincas de AgroDávila en 3D (Three.js) y Respaldo 2D.
// Maqueta agrícola profesional: 6 fincas a escala de hectáreas, lotes de espárrago con camellones,
// riego por goteo con reservorio, infraestructura (bodega, caseta, caminos), pitahaya en Puerto Cayo,
// volcán Imbabura al fondo y desglose de inventario recibido en bodega.
// Compatible con navegador clásico (window.AgdFincas3D) y módulos ES.

// Direcciones completas (+esm): Vértice no permite <script type="importmap"> en línea por su política de seguridad.
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/+esm";
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/controls/OrbitControls.js/+esm";
import { CSS2DRenderer, CSS2DObject } from "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/renderers/CSS2DRenderer.js/+esm";

const PALETA = {
  grafito: "#23262B",
  azul: "#2F5D8A",
  maiz: "#C9A227",
  ladrillo: "#B5523B",
  fondo: "#F5F6F8",
  fondoOscuro: "#15191C",
  borde: "#D9DEE5",
  bordeOscuro: "#2D343B",
  texto: "#1F2328",
  textoSecundario: "#59636E",
  tierra: "#4E3D2D",
  tierraLabrada: "#5C4A38",
  olivaOscuro: "#3B4A33",
  olivaMedio: "#4C5E43",
  olivaClaro: "#5D7352",
  agua: "#2E5779",
  arena: "#D6CCA8",
  mar: "#294E6B",
  techoBodega: "#B8C1CC",
  paredBodega: "#2A3036"
};

const FINCAS_DEF = [
  { codigo: "el_carmen", nombre: "El Carmen", zona: "Costa", ha: 30, cultivos: ["Espárrago"], x: -36, z: 18, color: "#4C5E43" },
  { codigo: "puerto_cayo", nombre: "Puerto Cayo", zona: "Costa", ha: 40, cultivos: ["Pitahaya", "Espárrago"], x: -36, z: -18, tienePitahaya: true, cercaMar: true, color: "#4A5D40" },
  { codigo: "conaqui", nombre: "Coñaqui", zona: "Imbabura", ha: 35, cultivos: ["Espárrago"], x: 18, z: -20, lomas: true, color: "#44553B" },
  { codigo: "eliana", nombre: "Eliana", zona: "Imbabura", ha: 18, cultivos: ["Espárrago"], x: 44, z: -18, lomas: true, color: "#4C5E43" },
  { codigo: "andres_lopez", nombre: "Andrés López", zona: "Imbabura", ha: 25, cultivos: ["Espárrago"], x: 18, z: 20, lomas: true, color: "#47593E" },
  { codigo: "otoburo", nombre: "Otoburo", zona: "Imbabura", ha: 25, cultivos: ["Espárrago"], x: 44, z: 22, lomas: true, color: "#47593E" }
];

const FAMILIAS_INVENTARIO = [
  { id: "agroquimicos", nombre: "Agroquímicos (Fertilizantes / Fitosanitarios)", claves: ["fertiliz", "fungicid", "insecticid", "herbicid", "quimic", "abono"], color: PALETA.olivaMedio },
  { id: "repuestos", nombre: "Repuestos y Maquinaria", claves: ["repuesto", "filtro", "aceite", "lubricant", "manguera hidraulica", "freno", "bateria"], color: PALETA.azul },
  { id: "ferreteria", nombre: "Ferretería y Construcción", claves: ["ferreter", "herramient", "alambre", "cemento", "clavo", "tubo", "malla"], color: PALETA.maiz },
  { id: "riego", nombre: "Riego por Goteo y Accesorios", claves: ["riego", "gotero", "valvula", "cinta", "microaspersor"], color: PALETA.agua },
  { id: "epp", nombre: "EPP, Seguridad y Varios", claves: ["epp", "guante", "bota", "mascarilla", "fumigac", "limpieza"], color: PALETA.textoSecundario }
];

export function esWebGLDisponible() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(window.WebGLRenderingContext && (canvas.getContext("webgl") || canvas.getContext("experimental-webgl")));
  } catch (e) {
    return false;
  }
}

function esc(t) {
  return String(t ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatearUsd(m) {
  const n = Number(m) || 0;
  return "$" + n.toLocaleString("es-EC", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function clasificarFamilia(prod) {
  const t = String(prod || "").toLowerCase();
  for (const f of FAMILIAS_INVENTARIO) {
    if (f.claves.some((k) => t.includes(k))) return f;
  }
  return FAMILIAS_INVENTARIO[FAMILIAS_INVENTARIO.length - 1];
}

/**
 * Agrupa y consolida los datos reales de compras, mantenimientos y recepciones por finca.
 */
function procesarDatosFincas(fincasBase, opciones = {}) {
  const { lineas = [], ordenes = [], recepciones = [], activos = [], viajes = [] } = opciones;
  const mapa = {};
  for (const f of fincasBase) {
    mapa[f.codigo] = {
      ...f,
      lineas: [],
      ordenes: [],
      recepciones: [],
      activos: [],
      viajes: [],
      gastoTotal: 0,
      gastoMes: 0,
      gastoSemana: 0,
      alertas: [],
      inventarioEstimado: {}
    };
  }

  const norm = (txt) => {
    const s = String(txt || "").toLowerCase().trim();
    if (s.includes("carmen")) return "el_carmen";
    if (s.includes("cayo") || s.includes("manabi")) return "puerto_cayo";
    if (s.includes("conaqui") || s.includes("coñaqui")) return "conaqui";
    if (s.includes("eliana")) return "eliana";
    if (s.includes("lopez") || s.includes("lópez")) return "andres_lopez";
    if (s.includes("otoburo")) return "otoburo";
    return "";
  };

  // Mismas reglas que la app y el Tablero Gerencial (AgdReglas): monto = cantidad × precio elegido; el gasto
  // cuenta solo líneas autorizadas; la semana y el mes se fijan por la fecha de autorización; la «bodega» es solo
  // lo recibido en finca, agrupado por la categoría real de AgroControl.
  const R = window.AgdReglas || null;
  const hoy = R ? R.hoyEcuador() : new Date().toISOString().slice(0, 10);
  const semHoy = R ? R.semanaIso(hoy) : "";
  const mesHoy = String(hoy).slice(0, 7);
  const seg = opciones.seguimiento || {};
  for (const l of lineas) {
    const cod = norm(l.finca || l.Finca || l.centro_costo);
    if (!cod || !mapa[cod] || !R) continue;
    const et = R.clasificarEtapa(l, null) || {};
    if (et.id === "anulado" || et.id === "rechazado") continue;
    mapa[cod].lineas.push(l);
    const estSeg = String((seg[l.linea || l["Línea"]] || {}).estado || "");
    if (!et.autorizado || estSeg === "No se compró") continue;
    const monto = Number(R.montoLinea(l)) || 0;
    if (monto <= 0) continue;
    mapa[cod].gastoTotal += monto;
    const fAut = String(l.f_autorizacion || l["F. autorización"] || l.oc_creada || "").slice(0, 10);
    if (fAut && fAut.slice(0, 7) === mesHoy) mapa[cod].gastoMes += monto;
    if (fAut && R.semanaIso(fAut) === semHoy) mapa[cod].gastoSemana += monto;

    const recibido = et.grupo_gasto === "Recibido en finca" || et.grupo_gasto === "Pagado" || estSeg === "Entregado";
    if (!recibido) continue;
    const cat = String(l.categoria || l["Categoría"] || "Sin categoría");
    const prod = l.producto || l.Producto || l.descripcion || "";
    const fam = clasificarFamilia(cat + " " + prod);
    const clave = cat;
    if (!mapa[cod].inventarioEstimado[clave]) {
      mapa[cod].inventarioEstimado[clave] = { id: clave, nombre: cat, color: fam.color, monto: 0, cantidadLineas: 0, productos: [] };
    }
    mapa[cod].inventarioEstimado[clave].monto += monto;
    mapa[cod].inventarioEstimado[clave].cantidadLineas += 1;
    if (mapa[cod].inventarioEstimado[clave].productos.length < 5) {
      mapa[cod].inventarioEstimado[clave].productos.push(prod);
    }
  }

  for (const o of ordenes) {
    const cod = norm(o.finca);
    if (cod && mapa[cod]) {
      mapa[cod].ordenes.push(o);
      // Atrasada = sigue abierta (Pendiente / Programado / En ejecución) y su fecha programada ya pasó.
      const abierta = ["pendiente", "programado", "en ejecución", "en ejecucion"].includes(String(o.estado || "").toLowerCase());
      const fProg = String(o.fecha_programada || "").slice(0, 10);
      if ((abierta && fProg && fProg < String(hoy)) || Number(o.dias_atraso || 0) > 0) {
        mapa[cod].alertas.push({ tipo: "mantenimiento", texto: `OT atrasada: ${o.activo || "Equipo"}${fProg ? ` (programada ${fProg.slice(8, 10)}/${fProg.slice(5, 7)})` : ""}` });
      }
    }
  }

  for (const r of recepciones) {
    const cod = norm(r.finca);
    if (cod && mapa[cod]) {
      mapa[cod].recepciones.push(r);
      if (r.estado_conciliacion === "por_conciliar") {
        mapa[cod].alertas.push({ tipo: "recepcion", texto: `Recepción por conciliar: ${r.producto || "Material"} (Guía ${r.numero_guia || "S/N"})` });
      }
    }
  }

  for (const a of activos) {
    const cod = norm(a.finca);
    if (cod && mapa[cod]) mapa[cod].activos.push(a);
  }

  return mapa;
}

/**
 * Monta el visor 3D en el contenedor proporcionado.
 * Si WebGL no está disponible o el usuario activa 2D, conmuta al mapa SVG arquitectónico.
 */
export function montarVisorFincas3D(contenedor, opciones = {}) {
  if (!contenedor) return null;
  contenedor.innerHTML = "";

  const reglas = window.AgdReglas || {};
  const fincasConfig = reglas.FINCAS || FINCAS_DEF;
  const esOscuro = Boolean(window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches);
  const reducido = Boolean(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  // Filtrado de fincas según permisos de rol (ej. finca_imbabura)
  const soloImbabura = Boolean(opciones.permisos?.soloImbabura || opciones.soloImbabura);
  // Hectáreas siempre desde reglas_agd.json (AgdReglas): si cambian allí, cambia el dibujo.
  const porNombre = (window.AgdReglas && window.AgdReglas.FINCAS_POR_NOMBRE) || {};
  const fincasVisibles = FINCAS_DEF
    .map((f) => ({ ...f, ha: Number(porNombre[f.nombre]?.hectareas_base) || f.ha }))
    .filter((f) => (soloImbabura ? f.zona === "Imbabura" : true));
  const haTotal = fincasVisibles.reduce((acc, f) => acc + f.ha, 0);
  const datosFincas = procesarDatosFincas(fincasVisibles, opciones);

  let fincaActivaId = opciones.fincaInicial ? (fincasVisibles.find((f) => f.nombre === opciones.fincaInicial || f.codigo === opciones.fincaInicial)?.codigo || "") : "";
  let modoVista = opciones.forzar2D || !esWebGLDisponible() ? "2d" : "3d";
  let escena, camara, renderizador, etiquetasRenderer, controles, animacionId, animarCamara = null;
  const objetosFinca3D = new Map();
  const elementosViento = [];

  // Estructura DOM principal
  const raiz = document.createElement("div");
  raiz.className = "visor-fincas-raiz";
  raiz.style.cssText = `
    display:grid;grid-template-columns:minmax(0,1fr) 380px;height:100%;width:100%;
    background:${esOscuro ? PALETA.fondoOscuro : PALETA.fondo};
    color:${esOscuro ? "#F0F3F6" : PALETA.texto};
    font-family:'Figtree',system-ui,sans-serif;position:relative;overflow:hidden;
  `;

  const panelEscena = document.createElement("div");
  panelEscena.className = "visor-fincas-canvas-wrap";
  panelEscena.style.cssText = "position:relative;width:100%;height:100%;min-height:420px;overflow:hidden;";

  const barraHerramientas = document.createElement("div");
  barraHerramientas.className = "visor-fincas-toolbar";
  barraHerramientas.style.cssText = `
    position:absolute;top:14px;left:14px;z-index:10;display:flex;gap:8px;align-items:center;flex-wrap:wrap;
    background:${esOscuro ? "rgba(21,25,28,0.88)" : "rgba(255,255,255,0.92)"};
    backdrop-filter:blur(8px);padding:6px 10px;border-radius:10px;
    border:1px solid ${esOscuro ? PALETA.bordeOscuro : PALETA.borde};box-shadow:0 4px 14px rgba(0,0,0,0.08);
  `;

  barraHerramientas.innerHTML = `
    <span style="font-size:0.84rem;font-weight:700;color:${PALETA.azul};">Fincas AgroDávila</span>
    <span style="color:${esOscuro ? "#555" : "#ccc"};">|</span>
    <button type="button" id="btn-toggle-modo" style="font:inherit;font-size:0.8rem;padding:4px 9px;border-radius:6px;border:1px solid ${PALETA.borde};background:transparent;cursor:pointer;color:inherit;">
      ${modoVista === "3d" ? "Ver mapa 2D" : "Ver maqueta 3D"}
    </button>
    <button type="button" id="btn-centrar-cam" style="font:inherit;font-size:0.8rem;padding:4px 9px;border-radius:6px;border:1px solid ${PALETA.borde};background:transparent;cursor:pointer;color:inherit;">
      Centrar vista
    </button>
    <span id="indicador-escala" style="font-size:0.75rem;color:${PALETA.textoSecundario};">Escala: ${haTotal} ha en total</span>
  `;

  const panelDetalle = document.createElement("aside");
  panelDetalle.className = "visor-fincas-sidebar";
  panelDetalle.style.cssText = `
    height:100%;overflow-y:auto;padding:20px;box-sizing:border-box;
    background:${esOscuro ? "#1A1F24" : "#FFFFFF"};
    border-left:1px solid ${esOscuro ? PALETA.bordeOscuro : PALETA.borde};
  `;

  raiz.appendChild(panelEscena);
  raiz.appendChild(panelDetalle);
  panelEscena.appendChild(barraHerramientas);
  contenedor.appendChild(raiz);

  // Inyección de estilos CSS responsivos para móviles (<=860px)
  if (!document.getElementById("estilo-fincas3d-responsive")) {
    const estilo = document.createElement("style");
    estilo.id = "estilo-fincas3d-responsive";
    estilo.textContent = `
      @media (max-width: 860px) {
        .visor-fincas-raiz { grid-template-columns: 1fr !important; grid-template-rows: 52vh minmax(0, 1fr) !important; height: auto !important; min-height: 100vh; }
        .visor-fincas-sidebar { border-left: 0 !important; border-top: 1px solid var(--borde, #D9DEE5) !important; }
        .visor-fincas-toolbar { top: 8px !important; left: 8px !important; font-size: 0.75rem !important; }
      }
      .etiqueta-finca-3d {
        background: rgba(35, 38, 43, 0.90); color: #fff; padding: 4px 8px; border-radius: 6px;
        font-family: 'Figtree', sans-serif; font-size: 11px; font-weight: 600; pointer-events: none;
        border: 1px solid rgba(255,255,255,0.2); white-space: nowrap; box-shadow: 0 2px 8px rgba(0,0,0,0.25);
      }
      .etiqueta-finca-3d small { display: block; font-size: 9.5px; opacity: 0.85; font-weight: 400; }
      .badge-alerta-3d {
        display: inline-block; background: ${PALETA.ladrillo}; color: #fff; padding: 1px 5px;
        border-radius: 4px; font-size: 9px; font-weight: 700; margin-left: 4px; vertical-align: middle;
      }
    `;
    document.head.appendChild(estilo);
  }

  // ── Renderizado del Panel Lateral (Ficha de la finca) ──
  function pintarPanelLateral() {
    const f = fincaActivaId ? datosFincas[fincaActivaId] : null;

    if (!f) {
      const totHa = fincasVisibles.reduce((acc, x) => acc + x.ha, 0);
      const totGasto = Object.values(datosFincas).reduce((acc, x) => acc + x.gastoTotal, 0);
      const totAlertas = Object.values(datosFincas).reduce((acc, x) => acc + x.alertas.length, 0);

      panelDetalle.innerHTML = `
        <div style="margin-bottom:18px;">
          <h2 style="font-size:1.25rem;margin:0 0 4px;font-family:'Bricolage Grotesque',sans-serif;">Fincas AgroDávila</h2>
          <p style="margin:0;font-size:0.86rem;color:${PALETA.textoSecundario};">
            Maqueta agrícola digital: ${soloImbabura ? "4 fincas de Imbabura" : "6 fincas (Costa e Imbabura)"}.
          </p>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:18px;">
          <div style="border:1px solid ${esOscuro ? PALETA.bordeOscuro : PALETA.borde};padding:10px 12px;border-radius:8px;">
            <span style="font-size:0.75rem;color:${PALETA.textoSecundario};text-transform:uppercase;">Superficie</span>
            <strong style="display:block;font-size:1.25rem;font-family:'Bricolage Grotesque',sans-serif;">${totHa} ha</strong>
          </div>
          <div style="border:1px solid ${esOscuro ? PALETA.bordeOscuro : PALETA.borde};padding:10px 12px;border-radius:8px;">
            <span style="font-size:0.75rem;color:${PALETA.textoSecundario};text-transform:uppercase;">Gasto compras</span>
            <strong style="display:block;font-size:1.25rem;color:${PALETA.azul};font-family:'Bricolage Grotesque',sans-serif;">${formatearUsd(totGasto)}</strong>
          </div>
        </div>

        ${totAlertas > 0 ? `
          <div style="background:rgba(181,82,59,0.08);border:1px solid ${PALETA.ladrillo};color:${PALETA.ladrillo};padding:10px 12px;border-radius:8px;margin-bottom:18px;font-size:0.86rem;">
            <strong>${totAlertas} alertas operativas detectadas</strong> (mantenimientos atrasados o recepciones sin conciliar).
          </div>
        ` : ""}

        <h3 style="font-size:0.92rem;text-transform:uppercase;letter-spacing:0.04em;color:${PALETA.textoSecundario};margin:0 0 10px;">Seleccionar finca</h3>
        <div style="display:grid;gap:8px;">
          ${fincasVisibles.map((item) => {
            const df = datosFincas[item.codigo];
            const tieneAlertas = df.alertas.length > 0;
            return `
              <button type="button" class="btn-sel-finca" data-finca-cod="${item.codigo}" style="
                text-align:left;font:inherit;padding:12px;border-radius:8px;cursor:pointer;display:flex;justify-content:space-between;align-items:center;
                border:1px solid ${esOscuro ? PALETA.bordeOscuro : PALETA.borde};background:${esOscuro ? "#20262B" : "#FBFBFA"};color:inherit;
              ">
                <div>
                  <strong style="display:block;font-size:0.95rem;">${esc(item.nombre)}</strong>
                  <span style="font-size:0.8rem;color:${PALETA.textoSecundario};">${esc(item.zona)} · ${item.ha} ha · ${esc(item.cultivos.join(", "))}</span>
                </div>
                ${tieneAlertas ? `<span class="badge-alerta-3d">${df.alertas.length} alerta(s)</span>` : `<span style="font-size:0.82rem;font-weight:600;color:${PALETA.azul};">${formatearUsd(df.gastoTotal)}</span>`}
              </button>
            `;
          }).join("")}
        </div>
      `;
    } else {
      const inv = Object.values(f.inventarioEstimado);
      panelDetalle.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px;">
          <div>
            <span style="font-size:0.75rem;text-transform:uppercase;letter-spacing:0.06em;color:${PALETA.azul};font-weight:700;">${esc(f.zona)}</span>
            <h2 style="font-size:1.35rem;margin:2px 0 0;font-family:'Bricolage Grotesque',sans-serif;">${esc(f.nombre)}</h2>
          </div>
          <button type="button" id="btn-volver-resumen" style="font:inherit;font-size:0.8rem;padding:4px 8px;border-radius:6px;border:1px solid ${PALETA.borde};background:transparent;cursor:pointer;color:inherit;">
            ← Todas
          </button>
        </div>

        <p style="font-size:0.86rem;margin:0 0 14px;color:${PALETA.textoSecundario};">
          ${f.ha} hectáreas · Cultivo: <strong>${esc(f.cultivos.join(" / "))}</strong>${f.tienePitahaya ? " (con sector de tutores de pitahaya)" : ""}.
        </p>

        ${f.alertas.length > 0 ? `
          <div style="background:rgba(181,82,59,0.08);border-left:3px solid ${PALETA.ladrillo};padding:10px 12px;border-radius:4px;margin-bottom:16px;">
            <strong style="color:${PALETA.ladrillo};font-size:0.86rem;display:block;margin-bottom:4px;">Atención requerida:</strong>
            <ul style="margin:0;padding-left:18px;font-size:0.82rem;color:${PALETA.ladrillo};">
              ${f.alertas.map((a) => `<li>${esc(a.texto)}</li>`).join("")}
            </ul>
          </div>
        ` : ""}

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:18px;">
          <div style="border:1px solid ${esOscuro ? PALETA.bordeOscuro : PALETA.borde};padding:10px;border-radius:8px;">
            <span style="font-size:0.72rem;color:${PALETA.textoSecundario};text-transform:uppercase;">Gasto AgroControl</span>
            <strong style="display:block;font-size:1.15rem;color:${PALETA.azul};font-family:'Bricolage Grotesque',sans-serif;">${formatearUsd(f.gastoTotal)}</strong>
            <span style="font-size:0.76rem;color:${PALETA.textoSecundario};">${f.lineas.length} líneas de pedido</span>
          </div>
          <div style="border:1px solid ${esOscuro ? PALETA.bordeOscuro : PALETA.borde};padding:10px;border-radius:8px;">
            <span style="font-size:0.72rem;color:${PALETA.textoSecundario};text-transform:uppercase;">Mantenimiento / Activos</span>
            <strong style="display:block;font-size:1.15rem;font-family:'Bricolage Grotesque',sans-serif;">${f.ordenes.length} OT / ${f.activos.length} act.</strong>
            <span style="font-size:0.76rem;color:${PALETA.textoSecundario};">${f.recepciones.length} recepciones</span>
          </div>
        </div>

        <section style="margin-bottom:20px;">
          <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:8px;">
            <h3 style="font-size:0.88rem;text-transform:uppercase;letter-spacing:0.04em;margin:0;color:${PALETA.texto};">Bodega: Insumos recibidos</h3>
            <span style="font-size:0.74rem;color:${PALETA.maiz};font-weight:600;">Recibido (aún no es inventario)</span>
          </div>
          <p style="font-size:0.8rem;color:${PALETA.textoSecundario};margin:0 0 10px;">
            Aproximación por compras recibidas por categoría para el inventario de bodega.
          </p>

          <div style="display:grid;gap:8px;">
            ${inv.length ? inv.map((item) => `
              <div style="border:1px solid ${esOscuro ? PALETA.bordeOscuro : PALETA.borde};padding:9px 11px;border-radius:8px;background:${esOscuro ? "#20252A" : "#FAFAFA"};">
                <div style="display:flex;justify-content:space-between;font-size:0.84rem;margin-bottom:4px;">
                  <strong style="color:${item.color};">${esc(item.nombre)}</strong>
                  <span>${formatearUsd(item.monto)}</span>
                </div>
                <div style="height:6px;background:${esOscuro ? "#333" : "#E5E9EE"};border-radius:3px;overflow:hidden;">
                  <div style="width:${Math.min(100, Math.round((item.monto / (f.gastoTotal || 1)) * 100))}%;height:100%;background:${item.color};border-radius:3px;"></div>
                </div>
                <div style="font-size:0.76rem;color:${PALETA.textoSecundario};margin-top:4px;">
                  ${item.cantidadLineas} compra(s) · ${esc(item.productos.slice(0, 3).join(", "))}
                </div>
              </div>
            `).join("") : `<div style="font-size:0.82rem;color:${PALETA.textoSecundario};">Sin compras registradas aún para esta bodega.</div>`}
          </div>
        </section>

        ${f.recepciones.length > 0 ? `
          <section style="margin-bottom:16px;">
            <h3 style="font-size:0.88rem;text-transform:uppercase;letter-spacing:0.04em;margin:0 0 8px;color:${PALETA.texto};">Últimas recepciones en campo</h3>
            <div style="display:grid;gap:6px;">
              ${f.recepciones.slice(0, 4).map((rec) => `
                <div style="font-size:0.8rem;padding:7px 9px;border-radius:6px;border:1px solid ${esOscuro ? PALETA.bordeOscuro : PALETA.borde};display:flex;justify-content:space-between;">
                  <div>
                    <strong>${esc(rec.producto)}</strong>
                    <div style="color:${PALETA.textoSecundario};font-size:0.75rem;">Guía: ${esc(rec.numero_guia || "S/N")} · ${esc(rec.fecha || "")}</div>
                  </div>
                  <span style="font-size:0.76rem;color:${rec.estado_conciliacion === "por_conciliar" ? PALETA.ladrillo : PALETA.azul};font-weight:600;">
                    ${rec.estado_conciliacion === "por_conciliar" ? "Por conciliar" : "Conciliada"}
                  </span>
                </div>
              `).join("")}
            </div>
          </section>
        ` : ""}
      `;
    }

    panelDetalle.querySelectorAll(".btn-sel-finca").forEach((b) => {
      b.addEventListener("click", () => seleccionarFinca(b.dataset.fincaCod));
    });
    panelDetalle.querySelector("#btn-volver-resumen")?.addEventListener("click", () => seleccionarFinca(""));
  }

  function seleccionarFinca(cod) {
    fincaActivaId = cod;
    pintarPanelLateral();
    if (opciones.onSeleccionarFinca) {
      const f = fincasVisibles.find((x) => x.codigo === cod);
      opciones.onSeleccionarFinca(f ? f.nombre : "");
    }

    if (modoVista === "3d" && controles) {
      if (cod && objetosFinca3D.has(cod)) {
        const obj = objetosFinca3D.get(cod);
        const f = fincasVisibles.find((x) => x.codigo === cod);
        const destTarget = new THREE.Vector3(f.x, 2, f.z);
        const destCam = new THREE.Vector3(f.x + 14, 18, f.z + 20);
        animarCamara = { t: destTarget, p: destCam, duracion: 1.0, transcurrido: 0 };
      } else {
        animarCamara = {
          t: new THREE.Vector3(0, 0, 0),
          p: new THREE.Vector3(0, 42, 60),
          duracion: 1.0,
          transcurrido: 0
        };
      }
    } else if (modoVista === "2d") {
      actualizarRespaldo2D();
    }
  }

  // ── Modo 2D de Respaldo Arquitectónico (SVG interactivo) ──
  function renderizarRespaldo2D() {
    panelEscena.querySelectorAll("canvas, .css2d-contenedor, svg.mapa-2d").forEach((el) => el.remove());
    if (animacionId) {
      cancelAnimationFrame(animacionId);
      animacionId = null;
    }

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("class", "mapa-2d");
    svg.setAttribute("viewBox", "-75 -45 150 90");
    svg.style.cssText = "width:100%;height:100%;display:block;cursor:grab;";

    // Fondo terreno regional
    svg.innerHTML = `
      <defs>
        <pattern id="pat-surcos" width="2" height="2" patternUnits="userSpaceOnUse">
          <line x1="0" y1="1" x2="2" y2="1" stroke="${PALETA.tierraLabrada}" stroke-width="0.3" opacity="0.6"/>
        </pattern>
        <pattern id="pat-pitahaya" width="3" height="3" patternUnits="userSpaceOnUse">
          <circle cx="1.5" cy="1.5" r="0.4" fill="${PALETA.olivaOscuro}"/>
        </pattern>
      </defs>

      <!-- Costa Mar & Playa -->
      ${!soloImbabura ? `
        <rect x="-75" y="-45" width="20" height="90" fill="${PALETA.mar}" opacity="0.85"/>
        <line x1="-55" y1="-45" x2="-55" y2="45" stroke="${PALETA.arena}" stroke-width="4"/>
        <text x="-65" y="0" font-size="3" fill="#fff" opacity="0.6" text-anchor="middle" transform="rotate(-90,-65,0)">OCÉANO PACÍFICO</text>
      ` : ""}

      <!-- Fondo regional Imbabura (relieve suave montañoso) -->
      <path d="M 0,-45 Q 35,-30 75,-45 L 75,45 Q 40,35 0,45 Z" fill="${esOscuro ? "#1E2522" : "#E2EAE0"}" opacity="0.7"/>

      <!-- Volcán Imbabura esquemático al fondo -->
      <polygon points="50,-42 62,-25 74,-42" fill="${esOscuro ? "#2E3A33" : "#C5D3C2"}" opacity="0.6"/>
      <polygon points="58,-42 62,-36 66,-42" fill="#E8EBE4" opacity="0.8"/>
      <text x="62" y="-22" font-size="2.6" fill="${PALETA.textoSecundario}" text-anchor="middle">Volcán Imbabura</text>

      <!-- Rótulos de Zona -->
      ${!soloImbabura ? `<text x="-36" y="-38" font-size="3.2" font-weight="bold" fill="${PALETA.azul}">ZONA COSTA</text>` : ""}
      <text x="30" y="-38" font-size="3.2" font-weight="bold" fill="${PALETA.azul}">ZONA IMBABURA</text>

      <!-- Grupo de Fincas -->
      <g id="capa-fincas-svg"></g>
    `;

    panelEscena.appendChild(svg);
    actualizarRespaldo2D();
  }

  function actualizarRespaldo2D() {
    const g = panelEscena.querySelector("#capa-fincas-svg");
    if (!g) return;
    g.innerHTML = "";

    for (const f of fincasVisibles) {
      const df = datosFincas[f.codigo];
      const lado = Math.sqrt(f.ha) * 3.2;
      const esActiva = fincaActivaId === f.codigo;
      const tieneAlertas = df.alertas.length > 0;

      const grupo = document.createElementNS("http://www.w3.org/2000/svg", "g");
      grupo.setAttribute("class", "finca-svg");
      grupo.setAttribute("data-cod", f.codigo);
      grupo.style.cursor = "pointer";

      grupo.innerHTML = `
        <!-- Parcela principal -->
        <rect x="${f.x - lado / 2}" y="${f.z - lado / 2}" width="${lado}" height="${lado}" rx="1.5"
              fill="${f.color}" stroke="${esActiva ? PALETA.maiz : tieneAlertas ? PALETA.ladrillo : PALETA.borde}"
              stroke-width="${esActiva ? 0.9 : 0.4}" opacity="${esActiva ? 1 : 0.92}"/>

        <!-- Surcos de espárrago -->
        <rect x="${f.x - lado / 2 + 1}" y="${f.z - lado / 2 + 1}" width="${lado - 2}" height="${lado - 4.5}"
              fill="url(#pat-surcos)" opacity="0.75"/>

        <!-- Sector Pitahaya en Puerto Cayo -->
        ${f.tienePitahaya ? `
          <rect x="${f.x - lado / 2 + 1}" y="${f.z + lado / 2 - 5}" width="${lado * 0.45}" height="4"
                fill="url(#pat-pitahaya)" stroke="${PALETA.olivaOscuro}" stroke-width="0.2"/>
          <text x="${f.x - lado / 2 + 2}" y="${f.z + lado / 2 - 1.5}" font-size="1.4" fill="#fff" font-weight="600">Pitahaya</text>
        ` : ""}

        <!-- Reservorio de agua -->
        <rect x="${f.x + lado / 2 - 4.5}" y="${f.z + lado / 2 - 4.5}" width="3.5" height="3.5" rx="0.6"
              fill="${PALETA.agua}" stroke="#1E231F" stroke-width="0.2"/>

        <!-- Bodega principal -->
        <rect x="${f.x - lado / 2 + 1}" y="${f.z + lado / 2 - 3.8}" width="4" height="2.8" rx="0.4"
              fill="${PALETA.paredBodega}" stroke="${PALETA.techoBodega}" stroke-width="0.25"/>

        <!-- Nombre y Hectáreas -->
        <text x="${f.x}" y="${f.z - lado / 2 - 1.5}" font-size="2.4" font-weight="700"
              fill="${esOscuro ? "#fff" : PALETA.texto}" text-anchor="middle">
          ${esc(f.nombre)} (${f.ha} ha)
        </text>

        <!-- Indicador de Alerta -->
        ${tieneAlertas ? `
          <circle cx="${f.x + lado / 2 - 1}" cy="${f.z - lado / 2 - 1}" r="1.4" fill="${PALETA.ladrillo}"/>
          <text x="${f.x + lado / 2 - 1}" y="${f.z - lado / 2 - 0.5}" font-size="1.5" font-weight="bold" fill="#fff" text-anchor="middle">!</text>
        ` : ""}
      `;

      grupo.addEventListener("click", () => seleccionarFinca(f.codigo));
      g.appendChild(grupo);
    }
  }

  // ── Modo 3D con Three.js ──
  function iniciarEscena3D() {
    panelEscena.querySelectorAll("canvas, .css2d-contenedor, svg.mapa-2d").forEach((el) => el.remove());
    if (animacionId) {
      cancelAnimationFrame(animacionId);
      animacionId = null;
    }

    const ancho = panelEscena.clientWidth || 800;
    const alto = panelEscena.clientHeight || 550;

    escena = new THREE.Scene();
    escena.background = new THREE.Color(esOscuro ? 0x15191c : 0xf2f5f1);
    escena.fog = new THREE.FogExp2(esOscuro ? 0x15191c : 0xf2f5f1, 0.0035);

    camara = new THREE.PerspectiveCamera(40, ancho / alto, 0.1, 500);
    // Posición inicial cinemática suave
    camara.position.set(reducido ? 0 : -20, reducido ? 42 : 55, reducido ? 60 : 75);

    try {
      renderizador = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    } catch (e) {
      // Fallback automático si WebGL falla inesperadamente
      modoVista = "2d";
      barraHerramientas.querySelector("#btn-toggle-modo").textContent = "Ver maqueta 3D";
      renderizarRespaldo2D();
      return;
    }

    renderizador.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderizador.setSize(ancho, alto);
    renderizador.shadowMap.enabled = true;
    renderizador.shadowMap.type = THREE.PCFSoftShadowMap;
    panelEscena.appendChild(renderizador.domElement);

    etiquetasRenderer = new CSS2DRenderer();
    etiquetasRenderer.setSize(ancho, alto);
    etiquetasRenderer.domElement.className = "css2d-contenedor";
    etiquetasRenderer.domElement.style.cssText = "position:absolute;top:0;left:0;pointer-events:none;width:100%;height:100%;";
    panelEscena.appendChild(etiquetasRenderer.domElement);

    controles = new OrbitControls(camara, renderizador.domElement);
    controles.enableDamping = true;
    controles.dampingFactor = 0.08;
    controles.maxPolarAngle = Math.PI * 0.46;
    controles.minDistance = 10;
    controles.maxDistance = 135;
    controles.target.set(0, 0, 0);

    // Luces de atardecer agrícola sobrio
    const hemisferio = new THREE.HemisphereLight(0xfff5e6, esOscuro ? 0x1c2420 : 0x8a9688, esOscuro ? 0.9 : 1.4);
    escena.add(hemisferio);

    const sol = new THREE.DirectionalLight(0xffecd1, 1.4);
    sol.position.set(38, 52, 28);
    sol.castShadow = true;
    sol.shadow.mapSize.set(1024, 1024);
    sol.shadow.camera.left = -65;
    sol.shadow.camera.right = 65;
    sol.shadow.camera.top = 65;
    sol.shadow.camera.bottom = -65;
    sol.shadow.camera.near = 10;
    sol.shadow.camera.far = 180;
    escena.add(sol);

    // Suelo general base (terreno amplio)
    const geoSuelo = new THREE.PlaneGeometry(260, 220);
    const matSuelo = new THREE.MeshStandardMaterial({
      color: esOscuro ? 0x171d19 : 0xdfebd9,
      roughness: 0.95
    });
    const suelo = new THREE.Mesh(geoSuelo, matSuelo);
    suelo.rotation.x = -Math.PI / 2;
    suelo.position.y = -0.05;
    suelo.receiveShadow = true;
    escena.add(suelo);

    // Costa: Mar y Playa en el flanco oeste (X < -58)
    if (!soloImbabura) {
      const geoMar = new THREE.PlaneGeometry(35, 220);
      const matMar = new THREE.MeshStandardMaterial({
        color: 0x244f6f,
        roughness: 0.2,
        metalness: 0.3
      });
      const mar = new THREE.Mesh(geoMar, matMar);
      mar.rotation.x = -Math.PI / 2;
      mar.position.set(-72, 0.02, 0);
      escena.add(mar);

      const geoPlaya = new THREE.PlaneGeometry(8, 220);
      const matPlaya = new THREE.MeshStandardMaterial({ color: 0xd4cbb3, roughness: 1.0 });
      const playa = new THREE.Mesh(geoPlaya, matPlaya);
      playa.rotation.x = -Math.PI / 2;
      playa.position.set(-51, 0.04, 0);
      escena.add(playa);
    }

    // Sierra / Imbabura: Volcán Imbabura al fondo (silueta sobria en la lejanía)
    const geoVolcan = new THREE.ConeGeometry(22, 28, 16);
    const matVolcan = new THREE.MeshStandardMaterial({
      color: esOscuro ? 0x222e28 : 0x8a998c,
      roughness: 0.9
    });
    const volcan = new THREE.Mesh(geoVolcan, matVolcan);
    volcan.position.set(65, 14, -68);
    escena.add(volcan);

    // Cumbre suave del volcán
    const geoCumbre = new THREE.ConeGeometry(7, 8, 16);
    const matCumbre = new THREE.MeshStandardMaterial({ color: 0xe6ede8, roughness: 0.7 });
    const cumbre = new THREE.Mesh(geoCumbre, matCumbre);
    cumbre.position.set(65, 24, -68);
    escena.add(cumbre);

    // ── Construcción de las 6 fincas con InstancedMesh para alto rendimiento móvil ──
    const dummy = new THREE.Object3D();
    const geoPlantaEsparrago = new THREE.CylinderGeometry(0.08, 0.22, 1.1, 5);
    const matEsparrago = new THREE.MeshStandardMaterial({ color: 0x47593e, roughness: 0.85 });
    const geoPostePitahaya = new THREE.BoxGeometry(0.25, 1.4, 0.25);
    const matPoste = new THREE.MeshStandardMaterial({ color: 0x8c7e6c, roughness: 0.9 });

    objetosFinca3D.clear();

    for (const f of fincasVisibles) {
      const df = datosFincas[f.codigo];
      const lado = Math.sqrt(f.ha) * 3.4;
      const tieneAlertas = df.alertas.length > 0;

      // Base arquitectónica de la finca (terreno elevado)
      const geoParcela = new THREE.BoxGeometry(lado, 0.7, lado);
      const matParcela = new THREE.MeshStandardMaterial({
        color: new THREE.Color(f.color),
        roughness: 0.88
      });
      const parcela = new THREE.Mesh(geoParcela, matParcela);
      parcela.position.set(f.x, 0.35, f.z);
      parcela.receiveShadow = true;
      parcela.castShadow = true;
      parcela.userData = { codigo: f.codigo, nombre: f.nombre };
      escena.add(parcela);
      objetosFinca3D.set(f.codigo, parcela);

      // Camino interno de tierra afirmada
      const geoCamino = new THREE.PlaneGeometry(lado * 0.92, 1.2);
      const matCamino = new THREE.MeshStandardMaterial({ color: 0xb5a78f, roughness: 1.0 });
      const camino = new THREE.Mesh(geoCamino, matCamino);
      camino.rotation.x = -Math.PI / 2;
      camino.position.set(f.x, 0.71, f.z + lado / 2 - 1.8);
      escena.add(camino);

      // Bodega o galpón agrícola
      const bodegaGrp = new THREE.Group();
      const geoMuros = new THREE.BoxGeometry(3.6, 2.0, 2.6);
      const matMuros = new THREE.MeshStandardMaterial({ color: 0x2a3036, roughness: 0.7 });
      const muros = new THREE.Mesh(geoMuros, matMuros);
      muros.position.y = 1.0;
      muros.castShadow = true;
      bodegaGrp.add(muros);

      const geoTecho = new THREE.ConeGeometry(2.6, 1.1, 4);
      const matTecho = new THREE.MeshStandardMaterial({ color: 0xb8c1cc, roughness: 0.5 });
      const techo = new THREE.Mesh(geoTecho, matTecho);
      techo.rotation.y = Math.PI / 4;
      techo.position.y = 2.45;
      techo.scale.set(1.2, 1, 0.9);
      techo.castShadow = true;
      bodegaGrp.add(techo);

      bodegaGrp.position.set(f.x - lado / 2 + 3.0, 0.7, f.z + lado / 2 - 2.8);
      bodegaGrp.userData = { codigo: f.codigo, esBodega: true };
      escena.add(bodegaGrp);

      // Reservorio de agua con geomembrana y bomba
      const resGrp = new THREE.Group();
      const geoBordeRes = new THREE.BoxGeometry(4.4, 0.45, 4.4);
      const matBordeRes = new THREE.MeshStandardMaterial({ color: 0x1f231f, roughness: 0.9 });
      const bordeRes = new THREE.Mesh(geoBordeRes, matBordeRes);
      bordeRes.position.y = 0.22;
      resGrp.add(bordeRes);

      const geoAgua = new THREE.PlaneGeometry(3.8, 3.8);
      const matAguaRes = new THREE.MeshStandardMaterial({ color: 0x284f70, roughness: 0.15, metalness: 0.4 });
      const aguaRes = new THREE.Mesh(geoAgua, matAguaRes);
      aguaRes.rotation.x = -Math.PI / 2;
      aguaRes.position.y = 0.44;
      resGrp.add(aguaRes);

      // Caseta de cabezal de riego
      const geoCaseta = new THREE.BoxGeometry(1.2, 1.2, 1.2);
      const matCaseta = new THREE.MeshStandardMaterial({ color: 0x5a6570 });
      const caseta = new THREE.Mesh(geoCaseta, matCaseta);
      caseta.position.set(2.8, 0.6, 0);
      resGrp.add(caseta);

      resGrp.position.set(f.x + lado / 2 - 3.2, 0.7, f.z + lado / 2 - 3.2);
      escena.add(resGrp);

      // Camellones y plantas de espárrago con InstancedMesh
      const cantFilas = Math.min(8, Math.floor(lado / 2.2));
      const cantPlantasPorFila = Math.min(10, Math.floor(lado / 1.8));
      const totalPlantas = cantFilas * cantPlantasPorFila;

      const instancedEsparrago = new THREE.InstancedMesh(geoPlantaEsparrago, matEsparrago, totalPlantas);
      instancedEsparrago.castShadow = true;
      let idxInst = 0;

      const pasoX = (lado * 0.75) / cantPlantasPorFila;
      const pasoZ = (lado * 0.65) / cantFilas;

      for (let fi = 0; fi < cantFilas; fi++) {
        const pz = f.z - lado * 0.32 + fi * pasoZ;

        // Manguera de goteo a lo largo de la fila
        const geoManguera = new THREE.BoxGeometry(lado * 0.78, 0.08, 0.08);
        const matManguera = new THREE.MeshStandardMaterial({ color: 0x1f231e });
        const manguera = new THREE.Mesh(geoManguera, matManguera);
        manguera.position.set(f.x, 0.74, pz);
        escena.add(manguera);

        // Fila cosechada (turiones bajos en el suelo) o helechos completos
        const esCosechado = fi === 0;

        for (let pi = 0; pi < cantPlantasPorFila; pi++) {
          const px = f.x - lado * 0.38 + pi * pasoX;
          dummy.position.set(px, esCosechado ? 0.85 : 1.2, pz);
          const escala = esCosechado ? 0.35 : 0.8 + (Math.sin(pi + fi) * 0.2);
          dummy.scale.set(escala, escala, escala);
          dummy.rotation.y = (pi + fi) * 0.4;
          dummy.updateMatrix();
          instancedEsparrago.setMatrixAt(idxInst++, dummy.matrix);
        }
      }

      instancedEsparrago.instanceMatrix.needsUpdate = true;
      escena.add(instancedEsparrago);
      elementosViento.push(instancedEsparrago);

      // Sector de Pitahaya (si es Puerto Cayo)
      if (f.tienePitahaya) {
        const cantPostes = 12;
        const instancedPitahaya = new THREE.InstancedMesh(geoPostePitahaya, matPoste, cantPostes);
        instancedPitahaya.castShadow = true;
        let pIdx = 0;
        for (let r = 0; r < 3; r++) {
          for (let c = 0; c < 4; c++) {
            dummy.position.set(f.x - lado / 2 + 3 + c * 2.0, 1.4, f.z - lado / 2 + 3 + r * 2.0);
            dummy.scale.set(1, 1, 1);
            dummy.updateMatrix();
            instancedPitahaya.setMatrixAt(pIdx++, dummy.matrix);
          }
        }
        instancedPitahaya.instanceMatrix.needsUpdate = true;
        escena.add(instancedPitahaya);
      }

      // Etiqueta CSS2D flotante
      const divEtq = document.createElement("div");
      divEtq.className = "etiqueta-finca-3d";
      divEtq.innerHTML = `
        ${esc(f.nombre)}${tieneAlertas ? `<span class="badge-alerta-3d">${df.alertas.length}</span>` : ""}
        <small>${f.ha} ha · ${esc(f.cultivos[0])}</small>
      `;
      const etiquetaObj = new CSS2DObject(divEtq);
      etiquetaObj.position.set(f.x, 2.5, f.z + lado / 2 + 1.2);
      escena.add(etiquetaObj);
    }

    // Interacción clic/táctil con Raycaster
    const rayo = new THREE.Raycaster();
    const puntero = new THREE.Vector2();

    const alTocar = (ev) => {
      const rect = renderizador.domElement.getBoundingClientRect();
      const clienteX = ev.clientX ?? (ev.touches && ev.touches[0]?.clientX);
      const clienteY = ev.clientY ?? (ev.touches && ev.touches[0]?.clientY);
      if (clienteX == null || clienteY == null) return;

      puntero.x = ((clienteX - rect.left) / rect.width) * 2 - 1;
      puntero.y = -((clienteY - rect.top) / rect.height) * 2 + 1;
      rayo.setFromCamera(puntero, camara);

      const objetosInterseccion = Array.from(objetosFinca3D.values());
      const hits = rayo.intersectObjects(objetosInterseccion, true);
      if (hits.length > 0) {
        let actual = hits[0].object;
        while (actual && !actual.userData?.codigo && actual.parent) {
          actual = actual.parent;
        }
        if (actual?.userData?.codigo) {
          seleccionarFinca(actual.userData.codigo);
        }
      }
    };

    renderizador.domElement.addEventListener("click", alTocar);

    // Bucle de animación suave
    const reloj = new THREE.Clock();

    const loop = () => {
      animacionId = requestAnimationFrame(loop);
      const delta = reloj.getDelta();
      const tiempo = reloj.getElapsedTime();

      // Transición suave de cámara hacia la finca o centro
      if (animarCamara) {
        animarCamara.transcurrido += delta;
        const factor = Math.min(1.0, animarCamara.transcurrido / animarCamara.duracion);
        const tVal = 1 - Math.exp(-factor * 4);
        controles.target.lerp(animarCamara.t, tVal);
        camara.position.lerp(animarCamara.p, tVal);

        if (camara.position.distanceTo(animarCamara.p) < 0.08) {
          controles.target.copy(animarCamara.t);
          camara.position.copy(animarCamara.p);
          animarCamara = null;
        }
      }

      // Animación suave de brisa en el follaje (sin exageración)
      if (!reducido) {
        const balanceo = Math.sin(tiempo * 1.8) * 0.025;
        for (const el of elementosViento) {
          el.rotation.z = balanceo;
        }
      }

      controles.update();
      renderizador.render(escena, camara);
      if (etiquetasRenderer) etiquetasRenderer.render(escena, camara);
    };

    loop();

    // Auto-ajuste por redimensionamiento
    const alRedimensionar = () => {
      const w = panelEscena.clientWidth || 800;
      const h = panelEscena.clientHeight || 550;
      camara.aspect = w / h;
      camara.updateProjectionMatrix();
      renderizador.setSize(w, h);
      etiquetasRenderer.setSize(w, h);
    };

    window.addEventListener("resize", alRedimensionar);
  }

  // ── Conexión de Botones de la Barra Superior ──
  const btnToggle = barraHerramientas.querySelector("#btn-toggle-modo");
  btnToggle.addEventListener("click", () => {
    if (modoVista === "3d") {
      modoVista = "2d";
      btnToggle.textContent = "Ver maqueta 3D";
      renderizarRespaldo2D();
    } else {
      modoVista = "3d";
      btnToggle.textContent = "Ver mapa 2D";
      iniciarEscena3D();
    }
  });

  const btnCentrar = barraHerramientas.querySelector("#btn-centrar-cam");
  btnCentrar.addEventListener("click", () => {
    seleccionarFinca("");
  });

  // Inicio de vista por defecto
  pintarPanelLateral();
  if (modoVista === "3d") {
    iniciarEscena3D();
  } else {
    renderizarRespaldo2D();
  }

  return {
    destruir() {
      if (animacionId) cancelAnimationFrame(animacionId);
      if (renderizador) renderizador.dispose();
      contenedor.innerHTML = "";
    },
    seleccionarFinca,
    modoVista: () => modoVista
  };
}

if (typeof window !== "undefined") {
  window.AgdFincas3D = {
    montarVisorFincas3D,
    esWebGLDisponible,
    FINCAS_DEF,
    FAMILIAS_INVENTARIO
  };
}
