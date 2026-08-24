---
title: "01 · Talkers y listeners"
description: "Arquitectura de ROS 2: nodos, topics, comunicación publicador/suscriptor y modelo de ejecución asincrónico."
status: listo
---

## Objetivo

Comprender los fundamentos de la arquitectura de ROS 2. Al finalizar este módulo vas a entender cómo se comunican los procesos a través de un grafo distribuido, cómo implementar nodos publicadores y suscriptores en Python, por qué ROS 2 utiliza un modelo de ejecución no bloqueante basado en timers y cómo este mismo patrón gobierna el control del robot ROSMASTER X3 en el simulador.

## Antes de empezar

Asegurate de tener el entorno instalado y el simulador compilado siguiendo la [guía de instalación](../../setup/). No hace falta instalar paquetes adicionales: `rclpy`, `std_msgs` y `geometry_msgs` vienen incluidos en la instalación base de ROS 2 Humble.

---

## 1. Arquitectura de ROS 2: El Grafo de Computación

ROS 2 no es un único programa monolítico, sino un ecosistema de procesos independientes que se comunican entre sí formando una red o **grafo de computación**. Sus tres pilares fundamentales son:

### A. Nodos (*Nodes*)
Un nodo es un proceso ejecutable independiente enfocado en resolver una tarea puntual. En una aplicación de robótica real:
- Un nodo se encarga de leer los pulsos del LiDAR.
- Otro nodo procesa las imágenes de la cámara de profundidad.
- Otro nodo ejecuta el algoritmo de planificación de ruta.
- Un nodo final traduce la ruta en señales eléctricas para los motores.

Esta modularidad garantiza que si un sensor falla o un nodo se reinicia, el resto del robot sigue funcionando.

### B. Tópicos (*Topics*)
Los topics son canales unidireccionales con nombre declarativo (por ejemplo `/scan`, `/cmd_vel` o `/chatter`) a través de los cuales fluyen los datos entre nodos.

### C. Mensajes (*Messages*)
Los datos que circulan por un topic tienen una estructura fuertemente tipada. ROS 2 define mensajes estándar (como cadenas de texto `std_msgs/msg/String` o vectores de velocidad `geometry_msgs/msg/Twist`) para que cualquier nodo en Python, C++ o Rust hable el mismo idioma.

### El patrón Publicador / Suscriptor (*Pub/Sub*)
La comunicación entre nodos está **totalmente desacoplada**:
- **El Publicador (*Talker*):** Genera datos y los envía al topic. No sabe (ni necesita saber) quién los está escuchando ni cuántos nodos hay conectados.
- **El Suscriptor (*Listener*):** Se conecta al topic y espera datos. No sabe quién los genera ni en qué computadora está corriendo el publicador.

---

## 2. El modelo de ejecución: Timers vs Loops bloqueantes

Una vez que entendemos qué es un nodo, surge la pregunta práctica: *¿Cómo programamos en Python un nodo para que publique datos periódicamente (por ejemplo, 1 vez por segundo)?*

En un script clásico de Python, la primera intuición suele ser usar un bucle infinito con retardos:

```python
# ❌ ENFOQUE BLOQUEANTE (NO RECOMENDADO EN ROBÓTICA)
import time

while True:
    time.sleep(1.0)  # Bloquea el hilo de ejecución durante 1 segundo
    publicar_mensaje()
```

### El problema en robótica
Cuando un programa ejecuta `time.sleep()`, el hilo del proceso queda **completamente congelado**. Si durante ese segundo llega una lectura crítica del LiDAR con un obstáculo o una orden de freno de emergencia, el nodo no puede atenderlas a tiempo.

### La solución de ROS 2: Arquitectura orientada a eventos
ROS 2 utiliza **Timers periódicos** combinados con un despachador de eventos (`rclpy.spin`):

```python
# ✅ ENFOQUE ASINCRÓNICO DE ROS 2
self.timer = self.create_timer(1.0, self.timer_callback)
```

En lugar de retener la CPU esperando, el nodo le indica al framework: *"llamá a mi función `timer_callback` cada 1.0 segundo"*. Durante el tiempo restante, el nodo permanece libre en `rclpy.spin()` atendiendo mensajes de sensores y eventos del sistema, consumiendo solo las milésimas de segundo que tarda en ejecutar la lógica.

---

## 3. Anatomía de un Publicador (`talker.py`)

Veamos cómo se implementa un nodo publicador completo en Python:

```python
#!/usr/bin/env python3
import rclpy
from rclpy.node import Node
from std_msgs.msg import String


class TalkerNode(Node):

    def __init__(self):
        # Inicializa el nodo con el nombre 'talker'
        super().__init__('talker')

        # 1. Crea el publicador (Tipo de mensaje, Nombre del topic, Tamaño de cola QoS)
        self.publisher_ = self.create_publisher(String, 'chatter', 10)

        # 2. Crea un timer periódico a 1 Hz (dispara el callback cada 1.0 segundo)
        self.timer = self.create_timer(1.0, self.timer_callback)
        self.count = 0

    def timer_callback(self):
        # Se ejecuta cada 1 segundo sin bloquear el hilo
        msg = String()
        msg.data = f'Hola desde el talker: mensaje #{self.count}'
        self.publisher_.publish(msg)
        self.get_logger().info(f'Publicando: "{msg.data}"')
        self.count += 1


def main(args=None):
    rclpy.init(args=args)
    node = TalkerNode()
    try:
        rclpy.spin(node)  # Despacha callbacks y mantiene el nodo activo
    except KeyboardInterrupt:
        pass
    finally:
        node.destroy_node()
        rclpy.shutdown()


if __name__ == '__main__':
    main()
```

### Puntos clave del código:
1. **`super().__init__('talker')`**: Registra el nodo con el nombre `talker` en el grafo de ROS 2.
2. **`create_publisher(String, 'chatter', 10)`**: Define que por el topic `chatter` viajarán mensajes `String` y configura una cola de 10 mensajes (*QoS*).
3. **`get_logger().info(...)`**: Sistema de logs estructurado que imprime en terminal con marca temporal y nivel de severidad.

---

## 4. Anatomía de un Suscriptor (`listener.py`)

El nodo suscriptor se enlaza al mismo topic y ejecuta una función automáticamente cada vez que arriba un nuevo mensaje:

```python
#!/usr/bin/env python3
import rclpy
from rclpy.node import Node
from std_msgs.msg import String


class ListenerNode(Node):

    def __init__(self):
        super().__init__('listener')

        # Crea la suscripción al topic 'chatter'
        self.subscription = self.create_subscription(
            String, 'chatter', self.listener_callback, 10
        )
        self.subscription  # Evita advertencias de variable no utilizada

    def listener_callback(self, msg: String):
        # Esta función es invocada automáticamente al recibir un mensaje
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

---

## 5. Compilación y Entry Points

Para que ROS 2 pueda ejecutar estos nodos mediante la terminal (`ros2 run`), los scripts se declaran en el diccionario `entry_points` de `setup.py`:

```python
# setup.py
entry_points={
    'console_scripts': [
        'talker = talkers_listeners.talker:main',
        'listener = talkers_listeners.listener:main',
    ],
},
```

Si todavía no clonaste el repositorio de workshops en tu workspace:

```bash
cd ~/rosmaster_ws/src
git clone https://github.com/AIRclub-UdeSA/jar_workshops.git
cd ~/rosmaster_ws
colcon build --packages-select talkers_listeners
source install/setup.bash
```

---

## 6. Ejecución e Introspección del Grafo

Abrí dos terminales independientes (ambas con el entorno cargado mediante `source ~/rosmaster_ws/install/setup.bash`):

```bash
# Terminal 1: Iniciar el publicador
ros2 run talkers_listeners talker
```

```bash
# Terminal 2: Iniciar el suscriptor
ros2 run talkers_listeners listener
```

Vas a ver al talker emitiendo mensajes periódicos y al listener imprimiéndolos en tiempo real a medida que llegan.

### Diagnóstico e introspección en vivo
En una tercera terminal, utilizá las herramientas CLI de ROS 2 para inspeccionar el grafo:

```bash
# Listar todos los topics activos en el sistema
ros2 topic list

# Ver detalles del topic: tipo de mensaje, publicadores y suscriptores conectados
ros2 topic info /chatter

# Medir la frecuencia real de transmisión en Hz
ros2 topic hz /chatter
```

> **Pregunta conceptual:** *¿Qué sucede si cerrás el talker y dejás únicamente el listener corriendo?*  
> Si ejecutás `ros2 topic list`, vas a notar que el topic `/chatter` **sigue existiendo** en el grafo porque el suscriptor lo mantiene declarado, aunque ningún dato fluirá por él hasta que se conecte un publicador.

---

## 7. Del ejemplo básico al robot: El topic `/cmd_vel`

El patrón de talker y listener que acabás de probar es **exactamente el mismo** que controla los movimientos del ROSMASTER X3:

1. **El Publicador:** Un nodo de teleoperación por teclado (o tu propio algoritmo de navegación autónoma) calcula la velocidad requerida y publica mensajes de tipo `geometry_msgs/msg/Twist` en el topic `/cmd_vel`.
2. **El Suscriptor:** El controlador de hardware del robot (o el plugin de Gazebo) está suscripto a `/cmd_vel` y transforma esas velocidades en revoluciones para cada una de las 4 ruedas mecanum.

Podés verificarlo en tiempo real:
1. Levantá el simulador:
   ```bash
   ros2 launch yahboom_rosmaster_description display.launch.py
   ```
2. En otra terminal, manejá el robot con las teclas:
   ```bash
   ros2 run teleop_twist_keyboard teleop_twist_keyboard
   ```
3. En una tercera terminal, inspeccioná los mensajes que circulan por el bus:
   ```bash
   ros2 topic echo /cmd_vel
   ```

---

## Desafío extra

Modificá `listener.py` para que en vez de suscribirse a `chatter` escuche directamente el topic `/cmd_vel` (`geometry_msgs/msg/Twist`). Hacé que imprima en pantalla un aviso cada vez que la velocidad lineal en `x` supere `0.2 m/s`.
