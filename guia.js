/* Compras AgroDávila · marco común: íconos dibujados, barra de secciones, ayuda por pestaña y recorrido guiado.
   Se incluye dentro de comun.js al construir la app. */
(function () {
  /* Íconos (trazos estilo Lucide, licencia ISC). Todos con el mismo grosor. */
  const P = {
    inicio: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M10 21v-6h4v6"/>',
    control: '<path d="M3 3v18h18"/><rect x="7" y="12" width="3" height="6" rx="1"/><rect x="12" y="8" width="3" height="10" rx="1"/><rect x="17" y="5" width="3" height="13" rx="1"/>',
    whatsapp: '<path d="M21 11.5a8.4 8.4 0 0 1-12.4 7.4L3 20.5l1.7-5.3A8.4 8.4 0 1 1 21 11.5Z"/><path d="M8.5 9.5c.3 2.5 2.4 4.6 5 5"/>',
    ayuda: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.2a2.6 2.6 0 0 1 5 .9c0 1.7-2.5 2.3-2.5 3.9"/><path d="M12 17h.01"/>',
    refrescar: '<path d="M20 11a8 8 0 0 0-14.3-4.9L4 8"/><path d="M4 3v5h5"/><path d="M4 13a8 8 0 0 0 14.3 4.9L20 16"/><path d="M20 21v-5h-5"/>',
    excel: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z"/><path d="M14 3v5h5"/><path d="m9 12 6 6"/><path d="m15 12-6 6"/>',
    bajar: '<path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/>',
    enviar: '<path d="M21 3 10 14"/><path d="M21 3 14.5 21 10 14 3 9.5Z"/>',
    tema: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
    cerrar: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
    hoja: '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.5 19 2c1 2 2 4.2 2 8 0 5.5-4.8 10-10 10Z"/><path d="M2 21c0-3 1.9-5.4 5-6"/>',
    foco: '<path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2Z"/>',
    salir: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/>',
    llave: '<circle cx="7.5" cy="15.5" r="4.5"/><path d="m10.7 12.3 9.8-9.8"/><path d="m16 7 3 3"/>',
    instalar: '<rect x="6" y="2" width="12" height="20" rx="2.5"/><path d="M12 7v7"/><path d="m9 11 3 3 3-3"/>',
    alerta: '<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
    flecha: '<path d="M5 12h14"/><path d="m13 6 6 6-6 6"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    camion: '<path d="M10 17h4V5H2v12h3"/><path d="M14 9h4l4 4v4h-3"/><circle cx="7.5" cy="17.5" r="2.5"/><circle cx="16.5" cy="17.5" r="2.5"/>'
  };
  const ico = (n, cls) => `<svg class="ico${cls ? " " + cls : ""}" viewBox="0 0 24 24" aria-hidden="true">${P[n] || ""}</svg>`;

  const pag = () => { const p = (location.pathname.split("/").pop() || "index.html").toLowerCase(); return p === "" ? "index.html" : p; };

  /* Ayuda corta de cada pestaña (lo que es y qué hacer). */
  const AYUDA = {
    "control.html": {
      pend: ["Lo pendiente, en orden de prioridad", "Empiece por las rojas (Crítica). Cada fila dice qué pasa, quién lo tiene y qué hacer. Toque una tarjeta de color para filtrar."],
      flujo: ["Dónde se está quedando la compra", "La barra roja es el mayor atasco: ahí está el tiempo perdido. Abajo, cuántos días toma cada paso frente a la meta."],
      kpi: ["Indicadores con meta", "Cada número trae su meta. Úselos en la reunión semanal con Gerencia."],
      kraljic: ["Clasificación de categorías (Kraljic)", "Le dice cómo comprar cada categoría. Si cambia el riesgo de una, mueva sus deslizadores: se guarda en este equipo."],
      prov: ["Proveedores ordenados por gasto", "Los de arriba concentran el gasto: son los primeros para negociar precio y crédito."],
      pagos: ["Pagos y entregas por orden de compra", "Rojo: pago vencido o entrega atrasada. Confirme con Contabilidad o con el proveedor."]
    },
    "whatsapp.html": {
      asis: ["Asistente", "Lo que el vigía de la PC encontró en los chats. Desde el teléfono, use «Hoy» y «Mensajes listos»."],
      hoy: ["Su día en compras", "Lo que hay por cotizar, por autorizar, para generar OC y en curso. Toque un grupo para ver el detalle."],
      listos: ["Mensajes listos para enviar", "Revise cada mensaje y toque «Revisar y enviar»: se abre WhatsApp con el texto escrito y usted pulsa Enviar."],
      pedidos: ["Pedidos y cotizaciones", "Todo lo que está en marcha, con filtros por finca, estado y proveedor."],
      tramites: ["Facturas, pagos y devoluciones", "Lo que no es compra nueva pero sigue pendiente con proveedores."],
      prov: ["Proveedores", "Ficha de cada proveedor: zona, condiciones y qué tan rápido responde."],
      aquien: ["¿A quién le pido?", "Elija la finca y el producto: le propongo proveedores de esa zona y armo el mensaje."],
      precios: ["Precios", "Compare precios con IVA entre proveedores antes de elegir."],
      rapidez: ["Rapidez de respuesta", "Quién contesta rápido y quién no: úselo para decidir a quién escribir primero."],
      kraljic: ["Segmentación", "Cómo conviene comprar cada categoría."],
      msgs: ["Plantillas", "Textos base que puede reutilizar."],
      proc: ["Cómo trabajar", "El procedimiento de compras paso a paso y la rutina diaria."],
      ajustes: ["Ajustes", "Preferencias de la app en este equipo."]
    }
  };

  /* Pasos del recorrido de cada pantalla: [selector, título, texto] */
  const TOUR = {
    "index.html": [
      [".marco", "Su barra de secciones", "Desde aquí pasa entre Inicio, Control y WhatsApp. En el teléfono está abajo, al alcance del pulgar."],
      ["#urgente", "Lo urgente hoy", "Un vistazo a lo que espera por usted en AgroControl, actualizado en vivo."],
      ["#accesos", "Accesos rápidos", "Las tareas de todos los días a un toque: ver pendientes, enviar mensajes y bajar el Excel."],
      [".ayuda", "Ayuda cuando la necesite", "Toque «¿Cómo uso esto?» en cualquier pantalla para volver a ver este recorrido."]
    ],
    "control.html": [
      ["#refrescar", "Se actualiza solo", "La app lee AgroControl cada 5 minutos. Este botón es por si quiere ver lo último ya."],
      ["#xlsMatriz", "Excel para la matriz", "Descarga el archivo que se pega en Datos_AgroControl del Modelo de Gestión."],
      ["#tabs", "Seis vistas", "Pendientes, dónde nos quedamos, KPIs, Kraljic, proveedores y pagos."],
      ["#vista .grid", "Prioridades", "Empiece por Crítica. Toque una tarjeta para ver solo esas."]
    ],
    "whatsapp.html": [
      ["#nav", "Pestañas", "Hoy, Mensajes listos, Pedidos, Facturas, Proveedores y más."],
      ['[data-tab="listos"]', "Mensajes listos", "Aquí están los mensajes para proveedores, ya redactados."],
      ['[data-tab="aquien"]', "¿A quién le pido?", "Elija finca y producto, y la app le sugiere proveedores de la zona."]
    ]
  };

  function ponerMarco() {
    if (document.querySelector(".marco")) return;
    const p = pag();
    const items = [["index.html", "inicio", "Inicio"], ["control.html", "control", "Control"], ["whatsapp.html", "whatsapp", "WhatsApp"]];
    const n = document.createElement("nav"); n.className = "marco"; n.setAttribute("aria-label", "Secciones de la app");
    n.innerHTML = `<a class="marca" href="index.html"><span class="sello">${ico("hoja")}</span>Compras AgroDávila</a>` +
      items.map(([h, i, t]) => `<a class="sec" href="${h}"${p === h ? ' aria-current="page"' : ""}>${ico(i)}<span>${t}</span></a>`).join("") +
      `<button class="ayuda" type="button" aria-label="Cómo uso esta pantalla">${ico("ayuda")}<span>¿Cómo uso esto?</span></button>`;
    document.body.insertBefore(n, document.body.firstChild);
    n.querySelector(".ayuda").onclick = () => recorrido(true);
  }

  /* Íconos en los botones conocidos de cada pantalla */
  const BOTONES = [["#refrescar", "refrescar"], ["#xlsMatriz", "excel"], ["#csv", "bajar"], ["#bTema", "tema"], ["[data-benv]", "enviar"], ["[data-copiar]", "enviar"], ["#revOk", "enviar"]];
  function iconosBotones() {
    BOTONES.forEach(([sel, i]) => document.querySelectorAll(sel).forEach(b => {
      if (b.dataset.ico) return; b.dataset.ico = "1"; b.insertAdjacentHTML("afterbegin", ico(i));
    }));
  }

  /* Ayuda corta arriba de cada pestaña, que se puede ocultar */
  function guiaPestana() {
    const p = pag(), mapa = AYUDA[p]; if (!mapa) return;
    let tab; try { tab = TAB; } catch (e) { return; }  // TAB es la pestaña actual de cada pantalla
    const caja = document.getElementById(p === "control.html" ? "vista" : "main"); if (!caja || !mapa[tab]) return;
    const clave = "agd_guia_oculta_" + p + "_" + tab;
    let oculta = false; try { oculta = localStorage.getItem(clave) === "1"; } catch (e) {}
    const actual = caja.querySelector(":scope > .guia-pestana");
    if (oculta) { if (actual) actual.remove(); return; }
    if (actual && actual.dataset.tab === tab) return;
    if (actual) actual.remove();
    const d = document.createElement("div"); d.className = "guia-pestana"; d.dataset.tab = tab; d.setAttribute("role", "note");
    d.innerHTML = `${ico("foco")}<div><b>${mapa[tab][0]}.</b> ${mapa[tab][1]}</div><button type="button" aria-label="Ocultar esta ayuda">${ico("cerrar")}</button>`;
    d.querySelector("button").onclick = () => { try { localStorage.setItem(clave, "1"); } catch (e) {} d.remove(); };
    caja.insertBefore(d, caja.firstChild);
  }

  /* Recorrido guiado: la primera vez de cada pantalla y cuando se pide «¿Cómo uso esto?» */
  function recorrido(forzado) {
    const p = pag(), pasos = (TOUR[p] || []).filter(([sel]) => { const e = document.querySelector(sel); return e && e.getBoundingClientRect().width > 0; });
    const clave = "agd_tour_visto_" + p;
    if (!forzado) { try { if (localStorage.getItem(clave)) return; } catch (e) { return; } }
    if (!pasos.length) return;
    try { localStorage.setItem(clave, "1"); } catch (e) {}
    // las guías de pestaña ocultas vuelven a mostrarse al pedir ayuda
    if (forzado) { try { Object.keys(localStorage).filter(k => k.startsWith("agd_guia_oculta_" + p)).forEach(k => localStorage.removeItem(k)); } catch (e) {} guiaPestana(); }
    const capa = document.createElement("div"); capa.className = "tour-capa"; capa.setAttribute("role", "dialog"); capa.setAttribute("aria-modal", "true");
    capa.innerHTML = `<div class="tour-foco"></div><div class="tour-globo" aria-live="polite"><h3></h3><p></p>
      <div class="tour-pie"><span class="pasos"></span><button class="btn sm" type="button" data-t="saltar">Saltar</button><button class="btn sm p" type="button" data-t="sig"></button></div></div>`;
    document.body.appendChild(capa);
    const foco = capa.querySelector(".tour-foco"), globo = capa.querySelector(".tour-globo");
    let i = 0;
    const cerrar = () => { capa.remove(); document.removeEventListener("keydown", tecla); };
    const ir = k => {
      if (k >= pasos.length) return cerrar(); i = k;
      const [sel, t, x] = pasos[i], el = document.querySelector(sel);
      el.scrollIntoView({ block: "center", behavior: "auto" });
      const r = el.getBoundingClientRect(), m = 6;
      Object.assign(foco.style, { top: r.top - m + "px", left: r.left - m + "px", width: r.width + 2 * m + "px", height: r.height + 2 * m + "px" });
      globo.querySelector("h3").textContent = t; globo.querySelector("p").textContent = x;
      globo.querySelector(".pasos").textContent = `${i + 1} de ${pasos.length}`;
      const sig = globo.querySelector('[data-t="sig"]'); sig.innerHTML = i === pasos.length - 1 ? `${ico("check")}Entendido` : `Siguiente${ico("flecha")}`;
      requestAnimationFrame(() => {   // medir el globo ya con su texto, y mantenerlo siempre dentro de la pantalla
        const ancho = document.documentElement.clientWidth, alto = document.documentElement.clientHeight;
        const gw = Math.min(globo.getBoundingClientRect().width || 340, ancho - 32), gh = Math.min(globo.getBoundingClientRect().height || 170, alto - 24);
        const abajo = r.bottom + 14 + gh <= alto - 12;
        globo.style.top = (abajo ? r.bottom + 14 : Math.max(12, r.top - gh - 14)) + "px";
        globo.style.left = Math.max(16, Math.min(r.left, ancho - gw - 16)) + "px";
      });
      sig.focus({ preventScroll: true });
    };
    const tecla = e => { if (e.key === "Escape") cerrar(); if (e.key === "ArrowRight") ir(i + 1); if (e.key === "ArrowLeft" && i > 0) ir(i - 1); };
    document.addEventListener("keydown", tecla);
    capa.addEventListener("click", e => { const b = e.target.closest("[data-t]"); if (!b) return; b.dataset.t === "saltar" ? cerrar() : ir(i + 1); });
    ir(0);
  }

  function etiquetarTablas() {
    document.querySelectorAll(".tw table").forEach(t => {
      const cab = [...t.querySelectorAll("thead th")].map(th => th.textContent.replace(/[▲▼]/g, "").trim());
      if (!cab.length) return;
      t.querySelectorAll("tbody tr").forEach(tr => [...tr.children].forEach((td, i) => { if (!td.hasAttribute("data-l") && cab[i]) td.setAttribute("data-l", cab[i]); }));
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    ponerMarco(); etiquetarTablas(); iconosBotones();
    let pend = false;
    new MutationObserver(() => { if (pend) return; pend = true; requestAnimationFrame(() => { pend = false; etiquetarTablas(); iconosBotones(); guiaPestana(); }); })
      .observe(document.body, { childList: true, subtree: true });
    setTimeout(() => recorrido(false), 1600);   // primera visita: después de que la pantalla cargó datos
  });
  window.AgdGuia = { ico, recorrido };
})();
