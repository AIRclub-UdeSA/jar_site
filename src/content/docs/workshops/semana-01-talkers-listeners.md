---
title: "01 · Talkers y listeners"
description: "Tu primer nodo ROS 2: publicar y suscribirse a topics."
status: listo
---

## Objetivo

Entender los conceptos de nodos y topics de ROS 2 escribiendo un talker que publica mensajes y un listener que los recibe, todo en Python.

## Antes de empezar

Tené el simulador levantado antes de arrancar: seguí la guía de [levantar el simulador](../../setup/simulador/). No hace falta instalar nada extra para este workshop: `rclpy` y `std_msgs` ya vienen con `ros-humble-desktop`.

## Mini-proyecto

El código de este workshop vive en el repo [jar_workshops](https://github.com/AIRclub-UdeSA/jar_workshops), en el paquete `talkers_listeners`. Clonalo dentro de tu workspace (el mismo donde tenés `yahboom_rosmaster`):

```bash
cd ~/rosmaster_ws/src
git clone https://github.com/AIRclub-UdeSA/jar_workshops.git
cd ~/rosmaster_ws
colcon build --packages-select talkers_listeners
source install/setup.bash
```

El paquete tiene dos nodos:

- `talker.py`: publica un `std_msgs/String` al topic `mensaje` una vez por segundo, con un contador que se incrementa en cada mensaje.
- `listener.py`: se suscribe a `mensaje` e imprime cada mensaje que recibe.

Abrí dos terminales (con el entorno del workspace cargado en ambas) y corré uno en cada una:

```bash
ros2 run talkers_listeners talker
```

```bash
ros2 run talkers_listeners listener
```

Vas a ver al talker publicando `Publiqué: "Hola desde el talker, mensaje N"` con `N` incrementando, y al listener imprimiendo `Recibí: "Hola desde el talker, mensaje N"` por cada mensaje. Ese es el patrón publicador/suscriptor: dos nodos que no se conocen entre sí, pero se comunican a través de un topic compartido.

## Qué observar en el sim

Con el simulador levantado, sumá una tercera terminal y corré la teleoperación por teclado (ver la [guía del simulador](../../setup/simulador/#6-teleoperación)):

```bash
ros2 run teleop_twist_keyboard teleop_twist_keyboard
```

En una cuarta terminal, inspeccioná el topic `/cmd_vel` mientras manejás:

```bash
ros2 topic echo /cmd_vel
```

Es el mismo patrón que tu talker y listener, pero con un topic real del robot: `teleop_twist_keyboard` publica `geometry_msgs/Twist` en `/cmd_vel`, y el controlador del ROSMASTER X3 lo escucha para mover las ruedas. Fijate cómo cambian `linear.x`, `linear.y` y `angular.z` según las teclas que uses.

## Desafío extra

Modificá `listener.py` para que en vez de suscribirse a `mensaje` escuche `/cmd_vel` (tipo `geometry_msgs/Twist`) y loguee `linear.x`, `linear.y` y `angular.z` cada vez que llega un mensaje. Corré tu listener modificado mientras manejás con el teleclado y confirmá que ves los mismos valores que en `ros2 topic echo /cmd_vel`.

Para seguir explorando: [tutoriales oficiales de ROS 2](https://docs.ros.org/en/humble/Tutorials.html) y la [documentación de client libraries (rclpy)](https://docs.ros.org/en/humble/Concepts/Basic/About-Client-Libraries.html).
