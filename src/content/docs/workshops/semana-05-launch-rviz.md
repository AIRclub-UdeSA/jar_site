---
title: "05 · Launch files y RViz"
description: "Dejá de abrir cuatro terminales a mano: armá un launch file y guardá tu configuración de RViz."
status: listo
duration: "aprox. 60–90 min"
level: intermedio
outcome: "Al terminar, vas a levantar simulador, nodos y RViz con un solo comando."
prerequisites:
  - "Setup completo"
  - "Workshop 03"
  - "Workshop 04"
---

## La práctica

<section class="doc-practice-plate" aria-labelledby="la-práctica">
  <div class="doc-practice-intro">
    <p class="doc-practice-statement">Lanzar.<br />Visualizar.<br />Reusar.</p>
    <p class="doc-practice-note">Aprendés las dos herramientas que veníamos esquivando a mano: launch files para levantar varios nodos de una sola vez, y configuraciones de RViz para no rearmar la vista cada vez que la abrís.</p>
  </div>

  <dl class="doc-practice-facts">
    <div>
      <dt>Herramientas</dt>
      <dd>Launch file + config RViz</dd>
    </div>
    <div>
      <dt>Lanza</dt>
      <dd>Simulador + nodos + RViz</dd>
    </div>
    <div>
      <dt>Reusa</dt>
      <dd>Semana 03 (ejemplo resuelto) y 04 (el ejercicio)</dd>
    </div>
    <div>
      <dt>Comando</dt>
      <dd><code>ros2 launch</code></dd>
    </div>
  </dl>
</section>

## Antes de empezar

<ol class="doc-preflight" aria-label="Preparación del workshop">
  <li>
    <span class="doc-preflight-index" aria-hidden="true">01</span>
    <div class="doc-preflight-copy">
      <h3>Semana 03</h3>
      <p>Necesitás el evasor de la <a href="../semana-03-evasion-obstaculos/">semana 03</a> completo y funcionando.</p>
    </div>
  </li>
  <li>
    <span class="doc-preflight-index" aria-hidden="true">02</span>
    <div class="doc-preflight-copy">
      <h3>Semana 04</h3>
      <p>Necesitás la detección de color de la <a href="../semana-04-deteccion-color/">semana 04</a> completa y funcionando — acá no se resuelve ningún workshop nuevo, se lanzan los que ya hiciste.</p>
    </div>
  </li>
  <li>
    <span class="doc-preflight-index" aria-hidden="true">03</span>
    <div class="doc-preflight-copy">
      <h3>Chequeo</h3>
      <p>Confirmá que podés correr <code>evasor</code> y <code>detector</code>/<code>detector_scan</code> a mano, como en las semanas anteriores, antes de empezar a automatizarlo.</p>
    </div>
  </li>
</ol>

## Concepto mínimo: qué describe un launch file

Un [launch file](https://docs.ros.org/en/lyrical/Tutorials/Intermediate/Launch/Launch-Main.html) es un archivo de Python que **describe** qué procesos hay que lanzar — no es un script que corre de arriba a abajo, es una descripción que el sistema de launch lee y ejecuta por su cuenta. Tres reglas lo definen: el archivo termina en `.launch.py`, adentro hay una función `generate_launch_description()` sin argumentos, y esa función devuelve un `LaunchDescription`. Ya lo veniás usando sin darte cuenta: es lo que hacía `ros2 launch yahboom_rosmaster_gazebo rosmaster_gazebo_fortress.launch.py`.

`launch_rviz` no tiene código Python propio, ningún nodo — solo launch files y configuraciones de RViz. Este tipo de paquete es tan común en ROS 2 que tiene nombre propio, **bringup** ("levantar el sistema"), y se lo suele nombrar `algo_bringup` — como `yahboom_rosmaster_bringup`, mismo patrón con otro nombre.

Cada nodo se declara con `Node(...)`, el equivalente declarado de un `ros2 run`:

```python
evasor = Node(
    package='evasion_obstaculos',  # igual que en ros2 run <paquete> ...
    executable='evasor',           # la clave que registraste en entry_points
    name='evasor',
    output='screen',               # sin esto, los logs no aparecen en la terminal
    parameters=parametros_evasor,  # los mismos que antes iban en --ros-args -p
)
```

Dos cosas que suelen confundir al principio:

- **`LaunchDescription` no es una secuencia de pasos**: lanza todo en paralelo, que es justo lo que querés porque son procesos independientes que se encuentran solos a través de los tópicos. Y RViz también es un nodo — se lanza con el mismo `Node(...)`, con `package` y `executable` en `'rviz2'`.
- **`output='screen'` no es decorativo**: sin eso, los logs del nodo van a un archivo y parece que no hace nada.

El `simulador` que se suma al `LaunchDescription` no es un `Node` nuevo, es el launch del simulador entero, metido adentro con `IncludeLaunchDescription` en vez de reescribirlo:

```python
simulador = IncludeLaunchDescription(
    PythonLaunchDescriptionSource(launch_simulador),
    launch_arguments={
        'world': LaunchConfiguration('world'),
        'motion_profile': 'ideal',
        'rviz': 'false',
    }.items(),
)
```

`launch_arguments` espera pares clave-valor (de ahí el `.items()` final), los valores van siempre como texto —hasta los booleanos: `'false'` entre comillas, no `False` de Python— y `rviz:='false'` es clave: el launch del simulador trae su propio RViz, y si no lo apagás se te abren dos.

**Parámetro ROS vs. argumento de launch** son dos cosas parecidas pero distintas: un argumento de launch (`DeclareLaunchArgument`) lo lee el launch file y se pasa con `ros2 launch ... x:=2.0`; un parámetro ROS (`self.declare_parameter`) lo lee el nodo y se pasa con `--ros-args -p x:=2.0`. Se usan juntos para evitar repetir un valor en varios nodos: declarás el argumento una vez y lo enchufás como parámetro de cada uno con `LaunchConfiguration('x')`. Ojo: `LaunchConfiguration` siempre devuelve texto, así que si el nodo espera un `float` hay que convertirlo con `ParameterValue(LaunchConfiguration('x'), value_type=float)`.

> [!NOTE]
> Cuando corre el simulador hay **dos relojes**: el de tu computadora y el de la simulación (que Gazebo publica en `/clock`). Si un nodo usa el reloj equivocado, los timestamps no coinciden y aparecen síntomas raros — RViz parpadea, o una transformada tf2 "no se encuentra". La solución es pasarle `parameters=[{'use_sim_time': True}]` a **todos** los nodos, RViz incluido, siempre que el simulador esté corriendo.

`get_package_share_directory(...)` no apunta a donde escribís el código, sino a la carpeta **instalada** (`install/<paquete>/share/...`) — y `colcon build` solo copia ahí lo que está declarado en `data_files` de `setup.py`. Por eso, cada vez que agregás o modificás un `.launch.py` o un `.rviz`, hay que volver a compilar.

### RViz: dibuja lo que ya está publicado

**Gazebo** simula: tiene la física, los objetos, el robot, y genera los datos. **RViz** no simula nada — solo dibuja lo que ya está publicado en los tópicos. Si algo no aparece, hay dos causas distintas: o el dato no se está publicando (se chequea con `ros2 topic hz`), o se publica pero RViz no lo dibuja (problema de configuración). Si RViz directamente no te abre, es un problema de setup y no de este workshop — lo cubre la página "Gazebo y RViz" de la [guía de instalación](../../setup/).

El **Fixed Frame** (en Global Options) es el marco de referencia contra el que se dibuja todo lo demás — acá va en `odom`, porque con `base_link` el robot queda quieto en el centro y el mundo se mueve alrededor.

| Frame | Qué es |
| --- | --- |
| `odom` | punto donde arrancó el robot; fijo respecto del mundo pero deriva con el tiempo |
| `base_footprint` / `base_link` | el robot; se mueve respecto de `odom` |
| `laser_link` | el lidar, montado sobre el robot |

Cada **display** dibuja un tópico. Los que usás en estos workshops:

| Display | Tópico | Para qué |
| --- | --- | --- |
| `LaserScan` | `/scan` | lo que ve el lidar (semana 03) |
| `LaserScan` | `/scan_cono` | solo los rayos dentro del cono que usa el evasor para decidir choque (semana 03) |
| `LaserScan` | `/scan_rojo` | solo los rayos que dieron contra algo rojo (semana 04) |
| `Image` | `/cam_1/color/image_raw` | lo que ve la cámara (semana 04) |
| `RobotModel` | `/robot_description` | el robot dibujado |
| `TF` | — | los ejes de cada frame |
| `Grid` | — | el piso, como referencia |

El truco que se repite en estos workshops: mostrar dos `LaserScan` superpuestos, el `/scan` completo (chico, gris) y una versión filtrada del mismo scan en otro color y más grande (`/scan_cono` en semana 03, `/scan_rojo` en semana 04) — así se ve de un vistazo qué subconjunto de rayos está usando el nodo para decidir algo.

Si un tópico publica (confirmado con `ros2 topic hz`) pero el display no muestra nada sin marcar error de transformada, es casi siempre [**QoS**](https://docs.ros.org/en/lyrical/Concepts/Intermediate/About-Quality-of-Service-Settings.html): los sensores publican con *Reliability* en `Best Effort` (así llega `/scan`, desde el bridge de Gazebo), y un display en `Reliable` nunca se conecta a un publisher `Best Effort`. La solución es abrir el display, ir a **Topic** y poner *Reliability Policy* en `Best Effort` — pero solo si el nodo del otro lado también lo usa; `/scan_cono`, por ejemplo, lo publica `evasor.py` sin tocar el QoS, así que queda en `Reliable` por default (distinto de `/scan`).

## Implementación

**El orden importa más que en otros workshops**: los dos primeros TODOs van antes que nada, porque sin ellos `ros2 launch` no encuentra ningún archivo del paquete `launch_rviz`.

1. **[`setup.py`](https://github.com/AIRclub-UdeSA/jar_workshops/blob/main/semana-05-launch-rviz/launch_rviz/setup.py) — `data_files`**: instalar las carpetas `launch/` y `rviz/` en `share/` (dos líneas para descomentar). `entry_points` queda vacío a propósito: este paquete no tiene nodos propios.
2. **[`package.xml`](https://github.com/AIRclub-UdeSA/jar_workshops/blob/main/semana-05-launch-rviz/launch_rviz/package.xml) — `<exec_depend>`**: acá va `<exec_depend>` y no `<depend>`, porque este paquete no compila contra nada, solo lanza cosas de otros paquetes en tiempo de ejecución.

Con esos dos hechos, compilá y confirmá con `ros2 launch launch_rviz evasion.launch.py --show-args` (arma la descripción y lista sus argumentos sin lanzar nada) que el paquete se instaló bien.

Abrí después [`evasion.launch.py`](https://github.com/AIRclub-UdeSA/jar_workshops/blob/main/semana-05-launch-rviz/launch_rviz/launch/evasion.launch.py): **ya viene completo**, y es el que hay que leer antes de escribir nada — ahí está resuelto el patrón que tenés que reproducir en `deteccion_color.launch.py`. En ese archivo sí hay TODOs, con menos ayuda a propósito:

3. **El nodo `detector`**, con `parameters=parametros_color` — mismo patrón que el `Node` del evasor.
4. **El nodo `detector_scan`**, del mismo paquete y con los mismos parámetros.
5. **RViz**, apuntando a `rviz/deteccion_color.rviz` — mismo `Node` de `rviz2` que en `evasion.launch.py`, solo cambia el archivo.
6. **Sumar los tres al `LaunchDescription`.**

Y además, armar `rviz/deteccion_color.rviz` **desde la GUI** (no se escriben a mano): con el launch corriendo, agregá los displays `Image` en `/cam_1/color/image_raw`, `LaserScan` en `/scan` (gris, chico) y en `/scan_rojo` (rojo, grande), más `RobotModel` y `Grid`, con Fixed Frame en `odom`. Usá [`evasion.rviz`](https://github.com/AIRclub-UdeSA/jar_workshops/blob/main/semana-05-launch-rviz/launch_rviz/rviz/evasion.rviz) (que ya viene armado) de referencia. Guardalo con **`File > Save Config As`** — nunca `Save Config` a secas, que guarda en tu config personal y no viaja con el repo — dentro de `launch_rviz/rviz/deteccion_color.rviz`, y volvé a compilar.

> [!NOTE]
> Aunque no se escriban a mano, conviene abrir un `.rviz` con un editor de texto una vez: es YAML, y se reconoce sin problema qué tocaste en la GUI (`Fixed Frame: odom`, `Value: /scan` de cada tópico, los colores en RGB) — deja de ser una caja negra.

## Ejecución

```bash
cd ~/rosmaster_ws
colcon build --packages-select launch_rviz
source ~/rosmaster_ws/install/setup.bash
```

```bash
# Semana 03 — simulador + evasor + RViz, en una sola terminal
ros2 launch launch_rviz evasion.launch.py
```

```bash
# Semana 04 — simulador + detector + detector_scan + RViz
ros2 launch launch_rviz deteccion_color.launch.py
```

Los argumentos de launch se pasan igual que ya veías con `world:=`, por ejemplo `ros2 launch launch_rviz evasion.launch.py distancia_choque_m:=0.4`. `Ctrl-C` en esa terminal baja todos los procesos de una.

## Comprobación

Semana 03:

```bash
ros2 node list                          # tienen que estar todos los nodos del launch
ros2 topic hz /scan                     # si no publica, el problema no es de RViz
ros2 topic hz /scan_cono                # solo se publica desde adentro de hay_obstaculo()
ros2 param get /evasor use_sim_time     # tiene que decir True
```

Semana 04:

```bash
ros2 node list                          # tienen que estar todos los nodos del launch
ros2 topic hz /cam_1/color/image_raw    # confirma que la cámara publica
ros2 topic hz /scan_rojo                # solo aparece mientras hay rojo a la vista
```

`ros2 param get <nombre> use_sim_time` es el mejor chequeo cuando algo parpadea en RViz o tf2 se queja de transformadas: si dice `False`, falta ese parámetro en ese nodo.

> [!WARNING]
> Gazebo tarda unos segundos en levantar: es normal ver al principio algún error quejándose de que todavía no llegan datos. Si sigue igual pasados unos 15 segundos, ahí sí hay algo mal.

## Explicación: infraestructura para lo que sigue

Esto no es un tema cerrado, es la infraestructura que los workshops siguientes dan por sentada. De acá en adelante, cuando un workshop diga "agregá tu nodo al launch" es sumar un `Node(...)` a un archivo de `launch_rviz/launch/`; cuando diga "agregá este display a tu RViz" es agregarlo desde la GUI y volver a guardar con `Save Config As`. En vez de cuatro terminales con comandos largos repetidos a mano —y el riesgo de que un parámetro quede desincronizado entre dos de ellas—, correr Donatello contra cualquier workshop nuevo va a ser, de ahora en más, un solo `ros2 launch`.

Dos displays más van a aparecer más adelante y ya tienen dónde enchufarse: el `Map` (cuando haya un mapa que mostrar) y el `Pose` del robot en el frame `map` (workshop de localización).
