# Contexto

Sitio web del Challenge JAR (desafío de comportamiento robótico con una tarea a revelar) para la JAR 2026 — Jornada Argentina de Robótica (Rosario, 3 al 6 de noviembre), organizado por el AIR Club UdeSA. Es un sitio estático en Astro con información del desafío, guía de setup y workshops asincrónicos, deployeado a GitHub Pages.

Ecosistema de 3 repos de la org [AIRclub-UdeSA](https://github.com/AIRclub-UdeSA):

- [`yahboom_rosmaster`](https://github.com/AIRclub-UdeSA/yahboom_rosmaster): simulador del ROSMASTER X3 (fork de automaticaddison adaptado a Humble + Gazebo Fortress).
- `jar_site` (este repo): el sitio web.
- [`jar_workshops`](https://github.com/AIRclub-UdeSA/jar_workshops): código de los workshops semanales.

# Stack y decisiones tomadas

- Astro puro, sin framework de UI ni Tailwind ni Starlight: decisión deliberada para tener control total del diseño.
- Identidad visual: **"Black Void & Sculptural Scale"** (estilo Dala / Linear / Mission Control). Canvas negro profundo (`#050807` / `#000000`), sin cajas grises repetitivas; elementos flotando sobre el vacío con espaciado generoso y separadores hairline de 1px (`rgba(255, 255, 255, 0.07)`).
- La landing suma una capa de **journal técnico editorial**: la tipografía lleva la jerarquía y el chrome aparece solo cuando representa una acción o un estado real. Evitar HUDs, terminales decorativas, glows, marcos de visor, cards repetidas y etiquetas ornamentales.
- Tipografía: Space Grotesk (display a gran escala con tracking ajustado `-0.035em`), Archivo (cuerpo ligero y legible) y JetBrains Mono (etiquetas de sistema, telemetría y terminales).
- Acentos cromáticos: Verde `#4ade80` como acento funcional primario (color del ROSMASTER, indicador de estados activos y telemetría viva) y Ámbar `#fbbf24` como secundario (callouts de misión y avisos).
- Dinámica de equipos: Postulación libre y gratuita, sin límite de integrantes por equipo; selección previa por cupos físicos en pista. Al menos un integrante (capitán/representante) debe viajar a Rosario.
- Tema único oscuro: no hay toggle ni tema claro. Ver `src/styles/global.css` — los tokens CSS variables están al inicio del archivo.
- La documentación vive en markdown vía la colección `docs`; la landing usa componentes Astro con copy explícito. El shell (nav, sidebar, footer) son componentes propios en `src/components/`.
- Solo español rioplatense con voseo. Sin emojis.

# Estructura

- `src/pages/`: `index.astro` compone la landing y `[...slug].astro` sirve los docs.
- `src/layouts/`: layouts Base y Doc.
- `src/components/`: Nav, Footer, Sidebar y shell compartido.
- `src/components/docs/`: tabla de contenidos e índices editoriales generados desde la colección.
- `src/components/landing/`: capítulos de la landing (`LandingHero`, `DonatelloProfile`, `ChallengeOverview`, `ObservationPlate`, `Roadmap`, `EventDetails`, `Resources`, `ApplicationBand`, `Closing`).
- `src/config/site.ts`: navegación del sidebar (secciones fijas; los workshops se autogeneran desde archivos `semana-*.md`) y metadatos.
- `src/content/docs/`: contenido markdown en subcarpetas `setup/`, `workshops/`.
- `src/templates/`: plantillas fuera de la colección (ej.: `plantilla-semana.md` para nuevas semanas).
- `src/styles/global.css`: tokens, shell y estilos compartidos de documentación.
- `src/styles/landing.css`: estilos exclusivos de la landing, importados solo desde `index.astro`; prefijo de selectores `landing-`.
- `public/models/rosmaster_unified.glb`: modelo CAD optimizado que usa el visor actual.
- `public/models/rosmaster/`: URDF de referencia; ya no es el asset cargado por la landing.
- `public/media/`: videos y posters optimizados de Gazebo/RViz usados por `ObservationPlate`; `public/media/docs/` contiene figuras SVG propias de las guías.
- `scripts/sync-robot.sh`: regenera el modelo 3D desde un workspace ROS local.

# Confidencialidad

**No revelar la temática del desafío (búsqueda y rescate, víctimas, conos) en ningún contenido público hasta que el club lo anuncie oficialmente.** Usar lenguaje genérico: "desafío de comportamiento robótico", "una tarea que se revelará en la JAR". La carpeta `src/content/docs/competencia/` se volverá a agregar cuando se revele la temática.

# Convenciones de contenido

- Frontmatter schema: `title` requerido; `description`, `duration`, `outcome` y `prerequisites` opcionales; `level`: `inicial` | `intermedio` | `avanzado`; `status`: `listo` | `proximamente` (default `listo`). Los índices de Setup y Workshops consumen estos datos directamente de la colección, por lo que no se duplican a mano.
- Links entre páginas markdown SIEMPRE relativos (`./x/` o `../seccion/x/`), porque el sitio vive bajo `/jar_site`.
- Archivos nuevos de workshop: prefijo `semana-NN-` con dos dígitos → entran solos al sidebar, ordenados alfabéticamente.
- Comandos de código siempre probados para Ubuntu 22.04 + ROS 2 Humble + Gazebo Fortress.
- La tabla de interfaces del setup es un contrato orientado a participantes, no un volcado de `ros2 topic list`: conserva el RGB público `/cam_1/color/image_raw` y la nube procesada `/cam_1/depth/color/points`; no publicar profundidad cruda, topics bajo `/internal/`, bridges, watchdogs, ground truth ni odometrías de diagnóstico.
- Callouts Markdown admitidos: `[!NOTE]` (Nota), `[!CHECK]` (Comprobá esto), `[!WARNING]` (Atención) y `[!QUESTION]` (Para pensar). Se escriben como blockquotes y nunca deben contener información confidencial.
- Los fences usan el lenguaje real: `bash` se presenta como Terminal, `python` como Python y `text` como Salida esperada. No agregar hostnames ficticios, traffic lights ni chrome de terminal decorativo.
- Las figuras de documentación necesitan texto alternativo, caption, dimensiones y `loading="lazy"`. Los SVG code-native van en `public/media/docs/`, con fondo transparente y sin grillas, glow, HUD ni marcos ornamentales.
- Si agregás estilos, respetá los tokens existentes. El sitio es dark-only: no hay tema claro que probar. Los cambios exclusivos de landing van en `landing.css`; los de docs o shell compartido, en `global.css`.

# Tono y copy público

- Escribir como habla una persona del club: directo, claro, rioplatense y con voseo. Priorizar verbos cotidianos (`probar`, `ajustar`, `competir`, `poner a funcionar`) sobre formulaciones de brochure o sistema.
- En la landing decir **“simulador”**, no “gemelo digital”; decir **“robot”** o “robots”, no “flota”, salvo que la cantidad sea realmente el tema; evitar “hardware físico”, “pista real” y jerga de topics/contactos/fricción en el copy de difusión.
- La precisión técnica sigue siendo bienvenida en las fichas, guías y workshops: ROS 2 Humble, Gazebo Fortress, RViz 2, LiDAR, RGB-D, IMU y Mecanum son términos válidos cuando ayudan a entender o ejecutar algo.
- La landing debe contar el recorrido humano: trabajar desde la compu, probar en el simulador, iterar y competir en Rosario. No describir literalmente lo que el usuario ya está viendo en pantalla.
- Datos públicos aprobados: participación gratuita, sin límite de integrantes, selección previa por capacidad limitada y presencia obligatoria de al menos una persona del equipo en la JAR. La publicación de la consigna tiene como ventana objetivo pública **5 al 7 de octubre**.

# Landing actual

- Orden de capítulos: hero/Donatello → desafío/observación → Camino a Rosario → JAR → material abierto → postulación → FAQ/AIR Club.
- Donatello es el artefacto visual principal. `LandingHero.astro` mantiene un único canvas transparente para hero y “Conocé a Donatello”; en desktop queda sticky a la derecha y crece suavemente con el scroll mientras cambia el contenido editorial de la izquierda. No reintroducir caja negra, marco, círculo HUD, ticks ni traslados de salida/reentrada entre lados.
- En mobile no hay sticky prolongado: copy, robot y ficha técnica siguen el flujo natural. El robot nunca debe producir overflow, quedar cortado accidentalmente ni superponerse con el texto.
- La interacción 3D permite giro por drag, gesto horizontal táctil y zoom de rueda solo mientras se mantiene click. El scroll vertical común siempre gana. La autorrotación se pausa durante la interacción y luego vuelve; `prefers-reduced-motion` desactiva autorrotación y damping.
- `ChallengeOverview` usa `ObservationPlate`: un díptico editorial con grabaciones reales de Gazebo y RViz, sin terminal, placa de topics ni LiDAR 3D decorativo. No tiene botón de pausa visible; carga los videos al acercarse, los pausa fuera de vista/documento oculto y bajo movimiento reducido deja solo los posters.
- Los medios vigentes son `public/media/donatello-gazebo.webm` y `donatello-rviz.webm` con sus posters. La captura de Gazebo comienza en el segundo 5 de la grabación fuente para evitar el arranque ruidoso y conserva el movimiento mecanum.
- La postulación es la única banda saturada de conversión. El CTA principal del sitio sigue siendo “Postular equipo” / “Abrir formulario”.

# Modelo 3D del hero

El visor vive en `src/components/landing/LandingHero.astro` y usa three.js + `GLTFLoader` para cargar `public/models/rosmaster_unified.glb` (~7.6 MB). Three.js, OrbitControls, GLTFLoader y el modelo se cargan de forma diferida vía `IntersectionObserver`. El render se pausa fuera de vista o con el documento oculto y respeta `prefers-reduced-motion`.

`public/models/rosmaster/` y `scripts/sync-robot.sh` conservan el flujo de referencia desde un workspace ROS local (`~/Documents/rosmaster_ws`), pero la landing no carga actualmente el URDF. Si se vuelve a sincronizar el robot, mantener la corrección de cámara y verificar el encuadre completo en hero y Donatello antes de reemplazar el GLB.

# Documentación actual

- `Doc.astro` compone un manual técnico con lógica de dossier editorial. En mobile y tablet usa una columna con selector de sección superpuesto; desde `64rem` suma un único sidebar izquierdo y una portada asimétrica que reparte título y resumen. No hay rail derecho.
- La lectura narrativa se limita a unos `65ch`; código, tablas y figuras pueden ampliar el área técnica sin ensanchar el viewport. Código y tablas desplazan únicamente su propia superficie.
- El sidebar usa filas numeradas planas y hairlines. El verde marca ubicación o acción real; el ámbar se reserva para `proximamente` y advertencias.
- Las guías largas convierten los headings H2 de `render(entry)` en un índice numerado visible dentro del flujo, inmediatamente después del encabezado. Desde `48rem` se lee primero la columna izquierda completa y después la derecha. Los anchors funcionan sin JavaScript; el script solo agrega scrollspy, feedback de copiado y el cierre accesible del selector mobile.
- La duración se presenta como una indicación natural (`Calculá aprox. …`) junto al nivel; el resultado ocupa la columna de resumen y se distingue con una única regla verde, sin etiqueta ni caja propia. Los prerequisitos no se repiten en esta portada: cada guía los desarrolla en su sección “Antes de empezar”.
- Los índices de Setup y Workshops colocan su recorrido generado inmediatamente después del encabezado. Setup se organiza como tres guías y Workshops como un catálogo sincronizado por archivos `semana-NN-*`, título, metadata y estado.
- Los callouts se transforman durante el build mediante el plugin Sätteri local `src/markdown/callouts.mjs`.
- No reintroducir grilla global, tarjetas repetidas, acordeones dentro del flujo, HUDs, terminales ficticias ni el enlace “Editar en GitHub” al final de la documentación. En estas páginas mandan la lectura, la orientación y la ejecución de pasos.

# Verificación obligatoria

Antes de dar por terminada cualquier tarea:

```bash
npm run check && npm run build
```

sin errores. No commitear nunca `node_modules/`, `dist/` ni `.astro/`.

El backlog de tareas pendientes vive en `TODO.md` — consultarlo antes de proponer trabajo nuevo y mantenerlo actualizado al cerrar tareas.

# Deploy

Automático en push a `main` vía GitHub Actions (`.github/workflows/deploy.yml`). `site` y `base` en `astro.config.mjs` apuntan a `https://airclub-udesa.github.io/jar_site` — cambiarlos solo si cambia dónde se hostea el sitio.
