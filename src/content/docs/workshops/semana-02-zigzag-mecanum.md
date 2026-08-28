---
title: "02 · Zigzag mecanum"
description: "Combiná avance y desplazamiento lateral para programar una trayectoria mecanum."
status: listo
duration: "aprox. 60–90 min"
level: intermedio
outcome: "Al terminar, vas a tener una trayectoria que combina avance y movimiento lateral."
prerequisites:
  - "Setup completo"
  - "Workshop 01"
---

## La práctica

<section class="doc-practice-plate" aria-labelledby="la-práctica">
  <div class="doc-practice-intro">
    <p class="doc-practice-statement">Avanzar.<br />Desplazar.<br />Repetir.</p>
    <p class="doc-practice-note">Publicás comandos de velocidad en <code>/cmd_vel</code> para que Donatello avance mientras se desplaza de un lado al otro, aprovechando el movimiento holonómico de sus ruedas mecanum.</p>
  </div>

  <dl class="doc-practice-facts">
    <div>
      <dt>Topic</dt>
      <dd><code>/cmd_vel</code></dd>
    </div>
    <div>
      <dt>Tipo</dt>
      <dd><code>geometry_msgs/Twist</code></dd>
    </div>
    <div>
      <dt>Ritmo</dt>
      <dd><code>10 Hz</code></dd>
    </div>
    <div>
      <dt>Patrón</dt>
      <dd>Zigzag lateral</dd>
    </div>
  </dl>
</section>

## Antes de empezar

<ol class="doc-preflight" aria-label="Preparación del workshop">
  <li>
    <span class="doc-preflight-index" aria-hidden="true">01</span>
    <div class="doc-preflight-copy">
      <h3>Workshop 01</h3>
      <p>Completá el <a href="../semana-01-talkers-listeners/">Workshop 01</a> — acá vas a reusar el mismo patrón de nodo con timer.</p>
    </div>
  </li>
  <li>
    <span class="doc-preflight-index" aria-hidden="true">02</span>
    <div class="doc-preflight-copy">
      <h3>Simulador</h3>
      <p>Levantá el simulador con la <a href="../../setup/simulador/">guía de Setup</a>.</p>
    </div>
  </li>
  <li>
    <span class="doc-preflight-index" aria-hidden="true">03</span>
    <div class="doc-preflight-copy">
      <h3>Chequeo</h3>
      <p>Con <code>teleop_twist_keyboard</code> corriendo, confirmá en otra terminal que <code>ros2 topic echo /cmd_vel</code> muestra valores mientras mantenés una tecla presionada.</p>
    </div>
  </li>
</ol>

## Concepto mínimo: velocidad y movimiento mecanum

ROS 2 usa mensajes [`geometry_msgs/msg/Twist`](https://docs.ros2.org/latest/api/geometry_msgs/msg/Twist.html) para indicar la velocidad deseada de una base móvil. Cada mensaje contiene dos vectores:

```text
Twist
 ├── linear  [x, y, z]  metros por segundo
 └── angular [x, y, z]  radianes por segundo
```

Para un robot que se mueve sobre un plano con `z = 0`, nos interesan tres componentes:

| Componente | Movimiento | Valor positivo | Valor negativo |
| --- | --- | --- | --- |
| `linear.x` | Longitudinal | Avanza | Retrocede |
| `linear.y` | Lateral | Se desplaza a la izquierda | Se desplaza a la derecha |
| `angular.z` | Giro sobre el eje vertical | Gira en sentido antihorario | Gira en sentido horario |

<figure class="doc-figure">
  <img src="../../media/docs/mecanum-axes.svg" alt="Vista superior de una base mecanum con los ejes linear x, linear y y angular z" width="960" height="520" loading="lazy" />
  <figcaption>Las ruedas mecanum permiten combinar avance, desplazamiento lateral y giro sin alinear primero el chasis.</figcaption>
</figure>

Una base diferencial puede avanzar y girar, pero no moverse directamente de costado. En una base mecanum, los rodillos a 45 grados permiten coordinar las cuatro ruedas para generar movimiento lateral. Por eso `linear.y` puede ser distinto de `0`.

## Implementación

Creá [`zigzag.py`](https://github.com/AIRclub-UdeSA/jar_workshops/blob/main/semana-02-zigzag-mecanum/zigzag_mecanum/zigzag_mecanum/zigzag.py) dentro del paquete `zigzag_mecanum`:

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

        # Timer a 10 Hz: publica cada 0.1 segundos
        self.timer = self.create_timer(0.1, self.timer_callback)

        self.step_count = 0
        self.direction = 1.0

    def timer_callback(self):
        msg = Twist()

        # Mantiene una velocidad de avance constante
        msg.linear.x = 0.2

        # Alterna la dirección lateral cada 20 pasos
        if self.step_count % 20 == 0:
            self.direction *= -1.0

        msg.linear.y = 0.2 * self.direction

        # Mantiene el chasis apuntando al frente
        msg.angular.z = 0.0

        self.publisher_.publish(msg)
        self.step_count += 1


def main(args=None):
    rclpy.init(args=args)
    node = ZigzagNode()
    try:
        rclpy.spin(node)
    except KeyboardInterrupt:
        stop_msg = Twist()
        node.publisher_.publish(stop_msg)
    finally:
        node.destroy_node()
        rclpy.shutdown()


if __name__ == '__main__':
    main()
```

El nodo mantiene `linear.x` en `0.2 m/s` y cambia el signo de `linear.y` cada dos segundos. Como `angular.z` queda en `0`, el chasis conserva la misma orientación mientras se desplaza.

## Ejecución

Compilá el paquete y cargá el overlay:

```bash
# Terminal 1 — build
cd ~/rosmaster_ws
colcon build --packages-select zigzag_mecanum
source ~/rosmaster_ws/install/setup.bash
```

Con el simulador abierto, ejecutá el nodo en otra terminal:

```bash
# Terminal 2 — el nodo
source ~/rosmaster_ws/install/setup.bash
ros2 run zigzag_mecanum zigzag
```

Para detenerlo, volvé a esa terminal y presioná `Ctrl+C`. El nodo publica un mensaje vacío antes de cerrar para pedir velocidad cero.

## Comprobación

En el simulador, Donatello debería avanzar mientras alterna el desplazamiento lateral. El frente del chasis debería mantenerse apuntando en la misma dirección.

Inspeccioná los mensajes en otra terminal:

```bash
ros2 topic echo /cmd_vel
```

Vas a ver `linear.x` constante en `0.2` y `linear.y` alternando entre `0.2` y `-0.2` cada dos segundos.

En RViz podés agregar una visualización de `Odometry` y seleccionar `/odom`. Eso permite revisar la pose y la orientación estimadas del robot; RViz no dibuja por sí solo un rastro histórico del recorrido.

> [!CHECK]
> Si el robot avanza pero no se desplaza lateralmente, confirmá que el nodo publique en `/cmd_vel` y que `linear.y` cambie de signo.

## Explicación: orientación y cuaterniones

Los mensajes de [odometría](https://docs.ros2.org/latest/api/nav_msgs/msg/Odometry.html) (`/odom`) y las [transformaciones](https://docs.ros.org/en/humble/Tutorials/Intermediate/Tf2/Tf2-Main.html) (`/tf`) representan la orientación con un [cuaternión](https://docs.ros.org/en/humble/Tutorials/Intermediate/Tf2/Quaternion-Fundamentals.html) `[x, y, z, w]`, no directamente con ángulos de *roll*, *pitch* y *yaw*.

| Representación | Valores | Ventaja | Límite |
| --- | :---: | --- | --- |
| Ángulos de Euler | 3 | Resultan fáciles de interpretar | Pueden sufrir *gimbal lock* y discontinuidades |
| Matriz de rotación | 9 | No tiene singularidades | Usa más valores de los necesarios |
| Cuaternión | 4 | Es compacto y permite interpolaciones suaves | No se interpreta a simple vista |

Para obtener el ángulo de giro sobre el plano, podés convertir el cuaternión a *yaw*:

```python
import math


def quaternion_to_yaw(x: float, y: float, z: float, w: float) -> float:
    """Convierte un cuaternión [x, y, z, w] a yaw en radianes."""
    siny_cosp = 2.0 * (w * z + x * y)
    cosy_cosp = 1.0 - 2.0 * (y * y + z * z)
    return math.atan2(siny_cosp, cosy_cosp)
```

Para esta práctica el valor debería mantenerse cerca del ángulo inicial, porque el comando deja `angular.z` en `0`.

## Desafío extra

Agregá una velocidad angular suave con `msg.angular.z = 0.3 * self.direction`. Volvé a ejecutar el nodo y compará el resultado: la traslación lateral ahora se combina con el giro del chasis y produce curvas en lugar de un zigzag paralelo.
