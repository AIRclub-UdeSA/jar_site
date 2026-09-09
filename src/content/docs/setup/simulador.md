---
title: "Levantar el simulador"
description: "Cloná, compilá y ejecutá el simulador de Donatello."
status: listo
duration: "aprox. 20–40 min"
level: inicial
outcome: "Al terminar, vas a poder mover Donatello desde el teclado y comprobar sus interfaces principales."
prerequisites:
  - "ROS 2 Humble"
  - "Gazebo Fortress y RViz"
---

Ahora vamos a crear un workspace, compilar el repositorio y abrir Donatello en Gazebo y RViz. Hacé este recorrido desde una terminal nueva para trabajar con el entorno de ROS 2 ya cargado.

## Qué vas a dejar funcionando

Donatello va a quedar compilado dentro de tu workspace, abierto en Gazebo y RViz, y listo para recibir comandos de velocidad desde el teclado.

## Qué necesitás

- ROS 2 Humble, Gazebo y RViz funcionando.
- `git`, `rosdep` y `colcon` instalados.
- Aproximadamente 15 GB libres para dependencias, compilación y archivos del simulador.

## Pasos

### 1. Crear el workspace

```bash
mkdir -p ~/rosmaster_ws/src
cd ~/rosmaster_ws/src
```

### 2. Clonar el repositorio

```bash
git clone https://github.com/AIRclub-UdeSA/yahboom_rosmaster.git
```

### 3. Instalar dependencias

```bash
source /opt/ros/humble/setup.bash
cd ~/rosmaster_ws
rosdep update
rosdep install --from-paths src --ignore-src -r -y --rosdistro humble
```

`rosdep` revisa los paquetes del workspace e instala las dependencias externas que todavía no están en tu máquina.

### 4. Compilar

```bash
cd ~/rosmaster_ws
colcon build --symlink-install
source install/setup.bash
```

En cada terminal nueva necesitás cargar ROS 2 y el overlay del workspace:

```bash
source /opt/ros/humble/setup.bash
source ~/rosmaster_ws/install/setup.bash
```

Si agregaste el primer comando a `.bashrc` durante la instalación de ROS 2, solo tenés que ejecutar el segundo.

### 5. Lanzar la simulación

```bash
ros2 launch yahboom_rosmaster_bringup rosmaster_x3_sim.launch.py
```

El arranque es escalonado: primero abre Gazebo, después crea el robot y finalmente inicia sus interfaces y RViz. Esperá estos mensajes antes de intentar moverlo:

```text
Configured and activated joint_state_broadcaster
Publishing wheel-state odometry from /joint_states to /odom
```

> [!CHECK]
> Donatello debería aparecer en Gazebo y RViz. Cuando la odometría empieza a publicarse, el robot está listo para recibir comandos.

### 6. Moverlo desde el teclado

Instalá el nodo de teleoperación:

```bash
sudo apt install -y ros-humble-teleop-twist-keyboard
```

En una segunda terminal con los dos entornos cargados, ejecutá:

```bash
ros2 run teleop_twist_keyboard teleop_twist_keyboard
```

La propia herramienta imprime el mapa de teclas. Usá `i`, `j`, `l` y `,` para el movimiento convencional. Para desplazarte de costado o en diagonal sin girar, mantené `Shift` y usá las combinaciones holonómicas en mayúscula que aparecen bajo **Holonomic mode**.

Mantené enfocada esa terminal mientras manejás y dejá espacio libre alrededor del robot.

## Qué deberías ver

- En Gazebo, el chasis se mueve y las ruedas mecanum responden al comando.
- En RViz, cambian la pose y la odometría mientras llegan nuevas mediciones.
- En la terminal de teleoperación, la velocidad actual se actualiza con cada tecla.

Podés inspeccionar el comando enviado desde una tercera terminal:

```bash
ros2 topic echo /cmd_vel
```

### Interfaces principales

| Topic | Tipo de mensaje | Qué publica |
| --- | --- | --- |
| `/cmd_vel` | `geometry_msgs/msg/Twist` | Comandos de velocidad para mover el robot |
| `/joint_states` | `sensor_msgs/msg/JointState` | Posición y velocidad de las ruedas |
| `/odom` | `nav_msgs/msg/Odometry` | Odometría calculada desde las ruedas |
| `/scan` | `sensor_msgs/msg/LaserScan` | Lecturas del LiDAR 2D — **Best Effort** |
| `/imu/data` | `sensor_msgs/msg/Imu` | Orientación y aceleraciones del IMU |
| `/cam_1/color/image_raw` | `sensor_msgs/msg/Image` | Imagen RGB de la cámara — **Best Effort** |
| `/cam_1/color/camera_info` | `sensor_msgs/msg/CameraInfo` | Intrínsecos de la cámara — **Best Effort** |
| `/cam_1/depth/color/points` | `sensor_msgs/msg/PointCloud2` | Nube de puntos RGB-D — **Best Effort** |
| `/tf` | `tf2_msgs/msg/TFMessage` | Transformaciones dinámicas del robot |
| `/tf_static` | `tf2_msgs/msg/TFMessage` | Transformaciones fijas entre sus componentes |
| `/clock` | `rosgraph_msgs/msg/Clock` | Reloj de la simulación |

> [!WARNING]
> **Los cuatro `Best Effort` de la tabla no son un detalle.** El lidar y las tres salidas de la cámara publican con esa *Reliability* ("mandá el dato, y si se pierde uno, ya viene el próximo"), igual que el ROSMASTER X3 físico. Un subscriber `Reliable` —que es lo que te da el default de rclpy, `create_subscription(Tipo, 'topico', callback, 10)`— **no se conecta** a un publisher `Best Effort`: DDS considera los perfiles incompatibles y no arma la conexión. No llega ningún mensaje, y no hay error ni excepción. Para esos cuatro tópicos suscribite con `qos_profile_sensor_data` (`from rclpy.qos import qos_profile_sensor_data`). Ojo que la regla no es "todo sensor va en Best Effort": `/imu/data` es un sensor y publica `Reliable`. `/cmd_vel` es el único que va en la otra dirección —lo publicás vos y el robot lo escucha en `Reliable`—, así que ahí el default de rclpy es el que corresponde.

Para confirmar con qué QoS publica cualquier tópico:

```bash
ros2 topic info /scan --verbose
```

Listá las interfaces disponibles con:

```bash
ros2 topic list
```

## Problemas frecuentes

- Si el launch no encuentra un paquete, volvé a ejecutar `source ~/rosmaster_ws/install/setup.bash`.
- Si modificaste o actualizaste el repositorio, compilá otra vez con `colcon build --symlink-install`.
- Si Gazebo abre pero el robot no responde, esperá los mensajes de activación y revisá que `/cmd_vel` aparezca en `ros2 topic list`.
- Para argumentos como `world`, `rviz`, `headless` o `motion_profile`, consultá el [README del simulador](https://github.com/AIRclub-UdeSA/yahboom_rosmaster).

## Próximo paso

Con Donatello funcionando, andá directo a [Sobre los workshops](../../workshops/) y empezá por [01 · Talkers y listeners](../../workshops/semana-01-talkers-listeners/) para entender cómo se comunican los nodos que después van a controlarlo.

¿Preferís simular todo dentro de un container en vez de instalar ROS 2 Humble en tu sistema? Es un camino alternativo, no un paso extra: mirá la guía de [Docker (opcional)](../docker/).
