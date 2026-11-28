/* Cotizar todo lo pendiente — solicitudes consolidadas por tipo de producto y zona.
 * NOTA: Las reglas de agrupado (COSTA, FAMILIAS, CORRIGE, LIMPIA_NOMBRE, zona, familiaDe, agrupar)
 * deben coincidir exactamente con core/agente_compras/pdf_consolidado.py.
 */
(function () {
  "use strict";
  const $ = (s, r) => (r || document).querySelector(s);
  const esc = (t) => String(t == null ? "" : t).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const COSTA = ["puerto cayo", "el carmen"];
  const ORDEN_FINCAS = ["Eliana", "Otoburo", "Coñaqui", "Andrés López", "Puerto Cayo", "El Carmen"];
  const FAMILIAS = [
    ["Agroquímicos y fertilizantes", [
      "Fungicidas y bactericidas", "Insecticidas, acaricidas y molusquicidas", "Herbicidas",
      "Control biológico", "Coadyuvantes y correctores de agua/pH",
      "Bioestimulantes y reguladores de crecimiento", "Fertilizantes", "Material agrícola"
    ]],
    ["Repuestos, riego, fumigación y EPP", [
      "Repuestos de maquinaria", "Maquinaria y equipos motorizados",
      "Lubricantes, combustibles y fluidos", "Riego e hidráulica",
      "Equipos de fumigación y aplicación", "EPP y seguridad"
    ]],
    ["Ferretería y herramientas", [
      "Herramientas", "Ferretería y fijación", "Construcción, acabados y plomería",
      "Material eléctrico e iluminación", "Desinfección y limpieza"
    ]]
  ];
  const NO_SE_COTIZA_POR_LISTA = new Set(["Servicios tecnicos", "Servicios técnicos"]);
  const CORRIGE = [
    [/\bVALVULA\b|\bLLAVE DE PASO\b|\bTUBO\b|\bCONECTOR\b(?!.*\b(MODEM|UTP|RJ45)\b)/, "Riego e hidráulica"],
    [/\b(MODEM|UTP|RJ45)\b/, "Material eléctrico e iluminación"],
    [/PREFILTRO|EMPAQUE|CORDON DE ARRANQUE|TAPA COMPLETA DE ARRANQUE|MANOMETRO/, "Repuestos de maquinaria"],
    [/\bUNION\b|\bACOPLE\b|\bBOQUILLA\b|\bMANGUERA\b|\bLANZA\b|\bFUMIGADORA\b/, "Equipos de fumigación y aplicación"]
  ];
  const LIMPIA_NOMBRE = [[/\s+FINCA\s*$/i, ""]];

  const RUBROS_FAMILIA = {
    "agroquimicos": "Agroquímicos y fertilizantes",
    "fertilizantes y nutricion": "Agroquímicos y fertilizantes",
    "maquinaria, repuestos y lubricantes": "Repuestos, riego, fumigación y EPP",
    "riego y bombas": "Repuestos, riego, fumigación y EPP",
    "material y herramientas": "Ferretería y herramientas"
  };

  function plano(t) {
    return String(t || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().replace(/\s+/g, " ").trim();
  }

  function zona(finca) {
    const p = plano(finca).toLowerCase();
    return COSTA.some((c) => p.includes(c)) ? "Costa" : "Sierra";
  }

  function familiaDe(categoria, producto) {
    let cat = String(categoria || "");
    const p = plano(producto);
    for (const [patron, nuevaCat] of CORRIGE) {
      if (patron.test(p)) cat = nuevaCat;
    }
    for (const [fam, cats] of FAMILIAS) {
      if (cats.includes(cat)) return fam;
    }
    return NO_SE_COTIZA_POR_LISTA.has(cat) ? "" : "Ferretería y herramientas";
  }

  function num(x) {
    const v = Number(x || 0);
    if (Number.isInteger(v)) return v.toLocaleString("es-EC").replace(/,/g, ".");
    return v.toFixed(2).replace(".", ",");
  }

  function agrupar(filas, conCotizacion, cots) {
    const grupos = new Map();
    for (const f of filas || []) {
      const est = f.estado || "";
      if (est !== "aprobado_campo") continue;
      const lin = String(f.linea || f["Línea"] || "");
      const nCot = Number(f.n_cot || 0) || ((cots && cots[lin]) ? cots[lin].length : 0);
      if (!conCotizacion && nCot > 0) continue;
      const prod = String(f.producto || "");
      const cat = String(f.categoria || "");
      const fam = familiaDe(cat, prod);
      if (!fam) continue;
      const zon = zona(f.finca || "");
      const clave = `${fam}|||${zon}`;
      if (!grupos.has(clave)) grupos.set(clave, { familia: fam, zona: zon, itemsMap: new Map() });
      const g = grupos.get(clave);
      const unid = String(f.unidad || "").trim().toUpperCase();
      const k = `${plano(prod)}|${plano(unid)}`;
      if (!g.itemsMap.has(k)) {
        let nombre = prod.trim();
        for (const [pat, cam] of LIMPIA_NOMBRE) nombre = nombre.replace(pat, cam);
        g.itemsMap.set(k, { producto: nombre, unidad: unid, total: 0, fincas: {}, lineas: [] });
      }
      const it = g.itemsMap.get(k);
      const cant = Number(f.cantidad || 0);
      it.total += cant;
      const fn = String(f.finca || "");
      it.fincas[fn] = (it.fincas[fn] || 0) + cant;
      it.lineas.push(lin);
    }
    const lista = [];
    for (const g of grupos.values()) {
      const todos = Array.from(g.itemsMap.values());
      const fincas = Array.from(new Set(todos.flatMap((i) => Object.keys(i.fincas)))).sort(
        (a, b) => (ORDEN_FINCAS.includes(a) ? ORDEN_FINCAS.indexOf(a) : 99) - (ORDEN_FINCAS.includes(b) ? ORDEN_FINCAS.indexOf(b) : 99)
      );
      const totalPartes = Math.max(1, Math.ceil(todos.length / 60));
      for (let p = 0; p < totalPartes; p++) {
        lista.push({
          id: `${g.familia}__${g.zona}__${p + 1}`,
          familia: g.familia,
          zona: g.zona,
          parte: totalPartes > 1 ? `parte ${p + 1}/${totalPartes}` : "",
          items: todos.slice(p * 60, (p + 1) * 60),
          fincas
        });
      }
    }
    return lista;
  }

  function saludoEcuador() {
    const h = Number(new Intl.DateTimeFormat("es-EC", { timeZone: "America/Guayaquil", hour: "numeric", hour12: false }).format(new Date()));
    if (h < 12) return "Buenos días";
    if (h < 19) return "Buenas tardes";
    return "Buenas noches";
  }

  function armarLeyenda(familia, zon) {
    const donde = zon === "Costa" ? "la Costa (Puerto Cayo, Manabí)" : "la Sierra (Imbabura)";
    return `${saludoEcuador()}, estimados. Les saluda el Ing. Wilson Pérez, analista de Compras y Logística de AgroDávila. Les enviamos la solicitud de cotización de ${familia} para nuestras fincas de ${donde}. Por favor cotizar el total de cada producto; al aprobarse la compra, la factura se emite de manera individual por cada finca, según el detalle del documento. Por favor incluyan el flete hasta las fincas. Si no tienen algún producto, coticen lo que tengan o el equivalente. Muchas gracias.`;
  }

  function zonaProveedor(p) {
    const z = plano(p.zona || "").toLowerCase();
    if (z.includes("nacional")) return "Nacional";
    if (z.includes("costa") || z.includes("cayo") || z.includes("carmen")) return "Costa";
    if (z.includes("sierra") || z.includes("imbabura") || z.includes("ibarra")) return "Sierra";
    return p.zona || "";
  }

  function sugeridosPara(familia, zon, catalogo) {
    return (catalogo || [])
      .filter((p) => {
        if (p.no_usar || p.descartado) return false;
        const chat = p.chat || p.chat_whatsapp || p.telefono || "";
        if (!chat) return false;
        const rub = plano(p.rubro || "").toLowerCase();
        const fam = RUBROS_FAMILIA[rub] || "";
        if (fam !== familia) return false;
        const zp = zonaProveedor(p);
        return zp === zon || zp === "Nacional";
      })
      .sort((a, b) => Number(b.respuestas || b.tasa_respuesta || 0) - Number(a.respuestas || a.tasa_respuesta || 0));
  }

  function hoyIso() { return new Date().toISOString().slice(0, 10); }

  function yaEnviadoHoy(nombreProv, familia, solicitudes) {
    const hoy = hoyIso();
    const np = plano(nombreProv);
    return (solicitudes || []).some((s) => {
      if (!s.consolidada) return false;
      const f = String(s.creada_en || s.fecha || hoy).slice(0, 10);
      return f === hoy && plano(s.proveedor) === np && plano(s.familia) === plano(familia);
    });
  }

  const estado = { activo: false, conCotizacion: false, seleccionados: {}, agregados: {}, enviando: {}, resultados: {}, confirmando: null };

  function abrir() {
    estado.activo = true;
    const vc = $("#vista-cotizar"), ve = $("#vista-enviadas"), vt = $("#vista-cotizar-todo");
    if (vc) vc.hidden = true;
    if (ve) ve.hidden = true;
    if (vt) vt.hidden = false;
    pintar();
  }

  function cerrar() {
    estado.activo = false;
    const vc = $("#vista-cotizar"), vt = $("#vista-cotizar-todo");
    if (vt) vt.hidden = true;
    if (vc) vc.hidden = false;
  }

  function pintar() {
    const cont = $("#vista-cotizar-todo");
    if (!cont) return;
    const S = window.CotizarEstado || window.__S || { filas: [], cots: {}, catalogo: [], solicitudes: [] };
    const tarjetas = agrupar(S.filas, estado.conCotizacion, S.cots);

    let html = `<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-bottom:14px">
      <div>
        <h2 style="margin:0;font-size:20px">Cotizar todo lo pendiente</h2>
        <div class="sub">Una solicitud por tipo de producto y zona. Costa y Sierra siempre separadas.</div>
      </div>
      <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">
        <label style="display:flex;gap:6px;align-items:center;font-size:14px"><input type="checkbox" id="ct-con-cot" ${estado.conCotizacion ? "checked" : ""}> Incluir con 1 o 2 cotizaciones</label>
        <button type="button" class="btn sm" id="ct-volver">Volver a tarjetas</button>
      </div>
    </div>`;

    if (!tarjetas.length) {
      html += `<div class="vacio">No hay líneas aprobadas en campo pendientes de cotizar.</div>`;
      cont.innerHTML = html;
      enlazarEventos(tarjetas, S);
      return;
    }

    for (const t of tarjetas) {
      const sug = sugeridosPara(t.familia, t.zona, S.catalogo);
      const extras = estado.agregados[t.id] || [];
      const todosProv = [...sug, ...extras.filter((e) => !sug.some((s) => s.nombre === e.nombre))];
      if (!estado.seleccionados[t.id]) {
        estado.seleccionados[t.id] = new Set(sug.map((p) => p.nombre));
      }
      const sel = estado.seleccionados[t.id];
      const leyenda = armarLeyenda(t.familia, t.zona);
      const resEnv = estado.resultados[t.id];

      html += `<article class="tarjeta" data-ct-id="${esc(t.id)}" style="margin-bottom:16px">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px">
          <h3 style="margin:0;font-size:18px">${esc(t.familia)} · ${esc(t.zona)}${t.parte ? ` <span class="etq">${esc(t.parte)}</span>` : ""}</h3>
          <span class="etq zona">${t.items.length} ${t.items.length === 1 ? "producto" : "productos"}</span>
        </div>
        ${t.parte ? `<div class="aviso">Este tipo supera los 60 productos y se dividió automáticamente (${esc(t.parte)}).</div>` : ""}
        <div style="overflow:auto;max-height:280px;border:1px solid var(--bd);border-radius:10px">
          <table style="width:100%;border-collapse:collapse;font-size:13px">
            <thead><tr style="background:#23262B;color:#fff;text-align:left">
              <th style="padding:6px 8px">Producto</th>
              <th style="padding:6px 8px;text-align:right">Total</th>
              <th style="padding:6px 8px">Unidad</th>
              ${t.fincas.map((f) => `<th style="padding:6px 8px;text-align:right">${esc(f)}</th>`).join("")}
            </tr></thead>
            <tbody>
              ${t.items.map((it) => `<tr style="border-bottom:1px solid var(--bd)">
                <td style="padding:6px 8px">${esc(it.producto)}</td>
                <td style="padding:6px 8px;text-align:right;font-weight:700">${esc(num(it.total))}</td>
                <td style="padding:6px 8px">${esc(it.unidad)}</td>
                ${t.fincas.map((f) => `<td style="padding:6px 8px;text-align:right;color:var(--t2)">${it.fincas[f] != null ? esc(num(it.fincas[f])) : ""}</td>`).join("")}
              </tr>`).join("")}
            </tbody>
          </table>
        </div>
        <div>
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
            <strong style="font-size:14px">Proveedores (${sel.size} seleccionados)</strong>
            <button type="button" class="btn sm ct-agregar-prov" data-ct-id="${esc(t.id)}">+ Agregar proveedor</button>
          </div>
          <div style="display:flex;flex-wrap:wrap;gap:8px">
            ${todosProv.length ? todosProv.map((p) => {
              const zp = zonaProveedor(p);
              const otra = zp && zp !== t.zona && zp !== "Nacional";
              return `<label style="display:flex;align-items:center;gap:6px;border:1px solid var(--bd);border-radius:10px;padding:6px 10px;font-size:13px;cursor:pointer">
                <input type="checkbox" class="ct-chk-prov" data-ct-id="${esc(t.id)}" value="${esc(p.nombre)}" ${sel.has(p.nombre) ? "checked" : ""}>
                <span>${esc(p.nombre)}${otra ? ` <span class="etq">Otra zona: ${esc(zp)}</span>` : ""}</span>
              </label>`;
            }).join("") : `<span class="sub">No hay proveedores sugeridos para esta zona y rubro. Usa «+ Agregar proveedor».</span>`}
          </div>
        </div>
        <details style="font-size:13px;background:var(--bg);padding:8px 10px;border-radius:10px">
          <summary style="cursor:pointer;font-weight:600">Vista previa del mensaje</summary>
          <p style="margin:8px 0 0;white-space:pre-wrap">${esc(leyenda)}</p>
        </details>
        <div class="ct-aviso-box" data-ct-aviso="${esc(t.id)}"></div>
        ${resEnv ? `<div class="aviso" style="background:var(--azbg,#E6EEF6);color:var(--az,#2E5E8E)">Sale por WhatsApp en ~1 minuto. Enviadas: ${resEnv.map((r) => `${esc(r.proveedor)} (${esc(r.estado)})`).join(", ")}</div>` : ""}
        <div style="display:flex;justify-content:flex-end">
          <button type="button" class="btn p ct-enviar" data-ct-id="${esc(t.id)}" ${estado.enviando[t.id] ? "disabled" : ""}>Enviar a ${sel.size} ${sel.size === 1 ? "proveedor" : "proveedores"}</button>
        </div>
      </article>`;
    }

    html += `<div class="capa" id="ct-capa-confirm" role="dialog" aria-modal="true">
      <div class="dialogo" id="ct-confirm-body"></div>
    </div>`;
    html += `<div class="capa" id="ct-capa-prov" role="dialog" aria-modal="true">
      <div class="dialogo">
        <h3>Agregar proveedor</h3>
        <input id="ct-prov-buscar" type="search" placeholder="Buscar por nombre o rubro…" style="width:100%;min-height:40px;margin:8px 0;border-radius:10px;border:1px solid var(--bd);padding:8px">
        <div class="lista-prov" id="ct-prov-lista"></div>
        <div style="display:flex;justify-content:flex-end;margin-top:10px"><button type="button" class="btn sm" id="ct-prov-cerrar">Cerrar</button></div>
      </div>
    </div>`;

    cont.innerHTML = html;
    enlazarEventos(tarjetas, S);
  }

  function enlazarEventos(tarjetas, S) {
    const volver = $("#ct-volver");
    if (volver) volver.onclick = cerrar;
    const chkCot = $("#ct-con-cot");
    if (chkCot) chkCot.onchange = () => { estado.conCotizacion = chkCot.checked; pintar(); };

    document.querySelectorAll(".ct-chk-prov").forEach((chk) => {
      chk.onchange = () => {
        const id = chk.getAttribute("data-ct-id");
        if (!estado.seleccionados[id]) estado.seleccionados[id] = new Set();
        if (chk.checked) estado.seleccionados[id].add(chk.value);
        else estado.seleccionados[id].delete(chk.value);
        pintar();
      };
    });

    document.querySelectorAll(".ct-agregar-prov").forEach((btn) => {
      btn.onclick = () => {
        const id = btn.getAttribute("data-ct-id");
        const capa = $("#ct-capa-prov"), lista = $("#ct-prov-lista"), bus = $("#ct-prov-buscar");
        const renderLista = (q) => {
          const nq = plano(q).toLowerCase();
          const items = (S.catalogo || []).filter((p) => !p.no_usar && !p.descartado && (!nq || plano(p.nombre + " " + (p.rubro || "")).toLowerCase().includes(nq))).slice(0, 30);
          lista.innerHTML = items.map((p) => `<button type="button" data-nombre="${esc(p.nombre)}">${esc(p.nombre)}<small>${esc(p.rubro || "")} · ${esc(p.zona || "")}</small></button>`).join("");
          lista.querySelectorAll("button").forEach((b) => {
            b.onclick = () => {
              const nom = b.getAttribute("data-nombre");
              const prov = (S.catalogo || []).find((x) => x.nombre === nom);
              if (prov) {
                estado.agregados[id] = estado.agregados[id] || [];
                estado.agregados[id].push(prov);
                estado.seleccionados[id] = estado.seleccionados[id] || new Set();
                estado.seleccionados[id].add(prov.nombre);
              }
              capa.classList.remove("ver");
              pintar();
            };
          });
        };
        bus.value = "";
        renderLista("");
        bus.oninput = () => renderLista(bus.value);
        $("#ct-prov-cerrar").onclick = () => capa.classList.remove("ver");
        capa.classList.add("ver");
      };
    });

    document.querySelectorAll(".ct-enviar").forEach((btn) => {
      btn.onclick = () => {
        const id = btn.getAttribute("data-ct-id");
        const t = tarjetas.find((x) => x.id === id);
        if (!t) return;
        const sel = Array.from(estado.seleccionados[id] || []);
        const avisoBox = document.querySelector(`[data-ct-aviso="${id}"]`);
        if (!sel.length) {
          if (avisoBox) avisoBox.innerHTML = `<div class="aviso">Marca al menos un proveedor antes de enviar.</div>`;
          return;
        }
        const provs = sel.map((n) => (S.catalogo || []).find((p) => p.nombre === n) || { nombre: n });
        const otrasZonas = provs.filter((p) => { const zp = zonaProveedor(p); return zp && zp !== t.zona && zp !== "Nacional"; });
        const repetidos = provs.filter((p) => yaEnviadoHoy(p.nombre, t.familia, S.solicitudes));

        const capa = $("#ct-capa-confirm"), body = $("#ct-confirm-body");
        body.innerHTML = `<h3>Confirmar envío</h3>
          <p>Documento: <strong>${esc(t.familia)} · ${esc(t.zona)}${t.parte ? ` (${esc(t.parte)})` : ""}</strong></p>
          <p>Productos: <strong>${t.items.length}</strong> · Proveedores: <strong>${provs.length}</strong></p>
          <ul>${provs.map((p) => `<li>${esc(p.nombre)}</li>`).join("")}</ul>
          ${otrasZonas.length ? `<div class="aviso">Atención: ${otrasZonas.map((p) => esc(p.nombre)).join(", ")} es de otra zona. Confirma que incluye el flete hasta ${esc(t.zona)}.</div>` : ""}
          ${repetidos.length ? `<div class="aviso">Ya se envió ${esc(t.familia)} hoy a: ${repetidos.map((p) => esc(p.nombre)).join(", ")}.</div>` : ""}
          <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:14px">
            <button type="button" class="btn sm" id="ct-conf-cancel">Cancelar</button>
            <button type="button" class="btn sm p" id="ct-conf-ok">Confirmar y enviar</button>
          </div>`;
        capa.classList.add("ver");
        $("#ct-conf-cancel").onclick = () => capa.classList.remove("ver");
        $("#ct-conf-ok").onclick = async () => {
          capa.classList.remove("ver");
          estado.enviando[id] = true;
          pintar();
          const leyenda = armarLeyenda(t.familia, t.zona);
          const res = [];
          for (const p of provs) {
            try {
              await window.AgdNube.crearSolicitudCotizacion({
                consolidada: true,
                familia: t.familia,
                zona: t.zona,
                parte: t.parte || "",
                proveedor: p.nombre,
                chat: p.chat || p.chat_whatsapp || p.telefono || "",
                telefono: p.telefono || "",
                items: t.items.map((it) => ({ producto: it.producto, unidad: it.unidad, total: it.total, fincas: it.fincas })),
                leyenda,
                origen: "cotizar_todo"
              });
              res.push({ proveedor: p.nombre, estado: "en cola" });
            } catch (e) {
              res.push({ proveedor: p.nombre, estado: "error" });
            }
          }
          estado.enviando[id] = false;
          estado.resultados[id] = res;
          pintar();
        };
      };
    });
  }

  window.CotizarTodo = { abrir, cerrar, agrupar, familiaDe, zona, armarLeyenda };
})();
