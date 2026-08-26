---
title: "03 · Evasión de obstáculos"
description: "Armá una máquina de estados de 2 estados para esquivar obstáculos con el lidar."
status: listo
duration: "aprox. 90–120 min"
level: intermedio
outcome: "Al terminar, vas a tener a Donatello avanzando y esquivando obstáculos con el lidar."
prerequisites:
  - "Setup completo"
  - "Workshop 01"
  - "Workshop 02"
---

Esta semana armás una máquina de estados de 2 estados para que el robot avance en línea recta, detecte con el lidar que está por chocar, gire un ángulo fijo, y siga avanzando — repitiendo esto para esquivar los obstáculos que se cruce en el camino.

## Resultado de la práctica

Al terminar vas a tener a Donatello moviéndose solo por un mundo con obstáculos, alternando entre avanzar y girar cada vez que el lidar detecta algo demasiado cerca dentro de un cono frontal configurable.

## Antes de empezar

Necesitás el Workshop 01 (timers) y 02 (`Twist` y `/cmd_vel`) completados — esta semana combina las dos ideas. Cloná o actualizá el repo de workshops dentro de tu workspace si todavía no lo hiciste.

> [!CHECK]
> Con el simulador levantado, confirmá que `ros2 topic hz /scan` y `ros2 topic hz /odom` respondan con datos antes de arrancar.

## Concepto mínimo: por qué una máquina de estados

El comportamiento que buscamos (avanzar, y cuando corresponda girar) tiene dos modos claramente distintos, y en cada momento el robot solo puede estar haciendo uno de los dos. La tentación, sin pensarlo como una máquina de estados, es ir agregando variables booleanas sueltas (`girando`, `bloqueado`...) e `if`s repartidos por todo el nodo a medida que aparecen casos nuevos — funciona al principio, pero rápido se vuelve difícil de leer y de debuggear.

Pensar el problema como una máquina de estados obliga a responder dos preguntas separadas: **¿en qué estado estoy?** y **¿qué hace que pase de uno a otro?** Un **estado** representa la situación actual del sistema (acá, `ESTADO_AVANZAR` o `ESTADO_GIRAR` — excluyentes, nunca "un poco en cada uno"). Una **transición** es el cambio de un estado a otro, disparado por un evento, sensor o temporizador.

<figure class="doc-figure">
  <img src="../../media/docs/maquina-estados-evasion.svg" alt="Diagrama de la máquina de estados con dos estados, Avanzar y Girar, y las flechas de transición entre ellos" width="960" height="460" loading="lazy" />
  <figcaption>Dos estados excluyentes y dos transiciones: hay_obstaculo() lleva de Avanzar a Girar; girar lo suficiente vuelve a Avanzar.</figcaption>
</figure>

Para que esto funcione bien arriba de un robot conviene seguir algunas reglas de diseño:

- **El loop principal va en un timer callback**, no en los callbacks de los sensores — si moviéramos el robot directamente desde `recibir_scan()`, la frecuencia de movimiento quedaría atada a la frecuencia (impredecible) del sensor.
- **Los callbacks de sensores solo actualizan variables**, nunca deciden ni mueven el robot — `recibir_scan()` guarda el último [`LaserScan`](https://docs.ros2.org/latest/api/sensor_msgs/msg/LaserScan.html), `recibir_odom()` guarda el yaw actual. Toda la lógica vive en un único lugar.
- **La función de transición está separada de la acción** — decidir si el estado cambia es una cosa, actuar según el estado ya actualizado es otra.
- **Sé verboso**: loguear cada transición ayuda a entender en qué estado está el robot cuando el comportamiento no es el esperado.
- **Visualizá, no solo loguees**: además de tomar una decisión, republicá la porción de datos que usaste para tomarla en su propio topic — acá, qué rayos del lidar caen dentro del cono de detección. Verlo en RViz (semana 05) deja confirmar de un vistazo si los parámetros están calibrados como pensás.

## Implementación

[`evasor.py`](https://github.com/AIRclub-UdeSA/jar_workshops/blob/main/semana-03-evasion-obstaculos/evasion_obstaculos/evasion_obstaculos/evasor.py) ya trae armado todo lo que no es la máquina de estados en sí: los parámetros ROS, los publishers/subscribers, y algunas funciones de apoyo resueltas (`normalizar_angulo()`, `iniciar_giro()`, `angulo_girado()` — la trigonometría de medir cuánto giró el robot con la odometría). Quedan 4 funciones con `TODO`, cada una con una guía en su docstring:

1. **`hay_obstaculo()`** — la percepción: mirar el `LaserScan` y decidir si hay algo demasiado cerca dentro del cono frontal. Además del bool, publica en `scan_cono` la máscara que usó para decidir (ya resuelto), para poder verla en RViz.
2. **`avanzar()`** — un `Twist` que mueve el robot derecho hacia adelante.
3. **`girar()`** — un `Twist` que hace girar al robot en el lugar.
4. **`maquina_de_estados()`** — el corazón del workshop: la transición (cuándo pasar de `AVANZAR` a `GIRAR` y viceversa) y el despacho a `avanzar()` / `girar()` según el estado.

Completalas en ese orden: `hay_obstaculo()` y las dos acciones son piezas chicas y fáciles de probar por separado, antes de escribir la máquina de estados que las usa a las tres.

> [!NOTE]
> También hay dos `TODO` en los archivos de configuración: [`setup.py`](https://github.com/AIRclub-UdeSA/jar_workshops/blob/main/semana-03-evasion-obstaculos/evasion_obstaculos/setup.py) (registrar el ejecutable `evasor` en `entry_points`) y [`package.xml`](https://github.com/AIRclub-UdeSA/jar_workshops/blob/main/semana-03-evasion-obstaculos/evasion_obstaculos/package.xml) (declarar las dependencias que usa `evasor.py`). Sin estos dos, `colcon build` puede fallar o el ejecutable no va a existir aunque el código esté perfecto.

Todos los parámetros son configurables vía `--ros-args -p <nombre>:=<valor>`:

| Parámetro | Default | Qué es |
| --- | --- | --- |
| `angulo_vision_deg` | 60.0 | Ancho total (en grados) del cono frontal donde se busca un obstáculo. |
| `distancia_choque_m` | 0.6 | Distancia (metros) a la que se considera inminente el choque. |
| `velocidad_adelante` | 0.3 | Velocidad lineal (m/s) al avanzar. |
| `velocidad_angular` | 1.0 | Velocidad angular (rad/s) al girar. |
| `angulo_giro_deg` | 110.0 | Magnitud fija del giro cada vez que se detecta un obstáculo. |

## Ejecución

```bash
# Terminal 1 — build
cd ~/rosmaster_ws
colcon build --packages-select evasion_obstaculos
source install/setup.bash
```

El simulador trae varios mundos con obstáculos para esquivar. Para ver cuáles hay instalados:

```bash
ls "$(ros2 pkg prefix yahboom_rosmaster_gazebo)/share/yahboom_rosmaster_gazebo/worlds/"
```

```bash
# Terminal 2 — simulador, con un mundo con obstáculos (acá, cafe.world)
source install/setup.bash
ros2 launch yahboom_rosmaster_gazebo rosmaster_gazebo_fortress.launch.py \
  world:="$(ros2 pkg prefix yahboom_rosmaster_gazebo)/share/yahboom_rosmaster_gazebo/worlds/cafe.world" \
  motion_profile:=ideal
```

```bash
# Terminal 3 — nuestro nodo
source install/setup.bash
ros2 run evasion_obstaculos evasor --ros-args \
  -p angulo_vision_deg:=90.0 -p distancia_choque_m:=0.6 -p angulo_giro_deg:=110.0
```

> [!WARNING]
> Esperá a ver en la Terminal 2 el mensaje de odometría publicándose antes de correr el nodo. Usamos `motion_profile:=ideal` (sin resbalamiento de ruedas) mientras se prueba la lógica; una vez que funciona, probar con el default (`motion_profile:=stress`, más realista) es un buen próximo paso.

## Comprobación

En una cuarta terminal:

```bash
ros2 topic hz /scan_cono   # solo se publica desde adentro de hay_obstaculo()
```

Donatello debería avanzar en línea recta hasta acercarse a un obstáculo, girar el ángulo configurado, y retomar el avance — repitiendo el patrón por todo el mundo. Los logs de transición te muestran en qué estado está en cada momento.

> [!QUESTION]
> Si el robot gira antes de tiempo o choca igual, ¿el problema está más probablemente en `hay_obstaculo()` (percepción) o en `maquina_de_estados()` (transición)? Aislá cada parte con logs para confirmarlo.

## Explicación: el ángulo del lidar en Donatello

El ángulo 0° de un `LaserScan` es relativo al frame del sensor (`laser_link`), no al frente del robot. En Donatello, el lidar está montado con 180° de yaw fijo (ver `lidar.urdf.xacro` en `yahboom_rosmaster_description`), así que el 0° del scan apunta para atrás — por eso `angulo_frente_deg` tiene default `180.0` y no `0.0`. Es un buen ejemplo de por qué conviene revisar siempre el frame de un sensor antes de asumir que sus ángulos coinciden con los del chasis.
