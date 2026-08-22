# TODO — Challenge JAR

Backlog compartido para quienes sigan trabajando en el sitio. Antes de arrancar: leer `AGENTS.md` (stack, convenciones y reglas de confidencialidad). Antes de pushear cualquier cambio: `npm run check && npm run build` sin errores.

## Contenido

- [ ] **Revisar todos los textos** — recorrer landing + docs puliendo redacción (rioplatense, voseo). Los stubs tienen blockquotes `> TODO:` marcando lo pendiente de definición.
- [ ] **Bloque de info de la JAR** — reemplazar el strip de "próximo evento" por un bloque con qué es la JAR, cuándo y dónde (Rosario, 3–6 nov 2026). El concepto "countdown a un evento" no aporta acá: el sitio es exclusivo del challenge. Está en `src/pages/index.astro` (clase `.strip`).
- [ ] **Sección "Acerca de nosotros"** — párrafo corto sobre el AIR Club UdeSA con links a la página del club (`SITE.orgUrl`) y redes cuando existan. Al pie del landing, simple y directo.
- [ ] **Setup family-friendly** — repasar `src/content/docs/setup/`: explicar cada concepto la primera vez que aparece, capturas de pantalla por paso, no asumir experiencia previa con ROS ni Linux.
- [ ] **Guía opcional con Docker** — página nueva en `setup/` para quien no tenga Ubuntu 22.04 nativo. Validar que el simulador funcione dentro del contenedor antes de documentar los comandos.
- [ ] **Reestructurar workshops** — hoy el sidebar ordena por nombre de archivo (`semana-NN-*`). Si se suelta esa convención: agregar campo `order` al schema de `src/content.config.ts`, usarlo en `Sidebar.astro` y actualizar `AGENTS.md` para que quede documentado.
- [ ] **Escribir los dos primeros workshops** — talkers/listeners y zigzag mecanum. Estructura sugerida en `src/templates/plantilla-semana.md` (renombra el template si cambia la convención).
- [ ] **Cuando se revele la temática** — volver a agregar `docs/competencia/` (reglas, robot y mapa, puntuación) y conectarlo al landing. Hasta entonces, nada público: ver Confidencialidad en `AGENTS.md`.

## Diseño

- [ ] **Favicon con el ROSMASTER** — hoy `public/favicon.svg` es una marca abstracta. Generar una imagen del robot (render del URDF o foto recortada) y exportarla chica. Si se cambia, revisar también los SVG inline de `Nav.astro` y `Footer.astro` para mantener coherencia.
- [ ] **Capturas del simulador** — screenshots/GIFs de Gazebo y RViz corriendo, para el landing y el setup. Van en `public/` y se referencian relativo desde los markdown.
- [ ] **Social preview** — imagen OG (`public/og.png`, 1200×630) + `<meta property="og:image">` en `Base.astro`. La misma imagen sirve de banner del repo (Settings → Social preview).

## Técnica

- [ ] **Optimizar meshes 3D** — ~32MB hoy (`public/models/rosmaster/meshes/`). Decimate en Blender apuntando a <10MB y regenerar con `scripts/sync-robot.sh`. Impacta directo en la carga del hero, sobre todo en mobile.
- [ ] **Revisar la estructura superior del URDF** — en el visor sobresale un mástil con caños sobre el chasis. Confirmar que es parte real del xacro y no algo que convenga ocultar para la web (el loader permite ocultar links puntuales).
- [ ] **Página 404** — crear `src/pages/404.astro` amigable; GitHub Pages la sirve automáticamente si está en el build.
- [ ] **sitemap + robots.txt** — integración `@astrojs/sitemap` y `robots.txt` en `public/`.
- [x] **Warning de THREE.Clock** — reemplazado `THREE.Clock` por `performance.now()` en `index.astro` para eliminar warnings de deprecación y optimizar la animación de las ruedas.

## Comunidad e inscripción

- [ ] **Medio de inscripción** — hoy no existe forma de anotarse: definir canal (mail, formulario, link) y sumar CTA visible en el landing.
- [ ] **FAQ** — requisitos técnicos, nivel esperado, tamaño de equipos, si hace falta viajar. Reduce consultas repetidas y sirve de contenido para el landing.

## Repos e infra

- [ ] **Crear el repo `jar_workshops`** — el footer y varias páginas ya linkean a `https://github.com/AIRclub-UdeSA/jar_workshops` y da 404. Crearlo con estructura de código por workshop y mantener sincronizada la URL en `SITE.workshopsRepo` (`src/config/site.ts`).
- [ ] **Probar en mobile real** — el visor usa OrbitControls táctil; validar performance y gestos en un celular físico (motivo más para decimar meshes).
