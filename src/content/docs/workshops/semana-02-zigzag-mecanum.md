---
title: "02 · Zigzag mecanum"
description: "Cinemática omnidireccional mecanum, control de velocidad con /cmd_vel y representación de orientación en 3D."
status: listo
---

## Objetivo

Aprender a controlar el movimiento del robot mediante el envío de comandos de velocidad al topic `/cmd_vel`. Al completar este workshop vas a comprender la estructura del mensaje `Twist`, la diferencia entre cinemática diferencial y omnidireccional mecanum, cómo trazar trayectorias combinando velocidades y cómo se representa la orientación en el espacio 3D mediante cuaterniones.

## Antes de empezar

Asegurate de haber completado el [Workshop 01](../semana-01-talkers-listeners/) para entender el modelo de publicadores en ROS 2 y tené listo el simulador según la [guía de instalación](../../setup/).

---

## 1. Fundamentos de Cinemática: ¿Cómo entiende la velocidad un robot?

En ROS 2, el estándar universal para gobernar el movimiento de una base móvil es el topic `/cmd_vel` (*command velocity*), el cual utiliza mensajes de tipo `geometry_msgs/msg/Twist`.

Un mensaje `Twist` se compone de dos vectores tridimensionales:

```
Twist
 ├── linear  (Vector3) ➔ [x, y, z] en metros por segundo (m/s)
 └── angular (Vector3) ➔ [x, y, z] en radianes por segundo (rad/s)
```

Para un robot terrestre que se desplaza sobre el plano del suelo ($z = 0$), los componentes activos son tres:

| Componente | Dirección | Sentido Positivo (+) | Sentido Negativo (-) |
| --- | --- | --- | --- |
| `linear.x` | Eje longitudinal (adelante / atrás) | Avance hacia el frente | Retroceso |
| `linear.y` | Eje transversal (lateral / strafe) | Desplazamiento a la izquierda | Desplazamiento a la derecha |
| `angular.z` | Rotación sobre el eje vertical (Yaw) | Giro antihorario (hacia la izquierda) | Giro horario (hacia la derecha) |

---

## 2. Robots Diferenciales vs Robots Mecanum (Holonomía)

La gran ventaja del ROSMASTER X3 frente a plataformas robóticas convencionales radica en su sistema de tracción:

### Plataformas Diferenciales (No Holonómicas)
Un robot diferencial estándar (como un auto o una aspiradora robot) solo posee ruedas fijas. No puede desplazarse de costado sin antes girar su chasis (`linear.y` es siempre `0`). Para cambiar de carril, está obligado a:
1. Rotar en el lugar (`angular.z`).
2. Avanzar en línea recta (`linear.x`).
3. Volver a rotar para alinearse.

### Plataformas Mecanum (Holonómicas)
El ROSMASTER X3 cuenta con **4 ruedas Mecanum** cuyos rodillos periféricos están orientados a 45°. Al variar la velocidad relativa y el sentido de giro de cada rueda individual, las fuerzas diagonales se combinan permitiendo **movimiento holonómico**: el robot puede desplazarse instantáneamente hacia cualquier lado (`linear.y != 0`) sin necesidad de girar su chasis.

---

## 3. Implementación: El nodo `zigzag.py`

Vamos a crear un nodo que aproveche la cinemática mecanum para hacer que el robot avance mientras zigzaguea de lado a lado:

```python
#!/usr/bin/env python3
import rclpy
from geometry_msgs.msg import Twist
from rclpy.node import Node


class ZigzagNode(Node):

    def __init__(self):
        super().__init__('zigzag')

        # Publicador de comandos de velocidad en /cmd_vel
        self.publisher_ = self.create_publisher(Twist, '/cmd_vel', 10)

        # Timer a 10 Hz (publica cada 0.1 segundos)
        self.timer = self.create_timer(0.1, self.timer_callback)

        self.step_count = 0
        self.direction = 1.0  # 1.0 para izquierda, -1.0 para derecha

    def timer_callback(self):
        msg = Twist()

        # 1. Mantiene una velocidad de avance constante
        msg.linear.x = 0.2  # 0.2 m/s hacia adelante

        # 2. Alterna la velocidad lateral cada 20 pasos (2.0 segundos a 10 Hz)
        if self.step_count % 20 == 0:
            self.direction *= -1.0

        msg.linear.y = 0.2 * self.direction  # 0.2 m/s de costado

        # 3. Sin rotación: el chasis se mantiene apuntando al frente
        msg.angular.z = 0.0

        self.publisher_.publish(msg)
        self.step_count += 1


def main(args=None):
    rclpy.init(args=args)
    node = ZigzagNode()
    try:
        rclpy.spin(node)
    except KeyboardInterrupt:
        # Freno de seguridad al detener el nodo
        stop_msg = Twist()
        node.publisher_.publish(stop_msg)
    finally:
        node.destroy_node()
        rclpy.shutdown()


if __name__ == '__main__':
    main()
```

---

## 4. Compilación y Ejecución

Si ya tenés el repositorio `jar_workshops` en tu workspace, compilá el paquete y cargá el overlay:

```bash
cd ~/rosmaster_ws
colcon build --packages-select zigzag_mecanum
source install/setup.bash
```

Con el simulador de Gazebo levantado en una terminal:

```bash
# En una nueva terminal con el entorno cargado:
ros2 run zigzag_mecanum zigzag
```

---

## 5. Qué observar en Gazebo y RViz

1. **En Gazebo:** Vas a ver al ROSMASTER X3 avanzar trazando una trayectoria en zigzag perfecta, desplazándose lateralmente de izquierda a derecha mientras su chasis permanece orientado hacia adelante.
2. **En RViz:** Podés activar la visualización del topic `/odom` para observar el rastro de la trayectoria odofisiológica en el plano.
3. **En la terminal:** Podés inspeccionar los comandos emitidos en tiempo real:
   ```bash
   ros2 topic echo /cmd_vel
   ```
   Fijate cómo `linear.x` se mantiene constante en `0.2` mientras `linear.y` conmuta de `0.2` a `-0.2` cada dos segundos.

---

## 6. Nota Técnica: Orientación en el espacio (Cuaterniones vs Euler)

Cuando leas la posición y postura del robot desde el sensor de odometría (`/odom`) o las transformadas del sistema (`/tf`), notarás que la orientación no se entrega en grados de Roll, Pitch y Yaw, sino en formato de **cuaternión** `[x, y, z, w]`.

| Método | Parámetros | Ventajas | Desventajas |
| --- | --- | --- | --- |
| **Ángulos de Euler** (Roll, Pitch, Yaw) | 3 | Muy intuitivo para humanos. | Sufre de **Gimbal Lock** (pérdida de un grado de libertad al alinearse dos ejes) y discontinuidades cíclicas. |
| **Matriz de Rotación** | 9 | Sin singularidades. | Redundante (9 números para 3 grados de libertad) e ineficiente para cálculos continuos. |
| **Cuaterniones** | 4 | Compactos, sin singularidades, linealizables e ideales para interpolar rotaciones suaves (SLERP). | Poco intuitivos para visualización directa. |

### Cómo convertir un Cuaternión a ángulo Yaw en Python
Para saber hacia dónde apunta el robot en un plano 2D, solo necesitás extraer el ángulo **Yaw** (rotación sobre el eje Z) a partir de los 4 componentes del cuaternión:

```python
import math


def quaternion_to_yaw(x: float, y: float, z: float, w: float) -> float:
    """Convierte un cuaternión [x, y, z, w] en ángulo Yaw en radianes."""
    siny_cosp = 2.0 * (w * z + x * y)
    cosy_cosp = 1.0 - 2.0 * (y * y + z * z)
    return math.atan2(siny_cosp, cosy_cosp)
```

---

## Desafío extra

Modificá `zigzag.py` para agregarle una velocidad angular suave (`angular.z = 0.3 * self.direction`). Observá en el simulador cómo el zigzag deja de ser una traslación pura y pasa a describir curvas sinuosas combinando rotación con movimiento holonómico.
