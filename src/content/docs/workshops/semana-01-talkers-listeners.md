---
title: "01 · Talkers y listeners"
description: "Nodos, topics y comunicación asincrónica en ROS 2: publicadores, suscriptores y representación de estados."
status: listo
---

## Objetivo

Comprender la arquitectura de comunicación publicador/suscriptor de ROS 2. Al completar este workshop vas a entender cómo se estructuran los nodos en Python, por qué ROS 2 utiliza un modelo no bloqueante basado en eventos y cómo este mismo patrón gobierna el control del robot ROSMASTER X3 en el simulador.

## Antes de empezar

Asegurate de tener el entorno instalado y el simulador compilado en tu workspace siguiendo la [guía de instalación](../../setup/). No necesitás instalar paquetes adicionales para este módulo: `rclpy`, `std_msgs` y `geometry_msgs` forman parte de la instalación base de ROS 2 Humble.

---

## 1. El modelo de ejecución en ROS 2: Timers vs Loops bloqueantes

En un script convencional de Python, para ejecutar una tarea periódica solemos escribir un bucle infinito con retardos:

```python
# ❌ ENFOQUE BLOQUEANTE (NO RECOMENDADO EN ROS 2)
import time

while True:
    time.sleep(1.0)  # Bloquea el hilo completo durante 1 segundo
    publicar_mensaje()
```

### ¿Por qué este enfoque no sirve en robótica?
Cuando un proceso ejecuta `time.sleep()`, el hilo de ejecución queda congelado. Si durante ese segundo llega un mensaje del LiDAR, una lectura de la IMU o una orden de freno de emergencia, el nodo no puede atenderlos a tiempo.

### La solución de ROS 2: Timers y Callbacks
ROS 2 adopta una **arquitectura orientada a eventos**:

```python
# ✅ ENFOQUE ASINCRÓNICO DE ROS 2
self.timer = self.create_timer(1.0, self.timer_callback)
```

En lugar de retener la CPU esperando, el nodo le solicita al framework: *"llamá a mi función `timer_callback` cada 1 segundo"*. Durante el tiempo restante, el nodo queda libre en `rclpy.spin()` para procesar mensajes entrantes, callbacks de sensores o responder a señales del sistema, consumiendo solo las milésimas de segundo que tarda en ejecutar la lógica.

---

## 2. Anatomía de un Publicador (`talker.py`)

Un nodo publicador (*Talker*) envía mensajes periódicamente a un topic específico. Veamos su estructura:

```python
#!/usr/bin/env python3
import rclpy
from rclpy.node import Node
from std_msgs.msg import String


class TalkerNode(Node):

    def __init__(self):
        # Inicializa el nodo con el nombre 'talker'
        super().__init__('talker')

        # Crea un publicador de tipo String en el topic 'chatter' con cola de 10
        self.publisher_ = self.create_publisher(String, 'chatter', 10)

        # Crea un timer que dispara el callback cada 1.0 segundo
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
        rclpy.spin(node)  # Mantiene el nodo vivo despachando callbacks
    except KeyboardInterrupt:
        pass
    finally:
        node.destroy_node()
        rclpy.shutdown()


if __name__ == '__main__':
    main()
```

### Puntos clave del publicador:
1. **`super().__init__('talker')`**: Registra el nodo con el nombre `talker` en el grafo de ROS 2.
2. **`self.create_publisher(String, 'chatter', 10)`**: Define el tipo de mensaje (`String`), el nombre del canal (`chatter`) y el tamaño de cola de QoS (*Quality of Service*).
3. **`self.get_logger().info(...)`**: Sistema de logging estructurado que imprime en terminal con timestamps y nivel de severidad.

---

## 3. Anatomía de un Suscriptor (`listener.py`)

Un nodo suscriptor (*Listener*) se conecta a un topic y ejecuta una función automáticamente cada vez que recibe un dato:

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
        # Esta función se ejecuta automáticamente cuando llega un mensaje
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

> **Desacople total:** El `talker` y el `listener` no conocen sus direcciones de memoria ni en qué máquina están corriendo. Solo acuerdan el nombre del topic (`chatter`) y el tipo de dato (`String`).

---

## 4. Compilación y Entry Points

Para que ROS 2 reconozca estos scripts como ejecutables, se declaran en el archivo `setup.py` del paquete:

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

## 5. Poniendo a prueba los nodos

Abrí dos terminales independientes (ambas con el entorno cargado mediante `source ~/rosmaster_ws/install/setup.bash`):

```bash
# Terminal 1: Iniciar el publicador
ros2 run talkers_listeners talker
```

```bash
# Terminal 2: Iniciar el suscriptor
ros2 run talkers_listeners listener
```

### Introspección del grafo
Mientras los nodos están corriendo, abrí una tercera terminal y probá estos comandos de diagnóstico:

```bash
# Ver todos los topics activos en el sistema
ros2 topic list

# Inspeccionar el tipo de mensaje y cantidad de publicadores/suscriptores
ros2 topic info /chatter

# Medir la frecuencia real de publicación en Hz
ros2 topic hz /chatter
```

> **Pregunta conceptual:** *¿Qué sucede si cerrás el talker y dejás únicamente el listener corriendo?*  
> Si ejecutás `ros2 topic list`, vas a ver que el topic `/chatter` **sigue existiendo** en el grafo porque el suscriptor lo mantiene declarado, aunque ningún mensaje circule por él hasta que se conecte un publicador.

---

## 6. Conexión con el simulador: Control de velocidad (`/cmd_vel`)

El patrón de talker y listener es exactamente el mismo que se utiliza para mover el robot real y el simulador en Gazebo:

1. **El Publicador:** Un nodo de teleoperación o tu propio algoritmo de navegación calcula la velocidad y publica mensajes de tipo `geometry_msgs/msg/Twist` en el topic `/cmd_vel`.
2. **El Suscriptor:** El controlador de hardware del ROSMASTER X3 (o el plugin de Gazebo) está suscripto a `/cmd_vel` y transforma esas velocidades lineales y angulares en revoluciones para cada una de las 4 ruedas mecanum.

Podés comprobarlo en vivo:
1. Levantá el simulador: `ros2 launch yahboom_rosmaster_description display.launch.py`
2. En otra terminal, manejá el robot con el teclado:
   ```bash
   ros2 run teleop_twist_keyboard teleop_twist_keyboard
   ```
3. En una tercera terminal, observá los datos crudos en tiempo real:
   ```bash
   ros2 topic echo /cmd_vel
   ```

---

## 7. Nota Técnica: ¿Por qué en robótica usamos Cuaterniones en vez de Euler?

Cuando inspecciones la odometría del robot (`/odom`) o las transformadas de coordenadas (`/tf`), vas a notar que la orientación no viene expresada en grados o radianes de Roll, Pitch y Yaw, sino como un **cuaternión** `[x, y, z, w]`.

| Método | Parámetros | Ventajas | Desventajas |
| --- | --- | --- | --- |
| **Ángulos de Euler** (Roll, Pitch, Yaw) | 3 | Intuitivo para humanos. | Sufre de **Gimbal Lock** (pérdida de un grado de libertad) y singularidades matemáticas en 90°. |
| **Matriz de Rotación** | 9 | Sin singularidades. | Redundante (9 números para 3 DOF) y propensa a perder ortonormalidad por errores de redondeo. |
| **Cuaterniones** | 4 | Compactos, suaves para interpolar (SLERP), sin Gimbal Lock ni singularidades. | Poco intuitivos para visualización directa. |

### Cómo convertir un Cuaternión a ángulo Yaw en Python
Para robots terrestres que se desplazan sobre un plano 2D, solo nos interesa el giro sobre el eje vertical (**Yaw**). Podés extraerlo a partir de la orientación del mensaje con esta fórmula estándar:

```python
import math


def quaternion_to_yaw(x, y, z, w) -> float:
    """Convierte un cuaternión de orientación en ángulo Yaw (radianes)."""
    siny_cosp = 2.0 * (w * z + x * y)
    cosy_cosp = 1.0 - 2.0 * (y * y + z * z)
    return math.atan2(siny_cosp, cosy_cosp)
```

---

## Desafío extra

Modificá `listener.py` para que en vez de suscribirse a `chatter` escuche directamente el topic `/cmd_vel` (`geometry_msgs/msg/Twist`). Hacé que imprima en pantalla un aviso cada vez que el robot se desplace lateralmente (`linear.y != 0`) aprovechando la cinemática de las ruedas mecanum.
