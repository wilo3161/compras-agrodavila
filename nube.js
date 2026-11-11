/* Compras AgroDávila · Sincronización en la nube con Firebase (Cloud Firestore + Google Auth).
   Usa Firebase JS SDK modular v10 desde CDN con persistencia sin conexión.
   Si el usuario no inició sesión con Google, todo sigue funcionando localmente (localStorage). */
"use strict";
(function () {
  const VERSION_SDK = "10.12.2";
  const CDN_BASE = `https://www.gstatic.com/firebasejs/${VERSION_SDK}`;
  const RAIZ = "espacios/agrodavila";
  const LS_CAPA = "compras_wa_v1";
  const LS_TEL = "agd_tel_proveedores";
  const LS_KRALJIC = "agd_kraljic";
  const LS_PASOS = "agd_pasos";
  const LS_CHECKLIST = "agd_checklist_v1";
  const LS_HISTORIAL = "agd_checklist_hist_v1";
  const LS_FRESCURA = "agd_frescura_fuentes_v1";
  const COLS_51_AGRO = [
    "Pedido", "Línea", "OC (código)", "Finca", "Región", "Hectáreas", "Semana", "Producto", "Categoría",
    "Ingrediente activo", "Cantidad", "Unidad", "Urgencia", "Estado (código)", "Solicitó", "Revisó campo",
    "F. pedido", "F. revisión campo", "F. 1ª cotización", "F. última cotización", "F. selección proveedor",
    "F. autorización", "N° cotizaciones", "Precio unit. elegido", "Precio unit. mínimo", "Precio unit. máximo",
    "Precio unit. promedio", "Proveedor", "Días entrega ofrecidos", "Tipo de pago", "Días crédito", "F. OC creada",
    "F. pago programada", "Pago programado el", "OK Lola (día)", "OK Daniela (día)", "OK Gerencia (día)",
    "F. pago aprobado (3 OK)", "N° OC", "F. registro N° OC", "F. check final", "F. pago realizado", "F. entrega",
    "Estado OC", "Corrección", "Motivo rechazo", "Motivo anulación", "F. anulación", "Comentario compras",
    "Comentario contabilidad", "Última edición"
  ];

  let modApp = null, modAuth = null, modFs = null;
  let app = null, auth = null, db = null;
  let usuarioActual = null;
  let promesaInicio = null;
  let oyentesEstado = [];
  let unsubBorradores = null, unsubTelefonos = null, unsubAjustes = null;

  function configLista() {
    const cfg = window.AGD_FIREBASE_CONFIG;
    return !!(cfg && cfg.apiKey && cfg.projectId);
  }

  function esMovil() {
    return /android|iphone|ipad|ipod|mobile/i.test(navigator.userAgent || "") ||
      (window.matchMedia && window.matchMedia("(max-width: 760px)").matches);
  }

  function chatIdSeguro(chat) {
    const s = String(chat || "").trim();
    if (!s) return "";
    try {
      const bytes = new TextEncoder().encode(s);
      let bin = "";
      bytes.forEach(b => { bin += String.fromCharCode(b); });
      return "c_" + btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
    } catch (e) {
      return "c_" + encodeURIComponent(s).replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 120);
    }
  }

  function msFecha(iso) {
    if (!iso) return 0;
    const t = Date.parse(iso);
    return isNaN(t) ? 0 : t;
  }

  function notificarEstado() {
    const est = estado();
    oyentesEstado.forEach(fn => { try { fn(est); } catch (e) {} });
  }

  async function inicializar() {
    if (!configLista()) return false;
    if (promesaInicio) return promesaInicio;
    promesaInicio = (async () => {
      try {
        [modApp, modAuth, modFs] = await Promise.all([
          import(`${CDN_BASE}/firebase-app.js`),
          import(`${CDN_BASE}/firebase-auth.js`),
          import(`${CDN_BASE}/firebase-firestore.js`)
        ]);
        const cfg = window.AGD_FIREBASE_CONFIG;
        app = modApp.getApps().length ? modApp.getApp() : modApp.initializeApp(cfg);
        auth = modAuth.getAuth(app);
        try {
          db = modFs.initializeFirestore(app, {
            localCache: modFs.persistentLocalCache({
              tabManager: modFs.persistentMultipleTabManager()
            })
          });
        } catch (e) {
          db = modFs.getFirestore(app);
        }
        try { await modAuth.getRedirectResult(auth); } catch (e) {}
        await new Promise(resolve => {
          let resuelto = false;
          modAuth.onAuthStateChanged(auth, u => {
            usuarioActual = u || null;
            notificarEstado();
            if (!resuelto) { resuelto = true; resolve(); }
          });
        });
        return true;
      } catch (e) {
        promesaInicio = null;
        return false;
      }
    })();
    return promesaInicio;
  }

  function estado() {
    return {
      configurado: configLista(),
      conectado: !!usuarioActual,
      correo: usuarioActual ? (usuarioActual.email || "") : "",
      nombre: usuarioActual ? (usuarioActual.displayName || "") : "",
      uid: usuarioActual ? (usuarioActual.uid || "") : ""
    };
  }

  function alCambiarEstado(cb) {
    if (typeof cb === "function") {
      oyentesEstado.push(cb);
      inicializar().then(() => { try { cb(estado()); } catch (e) {} });
    }
  }

  async function conectar() {
    if (!configLista()) {
      throw new Error("Falta configurar las credenciales públicas de Firebase en firebase_config.js.");
    }
    const ok = await inicializar();
    if (!ok || !auth) throw new Error("No se pudo cargar Firebase. Revise su conexión a internet.");
    const proveedor = new modAuth.GoogleAuthProvider();
    proveedor.setCustomParameters({ prompt: "select_account" });
    if (esMovil()) {
      try {
        const res = await modAuth.signInWithPopup(auth, proveedor);
        usuarioActual = res.user;
        notificarEstado();
        return estado();
      } catch (err) {
        if (err && (err.code === "auth/popup-blocked" || err.code === "auth/operation-not-supported-in-this-environment")) {
          await modAuth.signInWithRedirect(auth, proveedor);
          return estado();
        }
        throw err;
      }
    } else {
      const res = await modAuth.signInWithPopup(auth, proveedor);
      usuarioActual = res.user;
      notificarEstado();
      return estado();
    }
  }

  function limpiarClavesLocales() {
    [localStorage, sessionStorage].forEach(st => {
      try {
        Object.keys(st).filter(k => k.startsWith("agd_") || k.startsWith("compras_")).forEach(k => st.removeItem(k));
      } catch (e) {}
    });
  }

  function leerFrescuraLocal() {
    try { return JSON.parse(localStorage.getItem(LS_FRESCURA) || "{}"); } catch (e) { return {}; }
  }

  function registrarFrescura(fuente, iso) {
    if (!fuente || !iso) return;
    const actual = leerFrescuraLocal();
    if (!actual[fuente] || msFecha(iso) >= msFecha(actual[fuente])) {
      actual[fuente] = String(iso);
      try { localStorage.setItem(LS_FRESCURA, JSON.stringify(actual)); } catch (e) {}
    }
  }

  async function desconectar() {
    if (unsubBorradores) { try { unsubBorradores(); } catch (e) {} unsubBorradores = null; }
    if (unsubTelefonos) { try { unsubTelefonos(); } catch (e) {} unsubTelefonos = null; }
    if (unsubAjustes) { try { unsubAjustes(); } catch (e) {} unsubAjustes = null; }
    if (unsubChecklist) { try { unsubChecklist(); } catch (e) {} unsubChecklist = null; }
    if (unsubConversaciones) { try { unsubConversaciones(); } catch (e) {} unsubConversaciones = null; }
    if (unsubBandeja) { try { unsubBandeja(); } catch (e) {} unsubBandeja = null; }
    unsubMatrizVivo.forEach(u => { try { u(); } catch (e) {} });
    unsubMatrizVivo = [];
    Object.keys(_unsubsErp).forEach(k => { try { _unsubsErp[k](); } catch (e) {} delete _unsubsErp[k]; });
    if (auth && modAuth) {
      try { await modAuth.signOut(auth); } catch (e) {}
    }
    if (db && modFs) {
      const inst = db;
      db = null;
      promesaInicio = null;
      try { if (modFs.terminate) await modFs.terminate(inst); } catch (e) {}
      try { if (modFs.clearIndexedDbPersistence) await modFs.clearIndexedDbPersistence(inst); } catch (e) {}
    }
    limpiarClavesLocales();
    usuarioActual = null;
    notificarEstado();
  }

  /* ── Borradores: espacios/agrodavila/borradores/{id} ──────────────────────── */
  async function guardarBorrador(id, datosBor) {
    if (!id) return;
    await inicializar();
    if (!db || !usuarioActual) return;
    const ahora = (datosBor && datosBor.actualizado_en) || new Date().toISOString();
    const docRef = modFs.doc(db, `${RAIZ}/borradores/${id}`);
    const carga = {
      estado: (datosBor && datosBor.estado) || "propuesto",
      texto: (datosBor && datosBor.texto) != null ? String(datosBor.texto) : "",
      enviado_en: (datosBor && datosBor.enviado_en) || null,
      actualizado_en: ahora,
      actualizado_por: usuarioActual.email || ""
    };
    try { await modFs.setDoc(docRef, carga, { merge: true }); } catch (e) {}
  }

  async function sincronizarBorradores(CAPA, alActualizar) {
    await inicializar();
    if (!db || !usuarioActual) return null;
    if (unsubBorradores) { try { unsubBorradores(); } catch (e) {} }
    const colRef = modFs.collection(db, `${RAIZ}/borradores`);

    unsubBorradores = modFs.onSnapshot(colRef, snap => {
      let huboCambioLocal = false;
      const remotos = {};
      snap.forEach(d => { remotos[d.id] = d.data(); });

      // 1. De nube a local (gana actualizado_en más reciente)
      Object.keys(remotos).forEach(id => {
        const rem = remotos[id] || {};
        const loc = (CAPA.bor && CAPA.bor[id]) || null;
        const tRem = msFecha(rem.actualizado_en || rem.enviado_en);
        const tLoc = loc ? msFecha(loc.actualizado_en || loc.enviado_en) : -1;
        if (!loc || tRem > tLoc) {
          CAPA.bor[id] = Object.assign({}, loc || {}, {
            estado: rem.estado || (loc && loc.estado) || "propuesto",
            texto: rem.texto != null ? rem.texto : (loc && loc.texto) || "",
            enviado_en: rem.enviado_en || null,
            actualizado_en: rem.actualizado_en || new Date().toISOString(),
            actualizado_por: rem.actualizado_por || ""
          });
          huboCambioLocal = true;
        }
      });

      // 2. De local a nube (subir los que sean más recientes en local o no estén en nube)
      Object.keys(CAPA.bor || {}).forEach(id => {
        const loc = CAPA.bor[id];
        if (!loc) return;
        const rem = remotos[id];
        const tLoc = msFecha(loc.actualizado_en || loc.enviado_en);
        const tRem = rem ? msFecha(rem.actualizado_en || rem.enviado_en) : -1;
        if (!rem || tLoc > tRem) {
          if (!loc.actualizado_en) loc.actualizado_en = loc.enviado_en || new Date().toISOString();
          guardarBorrador(id, loc);
        }
      });

      if (huboCambioLocal) {
        try { localStorage.setItem(LS_CAPA, JSON.stringify(CAPA)); } catch (e) {}
        if (typeof alActualizar === "function") { try { alActualizar(); } catch (e) {} }
      }
    }, () => {});
    return unsubBorradores;
  }

  /* ── Teléfonos: espacios/agrodavila/telefonos/{chatSeguro} ────────────────── */
  function leerMapaTel() {
    try {
      const crudo = JSON.parse(localStorage.getItem(LS_TEL) || "{}");
      const meta = JSON.parse(localStorage.getItem(LS_TEL + "_meta") || "{}");
      return { crudo, meta };
    } catch (e) { return { crudo: {}, meta: {} }; }
  }

  function escribirMapaTel(crudo, meta) {
    try {
      localStorage.setItem(LS_TEL, JSON.stringify(crudo));
      localStorage.setItem(LS_TEL + "_meta", JSON.stringify(meta));
    } catch (e) {}
  }

  async function guardarTelefono(chat, numero) {
    if (!chat) return;
    const ahora = new Date().toISOString();
    const { crudo, meta } = leerMapaTel();
    if (numero) crudo[chat] = numero; else delete crudo[chat];
    meta[chat] = ahora;
    escribirMapaTel(crudo, meta);

    await inicializar();
    if (!db || !usuarioActual) return;
    const idSeg = chatIdSeguro(chat);
    if (!idSeg) return;
    const docRef = modFs.doc(db, `${RAIZ}/telefonos/${idSeg}`);
    try {
      await modFs.setDoc(docRef, {
        chat: String(chat),
        numero: String(numero || ""),
        actualizado_en: ahora
      }, { merge: true });
    } catch (e) {}
  }

  async function sincronizarTelefonos(alActualizar) {
    await inicializar();
    if (!db || !usuarioActual) return null;
    if (unsubTelefonos) { try { unsubTelefonos(); } catch (e) {} }
    const colRef = modFs.collection(db, `${RAIZ}/telefonos`);

    unsubTelefonos = modFs.onSnapshot(colRef, snap => {
      const { crudo, meta } = leerMapaTel();
      let cambio = false;
      const remotosPorChat = {};
      snap.forEach(d => {
        const data = d.data() || {};
        if (data.chat) remotosPorChat[data.chat] = data;
      });

      Object.keys(remotosPorChat).forEach(chat => {
        const rem = remotosPorChat[chat];
        const tRem = msFecha(rem.actualizado_en);
        const tLoc = msFecha(meta[chat]);
        if (tRem > tLoc || (crudo[chat] === undefined && rem.numero)) {
          if (rem.numero) crudo[chat] = rem.numero; else delete crudo[chat];
          meta[chat] = rem.actualizado_en || new Date().toISOString();
          cambio = true;
        }
      });

      Object.keys(crudo).forEach(chat => {
        const rem = remotosPorChat[chat];
        const tLoc = msFecha(meta[chat]);
        const tRem = rem ? msFecha(rem.actualizado_en) : -1;
        if (!rem || tLoc > tRem) {
          const ahora = meta[chat] || new Date().toISOString();
          meta[chat] = ahora;
          const idSeg = chatIdSeguro(chat);
          if (idSeg) {
            modFs.setDoc(modFs.doc(db, `${RAIZ}/telefonos/${idSeg}`), {
              chat,
              numero: String(crudo[chat] || ""),
              actualizado_en: ahora
            }, { merge: true }).catch(() => {});
          }
        }
      });

      if (cambio) {
        escribirMapaTel(crudo, meta);
        if (typeof alActualizar === "function") { try { alActualizar(crudo); } catch (e) {} }
      }
    }, () => {});
    return unsubTelefonos;
  }

  /* ── Ajustes: espacios/agrodavila/ajustes/app ─────────────────────────────── */
  async function guardarAjustes(parcial) {
    await inicializar();
    if (!db || !usuarioActual) return;
    const docRef = modFs.doc(db, `${RAIZ}/ajustes/app`);
    try {
      const kraljic = (parcial && parcial.kraljic) || JSON.parse(localStorage.getItem(LS_KRALJIC) || "{}");
      const pasos = (parcial && parcial.pasos) || JSON.parse(localStorage.getItem(LS_PASOS) || "{}");
      await modFs.setDoc(docRef, {
        kraljic,
        pasos,
        actualizado_en: new Date().toISOString(),
        actualizado_por: usuarioActual.email || ""
      }, { merge: true });
    } catch (e) {}
  }

  async function sincronizarAjustes(alActualizar) {
    await inicializar();
    if (!db || !usuarioActual) return null;
    if (unsubAjustes) { try { unsubAjustes(); } catch (e) {} }
    const docRef = modFs.doc(db, `${RAIZ}/ajustes/app`);
    unsubAjustes = modFs.onSnapshot(docRef, snap => {
      if (!snap.exists()) {
        guardarAjustes({});
        return;
      }
      const data = snap.data() || {};
      let cambio = false;
      try {
        if (data.pasos && typeof data.pasos === "object") {
          const locP = JSON.parse(localStorage.getItem(LS_PASOS) || "{}");
          const mezP = Object.assign({}, locP, data.pasos);
          if (JSON.stringify(mezP) !== JSON.stringify(locP)) {
            localStorage.setItem(LS_PASOS, JSON.stringify(mezP));
            cambio = true;
          }
        }
        if (data.kraljic && typeof data.kraljic === "object") {
          const locK = JSON.parse(localStorage.getItem(LS_KRALJIC) || "{}");
          const mezK = Object.assign({}, locK, data.kraljic);
          if (JSON.stringify(mezK) !== JSON.stringify(locK)) {
            localStorage.setItem(LS_KRALJIC, JSON.stringify(mezK));
            cambio = true;
          }
        }
      } catch (e) {}
      if (cambio && typeof alActualizar === "function") { try { alActualizar(data); } catch (e) {} }
    }, () => {});
    return unsubAjustes;
  }

  /* ── Matriz de proveedores: espacios/agrodavila/proveedores/{proveedorId} ── */
  const LS_MATRIZ = "agd_matriz_proveedores_v1";

  function leerMatrizLocal() {
    try { return JSON.parse(localStorage.getItem(LS_MATRIZ) || "{}"); } catch (e) { return {}; }
  }

  function escribirMatrizLocal(mapa) {
    try { localStorage.setItem(LS_MATRIZ, JSON.stringify(mapa)); } catch (e) {}
  }

  function normalizarProveedor(id, base) {
    const p = base || {};
    const cond = p.condiciones || {};
    return {
      id: String(id || p.id || ""),
      nombre: p.nombre || "",
      razon_social: p.razon_social || "",
      ruc: p.ruc || "",
      contacto: p.contacto || "",
      cargo: p.cargo || "",
      correo: p.correo || "",
      telefono: p.telefono || "",
      ciudad: p.ciudad && p.ciudad !== "—" ? p.ciudad : "",
      zona: p.zona || "",
      cobertura: p.cobertura || "",
      categorias: Array.isArray(p.categorias) ? p.categorias : [],
      condiciones_pago: p.condiciones_pago != null ? p.condiciones_pago : (cond.pago || ""),
      dias_credito: p.dias_credito != null ? Number(p.dias_credito) || 0 : (Number(cond.credito_dias) || 0),
      requisitos_credito: p.requisitos_credito || "",
      ficha_tecnica: Boolean(p.ficha_tecnica),
      fichas_detalle: p.fichas_detalle || "",
      lista_precios: Boolean(p.lista_precios),
      fecha_lista_precios: p.fecha_lista_precios || "",
      garantia: p.garantia || "",
      caducidad_ok: Boolean(p.caducidad_ok),
      estado_datos: ["pendiente", "recibido", "incompleto"].includes(p.estado_datos) ? p.estado_datos : "pendiente",
      notas: p.notas || "",
      chat: p.chat || "",
      actualizado_en: p.actualizado_en || new Date().toISOString(),
      actualizado_por: p.actualizado_por || (usuarioActual ? usuarioActual.email || "" : "local")
    };
  }

  async function guardarProveedorMatriz(id, datos) {
    if (!id) throw new Error("Falta el identificador del proveedor.");
    const ahora = new Date().toISOString();
    const mapa = leerMatrizLocal();
    const previo = mapa[id] || {};
    const limpio = normalizarProveedor(id, Object.assign({}, previo, datos, {
      actualizado_en: ahora,
      actualizado_por: usuarioActual ? (usuarioActual.email || "") : "local"
    }));
    mapa[id] = limpio;
    escribirMatrizLocal(mapa);

    await inicializar();
    if (db && usuarioActual) {
      const docRef = modFs.doc(db, `${RAIZ}/proveedores/${id}`);
      const copia = Object.assign({}, limpio);
      delete copia.id;
      await modFs.setDoc(docRef, copia, { merge: true });
    }
    return limpio;
  }

  async function cargarProveedoresDesdeWA(listaBase) {
    if (!Array.isArray(listaBase) || !listaBase.length) return { creados: 0, total: 0 };
    const { crudo: mapaTel } = leerMapaTel();
    const mapaLoc = leerMatrizLocal();
    let creados = 0;

    await inicializar();
    let existentesRemotos = {};
    if (db && usuarioActual) {
      try {
        const snap = await modFs.getDocs(modFs.collection(db, `${RAIZ}/proveedores`));
        snap.forEach(d => { existentesRemotos[d.id] = d.data(); });
      } catch (e) {}
    }

    for (const b of listaBase) {
      if (!b || !b.id) continue;
      const yaExiste = Boolean(existentesRemotos[b.id] || mapaLoc[b.id]);
      if (yaExiste) continue;
      const tel = (b.chat && mapaTel[b.chat]) ? mapaTel[b.chat] : (b.telefono || "");
      const docNuevo = normalizarProveedor(b.id, Object.assign({}, b, { telefono: tel }));
      mapaLoc[b.id] = docNuevo;
      creados++;
      if (db && usuarioActual) {
        const copia = Object.assign({}, docNuevo);
        delete copia.id;
        try { await modFs.setDoc(modFs.doc(db, `${RAIZ}/proveedores/${b.id}`), copia, { merge: true }); } catch (e) {}
      }
    }
    escribirMatrizLocal(mapaLoc);
    return { creados, total: Object.keys(Object.assign({}, mapaLoc, existentesRemotos)).length };
  }

  async function escucharMatriz(cb, alError) {
    const emitirLocal = () => {
      const m = leerMatrizLocal();
      const lista = Object.keys(m).map(id => normalizarProveedor(id, m[id]));
      if (typeof cb === "function") cb(lista, { fuente: "local" });
    };

    await inicializar();
    if (!db || !usuarioActual) {
      emitirLocal();
      return () => {};
    }

    const colRef = modFs.collection(db, `${RAIZ}/proveedores`);
    return modFs.onSnapshot(colRef, snap => {
      const mLoc = leerMatrizLocal();
      const remotos = {};
      snap.forEach(d => { remotos[d.id] = d.data(); });

      // Resolver conflictos por actualizado_en entre local y nube
      const todosIds = new Set([...Object.keys(mLoc), ...Object.keys(remotos)]);
      todosIds.forEach(id => {
        const loc = mLoc[id];
        const rem = remotos[id];
        const tLoc = loc ? msFecha(loc.actualizado_en) : -1;
        const tRem = rem ? msFecha(rem.actualizado_en) : -1;
        if (rem && tRem >= tLoc) {
          mLoc[id] = normalizarProveedor(id, rem);
        } else if (loc && tLoc > tRem) {
          const copia = Object.assign({}, normalizarProveedor(id, loc));
          delete copia.id;
          modFs.setDoc(modFs.doc(db, `${RAIZ}/proveedores/${id}`), copia, { merge: true }).catch(() => {});
        }
      });

      escribirMatrizLocal(mLoc);
      const lista = Object.keys(mLoc).map(id => normalizarProveedor(id, mLoc[id]));
      if (typeof cb === "function") cb(lista, { fuente: "nube" });
    }, err => {
      emitirLocal();
      if (typeof alError === "function") alError(err);
    });
  }

  /* Matriz en vivo de Gerencia: el motor (según programación) deja en la nube el resumen de AgroControl y los enlaces del
     Excel que se actualiza solo. Solo los correos autorizados pueden leerlos. cb({excel, resumen}) en cada cambio. */
  let unsubMatrizVivo = [];
  async function escucharMatrizEnVivo(cb) {
    await inicializar();
    unsubMatrizVivo.forEach(u => { try { u(); } catch (e) {} });
    unsubMatrizVivo = [];
    if (!db || !usuarioActual || typeof cb !== "function") return false;
    const actual = { excel: null, resumen: null };
    const oir = (ruta, clave) => modFs.onSnapshot(modFs.doc(db, ruta), snap => {
      actual[clave] = snap.exists() ? snap.data() : null;
      cb(Object.assign({}, actual));
    }, () => cb(Object.assign({}, actual, { error: true })));
    unsubMatrizVivo.push(oir(`${RAIZ}/ajustes/excel`, "excel"), oir(`${RAIZ}/agrocontrol/resumen`, "resumen"));
    return true;
  }

  /* Lectura completa de AgroControl desde Firestore (resumen + filas_N): permite consultar sin usuario Supabase. */
  async function leerAgrocontrol() {
    await inicializar();
    if (!db || !usuarioActual) return null;
    try {
      const resSnap = await modFs.getDoc(modFs.doc(db, `${RAIZ}/agrocontrol/resumen`));
      if (!resSnap.exists()) return null;
      const res = resSnap.data() || {};
      const cols = Array.isArray(res.columnas) && res.columnas.length ? res.columnas : COLS_51_AGRO;
      const nTrozos = Math.max(0, Number(res.trozos || 0));
      if (!nTrozos) return null;
      const snaps = await Promise.all(
        Array.from({ length: nTrozos }, (_, idx) => modFs.getDoc(modFs.doc(db, `${RAIZ}/agrocontrol/filas_${idx}`)))
      );
      const filas = [];
      snaps.forEach(s => {
        if (!s.exists()) return;
        const d = s.data() || {};
        let arr = [];
        try { arr = JSON.parse(d.json || "[]"); } catch (e) { arr = []; }
        if (!Array.isArray(arr)) return;
        arr.forEach(row => {
          if (!Array.isArray(row)) { if (row && typeof row === "object") filas.push(row); return; }
          const obj = {};
          for (let i = 0; i < cols.length; i++) {
            const v = row[i];
            if (v !== "" && v != null) obj[cols[i]] = v;
          }
          filas.push(obj);
        });
      });
      const marca = String(res.actualizado_en || res.corte || "");
      if (marca) registrarFrescura("agrocontrol", marca);
      return {
        generado: res.corte || res.actualizado_en || "",
        actualizado_en: res.actualizado_en || "",
        corte: res.corte || "",
        vivo: false,
        fuente: "firestore",
        usuario: (usuarioActual && usuarioActual.email) || "",
        filas
      };
    } catch (e) {
      return null;
    }
  }

  async function resumenFrescura() {
    const out = Object.assign({}, leerFrescuraLocal());
    await inicializar();
    if (!db || !usuarioActual) return out;
    try {
      const resSnap = await modFs.getDoc(modFs.doc(db, `${RAIZ}/agrocontrol/resumen`));
      if (resSnap.exists()) {
        const d = resSnap.data() || {};
        const iso = d.actualizado_en || d.corte;
        if (iso && msFecha(iso) >= msFecha(out.agrocontrol)) out.agrocontrol = iso;
      }
    } catch (e) {}
    const consultarMax = async (col, key, campos) => {
      try {
        const snap = await modFs.getDocs(modFs.collection(db, `${RAIZ}/${col}`));
        let maxIso = out[key] || "";
        snap.forEach(docu => {
          const d = docu.data() || {};
          for (const c of campos) {
            if (d[c] && msFecha(d[c]) > msFecha(maxIso)) { maxIso = String(d[c]); break; }
          }
        });
        if (maxIso) { out[key] = maxIso; registrarFrescura(key, maxIso); }
      } catch (e) {}
    };
    await Promise.all([
      consultarMax("recepciones", "recepciones", ["actualizado_en", "creado_en", "fecha"]),
      consultarMax("vehiculos", "vehiculos", ["actualizado_en", "creado_en", "fecha_actividad"])
    ]);
    return out;
  }

  /* ── Checklist diario: espacios/agrodavila/checklist/{linea} ─────────────── */
  function leerChecklistLocal() {
    try { return JSON.parse(localStorage.getItem(LS_CHECKLIST) || "{}"); } catch (e) { return {}; }
  }
  function escribirChecklistLocal(mapa) {
    try { localStorage.setItem(LS_CHECKLIST, JSON.stringify(mapa)); } catch (e) {}
  }

  function idLineaSegura(linea) {
    return encodeURIComponent(String(linea || "").trim()).replace(/\./g, "_");
  }

  async function guardarChecklist(linea, datosChk) {
    if (!linea) return;
    const ahora = (datosChk && datosChk.actualizado_en) || new Date().toISOString();
    const loc = leerChecklistLocal();
    loc[linea] = Object.assign({}, loc[linea] || {}, {
      linea: String(linea),
      hecho: !!(datosChk && datosChk.hecho),
      nota: String((datosChk && datosChk.nota) || "").trim(),
      etapa_marcada: String((datosChk && datosChk.etapa_marcada) || "").trim(),
      actualizado_en: ahora,
      actualizado_por: (usuarioActual && usuarioActual.email) || (datosChk && datosChk.actualizado_por) || "local"
    });
    escribirChecklistLocal(loc);

    await inicializar();
    if (!db || !usuarioActual) return;
    const docRef = modFs.doc(db, `${RAIZ}/checklist/${idLineaSegura(linea)}`);
    const carga = {
      linea: String(linea),
      hecho: loc[linea].hecho,
      nota: loc[linea].nota,
      etapa_marcada: loc[linea].etapa_marcada,
      actualizado_en: ahora,
      actualizado_por: usuarioActual.email || "local"
    };
    try { await modFs.setDoc(docRef, carga, { merge: true }); } catch (e) {}
  }

  let unsubChecklist = null;
  async function sincronizarChecklist(alActualizar, alError) {
    const emitirLocal = () => {
      const m = leerChecklistLocal();
      if (typeof alActualizar === "function") alActualizar(m, { fuente: "local" });
    };

    await inicializar();
    if (!db || !usuarioActual) {
      emitirLocal();
      return () => {};
    }

    if (unsubChecklist) { try { unsubChecklist(); } catch (e) {} }
    const colRef = modFs.collection(db, `${RAIZ}/checklist`);
    unsubChecklist = modFs.onSnapshot(colRef, snap => {
      const loc = leerChecklistLocal();
      const remotos = {};
      snap.forEach(d => {
        const data = d.data() || {};
        const lin = data.linea || d.id;
        remotos[lin] = data;
      });

      let huboCambio = false;
      const todasLineas = new Set([...Object.keys(loc), ...Object.keys(remotos)]);
      todasLineas.forEach(lin => {
        const l = loc[lin];
        const r = remotos[lin];
        const tLoc = l ? msFecha(l.actualizado_en) : -1;
        const tRem = r ? msFecha(r.actualizado_en) : -1;
        if (r && tRem >= tLoc) {
          loc[lin] = {
            linea: lin,
            hecho: !!r.hecho,
            nota: String(r.nota || ""),
            etapa_marcada: String(r.etapa_marcada || ""),
            actualizado_en: r.actualizado_en || new Date().toISOString(),
            actualizado_por: r.actualizado_por || ""
          };
          huboCambio = true;
        } else if (l && tLoc > tRem) {
          guardarChecklist(lin, l);
        }
      });
      escribirChecklistLocal(loc);
      if (typeof alActualizar === "function") alActualizar(loc, { fuente: "nube" });
    }, err => {
      emitirLocal();
      if (typeof alError === "function") alError(err);
    });
    return unsubChecklist;
  }

  /* ── Historial: espacios/agrodavila/checklist_historial/{fecha} ───────────── */
  function leerHistorialLocal(fecha) {
    try {
      const h = JSON.parse(localStorage.getItem(LS_HISTORIAL) || "{}");
      return h[fecha] || null;
    } catch (e) { return null; }
  }
  function escribirHistorialLocal(fecha, data) {
    try {
      const h = JSON.parse(localStorage.getItem(LS_HISTORIAL) || "{}");
      h[fecha] = Object.assign({}, h[fecha] || {}, data);
      localStorage.setItem(LS_HISTORIAL, JSON.stringify(h));
    } catch (e) {}
  }

  async function guardarHistorialDia(fecha, datosHist) {
    if (!fecha || !datosHist) return;
    const ahora = new Date().toISOString();
    const docData = Object.assign({}, datosHist, {
      fecha,
      actualizado_en: ahora,
      actualizado_por: (usuarioActual && usuarioActual.email) || "local"
    });
    escribirHistorialLocal(fecha, docData);

    await inicializar();
    if (!db || !usuarioActual) return;
    const docRef = modFs.doc(db, `${RAIZ}/checklist_historial/${fecha}`);
    try { await modFs.setDoc(docRef, docData, { merge: true }); } catch (e) {}
  }

  async function obtenerHistorialDia(fecha) {
    const loc = leerHistorialLocal(fecha);
    await inicializar();
    if (!db || !usuarioActual) return loc;
    try {
      const docRef = modFs.doc(db, `${RAIZ}/checklist_historial/${fecha}`);
      const snap = await modFs.getDoc(docRef);
      if (snap.exists()) {
        const rem = snap.data();
        escribirHistorialLocal(fecha, rem);
        return rem;
      }
    } catch (e) {}
    return loc;
  }

  async function archivarMarcaEnHistorial(linea, fecha, datosAvance) {
    const hist = (await obtenerHistorialDia(fecha)) || { fecha, lineas: {}, cotizadas: 0, oc: 0, entregas: 0 };
    if (!hist.lineas) hist.lineas = {};
    hist.lineas[linea] = Object.assign({}, datosAvance, { linea, cerrado_en: new Date().toISOString() });
    let cots = 0, ocs = 0, ents = 0;
    Object.values(hist.lineas).forEach(item => {
      if (item.tipo_avance === "cotizada" || item.etapa_anterior === "Por cotizar") cots++;
      if (item.tipo_avance === "oc" || item.etapa_anterior === "Por generar o subir la OC") ocs++;
      if (item.tipo_avance === "entrega" || item.etapa_anterior === "Por entregar") ents++;
    });
    hist.cotizadas = cots;
    hist.oc = ocs;
    hist.entregas = ents;
    hist.total_avanzadas = Object.keys(hist.lineas).length;
    await guardarHistorialDia(fecha, hist);

    const loc = leerChecklistLocal();
    if (loc[linea]) {
      delete loc[linea];
      escribirChecklistLocal(loc);
    }
    await inicializar();
    if (db && usuarioActual) {
      try {
        await modFs.deleteDoc(modFs.doc(db, `${RAIZ}/checklist/${idLineaSegura(linea)}`));
      } catch (e) {}
    }
  }

  /* ── Bandeja y conversaciones: espacios/agrodavila/conversaciones y bandeja ─ */
  let unsubConversaciones = null;
  async function escucharConversaciones(cb, alError) {
    await inicializar();
    if (!db || !usuarioActual || typeof cb !== "function") {
      if (typeof cb === "function") cb([]);
      return () => {};
    }
    if (unsubConversaciones) { try { unsubConversaciones(); } catch (e) {} }
    const colRef = modFs.collection(db, `${RAIZ}/conversaciones`);
    unsubConversaciones = modFs.onSnapshot(colRef, snap => {
      const lista = [];
      snap.forEach(d => {
        lista.push(Object.assign({ id: d.id }, d.data()));
      });
      cb(lista);
    }, err => {
      if (typeof alError === "function") alError(err);
    });
    return unsubConversaciones;
  }

  async function marcarConversacion(chatSeguro, cambio) {
    if (!chatSeguro || !cambio) return false;
    await inicializar();
    if (!db || !usuarioActual) return false;
    const docRef = modFs.doc(db, `${RAIZ}/conversaciones/${chatSeguro}`);
    const ahora = new Date().toISOString();
    const datos = Object.assign({}, cambio, {
      actualizado_en: ahora,
      actualizado_por: (usuarioActual && usuarioActual.email) || "local"
    });
    try {
      await modFs.setDoc(docRef, datos, { merge: true });
      return true;
    } catch (e) {
      return false;
    }
  }

  let unsubBandeja = null;
  async function escucharBandeja(cb, alError) {
    await inicializar();
    if (!db || !usuarioActual || typeof cb !== "function") {
      if (typeof cb === "function") cb([]);
      return () => {};
    }
    if (unsubBandeja) { try { unsubBandeja(); } catch (e) {} }
    const colRef = modFs.collection(db, `${RAIZ}/bandeja`);
    unsubBandeja = modFs.onSnapshot(colRef, snap => {
      const lista = [];
      snap.forEach(d => {
        lista.push(Object.assign({ id: d.id }, d.data()));
      });
      cb(lista);
    }, err => {
      if (typeof alError === "function") alError(err);
    });
    return unsubBandeja;
  }

  async function marcarBorradorBandeja(numeroReq, borradorId, estado, textoFinal) {
    if (!numeroReq || !borradorId) return false;
    await inicializar();
    if (!db || !usuarioActual) return false;
    const docRef = modFs.doc(db, `${RAIZ}/bandeja/${numeroReq}`);
    try {
      const snap = await modFs.getDoc(docRef);
      if (!snap.exists()) return false;
      const data = snap.data() || {};
      const borradores = (data.borradores || []).map(b => {
        if (String(b.id) === String(borradorId)) {
          return Object.assign({}, b, {
            estado: estado,
            texto: textoFinal || b.texto,
            enviado_en: estado === "enviado" ? new Date().toISOString() : b.enviado_en,
            actualizado_en: new Date().toISOString()
          });
        }
        return b;
      });
      await modFs.setDoc(docRef, { borradores, actualizado_en: new Date().toISOString() }, { merge: true });
      return true;
    } catch (e) {
      return false;
    }
  }

  const _unsubsErp = {};
  async function _escucharColeccion(clave, cb, alError) {
    await inicializar();
    if (!db || !usuarioActual || typeof cb !== "function") {
      if (typeof cb === "function") cb([]);
      return () => {};
    }
    if (_unsubsErp[clave]) { try { _unsubsErp[clave](); } catch (e) {} }
    const colRef = modFs.collection(db, `${RAIZ}/${clave}`);
    _unsubsErp[clave] = modFs.onSnapshot(colRef, snap => {
      const lista = [];
      let maxIso = "";
      snap.forEach(d => {
        const dato = d.data();
        lista.push(Object.assign({ id: d.id }, dato));
        const iso = dato && (dato.actualizado_en || dato.creado_en || dato.fecha_actividad || dato.fecha);
        if (iso && msFecha(iso) > msFecha(maxIso)) maxIso = String(iso);
      });
      if ((clave === "recepciones" || clave === "vehiculos") && maxIso) {
        registrarFrescura(clave, maxIso);
      }
      cb(lista);
    }, err => {
      if (typeof alError === "function") alError(err);
    });
    return _unsubsErp[clave];
  }

  const escucharRecepciones = (cb, alError) => _escucharColeccion("recepciones", cb, alError);
  const escucharMantenimientos = (cb, alError) => _escucharColeccion("mantenimientos", cb, alError);
  const escucharActivos = (cb, alError) => _escucharColeccion("activos", cb, alError);
  const escucharVehiculos = (cb, alError) => _escucharColeccion("vehiculos", cb, alError);

  async function conciliarRecepcion(recepcionId, asignacion) {
    if (!recepcionId || !asignacion) return false;
    await inicializar();
    if (!db || !usuarioActual) return false;
    const docRef = modFs.doc(db, `${RAIZ}/recepciones/${recepcionId}`);
    const ahora = new Date().toISOString();
    const datos = {
      estado_conciliacion: "conciliada_manual",
      confianza: "alta",
      metodo_match: "manual_bandeja",
      numero_oc: String(asignacion.numero_oc || ""),
      oc_codigo: String(asignacion.oc_codigo || ""),
      pedido: String(asignacion.pedido || ""),
      linea: String(asignacion.linea || ""),
      proveedor: String(asignacion.proveedor || ""),
      f_entrega_agrocontrol: String(asignacion.f_entrega_agrocontrol || ""),
      notas: String(asignacion.notas || ""),
      actualizado_en: ahora,
      actualizado_por: (usuarioActual && usuarioActual.email) || "local"
    };
    if (asignacion.finca) datos.finca = String(asignacion.finca);
    if (asignacion.f_entrega_agrocontrol) datos.fecha = String(asignacion.f_entrega_agrocontrol).slice(0, 10);
    try {
      await modFs.setDoc(docRef, datos, { merge: true });
      return true;
    } catch (e) {
      return false;
    }
  }

  async function descartarRecepcion(recepcionId, motivo) {
    if (!recepcionId) return false;
    await inicializar();
    if (!db || !usuarioActual) return false;
    const docRef = modFs.doc(db, `${RAIZ}/recepciones/${recepcionId}`);
    try {
      await modFs.setDoc(docRef, {
        estado_conciliacion: "descartada",
        notas: String(motivo || "Descartado desde Bandeja"),
        actualizado_en: new Date().toISOString(),
        actualizado_por: (usuarioActual && usuarioActual.email) || "local"
      }, { merge: true });
      return true;
    } catch (e) {
      return false;
    }
  }

  async function guardarMantenimiento(reg) {
    if (!reg || !reg.activo || !reg.finca) return { ok: false, error: "Faltan activo o finca." };
    await inicializar();
    if (!db || !usuarioActual) return { ok: false, error: "Sin sesión de Google." };
    const id = String(reg.id || ("mnt_app_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 6)));
    const ahora = new Date().toISOString();
    const docRef = modFs.doc(db, `${RAIZ}/mantenimientos/${id}`);
    const datos = {
      id,
      fecha_reporte: String(reg.fecha_reporte || ahora.slice(0, 10)),
      activo: String(reg.activo).trim(),
      codigo_activo: String(reg.codigo_activo || "").trim(),
      finca: String(reg.finca).trim(),
      tipo: reg.tipo === "Preventivo" ? "Preventivo" : "Correctivo",
      descripcion: String(reg.descripcion || "").trim(),
      prioridad: ["Alta", "Media", "Baja"].includes(reg.prioridad) ? reg.prioridad : "Media",
      responsable: String(reg.responsable || (usuarioActual && usuarioActual.email) || "Campo").trim(),
      fecha_programada: String(reg.fecha_programada || "").trim(),
      hora_programada: String(reg.hora_programada || "").trim(),
      fecha_ejecucion: String(reg.fecha_ejecucion || "").trim(),
      costo: Number(reg.costo || 0) || 0,
      estado: ["Pendiente", "Programado", "En ejecución", "Ejecutado", "Cancelado"].includes(reg.estado) ? reg.estado : "Pendiente",
      proveedor: String(reg.proveedor || "").trim(),
      observaciones: String(reg.observaciones || "").trim(),
      fuente: String(reg.fuente || "manual_app"),
      placa_vehiculo: String(reg.placa_vehiculo || "").trim(),
      creado_en: String(reg.creado_en || ahora),
      actualizado_en: ahora,
      actualizado_por: (usuarioActual && usuarioActual.email) || "local"
    };
    try {
      await modFs.setDoc(docRef, datos, { merge: true });
      return { ok: true, id, datos };
    } catch (e) {
      return { ok: false, error: e.message || String(e) };
    }
  }

  window.AgdNube = {
    escucharConversaciones,
    marcarConversacion,
    escucharBandeja,
    marcarBorradorBandeja,
    escucharRecepciones,
    conciliarRecepcion,
    descartarRecepcion,
    escucharMantenimientos,
    guardarMantenimiento,
    escucharActivos,
    escucharVehiculos,
    escucharMatrizEnVivo,
    leerAgrocontrol,
    resumenFrescura,
    registrarFrescura,
    limpiarClavesLocales,
    inicializar,
    conectar,
    desconectar,
    estado,
    alCambiarEstado,
    guardarBorrador,
    sincronizarBorradores,
    guardarTelefono,
    sincronizarTelefonos,
    guardarAjustes,
    sincronizarAjustes,
    guardarProveedorMatriz,
    cargarProveedoresDesdeWA,
    escucharMatriz,
    normalizarProveedor,
    chatIdSeguro,
    leerChecklistLocal,
    guardarChecklist,
    sincronizarChecklist,
    guardarHistorialDia,
    obtenerHistorialDia,
    archivarMarcaEnHistorial
  };
})();
