# TODO — Challenge JAR

Backlog compartido para quienes sigan trabajando en el sitio. Antes de arrancar: leer `AGENTS.md` (stack, convenciones y reglas de confidencialidad). Antes de pushear cualquier cambio: `npm run check && npm run build` sin errores.

## Contenido

- [ ] **Revisar todos los textos** — recorrer landing + docs puliendo redacción (rioplatense, voseo). Los stubs tienen blockquotes `> TODO:` marcando lo pendiente de definición.
- [x] **Pase de redacción natural en la landing** — reemplazo de “flota”, “gemelo digital”, “hardware físico” y otros giros rígidos por un recorrido más directo entre simulador, competencia y JAR; requisitos de selección y presencialidad explicitados en la postulación.
- [x] **Bloque de info de la JAR** — sección monumental dedicada a la JAR 2026 (Rosario, 3–6 nov 2026) con titular geográfico, split descriptivo y links directos a `jar.net.ar` y a la UNR.
- [x] **Sección "Acerca de nosotros"** — bloque de manifiesto del AIR Club UdeSA con declaración de misión institucional y links al sitio oficial y al GitHub de la organización.
- [ ] **Setup family-friendly** — repasar `src/content/docs/setup/`: explicar cada concepto la primera vez que aparece, capturas de pantalla por paso, no asumir experiencia previa con ROS ni Linux.
- [ ] **Guía opcional con Docker** — página nueva en `setup/` para quien no tenga Ubuntu 22.04 nativo. Validar que el simulador funcione dentro del contenedor antes de documentar los comandos.
- [ ] **Reestructurar workshops** — hoy el sidebar ordena por nombre de archivo (`semana-NN-*`). Si se suelta esa convención: agregar campo `order` al schema de `src/content.config.ts`, usarlo en `Sidebar.astro` y actualizar `AGENTS.md` para que quede documentado.
- [x] **Escribir los dos primeros workshops** — talkers/listeners y zigzag mecanum. Hechos y marcados como `listo`; el código vive en [`jar_workshops`](https://github.com/AIRclub-UdeSA/jar_workshops).
- [ ] **Escribir el workshop de la semana 03 (SLAM y mapeo)** — `src/content/docs/workshops/semana-03-slam-mapeo.md` sigue en `proximamente` con tres bloques `> TODO:` abiertos: dependencias de la semana, mini-proyecto con `slam_toolbox` sobre los datos del LiDAR y qué mirar en RViz mientras se arma el mapa. Estructura sugerida en `src/templates/plantilla-semana.md`; el código va al repo `jar_workshops` como en las semanas 01 y 02.
- [ ] **Cuando se revele la temática** — volver a agregar `docs/competencia/` (reglas, robot y mapa, puntuación) y conectarlo al landing. Hasta entonces, nada público: ver Confidencialidad en `AGENTS.md`.

## Diseño

- [ ] **Cerrar capítulo scroll de Donatello y artefacto del desafío** — Donatello permanece a la derecha entre hero y Plataforma, crece con un acercamiento progresivo mientras el contenido editorial cambia naturalmente a la izquierda y recupera el giro luego de la interacción. El RPLIDAR y la placa de topics fueron retirados; “El desafío” usa ahora un díptico editorial con grabaciones reales de Gazebo y RViz. La vista de Gazebo comienza en el segundo 5 y conserva el recorrido de cámara y el movimiento mecanum de la nueva captura, pendiente de revisión visual final.
- [x] **Pase editorial oscuro de la landing** — landing componentizada como journal técnico, jerarquía tipográfica sin chrome decorativo, postulación como única banda saturada, CSS aislado de los docs, shell compartido simplificado y visor 3D adaptativo con contratos de movimiento reducido y gestos mobile/desktop verificados en emulación.
- [x] **Rediseño radical 'Black Void & Sculptural Scale' (Landing Page)** — transformación integral inspirada en Dala/Linear: eliminación de cajas grises genéricas, split asimétrico para el desafío y telemetría de specs, stepper continuo de 4 fases con números monolíticos, lista interactiva de recursos, acordeón hairline para FAQ y bloque de postulación monumental.
- [x] **Revisión y pulido estético en Setup y Workshops** — trasladada la estética 'Black Void & Sculptural Scale' a la documentación: layout `Doc.astro` con eyebrows técnicos y badges ámbar, sidebar con hairlines y dots de estado, callouts sutiles y bloques de código con chrome sobrio en JetBrains Mono. Títulos numéricos (`01`, `02`, `03 · Próximamente`) sin ataduras a semanas fijas.
- [x] **Favicon con el ROSMASTER** — icono SVG vectorial del ROSMASTER X3 CAD (chasis verde, ruedas mecanum, cámara RGB-D y LiDAR) en `public/favicon.svg` y sincronizado en los logos inline de `Nav.astro` y `Footer.astro`.
- [x] **Rediseño hero fullscreen "mission control"** — hero interactivo 100vh con micro-animaciones escalonadas (`anim-fade-up`), badge del evento con glassmorphism, botones con glow verde, encuadre 3D a la derecha en desktop mediante `camera.setViewOffset`, y zoom con rueda condicional al click presionado para no bloquear el scroll de la página.
- [ ] **Capturas del simulador** — screenshots/GIFs de Gazebo y RViz corriendo, para el landing y el setup. Van en `public/` y se referencian relativo desde los markdown.
- [ ] **Social preview** — imagen OG (`public/og.png`, 1200×630) + `<meta property="og:image">` en `Base.astro`. La misma imagen sirve de banner del repo (Settings → Social preview).

## Técnica

- [x] **Optimizar meshes 3D e integrar modelo CAD unificado** — integró el modelo CAD unificado de alta fidelidad en `public/models/rosmaster_unified.glb` (7.8 MB, bajando de ~32 MB de mallas URDF dispersas), con ajuste de la cámara RGB-D (-1 cm Z) para resolver la interferencia con el bulón de fijación.
- [ ] **Revisar la estructura superior del URDF** — en el visor sobresale un mástil con caños sobre el chasis. Confirmar que es parte real del xacro y no algo que convenga ocultar para la web (el loader permite ocultar links puntuales).
- [ ] **Página 404** — crear `src/pages/404.astro` amigable; GitHub Pages la sirve automáticamente si está en el build.
- [ ] **sitemap + robots.txt** — integración `@astrojs/sitemap` y `robots.txt` en `public/`.
- [x] **Warning de THREE.Clock y optimización del visor** — reemplazo de APIs obsoletas, zoom condicional (`isMouseDown`), centrado y escalado automático optimizado.

## Comunidad e inscripción

- [x] **Convocatoria y postulación de equipos** — formulario de postulación en Google Forms (`https://forms.gle/2zkW6gwJQptUzbXn6`) con proceso de selección por cupos físicos en pista, participación gratuita y sin límite de integrantes.
- [x] **FAQ** — preguntas frecuentes interactivas con acordeón hairline despojado cubriendo requisitos técnicos, proceso de selección, gratuidad, presencia del capitán en Rosario y autonomía de herramientas.

## Repos e infra

- [ ] **Crear el repo `jar_workshops`** — el footer y varias páginas ya linkean a `https://github.com/AIRclub-UdeSA/jar_workshops` y da 404. Crearlo con estructura de código por workshop y mantener sincronizada la URL en `SITE.workshopsRepo` (`src/config/site.ts`).
- [ ] **Probar en mobile real** — el visor usa OrbitControls táctil; validar performance y gestos en un celular físico (motivo más para decimar meshes).
