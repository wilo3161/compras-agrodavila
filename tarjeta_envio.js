/* Tarjeta de envío a proveedores (16/11/2026) — la usa la página de WhatsApp.
   Cada mensaje es una tarjeta: proveedor (con su rubro), tabla de productos editable (quitar, agregar, cambiar
   cantidad), mensaje que se rehace con la tabla, vista previa PNG/PDF con el membrete de AgroDávila y botón
   «Aprobar y enviar». Al aprobar se crea la solicitud en Firestore y la PC la manda por el WhatsApp de compras:
   primero el texto, luego la imagen y el PDF (cotizaciones) o solo el texto (seguimientos).
   Nada sale sin el clic de Wilo. */
(function () {
  "use strict";
  const EMPRESA = { comercial: "AGRODÁVILA", razon: "DÁVILA PALADINES ANÍBAL ROLANDO", ruc: "1708534753001" };
  const FIRMA = { nombre: "Ing. Wilson Pérez", cargo: "Analista de Compras y Logística", whatsapp: "0981892023" };
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const plano = (s) => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9 ]+/g, " ").trim();
  const $ = (s, r) => (r || document).querySelector(s);
  const I = (n) => (window.AgdGuia && AgdGuia.ico ? AgdGuia.ico(n) : "");
  const cargarScript = (src) => new Promise((ok, mal) => {
    if (document.querySelector(`script[src="${src}"]`)) return ok();
    const s = document.createElement("script"); s.src = src; s.onload = ok; s.onerror = mal; document.head.appendChild(s);
  });

  let CATALOGO = null;
  async function catalogo() {
    if (CATALOGO) return CATALOGO;
    try { CATALOGO = (window.AgdNube && await AgdNube.leerCatalogoProveedores()) || []; } catch (e) { CATALOGO = []; }
    try {
      const ev = (window.AgdNube && AgdNube.leerEvaluacionesProveedores && await AgdNube.leerEvaluacionesProveedores()) || {};
      const cl = (n) => plano(n).replace(/ /g, "_").slice(0, 80);
      CATALOGO.forEach((p) => { const e = ev[cl(p.nombre)]; if (e) { p.veredicto = e.veredicto || ""; p.veredicto_nota = e.nota || ""; } });
    } catch (e) { /* sin veredictos se sigue igual */ }
    return CATALOGO;
  }
  /* Base de productos de AgroControl (nombre, categoría, unidad usual, ingrediente) para buscar al agregar. */
  let PRODS = null;
  async function productos() {
    if (PRODS) return PRODS;
    let l = [];
    try { l = (window.AgdNube && AgdNube.leerCatalogoProductos && await AgdNube.leerCatalogoProductos()) || []; } catch (e) { l = []; }
    const m = new Map();
    l.forEach((p) => { const n = String(p[0] || "").trim(); if (n && !m.has(plano(n))) m.set(plano(n), { n, c: p[1] || "", u: p[2] || "", i: p[3] || "", k: plano(n + " " + (p[3] || "")), ag: true }); });
    // Lo que los proveedores han vendido o cotizado (base histórica y proformas) también sirve para buscar.
    (CATALOGO || []).forEach((pr) => (pr.productos || []).forEach((x) => { const n = String(x || "").trim(); if (n && !m.has(plano(n))) m.set(plano(n), { n, c: "", u: "", i: "", k: plano(n), ag: false }); }));
    PRODS = [...m.values()];
    return PRODS;
  }
  /* Varios números del mismo proveedor (16/11/2026): se usa el chat que responde; si el nombre del chat dice la ciudad
     (Banariego Manta / Banariego Ibarra), primero el de la zona de la finca. La base ya viene ordenada por respuesta. */
  const ZONA_CHAT = { Costa: /manta|jipijapa|portoviejo|guayaquil|cayo|\bpc\b|carmen|manabi/i, Imbabura: /ibarra|quito|otavalo|imbabura|urcuqui|atuntaqui/i };
  function mejorChat(p) {
    const chats = (p && p.chats) || [];
    if (chats.length < 2) return chats[0] || (p && p.chat) || "";
    const z = typeof zonaFinca === "function" && E ? zonaFinca() : "";
    if (!z) return chats[0];
    const otra = z === "Costa" ? "Imbabura" : "Costa";
    const pts = (ch) => (ZONA_CHAT[otra].test(ch) && !ZONA_CHAT[z].test(ch) ? 1 : 0);   // solo se evita el de la otra zona; entre los demás manda quién responde
    return chats.slice().sort((a, b) => pts(a) - pts(b))[0];   // sort estable: dentro de la misma zona manda la respuesta
  }
  const textoResp = (p, ch) => { const r = ((p && p.respuesta_chats) || {})[ch]; return r && r.pedidos ? `respondió ${r.respondidos} de ${r.pedidos}${r.minutos_mediana != null ? ` · suele tardar ${r.minutos_mediana < 60 ? r.minutos_mediana + " min" : Math.round(r.minutos_mediana / 60) + " h"}` : ""}` : "sin historial"; };
  function fichaDe(nombre, chat) {
    const n = plano(nombre), c = plano(chat);
    return (CATALOGO || []).find((p) => (c && (p.chats || []).some((x) => plano(x) === c)) || (n && plano(p.nombre) === n)) || null;
  }

  const CSS = `
  .te-capa{position:fixed;inset:0;background:rgba(10,12,15,.55);display:none;z-index:9000;align-items:flex-start;justify-content:center;overflow:auto;padding:16px}
  .te-capa.ver{display:flex}
  .te-caja{background:var(--card,#fff);color:var(--tx,#23262B);border:1px solid var(--bd,#E2E4E7);border-radius:14px;width:100%;max-width:760px;padding:16px;box-shadow:0 12px 40px rgba(0,0,0,.25)}
  .te-caja h2{margin:0 0 4px;font-size:19px}
  .te-caja h2:focus{outline:none !important}
  .te-sub{color:var(--t2,#5E6570);font-size:13px}
  .te-chip{display:inline-block;border-radius:999px;padding:2px 9px;font-size:12px;background:var(--pri2,#E8EFF7);color:var(--pri,#2E5E8E);margin:2px 4px 2px 0}
  .te-chip.alerta{background:var(--ladrillo2,#F8E8E4);color:var(--ladrillo,#B5452F)}
  .te-tabla{margin:10px 0;display:grid;gap:8px}
  .te-fila{display:grid;grid-template-columns:22px minmax(0,1fr) 84px 84px 42px;gap:6px;align-items:center}
  .te-fila.cab{font-size:12px;color:var(--t2,#5E6570)}
  .te-fila input{width:100%;box-sizing:border-box;padding:8px;border:1px solid var(--bd,#E2E4E7);border-radius:8px;background:transparent;color:inherit;font:inherit;min-width:0}
  .te-fila .n{color:var(--t2,#5E6570);text-align:center}
  @media (max-width:560px){
    .te-fila{grid-template-columns:22px minmax(0,1fr) minmax(0,1fr) 42px;grid-template-areas:"n p p x" "n c u x"}
    .te-fila .n{grid-area:n} .te-fila .p{grid-area:p} .te-fila .c{grid-area:c} .te-fila .u{grid-area:u} .te-fila .x{grid-area:x}
    .te-fila.cab{display:none}
    .te-capa{padding:6px} .te-caja{padding:12px}
  }
  .te-btn{border:1px solid var(--bd,#E2E4E7);background:var(--card,#fff);color:var(--tx,#23262B);border-radius:10px;padding:10px 14px;font:inherit;font-size:14px;cursor:pointer;min-height:42px}
  .te-btn.p{background:var(--pri,#2E5E8E);border-color:var(--pri,#2E5E8E);color:#fff;font-weight:600}
  .te-btn:disabled{opacity:.5;cursor:not-allowed}
  .te-btn.sm{padding:6px 10px;min-height:34px;font-size:13px}
  .te-acc{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px}
  .te-txt{width:100%;box-sizing:border-box;min-height:170px;padding:10px;border:1px solid var(--bd,#E2E4E7);border-radius:10px;background:transparent;color:inherit;font:inherit;font-size:14px}
  .te-aviso{background:var(--ladrillo2,#F8E8E4);color:var(--ladrillo,#B5452F);border-radius:10px;padding:8px 10px;margin-top:8px;font-size:13px}
  .te-ok{background:var(--pri2,#E8EFF7);border-radius:10px;padding:8px 10px;margin-top:8px;font-size:13px}
  .te-lista{max-height:260px;overflow:auto;border:1px solid var(--bd,#E2E4E7);border-radius:10px;margin-top:6px}
  .te-lista button{display:block;width:100%;text-align:left;border:0;border-bottom:1px solid var(--bd,#E2E4E7);background:transparent;color:inherit;padding:9px 10px;font:inherit;cursor:pointer}
  .te-lista button:hover,.te-lista button:focus-visible{background:var(--pri2,#E8EFF7);outline:none}
  .te-sug{margin:-2px 0 2px 28px;max-height:230px}
  .te-buscar{margin-top:6px;width:100%;box-sizing:border-box;padding:10px;border:1px solid var(--pri,#2E5E8E);border-radius:8px;background:transparent;color:inherit;font:inherit}
  .te-vista{margin-top:10px;overflow:auto;border:1px solid var(--bd,#E2E4E7);border-radius:10px;background:#fff}
  .te-vista img{display:block;width:100%;height:auto}
  .te-burbuja{background:#DCF8C6;color:#111;border-radius:10px;padding:10px 12px;white-space:pre-wrap;font-size:14px;max-width:520px;margin:10px}
  #te-hoja{width:794px;background:#fff;color:#1d1d1d;padding:44px 52px;font-family:Arial,Helvetica,sans-serif;font-size:14px;box-sizing:border-box}
  #te-hoja .mem{display:flex;justify-content:space-between;border-bottom:3px solid #2E5E8E;padding-bottom:10px;margin-bottom:18px}
  #te-hoja .marca{font-size:26px;font-weight:800;color:#2E5E8E;letter-spacing:.5px}
  #te-hoja .rs{font-size:12px;color:#444} #te-hoja .der{text-align:right;font-size:12px;color:#444}
  #te-hoja h4{text-align:center;font-size:17px;margin:6px 0 14px;letter-spacing:1px}
  #te-hoja table{width:100%;border-collapse:collapse;margin:12px 0}
  #te-hoja th{background:#2E5E8E;color:#fff;padding:7px;font-size:12px;text-align:left}
  #te-hoja td{border-bottom:1px solid #ddd;padding:7px;font-size:13px}
  #te-hoja .pide{background:#F2F6FA;border-radius:6px;padding:10px;font-size:12.5px;margin-top:10px}
  #te-hoja .firma{margin-top:26px;font-size:13px} #te-hoja .firma b{display:block;margin-top:4px}
  `;

  function montar() {
    if ($("#te-capa")) return;
    const st = document.createElement("style"); st.textContent = CSS; document.head.appendChild(st);
    const d = document.createElement("div");
    d.innerHTML = `<div class="te-capa" id="te-capa" role="dialog" aria-modal="true" aria-labelledby="te-titulo"><div class="te-caja" id="te-caja"></div></div>
      <div id="te-fuente" aria-hidden="true" style="position:fixed;left:-10000px;top:0;width:794px"></div>`;
    document.body.appendChild(d);
    // Tocar fuera NO cierra: se perdería lo editado. Se cierra con ✕, «Cancelar» o Escape.
    document.addEventListener("keydown", (e) => {
      if (e.key !== "Escape" || !$("#te-capa").classList.contains("ver")) return;
      if ($("#te-sug")) return quitarSug();      // primero se cierran las sugerencias, no la tarjeta
      cerrar();
    });
  }
  let ENVIANDO = false, FOCO_PREVIO = null;
  /* Lección para el agente: diferencia entre la tarjeta como la propuso y como la persona la dejó */
  function resumenDecision(est) {
    let o = {}; try { o = JSON.parse(est.original); } catch (e) { o = { prov: {}, items: [], texto: "" }; }
    const nom = (i) => plano(i.producto);
    const antes = (o.items || []).filter((i) => String(i.producto).trim()), ahora = est.items.filter((i) => String(i.producto).trim());
    const quit = antes.filter((a) => !ahora.some((b) => nom(b) === nom(a))).map((i) => i.producto);
    const agr = ahora.filter((b) => !antes.some((a) => nom(a) === nom(b))).map((i) => i.producto);
    const cant = ahora.map((b) => { const a = antes.find((x) => nom(x) === nom(b)); return a && String(a.cantidad) !== String(b.cantidad) ? `${b.producto}: ${a.cantidad} → ${b.cantidad}` : null; }).filter(Boolean);
    const cambios = [];
    if ((o.prov || {}).nombre !== est.prov.nombre) cambios.push("proveedor");
    if (quit.length) cambios.push("quitó productos");
    if (agr.length) cambios.push("agregó productos");
    if (cant.length) cambios.push("cambió cantidades");
    if (est.textoTocado) cambios.push("editó el mensaje");
    return { origen: est.op.origen || "whatsapp", clase: est.tipo, finca: est.finca || "", rubros: (est.rubrosOrig || []).slice(0, 4),
      sin_cambios: !cambios.length, cambios,
      propuesto: { proveedor: (o.prov || {}).nombre || "", chat: (o.prov || {}).chat || "", productos: antes.map((i) => i.producto).slice(0, 25) },
      decidido: { proveedor: est.prov.nombre, chat: est.prov.chat || "", quitados: quit.slice(0, 15), agregados: agr.slice(0, 15), cantidades: cant.slice(0, 15),
        mensaje: est.textoTocado ? String(est.texto).slice(0, 500) : "" } };
  }
  const dec = (tipo, d) => { try { if (window.AgdNube && AgdNube.registrarDecision) AgdNube.registrarDecision(tipo, d); } catch (e) {} };
  function cerrar(forzar) {
    if (ENVIANDO && !forzar) return;   // mientras sale el envío no se cierra: evita el doble envío
    const c = $("#te-capa"); if (c) c.classList.remove("ver"); E = null;
    if (FOCO_PREVIO && FOCO_PREVIO.focus) { try { FOCO_PREVIO.focus(); } catch (e) {} } FOCO_PREVIO = null;
  }

  /* ── Estado de la tarjeta abierta ── */
  let E = null;  // { tipo, prov:{nombre,chat,telefono}, items:[{producto,cantidad,unidad,finca,linea}], texto, editado, op }

  const esCot = () => E.tipo === "cotizacion";
  const sinGoogle = () => !!(window.AgdNube && AgdNube.estaConectada && !AgdNube.estaConectada());
  function textoAuto() {
    try { if (E.op.generar) return E.op.generar({ tipo: E.tipo, prov: E.prov, items: E.items.filter((i) => i.producto.trim()), finca: E.finca, fincaId: E.fincaId, provNuevo: !!((fichaDe(E.prov.nombre, E.prov.chat) || {}).prospecto) || !fichaDe(E.prov.nombre, E.prov.chat) }) || E.texto; }
    catch (e) { /* si la plantilla falla, se queda el texto actual */ }
    return E.texto;
  }
  function faltan() {
    const f = [];
    if (!E.prov.nombre) f.push("elegir el proveedor");
    if (!E.prov.chat && String(E.prov.telefono || "").replace(/\D/g, "").length < 9) f.push("el chat o el número de WhatsApp del proveedor");
    if (esCot() && !E.items.some((i) => i.producto.trim())) f.push("al menos un producto");
    if (E.items.some((i) => i.producto.trim() && !String(i.cantidad).trim())) f.push("la cantidad de cada producto");
    if (!String(E.texto || "").trim()) f.push("el mensaje");
    if (String(E.texto || "").length > 3500) f.push(`acortar el mensaje (tiene ${String(E.texto).length} letras y el máximo es 3.500)`);
    return f;
  }

  function pintar() {
    const fi = fichaDe(E.prov.nombre, E.prov.chat);
    const rubros = fi ? (fi.rubros || []) : [];
    const f = faltan();
    $("#te-caja").innerHTML = `
      <div style="display:flex;justify-content:space-between;gap:8px;align-items:flex-start">
        <div><h2 id="te-titulo">${esCot() ? "Solicitud de cotización" : "Mensaje de seguimiento"}</h2>
          <div class="te-sub">${esc(E.op.contexto || "")}</div></div>
        <button class="te-btn sm" type="button" data-te="cerrar" aria-label="Cerrar">${I("cerrar")}</button>
      </div>
      <div style="margin-top:10px"><b>Para:</b> ${esc(E.prov.nombre || "— elige proveedor —")}
        ${rubros.map((r) => `<span class="te-chip">${esc(r)}</span>`).join("")}${fi && fi.prospecto ? `<span class="te-chip alerta">nuevo · sin verificar</span>` : ""}${fi && otraZona(fi) ? `<span class="te-chip alerta">otra zona · revisar flete</span>` : ""}
        ${E.prov.nombre ? `<div class="te-sub">${E.prov.chat ? `Chat de WhatsApp: «${esc(E.prov.chat)}»${fi && (fi.chats || []).length > 1 ? ` · ${esc(textoResp(fi, E.prov.chat))}
          <select data-te="otrochat" aria-label="Otro número del mismo proveedor" style="margin-left:6px;padding:4px;border-radius:8px;border:1px solid var(--bd,#E2E4E7);background:transparent;color:inherit;font:inherit;font-size:13px">
          ${fi.chats.map((ch) => `<option value="${esc(ch)}" ${ch === E.prov.chat ? "selected" : ""}>${esc(ch)} — ${esc(textoResp(fi, ch))}</option>`).join("")}</select>` : ""}` : E.prov.telefono ? `WhatsApp ${esc(E.prov.telefono)}` : `<span style="color:var(--ladrillo,#B5452F)">Sin chat de WhatsApp: escribe el número abajo.</span>`}</div>
        ${!E.prov.chat ? `<input id="te-tel" inputmode="tel" placeholder="Número del proveedor, ej. 0991234567" value="${esc(E.prov.telefono || "")}" style="margin-top:6px;width:100%;box-sizing:border-box;padding:9px;border:1px solid var(--bd,#E2E4E7);border-radius:8px;background:transparent;color:inherit;font:inherit">` : ""}
        <button class="te-btn sm" type="button" data-te="cambiar" style="margin-top:6px">${I("refrescar")} Cambiar proveedor</button>` : ""}
        <div id="te-elegir">${!E.prov.nombre || E.buscando ? htmlBuscador() : ""}</div>
      </div>
      <div class="te-tabla"><div class="te-fila cab"><span></span><span>Producto${esCot() ? "" : " (opcional)"}</span><span>Cantidad</span><span>Unidad</span><span></span></div>
        ${E.items.map((i, n) => `<div class="te-fila">
          <span class="n">${n + 1}</span>
          <input class="p" data-i="${n}" data-k="producto" value="${esc(i.producto)}" placeholder="Producto" aria-label="Producto ${n + 1}">
          <input class="c" data-i="${n}" data-k="cantidad" inputmode="decimal" value="${esc(i.cantidad)}" placeholder="Cant." aria-label="Cantidad ${n + 1}">
          <input class="u" data-i="${n}" data-k="unidad" value="${esc(i.unidad)}" placeholder="Unidad" aria-label="Unidad ${n + 1}">
          <button class="te-btn sm x" type="button" data-te="quitar" data-i="${n}" aria-label="Quitar ${esc(i.producto)}">${I("cerrar")}</button></div>`).join("")}</div>
      <button class="te-btn sm" type="button" data-te="agregar">${I("agregar")} Agregar producto</button>
      <div style="margin-top:12px"><label for="te-txt"><b>Mensaje</b> <span class="te-sub">${E.editado ? "· editado por ti" : "· se rehace solo con la tabla"}</span></label>
        <textarea class="te-txt" id="te-txt">${esc(E.texto)}</textarea>
        ${E.editado ? `<button class="te-btn sm" type="button" data-te="rehacer">${I("deshacer")} Rehacer el mensaje con la tabla</button>` : ""}</div>
      <div id="te-vista"></div>
      ${E.avisoProv ? `<div class="te-aviso">${I("alerta")} ${esc(E.avisoProv)}</div>` : ""}
      ${E.op.avisos && E.op.avisos.length ? E.op.avisos.map((a) => `<div class="te-aviso">${I("alerta")} ${esc(a)}</div>`).join("") : ""}
      <div class="te-acc">
        <button class="te-btn" type="button" data-te="vista">${I("ojo")} Vista previa${esCot() ? " (imagen y PDF)" : ""}</button>
        ${esCot() ? `<button class="te-btn" type="button" data-te="copiarimg">${I("imagen")} Copiar imagen</button><button class="te-btn" type="button" data-te="png">${I("bajar")} PNG</button><button class="te-btn" type="button" data-te="pdf">${I("bajar")} PDF</button>` : ""}
        <button class="te-btn" type="button" data-te="copiartxt">${I("checklist")} Copiar mensaje</button>
      </div>
      <div class="te-acc">
        <button class="te-btn p" type="button" data-te="enviar" ${f.length ? "disabled" : ""}>${I("check")} ${sinGoogle() ? "Conectar Google y enviar" : "Aprobar y enviar por WhatsApp"}</button>
        <button class="te-btn" type="button" data-te="yaenvie">Ya lo envié yo</button>
        <button class="te-btn" type="button" data-te="cerrar">Cancelar</button>
      </div>
      <div class="te-acc">
        <button class="te-btn sm" type="button" data-te="abrirwa">${I("whatsapp")} Abrir el chat en WhatsApp (envío manual)</button>
        <button class="te-btn sm" type="button" data-te="restablecer">${I("deshacer")} Restablecer la tarjeta</button>
      </div>
      ${sinGoogle() ? `<div class="te-ok" style="margin-top:8px">En este equipo falta conectar tu cuenta de Google (una sola vez). Al tocar el botón se abre la ventana de Google; eliges tu cuenta y el mensaje se envía.</div>` : ""}
      <div class="te-sub" id="te-falta" style="margin-top:6px;color:var(--ladrillo,#B5452F)">${f.length ? "Para enviar falta: " + esc(f.join(" · ")) : ""}</div>
      <div class="te-sub" style="margin-top:6px">Sale desde el WhatsApp de compras (${FIRMA.whatsapp}) en cerca de 1 minuto${esCot() ? ": primero el mensaje, luego la imagen y el PDF" : ""}. Si la PC de la casa está apagada, sale cuando se encienda.</div>`;
  }
  function refrescarFalta() {
    const f = faltan();
    const b = $("[data-te=enviar]"); if (b) b.disabled = !!f.length;
    const t = $("#te-falta"); if (t) t.textContent = f.length ? "Para enviar falta: " + f.join(" · ") : "";
  }
  function rehacerTexto() {
    if (E.editado) return refrescarFalta();
    E.texto = textoAuto();
    const t = $("#te-txt"); if (t) t.value = E.texto;
    refrescarFalta();
  }

  /* ── Hoja con membrete (la misma para la vista previa, el PNG y el PDF) ── */
  function htmlHoja() {
    const filas = E.items.filter((i) => i.producto.trim()).map((i, n) => `<tr><td>${n + 1}</td><td>${esc(i.producto)}</td><td>${esc(i.cantidad)}</td><td>${esc(i.unidad)}</td><td>${esc(i.finca || E.finca || "")}</td></tr>`).join("");
    const fecha = new Date().toLocaleDateString("es-EC", { day: "2-digit", month: "long", year: "numeric", timeZone: "America/Guayaquil" });
    const tel = E.prov.chat ? "" : (E.prov.telefono || "");
    return `<div id="te-hoja">
      <div class="mem"><div><div class="marca">${EMPRESA.comercial}</div><div class="rs">${EMPRESA.razon} · RUC ${EMPRESA.ruc}</div></div>
      <div class="der">${esc(fecha)}<br>Compras y Logística</div></div>
      <h4>SOLICITUD DE COTIZACIÓN</h4>
      <p><b>Para:</b> ${esc(E.prov.nombre)}${tel ? ` · ${esc(tel)}` : ""}</p>
      <p>Estimados, por favor su cotización de los siguientes productos:</p>
      <table><thead><tr><th>N.°</th><th>Producto</th><th>Cantidad</th><th>Unidad</th><th>Entrega en</th></tr></thead><tbody>${filas}</tbody></table>
      <div class="pide">Por favor indicar: <b>precio unitario</b> (IVA aparte), <b>disponibilidad o tiempo de entrega</b>, <b>forma de pago</b> y <b>validez de la oferta</b>.</div>
      <div class="firma">Saludos cordiales,<b>${FIRMA.nombre}</b>${FIRMA.cargo} · ${EMPRESA.comercial}<br>WhatsApp ${FIRMA.whatsapp}</div>
    </div>`;
  }
  async function lienzo(escala) {
    await cargarScript("https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js");
    $("#te-fuente").innerHTML = htmlHoja();
    return window.html2canvas($("#te-fuente #te-hoja"), { scale: escala || 1080 / 794, backgroundColor: "#ffffff", width: 794, windowWidth: 794 });
  }
  async function pngData() {
    let url = (await lienzo()).toDataURL("image/png");
    if (url.length > 750000) url = (await lienzo(0.9)).toDataURL("image/png");
    return url.length > 750000 ? "" : url;
  }
  const nombreArchivo = () => "Solicitud_" + plano(E.prov.nombre).replace(/ +/g, "_").slice(0, 40);

  async function vista() {
    const v = $("#te-vista");
    if (!esCot()) { v.innerHTML = `<div class="te-vista" style="background:#ECE5DD"><div class="te-burbuja">${esc(E.texto)}</div></div>`; return; }
    v.innerHTML = `<div class="te-ok">Armando la vista previa…</div>`;
    try {
      const url = await pngData();
      v.innerHTML = `<div class="te-vista" style="background:#ECE5DD"><div class="te-burbuja">${esc(E.texto)}</div>
        ${url ? `<img alt="Vista previa de la solicitud para ${esc(E.prov.nombre)}" src="${url}">` : `<div class="te-aviso">La imagen salió muy pesada; se enviará solo el PDF.</div>`}</div>`;
    } catch (e) { v.innerHTML = `<div class="te-aviso">No se pudo armar la vista previa: ${esc(e.message || e)}</div>`; }
  }
  async function bajarPng() {
    const a = document.createElement("a"); a.download = nombreArchivo() + ".png"; a.href = (await lienzo()).toDataURL("image/png"); a.click();
  }
  async function bajarPdf() {
    await cargarScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js");
    const c = await lienzo();
    const pdf = new window.jspdf.jsPDF({ unit: "mm", format: "a4" });
    if (window.AgdMov && AgdMov.pdfPaginado) AgdMov.pdfPaginado(pdf, c, $("#te-fuente #te-hoja"));   // varias páginas si la lista es larga
    else { const ancho = 190, alto = c.height * ancho / c.width; pdf.addImage(c.toDataURL("image/png"), "PNG", 10, 10, ancho, Math.min(alto, 277)); }
    pdf.save(nombreArchivo() + ".pdf");
  }

  /* ── Cambiar proveedor: buscador con rubro; avisa si no vende lo que se pide ── */
  /* Zonificación logística: Puerto Cayo y El Carmen son Costa; las demás fincas, Imbabura (Sierra).
     Un proveedor de la otra zona encarece el flete: se muestra al final y con aviso. «Nacional» sirve a las dos. */
  const COSTA = ["puerto cayo", "el carmen"];
  const zonaFinca = () => { const f = plano((E.finca && E.finca !== "varias" ? E.finca : "") || (E.items.find((i) => i.finca) || {}).finca || ""); return !f ? "" : (COSTA.some((c) => f.includes(c)) ? "Costa" : "Imbabura"); };
  const otraZona = (p) => { const z = zonaFinca(); return !!z && !!p.zona && p.zona !== "Nacional" && p.zona !== z; };
  const mismoRubro = (p) => { const r = E.rubrosOrig || []; return !r.length || !(p.rubros || []).length || (p.rubros || []).some((x) => r.includes(x)) || (p.rubros || []).includes("Por clasificar"); };
  function provOrdenados(q) {
    const qq = plano(q);
    // Primero los del mismo rubro y de la zona de la finca; después los sin clasificar; al final los de otro rubro.
    const rO = E.rubrosOrig || [];
    // rO[0] es el rubro principal de lo que se pide (el del proveedor original).
    const afin = (p) => { const r = p.rubros || []; return !rO.length ? 0 : r.includes(rO[0]) ? 0 : r.some((x) => rO.includes(x)) ? 3 : (r.includes("Por clasificar") || !r.length ? 6 : 9); };
    const pedidos = E.items.map((i) => plano(i.producto)).filter((x) => x.length > 2);
    const vendio = (p) => { if (p._v === undefined || p._vk !== pedidos.join("|")) { const s = (p.productos || []).map(plano); p._vk = pedidos.join("|"); p._v = pedidos.filter((x) => s.some((y) => y === x || y.includes(x) || x.includes(y))).length; } return p._v; };
    // Lo que el proveedor publica en su página web (investigado, no comprobado en el local): cuenta menos que haberlo vendido.
    const raiz = (w) => w.replace(/(es|s)$/, "");
    const publica = (p) => { if (p._w === undefined || p._wk !== pedidos.join("|")) { const s = (p.productos_web || []).map((x) => plano(x).split(" ").map(raiz)); p._wk = pedidos.join("|");
        p._w = !s.length ? 0 : pedidos.filter((x) => { const t = x.split(" ").filter((w) => w.length > 3).slice(0, 3).map(raiz); return t.length && s.some((y) => t.filter((w) => y.includes(w)).length >= Math.min(2, t.length)); }).length; } return p._w; };
    const orden = (p) => (p.veredicto === "no_usar" ? 40 : p.veredicto === "recomendado" ? -1 : 0) + (!vendio(p) && publica(p) ? -2 - Math.min(2, publica(p)) : 0) + afin(p) + (otraZona(p) ? 1.5 : 0) + ((p.chats || []).length ? 0 : p.telefono ? 0.4 : 0.8) - (vendio(p) ? 4 + vendio(p) : 0);
    const pals = qq.split(" ").filter(Boolean);
    const l = (CATALOGO || []).filter((p) => { if (!pals.length) return true; if (p._k === undefined) p._k = plano(p.nombre + " " + (p.chats || []).join(" ") + " " + (p.rubros || []).join(" ") + " " + (p.ciudad || "") + " " + (p.zona || "") + " " + (p.productos || []).join(" ") + " " + (p.productos_web || []).join(" ") + " " + (p.marcas || []).join(" ")); return pals.every((w) => p._k.includes(w)); })
      .sort((a, b) => orden(a) - orden(b) || a.nombre.localeCompare(b.nombre)).slice(0, 50);
    return { l, vendio, publica };
  }
  function listaProv(q) {
    const { l, vendio, publica } = provOrdenados(q);
    return l.map((p) => `<button type="button" data-te="elegir" data-n="${CATALOGO.indexOf(p)}"><b>${esc(p.nombre)}</b>
      ${p.descartado ? `<span class="te-chip alerta">sin chat útil · ${esc(p.descartado)}</span>` : ""}${p.veredicto === "no_usar" ? `<span class="te-chip alerta">marcado «No usar»</span>` : p.veredicto === "recomendado" ? `<span class="te-chip">recomendado por ti</span>` : ""}${p.prospecto ? `<span class="te-chip alerta">nuevo · sin verificar</span>` : ""}${!vendio(p) && publica(p) ? `<span class="te-chip">lo publica en su web (${publica(p)})</span>` : ""}${vendio(p) ? `<span class="te-chip">ya vendió ${vendio(p) === 1 ? "1 de estos productos" : vendio(p) + " de estos productos"}</span>` : ""}${otraZona(p) ? `<span class="te-chip alerta">otra zona · revisar flete</span>` : ""}${mismoRubro(p) ? "" : `<span class="te-chip alerta">no vende lo mismo</span>`}
      <span class="te-sub" style="display:block">${esc((p.rubros || []).join(" · "))}${(p.chats || []).length ? " · con WhatsApp" : p.telefono ? " · con teléfono" : " · sin WhatsApp"}${p.ciudad ? " · " + esc(p.ciudad) : p.zona ? " · " + esc(p.zona) : ""}</span></button>`).join("")
      || `<div class="te-sub" style="padding:10px">Ningún proveedor con ese nombre.</div>`;
  }
  function htmlBuscador() {
    if (!(CATALOGO || []).length) return `<div class="te-aviso">${I("alerta")} <b>No pude leer la base de proveedores.</b> ${sinGoogle() ? "En este navegador falta conectar tu cuenta de Google: sin eso no se ve la base ni se puede enviar por WhatsApp." : "Revisa el internet y vuelve a intentar."}
        <div style="margin-top:8px"><button class="te-btn p sm" type="button" data-te="conectar">${sinGoogle() ? "Conectar con Google y cargar proveedores" : "Volver a cargar proveedores"}</button></div></div>
      <div class="te-sub" style="margin-top:6px">Mientras tanto puedes escribir el proveedor a mano: <input id="te-nuevo" placeholder="Nombre del proveedor" style="margin-top:4px;width:100%;box-sizing:border-box;padding:9px;border:1px solid var(--bd,#E2E4E7);border-radius:8px;background:transparent;color:inherit;font:inherit">
        <input id="te-tel" inputmode="tel" placeholder="Número, ej. 0991234567" value="${esc(E.prov.telefono || "")}" style="margin-top:4px;width:100%;box-sizing:border-box;padding:9px;border:1px solid var(--bd,#E2E4E7);border-radius:8px;background:transparent;color:inherit;font:inherit">
        <button class="te-btn sm" type="button" data-te="usarnuevo" style="margin-top:4px">Usar este proveedor</button></div>`;
    return `<input id="te-buscar" class="te-buscar" autocomplete="off" placeholder="Buscar proveedor por nombre, chat, rubro o producto (ej.: fertilizantes, glufosinato)" aria-label="Buscar proveedor">
      <div class="te-sub" style="margin-top:4px">${(CATALOGO || []).length} proveedores en la base. Primero salen los que ya vendieron estos productos y los de la zona de la finca.</div>
      <div class="te-lista" id="te-lista">${listaProv("")}</div>
      ${!E.prov.nombre ? `<div class="te-sub" style="margin-top:6px">¿No está en la lista? Escribe su nombre y su número: <input id="te-nuevo" placeholder="Nombre del proveedor" style="margin-top:4px;width:100%;box-sizing:border-box;padding:9px;border:1px solid var(--bd,#E2E4E7);border-radius:8px;background:transparent;color:inherit;font:inherit">
        <input id="te-tel" inputmode="tel" placeholder="Número, ej. 0991234567" value="${esc(E.prov.telefono || "")}" style="margin-top:4px;width:100%;box-sizing:border-box;padding:9px;border:1px solid var(--bd,#E2E4E7);border-radius:8px;background:transparent;color:inherit;font:inherit">
        <button class="te-btn sm" type="button" data-te="usarnuevo" style="margin-top:4px">Usar este proveedor</button></div>` : ""}`;
  }
  /* ── Sugerencias de producto: salen debajo de la fila mientras se escribe ── */
  function quitarSug() { const s = $("#te-sug"); if (s) s.remove(); }
  function sugerir(inp) {
    if (!PRODS || !inp) return quitarSug();
    const n = Number(inp.dataset.i), q = plano(inp.value), pal = q.split(" ").filter(Boolean);
    const fi = fichaDe(E.prov.nombre, E.prov.chat), suyos = new Set(((fi && fi.productos) || []).map(plano));
    const ya = new Set(E.items.map((i, k) => (k === n ? "" : plano(i.producto))).filter(Boolean));
    let l = PRODS.filter((p) => !ya.has(plano(p.n)) && (pal.length ? pal.every((w) => p.k.includes(w)) : suyos.has(plano(p.n))));
    if (pal.length && l.length === 1 && plano(l[0].n) === q) l = [];   // ya está escrito tal cual: nada que sugerir
    const peso = (p) => (suyos.has(plano(p.n)) ? 0 : 2) + (q && plano(p.n).startsWith(q) ? 0 : 1) + (p.ag ? 0 : 0.5);
    l = l.sort((a, b) => peso(a) - peso(b) || a.n.localeCompare(b.n)).slice(0, 12);
    quitarSug();
    if (!l.length) return;
    const d = document.createElement("div"); d.id = "te-sug"; d.className = "te-lista te-sug"; d.setAttribute("role", "listbox");
    d.innerHTML = l.map((p) => `<button type="button" role="option" data-te="sug" data-i="${n}" data-p="${PRODS.indexOf(p)}"><b>${esc(p.n)}</b>
      ${suyos.has(plano(p.n)) ? `<span class="te-chip">este proveedor lo ha vendido</span>` : ""}
      <span class="te-sub" style="display:block">${esc([p.c, p.i, p.u ? "se pide en " + p.u : "", p.ag ? "" : "visto en proformas"].filter(Boolean).join(" · "))}</span></button>`).join("");
    inp.closest(".te-fila").after(d);
  }
  /* Copiar la imagen o el mensaje al portapapeles (para pegar con Ctrl+V donde haga falta) */
  const _nota = (t) => { const x = $("#te-falta"); if (x) x.textContent = t; };
  async function copiarImagen() {
    try {
      if (!navigator.clipboard || !window.ClipboardItem) throw new Error("este navegador no permite copiar imágenes");
      const c = await lienzo();
      const blob = await new Promise((ok) => c.toBlob(ok, "image/png"));
      await navigator.clipboard.write([new window.ClipboardItem({ "image/png": blob })]);
      _nota("Imagen copiada: pégala con Ctrl+V (o «Pegar») en el chat.");
    } catch (e) { _nota("No se pudo copiar la imagen (" + (e.message || e) + "). Usa el botón PNG para descargarla."); }
  }
  async function copiarMensaje() {
    try { await navigator.clipboard.writeText(String(E.texto || "")); _nota("Mensaje copiado."); }
    catch (e) { const t = $("#te-txt"); if (t) { t.focus(); t.select(); } _nota("Selecciona el mensaje y cópialo a mano: este navegador no dejó copiarlo solo."); }
  }
  /* Alternativa manual: abre el chat con el mensaje escrito. Usa el WhatsApp que esté abierto en ESTE equipo. */
  function abrirWhatsApp() {
    let d = String(E.prov.telefono || "").replace(/\D/g, "");
    if (d.startsWith("0")) d = "593" + d.slice(1); else if (d.length === 9) d = "593" + d;
    if (d.length < 11) { _nota("Para abrir el chat hace falta el número del proveedor."); return; }
    window.open("https://wa.me/" + d + "?text=" + encodeURIComponent(String(E.texto || "")), "_blank", "noopener");
    _nota("Se abrió WhatsApp con el mensaje. Confirma que sea el WhatsApp de COMPRAS y, cuando lo envíes, toca «Ya lo envié yo».");
  }

  /* A prueba de errores: antes de que salga algo por WhatsApp se muestra QUÉ va a salir y A QUIÉN, y se pide confirmar.
     Si hay algo raro (proveedor escrito a mano, de otra zona, ya se le pidió, cantidades extrañas) hay que marcar una casilla. */
  function confirmarEnvio() {
    if (ENVIANDO || faltan().length) return refrescarFalta();
    const viejo = $("#te-conf"); if (viejo) viejo.remove();
    const items = E.items.filter((i) => i.producto.trim());
    const fi = fichaDe(E.prov.nombre, E.prov.chat), ojo = [];
    if (!fi) ojo.push(`«${E.prov.nombre}» no está en la base de proveedores: revisa que el nombre y el número sean correctos.`);
    if (fi && fi.veredicto === "no_usar") ojo.push(`Marcaste a ${E.prov.nombre} como «No usar»${fi.veredicto_nota ? " (" + fi.veredicto_nota + ")" : ""}. ¿Seguro que quieres pedirle?`);
    if (fi && fi.prospecto) ojo.push(`${E.prov.nombre} es un proveedor NUEVO hallado en internet${fi.encontrado ? " el " + fi.encontrado.split("-").reverse().join("/") : ""}: nunca nos ha cotizado y su número no está comprobado.${fi.nota ? " " + fi.nota : ""}`);
    if (fi && otraZona(fi)) ojo.push(`${E.prov.nombre} es de otra zona: puede haber flete.`);
    if (fi && !mismoRubro(fi)) ojo.push(`${E.prov.nombre} normalmente no vende este tipo de producto.`);
    if ((E.op.excluir || []).map(plano).includes(plano(E.prov.nombre))) ojo.push(`Ya le pediste esta misma lista a ${E.prov.nombre}. Si envías, le llegará repetida.`);
    const raras = items.filter((i) => { const n = Number(String(i.cantidad).replace(",", ".")); return !isFinite(n) || n <= 0 || n >= 10000; });
    if (raras.length) ojo.push(`Revisa la cantidad de: ${raras.map((i) => i.producto).slice(0, 4).join(", ")}.`);
    if (items.some((i) => !String(i.unidad).trim())) ojo.push("Hay productos sin unidad (kg, litros, unidades…).");
    const destino = E.prov.chat ? `chat «${E.prov.chat}»` : `número ${E.prov.telefono}`;
    const d = document.createElement("div"); d.id = "te-conf"; d.className = "te-ok"; d.setAttribute("role", "alertdialog"); d.setAttribute("aria-label", "Confirmar el envío");
    d.style.cssText = "border:2px solid var(--pri,#2E5E8E);margin-top:10px;padding:12px";
    d.innerHTML = `<b style="font-size:15px">Revisa antes de enviar</b>
      <div style="margin-top:6px">Se enviará a <b>${esc(E.prov.nombre)}</b> (${esc(destino)}) desde el WhatsApp de compras:</div>
      <ul style="margin:6px 0 6px 18px;padding:0">${items.slice(0, 8).map((i) => `<li>${esc([i.cantidad, i.unidad].filter(Boolean).join(" "))} — ${esc(i.producto)}</li>`).join("")}${items.length > 8 ? `<li>… y ${items.length - 8} más</li>` : ""}</ul>
      <div class="te-sub">${esCot() ? "Sale el mensaje, la imagen de la solicitud y el PDF." : "Sale solo el mensaje."}${E.finca ? " Entrega en " + esc(E.finca) + "." : ""} Una vez enviado no se puede borrar del WhatsApp del proveedor.</div>
      ${ojo.map((t) => `<div class="te-aviso">${I("alerta")} ${esc(t)}</div>`).join("")}
      ${ojo.length ? `<label style="display:flex;gap:8px;align-items:center;margin-top:8px;font-weight:600"><input type="checkbox" id="te-visto" style="width:20px;height:20px"> Ya revisé estos avisos y quiero enviar igual</label>` : ""}
      <div class="te-acc"><button class="te-btn p" type="button" data-te="sienviar" ${ojo.length ? "disabled" : ""}>${I("check")} Sí, enviar ahora</button>
        <button class="te-btn" type="button" data-te="noenviar">No, volver a revisar</button></div>`;
    $("[data-te=enviar]").closest(".te-acc").after(d);
    d.scrollIntoView({ block: "nearest", behavior: "smooth" });
    const v = $("#te-visto"); if (v) v.onchange = () => { $("[data-te=sienviar]").disabled = !v.checked; };
    const b = ojo.length ? v : $("[data-te=sienviar]"); if (b) b.focus();
  }
  async function enviar() {
    if (ENVIANDO) return;
    const est = E;                      // el estado de ESTA tarjeta: no cambia aunque algo intente cerrarla
    const b = $("[data-te=enviar]");
    // Sin la cuenta de Google no se puede enviar: se conecta aquí mismo, con este clic, y se sigue.
    if (window.AgdNube && AgdNube.asegurarConexion && !(AgdNube.estaConectada && AgdNube.estaConectada())) {
      const nota = $("#te-falta"); b.disabled = true; b.textContent = "Conectando tu cuenta de Google…";
      try { await AgdNube.asegurarConexion(); }
      catch (e) { b.disabled = false; b.innerHTML = I("check") + " Conectar Google y enviar"; if (nota) nota.textContent = "No se conectó: " + (e.message || e); return; }
      if (E !== est) return;            // la tarjeta se cerró mientras se conectaba
      if (nota) nota.textContent = "";
    }
    b.disabled = true; b.textContent = "Enviando…";
    ENVIANDO = true;
    document.querySelectorAll("#te-caja [data-te]").forEach((x) => { if (x !== b) x.disabled = true; });
    try {
      let items = est.items.filter((i) => i.producto.trim()).map((i) => ({ producto: i.producto.trim(), cantidad: String(i.cantidad).trim(),
        unidad: String(i.unidad || "").trim(), finca: i.finca || est.finca || "", linea: i.linea || "", pedido: i.pedido || "" }));
      // Un seguimiento puede no llevar productos (pedir datos, una factura…): se guarda el asunto como referencia.
      if (!items.length) items = [{ producto: String(est.op.contexto || "Mensaje de seguimiento").slice(0, 200), cantidad: "", unidad: "", finca: est.finca || "", linea: "", pedido: "" }];
      const cot = est.tipo === "cotizacion";
      const png = cot ? await pngData() : "";
      const sol = { tipo: cot ? "cotizacion" : "mensaje", proveedor: est.prov.nombre, chat: est.prov.chat || "",
        telefono: String(est.prov.telefono || "").replace(/\D/g, ""), items, texto: String(est.texto).trim(),
        png, origen: est.op.origen || "whatsapp" };
      if (!window.AgdNube) throw new Error("La nube no está disponible: revisa la conexión.");
      const sid = await AgdNube.crearSolicitudCotizacion(sol);
      dec("tarjeta_enviada", Object.assign(resumenDecision(est), { solicitud_id: sid }));
      const op = est.op; ENVIANDO = false; cerrar(true);
      if (op.alEnviar) op.alEnviar({ solicitud_id: sid, texto: sol.texto, items, proveedor: sol.proveedor, chat: sol.chat });
    } catch (e) {
      ENVIANDO = false;
      document.querySelectorAll("#te-caja [data-te]").forEach((x) => { x.disabled = false; });
      b.disabled = false; b.innerHTML = I("check") + " Aprobar y enviar por WhatsApp";
      const t = $("#te-falta"); if (t) t.textContent = "NO se envió: " + (e.message || e) + " · Mándame una captura.";
    }
  }

  function enEvento(e) {
    const el = e.target.closest("[data-te]"); if (!el || !E || ENVIANDO) return;
    const a = el.dataset.te;
    if (a === "cerrar") return cerrar();
    if (a === "quitar") { E.items.splice(Number(el.dataset.i), 1); if (!E.items.length) E.items.push({ producto: "", cantidad: "", unidad: "" }); E.texto = E.editado ? E.texto : textoAuto(); return pintar(); }
    if (a === "agregar") { E.items.push({ producto: "", cantidad: "1", unidad: "", finca: E.finca || "" }); pintar(); const ins = document.querySelectorAll(".te-tabla [data-k=producto]"); const u = ins[ins.length - 1]; u.placeholder = "Escribe para buscar en la base de productos"; u.focus(); productos().then(() => { if (E && document.activeElement === u) sugerir(u); }); return; }
    if (a === "sug") {
      const p = PRODS[Number(el.dataset.p)], it = E.items[Number(el.dataset.i)]; if (!p || !it) return;
      it.producto = p.n; if (p.u && (!String(it.unidad).trim() || it.unidad === "u")) it.unidad = p.u;
      E.texto = E.editado ? E.texto : textoAuto(); pintar();
      const c = document.querySelector(`.te-tabla [data-k=cantidad][data-i="${el.dataset.i}"]`); if (c) { c.focus(); c.select(); }
      return;
    }
    if (a === "conectar") {
      el.disabled = true; el.textContent = "Conectando…";
      (async () => {
        const est = E;
        try { if (sinGoogle() && AgdNube.asegurarConexion) await AgdNube.asegurarConexion(); } catch (e) { if (E === est) { _nota("No se conectó: " + (e.message || e)); pintar(); } return; }
        CATALOGO = null; PRODS = null; await catalogo(); productos();
        if (E !== est) return;
        preelegir(); pintar();
      })();
      return;
    }
    if (a === "usarnuevo") {
      const nom = String(($("#te-nuevo") || {}).value || "").trim(); if (!nom) { _nota("Escribe el nombre del proveedor."); return; }
      E.prov = { nombre: nom, chat: "", telefono: String(($("#te-tel") || {}).value || "").trim() }; E.buscando = false;
      E.texto = E.editado ? E.texto : textoAuto(); E.avisoProv = `${nom} no está en la base de proveedores: se enviará al número que escribiste.`;
      return pintar();
    }
    if (a === "rehacer") { E.editado = false; E.avisoProv = ""; E.texto = textoAuto(); return pintar(); }
    if (a === "vista") return vista();
    if (a === "copiarimg") return copiarImagen();
    if (a === "copiartxt") return copiarMensaje();
    if (a === "abrirwa") return abrirWhatsApp();
    if (a === "restablecer") { const o = JSON.parse(E.original); E.prov = o.prov; E.items = o.items; E.texto = o.texto; E.editado = o.editado; E.avisoProv = ""; return pintar(); }
    if (a === "png") return bajarPng();
    if (a === "pdf") return bajarPdf();
    if (a === "enviar") return confirmarEnvio();
    if (a === "sienviar") { const c = $("#te-conf"); if (c) c.remove(); return enviar(); }
    if (a === "noenviar") { const c = $("#te-conf"); if (c) c.remove(); const b = $("[data-te=enviar]"); if (b) b.focus(); return; }
    if (a === "yaenvie") { const op = E.op; const t = E.texto; dec("tarjeta_enviada_a_mano", resumenDecision(E)); cerrar(); if (op.alYaEnviado) op.alYaEnviado({ texto: t }); return; }
    if (a === "cambiar") {
      const c = $("#te-elegir");
      E.buscando = !E.buscando;
      c.innerHTML = E.buscando ? htmlBuscador() : "";
      if (E.buscando) $("#te-buscar").focus();
      return;
    }
    if (a === "elegir") {
      const p = CATALOGO[Number(el.dataset.n)];
      E.prov = { nombre: p.nombre, chat: mejorChat(p), telefono: p.telefono || "" }; E.buscando = false;
      if (!(E.rubrosOrig || []).length) E.rubrosOrig = (p.rubros || []).filter((r) => r !== "Por clasificar");   // sin proveedor original: el rubro lo fija el primero que se elige
      E.texto = E.editado ? E.texto : textoAuto();
      const av = [];
      if (otraZona(p)) av.push(`${p.nombre} es de ${p.zona} y la entrega es en ${zonaFinca() === "Costa" ? "la Costa" : "Imbabura"}: pregunta el costo del flete antes de aprobar.`);
      if (!mismoRubro(p)) av.push(`${p.nombre} vende ${(p.rubros || []).join(", ")}; lo que se pide era de ${(E.rubrosOrig || []).join(", ")}. Confirma que sí lo tenga.`);
      if (E.editado) av.push(`Cambiaste el proveedor: revisa el saludo del mensaje o toca «Rehacer el mensaje».`);
      E.avisoProv = av.join(" ");
      return pintar();
    }
  }
  function enInput(e) {
    if (!E) return;
    if (e.target.id !== "te-visto") { const c = $("#te-conf"); if (c) c.remove(); }
    const el = e.target;
    if (el.id === "te-buscar") { $("#te-lista").innerHTML = listaProv(el.value); return; }
    if (el.id === "te-txt") { E.texto = el.value; E.textoTocado = true; if (!E.editado) { E.editado = true; } return refrescarFalta(); }
    if (el.id === "te-tel") { E.prov.telefono = el.value; return refrescarFalta(); }
    if (el.dataset && el.dataset.te === "otrochat") { E.prov.chat = el.value; return pintar(); }
    if (el.dataset.k) { E.items[Number(el.dataset.i)][el.dataset.k] = el.value; rehacerTexto(); if (el.dataset.k === "producto") productos().then(() => { if (E && document.activeElement === el) sugerir(el); }); }
  }
  function enFoco(e) {
    if (!E) return;
    const el = e.target;
    if (el.dataset && el.dataset.k === "producto") { productos().then(() => { if (E && document.activeElement === el) sugerir(el); }); return; }
    if (!(el.closest && el.closest("#te-sug"))) quitarSug();
  }

  /* El agente propone el proveedor: solo si hay prueba (ya vendió alguno de estos productos); si no, se queda el buscador. */
  function preelegir() {
    if (!E || E.prov.nombre || !E.op.preelegir || !(CATALOGO || []).length) return;
    const fuera = (E.op.excluir || []).map(plano);
    const { l, vendio } = provOrdenados("");
    const p = l.find((x) => vendio(x) > 0 && x.veredicto !== "no_usar" && !x.descartado && !fuera.includes(plano(x.nombre)) && ((x.chats || []).length || x.telefono));
    if (!p) return;
    const n = vendio(p), tot = E.items.filter((i) => plano(i.producto).length > 2).length;
    E.prov = { nombre: p.nombre, chat: mejorChat(p), telefono: p.telefono || "" };
    E.rubrosOrig = (p.rubros || []).filter((r) => r !== "Por clasificar");
    E.elegidoPorAgente = p.nombre;
    E.avisoProv = `El agente eligió a ${p.nombre} porque ya vendió ${n} de ${tot} producto(s) de esta lista${p.zona ? " y es de " + p.zona : ""}.` +
      (n < tot ? ` De los otros ${tot - n} no hay registro con este proveedor: confirma que los tenga o quítalos.` : "") + (otraZona(p) ? " Es de otra zona: pregunta el flete." : "") + " Cámbialo si no corresponde.";
    if (!E.editado) E.texto = textoAuto();
  }
  /** Abre la tarjeta. envio = { tipo:"cotizacion"|"mensaje", proveedor:{nombre,chat,telefono}, items:[{producto,cantidad,unidad,finca,linea,pedido}],
   *  texto, finca }; op = { contexto, generar(envio)→texto, alEnviar(res), alYaEnviado(res), avisos:[], origen } */
  async function abrir(envio, op) {
    if (ENVIANDO) return;   // hay un envío saliendo: no se abre otra tarjeta encima
    montar();
    await catalogo();
    E = {
      tipo: envio.tipo === "mensaje" ? "mensaje" : "cotizacion",
      prov: Object.assign({ nombre: "", chat: "", telefono: "" }, envio.proveedor || {}),
      items: (envio.items || []).map((i) => ({ producto: String(i.producto || ""), cantidad: i.cantidad == null ? "" : String(i.cantidad),
        unidad: String(i.unidad || ""), finca: i.finca || envio.finca || "", linea: i.linea || "", pedido: i.pedido || "" })),
      finca: envio.finca || "", fincaId: envio.fincaId || "", texto: envio.texto || "", editado: false, avisoProv: "", op: op || {},
    };
    if (!E.items.length) E.items.push({ producto: "", cantidad: "", unidad: "" });
    productos();   // se va cargando la base de productos para el buscador
    // Si el chat no vino, se busca en el catálogo (chats verificados por Claude)
    const fi = fichaDe(E.prov.nombre, E.prov.chat);
    if (fi && !E.prov.chat) E.prov.chat = mejorChat(fi);
    if (fi && !E.prov.telefono) E.prov.telefono = fi.telefono || "";
    if (!E.texto) E.texto = textoAuto();
    else { let auto = ""; try { auto = String(textoAuto() || ""); } catch (e) {} E.editado = E.texto.trim() !== auto.trim(); }
    E.rubrosOrig = fi ? (fi.rubros || []).filter((r) => r !== "Por clasificar") : [];
    preelegir();
    E.original = JSON.stringify({ prov: E.prov, items: E.items, texto: E.texto, editado: E.editado });
    FOCO_PREVIO = document.activeElement;
    pintar();
    $("#te-capa").classList.add("ver");
    $("#te-capa").scrollTop = 0;
    const tit = $("#te-titulo"); if (tit) { tit.tabIndex = -1; tit.focus({ preventScroll: true }); }
  }

  document.addEventListener("click", enEvento);
  document.addEventListener("input", enInput);
  document.addEventListener("focusin", enFoco);
  window.AgdTarjeta = { abrir, cerrar, _estado: () => E };
})();
