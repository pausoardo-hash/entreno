# Entreno

App personal de entrenamiento (PWA): registro de series, calculadora de cargas y temporizador con voz. Diseño E · Aura refinada.

**App:** https://pausoardo-hash.github.io/entreno/

## Cómo funciona

- Todo el contenido publicable está en `site/`. Cada cambio en `main` se publica solo con GitHub Actions (`.github/workflows/deploy.yml`).
- Los entrenamientos se guardan **solo en el teléfono** (localStorage). Este repositorio no contiene ni debe contener datos personales.
- Funciona sin conexión gracias al service worker (`site/sw.js`).
- Respaldo: en la app, *Copiar respaldo (JSON)* o *Descargar o restaurar respaldo*.

Fuentes Manrope y Geist Mono bajo SIL Open Font License (ver `site/fonts/`).
