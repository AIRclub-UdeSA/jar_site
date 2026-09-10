---
title: "08 · Cobertura del mapa"
description: "Hacé que el robot recorra todo el mapa por su cuenta: cobertura por trazado de rayos y planificación de caminos con A*."
status: listo
duration: "aprox. 180–240 min"
level: avanzado
outcome: "Al terminar, tu robot explora todo el mapa por su cuenta, planificando caminos con A* sobre un costmap inflado, sin que nadie le marque destinos ni vuelva a pasar por zonas ya cubiertas."
prerequisites:
  - "Setup completo"
  - "Workshop 06"
---

## La práctica

<section class="doc-practice-plate" aria-labelledby="la-práctica">
  <div class="doc-practice-intro">
    <p class="doc-practice-statement">Explorar.<br />Cubrir.<br />No repetir.</p>
    <p class="doc-practice-note">Es el último workshop manual del roadmap: después de este, Nav2 hace lo mismo con configuración en vez de código a mano.</p>
  </div>

  <dl class="doc-practice-facts">
    <div>
      <dt>Cubre</dt>
      <dd>Una grilla gruesa marcada por trazado de rayos (Bresenham), respetando paredes</dd>
    </div>
    <div>
      <dt>Planifica</dt>
      <dd><code>A*</code> sobre un costmap inflado por el radio del robot</dd>
    </div>
    <div>
      <dt>Arranca</dt>
      <dd>Cuando marcás "2D Pose Estimate" en RViz</dd>
    </div>
    <div>
      <dt>Publica</dt>
      <dd><code>cmd_vel</code> + <code>estado</code> (<code>inicializando → explorando → terminado</code>)</dd>
    </div>
  </dl>
</section>

## Antes de empezar

<ol class="doc-preflight" aria-label="Preparación del workshop">
  <li>
    <span class="doc-preflight-index" aria-hidden="true">01</span>
    <div class="doc-preflight-copy">
      <h3>Semana 06 funcionando</h3>
      <p>Necesitás tu paquete de la <a href="../semana-06-localizacion/">semana 06</a> (<code>localizador</code> + <code>campo_verosimilitud</code>) corriendo — este workshop reusa el mismo patrón de paquete propio y depende de tener pose en <code>map</code>. No depende de semana 07: son ramas hermanas, las dos parten de la 06.</p>
    </div>
  </li>
  <li>
    <span class="doc-preflight-index" aria-hidden="true">02</span>
    <div class="doc-preflight-copy">
      <h3>Un agregado a <code>localizador.py</code></h3>
      <p>Esta semana necesita que tu filtro escuche <code>initialpose</code> para resembrar las partículas cuando marcás la pose en RViz. No es un TODO — te lo damos resuelto, ver el paso siguiente.</p>
    </div>
  </li>
  <li>
    <span class="doc-preflight-index" aria-hidden="true">03</span>
    <div class="doc-preflight-copy">
      <h3>Chequeo</h3>
      <p>Confirmá que tu RViz tiene la herramienta <strong>"2D Pose Estimate"</strong> en la barra de arriba — si no la usaste hasta ahora, puede que no esté agregada.</p>
    </div>
  </li>
</ol>

## Concepto mínimo

### Cobertura por rayo, no por radio

La forma más simple de llevar la cuenta de "por dónde ya pasé" sería un círculo de radio fijo alrededor del robot. Es tentador porque es una sola cuenta de distancia por celda, pero **ignora las paredes**: si el robot pasa cerca de una víctima con una pared en el medio, un círculo la marca "cubierta" igual, aunque el robot nunca haya tenido línea de vista hacia ella.

La alternativa es preguntar, para cada rayo del `/scan`, qué celdas atravesó *realmente* — respetando paredes por construcción. Trazar esa línea sobre una grilla es el algoritmo de [Bresenham](https://en.wikipedia.org/wiki/Bresenham%27s_line_algorithm): dadas una celda de origen y una de destino, devuelve **todas** las celdas que la línea recta entre las dos atraviesa, sin huecos ni celdas salteadas. Es, literalmente, la misma cuenta que hace por dentro cualquier algoritmo de mapeo por grilla de ocupación (SLAM incluido).

<img src="../../media/docs/semana-08-cobertura-mapa/bresenham.gif" alt="Bresenham trazando, celda por celda, un rayo del /scan: el rayo recto está dibujado encima para mostrar que son justo esas celdas las que atraviesa" width="560" height="459" loading="lazy" />

Este workshop maneja el mapa a dos resoluciones a propósito: una grilla **gruesa** para llevar la cuenta de qué zona ya se visitó (agrupar celdas la hace más rápida de cubrir del todo), y el **mapa original**, a resolución fina, para todo lo que tiene que ver con no chocar — la grilla gruesa nunca decide por dónde puede pasar el robot, solo qué zona visitar.

### A* con costmap inflado

Un [A*](https://en.wikipedia.org/wiki/A*_search_algorithm) que solo distingue libre/ocupado encuentra el camino más corto — que casi siempre roza el borde de una pared, porque geométricamente eso es válido aunque no tenga ningún margen. La solución estándar (la misma que usa el *costmap* de Nav2) es **inflar** el mapa antes de planificar: un **filtro duro** descarta toda celda a menos del radio del robot (más un margen) de una pared, y un **costo suave** por encima de eso hace que moverse cerca de una pared salga más caro que moverse lejos — así A* *prefiere* el camino centrado cuando hay margen, sin prohibir pasar más cerca cuando es la única opción.

<img src="../../media/docs/semana-08-cobertura-mapa/a_estrella.gif" alt="Comparación de A* sobre el mismo laberinto, con y sin el inflado: sin costmap el camino roza la pared, con costmap se mantiene centrado" width="1000" height="520" loading="lazy" />

Por qué importa el filtro duro en particular: en el laberinto de abajo hay un atajo, una rendija de una sola celda. A* sin costmap la toma porque para un punto es un camino válido y más corto — pero un círculo del tamaño real del robot queda **trabado justo en la rendija**, el plan existe sobre el papel pero el robot no lo puede ejecutar. Con el filtro duro, esa celda queda directamente afuera del grafo antes de planificar.

<img src="../../media/docs/semana-08-cobertura-mapa/a_estrella_robot.gif" alt="A* tratando al robot como un punto vs. con costmap respetando su radio real: el camino &quot;punto&quot; toma un atajo por una rendija angosta y el círculo del tamaño real del robot queda trabado ahí; el camino con costmap rodea y el robot llega entero" width="1000" height="520" loading="lazy" />

### Por qué el robot espera a que un humano le diga dónde está

El robot real no arranca sabiendo su posición en el mapa. La herramienta **"2D Pose Estimate"** de RViz publica esa pose inicial en `initialpose`, y el robot se queda quieto hasta recibirla — y todavía un rato más (`tiempo_asentamiento_s`), para que el filtro de partículas tenga tiempo de converger antes de sumar error de movimiento al error de localización.

<img src="../../media/docs/semana-08-cobertura-mapa/2d_pose_estimate.gif" alt="Marcando &quot;2D Pose Estimate&quot; en RViz: el robot espera quieto unos segundos a que asiente el filtro de partículas antes de arrancar a explorar y planificar el camino" width="800" height="450" loading="lazy" />

> [!NOTE]
> La máquina de estados de esta semana es de **misión** (`inicializando → explorando → terminado`), no de movimiento como la de semana 03 — mismas reglas de diseño (transición separada de la acción, loguear cada cambio), aplicadas a decidir en qué fase de la tarea está el robot, no cómo moverse ciclo a ciclo.

## Implementación

### Creá tu paquete

Mismo procedimiento que [semana 06](../semana-06-localizacion/)/[semana 07](../semana-07-obstaculos-no-mapeados/): el paquete no viene armado.

```bash
# Terminal 1
cd ~/rosmaster_ws/src/jar_workshops/semana-08-cobertura-mapa
ros2 pkg create --build-type ament_python --dependencies \
  rclpy numpy nav_msgs sensor_msgs geometry_msgs std_msgs visualization_msgs tf2_ros \
  cobertura_mapa
```

1. Copiá los cuatro archivos ([`trazado.py`](https://github.com/AIRclub-UdeSA/jar_workshops/blob/main/semana-08-cobertura-mapa/trazado.py), [`planificador.py`](https://github.com/AIRclub-UdeSA/jar_workshops/blob/main/semana-08-cobertura-mapa/planificador.py), [`grilla_cobertura.py`](https://github.com/AIRclub-UdeSA/jar_workshops/blob/main/semana-08-cobertura-mapa/grilla_cobertura.py), [`explorador.py`](https://github.com/AIRclub-UdeSA/jar_workshops/blob/main/semana-08-cobertura-mapa/explorador.py)) a `cobertura_mapa/cobertura_mapa/`.
2. En `setup.py`, agregá los dos ejecutables a `entry_points`: `grilla_cobertura = cobertura_mapa.grilla_cobertura:main` y `explorador = cobertura_mapa.explorador:main`.
3. En `package.xml`, sumá la misma librería de cálculo científico que ya buscaste en semana 06 para `campo_verosimilitud.py` — acá la usa `explorador.py` para `distance_transform_edt`.

```bash
cd ~/rosmaster_ws
colcon build --packages-select cobertura_mapa --symlink-install
source install/setup.bash
```

### El agregado a `localizador.py`

Tu `Localizador` de semana 06 necesita escuchar `initialpose` y resembrar las partículas alrededor de esa pose (misma cuenta que ya hace tu `__init__` con `pose_inicial_x/y/theta`). No es parte de los TODO de esta semana — sumale este método y suscribilo en `__init__`:

```python
def recibir_pose_inicial(self, msg):
    x = msg.pose.pose.position.x
    y = msg.pose.pose.position.y
    theta = self.yaw_de_quaternion(msg.pose.pose.orientation)
    n = self.num_particulas
    dxy = self.get_parameter('dispersion_inicial_xy').value
    dtheta = self.get_parameter('dispersion_inicial_theta').value
    x0 = np.random.normal(x, dxy, n)
    y0 = np.random.normal(y, dxy, n)
    theta0 = np.random.normal(theta, dtheta, n)
    self.particulas = np.stack([x0, y0, theta0, np.full(n, 1.0 / n)], axis=1)
```

### Parte 1 — `grilla_cobertura.py`

Toda la plomería está resuelta: parámetros, suscripciones, y `recibir_mapa()`, que arma la grilla gruesa agrupando bloques del mapa original. Quedan **2 funciones con `TODO`**:

1. **`trazar_rayo()`**, en `trazado.py` — Bresenham puro, sin ROS. Se puede probar aislado antes de tocar nada del nodo.
2. **`recibir_scan()`** — transformar cada rayo del `/scan` a `map` (mismo patrón de semana 04/07) y usar `trazar_rayo()` para marcar como cubiertas las celdas que atraviesa.

| Parámetro | Default | Qué es |
| --- | --- | --- |
| `map_frame` / `base_frame` | `map` / `base_footprint` | Nombres de los frames. |
| `factor_escala` | 4 | Cuántas celdas del mapa original por lado se agrupan en una celda de cobertura. |
| `distancia_minima_valida` | 0.25 | Rango mínimo (m) válido — descarta el rebote del lidar contra la propia estructura del robot, igual que en semana 07. |

Probalo antes de meterte con `explorador`: sumá `grilla_cobertura` a tu launch, manejá el robot con teleop, y agregá en RViz un display `Map` apuntando a `/grilla_cobertura` (**Color Scheme: costmap**, mismo QoS *transient local* que `/map`). Una zona pasa de rojo (no cubierta) a verde a medida que el robot la recorre.

### Parte 2 — `explorador.py`

También acá está resuelta toda la plomería: suscripciones, publicación de `cmd_vel`/`objetivo_actual`/`camino_planificado`/`estado`, el inflado del mapa (`recibir_mapa()`), el seguimiento del camino ya planificado, y el vector repulsivo del `/scan` como capa de seguridad secundaria. Quedan **4 piezas con `TODO`**, de abajo hacia arriba:

1. **`a_estrella()`**, en `planificador.py` — A* puro, sin ROS, testeable aislado. Ya viene con la cola de prioridad y la reconstrucción del camino resueltas; falta el cuerpo que evalúa cada vecino.
2. **`celda_no_cubierta_mas_cercana()`** — de toda la grilla de cobertura, la celda libre no cubierta más cercana al robot.
3. **`vector_hacia()`** — el vector hacia un punto, en el frame del robot. Al ser mecanum, manda `linear.x`/`linear.y` directo, sin girar el chasis para apuntar primero.
4. **`transicionar()`** — los 2 `if` de la máquina de estados de misión: cuándo pasar de `inicializando` a `explorando`, y de `explorando` a `terminado`.

Completalas en ese orden: `a_estrella()` primero, porque todo lo demás depende de ella para tener sentido end-to-end.

| Parámetro | Default | Qué es |
| --- | --- | --- |
| `map_frame` / `base_frame` | `map` / `base_footprint` | Nombres de los frames. |
| `velocidad_maxima` | 0.3 | Tope de velocidad lineal (m/s), en cualquier dirección. |
| `ganancia_atractiva` | 0.6 | Qué tan fuerte tira el siguiente punto del camino. |
| `ganancia_repulsiva` / `radio_repulsion` | 0.15 / 0.4 | Fuerza y alcance (m) de la capa de seguridad secundaria contra el `/scan`. |
| `suavizado` | 0.3 | Peso del comando de velocidad nuevo contra el anterior. |
| `tiempo_asentamiento_s` | 3.0 | Cuánto espera quieto, después de confirmada la pose inicial, antes de arrancar a moverse. |
| `radio_robot` | 0.18 | Radio circunscripto del chasis (Donatello mide 0.30 × 0.20 m). |
| `margen_seguridad` | 0.05 | Margen extra sobre `radio_robot` para el filtro duro del inflado. |
| `sigma_costo` | 0.15 | Ancho (m) del costo suave alrededor de cada pared — más chico, más permisivo. |

## Ejecución

Sumá `grilla_cobertura` y `explorador` a tu propio launch de semana 06, y a tu RViz los displays nuevos: `Map` en `/grilla_cobertura` (Color Scheme: costmap), `Marker` en `/objetivo_actual`, `Path` en `/camino_planificado`, y la herramienta **"2D Pose Estimate"** (agregala con el botón "+" si tu config no la tiene).

```bash
# Terminal 1 — simulador
source ~/rosmaster_ws/install/setup.bash
ros2 launch yahboom_rosmaster_bringup rosmaster_x3_sim.launch.py \
  world:="$(ros2 pkg prefix yahboom_rosmaster_gazebo)/share/yahboom_rosmaster_gazebo/worlds/laberinto_simple.world" \
  motion_profile:=ideal rviz:=false
```

```bash
# Terminal 2 — mapa
source ~/rosmaster_ws/install/setup.bash
ros2 run nav2_map_server map_server --ros-args -p yaml_filename:="$(ros2 pkg prefix yahboom_rosmaster_gazebo)/share/yahboom_rosmaster_gazebo/maps/laberinto_simple.yaml"
```

```bash
# Terminal 3 — activar el mapa
source ~/rosmaster_ws/install/setup.bash
ros2 run nav2_lifecycle_manager lifecycle_manager --ros-args -p autostart:=true -p node_names:="['map_server']"
```

```bash
# Terminal 4 — semana 06
source ~/rosmaster_ws/install/setup.bash
ros2 run localizacion campo_verosimilitud &
ros2 run localizacion localizador
```

```bash
# Terminal 5 — este workshop
source ~/rosmaster_ws/install/setup.bash
ros2 run cobertura_mapa grilla_cobertura &
ros2 run cobertura_mapa explorador
```

```bash
# Terminal 6 — tu RViz, con los displays nuevos
source ~/rosmaster_ws/install/setup.bash
rviz2 -d <ruta a tu config>
```

Con todo levantado: esperá a que `Map` y `LaserScan` se vean estables (el robot todavía no se mueve solo), usá **"2D Pose Estimate"** marcando dónde está Donatello, y esperá `tiempo_asentamiento_s` — recién ahí arranca a explorar.

> [!WARNING]
> Usá el mundo `laberinto_simple.world` **sin víctimas** — acá no se detecta nada, así que los cubos de víctimas serían ruido innecesario para la localización (ver Desafío extra si querés probarlo igual con ellas puestas).

## Comprobación

Con el robot explorando solo:

- La grilla de cobertura se va pintando de rojo a verde en vivo, y `camino_planificado` (cian) pasa **centrado** por los pasillos, no pegado a las paredes.
- `/estado` transiciona en orden: `inicializando → explorando → terminado` — mirá los logs del nodo para confirmarlo.
- Cuando la grilla queda completamente verde (en las zonas libres), el robot se detiene: no le queda ninguna celda por cubrir.
- El robot nunca intenta pasar por un hueco más angosto que su propio chasis, aunque geométricamente exista un camino más corto por ahí.

## Explicación

Con esto, el robot decide **solo** qué zona del mapa visitar y cómo llegar sin chocar, en vez de depender de que un humano le marque destinos — el mismo problema que resuelve `NavigateToPose`/`explore_lite` de Nav2 de fábrica. El A* con costmap inflado es, literalmente, cómo planifica Nav2 por dentro. Cuando llegue el workshop de Nav2, buena parte de esto se reemplaza por configuración en vez de código — pero el concepto de fondo es el mismo.

> [!QUESTION]
> Si `sigma_costo` fuera muchísimo más alto, ¿el camino planificado se volvería casi recto en cualquier pasillo, o seguiría evitando los bordes incluso donde sobra margen?

## Desafío extra

- **Volver a la base**: hoy `explorador` se detiene apenas termina de cubrir el mapa. Guardá la pose del robot al confirmar "2D Pose Estimate", agregá un estado nuevo (`regresando_a_base`, entre `explorando` y `terminado`) y reusá el mismo mecanismo de A* + seguimiento de camino, cambiando el objetivo por esa pose guardada.
- **Calibrar `sigma_costo` en serio**: subilo y bajalo, y mirá cómo cambia la forma del camino en pasillos anchos vs. angostos.
- **Reselección de objetivo**: hoy `explorador` recalcula la celda no cubierta más cercana en cada tick de control (10 Hz). Probá fijar el objetivo hasta llegar a él en vez de recalcularlo todo el tiempo, y compará qué tan errático se ve el recorrido.
- **Elegir el objetivo por costo de camino, no por distancia recta**: `celda_no_cubierta_mas_cercana()` usa distancia en línea recta — una celda "cerca" así puede requerir un rodeo largo si hay una pared en el medio. Correr A*/Dijkstra una vez desde la pose del robot y elegir la candidata más barata por costo de camino es más preciso, pero mucho más caro de calcular en cada tick.
- **Validar en el mundo `_victimas`**: mismo par mundo/mapa que semana 07 (`laberinto_simple_victimas.world` + `laberinto_simple.yaml`). Confirmá que la cobertura y la planificación siguen funcionando con obstáculos no mapeados presentes.
