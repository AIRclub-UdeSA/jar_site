---
title: "04 · Detección de color"
description: "Detectá un cuadrado rojo con la cámara y proyectalo sobre el lidar para saber a qué distancia está."
status: listo
duration: "aprox. 120–180 min"
level: avanzado
outcome: "Al terminar, vas a saber a qué distancia y ángulo está un objeto rojo combinando cámara y lidar."
prerequisites:
  - "Setup completo"
  - "Workshop 03"
---

## La práctica

<section class="doc-practice-plate" aria-labelledby="la-práctica">
  <div class="doc-practice-intro">
    <p class="doc-practice-statement">Detectar.<br />Proyectar.<br />Ubicar.</p>
    <p class="doc-practice-note">Dos nodos, dos partes: primero detectar un cuadrado rojo con la cámara, después proyectar el lidar sobre esa detección para saber a qué distancia y ángulo está.</p>
  </div>

  <dl class="doc-practice-facts">
    <div>
      <dt>Sensores</dt>
      <dd>Cámara + lidar</dd>
    </div>
    <div>
      <dt>Color</dt>
      <dd><code>HSV</code></dd>
    </div>
    <div>
      <dt>Partes</dt>
      <dd>2 · <code>detector</code> / <code>detector_scan</code></dd>
    </div>
    <div>
      <dt>Salida</dt>
      <dd>Distancia y ángulo reales</dd>
    </div>
  </dl>
</section>

## Antes de empezar

<ol class="doc-preflight" aria-label="Preparación del workshop">
  <li>
    <span class="doc-preflight-index" aria-hidden="true">01</span>
    <div class="doc-preflight-copy">
      <h3>Workshop 03</h3>
      <p>Necesitás el <a href="../semana-03-evasion-obstaculos/">Workshop 03</a> completo: acá se reusa la misma separación entre callback de sensor y timer de decisión.</p>
    </div>
  </li>
  <li>
    <span class="doc-preflight-index" aria-hidden="true">02</span>
    <div class="doc-preflight-copy">
      <h3>Simulador</h3>
      <p>Levantalo antes de arrancar — esta semana además usás la cámara, no solo el lidar.</p>
    </div>
  </li>
  <li>
    <span class="doc-preflight-index" aria-hidden="true">03</span>
    <div class="doc-preflight-copy">
      <h3>Chequeo</h3>
      <p>Confirmá <code>ros2 topic hz /cam_1/color/image_raw</code> antes de arrancar.</p>
    </div>
  </li>
</ol>

## Concepto mínimo: por qué HSV y no RGB

En una imagen RGB, el rojo no es "un color": es una región difusa de un espacio de 3 dimensiones que además se mueve mucho con la iluminación — un rojo bajo sombra tiene valores muy distintos al mismo rojo bajo luz directa. [HSV](https://docs.opencv.org/4.x/de/d25/imgproc_color_conversions.html) (Hue/Matiz, Saturation/Saturación, Value/Brillo) separa "qué color es" (H) de "qué tan intenso" (S) y "qué tan claro" (V). La luz cambia sobre todo S y V y deja H relativamente estable, así que filtrar por un rango de H es mucho más robusto a la iluminación que filtrar por RGB.

H se mide en grados alrededor de un círculo ([OpenCV](https://docs.opencv.org/4.x/index.html) lo comprime a 0-179). El rojo está en 0°, así que un rojo puro aparece tanto cerca de 0 como cerca de 180 — por eso hacen falta **dos rangos de H** para capturar todos los rojos, y no alcanza con un solo [`cv2.inRange`](https://docs.opencv.org/4.x/d2/de8/group__core__array.html#ga48af0ab51e36436c5d04340e036ce981). Esto no pasa con el azul, que cae cómodo en un solo rango.

Igual que en la semana 03, conviene separar quién guarda datos de quién decide: el callback de la cámara (`recibir_imagen`) solo convierte la imagen con `cv_bridge` y la guarda, no procesa nada. Un timer (`procesar_imagen`), corriendo a frecuencia fija, es el que agarra la última imagen guardada y decide si hay un cuadrado rojo. Solo se publica cuando hay un cuadrado — el topic es un aviso, no un estado continuo — pero conviene loguear siempre las transiciones (de "veo" a "no veo" y viceversa), aunque el `False` no se publique.

## Implementación — Parte 1

[`detector.py`](https://github.com/AIRclub-UdeSA/jar_workshops/blob/main/semana-04-deteccion-color/deteccion_color/deteccion_color/detector.py) ya trae resuelto lo que no es la detección en sí: los parámetros ROS, el publisher/subscriber, la conversión de `Image` a array de OpenCV (`recibir_imagen`), y `area_mayor_contorno` (busca contornos con `cv2.findContours` y devuelve el área del más grande). Quedan 3 funciones con `TODO`:

1. **`mascara_rojo()`** — la percepción: dada una imagen en HSV, devolver una máscara binaria de qué píxeles son rojos, combinando los dos rangos de H.
2. **`hay_cuadrado_rojo()`** — usa `mascara_rojo()` y `area_mayor_contorno()` para decidir si lo que ve la cámara ahora mismo cuenta como un cuadrado rojo.
3. **`procesar_imagen()`** — el timer callback que arma el `Bool`, lo publica, y loguea solo cuando el valor cambia.

Completalas en ese orden: `mascara_rojo()` es la pieza chica y fácil de probar por separado (mirando la máscara con `cv2.imshow` o contando píxeles) antes de escribir la lógica que la usa.

> [!NOTE]
> Los parámetros de HSV (`hue_rojo_bajo_1`, `hue_rojo_alto_1`, `hue_rojo_bajo_2`, `hue_rojo_alto_2`, `saturacion_min`, `valor_min`) y `area_minima_px` son todos configurables por `--ros-args -p`. Si el rojo real queda muy pálido u oscuro bajo la luz del simulador, es normal tener que calibrar `saturacion_min`/`valor_min` a ojo, mirando la imagen, en vez de confiar ciegamente en los defaults.

## Ejecución — Parte 1

```bash
# Terminal 1 — build
cd ~/rosmaster_ws
colcon build --packages-select deteccion_color
source ~/rosmaster_ws/install/setup.bash
```

Hay varios mundos con cuadrados de colores para detectar (sufijo `_victimas`). Para ver cuáles hay instalados:

```bash
ls "$(ros2 pkg prefix yahboom_rosmaster_gazebo)/share/yahboom_rosmaster_gazebo/worlds/"
```

Podés elegir cualquiera de los `_victimas`; acá usamos `laberinto_simple_victimas.world` como ejemplo:

```bash
# Terminal 2 — simulador, con un mundo con cuadrados de color
source ~/rosmaster_ws/install/setup.bash
ros2 launch yahboom_rosmaster_bringup rosmaster_x3_sim.launch.py \
  world:="$(ros2 pkg prefix yahboom_rosmaster_gazebo)/share/yahboom_rosmaster_gazebo/worlds/laberinto_simple_victimas.world" \
  motion_profile:=ideal
```

```bash
# Terminal 3 — Parte 1
source ~/rosmaster_ws/install/setup.bash
ros2 run deteccion_color detector
```

El robot arranca sin ningún cuadrado a la vista, así que hace falta manejarlo con teleoperación por teclado hasta ponerlo frente a uno:

```bash
# Terminal 4 — teleop
source ~/rosmaster_ws/install/setup.bash
ros2 run teleop_twist_keyboard teleop_twist_keyboard
```

## Implementación — Parte 2

`detector.py` contesta una pregunta binaria — ¿hay rojo ahora? — pero no dice **dónde** está el cuadrado respecto del robot. El lidar sí mide distancia y ángulo con precisión, pero no tiene idea de colores. Esta parte se resuelve en [`detector_scan.py`](https://github.com/AIRclub-UdeSA/jar_workshops/blob/main/semana-04-deteccion-color/deteccion_color/deteccion_color/detector_scan.py), combinando los dos sensores: para cada punto que devuelve el lidar, preguntarse "si la cámara estuviera mirando justo donde apunta este rayo, ¿qué píxel le tocaría?", y mirar si ese píxel es rojo.

Para proyectar un punto 3D a un píxel hacen falta dos cosas: dónde está la cámara respecto del lidar (la transformada entre `laser_link` y el frame óptico de la cámara, que `robot_state_publisher` ya publica en [tf2](https://docs.ros.org/en/humble/Tutorials/Intermediate/Tf2/Tf2-Main.html) a partir del URDF — no hace falta medirla a mano), y el modelo *pinhole* de la cámara (`u = fx * x/z + cx`, `v = fy * y/z + cy`, con los intrínsecos publicados en `sensor_msgs/CameraInfo`). Con eso, cada punto del `/scan` (polar, en el frame del lidar) se pasa a cartesiano, se rota/traslada al frame de la cámara, y se proyecta a un píxel.

<figure class="doc-figure">
  <img src="../../media/docs/proyeccion-lidar-camara.svg" alt="Animación de los 360° del lidar alrededor del robot: casi todos los rayos llegan al límite del rango sin encontrar nada, salvo tres que pegan contra el cuadrado rojo y quedan prendidos, junto con los puntos correspondientes en la vista de cámara" width="860" height="520" loading="lazy" />
  <figcaption>De los 360° del lidar, solo los rayos que pegan contra el cuadrado rojo quedan prendidos — y en la vista de cámara, solo los puntos que caen dentro de esa misma máscara roja.</figcaption>
</figure>

> [!WARNING]
> El lidar escanea en un plano horizontal a altura fija. Si el cuadrado rojo es una marca chata pegada al piso, la cámara lo ve perfecto pero el lidar nunca la va a tocar — no hay calibración que arregle eso.

Antes de arrancar, copiá tu `mascara_rojo()` ya resuelta de `detector.py` (acá es una función suelta, porque este nodo corre solo, sin depender de `detector.py`). El resto de la plomería ya está resuelta: parámetros, suscripciones a la cámara y al `/scan`, los callbacks que solo guardan datos, y la búsqueda de la transformada en tf2. Quedan 3 `TODO`:

1. **El publisher de `/scan_rojo`** — a diferencia de la Parte 1, no está creado: hay que declararlo a mano en `__init__` con `create_publisher`.
2. **`puntos_laser_a_pixeles()`** — la geometría: dado un array de rangos/ángulos del lidar más la transformada y los intrínsecos, devolver a qué píxel correspondería cada punto (y si quedó adelante o detrás de la cámara), todo vectorizado con numpy.
3. **`recibir_scan()`** — el callback del `/scan` que junta todo: pide la transformada, arma los puntos, los proyecta, arma la máscara roja de la última imagen, decide qué puntos son rojos, y publica el `LaserScan` filtrado.

> [!NOTE]
> Los `TODO` de configuración de la Parte 1 ([`setup.py`](https://github.com/AIRclub-UdeSA/jar_workshops/blob/main/semana-04-deteccion-color/deteccion_color/setup.py) y [`package.xml`](https://github.com/AIRclub-UdeSA/jar_workshops/blob/main/semana-04-deteccion-color/deteccion_color/package.xml)) son compartidos con la Parte 2: cuando llegues acá vas a tener que volver a tocarlos para sumar el ejecutable `detector_scan` y la dependencia nueva que no usaba la Parte 1, `tf2_ros`.

## Ejecución — Parte 2

No hace falta tener `detector` y `detector_scan` corriendo a la vez, son procesos independientes — solo cambia qué ejecutable corrés en la Terminal 3:

```bash
# Terminal 1 — build
cd ~/rosmaster_ws
colcon build --packages-select deteccion_color
source ~/rosmaster_ws/install/setup.bash
```

```bash
# Terminal 2 — simulador, con un mundo con cuadrados de color
source ~/rosmaster_ws/install/setup.bash
ros2 launch yahboom_rosmaster_bringup rosmaster_x3_sim.launch.py \
  world:="$(ros2 pkg prefix yahboom_rosmaster_gazebo)/share/yahboom_rosmaster_gazebo/worlds/laberinto_simple_victimas.world" \
  motion_profile:=ideal
```

```bash
# Terminal 3 — Parte 2
source ~/rosmaster_ws/install/setup.bash
ros2 run deteccion_color detector_scan
```

```bash
# Terminal 4 — teleop
source ~/rosmaster_ws/install/setup.bash
ros2 run teleop_twist_keyboard teleop_twist_keyboard
```

## Comprobación

```bash
ros2 topic echo /rojo_detectado        # Parte 1 — solo aparece mientras ve un cuadrado rojo
ros2 topic echo /scan_rojo             # Parte 2 — rangos finitos solo en las direcciones "rojas"
```

En RViz, agregar un segundo display `LaserScan` apuntando a `/scan_rojo` (con otro color) sobre el `/scan` completo es una buena forma de ver exactamente qué rayos está clasificando como rojos.

> [!QUESTION]
> Si `/rojo_detectado` funciona pero `/scan_rojo` nunca marca nada, ¿el problema está más probablemente en la proyección geométrica o en que el cuadrado esté fuera del plano que barre el lidar?

## Explicación: dos sensores, un mismo objeto

Esta semana es el primer punto donde Donatello combina dos sensores para entender algo que ninguno de los dos puede solo: la cámara sabe *qué* color hay, el lidar sabe con precisión *dónde* queda. Esa combinación —proyectar un sensor sobre otro usando la geometría del robot (tf2) en vez de asumir posiciones a mano— es la misma técnica que se usa en robots reales para fusionar cualquier par de sensores montados en distintos puntos del chasis, y va a reaparecer cada vez que Donatello necesite ubicar algo en el mundo con más de un sensor.
