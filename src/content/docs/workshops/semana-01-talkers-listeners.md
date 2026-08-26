---
title: "01 · Talkers y listeners"
description: "Armá dos nodos simples para ver cómo se publican y reciben mensajes en ROS 2."
status: listo
duration: "aprox. 60–90 min"
level: inicial
outcome: "Al terminar, vas a poder publicar y escuchar mensajes entre nodos de ROS 2."
prerequisites:
  - "Setup completo"
---

En esta práctica vas a crear un publicador y un suscriptor en Python. Primero los vas a correr por separado; después vas a mirar el grafo de ROS 2 y conectar el mismo patrón con el movimiento de Donatello.

## Resultado de la práctica

Al terminar vas a tener dos nodos comunicándose por `/chatter`: un *talker* publica un mensaje por segundo y un *listener* lo recibe. También vas a poder inspeccionar esa comunicación desde la terminal.

## Antes de empezar

Completá el [recorrido de Setup](../../setup/) y comprobá que el workspace compile. `rclpy`, `std_msgs` y `geometry_msgs` ya vienen con ROS 2 Humble; no hace falta instalar paquetes adicionales.

> [!CHECK]
> Abrí una terminal, ejecutá `source ~/rosmaster_ws/install/setup.bash` y confirmá que `ros2 node list` responda sin errores.

## Concepto mínimo: cómo se comunica ROS 2

ROS 2 divide un sistema en procesos pequeños llamados **nodos**. Cada nodo resuelve una tarea y se comunica con los demás por canales con nombre, llamados **topics**. Los datos que viajan por esos canales son **mensajes** con una estructura definida.

<figure class="doc-figure">
  <img src="../../media/docs/ros-graph.svg" alt="Un nodo Talker publica mensajes en el topic chatter y un nodo Listener los recibe" width="960" height="360" loading="lazy" />
  <figcaption>El publicador y el suscriptor no se llaman entre sí: ambos se conectan al mismo topic.</figcaption>
</figure>

En este ejemplo:

- `talker` publica mensajes `std_msgs/msg/String` en `/chatter`.
- `/chatter` transporta esos mensajes.
- `listener` se suscribe a `/chatter` y procesa cada mensaje que llega.

El publicador no necesita saber quién escucha. El suscriptor tampoco necesita saber quién genera los datos. Ese desacople permite reemplazar o reiniciar un nodo sin rehacer todo el sistema.

### Timers en lugar de esperas bloqueantes

Una primera versión en Python podría usar `time.sleep()` dentro de un bucle. El problema es que, mientras espera, ese hilo no puede atender otros eventos.

```python
import time

while True:
    time.sleep(1.0)
    publicar_mensaje()
```

En ROS 2 conviene registrar un timer y dejar que `rclpy.spin()` despache los callbacks:

```python
self.timer = self.create_timer(1.0, self.timer_callback)
```

Así el nodo publica con la frecuencia elegida y sigue disponible para recibir mensajes, ejecutar otros timers o responder a servicios.

## Implementación

### El publicador

Creá `talker.py` dentro del paquete `talkers_listeners`:

```python
#!/usr/bin/env python3
import rclpy
from rclpy.node import Node
from std_msgs.msg import String


class TalkerNode(Node):

    def __init__(self):
        super().__init__('talker')
        self.publisher_ = self.create_publisher(String, 'chatter', 10)
        self.timer = self.create_timer(1.0, self.timer_callback)
        self.count = 0

    def timer_callback(self):
        msg = String()
        msg.data = f'Hola desde el talker: mensaje #{self.count}'
        self.publisher_.publish(msg)
        self.get_logger().info(f'Publicando: "{msg.data}"')
        self.count += 1


def main(args=None):
    rclpy.init(args=args)
    node = TalkerNode()
    try:
        rclpy.spin(node)
    except KeyboardInterrupt:
        pass
    finally:
        node.destroy_node()
        rclpy.shutdown()


if __name__ == '__main__':
    main()
```

`create_publisher()` define el tipo de mensaje, el topic y la profundidad de la cola. El timer llama a `timer_callback()` una vez por segundo sin detener el resto del nodo.

### El suscriptor

Creá `listener.py` en el mismo paquete:

```python
#!/usr/bin/env python3
import rclpy
from rclpy.node import Node
from std_msgs.msg import String


class ListenerNode(Node):

    def __init__(self):
        super().__init__('listener')
        self.subscription = self.create_subscription(
            String, 'chatter', self.listener_callback, 10
        )
        self.subscription

    def listener_callback(self, msg: String):
        self.get_logger().info(f'Recibí: "{msg.data}"')


def main(args=None):
    rclpy.init(args=args)
    node = ListenerNode()
    try:
        rclpy.spin(node)
    except KeyboardInterrupt:
        pass
    finally:
        node.destroy_node()
        rclpy.shutdown()


if __name__ == '__main__':
    main()
```

Cada vez que llega un `String`, ROS 2 ejecuta `listener_callback()` y entrega el mensaje recibido.

### Registrar los ejecutables

Para poder usar `ros2 run`, declaralos en el diccionario `entry_points` de `setup.py`:

```python
entry_points={
    'console_scripts': [
        'talker = talkers_listeners.talker:main',
        'listener = talkers_listeners.listener:main',
    ],
},
```

## Ejecución

Si todavía no tenés el repositorio de workshops, clonalo dentro del workspace. Después compilá el paquete y cargá el overlay:

```bash
cd ~/rosmaster_ws/src
git clone https://github.com/AIRclub-UdeSA/jar_workshops.git
cd ~/rosmaster_ws
colcon build --packages-select talkers_listeners
source install/setup.bash
```

Abrí dos terminales y cargá el entorno en ambas. En la primera, corré el publicador:

```bash
source ~/rosmaster_ws/install/setup.bash
ros2 run talkers_listeners talker
```

En la segunda, corré el suscriptor:

```bash
source ~/rosmaster_ws/install/setup.bash
ros2 run talkers_listeners listener
```

El talker debería anunciar cada publicación y el listener debería mostrar el mismo texto apenas llega.

## Comprobación

Usá una tercera terminal para mirar el sistema mientras los dos nodos siguen activos:

```bash
source ~/rosmaster_ws/install/setup.bash
ros2 topic list
ros2 topic info /chatter
ros2 topic hz /chatter
```

`ros2 topic info` debería encontrar un publicador y un suscriptor. `ros2 topic hz` debería medir una frecuencia cercana a `1 Hz`.

> [!QUESTION]
> Cerrá el talker y dejá el listener activo. ¿Qué cambia en `ros2 topic info /chatter`? El topic sigue declarado por el suscriptor, pero deja de recibir datos hasta que aparece otro publicador.

## Explicación: del ejemplo a Donatello

El movimiento usa el mismo patrón. Un nodo publica mensajes `geometry_msgs/msg/Twist` en `/cmd_vel`; el controlador del simulador está suscripto a ese topic y convierte cada mensaje en movimiento de las ruedas.

Levantá el simulador:

```bash
ros2 launch yahboom_rosmaster_bringup rosmaster_x3_sim.launch.py
```

En otra terminal, iniciá la teleoperación:

```bash
ros2 run teleop_twist_keyboard teleop_twist_keyboard
```

Y en una tercera inspeccioná los comandos que estás enviando:

```bash
ros2 topic echo /cmd_vel
```

## Desafío extra

Modificá `listener.py` para que escuche `/cmd_vel` usando `geometry_msgs/msg/Twist`. Hacé que muestre un aviso cada vez que `linear.x` supere `0.2 m/s`.
