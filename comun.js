/* Compras AgroDávila · núcleo común de la app (sesión, datos en vivo de AgroControl y datos cifrados de WhatsApp).
   Solo LEE AgroControl con el usuario de quien inicia sesión. No escribe nada en AgroControl. */
"use strict";
(function () {
  const SUPABASE_URL = "https://jgjpteeisqyavmbhookz.supabase.co";
  const SUPABASE_KEY = "sb_publishable_DHkbP8g5xUj9BZcR1WxULg_r0u45-75";   // clave pública (publishable) de AgroControl
  const LS_CLAVE = "agd_clave_datos_v1";
  let cliente = null;

  function sb() {
    if (!cliente) cliente = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: true, storageKey: "agd_compras_sesion" } });
    return cliente;
  }
  function limpiarClavesLocales() {
    [localStorage, sessionStorage].forEach(st => {
      try {
        Object.keys(st).filter(k => k.startsWith("agd_") || k.startsWith("compras_")).forEach(k => st.removeItem(k));
      } catch (e) {}
    });
  }
  async function sesion(opts) {
    const { data } = await sb().auth.getSession();
    if (data && data.session) return data.session;
    if (opts && opts.permitirNube && window.AgdNube && AgdNube.inicializar) {
      try {
        await AgdNube.inicializar();
        const est = AgdNube.estado();
        if (est && est.conectado) return { user: { email: est.correo || "" }, nube: true };
      } catch (e) {}
    }
    return null;
  }
  async function entrar(correo, clave) {
    const { data, error } = await sb().auth.signInWithPassword({ email: correo.trim(), password: clave });
    if (error) throw new Error(error.message === "Invalid login credentials" ? "Correo o contraseña incorrectos." : error.message);
    return data.session;
  }
  async function salir() {
    try { await sb().auth.signOut(); } catch (e) {}
    if (window.AgdNube && AgdNube.desconectar) {
      try { await AgdNube.desconectar(); } catch (e) {}
    }
    limpiarClavesLocales();
  }
  async function exigirSesion(opts) {
    const s = await sesion(Object.assign({ permitirNube: true }, opts || {}));
    if (!s) { location.href = "index.html"; throw new Error("sin sesión"); }
    return s;
  }

  async function todo(tabla, orden) {
    let r = [], desde = 0;
    for (;;) {
      let q = sb().from(tabla).select("*").range(desde, desde + 999);
      if (orden) q = q.order(orden, { ascending: true });
      const { data, error } = await q;
      if (error) throw new Error(tabla + ": " + error.message);
      r = r.concat(data || []); if (!data || data.length < 1000) break; desde += 1000;
    }
    return r;
  }

  const p2 = n => String(n).padStart(2, "0");
  const EC_FMT = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Guayaquil", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false
  });
  const _ecPartes = v => {
    if (!v) return null;
    if (window.AgdReglas && AgdReglas.fechaHoraLocal && AgdReglas.fechaLocal) {
      return { fecha: AgdReglas.fechaLocal(v), fechaHora: (AgdReglas.fechaHoraLocal(v) || "").slice(0, 16) };
    }
    const s = String(v).trim();
    const d = (v instanceof Date) ? v : (/^\d{4}-\d{2}-\d{2}$/.test(s) ? new Date(s + "T12:00:00-05:00") : new Date(s));
    if (isNaN(d)) return null;
    const m = {};
    EC_FMT.formatToParts(d).forEach(p => { if (p.type !== "literal") m[p.type] = p.value; });
    const hh = m.hour === "24" ? "00" : m.hour;
    return { fecha: `${m.year}-${m.month}-${m.day}`, fechaHora: `${m.year}-${m.month}-${m.day}T${hh}:${m.minute}` };
  };
  const loc = v => { const p = _ecPartes(v); return p ? p.fechaHora : ""; };
  const dia = v => {
    const s = v ? String(v).trim() : "";
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
    const p = _ecPartes(s);
    return p ? p.fecha : "";
  };

  /* Lee AgroControl en vivo y arma las filas con el mismo formato del exportador (51 columnas). */
  async function snapAgro() {
    const [sols, ocs, peds, cots, hist, fincas, provs, perfiles] = await Promise.all([
      todo("solicitudes", "creado_en"), todo("ordenes_compra", "codigo"), todo("pedidos", "creado_en"), todo("cotizaciones", "creado_en"),
      todo("historial_pedidos", "fecha"), todo("fincas", "nombre"), todo("proveedores", "nombre"), todo("perfiles")]);
    const ids = [...new Set(peds.map(p => p.producto_id).filter(Boolean))];
    let prods = [];
    for (let i = 0; i < ids.length; i += 150) {
      const { data, error } = await sb().from("productos").select("*").in("id", ids.slice(i, i + 150));
      if (error) throw new Error("productos: " + error.message); prods = prods.concat(data || []);
    }
    const M = (a, k) => new Map(a.map(x => [x[k || "id"], x]));
    const mSol = M(sols), mOc = M(ocs), mFin = M(fincas), mProd = M(prods), mProv = M(provs), mPer = M(perfiles);
    const cPorP = {}, hPorP = {};
    cots.forEach(c => (cPorP[c.pedido_id] = cPorP[c.pedido_id] || []).push(c));
    hist.forEach(h => (hPorP[h.pedido_id] = hPorP[h.pedido_id] || []).push(h));
    const nm = id => { const u = mPer.get(id); return u ? (u.nombre || u.correo) : ""; };
    const primera = (p, e) => (hPorP[p.id] || []).filter(x => x.estado === e).map(x => x.fecha).sort()[0] || "";
    const filas = peds.map(p => {
      const o = p.orden_compra_id ? mOc.get(p.orden_compra_id) : null, cs = cPorP[p.id] || [], s = mSol.get(p.solicitud_id) || {};
      const pus = cs.map(c => +c.precio_unitario).filter(x => x > 0), cf = cs.map(c => c.creado_en).sort();
      const sel = cs.find(c => c.proveedor_id === p.proveedor_seleccionado_id);
      const f = mFin.get(p.finca_id || s.finca_id) || {}, pr = mProd.get(p.producto_id) || {}, r = {};
      const put = (k, v) => { if (v !== "" && v != null) r[k] = v; };
      put("Pedido", s.codigo); put("Línea", p.codigo); put("OC (código)", o ? o.codigo : ""); put("Finca", f.nombre); put("Región", f.region); put("Hectáreas", f.hectareas);
      put("Semana", p.semana || s.semana); put("Producto", pr.nombre); put("Categoría", pr.categoria); put("Ingrediente activo", pr.ingrediente_activo);
      put("Cantidad", p.cantidad); put("Unidad", p.unidad); put("Urgencia", p.urgencia); put("Estado (código)", p.estado); put("Solicitó", nm(p.solicitante_id || s.solicitante_id));
      put("F. pedido", loc(p.creado_en || p.fecha_creacion)); put("F. revisión campo", loc(p.fecha_aprobacion_campo || primera(p, "aprobado_campo")));
      put("F. 1ª cotización", loc(cf[0])); put("F. última cotización", loc(cf[cf.length - 1])); put("F. selección proveedor", loc(primera(p, "seleccionado")));
      put("F. autorización", loc(p.fecha_aprobacion || primera(p, "aprobado"))); put("N° cotizaciones", cs.length); put("Precio unit. elegido", p.precio_unitario_seleccionado || "");
      if (pus.length) { put("Precio unit. mínimo", Math.min(...pus)); put("Precio unit. máximo", Math.max(...pus)); }
      const pv = mProv.get(p.proveedor_seleccionado_id); put("Proveedor", pv ? pv.nombre : "");
      if (sel) { if (sel.dias_entrega != null) put("Días entrega ofrecidos", sel.dias_entrega); put("Tipo de pago", sel.tipo_pago); put("Días crédito", sel.plazo_dias || 0); }
      if (o) {
        put("F. OC creada", loc(o.creado_en)); put("F. pago programada", dia(o.fecha_pago_programada)); put("Pago programado el", loc(o.programado_en));
        put("F. pago aprobado (3 OK)", dia(o.fecha_pago_aprobado)); put("N° OC", o.numero_oc); put("F. registro N° OC", loc(o.oc_fecha));
        put("F. check final", loc(o.fecha_check_final)); put("F. pago realizado", loc(o.fecha_pago_realizado));
      }
      put("F. entrega", loc(o ? o.fecha_entrega : p.fecha_entrega)); put("Motivo rechazo", p.motivo_rechazo); put("Motivo anulación", p.motivo_anulacion);
      put("Revisó campo", nm(p.aprobador_campo_id));
      if (pus.length) put("Precio unit. promedio", +(pus.reduce((a, b) => a + b, 0) / pus.length).toFixed(4));
      if (o) { put("OK Lola (día)", dia(o.pago_lola_fecha)); put("OK Daniela (día)", dia(o.pago_daniela_fecha)); put("OK Gerencia (día)", dia(o.pago_gerencia_fecha)); put("Estado OC", o.estado); put("Corrección", o.correccion_estado); }
      put("F. anulación", loc(p.fecha_anulacion)); put("Comentario compras", p.comentario_compras); put("Comentario contabilidad", p.comentario_contabilidad); put("Última edición", loc(p.actualizado_en));
      return r;
    });
    const s = await sesion();
    return { generado: loc(new Date()), vivo: true, usuario: s && s.user ? s.user.email : "", filas };
  }

  /* Excel de 51 columnas para pegar en Datos_AgroControl del Modelo de Gestión (reemplaza al favorito Exportador). */
  const COLS = ["Pedido","Línea","OC (código)","Finca","Región","Hectáreas","Semana","Producto","Categoría","Ingrediente activo","Cantidad","Unidad","Urgencia","Estado (código)","Solicitó","Revisó campo","F. pedido","F. revisión campo","F. 1ª cotización","F. última cotización","F. selección proveedor","F. autorización","N° cotizaciones","Precio unit. elegido","Precio unit. mínimo","Precio unit. máximo","Precio unit. promedio","Proveedor","Días entrega ofrecidos","Tipo de pago","Días crédito","F. OC creada","F. pago programada","Pago programado el","OK Lola (día)","OK Daniela (día)","OK Gerencia (día)","F. pago aprobado (3 OK)","N° OC","F. registro N° OC","F. check final","F. pago realizado","F. entrega","Estado OC","Corrección","Motivo rechazo","Motivo anulación","F. anulación","Comentario compras","Comentario contabilidad","Última edición"];
  function aFechaExcel(v) { if (!v) return ""; const s = String(v); if (/^\d{4}-\d{2}-\d{2}$/.test(s)) { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); } const d = new Date(s.length === 16 ? s + ":00" : s); return isNaN(d) ? s : d; }
  function excelMatriz(filas) {
    if (!window.XLSX) throw new Error("No cargó la librería de Excel. Revise la conexión.");
    const esF = c => c.startsWith("F. ") || c === "Pago programado el" || c === "Última edición" || c.includes("(día)");
    const datos = filas.map(r => { const o = {}; COLS.forEach(c => { const v = r[c]; o[c] = v == null ? "" : (esF(c) ? aFechaExcel(v) : v); }); return o; });
    const ws = XLSX.utils.json_to_sheet(datos, { header: COLS, cellDates: true, dateNF: "dd/mm/yyyy hh:mm" });
    const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, "Datos");
    const hoyEc = dia(new Date()) || `${new Date().getFullYear()}-${p2(new Date().getMonth() + 1)}-${p2(new Date().getDate())}`;
    XLSX.writeFile(wb, `matriz_agrocontrol_${hoyEc}.xlsx`, { cellDates: true });
  }

  /* ---- Datos de WhatsApp cifrados (AES-GCM, clave derivada con PBKDF2) ---- */
  const b64 = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));
  const a64 = buf => btoa(String.fromCharCode(...new Uint8Array(buf)));
  async function claveDesdeFrase(frase, sal, iter) {
    const base = await crypto.subtle.importKey("raw", new TextEncoder().encode(frase), "PBKDF2", false, ["deriveKey"]);
    return crypto.subtle.deriveKey({ name: "PBKDF2", salt: sal, iterations: iter, hash: "SHA-256" }, base, { name: "AES-GCM", length: 256 }, true, ["decrypt"]);
  }
  async function leerPaquete() { const r = await fetch("datos_wa.enc.json", { cache: "no-cache" }); if (!r.ok) throw new Error("No se encontró el paquete de datos."); return r.json(); }
  async function abrirDatos(frase, recordar) {
    const pq = await leerPaquete();
    const k = await claveDesdeFrase(frase, b64(pq.sal), pq.iter);
    const json = await descifrar(pq, k);
    if (recordar) { try { localStorage.setItem(LS_CLAVE, a64(await crypto.subtle.exportKey("raw", k))); } catch (e) {} }
    else { try { sessionStorage.setItem(LS_CLAVE, a64(await crypto.subtle.exportKey("raw", k))); } catch (e) {} }
    return json;
  }
  async function descifrar(pq, k) {
    try {
      const plano = await crypto.subtle.decrypt({ name: "AES-GCM", iv: b64(pq.iv) }, k, b64(pq.datos));
      return JSON.parse(new TextDecoder().decode(plano));
    } catch (e) { throw new Error("Clave de datos incorrecta."); }
  }
  async function datosWA() {
    let raw = null; try { raw = localStorage.getItem(LS_CLAVE) || sessionStorage.getItem(LS_CLAVE); } catch (e) {}
    if (!raw) return null;
    const k = await crypto.subtle.importKey("raw", b64(raw), "AES-GCM", false, ["decrypt"]);
    return descifrar(await leerPaquete(), k);
  }
  const tieneClave = () => { try { return !!(localStorage.getItem(LS_CLAVE) || sessionStorage.getItem(LS_CLAVE)); } catch (e) { return false; } };

  /* El marco visual (barra, guías, recorrido) está en guia.js */
  if ("serviceWorker" in navigator && location.protocol === "https:") navigator.serviceWorker.register("sw.js").catch(() => {});
  async function corteWA() {
    try {
      const pq = await leerPaquete();
      const iso = pq.corte || "";
      if (iso && window.AgdNube && AgdNube.registrarFrescura) AgdNube.registrarFrescura("whatsapp", iso);
      return iso;
    } catch (e) { return ""; }
  }

  /* Lectura unificada: primero Firestore (espacios/agrodavila/agrocontrol/resumen + filas_N), Supabase solo si se fuerza o falta en la nube. */
  async function filasAgro(opts) {
    const forzar = !!(opts && opts.forzar);
    if (!forzar && window.AgdNube && AgdNube.leerAgrocontrol) {
      try {
        const fs = await AgdNube.leerAgrocontrol();
        if (fs && Array.isArray(fs.filas) && fs.filas.length) return fs;
      } catch (e) {}
    }
    const { data } = await sb().auth.getSession();
    if (data && data.session) {
      const vivo = await snapAgro();
      if (window.AgdNube && AgdNube.registrarFrescura) AgdNube.registrarFrescura("agrocontrol", vivo.generado);
      return vivo;
    }
    if (forzar && window.AgdNube && AgdNube.leerAgrocontrol) {
      const fs = await AgdNube.leerAgrocontrol();
      if (fs && Array.isArray(fs.filas) && fs.filas.length) return fs;
      throw new Error("Inicie sesión en AgroControl para consultar en vivo; sin lectura en la nube.");
    }
    throw new Error("No se encontró lectura de AgroControl disponible.");
  }

  function esHorarioLaboral(d) {
    const f = d || new Date();
    try {
      const p = new Intl.DateTimeFormat("en-US", { timeZone: "America/Guayaquil", weekday: "short", hour: "numeric", minute: "numeric", hour12: false }).formatToParts(f);
      const m = {}; p.forEach(x => { m[x.type] = x.value; });
      const dia = m.weekday || ""; // Sun, Mon, Tue, Wed, Thu, Fri, Sat
      if (dia === "Sun") return false;
      const min = Number(m.hour || 0) * 60 + Number(m.minute || 0);
      return min >= 7 * 60 && min <= 18 * 60 + 30; // 07:00 a 18:30
    } catch (e) {
      const dia = f.getDay();
      if (dia === 0) return false;
      const min = f.getHours() * 60 + f.getMinutes();
      return min >= 7 * 60 && min <= 18 * 60 + 30;
    }
  }

  async function frescuraFuentes() {
    const base = (window.AgdNube && AgdNube.resumenFrescura) ? await AgdNube.resumenFrescura() : {};
    const cWa = await corteWA();
    if (cWa && !base.whatsapp) base.whatsapp = cWa;
    const ahora = Date.now();
    const enLaboral = esHorarioLaboral(new Date(ahora));
    const umbralMs = enLaboral ? (2 * 3600 * 1000) : (12 * 3600 * 1000);

    const evaluar = (clave, etiqueta) => {
      const iso = base[clave] || "";
      const ms = iso ? Date.parse(iso) : NaN;
      const edadHoras = !isNaN(ms) ? Math.max(0, (ahora - ms) / 3600000) : null;
      const atrasada = edadHoras === null || (ahora - ms) > umbralMs;
      return {
        fuente: clave,
        etiqueta,
        fecha: iso,
        edadHoras,
        enLaboral,
        atrasada,
        estado: atrasada ? "dato desactualizado" : "al día"
      };
    };
    return {
      agrocontrol: evaluar("agrocontrol", "AgroControl"),
      whatsapp: evaluar("whatsapp", "WhatsApp"),
      recepciones: evaluar("recepciones", "Recepciones"),
      vehiculos: evaluar("vehiculos", "Vehículos")
    };
  }

  window.ComprasApp = { sb, sesion, entrar, salir, exigirSesion, snapAgro, filasAgro, frescuraFuentes, abrirDatos, datosWA, tieneClave, excelMatriz, corteWA };
})();
