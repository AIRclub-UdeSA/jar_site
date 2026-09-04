---
title: "06 · Localización"
description: "Armá tu primer paquete ROS 2 desde cero y corregí el drift de la odometría contra el mapa con un filtro de partículas."
status: listo
duration: "aprox. 150–180 min"
level: avanzado
outcome: "Al terminar, tu robot corrige su pose contra el mapa con un filtro de partículas propio, publicando la transformada map → odom."
prerequisites:
  - "Setup completo"
  - "Workshop 03"
  - "Workshop 04"
  - "Workshop 05"
---

## La práctica

<section class="doc-practice-plate" aria-labelledby="la-práctica">
  <div class="doc-practice-intro">
    <p class="doc-practice-statement">Predecir.<br />Corregir.<br />Resamplear.</p>
    <p class="doc-practice-note">Por primera vez armás tu propio paquete ROS 2 desde cero, no uno que ya viene armado — y lo usás para que el robot sepa dónde está de verdad, no solo dónde cree que está.</p>
  </div>

  <dl class="doc-practice-facts">
    <div>
      <dt>Algoritmo</dt>
      <dd>Filtro de partículas (Monte Carlo Localization)</dd>
    </div>
    <div>
      <dt>Corrige</dt>
      <dd>El drift de la odometría, publicando <code>map → odom</code></dd>
    </div>
    <div>
      <dt>Publica</dt>
      <dd><code>PoseArray</code> en <code>particlecloud</code> + 3 <code>Path</code></dd>
    </div>
    <div>
      <dt>Partículas</dt>
      <dd>300 por default (<code>num_particulas</code>)</dd>
    </div>
  </dl>
</section>

## Antes de empezar

<ol class="doc-preflight" aria-label="Preparación del workshop">
  <li>
    <span class="doc-preflight-index" aria-hidden="true">01</span>
    <div class="doc-preflight-copy">
      <h3>Semana 05</h3>
      <p>Necesitás tu propio paquete <code>launch_rviz</code> y tu config de RViz de la <a href="../semana-05-launch-rviz/">semana 05</a> — acá los vas a extender, no a rearmar de cero.</p>
    </div>
  </li>
  <li>
    <span class="doc-preflight-index" aria-hidden="true">02</span>
    <div class="doc-preflight-copy">
      <h3>Workspace clonado</h3>
      <p><code>yahboom_rosmaster</code> y <code>jar_workshops</code> tienen que estar clonados en <code>~/rosmaster_ws/src</code> (ver la <a href="../../setup/simulador/">guía del simulador</a>) — esta semana creás un paquete propio adentro de <code>jar_workshops</code>, no editás uno que ya viene clonado.</p>
    </div>
  </li>
  <li>
    <span class="doc-preflight-index" aria-hidden="true">03</span>
    <div class="doc-preflight-copy">
      <h3>Chequeo</h3>
      <p>Levantá <code>map_server</code> con <code>laberinto_simple.yaml</code> (Paso 0 más abajo) y confirmá que ves el mapa en RViz antes de crear ningún paquete.</p>
    </div>
  </li>
</ol>

## Concepto mínimo: por qué la odometría deriva sola

Un robot tiene (al menos) tres frames encadenados ([REP 105](https://www.ros.org/reps/rep-0105.html)):

| Frame | Qué es |
| --- | --- |
| `map` | el mapa conocido, fijo — donde vive la posición "de verdad" |
| `odom` | arranca igual a `base_link` y deriva integrando los encoders: nunca salta, pero acumula error sin límite |
| `base_footprint` (`base_link`) | el propio robot; todo lo demás se ubica relativo a él |

`odom → base_footprint` ya te lo da gratis `wheel_state_odometry`, corriendo desde que lanzás el simulador. Lo que falta —y es el objetivo de esta semana— es `map → odom`: una transformada que corrige el error acumulado comparando el `/scan` contra el mapa conocido. Con las dos transformadas encadenadas, cualquier nodo (RViz incluido) sabe dónde está el robot en `map` sin saber cómo se calculó la corrección.

Un **filtro de partículas** lleva, en vez de una única hipótesis de pose, cientas de ellas a la vez. En cada ciclo:

1. **Predicción**: cada partícula se mueve según la odometría, más ruido.
2. **Corrección**: cada partícula "imagina" qué vería el lidar en su pose, lo compara contra el `/scan` real, y las que calzan mejor pesan más.
3. **Resampleo**: se redibuja el conjunto dándole más chances a las partículas de mayor peso — con el tiempo, la nube se concentra alrededor de la pose real.

La pose estimada es el promedio ponderado de todas las partículas.

## Implementación

### Paso 0: mirá el mapa antes de escribir código

No hace falta el simulador ni código propio — alcanza con `map_server` sirviendo el mapa que vas a usar toda la semana:

```bash
# Terminal 1 — mapa
source ~/rosmaster_ws/install/setup.bash
ros2 run nav2_map_server map_server --ros-args -p yaml_filename:="$(ros2 pkg prefix yahboom_rosmaster_gazebo)/share/yahboom_rosmaster_gazebo/maps/laberinto_simple.yaml"
```

```bash
# Terminal 2 — activar el mapa
source ~/rosmaster_ws/install/setup.bash
ros2 run nav2_lifecycle_manager lifecycle_manager --ros-args -p autostart:=true -p node_names:="['map_server']"
```

En RViz, `Fixed Frame` en `map` y un display `Map` apuntando a `/map`: blanco = libre, negro = ocupado, gris = desconocido.

> [!WARNING]
> Si el display `Map` queda gris uniforme, es [QoS](https://docs.ros.org/en/humble/Concepts/Intermediate/About-Quality-of-Service-Settings.html), no algo roto: `map_server` publica con *durability* **Transient Local**, y si RViz arrancó después (que va a ser casi siempre) se suscribe pero no recibe el mensaje retenido. En el panel del display, abrí **QoS** y poné `Durability Policy` en **Transient Local**. Vas a necesitar el mismo ajuste para `/likelihood_map` más abajo.

### Creá tu paquete

A diferencia de las semanas 01-05, esta vez no recibís el paquete armado: [`ros2 pkg create`](https://docs.ros.org/en/humble/Tutorials/Beginner-Client-Libraries/Creating-Your-First-ROS2-Package.html) lo genera de cero.

```bash
# Terminal 1
cd ~/rosmaster_ws/src/jar_workshops/semana-06-localizacion
ros2 pkg create --build-type ament_python --dependencies \
  rclpy nav_msgs sensor_msgs geometry_msgs tf2_ros \
  localizacion
```

Con el paquete creado:

1. Copiá [`campo_verosimilitud.py`](https://github.com/AIRclub-UdeSA/jar_workshops/blob/main/semana-06-localizacion/campo_verosimilitud.py) y [`localizador.py`](https://github.com/AIRclub-UdeSA/jar_workshops/blob/main/semana-06-localizacion/localizador.py) a `localizacion/localizacion/`.
2. En `setup.py`, agregá los dos ejecutables a `entry_points`: `campo_verosimilitud = localizacion.campo_verosimilitud:main` y `localizador = localizacion.localizador:main`.
3. En `package.xml`, sumá un `<depend>` por cada import que no sea de la lista del `ros2 pkg create`: `numpy` (ya la resolviste en semana 04) y, solo en `campo_verosimilitud.py`, una librería de cálculo científico que buscás vos por su paquete apt (`python3-<algo>`).

```bash
cd ~/rosmaster_ws
colcon build --packages-select localizacion --symlink-install
source install/setup.bash
```

`--symlink-install` importa acá: vas a editar los TODO muchas veces, y sin symlink cada cambio pediría un rebuild.

### Parte 1 — `campo_verosimilitud.py`: el campo de verosimilitud

Comparar el lidar contra el mapa "en vivo", rayo por rayo, para cientos de partículas es carísimo en Python puro. La solución estándar precalcula, una sola vez apenas llega el mapa, un "campo de verosimilitud": para cada celda, qué tan probable es que un rayo del lidar termine ahí. Después, comparar un punto del scan contra el mapa es solo **leer un valor de un array**.

La plomería (suscripción a `/map`, publisher de `/likelihood_map` con el mismo QoS transient local) ya está resuelta. Queda una función con `TODO`:

- **`campo_de_probabilidad()`** — a partir de la grilla de ocupación, calcular la distancia de cada celda al obstáculo más cercano ([`scipy.ndimage.distance_transform_edt`](https://docs.scipy.org/doc/scipy/reference/generated/scipy.ndimage.distance_transform_edt.html)) y convertirla a probabilidad con una gaussiana.

| Parámetro | Default | Qué es |
| --- | --- | --- |
| `sigma_sensor` | 0.2 | Ancho (m) del halo de probabilidad alrededor de cada obstáculo. Chico = exigente, grande = permisivo. |

Probalo solo, sin el simulador — alcanza con `map_server` corriendo (Terminales 1 y 2 del Paso 0) más:

```bash
# Terminal 3
source ~/rosmaster_ws/install/setup.bash
ros2 run localizacion campo_verosimilitud
```

Agregá un display `Map` en `/likelihood_map` (mismo ajuste de QoS que el Paso 0) y probá un `Color Scheme` con gradiente: deberías ver un halo difuminado creciendo alrededor de cada pared, no líneas duras.

### Parte 2 — `localizador.py`: predicción, corrección, resampleo

- **Predicción**: el movimiento entre dos lecturas de `/odom` se descompone en *rotar hacia el rumbo* (`rot1`), *avanzar* (`trans`), *rotar lo que falte* (`rot2`) — el modelo odométrico estándar (Thrun, *Probabilistic Robotics*), con ruido gaussiano proporcional a cada componente.
- **Corrección**: para cada partícula, transformar los puntos del `/scan` a su pose, leer `/likelihood_map` ahí, y combinar esas probabilidades en un peso.
- **Resampleo**: redibujar las N partículas con reemplazo, proporcional al peso (*resampling sistemático*).

Toda la plomería está resuelta (parámetros, suscripciones, inicialización de la nube de partículas, conversión del `/scan` a puntos con `tf2` igual que `detector_scan.py` de semana 04, estimación de pose por promedio, publicación de `particlecloud` y de tres `Path` — `camino_odom`, `camino_corregido`, `camino_real`, este último la pose exacta de Gazebo, una ventaja del simulador que no existe en el robot físico — y la transformada `map → odom` vía [`tf2_ros.TransformBroadcaster`](https://docs.ros.org/en/humble/Tutorials/Intermediate/Tf2/Tf2-Main.html)). Quedan 3 funciones con `TODO`, el corazón del filtro:

1. **`mover_particulas()`** — el modelo de movimiento (predicción). Probala primero: la nube debería "abrirse" al mover el robot, aunque todavía no corrija nada.
2. **`pesar_particulas()`** — el modelo de sensor (corrección) contra `/likelihood_map`. La más larga; el docstring la guía paso a paso.
3. **`remuestrear()`** — el resampling sistemático.

| Parámetro | Default | Qué es |
| --- | --- | --- |
| `map_frame` / `odom_frame` / `base_frame` | `map` / `odom` / `base_footprint` | Nombres de los frames. |
| `num_particulas` | 300 | Cuántas hipótesis mantiene el filtro. Más = más preciso, más lento. |
| `pose_inicial_x/y/theta` | 0.0 / 0.0 / 0.0 | Pose inicial conocida (el robot spawnea en el origen, igual que el mapa). |
| `dispersion_inicial_xy` / `dispersion_inicial_theta` | 0.3 / 0.3 | Qué tan dispersa arranca la nube. |
| `alpha1`-`alpha4` | 0.05 c/u | Ruido del modelo de movimiento rot1-trans-rot2. |
| `submuestreo_scan` | 15 | Cada cuántos rayos del `/scan` (de 1080) se usa para pesar. Bajarlo = más preciso y más lento. |

## Ejecución

Antes de abrir tu RViz de semana 05, sumale los displays nuevos: `Map` en `/map` y en `/likelihood_map` (QoS `Transient Local` en ambos), `PoseArray` en `particlecloud`, y tres `Path` — `camino_odom`, `camino_corregido`, `camino_real` — cada uno con su color, guardado con **`File > Save Config As`** sobre tu config existente.

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
# Terminal 4 — nuestros nodos
source ~/rosmaster_ws/install/setup.bash
ros2 run localizacion campo_verosimilitud &
ros2 run localizacion localizador
```

```bash
# Terminal 5 — teleop
source ~/rosmaster_ws/install/setup.bash
ros2 run teleop_twist_keyboard teleop_twist_keyboard
```

```bash
# Terminal 6 — tu RViz de semana 05, con los displays nuevos
source ~/rosmaster_ws/install/setup.bash
rviz2 -d <ruta a tu config de semana 05>
```

`Ctrl-C` en cada terminal para bajarlo. Una vez que lo tengas probado y andando, es un buen momento para meter estas seis terminales en tu propio launch de semana 05.

> [!WARNING]
> `rviz:=false` en la Terminal 1 es importante: el launch del simulador trae su propio RViz por default, y ese no tiene los displays nuevos que necesitás acá.

## Comprobación

Manejá el robot un rato por el laberinto (con giros, no solo derecho) y mirá en RViz:

- La nube de partículas (`particlecloud`) se **abre** un poco con cada movimiento y se **contrae** con cada `/scan` que corrige — se tiene que ver "respirar".
- `camino_odom` se va separando de `camino_real` con el tiempo — así se ve el *drift* directamente.
- `camino_corregido` se mantiene pegado a `camino_real` todo el tiempo, a pesar de que `camino_odom` se siga alejando: esa es la comprobación central, el filtro corrige el drift, no solo lo acompaña.
- El `/scan` se mantiene alineado con las paredes del `/map`, sin importar cuánto tiempo lleve andando.

> [!WARNING]
> Si arrancás el filtro *antes* de que `map_server` esté [`active`](https://design.ros2.org/articles/node_lifecycle.html), `/likelihood_map` nunca llega y las partículas no corrigen nunca. Confirmá primero con `ros2 topic echo /likelihood_map --once` que el campo ya está publicado.

## Explicación

Con `map → odom` publicada, cualquier nodo —RViz, un futuro planificador— puede preguntar "¿dónde está el robot en el mapa?" sin saber cómo se corrigió. La diferencia es que ahora sabés qué hay adentro: un conjunto de hipótesis, un modelo de cómo se mueven, y un modelo de qué tan bien explican lo que ve el lidar. Ese mismo patrón —varias hipótesis, pesarlas contra una observación, resamplear— reaparece en muchos otros problemas de robótica más allá de localización.

## Desafío extra

- **Localización global**: hoy el filtro arranca con una nube angosta alrededor de una pose conocida (*tracking*, no relocalización). El mismo algoritmo sirve para localización global con un cambio: inicializar las partículas con distribución uniforme sobre las celdas libres de todo el mapa, y subir bastante `num_particulas`. Probalo y fijate cuánto tarda en converger.
- **Remuestreo condicional (`Neff`)**: hoy se remuestrea en cada `/scan`. El tamaño de muestra efectivo, `Neff = 1 / Σ(peso_i²)` (con pesos normalizados), mide qué tan concentrado está el peso — si ya es alto, remuestrear no suma nada y tira diversidad por la borda. Modificá `recibir_scan()` para remuestrear solo cuando `Neff` cae por debajo de, por ejemplo, `num_particulas / 2`.
