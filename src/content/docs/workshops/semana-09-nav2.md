---
title: "09 · Nav2"
description: "Reemplazá, checkpoint por checkpoint, cada módulo manual de las semanas anteriores por el stack real de navegación de ROS 2."
status: listo
duration: "aprox. 90–120 min"
level: avanzado
outcome: "Al terminar, corriste el stack real de Nav2 (AMCL, costmaps, DWB, NavigateToPose) sobre el mismo laberinto de siempre y viste en vivo qué gana — y qué pierde — cada módulo manual de las semanas 03, 06, 07 y 08 al dejar de ser tuyo."
prerequisites:
  - "Setup completo"
  - "Workshop 06"
---

## La práctica

<section class="doc-practice-plate" aria-labelledby="la-práctica">
  <div class="doc-practice-intro">
    <p class="doc-practice-statement">Leer.<br />Correr.<br />Comparar.</p>
    <p class="doc-practice-note">Esta semana no pide código nuevo: Nav2 ya viene configurado para reemplazar, uno por uno, cada módulo manual que armaste.</p>
  </div>

  <dl class="doc-practice-facts">
    <div>
      <dt>Reemplaza</dt>
      <dd>AMCL (sem. 06), costmaps (sem. 03+07), DWB (sem. 03), <code>NavigateToPose</code> (sem. 08)</dd>
    </div>
    <div>
      <dt>Corre</dt>
      <dd><code>nav2_bringup</code> ya configurado — sin paquete propio ni <code>colcon build</code></dd>
    </div>
    <div>
      <dt>Arranca</dt>
      <dd>Con "2D Pose Estimate" en RViz, igual que semanas anteriores</dd>
    </div>
    <div>
      <dt>Gotcha</dt>
      <dd>Sin <code>RotateToGoal</code>, el robot no necesariamente termina mirando la orientación final del goal</dd>
    </div>
  </dl>
</section>

## Antes de empezar

<ol class="doc-preflight" aria-label="Preparación del workshop">
  <li>
    <span class="doc-preflight-index" aria-hidden="true">01</span>
    <div class="doc-preflight-copy">
      <h3>Semana 06 fresca</h3>
      <p>El Checkpoint 1 de hoy reemplaza exactamente el filtro de partículas manual de la <a href="../semana-06-localizacion/">semana 06</a> — la comparación solo tiene sentido si tenés claro cómo funcionaba tu propia versión. Las semanas 03, 07 y 08 aparecen en la comparación de los otros checkpoints, pero no hace falta tenerlas corriendo hoy.</p>
    </div>
  </li>
  <li>
    <span class="doc-preflight-index" aria-hidden="true">02</span>
    <div class="doc-preflight-copy">
      <h3>Nada para armar</h3>
      <p>A diferencia de semanas anteriores, no creás un paquete propio ni tocás config: <code>nav2_params.yaml</code> y el launch de esta semana ya están armados. Tu trabajo es leer esa configuración y correrla, no editarla.</p>
    </div>
  </li>
  <li>
    <span class="doc-preflight-index" aria-hidden="true">03</span>
    <div class="doc-preflight-copy">
      <h3>Chequeo</h3>
      <p>Confirmá que tu RViz tiene los botones <strong>"2D Pose Estimate"</strong> y <strong>"Nav2 Goal"</strong> en la barra de arriba — los vas a usar los cuatro checkpoints.</p>
    </div>
  </li>
</ol>

## Concepto mínimo

Todo lo que armaste hasta ahora —localización, evasión de obstáculos, detección de lo no mapeado, cobertura del mapa— era código propio, escrito a mano. [Nav2](https://docs.nav2.org/) es el stack de navegación estándar de ROS 2: resuelve los mismos problemas, pero como nodos configurables por parámetros en vez de scripts.

### Checkpoint 1 — AMCL reemplaza el filtro de partículas manual (sem. 06)

En semana 06 escribiste tu propio filtro de partículas: predicción, corrección contra un campo de verosimilitud, resampleo, todo a mano. [AMCL](https://docs.nav2.org/rolling/configuration_and_development/configuration_guide/others/configuring_amcl/) (*Adaptive Monte Carlo Localization*) es exactamente ese mismo algoritmo —las mismas tres etapas, el mismo campo de verosimilitud— empaquetado como un nodo de Nav2 que se configura por parámetros en vez de código.

<figure class="doc-figure">
  <img src="../../media/docs/semana-09-nav2/nav2_demo.gif" alt="Nube de partículas de AMCL en RViz contrayéndose alrededor de la pose real del robot después del &quot;2D Pose Estimate&quot;" width="640" height="349" style="width:640px;max-width:100%;" loading="lazy" />
  <figcaption class="doc-figcaption-wide">La nube arranca dispersa alrededor del click y se contrae a medida que AMCL converge a la pose real; el panel "Navigation 2" pasa de <code>Localization: unknown</code> a <code>active</code>.</figcaption>
</figure>

### Checkpoint 2 — Costmaps reemplazan evasión (sem. 03) y detección de no mapeado (sem. 07)

En semana 03 esquivabas obstáculos con una máquina de estados que leía el lidar y decidía girar o avanzar. En semana 07 comparabas ese mismo lidar contra el mapa estático para detectar lo que el mapa no tenía. Nav2 resuelve los dos problemas con la misma pieza, un **costmap**: una grilla que le pone un costo a cada celda en vez de que vos calcules distancias a mano. Un solo costmap no alcanza — Nav2 corre **dos**: el `global_costmap` (todo el mapa conocido, se actualiza una vez por segundo) y el `local_costmap` (una ventana de 3×3 m centrada en el robot, se actualiza 5 veces por segundo y solo ve lo que el lidar detecta *ahora*). Esa asimetría —local reactivo y de corto alcance, global estable y de mapa completo— es la misma separación entre "esquivar lo que tengo enfrente" y "saber qué hay en todo el mapa", ahora resuelta por arquitectura en vez de por dos nodos propios.

<figure class="doc-figure">
  <img src="../../media/docs/semana-09-nav2/nav2_pose_inicial_cp2.gif" alt="Click de &quot;2D Pose Estimate&quot; sobre el mapa en RViz, dando la pose inicial del robot antes de que arranquen a activarse los costmaps" width="640" height="336" style="width:640px;max-width:100%;" loading="lazy" />
  <figcaption class="doc-figcaption-wide">Recién con la pose inicial puesta arrancan a activarse los costmaps — antes de este click, el panel "Navigation 2" queda colgado en <code>unknown</code>.</figcaption>
</figure>

<figure class="doc-figure">
  <img src="../../media/docs/semana-09-nav2/nav2_costmap_demo.gif" alt="Costmap global (magenta) fijo sobre todo el laberinto mientras el robot lo recorre, con el costmap local y la nube de partículas de AMCL siguiéndolo en tiempo real" width="640" height="336" style="width:640px;max-width:100%;" loading="lazy" />
  <figcaption class="doc-figcaption-wide">El costmap global (magenta) se mantiene fijo sobre las paredes reales del mapa; el local marca un cuadrado de color casi al instante al acercarte y lo vuelve a limpiar en un par de segundos al alejarte.</figcaption>
</figure>

### Checkpoint 3 — DWB reemplaza la máquina de estados reactiva (sem. 03)

En semana 03 escribiste una máquina de estados a mano: si el lidar detecta algo cerca, girar; si no, avanzar. Nav2 resuelve el mismo problema con un **controller** — acá, [DWB](https://docs.nav2.org/rolling/configuration_and_development/configuration_guide/controller_plugins/dwb_controller/) (*Dynamic Window Approach*): en cada ciclo genera un lote de trayectorias candidatas de corto alcance, le pone un puntaje a cada una según los costmaps del Checkpoint 2 y el plan del planner global, y ejecuta la de mejor puntaje.

<figure class="doc-figure">
  <img src="../../media/docs/semana-09-nav2/nav2_controller_demo.gif" alt="Robot navegando de costado (strafe) hacia un Nav2 Goal lateral, sin girar para encararlo, visto desde arriba en Gazebo" width="640" height="329" style="width:640px;max-width:100%;" loading="lazy" />
  <figcaption class="doc-figcaption-wide">El robot se desplaza de costado sin girar primero para encarar el goal — confirma que la base es holonómica de verdad y que <code>vy_samples</code>/<code>min_vel_y</code>/<code>max_vel_y</code> se ejercen, no que solo están declarados.</figcaption>
</figure>

> [!NOTE]
> El robot llega a la posición del goal pero **nunca termina mirando hacia la orientación final** que marcaste — se queda con el heading del último tramo de la trayectoria. No es un bug: la config de esta semana saca a propósito el crítico `RotateToGoal` de DWB (ver "La configuración" más abajo).

### Checkpoint 4 — `NavigateToPose` reemplaza la exploración por waypoints (sem. 08)

En semana 08 armaste tu propia lógica de cobertura: una lista de waypoints y un criterio propio de "cuál sigue". Nav2 empaqueta ese mismo problema —llegar a un punto lejano, replanificando en el camino— en una sola acción, [`NavigateToPose`](https://docs.nav2.org/rolling/getting_started/nav2_behavior_trees/detailed_behavior_tree_walkthrough/detailed_behavior_tree_walkthrough/): `bt_navigator` le pide un camino a `planner_server`, se lo va pasando en tramos al `controller_server` del Checkpoint 3 (que esquiva en vivo con los costmaps del Checkpoint 2, localizado por el AMCL del Checkpoint 1), y si algo falla reintenta o replanifica solo.

<figure class="doc-figure">
  <img src="../../media/docs/semana-09-nav2/nav2_navigate_to_pose_demo.gif" alt="Robot navegando de forma autónoma hacia un Nav2 Goal lejano, cruzando pasillos del laberinto con NavigateToPose" width="640" height="329" style="width:640px;max-width:100%;" loading="lazy" />
  <figcaption class="doc-figcaption-wide">El robot planifica solo un camino sobre el costmap global, lo sigue con el controller, y replanifica en vivo si le cruzás un obstáculo con teleop en el medio.</figcaption>
</figure>

## Implementación

No hay TODOs esta semana — [`nav2_params.yaml`](https://github.com/AIRclub-UdeSA/jar_workshops/blob/main/semana-09-nav2/nav2_params.yaml) ya viene con un comentario por parámetro, sección por sección, muchos apuntando a qué le equivalen en tu propio código de semanas anteriores. Cuatro parámetros vale la pena mirar con atención antes de correrlo:

- **`robot_model_type`** (sección `amcl:`) — en `nav2_amcl::OmniMotionModel` en vez del default `DifferentialMotionModel` de `nav2_bringup`. Mismo argumento que en semana 06 sobre por qué ese modelo y no el del libro.
- **`min_vel_y` / `max_vel_y`** (sección `controller_server: FollowPath:`) — en 0.0 por default en `nav2_bringup` (asume un robot diferencial); acá habilitados porque el X3 es mecanum.
- **`critics`** (misma sección) — no incluye `RotateToGoal` (sí está en el default de `nav2_bringup`): es la causa directa del gotcha del Checkpoint 3. En su lugar suma `Twirling`, para que el robot no gire sobre su eje sin necesidad.
- **`use_astar`** (sección `planner_server:`) — en `false`, así que el planificador corre Dijkstra en vez de A* — mismo problema de semana 08 (camino más corto sobre una grilla de costos) pero sin la heurística que guía la búsqueda hacia el objetivo.

## Ejecución

```bash
# Terminal única — bringup completo (Gazebo + RViz + stack de Nav2)
source ~/rosmaster_ws/install/setup.bash
ros2 launch ~/rosmaster_ws/src/jar_workshops/semana-09-nav2/launch/nav2_semana09.launch.py
```

Esperá a que Gazebo y RViz terminen de abrir. Con el bringup levantado, en orden:

1. **Checkpoint 1** — clickeá "2D Pose Estimate" y hacé un click aproximado sobre la pose real del robot.
2. **Checkpoint 2** — con la pose ya puesta, activá en el panel Displays las capas "Global Planner" y "Controller" y recorré el mapa con teleop (`ros2 run teleop_twist_keyboard teleop_twist_keyboard`), pasando cerca de paredes y de algún cuadrado de color.
3. **Checkpoint 3** — con los Checkpoints 1-2 activos, usá "Nav2 Goal" y mandá un objetivo **puramente lateral** (a 90° de hacia dónde mira el robot).
4. **Checkpoint 4** — mandá un "Nav2 Goal" a un punto **lejano**, cruzando al menos un par de pasillos y esquinas.

## Comprobación

- **Checkpoint 1**: la nube de partículas se contrae alrededor de la pose real del robot y el panel "Navigation 2" muestra `Localization: active`.
- **Checkpoint 2**: el panel muestra también `Navigation: active`; el costmap global (magenta) sigue las paredes reales sin moverse, y el local marca un cuadrado de color apenas te acercás y lo limpia solo al alejarte.
- **Checkpoint 3**: al mandar el goal lateral, el robot se desplaza de costado sin girar antes de arrancar — `ros2 topic echo /cmd_vel` muestra `linear.y` distinto de cero durante el movimiento.
- **Checkpoint 4**: el robot llega solo al goal lejano, sin que vos escribas ninguna lógica de "siguiente punto"; si le cruzás un obstáculo con teleop en el medio, replanifica en vez de quedarse trabado.

> [!WARNING]
> En los Checkpoints 3 y 4, el robot llega a la posición del goal pero no necesariamente a su orientación final — es el comportamiento esperado, no un error de tu parte (ver Desafío extra).

## Explicación

Con esto corriste, de punta a punta, el mismo stack de navegación que usa un robot real: AMCL localizando, dos costmaps evitando lo que hay que evitar, DWB decidiendo la trayectoria ciclo a ciclo, y `NavigateToPose` encadenando todo detrás de una sola acción. Ninguna pieza es conceptualmente nueva — cada una es el mismo problema que ya resolviste a mano en semanas anteriores, ahora resuelto por configuración en vez de por código propio.

> [!QUESTION]
> Si tuvieras que agregar `RotateToGoal` de vuelta a los `critics` de DWB para que el robot sí termine mirando la orientación final del goal, ¿qué esperarías que pase con el strafe puro del Checkpoint 3?

## Desafío extra

- **Hacer que el robot sí termine mirando hacia la orientación final del goal.** Esta semana sacamos `RotateToGoal` de los `critics` de DWB a propósito, para no arruinar la demostración de strafe puro. Investigá cómo lograr las dos cosas a la vez.
- **Combinar este workshop con nodos de semanas anteriores** para ir más allá — no todo tiene que ser nuevo, tenés cuatro semanas de código propio corriendo sobre un mapa y un mundo que no cambiaron.
- Probar [`explore_lite`](https://github.com/robo-friends/m-explore-ros2) para explorar el mapa sin un objetivo fijo, en vez de mandar un `NavigateToPose` a un punto (Checkpoint 4).
