/* Módulo generado automáticamente desde reglas_agd.json por generar_reglas.py.
   NO editar a mano: modifique reglas_agd.json y ejecute generar_reglas.py. */
(function (root) {
  "use strict";

  const REGLAS = {
  "version": "2.0.0",
  "descripcion": "Fuente única de verdad para reglas, etapas, fincas, umbrales y KPIs de Compras AgroDávila.",
  "zona_horaria": "America/Guayaquil",
  "utc_offset_horas": -5,
  "razon_social": "Agrícola El Carmen",
  "max_filas_hoja": 1000,
  "fecha_inicio_gestion": "2026-11-04",
  "estados_avance": [
    "Por cotizar",
    "Cotizado (en revisión)",
    "Cotizado: proveedor elegido",
    "Autorizado, falta OC",
    "Con OC, por entregar",
    "Entregado",
    "No se compró"
  ],
  "umbrales": {
    "monto_tres_cotizaciones": 300,
    "cotizaciones_bajo_umbral": 2,
    "cotizaciones_sobre_umbral": 3,
    "monto_alto": 1000,
    "dias_alerta": 1,
    "dias_estancado": 3,
    "umbral_variacion_precio": 0.1,
    "dias_pago_proximo": 3,
    "dias_vencimiento_cxp": 7,
    "meta_entregas_tiempo": 0.9,
    "meta_ciclo_entrega_dias": 10,
    "meta_pedido_oc_dias": 4,
    "meta_cotizaciones_suficientes": 0.9,
    "max_descartados": 0.05
  },
  "paleta": {
    "grafito": "#23262B",
    "azul": "#2E5E8E",
    "maiz": "#C7901A",
    "gris": "#8A8F98",
    "ladrillo": "#B5452F",
    "fondo": "#F5F6F8",
    "borde": "#D9DEE5",
    "texto": "#1F2328",
    "subtexto": "#59636E",
    "blanco": "#FFFFFF"
  },
  "semantica_color": {
    "azul": "Recibido o ejecutado",
    "maiz": "En proceso",
    "gris": "Comprometido",
    "ladrillo": "Alerta",
    "grafito": "Pagado / operativo"
  },
  "regiones_alias": {
    "costa": "Costa",
    "manabi": "Costa",
    "imbabura": "Imbabura",
    "sierra": "Imbabura"
  },
  "fincas": [
    {
      "codigo": "el_carmen",
      "nombre": "El Carmen",
      "zona": "Costa",
      "hectareas_base": 30,
      "cultivos": [],
      "cultivo_principal": "",
      "alias": [
        "El Carmen",
        "Agrícola El Carmen",
        "Agricola El Carmen",
        "Finca El Carmen"
      ]
    },
    {
      "codigo": "puerto_cayo",
      "nombre": "Puerto Cayo",
      "zona": "Costa",
      "hectareas_base": 40,
      "cultivos": [
        "Pitahaya",
        "Espárrago"
      ],
      "cultivo_principal": "Pitahaya / Espárrago",
      "alias": [
        "Puerto Cayo",
        "Cayo",
        "Manabí",
        "Manabi",
        "Pitahaya Manabí",
        "Pitahaya Manabi",
        "Espárrago Manabí",
        "Esparrago Manabi",
        "Puerto Cayo (Pitahaya)",
        "Puerto Cayo (Espárrago)"
      ]
    },
    {
      "codigo": "conaqui",
      "nombre": "Coñaqui",
      "zona": "Imbabura",
      "hectareas_base": 35,
      "cultivos": [],
      "cultivo_principal": "",
      "alias": [
        "Coñaqui",
        "Conaqui"
      ]
    },
    {
      "codigo": "eliana",
      "nombre": "Eliana",
      "zona": "Imbabura",
      "hectareas_base": 18,
      "cultivos": [],
      "cultivo_principal": "",
      "alias": [
        "Eliana"
      ]
    },
    {
      "codigo": "andres_lopez",
      "nombre": "Andrés López",
      "zona": "Imbabura",
      "hectareas_base": 25,
      "cultivos": [],
      "cultivo_principal": "",
      "alias": [
        "Andrés López",
        "Andres Lopez",
        "A. López",
        "A. Lopez"
      ]
    },
    {
      "codigo": "otoburo",
      "nombre": "Otoburo",
      "zona": "Imbabura",
      "hectareas_base": 25,
      "cultivos": [],
      "cultivo_principal": "",
      "alias": [
        "Otoburo"
      ]
    }
  ],
  "cultivos_alias": {
    "pitahaya": "Pitahaya",
    "esparrago": "Espárrago",
    "espárrago": "Espárrago"
  },
  "estados_descartados": [
    "anulado",
    "rechazado"
  ],
  "estados_oc_cerrados": [
    "cerrada",
    "cerrado",
    "anulada",
    "anulado",
    "cancelada",
    "cancelado"
  ],
  "etapas": [
    {
      "id": "revision_campo",
      "orden": 1,
      "nombre": "Revisión de campo",
      "responsable": "Supervisor de Campo",
      "descripcion": "Pedido esperando visto bueno de campo",
      "autorizado": false,
      "aparte": false,
      "propia": false,
      "grupo_gasto": null,
      "color": "maiz",
      "fecha_inicio_campos": [
        "creado"
      ]
    },
    {
      "id": "por_cotizar",
      "orden": 2,
      "nombre": "Por cotizar",
      "responsable": "Compras",
      "descripcion": "Aprobado por campo, sin cotizaciones",
      "autorizado": false,
      "aparte": false,
      "propia": false,
      "grupo_gasto": null,
      "color": "ladrillo",
      "fecha_inicio_campos": [
        "f_rev_campo",
        "creado"
      ]
    },
    {
      "id": "cotizando",
      "orden": 3,
      "nombre": "Cotizando",
      "responsable": "Compras",
      "descripcion": "Con cotizaciones, reuniendo mínimos o eligiendo proveedor",
      "autorizado": false,
      "aparte": false,
      "propia": false,
      "grupo_gasto": null,
      "color": "maiz",
      "fecha_inicio_campos": [
        "f_primera_cot",
        "f_ultima_cot",
        "f_rev_campo",
        "creado"
      ]
    },
    {
      "id": "por_autorizar",
      "orden": 4,
      "nombre": "Por autorizar",
      "responsable": "Gerencia",
      "descripcion": "Proveedor elegido, espera autorización",
      "autorizado": false,
      "aparte": false,
      "propia": false,
      "grupo_gasto": null,
      "color": "maiz",
      "fecha_inicio_campos": [
        "f_seleccion",
        "f_ultima_cot",
        "f_rev_campo",
        "creado"
      ]
    },
    {
      "id": "autorizado_sin_oc",
      "orden": 5,
      "nombre": "Autorizado sin OC",
      "responsable": "Compras",
      "descripcion": "Autorizado, espera emisión de OC",
      "autorizado": true,
      "aparte": false,
      "propia": false,
      "grupo_gasto": "Comprometido",
      "color": "gris",
      "fecha_inicio_campos": [
        "f_autorizacion",
        "f_seleccion",
        "creado"
      ]
    },
    {
      "id": "con_oc",
      "orden": 6,
      "nombre": "Con OC",
      "responsable": "Proveedor / Contabilidad",
      "descripcion": "OC emitida, pendiente de entrega en finca",
      "autorizado": true,
      "aparte": false,
      "propia": false,
      "grupo_gasto": "Ordenado",
      "color": "maiz",
      "fecha_inicio_campos": [
        "oc_creada",
        "f_registro_oc",
        "f_autorizacion",
        "creado"
      ]
    },
    {
      "id": "recibido",
      "orden": 7,
      "nombre": "Recibido",
      "responsable": "Contabilidad / Campo",
      "descripcion": "Entregado en finca, pendiente de pago",
      "autorizado": true,
      "aparte": false,
      "propia": false,
      "grupo_gasto": "Recibido en finca",
      "color": "azul",
      "fecha_inicio_campos": [
        "f_entrega",
        "oc_creada",
        "f_autorizacion"
      ]
    },
    {
      "id": "pagado",
      "orden": 8,
      "nombre": "Pagado",
      "responsable": "Cerrado",
      "descripcion": "Entregado en finca y pagado",
      "autorizado": true,
      "aparte": false,
      "propia": false,
      "grupo_gasto": "Pagado",
      "color": "grafito",
      "fecha_inicio_campos": [
        "f_pago_real",
        "f_entrega",
        "oc_creada"
      ]
    },
    {
      "id": "pagado_sin_entregar",
      "orden": 9,
      "nombre": "Pagado sin entregar",
      "responsable": "Proveedor / Campo",
      "descripcion": "Pagado, falta confirmar recepción en finca",
      "autorizado": true,
      "aparte": false,
      "propia": true,
      "grupo_gasto": "Pagado",
      "color": "grafito",
      "fecha_inicio_campos": [
        "f_pago_real",
        "oc_creada",
        "f_autorizacion"
      ]
    },
    {
      "id": "anulado",
      "orden": 98,
      "nombre": "Anulado",
      "responsable": "Anulado",
      "descripcion": "Línea anulada (va aparte del gasto)",
      "autorizado": false,
      "aparte": true,
      "propia": false,
      "grupo_gasto": null,
      "color": "gris",
      "fecha_inicio_campos": [
        "f_anulacion",
        "actualizado",
        "creado"
      ]
    },
    {
      "id": "rechazado",
      "orden": 99,
      "nombre": "Rechazado",
      "responsable": "Rechazado",
      "descripcion": "Línea rechazada (va aparte del gasto)",
      "autorizado": false,
      "aparte": true,
      "propia": false,
      "grupo_gasto": null,
      "color": "ladrillo",
      "fecha_inicio_campos": [
        "actualizado",
        "creado"
      ]
    }
  ],
  "grupos_gasto": [
    {
      "nombre": "Comprometido",
      "color": "gris",
      "etapas": [
        "autorizado_sin_oc"
      ]
    },
    {
      "nombre": "Ordenado",
      "color": "maiz",
      "etapas": [
        "con_oc"
      ]
    },
    {
      "nombre": "Recibido en finca",
      "color": "azul",
      "etapas": [
        "recibido"
      ]
    },
    {
      "nombre": "Pagado",
      "color": "grafito",
      "etapas": [
        "pagado_sin_entregar",
        "pagado"
      ]
    }
  ],
  "tarjetas_gerencia": [
    {
      "id": "gasto_comprometido_ejecutado",
      "titulo": "Gasto comprometido + ejecutado",
      "color": "gris",
      "semantica": "Comprometido",
      "formato": "moneda"
    },
    {
      "id": "con_oc_monto",
      "titulo": "Con OC $",
      "color": "maiz",
      "semantica": "En proceso",
      "formato": "moneda"
    },
    {
      "id": "recibido_monto",
      "titulo": "Recibido $",
      "color": "azul",
      "semantica": "Recibido o ejecutado",
      "formato": "moneda"
    },
    {
      "id": "sin_cotizar",
      "titulo": "Sin cotizaciones",
      "color": "ladrillo",
      "semantica": "Alerta",
      "formato": "entero"
    },
    {
      "id": "falta_completar_cotizaciones",
      "titulo": "Falta completar cotizaciones",
      "color": "maiz",
      "semantica": "En proceso",
      "formato": "entero"
    },
    {
      "id": "pendiente_cotizar",
      "titulo": "Pendiente de cotizar",
      "color": "maiz",
      "semantica": "En proceso",
      "formato": "entero"
    },
    {
      "id": "pagos_por_confirmar",
      "titulo": "Pagos por confirmar",
      "color": "ladrillo",
      "semantica": "Alerta",
      "formato": "moneda_oc"
    },
    {
      "id": "km_semana",
      "titulo": "Km de la semana",
      "color": "grafito",
      "semantica": "Operativo / pagado",
      "formato": "entero"
    }
  ]
};
  const ZONA_HORARIA = REGLAS.zona_horaria || "America/Guayaquil";
  const UMBRALES = REGLAS.umbrales;
  const PALETA = REGLAS.paleta;
  const ETAPAS = REGLAS.etapas;
  const ETAPAS_POR_ID = Object.fromEntries(ETAPAS.map(e => [e.id, e]));
  const ETAPAS_POR_NOMBRE = Object.fromEntries(ETAPAS.map(e => [e.nombre, e]));
  const FINCAS = REGLAS.fincas;
  const NOMBRES_FINCAS = FINCAS.map(f => f.nombre);
  const FINCAS_POR_NOMBRE = Object.fromEntries(FINCAS.map(f => [f.nombre, f]));
  const TARJETAS_GERENCIA = REGLAS.tarjetas_gerencia;
  const MAX_FILAS_HOJA = Number(REGLAS.max_filas_hoja || 1000);
  const FECHA_INICIO_GESTION = String(REGLAS.fecha_inicio_gestion || "2026-11-04");
  const ESTADOS_AVANCE = Array.isArray(REGLAS.estados_avance) ? REGLAS.estados_avance.slice() : [
    "Por cotizar",
    "Cotizado (en revisión)",
    "Cotizado: proveedor elegido",
    "Autorizado, falta OC",
    "Con OC, por entregar",
    "Entregado",
    "No se compró"
  ];
  const ESTADOS_DESCARTADOS = new Set(REGLAS.estados_descartados);
  const ESTADOS_OC_CERRADOS = new Set(REGLAS.estados_oc_cerrados);

  const MAP_COL_SNAPSHOT = {
    creado: "F. pedido",
    f_rev_campo: "F. revisión campo",
    f_primera_cot: "F. 1ª cotización",
    f_ultima_cot: "F. última cotización",
    f_seleccion: "F. selección proveedor",
    f_autorizacion: "F. autorización",
    oc_creada: "F. OC creada",
    f_registro_oc: "F. registro N° OC",
    f_pago_real: "F. pago realizado",
    f_entrega: "F. entrega",
    f_anulacion: "F. anulación",
    actualizado: "Actualizado"
  };

  function normTexto(v) {
    if (v == null) return "";
    return String(v)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim()
      .replace(/\s+/g, " ");
  }

  const ALIAS_FINCAS = {};
  for (const f of FINCAS) {
    ALIAS_FINCAS[normTexto(f.nombre)] = f.nombre;
    for (const al of (f.alias || [])) ALIAS_FINCAS[normTexto(al)] = f.nombre;
  }
  const REGIONES_ALIAS = {};
  for (const [k, v] of Object.entries(REGLAS.regiones_alias || {})) {
    REGIONES_ALIAS[normTexto(k)] = v;
  }

  function aStr(v) {
    return v == null ? "" : String(v).trim();
  }

  function aFloat(v) {
    if (v == null || v === "" || v === "-") return 0;
    if (typeof v === "number") return Number.isFinite(v) ? v : 0;
    const n = Number(String(v).trim().replace(/[$,\s]/g, ""));
    return Number.isFinite(n) ? n : 0;
  }

  function aInt(v) {
    return (v == null || v === "" || v === "-") ? 0 : Math.round(aFloat(v));
  }

  function campo(fila, ...claves) {
    if (!fila) return "";
    for (const k of claves) {
      if (Object.prototype.hasOwnProperty.call(fila, k) && fila[k] != null && fila[k] !== "") {
        return fila[k];
      }
    }
    return "";
  }

  function normFinca(nombre) {
    const raw = aStr(nombre);
    if (!raw) return "Sin finca";
    const c = normTexto(raw);
    if (ALIAS_FINCAS[c]) return ALIAS_FINCAS[c];
    if (c.includes("carmen")) return "El Carmen";
    if (c.includes("cayo") || c.includes("pitahaya") || c.includes("esparrago")) return "Puerto Cayo";
    if (c.includes("conaqui")) return "Coñaqui";
    if (c.includes("eliana")) return "Eliana";
    if (c.includes("andres") || c.includes("lopez")) return "Andrés López";
    if (c.includes("otoburo")) return "Otoburo";
    return raw;
  }

  function normRegion(region, finca) {
    if (finca != null && aStr(finca)) {
      const fn = normFinca(finca);
      if (FINCAS_POR_NOMBRE[fn]) return FINCAS_POR_NOMBRE[fn].zona;
    }
    const c = normTexto(region);
    if (REGIONES_ALIAS[c]) return REGIONES_ALIAS[c];
    if (c.includes("costa") || c.includes("manab")) return "Costa";
    if (c.includes("imbabura") || c.includes("sierra")) return "Imbabura";
    return aStr(region) || "Sin zona";
  }

  function cultivoDeLinea(fila) {
    const expl = aStr(campo(fila, "cultivo", "Cultivo"));
    if (expl) {
      const aliasMap = REGLAS.cultivos_alias || {};
      return aliasMap[normTexto(expl)] || expl;
    }
    const texto = normTexto([
      aStr(campo(fila, "finca", "Finca")),
      aStr(campo(fila, "producto", "Producto")),
      aStr(campo(fila, "comentario_compras", "Comentario compras")),
      aStr(campo(fila, "observaciones", "Observaciones"))
    ].join(" "));
    for (const [k, nom] of Object.entries(REGLAS.cultivos_alias || {})) {
      if (texto.includes(k)) return nom;
    }
    const fn = normFinca(campo(fila, "finca", "Finca"));
    const info = FINCAS_POR_NOMBRE[fn];
    if (info && info.cultivo_principal) return info.cultivo_principal;
    return fn !== "Sin finca" ? ("General · " + fn) : "Sin cultivo";
  }

  function hectareasPorFinca(filas) {
    const desdeAgro = {};
    for (const r of (filas || [])) {
      const fn = normFinca(campo(r, "finca", "Finca"));
      if (FINCAS_POR_NOMBRE[fn]) {
        const ha = aFloat(campo(r, "hectareas", "Hectáreas", "Hectareas"));
        if (ha > 0) desdeAgro[fn] = ha;
      }
    }
    const out = {};
    for (const f of FINCAS) {
      out[f.nombre] = Object.prototype.hasOwnProperty.call(desdeAgro, f.nombre)
        ? desdeAgro[f.nombre]
        : Number(f.hectareas_base || 0);
    }
    return out;
  }

  const FMT_FECHA_EC = new Intl.DateTimeFormat("en-CA", {
    timeZone: ZONA_HORARIA,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  });

  const FMT_HORA_EC = new Intl.DateTimeFormat("en-GB", {
    timeZone: ZONA_HORARIA,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  });

  function _parsearInstant(valor) {
    if (valor == null || valor === "") return null;
    if (valor instanceof Date) return Number.isNaN(valor.getTime()) ? null : valor;
    const s = String(valor).trim();
    if (!s) return null;
    if (/^\d{2}\/\d{2}\/\d{4}/.test(s)) {
      const d = s.slice(0, 10).split("/");
      return { soloFecha: `${d[2]}-${d[1]}-${d[0]}`, soloTexto: `${d[2]}-${d[1]}-${d[0]}` };
    }
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
      return { soloFecha: s, soloTexto: s };
    }
    let iso = s.replace(" ", "T");
    if (!/(Z|[+-]\d{2}:?\d{2})$/i.test(iso)) {
      iso += "-05:00";
    }
    const dt = new Date(iso);
    return Number.isNaN(dt.getTime()) ? null : dt;
  }

  function fechaLocal(valor) {
    const p = _parsearInstant(valor);
    if (!p) return "";
    if (p.soloFecha) return p.soloFecha;
    const partes = FMT_FECHA_EC.formatToParts(p);
    const y = partes.find(x => x.type === "year")?.value;
    const m = partes.find(x => x.type === "month")?.value;
    const d = partes.find(x => x.type === "day")?.value;
    return (y && m && d) ? `${y}-${m}-${d}` : "";
  }

  function fechaHoraLocal(valor) {
    const p = _parsearInstant(valor);
    if (!p) return "";
    if (p.soloFecha) return p.soloFecha;
    const partes = FMT_HORA_EC.formatToParts(p);
    const get = t => partes.find(x => x.type === t)?.value || "";
    return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`;
  }

  function hoyEcuador() {
    return fechaLocal(new Date());
  }

  function _aDateUTC(ymd) {
    if (!ymd || !/^\d{4}-\d{2}-\d{2}$/.test(ymd)) return null;
    const [y, m, d] = ymd.split("-").map(Number);
    return new Date(Date.UTC(y, m - 1, d));
  }

  function semanaIso(valor) {
    const f = fechaLocal(valor);
    const d = _aDateUTC(f);
    if (!d) return "";
    const diaSem = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - diaSem);
    const inicioAnio = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const sem = Math.ceil((((d - inicioAnio) / 86400000) + 1) / 7);
    return `${d.getUTCFullYear()}-W${String(sem).padStart(2, "0")}`;
  }

  function diasHabiles(inicio, fin) {
    const f1 = fechaLocal(inicio);
    const f2 = fin != null ? fechaLocal(fin) : hoyEcuador();
    const d1 = _aDateUTC(f1);
    const d2 = _aDateUTC(f2);
    if (!d1 || !d2 || d2 <= d1) return 0;
    const diasTot = Math.round((d2 - d1) / 86400000);
    const completas = Math.floor(diasTot / 7);
    const resto = diasTot % 7;
    let hab = completas * 5;
    for (let i = 1; i <= resto; i++) {
      const cur = new Date(d1.getTime() + i * 86400000);
      const wd = cur.getUTCDay();
      if (wd >= 1 && wd <= 5) hab++;
    }
    return hab;
  }

  function montoLinea(fila) {
    const cant = aFloat(campo(fila, "cantidad", "Cantidad"));
    const pu = aFloat(campo(fila, "precio_sel", "Precio unit. elegido"));
    if (cant > 0 && pu > 0) return cant * pu;
    return aFloat(campo(fila, "monto", "Total", "total"));
  }

  function tieneOC(fila) {
    return !!(
      aStr(campo(fila, "oc_codigo", "OC (código)")) ||
      aStr(campo(fila, "numero_oc", "N° OC", "N° Orden Compra")) ||
      aStr(campo(fila, "oc_creada", "F. OC creada"))
    );
  }

  function claveOC(fila) {
    return (
      aStr(campo(fila, "oc_codigo", "OC (código)")) ||
      aStr(campo(fila, "numero_oc", "N° OC", "N° Orden Compra")) ||
      aStr(campo(fila, "linea", "Línea")) ||
      aStr(campo(fila, "pedido", "Pedido"))
    );
  }

  function clasificarEtapa(fila, rec) {
    const est = normTexto(campo(fila, "estado", "Estado (código)", "Estado"));
    const nCot = aInt(campo(fila, "n_cot", "N° cotizaciones"));
    const fEnt = aStr(campo(fila, "f_entrega", "F. entrega"));
    const fPag = aStr(campo(fila, "f_pago_real", "F. pago realizado"));
    const fAut = aStr(campo(fila, "f_autorizacion", "F. autorización"));
    const recEst = rec && typeof rec === "object" ? normTexto(rec.estado_conciliacion) : "";
    const recEnt = !!(
      rec && typeof rec === "object" && (
        rec.entregado || rec.recibido || rec.f_entrega || rec.fecha_entrega ||
        (rec.fecha && ["", "emparejada", "conciliada_manual", "confirmada"].includes(recEst))
      )
    );
    const entregado = !!(fEnt || est === "entregado" || recEnt);
    const pagado = !!fPag;
    const conOc = tieneOC(fila);

    let etId = "revision_campo";
    if (est === "anulado") etId = "anulado";
    else if (est === "rechazado") etId = "rechazado";
    else if (est === "pendiente" && !fAut && !conOc && !pagado && !entregado) etId = "revision_campo";
    else if (est === "aprobado_campo" && !fAut && !conOc && !pagado && !entregado) etId = nCot === 0 ? "por_cotizar" : "cotizando";
    else if (est === "cotizado" && !fAut && !conOc && !pagado && !entregado) etId = "cotizando";
    else if (est === "seleccionado" && !fAut && !conOc && !pagado && !entregado) etId = "por_autorizar";
    else if (pagado && !entregado) etId = "pagado_sin_entregar";
    else if (pagado && entregado) etId = "pagado";
    else if (entregado) etId = "recibido";
    else if (conOc) etId = "con_oc";
    else if (est === "aprobado" || est === "aprobada" || fAut) etId = "autorizado_sin_oc";

    const meta = Object.assign({}, ETAPAS_POR_ID[etId]);
    let fechaInicio = "";
    for (const c of (meta.fecha_inicio_campos || [])) {
      const v = campo(fila, c, MAP_COL_SNAPSHOT[c] || c);
      if (aStr(v)) {
        fechaInicio = fechaLocal(v) || aStr(v);
        break;
      }
    }
    meta.fecha_inicio = fechaInicio;
    return meta;
  }

  function totalesReferenciaCotizacion(filas) {
    const porOc = {};
    const porPed = {};
    for (const r of (filas || [])) {
      const est = normTexto(campo(r, "estado", "Estado (código)", "Estado"));
      if (ESTADOS_DESCARTADOS.has(est)) continue;
      const m = montoLinea(r);
      if (m <= 0) continue;
      const oc = aStr(campo(r, "oc_codigo", "OC (código)")) || aStr(campo(r, "numero_oc", "N° OC"));
      const ped = aStr(campo(r, "pedido", "Pedido"));
      if (oc) porOc[oc] = (porOc[oc] || 0) + m;
      if (ped) porPed[ped] = (porPed[ped] || 0) + m;
    }
    return { oc: porOc, pedido: porPed };
  }

  function montoReferenciaCotizacion(fila, totalesRef) {
    const mPropio = montoLinea(fila);
    if (totalesRef) {
      const oc = aStr(campo(fila, "oc_codigo", "OC (código)")) || aStr(campo(fila, "numero_oc", "N° OC"));
      if (oc && totalesRef.oc && Object.prototype.hasOwnProperty.call(totalesRef.oc, oc)) {
        return Math.max(mPropio, Number(totalesRef.oc[oc] || 0));
      }
      const ped = aStr(campo(fila, "pedido", "Pedido"));
      if (ped && totalesRef.pedido && Object.prototype.hasOwnProperty.call(totalesRef.pedido, ped)) {
        return Math.max(mPropio, Number(totalesRef.pedido[ped] || 0));
      }
    }
    return mPropio;
  }

  function cotizacionesExigidas(fila, totalesRef) {
    const ref = montoReferenciaCotizacion(fila, totalesRef);
    return ref >= Number(UMBRALES.monto_tres_cotizaciones)
      ? Number(UMBRALES.cotizaciones_sobre_umbral)
      : Number(UMBRALES.cotizaciones_bajo_umbral);
  }

  function esCotizacionUnica(fila, seg) {
    if (seg && seg.cotizacion_unica === true) return true;
    if (fila && fila.cotizacion_unica === true) return true;
    return false;
  }

  function esSinCotizar(fila, totalesRef, seg) {
    if (esCotizacionUnica(fila, seg)) return false;
    const est = normTexto(campo(fila, "estado", "Estado (código)", "Estado"));
    if (est !== "aprobado_campo") return false;
    return aInt(campo(fila, "n_cot", "N° cotizaciones")) === 0;
  }

  function esFaltaCompletarCotizaciones(fila, totalesRef, seg) {
    if (esCotizacionUnica(fila, seg)) return false;
    const est = normTexto(campo(fila, "estado", "Estado (código)", "Estado"));
    if (est !== "aprobado_campo") return false;
    const n = aInt(campo(fila, "n_cot", "N° cotizaciones"));
    return n >= 1 && n < cotizacionesExigidas(fila, totalesRef);
  }

  function esPendienteCotizar(fila, totalesRef, seg) {
    if (esCotizacionUnica(fila, seg)) return false;
    const est = normTexto(campo(fila, "estado", "Estado (código)", "Estado"));
    if (est !== "aprobado_campo") return false;
    return aInt(campo(fila, "n_cot", "N° cotizaciones")) < cotizacionesExigidas(fila, totalesRef);
  }

  function esOcAbierta(fila, rec) {
    const est = normTexto(campo(fila, "estado", "Estado (código)", "Estado"));
    if (ESTADOS_DESCARTADOS.has(est)) return false;
    if (!tieneOC(fila)) return false;
    const eoc = normTexto(campo(fila, "estado_oc", "Estado OC"));
    if (ESTADOS_OC_CERRADOS.has(eoc)) return false;
    return clasificarEtapa(fila, rec).id !== "pagado";
  }

  function ahorroDocumentadoLinea(fila, rec) {
    const et = clasificarEtapa(fila, rec);
    if (!et.autorizado) return 0;
    const prom = aFloat(campo(fila, "precio_prom", "Precio unit. promedio"));
    const sel = aFloat(campo(fila, "precio_sel", "Precio unit. elegido"));
    const cant = aFloat(campo(fila, "cantidad", "Cantidad"));
    return (prom > 0 && sel > 0 && cant > 0) ? (prom - sel) * cant : 0;
  }

  function pagosVencidosPorOC(filas, hoy) {
    const hoyYmd = hoy ? fechaLocal(hoy) : hoyEcuador();
    const ocs = {};
    let nLineas = 0;
    const lista = Array.isArray(filas) ? filas : Array.from(filas || []);
    for (let idx = 0; idx < lista.length; idx++) {
      const r = lista[idx];
      const est = normTexto(campo(r, "estado", "Estado (código)", "Estado"));
      if (ESTADOS_DESCARTADOS.has(est)) continue;
      if (aStr(campo(r, "f_pago_real", "F. pago realizado"))) continue;
      const fProg = fechaLocal(campo(r, "f_pago_programada", "F. pago programada"));
      if (!fProg || fProg >= hoyYmd) continue;
      nLineas++;
      const ocReal = aStr(campo(r, "oc_codigo", "OC (código)")) || aStr(campo(r, "numero_oc", "N° OC", "N° Orden Compra"));
      let c = ocReal;
      if (!c) {
        const ref = aStr(campo(r, "linea", "Línea")) || aStr(campo(r, "pedido", "Pedido")) || "fila";
        c = "sin_oc:" + ref + ":" + idx;
      }
      ocs[c] = (ocs[c] || 0) + montoLinea(r);
    }
    const monto = Math.round(Object.values(ocs).reduce((s, v) => s + v, 0) * 100) / 100;
    return { ocs: Object.keys(ocs).sort(), cantidad_ocs: Object.keys(ocs).length, lineas: nLineas, monto };
  }

  function cuentasPorPagarVencimiento(filas, hoy) {
    const hoyYmd = hoy ? fechaLocal(hoy) : hoyEcuador();
    const dHoy = _aDateUTC(hoyYmd);
    const cubos = {};
    for (const k of ["vencido_gt_30", "vencido_16_30", "vencido_1_15", "hoy_a_7_dias", "dias_8_a_30", "mas_30_dias", "sin_programar"]) {
      cubos[k] = { monto: 0, ocs: new Set(), lineas: 0 };
    }
    for (const r of (filas || [])) {
      const est = normTexto(campo(r, "estado", "Estado (código)", "Estado"));
      if (ESTADOS_DESCARTADOS.has(est)) continue;
      if (aStr(campo(r, "f_pago_real", "F. pago realizado"))) continue;
      const et = clasificarEtapa(r);
      if (!et.autorizado || !tieneOC(r)) continue;
      const fProg = fechaLocal(campo(r, "f_pago_programada", "F. pago programada"));
      const m = montoLinea(r);
      const oc = claveOC(r);
      let k = "sin_programar";
      if (fProg && dHoy) {
        const dif = Math.round((_aDateUTC(fProg) - dHoy) / 86400000);
        if (dif < -30) k = "vencido_gt_30";
        else if (dif < -15) k = "vencido_16_30";
        else if (dif < 0) k = "vencido_1_15";
        else if (dif <= 7) k = "hoy_a_7_dias";
        else if (dif <= 30) k = "dias_8_a_30";
        else k = "mas_30_dias";
      }
      cubos[k].monto += m;
      cubos[k].ocs.add(oc);
      cubos[k].lineas += 1;
    }
    const out = {};
    for (const [k, v] of Object.entries(cubos)) {
      out[k] = { monto: Math.round(v.monto * 100) / 100, ocs: v.ocs.size, lineas: v.lineas };
    }
    const vencOcs = new Set([...cubos.vencido_gt_30.ocs, ...cubos.vencido_16_30.ocs, ...cubos.vencido_1_15.ocs]);
    out.vencido_total = {
      monto: Math.round((cubos.vencido_gt_30.monto + cubos.vencido_16_30.monto + cubos.vencido_1_15.monto) * 100) / 100,
      ocs: vencOcs.size,
      lineas: cubos.vencido_gt_30.lineas + cubos.vencido_16_30.lineas + cubos.vencido_1_15.lineas
    };
    return out;
  }

  function variacionesPrecioHistorico(filas) {
    const items = [];
    (filas || []).forEach((r, idx) => {
      const est = normTexto(campo(r, "estado", "Estado (código)", "Estado"));
      if (ESTADOS_DESCARTADOS.has(est)) return;
      const pu = aFloat(campo(r, "precio_sel", "Precio unit. elegido"));
      const prod = normTexto(campo(r, "producto", "Producto"));
      const prov = normTexto(campo(r, "proveedor", "Proveedor"));
      if (pu <= 0 || !prod || !prov) return;
      const et = clasificarEtapa(r);
      const fOrd =
        aStr(campo(r, "f_autorizacion", "F. autorización")) ||
        aStr(campo(r, "oc_creada", "F. OC creada")) ||
        aStr(campo(r, "f_seleccion", "F. selección proveedor")) ||
        aStr(campo(r, "f_ultima_cot", "F. última cotización")) ||
        aStr(campo(r, "creado", "F. pedido"));
      const ordIso = fechaHoraLocal(fOrd) || fOrd || "9999-12-31T23:59";
      const lin = aStr(campo(r, "linea", "Línea")) || ("idx_" + idx);
      items.push({ ordIso, lin, r, prod, prov, pu, esCompra: !!et.autorizado });
    });
    items.sort((a, b) => a.ordIso !== b.ordIso ? a.ordIso.localeCompare(b.ordIso) : a.lin.localeCompare(b.lin));
    const ultimo = {};
    const umbral = Number(UMBRALES.umbral_variacion_precio);
    const res = {};
    for (const it of items) {
      const par = it.prod + "|||" + it.prov;
      const prev = ultimo[par];
      if (!prev || prev.precio <= 0) {
        res[it.lin] = { precio_anterior: null, variacion: null, linea_anterior: null, alerta: false };
      } else {
        const v = (it.pu - prev.precio) / prev.precio;
        res[it.lin] = {
          precio_anterior: Math.round(prev.precio * 10000) / 10000,
          variacion: Math.round(v * 1000000) / 1000000,
          linea_anterior: prev.lin,
          alerta: v > umbral
        };
      }
      if (it.esCompra) {
        ultimo[par] = { precio: it.pu, lin: it.lin };
      }
    }
    return res;
  }

  function normalizarEstadoAvance(valor) {
    const raw = aStr(valor);
    if (!raw) return "";
    const cl = normTexto(raw);
    if (!cl || cl.startsWith("segun agrocontrol")) return "";
    if (cl === "por cotizar") return "Por cotizar";
    if (cl === "cotizado (en revision)" || cl === "cotizado en revision" || cl === "cotizando") return "Cotizado (en revisión)";
    if (cl === "cotizado: proveedor elegido" || cl === "cotizado proveedor elegido" || cl === "proveedor elegido") return "Cotizado: proveedor elegido";
    if (cl === "autorizado, falta oc" || cl === "autorizado falta oc" || cl === "autorizado sin oc" || cl === "autorizado") return "Autorizado, falta OC";
    if (cl === "con oc, por entregar" || cl === "con oc por entregar" || cl === "con oc" || cl === "por retirar") return "Con OC, por entregar";
    if (cl === "entregado" || cl === "recibido") return "Entregado";
    if (cl.startsWith("no se compro")) return "No se compró";
    for (const est of ESTADOS_AVANCE) {
      if (normTexto(est) === cl) return est;
    }
    return "";
  }

  function okPagoAprobado(valor) {
    const s = normTexto(valor);
    return !!s && !s.startsWith("n") && s !== "0" && s !== "false" && s !== "-" && s !== "pendiente";
  }

  function ordenCodigoTexto(codigo) {
    const s = aStr(codigo);
    const m = s.match(/\d+/);
    return m ? [0, Number(m[0]), s] : [1, 0, s];
  }

  function _cmpOrdenCodigo(a, b) {
    const ka = ordenCodigoTexto(a);
    const kb = ordenCodigoTexto(b);
    if (ka[0] !== kb[0]) return ka[0] - kb[0];
    if (ka[1] !== kb[1]) return ka[1] - kb[1];
    return ka[2] < kb[2] ? -1 : (ka[2] > kb[2] ? 1 : 0);
  }

  function _redondear(v, dec) {
    const f = Math.pow(10, dec);
    return Math.round((Number(v) + Number.EPSILON) * f) / f;
  }

  function avancePorLinea(fila, seguimiento, totalesRef, hoy) {
    const ped = aStr(campo(fila, "pedido", "Pedido"));
    const lin = aStr(campo(fila, "linea", "Línea", "Código producto"));
    const oc = aStr(campo(fila, "oc_codigo", "OC (código)", "Orden de compra (código)"));
    const numOc = aStr(campo(fila, "numero_oc", "N° OC", "N° Orden Compra"));
    const ocCreada = aStr(campo(fila, "oc_creada", "F. OC creada"));
    const est = normTexto(campo(fila, "estado", "Estado (código)", "Estado"));
    const nCot = aInt(campo(fila, "n_cot", "N° cotizaciones", "N° Cotizaciones"));
    const fEnt = aStr(campo(fila, "f_entrega", "F. entrega", "Fecha Entrega"));
    const fPag = aStr(campo(fila, "f_pago_real", "F. pago realizado", "Fecha Pago Realizado"));
    const fAut = aStr(campo(fila, "f_autorizacion", "F. autorización", "Fecha Autorización"));
    const fCreado = aStr(campo(fila, "creado", "F. pedido", "Fecha creación"));
    const finca = normFinca(campo(fila, "finca", "Finca"));
    const producto = aStr(campo(fila, "producto", "Producto"));
    const proveedor = aStr(campo(fila, "proveedor", "Proveedor", "Proveedor Seleccionado"));
    const monto = _redondear(montoLinea(fila), 2);
    const cotExig = cotizacionesExigidas(fila, totalesRef);
    const cotFaltan = Math.max(0, cotExig - nCot);
    const diasCreado = fCreado ? diasHabiles(fCreado, hoy) : 0;
    const pagado = !!fPag;
    const tieneOcNum = !!(oc || numOc || ocCreada);

    if (ESTADOS_DESCARTADOS.has(est)) {
      const estadoEntrega = est === "anulado" ? "Anulado" : "Rechazado";
      const notaDesc = aStr(campo(fila, "motivo_anulacion", "Motivo Anulación", "motivo_rechazo", "Motivo Rechazo"));
      return {
        pedido: ped,
        linea: lin,
        oc: oc || numOc,
        oc_codigo: oc,
        numero_oc: numOc,
        finca,
        producto,
        proveedor,
        monto,
        n_cot: nCot,
        cotizaciones_exigidas: cotExig,
        cotizaciones_faltantes: cotFaltan,
        dias_desde_creado: diasCreado,
        estado_entrega: estadoEntrega,
        estado_pago: "—",
        estado_plataforma: estadoEntrega,
        fuente: "AgroControl",
        nota: notaDesc,
        pagado: false,
        faltan_ok: [],
        aprob_pago: 0,
        falta_ok_pago: false,
        entregado_falta_pagar: false,
        vigente: false,
        aparte: true,
        cotizacion_unica: false,
        motivo_cotizacion_unica: "",
        sin_cotizar: false,
        falta_completar_cotizaciones: false,
        pendiente_cotizar: false
      };
    }

    let seg = null;
    if (seguimiento && typeof seguimiento === "object") {
      if (lin && seguimiento[lin] && typeof seguimiento[lin] === "object") seg = seguimiento[lin];
      else if (oc && seguimiento[oc] && typeof seguimiento[oc] === "object") seg = seguimiento[oc];
    }

    const segEst = seg ? normalizarEstadoAvance(seg.estado) : "";
    const fEntTxt = fEnt ? (fechaLocal(fEnt) || fEnt) : "";
    let estadoEntrega = "Por cotizar";
    let fuente = "AgroControl";
    let nota = "";

    if (fEnt) {
      estadoEntrega = "Entregado";
      fuente = "AgroControl";
      nota = `Entregado el ${fEntTxt} según AgroControl.`;
    } else if (segEst) {
      estadoEntrega = segEst;
      const por = aStr(seg.por);
      fuente = aStr(seg.fuente) || (por ? `Seguimiento (${por})` : "Seguimiento manual");
      nota = aStr(seg.nota);
    } else {
      if (est === "entregado") estadoEntrega = "Entregado";
      else if (tieneOcNum) estadoEntrega = "Con OC, por entregar";
      else if (est === "aprobado" || est === "aprobada" || est === "compra autorizada" || fAut) estadoEntrega = "Autorizado, falta OC";
      else if (est === "seleccionado" || est === "proveedor seleccionado") estadoEntrega = "Cotizado: proveedor elegido";
      else if (est === "cotizado" || nCot > 0) estadoEntrega = "Cotizado (en revisión)";
      else estadoEntrega = "Por cotizar";
    }

    const vigente = estadoEntrega !== "No se compró";
    const f3Ok = aStr(campo(fila, "f_3ok", "F. 3 OK", "Fecha Pago Aprobado"));
    const faltanOk = [];
    if (!f3Ok) {
      if (!okPagoAprobado(campo(fila, "ok_lola", "OK Lola (día)", "Pago Lola OK"))) faltanOk.push("Lola");
      if (!okPagoAprobado(campo(fila, "ok_daniela", "OK Daniela (día)", "Pago Daniela OK"))) faltanOk.push("Daniela");
      if (!okPagoAprobado(campo(fila, "ok_gerencia", "OK Gerencia (día)", "Pago Sebastián OK"))) faltanOk.push("Gerencia");
    }
    const aprobPago = 3 - faltanOk.length;

    let estadoPago = "—";
    let faltaOkPago = false;
    if (!vigente || (estadoEntrega !== "Con OC, por entregar" && estadoEntrega !== "Entregado")) {
      estadoPago = (pagado && vigente) ? "Pagado" : "—";
    } else if (pagado) {
      estadoPago = "Pagado";
    } else if (faltanOk.length) {
      estadoPago = `Falta OK de pago (${faltanOk.join(", ")})`;
      faltaOkPago = true;
    } else {
      estadoPago = "Falta pagar (OK completo)";
    }

    let estadoPlataforma = estadoEntrega;
    if (vigente) {
      if (estadoEntrega === "Entregado") {
        estadoPlataforma = pagado ? "Entregado y pagado" : ("Entregado y falta pagar" + (faltanOk.length ? " · falta OK de pago" : ""));
      } else if (estadoEntrega === "Con OC, por entregar") {
        estadoPlataforma = pagado ? "Pagado sin entregar" : ("Con OC por entregar · " + (faltanOk.length ? "falta OK de pago" : "falta pagar"));
      }
    }

    const cotUnica = esCotizacionUnica(fila, seg);
    const motivoCotUnica = aStr((seg && seg.motivo_cotizacion_unica) || (fila && fila.motivo_cotizacion_unica));
    const sinCot = esSinCotizar(fila, totalesRef, seg);
    const faltaComp = esFaltaCompletarCotizaciones(fila, totalesRef, seg);
    const pendCot = esPendienteCotizar(fila, totalesRef, seg);

    return {
      pedido: ped,
      linea: lin,
      oc: oc || numOc,
      oc_codigo: oc,
      numero_oc: numOc,
      finca,
      producto,
      proveedor,
      monto,
      n_cot: nCot,
      cotizaciones_exigidas: cotExig,
      cotizaciones_faltantes: cotFaltan,
      dias_desde_creado: diasCreado,
      estado_entrega: estadoEntrega,
      estado_pago: estadoPago,
      estado_plataforma: estadoPlataforma,
      fuente,
      nota,
      pagado,
      faltan_ok: faltanOk,
      aprob_pago: aprobPago,
      falta_ok_pago: faltaOkPago,
      entregado_falta_pagar: !!(vigente && estadoEntrega === "Entregado" && !pagado),
      vigente,
      aparte: false,
      cotizacion_unica: cotUnica,
      motivo_cotizacion_unica: motivoCotUnica,
      sin_cotizar: sinCot,
      falta_completar_cotizaciones: faltaComp,
      pendiente_cotizar: pendCot
    };
  }

  function avancePorPedido(filas, seguimiento, hoy) {
    const lista = Array.isArray(filas) ? filas : Array.from(filas || []);
    const totRef = totalesReferenciaCotizacion(lista);
    const lineasEval = [];
    const grupos = {};
    const totConteos = Object.fromEntries(ESTADOS_AVANCE.map(e => [e, 0]));
    let totAparte = 0, totVigentes = 0;
    let totMVigente = 0, totMEntregado = 0, totMEntFalta = 0, totMConOc = 0, totMFaltaOk = 0;
    let totFaltaOkLin = 0, totEntFaltaLin = 0, totPagadoLin = 0;

    for (const fila of lista) {
      const av = avancePorLinea(fila, seguimiento, totRef, hoy);
      lineasEval.push(av);
      const ped = av.pedido || "Sin pedido";
      if (av.aparte) {
        totAparte++;
        if (grupos[ped]) grupos[ped].aparte++;
        continue;
      }
      if (!grupos[ped]) {
        grupos[ped] = {
          pedido: ped,
          fincasSet: new Set(),
          total_lineas: 0,
          vigentes: 0,
          aparte: 0,
          conteos: Object.fromEntries(ESTADOS_AVANCE.map(e => [e, 0])),
          monto_vigente: 0,
          monto_entregado: 0,
          monto_entregado_falta_pagar: 0,
          monto_con_oc: 0,
          monto_falta_ok_pago: 0,
          falta_ok_lineas: 0,
          entregado_falta_pagar_lineas: 0,
          pagado_lineas: 0
        };
      }
      const g = grupos[ped];
      g.fincasSet.add(av.finca);
      g.total_lineas++;
      const estE = av.estado_entrega;
      g.conteos[estE] = (g.conteos[estE] || 0) + 1;
      totConteos[estE] = (totConteos[estE] || 0) + 1;
      if (av.vigente) {
        const m = Number(av.monto || 0);
        g.vigentes++;
        g.monto_vigente += m;
        totVigentes++;
        totMVigente += m;
        if (estE === "Entregado") {
          g.monto_entregado += m;
          totMEntregado += m;
        }
        if (av.entregado_falta_pagar) {
          g.monto_entregado_falta_pagar += m;
          g.entregado_falta_pagar_lineas++;
          totMEntFalta += m;
          totEntFaltaLin++;
        }
        if (estE === "Con OC, por entregar") {
          g.monto_con_oc += m;
          totMConOc += m;
        }
        if (av.falta_ok_pago) {
          g.monto_falta_ok_pago += m;
          g.falta_ok_lineas++;
          totMFaltaOk += m;
          totFaltaOkLin++;
        }
        if (av.pagado) {
          g.pagado_lineas++;
          totPagadoLin++;
        }
      }
    }

    const porPedido = Object.keys(grupos).sort(_cmpOrdenCodigo).map(ped => {
      const g = grupos[ped];
      const c = g.conteos;
      const vig = g.vigentes;
      const cotTot = c["Cotizado (en revisión)"] + c["Cotizado: proveedor elegido"];
      const porEntregar = cotTot + c["Autorizado, falta OC"] + c["Con OC, por entregar"];
      const fincas = Array.from(g.fincasSet).sort();
      return {
        pedido: ped,
        finca: fincas.join(", "),
        fincas,
        total_lineas: g.total_lineas,
        vigentes: vig,
        aparte: g.aparte,
        conteos: c,
        cotizado_total: cotTot,
        pct_entregado: vig ? _redondear(c["Entregado"] * 100 / vig, 1) : 0,
        pct_por_entregar: vig ? _redondear(porEntregar * 100 / vig, 1) : 0,
        pct_sin_cotizar: vig ? _redondear(c["Por cotizar"] * 100 / vig, 1) : 0,
        monto_vigente: _redondear(g.monto_vigente, 2),
        monto_entregado: _redondear(g.monto_entregado, 2),
        monto_entregado_falta_pagar: _redondear(g.monto_entregado_falta_pagar, 2),
        monto_con_oc: _redondear(g.monto_con_oc, 2),
        monto_falta_ok_pago: _redondear(g.monto_falta_ok_pago, 2),
        falta_ok_lineas: g.falta_ok_lineas,
        entregado_falta_pagar_lineas: g.entregado_falta_pagar_lineas,
        pagado_lineas: g.pagado_lineas
      };
    });

    return {
      por_pedido: porPedido,
      lineas: lineasEval,
      totales: {
        total_lineas: lineasEval.length - totAparte,
        vigentes: totVigentes,
        aparte: totAparte,
        conteos: totConteos,
        por_cotizar: totConteos["Por cotizar"],
        cotizado_total: totConteos["Cotizado (en revisión)"] + totConteos["Cotizado: proveedor elegido"],
        autorizado_sin_oc: totConteos["Autorizado, falta OC"],
        con_oc: totConteos["Con OC, por entregar"],
        entregado: totConteos["Entregado"],
        no_se_compro: totConteos["No se compró"],
        pct_entregado_global: totVigentes ? _redondear(totConteos["Entregado"] * 100 / totVigentes, 1) : 0,
        monto_vigente: _redondear(totMVigente, 2),
        monto_entregado: _redondear(totMEntregado, 2),
        monto_entregado_falta_pagar: _redondear(totMEntFalta, 2),
        monto_con_oc: _redondear(totMConOc, 2),
        monto_falta_ok_pago: _redondear(totMFaltaOk, 2),
        falta_ok_lineas: totFaltaOkLin,
        entregado_falta_pagar_lineas: totEntFaltaLin,
        pagado_lineas: totPagadoLin
      }
    };
  }

  function resumirIndicadores(filas, recepciones, vehiculos, hoy, seguimiento) {
    const lista = Array.isArray(filas) ? filas : [];
    const hoyYmd = hoy ? fechaLocal(hoy) : hoyEcuador();
    const dHoy = _aDateUTC(hoyYmd);
    const recs = recepciones || {};
    const totRef = totalesReferenciaCotizacion(lista);
    const hectareas = hectareasPorFinca(lista);
    const varPrecios = variacionesPrecioHistorico(lista);

    const totEtapa = Object.fromEntries(ETAPAS.map(e => [e.id, { nombre: e.nombre, monto: 0, lineas: 0 }]));
    const gruposGasto = Object.fromEntries(REGLAS.grupos_gasto.map(g => [g.nombre, 0]));
    const gastoFinca = Object.fromEntries(FINCAS.map(f => [f.nombre, { finca: f.nombre, zona: f.zona, hectareas: hectareas[f.nombre], monto: 0, lineas: 0 }]));
    const gastoZona = { Costa: 0, Imbabura: 0 };
    const gastoCultivo = {};
    const kraljicCats = {};
    const provsDist = new Set();
    const ocsAbiertasSet = new Set();

    const semActual = semanaIso(hoyYmd);
    const anioActual = hoyYmd.slice(0, 4);
    const mesActual = hoyYmd.slice(0, 7);

    let gastoSemana = 0, gastoMes = 0, gastoAnio = 0, ahorroDoc = 0;
    let sinCotizarCnt = 0, faltaCompCnt = 0, cotUnicaCnt = 0, pendienteCot = 0;
    const pedOcDias = [];
    let entTotal = 0, entCon = 0, entTiempo = 0, entAtras = 0;
    let montoAutTotal = 0, montoAutCotOk = 0, alertasPrecio = 0;

    lista.forEach((r, idx) => {
      const lin = aStr(campo(r, "linea", "Línea"));
      const oc = aStr(campo(r, "oc_codigo", "OC (código)", "Orden de compra (código)"));
      let seg = null;
      if (seguimiento && typeof seguimiento === "object") {
        if (lin && seguimiento[lin]) seg = seguimiento[lin];
        else if (oc && seguimiento[oc]) seg = seguimiento[oc];
      } else if (r && r.seguimiento && typeof r.seguimiento === "object") {
        seg = r.seguimiento;
      }

      const rec = lin ? recs[lin] : null;
      const et = clasificarEtapa(r, rec);
      const m = montoLinea(r);
      totEtapa[et.id].monto += m;
      totEtapa[et.id].lineas += 1;
      if (et.id === "anulado" || et.id === "rechazado") return;

      if (esCotizacionUnica(r, seg)) cotUnicaCnt++;
      if (esSinCotizar(r, totRef, seg)) sinCotizarCnt++;
      if (esFaltaCompletarCotizaciones(r, totRef, seg)) faltaCompCnt++;
      if (esPendienteCotizar(r, totRef, seg)) pendienteCot++;
      if (esOcAbierta(r, rec)) ocsAbiertasSet.add(claveOC(r));
      const vp = varPrecios[lin || ("idx_" + idx)];
      if (vp && vp.alerta) alertasPrecio++;

      const prov = aStr(campo(r, "proveedor", "Proveedor"));
      if (prov) provsDist.add(prov);

      if (et.autorizado) {
        montoAutTotal += m;
        if (et.grupo_gasto && Object.prototype.hasOwnProperty.call(gruposGasto, et.grupo_gasto)) {
          gruposGasto[et.grupo_gasto] += m;
        }
        ahorroDoc += ahorroDocumentadoLinea(r, rec);
        const nCot = aInt(campo(r, "n_cot", "N° cotizaciones"));
        if (nCot >= cotizacionesExigidas(r, totRef)) montoAutCotOk += m;

        const fAut = fechaLocal(
          campo(r, "f_autorizacion", "F. autorización") ||
          campo(r, "oc_creada", "F. OC creada") ||
          campo(r, "creado", "F. pedido")
        );
        if (fAut) {
          if (fAut.slice(0, 4) === anioActual) gastoAnio += m;
          if (fAut.slice(0, 7) === mesActual) gastoMes += m;
          if (semanaIso(fAut) === semActual) gastoSemana += m;
        }

        const fn = normFinca(campo(r, "finca", "Finca"));
        const zona = normRegion(campo(r, "region", "Región"), fn);
        if (!gastoFinca[fn]) {
          gastoFinca[fn] = { finca: fn, zona, hectareas: aFloat(campo(r, "hectareas", "Hectáreas")), monto: 0, lineas: 0 };
        }
        gastoFinca[fn].monto += m;
        gastoFinca[fn].lineas += 1;
        if (Object.prototype.hasOwnProperty.call(gastoZona, zona)) gastoZona[zona] += m;

        const cult = cultivoDeLinea(r);
        if (!gastoCultivo[cult]) gastoCultivo[cult] = { cultivo: cult, monto: 0, lineas: 0 };
        gastoCultivo[cult].monto += m;
        gastoCultivo[cult].lineas += 1;

        const cat = aStr(campo(r, "categoria", "Categoría")) || "Sin categoría";
        if (!kraljicCats[cat]) kraljicCats[cat] = { categoria: cat, gasto: 0, provs: new Set(), lineas: 0 };
        kraljicCats[cat].gasto += m;
        if (prov) kraljicCats[cat].provs.add(prov);
        kraljicCats[cat].lineas += 1;
      }

      const iPed = _parsearInstant(campo(r, "creado", "F. pedido"));
      const iOc = _parsearInstant(campo(r, "oc_creada", "F. OC creada"));
      if (iPed instanceof Date && iOc instanceof Date && iOc >= iPed) {
        pedOcDias.push((iOc - iPed) / 86400000);
      }

      if (tieneOC(r)) {
        entTotal++;
        const fEnt = fechaLocal(campo(r, "f_entrega", "F. entrega"));
        const fOc = fechaLocal(campo(r, "oc_creada", "F. OC creada"));
        const entregado = !!(fEnt || et.id === "recibido" || et.id === "pagado");
        const ofrec = aFloat(campo(r, "dias_entrega_ofrec", "Días entrega ofrecidos"));
        if (entregado) {
          entCon++;
          if (fOc && fEnt && ofrec > 0) {
            const realD = Math.round((_aDateUTC(fEnt) - _aDateUTC(fOc)) / 86400000);
            if (realD <= ofrec) entTiempo++;
            else entAtras++;
          } else {
            entTiempo++;
          }
        } else if (fOc && dHoy && ofrec > 0) {
          if (Math.round((dHoy - _aDateUTC(fOc)) / 86400000) > ofrec) entAtras++;
        }
      }
    });

    const pagosVenc = pagosVencidosPorOC(lista, hoyYmd);
    const cxp = cuentasPorPagarVencimiento(lista, hoyYmd);

    let kmSemana = 0;
    for (const v of (vehiculos || [])) {
      const fv = fechaLocal(v.fecha_actividad || v.fecha);
      if (fv && semanaIso(fv) === semActual) kmSemana += aFloat(v.km_recorridos);
    }

    const costoHa = FINCAS.map(f => {
      const inf = gastoFinca[f.nombre];
      const ha = Number(inf.hectareas || 0);
      const mg = Math.round(inf.monto * 100) / 100;
      const cha = ha > 0 ? Math.round((mg / ha) * 100) / 100 : 0;
      inf.monto = mg;
      inf.costo_por_hectarea = cha;
      return { finca: f.nombre, zona: f.zona, hectareas: ha, gasto: mg, costo_por_hectarea: cha };
    });

    const pedOcProm = pedOcDias.length ? Math.round((pedOcDias.reduce((a, b) => a + b, 0) / pedOcDias.length) * 100) / 100 : 0;
    const pedOrd = [...pedOcDias].sort((a, b) => a - b);
    const pedOcMed = !pedOrd.length ? 0 : (pedOrd.length % 2 === 0
      ? Math.round(((pedOrd[pedOrd.length / 2 - 1] + pedOrd[pedOrd.length / 2]) / 2) * 100) / 100
      : Math.round(pedOrd[(pedOrd.length - 1) / 2] * 100) / 100);
    const evalOtd = entTiempo + entAtras;
    const pctEnt = entTotal ? Math.round((entCon / entTotal) * 10000) / 10000 : 0;
    const pctOtd = evalOtd ? Math.round((entTiempo / evalOtd) * 10000) / 10000 : 0;
    const pctCotUsd = montoAutTotal > 0 ? Math.round((montoAutCotOk / montoAutTotal) * 10000) / 10000 : 0;

    const kraljicLista = Object.values(kraljicCats)
      .sort((a, b) => b.gasto - a.gasto)
      .map(kr => {
        const gK = Math.round(kr.gasto * 100) / 100;
        return {
          categoria: kr.categoria,
          gasto: gK,
          pct_gasto: montoAutTotal > 0 ? Math.round((gK / montoAutTotal) * 10000) / 10000 : 0,
          num_proveedores: kr.provs.size,
          num_lineas: kr.lineas
        };
      });

    const r2 = v => Math.round(v * 100) / 100;
    const gastoTotal = r2(montoAutTotal);
    const conOcMonto = r2(gruposGasto["Ordenado"]);
    const recibidoMonto = r2(gruposGasto["Recibido en finca"]);

    return {
      fecha_corte: hoyYmd,
      total_lineas: lista.length,
      gasto_comprometido_ejecutado: gastoTotal,
      totales_grupo_gasto: Object.fromEntries(Object.entries(gruposGasto).map(([k, v]) => [k, r2(v)])),
      totales_etapa: Object.fromEntries(Object.entries(totEtapa).map(([k, v]) => [k, { nombre: v.nombre, monto: r2(v.monto), lineas: v.lineas }])),
      con_oc_monto: conOcMonto,
      recibido_monto: recibidoMonto,
      sin_cotizar: sinCotizarCnt,
      falta_completar_cotizaciones: faltaCompCnt,
      cotizacion_unica: cotUnicaCnt,
      pendiente_cotizar: pendienteCot,
      pagos_vencidos: pagosVenc,
      km_semana: Math.round(kmSemana * 10) / 10,
      tarjetas: {
        gasto_comprometido_ejecutado: gastoTotal,
        con_oc_monto: conOcMonto,
        recibido_monto: recibidoMonto,
        sin_cotizar: sinCotizarCnt,
        falta_completar_cotizaciones: faltaCompCnt,
        cotizacion_unica: cotUnicaCnt,
        pendiente_cotizar: pendienteCot,
        pagos_por_confirmar: pagosVenc.monto,
        pagos_por_confirmar_ocs: pagosVenc.cantidad_ocs,
        km_semana: Math.round(kmSemana * 10) / 10
      },
      ocs_abiertas: { cantidad: ocsAbiertasSet.size, ocs: [...ocsAbiertasSet].sort() },
      ahorro_documentado: r2(ahorroDoc),
      gasto_semana: r2(gastoSemana),
      gasto_mes: r2(gastoMes),
      gasto_anio: r2(gastoAnio),
      gasto_por_finca: gastoFinca,
      hectareas_finca: hectareas,
      costo_por_hectarea: costoHa,
      gasto_por_zona: Object.fromEntries(Object.entries(gastoZona).map(([k, v]) => [k, r2(v)])),
      gasto_por_cultivo: Object.values(gastoCultivo).map(c => ({ cultivo: c.cultivo, monto: r2(c.monto), lineas: c.lineas })).sort((a, b) => b.monto - a.monto),
      cumplimiento_entrega: {
        entregadas: entCon,
        total_evaluadas: entTotal,
        pct_con_entrega: pctEnt,
        a_tiempo: entTiempo,
        atrasadas: entAtras,
        pct_a_tiempo: pctOtd,
        meta: Number(UMBRALES.meta_entregas_tiempo)
      },
      dias_pedido_a_oc: {
        promedio: pedOcProm,
        mediana: pedOcMed,
        n: pedOcDias.length,
        meta: Number(UMBRALES.meta_pedido_oc_dias),
        cumple: pedOcDias.length ? pedOcProm <= Number(UMBRALES.meta_pedido_oc_dias) : null
      },
      pct_gasto_cotizaciones_suficientes: {
        pct: pctCotUsd,
        monto_suficiente: r2(montoAutCotOk),
        monto_total: gastoTotal,
        meta: Number(UMBRALES.meta_cotizaciones_suficientes),
        cumple: gastoTotal > 0 ? pctCotUsd >= Number(UMBRALES.meta_cotizaciones_suficientes) : null
      },
      cuentas_por_pagar: cxp,
      alertas_variacion_precio: alertasPrecio,
      proveedores_distintos: provsDist.size,
      kraljic_categorias: kraljicLista
    };
  }

  const api = {
    REGLAS,
    ZONA_HORARIA,
    UMBRALES,
    PALETA,
    ETAPAS,
    ETAPAS_POR_ID,
    ETAPAS_POR_NOMBRE,
    FINCAS,
    NOMBRES_FINCAS,
    FINCAS_POR_NOMBRE,
    TARJETAS_GERENCIA,
    MAX_FILAS_HOJA,
    FECHA_INICIO_GESTION,
    ESTADOS_AVANCE,
    normTexto,
    normalizarEstadoAvance,
    avancePorLinea,
    avancePorPedido,
    normFinca,
    normRegion,
    cultivoDeLinea,
    hectareasPorFinca,
    fechaLocal,
    fechaHoraLocal,
    hoyEcuador,
    semanaIso,
    diasHabiles,
    montoLinea,
    clasificarEtapa,
    totalesReferenciaCotizacion,
    cotizacionesExigidas,
    esCotizacionUnica,
    esSinCotizar,
    esFaltaCompletarCotizaciones,
    esPendienteCotizar,
    esOcAbierta,
    ahorroDocumentadoLinea,
    pagosVencidosPorOC,
    cuentasPorPagarVencimiento,
    variacionesPrecioHistorico,
    resumirIndicadores
  };

  root.AgdReglas = api;
  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
})(typeof window !== "undefined" ? window : globalThis);
