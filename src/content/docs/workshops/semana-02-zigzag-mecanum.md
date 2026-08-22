---
title: "Semana 02 · Zigzag mecanum"
description: "Hacé que el robot zigzaguee usando velocidad lateral."
status: listo
---

# Semana 02 · Zigzag mecanum

## Objetivo

Publicar mensajes `Twist` a `/cmd_vel` alternando `linear.x` y `linear.y` para que el robot zigzaguee, aprovechando el movimiento lateral de las ruedas mecanum.

## Antes de empezar

Tené el simulador levantado antes de arrancar: seguí la guía de [levantar el simulador](../setup/simulador/). No hace falta instalar nada extra esta semana: `rclpy` y `geometry_msgs` ya vienen con `ros-humble-desktop`.

## Mini-proyecto

El código de esta semana vive en el repo [jar_workshops](https://github.com/AIRclub-UdeSA/jar_workshops), en el paquete `zigzag_mecanum`. Si todavía no clonaste el repo (lo usaste en la [Semana 01](../semana-01-talkers-listeners/)), hacelo dentro de tu workspace:

```bash
cd ~/rosmaster_ws/src
git clone https://github.com/AIRclub-UdeSA/jar_workshops.git
```

Compilá el paquete de esta semana y cargá el overlay:

```bash
cd ~/rosmaster_ws
colcon build --packages-select zigzag_mecanum
source install/setup.bash
```

El nodo `zigzag.py` publica un `geometry_msgs/Twist` a `/cmd_vel` diez veces por segundo: mantiene `linear.x` constante (avanza) y cada dos segundos invierte el signo de `linear.y` (se desplaza de costado, alternando de lado). Como el ROSMASTER X3 tiene ruedas mecanum con movimiento holonómico, combinar esas dos velocidades a la vez traza un zigzag sin necesidad de girar.

Con el simulador levantado, corré:

```bash
ros2 run zigzag_mecanum zigzag
```

## Qué observar en el sim

En Gazebo vas a ver al robot avanzar trazando una trayectoria en zigzag, desplazándose de lado a lado sin rotar el chasis. En RViz podés seguir el rastro de la odometría (`/odom`) para confirmar el patrón.

En otra terminal, mirá los mensajes que publica tu nodo:

```bash
ros2 topic echo /cmd_vel
```

Fijate que `linear.x` se mantiene constante mientras `linear.y` cambia de signo cada dos segundos — eso es lo que genera el zigzag.

## Desafío extra

Agregá una rotación suave (`angular.z`) al patrón para que el zigzag trace curvas en vez de líneas rectas.
