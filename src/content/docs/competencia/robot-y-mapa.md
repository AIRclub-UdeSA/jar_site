---
title: "Robot y mapa"
description: "El ROSMASTER X3, sus sensores simulados y el mapa del desafío."
status: listo
---

# Robot y mapa

## El robot

El robot del desafío es el ROSMASTER X3 de Yahboom, con 4 ruedas mecanum que le dan movimiento omnidireccional: puede avanzar, strafear lateralmente y girar combinando velocidades en las cuatro ruedas. En los robots físicos hay una Raspberry Pi 5 a bordo.

Estas son las interfaces de ROS 2 que publica el simulador, idénticas a las del robot real:

| Topic | Tipo | Qué es |
| --- | --- | --- |
| `/cmd_vel` | `geometry_msgs/msg/Twist` | Comando de velocidad |
| `/scan` | `sensor_msgs/msg/LaserScan` | LiDAR 2D, 720 muestras |
| `/cam_1/color/image_raw` | `sensor_msgs/msg/Image` | Cámara RGB color 424x240 |
| `/cam_1/depth/image_raw` | `sensor_msgs/msg/Image` | Profundidad en metros 424x240 |
| `/odom` | `nav_msgs/msg/Odometry` | Odometría de ruedas |
| `/imu/data` | `sensor_msgs/msg/Imu` | IMU |

Sobre `/cmd_vel`: `linear.x` hace avanzar al robot, `linear.y` lo strafea hacia la izquierda (gracias a las mecanum) y `angular.z` lo hace girar en sentido antihorario.

## El mapa

El mapa del desafío es un entorno tipo laberinto con obstáculos, donde las "víctimas" son conos de colores ubicados en distintos puntos que el robot tiene que encontrar y reportar.

> TODO: las dimensiones exactas del mapa, la distribución de víctimas y el mundo Gazebo oficial se publican cerca de la fecha.
