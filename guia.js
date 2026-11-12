/* Compras AgroDávila · marco común: íconos dibujados, barra de secciones, ayuda por pestaña y recorrido guiado.
   Se incluye dentro de comun.js al construir la app. */
(function () {
  /* Íconos (trazos estilo Lucide, licencia ISC). Todos con el mismo grosor. */
  const P = {
    inicio: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M10 21v-6h4v6"/>',
    control: '<path d="M3 3v18h18"/><rect x="7" y="12" width="3" height="6" rx="1"/><rect x="12" y="8" width="3" height="10" rx="1"/><rect x="17" y="5" width="3" height="13" rx="1"/>',
    whatsapp: '<path d="M21 11.5a8.4 8.4 0 0 1-12.4 7.4L3 20.5l1.7-5.3A8.4 8.4 0 1 1 21 11.5Z"/><path d="M8.5 9.5c.3 2.5 2.4 4.6 5 5"/>',
    proveedores: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    nube: '<path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/>',
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
    checklist: '<rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="m9 14 2 2 4-4"/>',
    camion: '<path d="M10 17h4V5H2v12h3"/><path d="M14 9h4l4 4v4h-3"/><circle cx="7.5" cy="17.5" r="2.5"/><circle cx="16.5" cy="17.5" r="2.5"/>',
    bandeja: '<path d="M22 12h-6l-2 3h-4l-2-3H2v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6Z"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>',
    gerencia: '<path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10Z"/>',
    avance: '<path d="M9 6h11"/><path d="M9 12h11"/><path d="M9 18h11"/><path d="m4 6 1 1 2-2"/><path d="m4 12 1 1 2-2"/><path d="m4 18 1 1 2-2"/>',
    gestion: '<path d="M3 17l6-6 4 4 8-8"/><path d="M17 7h4v4"/>',
    mas: '<circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/>'
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
    },
    "proveedores.html": {
      matriz: ["Matriz oficial de proveedores", "Aquí se registran los datos que cada proveedor envía por correo: RUC, razón social, contacto, crédito, fichas técnicas y lista de precios. Toque una fila para abrir su ficha y guardar."]
    },
    "checklist.html": {
      resumen: ["Resumen del día", "Muestra cuántas líneas avanzaron hoy frente a ayer en cada etapa del proceso de compras."],
      etapas: ["Etapas del flujo", "Cada línea de AgroControl cae en una sola etapa: por cotizar, cotizando, por aprobar, por generar OC, por entregar, por pagar o cerrado."],
      marca: ["Checklist que retroalimenta", "Marque «Hecho hoy» y agregue notas. Si AgroControl no se ha actualizado, le avisa en ladrillo lo que falta registrar."],
      excel: ["Excel y sincronización", "Descargue el checklist a Excel para trabajar sin conexión y suba el archivo marcado para actualizar el sistema."]
    },
    "bandeja.html": {
      conv: ["Conversaciones que esperan respuesta", "Mensajes entrantes con respuestas sugeridas por el asistente. Revise, edite y pulse «Revisar y enviar»."],
      req: ["Cotizaciones por requerimiento", "Requerimientos abiertos de fincas con borradores por proveedor listos para enviar."],
      conc: ["Recepciones de finca por conciliar", "Entregas reportadas en grupos de finca que aún no coinciden con una OC. Seleccione la OC correspondiente o descártelas."],
      hist: ["Historial de envíos", "Mensajes y cotizaciones enviadas con filtros por proveedor y fecha."]
    },
    "gerencia.html": {
      gasto: ["Gasto por finca y etapas", "Visualiza Comprometido, Ordenado, Recibido en finca y Pagado desde AgroControl + recepciones confirmadas. Filtre por finca, semana o mes."],
      mantenimiento: ["Control de mantenimiento y activos", "Consolida órdenes de mantenimiento desde AgroControl, WhatsApp, movilidad y registros directos. Puede registrar nuevos mantenimientos aquí mismo."],
      vehiculos: ["Vehículos, combustible y rendimiento", "Lecturas de tablero por rango (Alto, Medio, Bajo), detección de cargas/vales, rendimiento km/tanque y kilometraje semanal."]
    },
    "avance.html": {
      pedidos: ["Avance por pedido y por línea", "Cada pedido muestra cuánto va entregado (azul), en proceso (maíz), comprometido o por cotizar (ladrillo). Toque cualquier pedido para ver sus líneas, el estado de pago y corregir si AgroControl aún no se actualiza."],
      faltacot: ["Líneas pendientes de cotización", "Muestra lo que falta por cotizar o está en revisión, los días desde que se pidió y cuántas cotizaciones faltan según la regla (2 hasta $300, 3 si supera $300)."]
    },
    "gestion.html": {
      resumen: ["Evidencia de gestión", "Consolida ahorro documentado, proveedores nuevos incorporados, cumplimiento de cotizaciones y mejora en tiempos de ciclo desde el 04/11/2026."]
    }
  };

  /* Pasos del recorrido de cada pantalla: [selector, título, texto] */
  const TOUR = {
    "index.html": [
      [".marco", "Su barra de secciones", "Desde aquí pasa entre Inicio, Control, WhatsApp y Proveedores. En el teléfono está abajo, al alcance del pulgar."],
      ["#urgente", "Lo urgente hoy", "Un vistazo a lo que espera por usted en AgroControl, actualizado en vivo."],
      ["#accesos", "Accesos rápidos", "Las tareas de todos los días a un toque: ver pendientes, enviar mensajes y bajar el Excel."],
      [".ayuda", "Ayuda cuando la necesite", "Toque «¿Cómo uso esto?» en cualquier pantalla para volver a ver este recorrido."]
    ],
    "bandeja.html": [
      ["#tabsBandeja", "Secciones de la bandeja", "Navegue entre conversaciones que esperan respuesta, cotizaciones por requerimiento e historial de lo enviado."],
      ["#secConversaciones", "Conversaciones urgentes", "Primero lo urgente y lo que lleva más tiempo esperando. En ladrillo si pasa de 1 día hábil."],
      ["#secRequerimientos", "Cotizaciones por requerimiento", "Cada pedido con sus ítems, proveedores sugeridos y comparativo de precios."],
      ["#secHistorial", "Historial con filtros", "Filtre por proveedor o fecha para auditar lo que se envió desde el teléfono."]
    ],
    "checklist.html": [
      ["#resumenDia", "Avance del día", "Vea de un vistazo cuántas líneas avanzaron hoy en cotizaciones, órdenes de compra y entregas registradas."],
      ["#tarjetasEtapas", "Contador por etapa", "Las 7 etapas del flujo de compras. Toque una tarjeta para ver solo las líneas de esa etapa."],
      ["#btnExcelGrp", "Excel del día", "Descargue el checklist completo a Excel o suba el archivo con las casillas marcadas para retroalimentar la app."],
      ["#listaEtapas", "Líneas de compra", "Marque «Hecho hoy», añada una nota corta y revise las alertas de líneas estancadas (más de 1 o 3 días hábiles)."]
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
    ],
    "proveedores.html": [
      ["#avanceBox", "Indicador de avance", "Muestra cuántos de los 60 proveedores ya tienen sus datos completos (RUC, contacto, crédito y documentos)."],
      ["#bCargarWA", "Cargar desde WhatsApp", "Trae los 60 proveedores base del paquete de WhatsApp sin pisar ningún dato que usted ya haya editado."],
      ["#bExcelProv", "Excel de la matriz", "Descarga toda la matriz de proveedores en un archivo .xlsx listo para compartir con Contabilidad o Gerencia."],
      ["#filtrosProv", "Buscador y filtros", "Filtre por estado de datos (pendiente, incompleto, recibido), zona o categoría, y toque cualquier proveedor para editar su ficha."]
    ],
    "gerencia.html": [
      ["#filtrosGerencia", "Filtros ejecutivos", "Filtre todo el tablero en vivo por finca, semana ISO o mes."],
      ["#kpisGerencia", "Indicadores clave", "Resumen instantáneo de gasto semanal/mensual, % recibido, OC abiertas, pagos vencidos, mantenimiento y km."],
      ["#tabsGerencia", "Tres módulos gerenciales", "Cambie entre Gasto por finca, Mantenimiento y Vehículos."],
      ["#formRegistrarMant", "Registrar mantenimiento", "Cree una orden o reserva de mantenimiento sincronizada para gerencia y campo."]
    ],
    "avance.html": [
      ["#kpisAvance", "Resumen de avance", "Vea cuánto está entregado, cuánto falta pagar de lo ya recibido, dónde falta visto bueno de pago y cuántas líneas siguen por cotizar."],
      ["#filtrosAvance", "Filtros rápidos", "Filtre por finca, estado real de entrega o proveedor, o cambie a la pestaña Falta cotizar."],
      ["#tablaPedidos", "Barras por pedido", "Toque cualquier fila para desplegar el detalle de sus líneas y usar Corregir estado."]
    ],
    "gestion.html": [
      ["#kpisGestion", "Indicadores de gestión", "Ahorro acumulado, proveedores nuevos desde el 04/11, cotizaciones por línea y tiempos de ciclo."],
      ["#btnExcelGerencia", "Informe para Gerencia", "Descarga el archivo Excel con todas las hojas de respaldo y cálculo."]
    ]
  };

  function ponerMarco() {
    if (document.querySelector(".marco")) return;
    const p = pag();
    const primarios = [
      ["index.html", "inicio", "Inicio"],
      ["avance.html", "avance", "Avance"],
      ["gerencia.html", "gerencia", "Gerencia"],
      ["bandeja.html", "bandeja", "Bandeja"],
      ["checklist.html", "checklist", "Checklist"]
    ];
    const secundarios = [
      ["control.html", "control", "Control"],
      ["whatsapp.html", "whatsapp", "WhatsApp"],
      ["proveedores.html", "proveedores", "Proveedores"]
    ];
    const esSecundario = secundarios.some(([h]) => h === p) || p === "gestion.html";
    const n = document.createElement("nav"); n.className = "marco"; n.setAttribute("aria-label", "Secciones de la app");
    n.innerHTML = `<a class="marca" href="index.html"><span class="sello">${ico("hoja")}</span>Compras AgroDávila</a>` +
      primarios.map(([h, i, t]) => `<a class="sec" href="${h}"${p === h ? ' aria-current="page"' : ""}>${ico(i)}<span>${t}</span></a>`).join("") +
      secundarios.map(([h, i, t]) => `<a class="sec sec-extra" href="${h}"${p === h ? ' aria-current="page"' : ""}>${ico(i)}<span>${t}</span></a>`).join("") +
      `<div class="mas-wrap"><button class="sec mas-btn" type="button" aria-expanded="false" aria-haspopup="menu"${esSecundario ? ' aria-current="page"' : ""}>${ico("mas")}<span>Más</span></button><div class="marco-mas hide" role="menu">${secundarios.map(([h, i, t]) => `<a class="mas-item" role="menuitem" href="${h}"${p === h ? ' aria-current="page"' : ""}>${ico(i)}<span>${t}</span></a>`).join("")}<button class="mas-item mas-ayuda" type="button" role="menuitem">${ico("ayuda")}<span>¿Cómo uso esto?</span></button></div></div>` +
      `<button class="ayuda" type="button" aria-label="Cómo uso esta pantalla">${ico("ayuda")}<span>¿Cómo uso esto?</span></button>`;
    document.body.insertBefore(n, document.body.firstChild);
    const fresc = document.createElement("aside");
    fresc.id = "barraFrescura";
    fresc.className = "frescura";
    fresc.setAttribute("aria-label", "Actualización de fuentes");
    document.body.insertBefore(fresc, n.nextSibling);

    const masBtn = n.querySelector(".mas-btn");
    const masMenu = n.querySelector(".marco-mas");
    const cerrarMas = () => { if (masMenu) { masMenu.classList.add("hide"); masBtn.setAttribute("aria-expanded", "false"); } };
    if (masBtn && masMenu) {
      masBtn.onclick = ev => {
        ev.stopPropagation();
        const abrir = masMenu.classList.contains("hide");
        masMenu.classList.toggle("hide", !abrir);
        masBtn.setAttribute("aria-expanded", abrir ? "true" : "false");
      };
      document.addEventListener("click", e => { if (!n.contains(e.target)) cerrarMas(); });
      document.addEventListener("keydown", e => { if (e.key === "Escape") cerrarMas(); });
    }
    n.querySelector(".ayuda").onclick = () => recorrido(true);
    const masAyuda = n.querySelector(".mas-ayuda");
    if (masAyuda) masAyuda.onclick = () => { cerrarMas(); recorrido(true); };
  }

  function textoEdad(item) {
    if (!item || !item.fecha || item.edadHoras === null) return "Sin registro";
    const f = new Date(item.fecha);
    const hora = !isNaN(f) ? f.toLocaleString("es-EC", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit", timeZone: "America/Guayaquil" }) : String(item.fecha).slice(0, 16);
    if (item.edadHoras < 1) return `${hora} (hace <1 h)`;
    if (item.edadHoras < 24) return `${hora} (hace ${Math.round(item.edadHoras)} h)`;
    return `${hora} (hace ${Math.round(item.edadHoras / 24)} d)`;
  }

  async function renderizarFrescura() {
    const caja = document.getElementById("barraFrescura");
    if (!caja || !window.ComprasApp || !ComprasApp.frescuraFuentes) return;
    try {
      const datos = await ComprasApp.frescuraFuentes();
      const orden = [datos.agrocontrol, datos.whatsapp, datos.recepciones, datos.vehiculos].filter(Boolean);
      const html = orden.map(it => {
        const cls = it.atrasada ? "frescura-item atraso" : "frescura-item";
        const av = it.atrasada ? "⚠ >6 h · " : "";
        return `<span class="${cls}" title="${it.atrasada ? "Más de 6 horas sin actualizar" : "Actualizado"}"><b>${it.etiqueta}:</b> ${av}${textoEdad(it)}</span>`;
      }).join("");
      caja.innerHTML = `<span class="frescura-tit">Sincronización:</span>${html}`;
    } catch (e) {}
  }

  /* Íconos en los botones conocidos de cada pantalla */
  const BOTONES = [["#refrescar", "refrescar"], ["#xlsMatriz", "excel"], ["#btnDescargarExcel", "excel"], ["#btnSubirExcel", "bajar"], ["#csv", "bajar"], ["#bTema", "tema"], ["[data-benv]", "enviar"], ["[data-copiar]", "enviar"], ["#revOk", "enviar"]];
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

  async function actualizarEnlaceGestion() {
    const nav = document.querySelector(".marco");
    if (!nav) return;
    let ver = false;
    if (window.AgdNube && AgdNube.puedeVerGestion) {
      try { ver = !!(await AgdNube.puedeVerGestion()); } catch (e) { ver = false; }
    }
    nav.querySelectorAll(".sec-gestion, .mas-gestion").forEach(el => el.remove());
    if (!ver) return;
    const p = pag();
    const masWrap = nav.querySelector(".mas-wrap");
    const extra = document.createElement("a");
    extra.className = "sec sec-extra sec-gestion";
    extra.href = "gestion.html";
    if (p === "gestion.html") extra.setAttribute("aria-current", "page");
    extra.innerHTML = `${ico("gestion")}<span>Mi gestión</span>`;
    if (masWrap) nav.insertBefore(extra, masWrap);
    else nav.appendChild(extra);

    const masMenu = nav.querySelector(".marco-mas");
    if (masMenu) {
      const item = document.createElement("a");
      item.className = "mas-item mas-gestion";
      item.setAttribute("role", "menuitem");
      item.href = "gestion.html";
      if (p === "gestion.html") item.setAttribute("aria-current", "page");
      item.innerHTML = `${ico("gestion")}<span>Mi gestión</span>`;
      const helpBtn = masMenu.querySelector(".mas-ayuda");
      if (helpBtn) masMenu.insertBefore(item, helpBtn);
      else masMenu.appendChild(item);
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    ponerMarco(); renderizarFrescura(); etiquetarTablas(); iconosBotones(); actualizarEnlaceGestion();
    let pend = false;
    new MutationObserver(() => { if (pend) return; pend = true; requestAnimationFrame(() => { pend = false; etiquetarTablas(); iconosBotones(); guiaPestana(); }); })
      .observe(document.body, { childList: true, subtree: true });
    if (window.AgdNube && AgdNube.alCambiarEstado) {
      AgdNube.alCambiarEstado(() => { renderizarFrescura(); actualizarEnlaceGestion(); });
    }
    setTimeout(() => recorrido(false), 1600);   // primera visita: después de que la pantalla cargó datos
  });
  window.AgdGuia = { ico, recorrido, renderizarFrescura };
})();
