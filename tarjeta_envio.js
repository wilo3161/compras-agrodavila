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
    return CATALOGO;
  }
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
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && $("#te-capa").classList.contains("ver")) cerrar(); });
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
  function textoAuto() {
    try { if (E.op.generar) return E.op.generar({ tipo: E.tipo, prov: E.prov, items: E.items.filter((i) => i.producto.trim()), finca: E.finca, fincaId: E.fincaId }) || E.texto; }
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
        ${rubros.map((r) => `<span class="te-chip">${esc(r)}</span>`).join("")}${fi && otraZona(fi) ? `<span class="te-chip alerta">otra zona · revisar flete</span>` : ""}
        <div class="te-sub">${E.prov.chat ? `Chat de WhatsApp: «${esc(E.prov.chat)}»` : E.prov.telefono ? `WhatsApp ${esc(E.prov.telefono)}` : `<span style="color:var(--ladrillo,#B5452F)">Sin chat de WhatsApp: escribe el número abajo.</span>`}</div>
        ${!E.prov.chat ? `<input id="te-tel" inputmode="tel" placeholder="Número del proveedor, ej. 0991234567" value="${esc(E.prov.telefono || "")}" style="margin-top:6px;width:100%;box-sizing:border-box;padding:9px;border:1px solid var(--bd,#E2E4E7);border-radius:8px;background:transparent;color:inherit;font:inherit">` : ""}
        <button class="te-btn sm" type="button" data-te="cambiar" style="margin-top:6px">${I("refrescar")} Cambiar proveedor</button>
        <div id="te-elegir"></div>
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
        <button class="te-btn p" type="button" data-te="enviar" ${f.length ? "disabled" : ""}>${I("check")} Aprobar y enviar por WhatsApp</button>
        <button class="te-btn" type="button" data-te="yaenvie">Ya lo envié yo</button>
        <button class="te-btn" type="button" data-te="cerrar">Cancelar</button>
      </div>
      <div class="te-acc">
        <button class="te-btn sm" type="button" data-te="abrirwa">${I("whatsapp")} Abrir el chat en WhatsApp (envío manual)</button>
        <button class="te-btn sm" type="button" data-te="restablecer">${I("deshacer")} Restablecer la tarjeta</button>
      </div>
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
  const zonaFinca = () => { const f = plano(E.finca || (E.items.find((i) => i.finca) || {}).finca || ""); return !f ? "" : (COSTA.some((c) => f.includes(c)) ? "Costa" : "Imbabura"); };
  const otraZona = (p) => { const z = zonaFinca(); return !!z && !!p.zona && p.zona !== "Nacional" && p.zona !== z; };
  const mismoRubro = (p) => { const r = E.rubrosOrig || []; return !r.length || !(p.rubros || []).length || (p.rubros || []).some((x) => r.includes(x)) || (p.rubros || []).includes("Por clasificar"); };
  function listaProv(q) {
    const qq = plano(q);
    // Primero los del mismo rubro y de la zona de la finca; después los sin clasificar; al final los de otro rubro.
    const rO = E.rubrosOrig || [];
    // rO[0] es el rubro principal de lo que se pide (el del proveedor original).
    const afin = (p) => { const r = p.rubros || []; return !rO.length ? 0 : r.includes(rO[0]) ? 0 : r.some((x) => rO.includes(x)) ? 3 : (r.includes("Por clasificar") || !r.length ? 6 : 9); };
    const orden = (p) => afin(p) + (otraZona(p) ? 1.5 : 0) + ((p.chats || []).length ? 0 : p.telefono ? 0.4 : 0.8);
    const l = (CATALOGO || []).filter((p) => !qq || plano(p.nombre + " " + (p.chats || []).join(" ") + " " + (p.rubros || []).join(" ") + " " + (p.ciudad || "") + " " + (p.zona || "")).includes(qq))
      .sort((a, b) => orden(a) - orden(b) || a.nombre.localeCompare(b.nombre)).slice(0, 50);
    return l.map((p) => `<button type="button" data-te="elegir" data-n="${CATALOGO.indexOf(p)}"><b>${esc(p.nombre)}</b>
      ${otraZona(p) ? `<span class="te-chip alerta">otra zona · revisar flete</span>` : ""}${mismoRubro(p) ? "" : `<span class="te-chip alerta">no vende lo mismo</span>`}
      <span class="te-sub" style="display:block">${esc((p.rubros || []).join(" · "))}${(p.chats || []).length ? " · con WhatsApp" : p.telefono ? " · con teléfono" : " · sin WhatsApp"}${p.ciudad ? " · " + esc(p.ciudad) : p.zona ? " · " + esc(p.zona) : ""}</span></button>`).join("")
      || `<div class="te-sub" style="padding:10px">Ningún proveedor con ese nombre.</div>`;
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

  async function enviar() {
    if (ENVIANDO) return;
    const est = E;                      // el estado de ESTA tarjeta: no cambia aunque algo intente cerrarla
    const b = $("[data-te=enviar]"); b.disabled = true; b.textContent = "Enviando…";
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
    if (a === "agregar") { E.items.push({ producto: "", cantidad: "1", unidad: "u", finca: E.finca || "" }); pintar(); const ins = document.querySelectorAll(".te-tabla [data-k=producto]"); ins[ins.length - 1].focus(); return; }
    if (a === "rehacer") { E.editado = false; E.avisoProv = ""; E.texto = textoAuto(); return pintar(); }
    if (a === "vista") return vista();
    if (a === "copiarimg") return copiarImagen();
    if (a === "copiartxt") return copiarMensaje();
    if (a === "abrirwa") return abrirWhatsApp();
    if (a === "restablecer") { const o = JSON.parse(E.original); E.prov = o.prov; E.items = o.items; E.texto = o.texto; E.editado = o.editado; E.avisoProv = ""; return pintar(); }
    if (a === "png") return bajarPng();
    if (a === "pdf") return bajarPdf();
    if (a === "enviar") return enviar();
    if (a === "yaenvie") { const op = E.op; const t = E.texto; dec("tarjeta_enviada_a_mano", resumenDecision(E)); cerrar(); if (op.alYaEnviado) op.alYaEnviado({ texto: t }); return; }
    if (a === "cambiar") {
      const c = $("#te-elegir");
      if (c.innerHTML) { c.innerHTML = ""; return; }
      c.innerHTML = `<input id="te-buscar" placeholder="Buscar por nombre, chat o rubro (ej.: fertilizantes)" style="margin-top:6px;width:100%;box-sizing:border-box;padding:9px;border:1px solid var(--bd,#E2E4E7);border-radius:8px;background:transparent;color:inherit;font:inherit">
        <div class="te-lista" id="te-lista">${listaProv("")}</div>`;
      $("#te-buscar").focus();
      return;
    }
    if (a === "elegir") {
      const p = CATALOGO[Number(el.dataset.n)];
      E.prov = { nombre: p.nombre, chat: (p.chats || [])[0] || p.chat || "", telefono: p.telefono || "" };
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
    const el = e.target;
    if (el.id === "te-buscar") { $("#te-lista").innerHTML = listaProv(el.value); return; }
    if (el.id === "te-txt") { E.texto = el.value; E.textoTocado = true; if (!E.editado) { E.editado = true; } return refrescarFalta(); }
    if (el.id === "te-tel") { E.prov.telefono = el.value; return refrescarFalta(); }
    if (el.dataset.k) { E.items[Number(el.dataset.i)][el.dataset.k] = el.value; rehacerTexto(); }
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
    // Si el chat no vino, se busca en el catálogo (chats verificados por Claude)
    const fi = fichaDe(E.prov.nombre, E.prov.chat);
    if (fi && !E.prov.chat) E.prov.chat = (fi.chats || [])[0] || fi.chat || "";
    if (fi && !E.prov.telefono) E.prov.telefono = fi.telefono || "";
    if (!E.texto) E.texto = textoAuto();
    else { let auto = ""; try { auto = String(textoAuto() || ""); } catch (e) {} E.editado = E.texto.trim() !== auto.trim(); }
    E.rubrosOrig = fi ? (fi.rubros || []).filter((r) => r !== "Por clasificar") : [];
    E.original = JSON.stringify({ prov: E.prov, items: E.items, texto: E.texto, editado: E.editado });
    FOCO_PREVIO = document.activeElement;
    pintar();
    $("#te-capa").classList.add("ver");
    $("#te-capa").scrollTop = 0;
    const tit = $("#te-titulo"); if (tit) { tit.tabIndex = -1; tit.focus({ preventScroll: true }); }
  }

  document.addEventListener("click", enEvento);
  document.addEventListener("input", enInput);
  window.AgdTarjeta = { abrir, cerrar, _estado: () => E };
})();
