/* Entreno · descargar y restaurar respaldo (complementa "Copiar respaldo (JSON)").
   Los datos viven solo en este dispositivo (localStorage). */
(function () {
  "use strict";
  var KEY = "entreno-prototipo-v1";

  function el(tag, attrs, kids) {
    var n = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      if (k === "style") n.style.cssText = attrs[k];
      else if (k.slice(0, 2) === "on") n.addEventListener(k.slice(2), attrs[k]);
      else n.setAttribute(k, attrs[k]);
    });
    (kids || []).forEach(function (c) { n.append(c); });
    return n;
  }

  function hoy() {
    var d = new Date();
    var p = function (x) { return String(x).padStart(2, "0"); };
    return d.getFullYear() + "-" + p(d.getMonth() + 1) + "-" + p(d.getDate());
  }

  function validar(txt) {
    var data;
    try { data = JSON.parse(txt); } catch (e) { return { error: "El texto no es un respaldo válido (JSON mal formado)." }; }
    // Formato de "Copiar respaldo (JSON)": { app, exportedAt, data: {...} }
    if (data && typeof data === "object" && data.app === "entreno-prototipo" && data.data) data = data.data;
    if (!data || typeof data !== "object" || data.v !== 1) return { error: "No parece un respaldo de Entreno (versión desconocida)." };
    if (data.history && !Array.isArray(data.history)) return { error: "El respaldo tiene el historial dañado." };
    return { data: data };
  }

  function abrir() {
    if (document.getElementById("entreno-respaldo")) return;
    var actual = null;
    try { actual = localStorage.getItem(KEY); } catch (e) {}
    var n = 0;
    try { n = (JSON.parse(actual || "{}").history || []).length; } catch (e) {}

    var msg = el("p", { style: "margin:0;color:#a39eb2;font-size:14px;line-height:1.45" }, []);
    var area = el("textarea", {
      "aria-label": "Pegá acá tu respaldo",
      placeholder: "Pegá acá el texto del respaldo (JSON)…",
      style: "width:100%;min-height:130px;background:#1c1a24;color:#f4f2f8;border:1px solid #3a3646;border-radius:14px;padding:12px;font:13px 'Geist Mono',ui-monospace,monospace"
    });
    var archivo = el("input", { type: "file", accept: ".json,application/json,text/plain", style: "display:none",
      onchange: function () {
        var f = archivo.files && archivo.files[0];
        if (!f) return;
        f.text().then(function (t) { area.value = t; msg.textContent = "Archivo cargado. Revisá y tocá Restaurar."; });
      } });
    var confirmando = false;
    var btnRestaurar;

    function boton(txt, estilo, fn) {
      return el("button", { type: "button", onclick: fn,
        style: "height:52px;border-radius:999px;border:1px solid #3a3646;background:#24222d;color:#f4f2f8;font:600 15px Manrope,system-ui,sans-serif;padding:0 18px;" + (estilo || "") }, [txt]);
    }

    var btnDescargar = boton("Descargar respaldo (.json)", "", function () {
      if (!actual) { msg.textContent = "Todavía no hay datos guardados para descargar."; return; }
      var contenido = actual;
      try { contenido = JSON.stringify({ app: "entreno-prototipo", exportedAt: new Date().toISOString(), data: JSON.parse(actual) }, null, 2); } catch (e) {}
      var blob = new Blob([contenido], { type: "application/json" });
      var url = URL.createObjectURL(blob);
      var a = el("a", { href: url, download: "entreno-respaldo-" + hoy() + ".json" });
      document.body.append(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
      msg.textContent = "Listo. En iPhone elegí “Guardar en Archivos” o mandátelo por mail/WhatsApp.";
    });

    btnRestaurar = boton("Restaurar", "background:#ff7eb6;color:#0b0a10;border-color:#ff7eb6", function () {
      var r = validar(area.value.trim());
      if (r.error) { msg.textContent = r.error; confirmando = false; btnRestaurar.textContent = "Restaurar"; return; }
      var m = (r.data.history || []).length;
      if (!confirmando) {
        confirmando = true;
        btnRestaurar.textContent = "Sí, reemplazar mis datos";
        msg.textContent = "Esto reemplaza lo que hay en este teléfono (" + n + " entrenamientos) por el respaldo (" + m + " entrenamientos). Tocá de nuevo para confirmar.";
        return;
      }
      try {
        localStorage.setItem(KEY, JSON.stringify(r.data));
        msg.textContent = "Respaldo restaurado. Recargando…";
        setTimeout(function () { location.reload(); }, 400);
      } catch (e) {
        msg.textContent = "No se pudo guardar en este navegador.";
      }
    });

    var cerrar = function () { overlay.remove(); };
    var panel = el("div", { role: "dialog", "aria-modal": "true", "aria-label": "Respaldo",
      style: "width:100%;max-width:480px;background:#15141b;border:1px solid #3a3646;border-radius:24px 24px 0 0;padding:20px 16px calc(env(safe-area-inset-bottom,0px) + 20px);display:flex;flex-direction:column;gap:12px;font-family:Manrope,system-ui,sans-serif;color:#f4f2f8" }, [
      el("h2", { style: "margin:0;font-size:20px;font-weight:800" }, ["Respaldo"]),
      el("p", { style: "margin:0;color:#c9c4d6;font-size:14px;line-height:1.45" }, ["Tenés " + n + " entrenamientos guardados en este teléfono. Descargá una copia de vez en cuando, o restaurá una que guardaste antes."]),
      btnDescargar,
      el("div", { style: "height:1px;background:#3a3646;margin:4px 0" }, []),
      area,
      boton("Elegir archivo de respaldo…", "", function () { archivo.click(); }),
      archivo,
      btnRestaurar,
      msg,
      boton("Cerrar", "background:transparent", cerrar)
    ]);
    var overlay = el("div", { id: "entreno-respaldo",
      style: "position:fixed;inset:0;z-index:9999;background:rgba(11,10,16,.72);display:flex;align-items:flex-end;justify-content:center",
      onclick: function (e) { if (e.target === overlay) cerrar(); } }, [panel]);
    document.body.append(overlay);
  }

  window.entrenoRespaldo = abrir;
})();
