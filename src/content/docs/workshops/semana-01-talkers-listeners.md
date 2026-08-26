---
title: "01 · Talkers y listeners"
description: "Completá un talker y un listener para entender cómo se comunican dos nodos de ROS 2."
status: listo
duration: "aprox. 60–90 min"
level: inicial
outcome: "Al terminar, vas a poder publicar y suscribirte a un topic completando el código vos mismo."
prerequisites:
  - "Setup completo"
---

Este es el primer workshop, pensado para alguien que nunca tocó ROS 2. La idea es armar el ejemplo más chico posible que igual use las piezas que se van a repetir en todos los workshops que siguen: un nodo que publica algo a frecuencia fija (`talker.py`) y otro que lo escucha y lo loguea (`listener.py`). No hay lidar, ni cámara, ni robot moviéndose — a propósito: la meta acá no es resolver un problema de robótica, es entender cómo se comunican dos programas de ROS 2 entre sí, sin que un sensor real complique el ejemplo.

## Resultado de la práctica

Al terminar vas a tener dos nodos comunicándose por el topic `mensaje`: un talker que publica un `std_msgs/String` una vez por segundo, y un listener que se suscribe y lo recibe. Los vas a completar vos: el código trae `TODO`s comentados en el lugar exacto donde falta una línea.

## Antes de empezar

`rclpy` y `std_msgs` ya vienen con `ros-humble-desktop`, así que no hace falta instalar nada extra esta semana. Cloná el repo de workshops dentro de tu workspace (el mismo donde tenés `yahboom_rosmaster`):

```bash
cd ~/rosmaster_ws/src
git clone https://github.com/AIRclub-UdeSA/jar_workshops.git
```

> [!CHECK]
> Con el workspace armado, ejecutá `source ~/rosmaster_ws/install/setup.bash` y confirmá que `ros2 node list` responda sin errores.

## Concepto mínimo: nodos, topics y timers

Un [nodo](https://docs.ros.org/en/humble/Tutorials/Beginner-CLI-Tools/Understanding-ROS2-Nodes/Understanding-ROS2-Nodes.html) es un programa que corre dentro de ROS 2 y puede hablar con otros nodos. En un robot real puede haber decenas corriendo a la vez — uno que lee el lidar, otro la cámara, otro que mueve las ruedas — cada uno un proceso separado. Los nodos no se conocen entre sí directamente: se comunican a través de [topics](https://docs.ros.org/en/humble/Tutorials/Beginner-CLI-Tools/Understanding-ROS2-Topics/Understanding-ROS2-Topics.html), canales con nombre (acá, `mensaje`) a los que unos publican y otros se suscriben, sin necesitarse mutuamente para funcionar.

Cada topic tiene un tipo de mensaje fijo — usamos [`std_msgs/String`](https://docs.ros2.org/latest/api/std_msgs/msg/String.html), el más simple que hay. Publisher y subscriber tienen que declarar el mismo tipo para el mismo topic, o ROS 2 no los deja conectarse. El tamaño de cola que le pasás a `create_publisher`/`create_subscription` (acá, `10`) es cuántos mensajes sin procesar guarda ROS 2 como máximo antes de descartar los más viejos; con un mensaje por segundo casi nunca se llena, pero en sensores más rápidos importa más.

El talker no publica "cuando quiere": publica a un ritmo fijo con un **timer**.

```python
self.timer = self.create_timer(1.0, self.publicar)
```

Esto le dice a ROS 2 "llamá a `self.publicar` cada 1.0 segundos mientras el nodo esté vivo". Usar un timer en vez de, por ejemplo, un `while True` con `time.sleep(1.0)` es lo que se repite en todos los workshops siguientes: le deja a ROS 2 el control de cuándo se ejecuta cada cosa, y permite que un mismo nodo tenga varios timers y callbacks corriendo intercalados sin pisarse.

> [!NOTE]
> Una regla que va a importar desde la semana 03 en adelante, cuando aparezcan sensores reales: **el callback de un sensor solo debería guardar el último dato recibido en una variable, nunca decidir ni actuar ahí adentro.** La lógica que decide va en un timer callback aparte, a una frecuencia fija y conocida — porque distintos sensores publican a ritmos distintos e impredecibles entre sí.

## Implementación

Los dos archivos del paquete `talkers_listeners`, [`talker.py`](https://github.com/AIRclub-UdeSA/jar_workshops/blob/main/semana-01-talkers-listeners/talkers_listeners/talkers_listeners/talker.py) y [`listener.py`](https://github.com/AIRclub-UdeSA/jar_workshops/blob/main/semana-01-talkers-listeners/talkers_listeners/talkers_listeners/listener.py), tienen `TODO`s simples: líneas ya escritas, comentadas, que solo hay que descomentar en el lugar indicado. No hay que escribir código nuevo — la idea es que el primer contacto sea leer y entender qué hace cada línea.

Completalos en este orden, probando cada uno antes de pasar al siguiente:

1. **`talker.py` primero.** Tiene 3 `TODO`s: crear el publisher, crear el timer, y publicar el mensaje dentro de `publicar()`. Compilá y corré *solo* el talker, y confirmá con `ros2 topic echo /mensaje` que está publicando antes de tocar el listener.
2. **`listener.py`, después.** Tiene 1 `TODO`: suscribirse al topic `mensaje`. Con el talker ya andando en una terminal, corré el listener en otra y confirmá en sus logs que va recibiendo cada mensaje.

> [!NOTE]
> Todo paquete `ament_python` necesita [`package.xml`](https://github.com/AIRclub-UdeSA/jar_workshops/blob/main/semana-01-talkers-listeners/talkers_listeners/package.xml) (declara dependencias con `<depend>`) y [`setup.py`](https://github.com/AIRclub-UdeSA/jar_workshops/blob/main/semana-01-talkers-listeners/talkers_listeners/setup.py) (registra en `entry_points` qué ejecutables expone el paquete). Esta semana ya vienen completos — alcanza con mirarlos una vez, porque de acá en adelante los vas a tener que tocar vos.

## Ejecución

```bash
# Terminal 1 — build
cd ~/rosmaster_ws
colcon build --packages-select talkers_listeners
source install/setup.bash
```

```bash
# Terminal 2 — el talker (probalo solo, primero)
source install/setup.bash
ros2 run talkers_listeners talker
```

```bash
# Terminal 3 — chequeo mientras el talker corre solo
ros2 topic echo /mensaje
```

Una vez confirmado que el talker publica, y con `listener.py` ya completado:

```bash
# Terminal 3 — el listener
source install/setup.bash
ros2 run talkers_listeners listener
```

## Comprobación

Con las dos terminales corriendo a la vez, cada mensaje que loguea el talker debería aparecer logueado como recibido en el listener, un segundo después: `Publiqué: "Hola desde el talker, mensaje N"` de un lado, `Recibí: "..."` del otro, con `N` incrementando.

> [!QUESTION]
> Cerrá el talker y dejá el listener corriendo. ¿Qué cambia en `ros2 topic info /mensaje`? El topic sigue declarado por el suscriptor, pero deja de recibir datos hasta que aparece otro publisher.

## Explicación: el mismo patrón con Donatello

Con el simulador levantado (ver la [guía del simulador](../../setup/simulador/#6-teleoperación)), sumá una tercera terminal con la teleoperación por teclado:

```bash
ros2 run teleop_twist_keyboard teleop_twist_keyboard
```

Y en una cuarta, inspeccioná el topic real del robot mientras manejás:

```bash
ros2 topic echo /cmd_vel
```

Es el mismo patrón que tu talker y listener, pero con un topic real: `teleop_twist_keyboard` publica `geometry_msgs/Twist` en `/cmd_vel`, y el controlador de Donatello lo escucha para mover las ruedas. Fijate cómo cambian `linear.x`, `linear.y` y `angular.z` según las teclas que uses — el publisher no sabe ni le importa que del otro lado hay ruedas de verdad, es el mismo desacople que viste entre tu talker y tu listener.

## Desafío extra

Modificá `listener.py` para que en vez de suscribirse a `mensaje` escuche `/cmd_vel` (tipo `geometry_msgs/Twist`) y loguee `linear.x`, `linear.y` y `angular.z` cada vez que llega un mensaje. Corré tu listener modificado mientras manejás con el teleclado y confirmá que ves los mismos valores que en `ros2 topic echo /cmd_vel`.
