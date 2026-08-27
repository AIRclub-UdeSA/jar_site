# jar_site

[![Ubuntu 22.04](https://img.shields.io/badge/Ubuntu-22.04-orange)](https://releases.ubuntu.com/22.04/)
[![ROS 2 Humble](https://img.shields.io/badge/ROS%202-Humble-blue)](https://docs.ros.org/en/humble/)
[![Gazebo Fortress](https://img.shields.io/badge/Gazebo-Fortress-informational)](https://gazebosim.org)
[![Astro](https://img.shields.io/badge/Astro-7-purple?logo=astro&logoColor=white)](https://astro.build)

Sitio oficial del **Challenge JAR**, el desafío de comportamiento robótico con una tarea a revelar del AIR Club UdeSA para la JAR 2026 — Jornada Argentina de Robótica, Rosario, 3 al 6 de noviembre. Cada equipo programa el comportamiento de un ROSMASTER X3 con ruedas mecanum provisto por el club, apoyándose en el simulador propio en Gazebo y en los workshops asincrónicos semanales. Acá vas a encontrar toda la información del desafío, la guía de setup para dejar tu entorno listo y los workshops.

## Ecosistema del desafío

| Repositorio | Qué es |
| --- | --- |
| [`yahboom_rosmaster`](https://github.com/AIRclub-UdeSA/yahboom_rosmaster) | Simulador / gemelo digital del ROSMASTER X3. Fork del repo de automaticaddison adaptado a ROS 2 Humble + Gazebo Fortress |
| [`jar_site`](https://github.com/AIRclub-UdeSA/jar_site) | Este repo: el sitio web con la competencia, el setup y los workshops |
| [`jar_workshops`](https://github.com/AIRclub-UdeSA/jar_workshops) | Código de los workshops semanales |

## Estructura del repo

```text
jar_site/
├── src/
│   ├── pages/                  # Landing con visor 3D + ruta dinámica que sirve los docs
│   ├── layouts/                # Layouts Base y Doc
│   ├── components/             # Nav, Footer, Sidebar
│   ├── config/site.ts          # Navegación del sidebar y metadatos del sitio
│   ├── content/docs/           # Contenido en markdown: setup/, workshops/
│   ├── templates/              # plantilla-semana.md para crear nuevas semanas
│   └── styles/global.css       # Design system: tokens, tipografías y temas
├── public/models/rosmaster/    # URDF + meshes del robot para el visor 3D del landing
├── scripts/sync-robot.sh       # Regenera el modelo 3D desde un workspace ROS local
└── .github/workflows/deploy.yml # Deploy automático a GitHub Pages
```

## Desarrollo local

Necesitás Node >= 22.12.

```bash
npm install
```

Levantás el sitio en desarrollo:

```bash
npm run dev
```

Corrés los chequeos de tipos y contenido:

```bash
npm run check
```

Generás el build y lo previsualizás:

```bash
npm run build
npm run preview
```

Ojo: `astro.config.mjs` define `base: '/jar_site'`, así que el sitio se sirve bajo esa ruta también en local (`http://localhost:4321/jar_site/`).

## Agregar un workshop semanal

1. Copiá `src/templates/plantilla-semana.md` a `src/content/docs/workshops/semana-NN-slug.md`. El `NN` va con dos dígitos porque define el orden (ej.: `semana-03-percepcion.md`).
2. Editá el `title` y la `description` del frontmatter.
3. Cuando el contenido esté completo, cambiá `status` a `listo` (mientras esté en `proximamente` se muestra un badge "Próximamente" en el sitio).
4. La entrada del sidebar se genera sola, ordenada alfabéticamente por nombre de archivo.

Nota: el código de cada workshop va al repo [`jar_workshops`](https://github.com/AIRclub-UdeSA/jar_workshops). La página del sitio explica el contenido y enlaza al código.

## Regenerar el modelo 3D

El visor del landing carga el URDF y las meshes desde `public/models/rosmaster/`. Si cambia el URDF del robot, regenerá esos archivos con:

```bash
./scripts/sync-robot.sh [ruta/al/rosmaster_ws]
```

Requiere tener ROS 2 Humble instalado y el workspace compilado. Solo hace falta correrlo si cambia el URDF del robot; el resto del tiempo podés ignorarlo.

## Deploy

Cada push a `main` dispara el workflow `.github/workflows/deploy.yml`, que hace build y publica el sitio automáticamente.

La primera vez hay que configurar GitHub: **Settings → Pages → Source: GitHub Actions**.

URL final: https://airclub-udesa.github.io/jar_site/

## Contribuir

La rama `main` está protegida en GitHub (branch protection rule, classic). Todo cambio a `main` tiene que pasar por un pull request:

1. Creá una branch para tu cambio (`git checkout -b feature/mi-cambio`)
2. Subí la branch y abrí un PR contra `main`
3. Se necesita al menos 1 aprobación de otra persona (distinta del autor) antes de poder mergear
4. Resolvé todos los comentarios de revisión antes de mergear
5. Si se suben commits nuevos después de una aprobación, esa aprobación se invalida y hay que volver a pedir revisión
6. El último commit del PR también tiene que estar aprobado por alguien distinto de quien lo subió
7. No se puede pushear directo a `main`, ni siquiera los admins del repo pueden saltearse estas reglas
