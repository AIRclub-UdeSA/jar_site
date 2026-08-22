# Contexto

Sitio web del Desafío SAR (búsqueda y rescate autónomo) para la JAR 2026 — Jornada Argentina de Robótica (Rosario, 3 al 6 de noviembre), organizado por el AIR Club UdeSA. Es un sitio estático en Astro con información de la competencia, guía de setup y workshops asincrónicos, deployeado a GitHub Pages.

Ecosistema de 3 repos de la org [AIRclub-UdeSA](https://github.com/AIRclub-UdeSA):

- [`yahboom_rosmaster`](https://github.com/AIRclub-UdeSA/yahboom_rosmaster): simulador / gemelo digital del ROSMASTER X3 (fork de automaticaddison adaptado a Humble + Gazebo Fortress).
- `jar_site` (este repo): el sitio web.
- [`jar_workshops`](https://github.com/AIRclub-UdeSA/jar_workshops): código de los workshops semanales.

# Stack y decisiones tomadas

- Astro puro, sin framework de UI ni Tailwind ni Starlight: decisión deliberada para tener control total del diseño. El look replica el sistema del sitio del club: paleta crimson `#a40c4c`, Syne para display, Outfit para body, JetBrains Mono para código. Ver `src/styles/global.css` — los tokens CSS variables están al inicio del archivo; dark mode vía `html[data-theme='dark']`.
- Contenido 100% markdown vía la colección `docs`. El shell (nav, sidebar, footer) son componentes propios en `src/components/`.
- Solo español rioplatense con voseo. Sin emojis.

# Estructura

- `src/pages/`: landing (`index.astro`, con visor 3D) + `[...slug].astro` que sirve los docs.
- `src/layouts/`: layouts Base y Doc.
- `src/components/`: Nav, Footer, Sidebar.
- `src/config/site.ts`: navegación del sidebar (secciones fijas; los workshops se autogeneran desde archivos `semana-*.md`) y metadatos.
- `src/content/docs/`: contenido markdown en subcarpetas `competencia/`, `setup/`, `workshops/`.
- `src/templates/`: plantillas fuera de la colección (ej.: `plantilla-semana.md` para nuevas semanas).
- `src/styles/global.css`: design system.
- `public/models/rosmaster/`: URDF + meshes para el visor 3D.
- `scripts/sync-robot.sh`: regenera el modelo 3D desde un workspace ROS local.

# Convenciones de contenido

- Frontmatter schema: `title` requerido, `description` opcional, `status`: `listo` | `proximamente` (default `listo`). Con `status: proximamente` se muestra un badge "Próximamente" y un punto punteado en el sidebar.
- Links entre páginas markdown SIEMPRE relativos (`./x/` o `../seccion/x/`), porque el sitio vive bajo `/jar_site`.
- Archivos nuevos de workshop: prefijo `semana-NN-` con dos dígitos → entran solos al sidebar, ordenados alfabéticamente.
- Comandos de código siempre probados para Ubuntu 22.04 + ROS 2 Humble + Gazebo Fortress.
- Si agregás estilos, respetá los tokens existentes de `src/styles/global.css` y probá ambos temas (claro y oscuro).

# Modelo 3D del hero

`public/models/rosmaster/` se regenera con `scripts/sync-robot.sh` desde un workspace ROS local (`~/Documents/rosmaster_ws`). El visor usa three.js + urdf-loader en `src/pages/index.astro`, con lazy load vía IntersectionObserver y respeto por `prefers-reduced-motion`. Las meshes pesan ~32MB: queda pendiente optimizarlas.

# Verificación obligatoria

Antes de dar por terminada cualquier tarea:

```bash
npm run check && npm run build
```

sin errores. No commitear nunca `node_modules/`, `dist/` ni `.astro/`.

# Deploy

Automático en push a `main` vía GitHub Actions (`.github/workflows/deploy.yml`). `site` y `base` en `astro.config.mjs` apuntan a `https://airclub-udesa.github.io/jar_site` — cambiarlos solo si cambia dónde se hostea el sitio.
