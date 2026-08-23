---
title: "Levantar el simulador"
description: "Clonar, compilar y correr el simulador del ROSMASTER X3."
status: listo
---

Con ROS 2 y Gazebo listos, en esta página vas a clonar el repositorio del simulador, compilarlo con colcon y lanzar el ROSMASTER X3 en el mundo del desafío de comportamiento robótico.

## 1. Crear el workspace

```bash
mkdir -p ~/rosmaster_ws/src
cd ~/rosmaster_ws/src
```

## 2. Clonar el repositorio

```bash
git clone https://github.com/AIRclub-UdeSA/yahboom_rosmaster.git
```

## 3. Instalar dependencias

```bash
source /opt/ros/humble/setup.bash
cd ~/rosmaster_ws
rosdep update
rosdep install --from-paths src --ignore-src -r -y --rosdistro humble
```

Este comando recorre todos los paquetes del workspace e instala las dependencias externas que falten.

## 4. Compilar

Desde la raíz del workspace:

```bash
colcon build --symlink-install
source install/setup.bash
```

Importante: en cada terminal nueva tenés que cargar AMBOS entornos para poder usar el simulador:

```bash
source /opt/ros/humble/setup.bash
source ~/rosmaster_ws/install/setup.bash
```

Si seguiste el paso 4 de la [guía de ROS 2 Humble](../ros2-humble/), el primero se carga solo desde `~/.bashrc`.

## 5. Lanzar la simulación

```bash
ros2 launch yahboom_rosmaster_gazebo rosmaster_gazebo_fortress.launch.py
```

Este comando arranca Gazebo y RViz juntos. El arranque es escalonado, así que tené paciencia: esperá a ver en la terminal estos mensajes antes de intentar mover el robot:

```text
Configured and activated joint_state_broadcaster
Publishing wheel-state odometry
```

Cuando aparezcan, el robot está listo y sus sensores publicando.

## 6. Teleoperación

Instalá el nodo de teleoperación por teclado:

```bash
sudo apt install ros-humble-teleop-twist-keyboard
```

En otra terminal (recordá sourcer `/opt/ros/humble` y el overlay del workspace), corré:

```bash
ros2 run teleop_twist_keyboard teleop_twist_keyboard
```

Con esa terminal enfocada:

- `i` avanza hacia adelante y `,` retrocede.
- `j` gira hacia la izquierda y `l` hacia la derecha.
- Al ser un chasis mecanum con movimiento holonómico, también puede strafear: usá `u`/`o` para avanzar en diagonal y `,`/`.` para retroceder; con las teclas de strafe laterales el robot se desplaza de costado sin girar.

Mantené presionada la tecla mientras mirás el robot en Gazebo o RViz.

## Topics principales

| Topic | Tipo de mensaje | Qué publica |
| --- | --- | --- |
| `/cmd_vel` | `geometry_msgs/msg/Twist` | Comando de velocidad para mover el robot |
| `/scan` | `sensor_msgs/msg/LaserScan` | Lecturas del LiDAR 2D |
| `/cam_1/color/image_raw` | `sensor_msgs/msg/Image` | Imagen RGB de la cámara RGB-D |
| `/cam_1/depth/image_raw` | `sensor_msgs/msg/Image` | Mapa de profundidad de la cámara RGB-D |
| `/odom` | `nav_msgs/msg/Odometry` | Odometría estimada del robot |
| `/imu/data` | `sensor_msgs/msg/Imu` | Orientación y aceleraciones del IMU |
| `/clock` | `rosgraph_msgs/msg/Clock` | Reloj de la simulación |

Podés inspeccionarlos con `ros2 topic list` y `ros2 topic echo <topic>`.

## Troubleshooting y argumentos de lanzamiento

Para troubleshooting avanzado y para conocer los argumentos disponibles del launch file (`world`, `rviz`, `headless`, `motion_profile`, entre otros), consultá el [README del repositorio del simulador](https://github.com/AIRclub-UdeSA/yahboom_rosmaster).
