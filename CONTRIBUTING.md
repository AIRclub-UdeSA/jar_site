# Contribuir a jar_site

Gracias por estar acá. `jar_site` es el sitio oficial del **Challenge JAR**
del AIR Club UdeSA — la puerta de entrada para cada equipo que compite en
JAR 2026 (Jornada Argentina de Robótica, Rosario). Ahí viven el desafío, la
guía de setup y los workshops semanales. Mejora cuando más gente lo revisa,
lo corrige y lo extiende.

## Cómo empezar

- Node >= 22.12

```bash
git clone https://github.com/AIRclub-UdeSA/jar_site.git
cd jar_site
npm install
npm run dev
```

`astro.config.mjs` define `base: '/jar_site'`, así que el sitio se sirve
bajo esa ruta también en local: http://localhost:4321/jar_site/

Antes de abrir un PR, corré los chequeos de tipos y contenido:

```bash
npm run check
```

## Buenas primeras contribuciones

- 📝 **Agregar un workshop nuevo.** Copiá `src/templates/plantilla-semana.md`
  a `src/content/docs/workshops/semana-NN-slug.md` y seguí la guía en
  [Agregar un workshop semanal](README.md#agregar-un-workshop-semanal) del
  README. El código correspondiente va en
  [`jar_workshops`](https://github.com/AIRclub-UdeSA/jar_workshops).
- 🎨 **Mantener el patrón editorial.** Las semanas publicadas siguen una
  misma estructura (resultado primero, preparación escaneable, teoría solo
  cuando ayuda a ejecutar, artefactos visuales únicamente cuando explican
  algo). Si encontrás una semana que no la sigue, es una buena oportunidad
  de alinearla con el resto.
- 🔗 **Sincronizar contenido con `jar_workshops`.** Los README de cada
  semana en `jar_workshops` y las páginas acá deberían decir lo mismo. Si
  cambia uno, conviene revisar el otro.
- ♿ **Accesibilidad y mobile.** El sitio usa componentes semánticos propios
  (`doc-practice-plate`, `doc-preflight`, etc.) — revisar que se vean bien
  en mobile y con lector de pantalla es siempre bienvenido.

## Estructura del repo

Ver [Estructura del repo](README.md#estructura-del-repo) en el README.

## Estilo de código y contenido

- TypeScript/Astro: seguí la estructura existente en `src/components/` y
  `src/layouts/` antes de inventar un patrón nuevo.
- Contenido de workshops: markdown en `src/content/docs/workshops/`,
  siguiendo la estructura de `src/templates/plantilla-semana.md` — sección
  "La práctica" con resultado y datos técnicos reales, "Antes de empezar"
  como lista de pasos, teoría mínima, y comandos de terminal con
  `source ~/rosmaster_ws/install/setup.bash` en ruta absoluta.
- Los links a documentación externa (ROS 2, OpenCV) van a la versión
  vigente de cada doc — para ROS 2 eso es `docs.ros.org/en/lyrical/...`,
  salvo en la guía de instalación, que está pineada a Humble porque es la
  versión que corren los robots del club.
- Preferí commits chicos y revisables.

## Pull requests

La rama `main` está protegida en GitHub (branch protection rule, classic).
Todo cambio a `main` tiene que pasar por un pull request:

1. Creá una branch para tu cambio (`git checkout -b feature/mi-cambio`) y
   subila.
2. Antes de abrir el PR, corré `npm run check` y confirmá que el build
   (`npm run build`) no rompa.
3. Se necesita al menos 1 aprobación de otra persona (distinta del autor)
   antes de poder mergear.
4. Resolvé todos los comentarios de revisión antes de mergear.
5. Si se suben commits nuevos después de una aprobación, esa aprobación se
   invalida y hay que volver a pedir revisión.
6. El último commit del PR también tiene que estar aprobado por alguien
   distinto de quien lo subió.
7. No se puede pushear directo a `main`, ni siquiera los admins del repo
   pueden saltearse estas reglas.

## Reglas generales

- Este sitio es lo primero que ve cada equipo de JAR 2026 — priorizá
  claridad sobre completitud.
- Cambios al contenido de un workshop ya publicado afectan a todos los
  equipos que lo están cursando en simultáneo; si el cambio altera el
  comportamiento esperado (un comando, un default, un link), avisá en la
  descripción del PR.
- Sé buena onda. Asumí buena fe, mantené todo constructivo.
