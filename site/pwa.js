/* Entreno · registro del service worker y pedido de almacenamiento persistente */
(function () {
  "use strict";
  if (navigator.storage && navigator.storage.persist) {
    navigator.storage.persisted().then(function (p) { if (!p) navigator.storage.persist(); }).catch(function () {});
  }
  if (!("serviceWorker" in navigator)) return;
  window.addEventListener("load", function () {
    navigator.serviceWorker.register("./sw.js", { scope: "./" }).then(function (reg) {
      // Buscar actualizaciones cada vez que la app vuelve a primer plano
      document.addEventListener("visibilitychange", function () {
        if (document.visibilityState === "visible") reg.update().catch(function () {});
      });
    }).catch(function () {});
  });
})();
