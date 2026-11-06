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
  async function sesion() { const { data } = await sb().auth.getSession(); return data.session || null; }
  async function entrar(correo, clave) {
    const { data, error } = await sb().auth.signInWithPassword({ email: correo.trim(), password: clave });
    if (error) throw new Error(error.message === "Invalid login credentials" ? "Correo o contraseña incorrectos." : error.message);
    return data.session;
  }
  async function salir() { try { await sb().auth.signOut(); } catch (e) {} try { localStorage.removeItem(LS_CLAVE); sessionStorage.clear(); } catch (e) {} }
  async function exigirSesion() { const s = await sesion(); if (!s) { location.href = "index.html"; throw new Error("sin sesión"); } return s; }

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
  const loc = v => { if (!v) return ""; const d = new Date(v); if (isNaN(d)) return ""; return d.getFullYear() + "-" + p2(d.getMonth() + 1) + "-" + p2(d.getDate()) + "T" + p2(d.getHours()) + ":" + p2(d.getMinutes()); };
  const dia = v => v ? String(v).slice(0, 10) : "";

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
      return r;
    });
    const s = await sesion();
    return { generado: loc(new Date()), vivo: true, usuario: s && s.user ? s.user.email : "", filas };
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

  if ("serviceWorker" in navigator && location.protocol === "https:") navigator.serviceWorker.register("sw.js").catch(() => {});
  window.ComprasApp = { sb, sesion, entrar, salir, exigirSesion, snapAgro, abrirDatos, datosWA, tieneClave };
})();
