# Contexto

Sitio web del Challenge JAR (desafío de comportamiento robótico con una tarea a revelar) para la JAR 2026 — Jornada Argentina de Robótica (Rosario, 3 al 6 de noviembre), organizado por el AIR Club UdeSA. Es un sitio estático en Astro con información del desafío, guía de setup y workshops asincrónicos, deployeado a GitHub Pages.

Ecosistema de 3 repos de la org [AIRclub-UdeSA](https://github.com/AIRclub-UdeSA):

- [`yahboom_rosmaster`](https://github.com/AIRclub-UdeSA/yahboom_rosmaster): simulador / gemelo digital del ROSMASTER X3 (fork de automaticaddison adaptado a Humble + Gazebo Fortress).
- `jar_site` (este repo): el sitio web.
- [`jar_workshops`](https://github.com/AIRclub-UdeSA/jar_workshops): código de los workshops semanales.

# Stack y decisiones tomadas

- Astro puro, sin framework de UI ni Tailwind ni Starlight: decisión deliberada para tener control total del diseño.
- Identidad visual: **"Black Void & Sculptural Scale"** (estilo Dala / Linear / Mission Control). Canvas negro profundo (`#050807` / `#000000`), sin cajas grises repetitivas; elementos flotando sobre el vacío con espaciado generoso y separadores hairline de 1px (`rgba(255, 255, 255, 0.07)`).
- Tipografía: Space Grotesk (display a gran escala con tracking ajustado `-0.035em`), Archivo (cuerpo ligero y legible) y JetBrains Mono (etiquetas de sistema, telemetría y terminales).
- Acentos cromáticos: Verde `#4ade80` como acento funcional primario (color del ROSMASTER, indicador de estados activos y telemetría viva) y Ámbar `#fbbf24` como secundario (callouts de misión y avisos).
- Dinámica de equipos: Postulación libre y gratuita, sin límite de integrantes por equipo; selección previa por cupos físicos en pista. Al menos un integrante (capitán/representante) debe viajar a Rosario.
- Tema único oscuro: no hay toggle ni tema claro. Ver `src/styles/global.css` — los tokens CSS variables están al inicio del archivo.
- Contenido 100% markdown vía la colección `docs`. El shell (nav, sidebar, footer) son componentes propios en `src/components/`.
- Solo español rioplatense con voseo. Sin emojis.

# Estructura

- `src/pages/`: landing (`index.astro`, con visor 3D) + `[...slug].astro` que sirve los docs.
- `src/layouts/`: layouts Base y Doc.
- `src/components/`: Nav, Footer, Sidebar.
- `src/config/site.ts`: navegación del sidebar (secciones fijas; los workshops se autogeneran desde archivos `semana-*.md`) y metadatos.
- `src/content/docs/`: contenido markdown en subcarpetas `setup/`, `workshops/`.
- `src/templates/`: plantillas fuera de la colección (ej.: `plantilla-semana.md` para nuevas semanas).
- `src/styles/global.css`: design system.
- `public/models/rosmaster/`: URDF + meshes para el visor 3D.
- `scripts/sync-robot.sh`: regenera el modelo 3D desde un workspace ROS local.

# Confidencialidad

**No revelar la temática del desafío (búsqueda y rescate, víctimas, conos) en ningún contenido público hasta que el club lo anuncie oficialmente.** Usar lenguaje genérico: "desafío de comportamiento robótico", "una tarea que se revelará en la JAR". La carpeta `src/content/docs/competencia/` se volverá a agregar cuando se revele la temática.

# Convenciones de contenido

- Frontmatter schema: `title` requerido, `description` opcional, `status`: `listo` | `proximamente` (default `listo`). Con `status: proximamente` se muestra un badge "Próximamente" y un punto punteado en el sidebar.
- Links entre páginas markdown SIEMPRE relativos (`./x/` o `../seccion/x/`), porque el sitio vive bajo `/jar_site`.
- Archivos nuevos de workshop: prefijo `semana-NN-` con dos dígitos → entran solos al sidebar, ordenados alfabéticamente.
- Comandos de código siempre probados para Ubuntu 22.04 + ROS 2 Humble + Gazebo Fortress.
- Si agregás estilos, respetá los tokens existentes de `src/styles/global.css`. El sitio es dark-only: no hay tema claro que probar.

# Modelo 3D del hero

`public/models/rosmaster/` se regenera con `scripts/sync-robot.sh` desde un workspace ROS local (`~/Documents/rosmaster_ws`). El visor usa three.js + urdf-loader en `src/pages/index.astro`, con lazy load vía IntersectionObserver y respeto por `prefers-reduced-motion`. Las meshes pesan ~32MB: queda pendiente optimizarlas.

# Verificación obligatoria

Antes de dar por terminada cualquier tarea:

```bash
npm run check && npm run build
```

sin errores. No commitear nunca `node_modules/`, `dist/` ni `.astro/`.

El backlog de tareas pendientes vive en `TODO.md` — consultarlo antes de proponer trabajo nuevo y mantenerlo actualizado al cerrar tareas.

# Deploy

Automático en push a `main` vía GitHub Actions (`.github/workflows/deploy.yml`). `site` y `base` en `astro.config.mjs` apuntan a `https://airclub-udesa.github.io/jar_site` — cambiarlos solo si cambia dónde se hostea el sitio.
