---
title: "Instalar ROS 2 Humble"
description: "Instalá ROS 2 Humble en Ubuntu 22.04 y comprobá que dos nodos puedan comunicarse."
status: listo
duration: "aprox. 30–60 min"
level: inicial
outcome: "Al terminar, vas a poder ejecutar un talker y un listener que intercambian mensajes."
prerequisites:
  - "Ubuntu 22.04"
---

Vamos a seguir el recorrido recomendado por la [documentación oficial de ROS 2](https://docs.ros.org/en/humble/Installation/Ubuntu-Install-Debs.html). Ejecutá cada bloque completo y esperá a que termine antes de pasar al siguiente.

## Qué vas a dejar funcionando

ROS 2 Humble Desktop va a quedar instalado y cargado automáticamente en cada terminal. Al final vas a probarlo con dos nodos de ejemplo que intercambian mensajes.

## Qué necesitás

- Ubuntu 22.04 con acceso a una cuenta que pueda usar `sudo`.
- Una terminal y conexión a internet.
- Entre 30 y 60 minutos, según la velocidad de descarga.

## Pasos

### 1. Preparar Ubuntu

Primero habilitá el repositorio `universe` e instalá las herramientas que vamos a usar durante la instalación:

```bash
sudo apt update
sudo apt install software-properties-common curl
sudo add-apt-repository universe
```

Después configurá el locale del sistema:

```bash
sudo apt update && sudo apt install locales
sudo locale-gen es_AR.UTF-8 en_US.UTF-8
sudo update-locale LC_ALL=en_US.UTF-8 LANG=en_US.UTF-8
export LANG=en_US.UTF-8
```

> [!NOTE]
> Si preferís trabajar con locale argentino, podés usar `es_AR.UTF-8` en lugar de `en_US.UTF-8`. Los dos funcionan para esta guía.

### 2. Agregar el repositorio de ROS 2

Descargá la clave oficial que permite verificar los paquetes:

```bash
sudo curl -sSL https://raw.githubusercontent.com/ros/rosdistro/master/ros.key -o /usr/share/keyrings/ros-archive-keyring.gpg
```

Agregá el repositorio de ROS 2 a las fuentes de `apt`:

```bash
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/ros-archive-keyring.gpg] http://packages.ros.org/ros2/ubuntu $(. /etc/os-release && echo $UBUNTU_CODENAME) main" | sudo tee /etc/apt/sources.list.d/ros2.list > /dev/null
```

### 3. Instalar ROS 2 Humble Desktop

```bash
sudo apt update && sudo apt upgrade
sudo apt install ros-humble-desktop
```

La descarga incluye ROS 2, RViz y varias herramientas de desarrollo, por eso puede tardar algunos minutos.

### 4. Cargar el entorno automáticamente

ROS 2 necesita configurar variables de entorno en cada terminal. Agregá el `source` a tu `.bashrc` para hacerlo automáticamente:

```bash
echo "source /opt/ros/humble/setup.bash" >> ~/.bashrc
source ~/.bashrc
```

### 5. Instalar las herramientas de compilación

```bash
sudo apt install python3-colcon-common-extensions python3-rosdep git
```

`colcon` va a compilar el workspace del simulador y `rosdep` se va a ocupar de sus dependencias.

### 6. Inicializar rosdep

```bash
sudo rosdep init
rosdep update
```

> [!NOTE]
> Si `rosdep init` responde `ERROR: default sources list file already exists`, la configuración ya estaba creada. Corré solamente `rosdep update`.

### 7. Comprobar la instalación

Abrí dos terminales nuevas. En la primera ejecutá:

```bash
ros2 run demo_nodes_cpp talker
```

En la segunda:

```bash
ros2 run demo_nodes_cpp listener
```

```text
[talker]: Publishing: 'Hello World: 1'
[listener]: I heard: [Hello World: 1]
```

## Qué deberías ver

El talker publica una línea nueva por segundo y el listener muestra el mismo número apenas recibe el mensaje.

> [!CHECK]
> Si el número avanza en ambas terminales, ROS 2 quedó instalado y los nodos pueden encontrarse.

## Problemas frecuentes

- Si una terminal no reconoce `ros2`, cerrala y abrí una nueva para volver a cargar `.bashrc`.
- Si `apt` no encuentra `ros-humble-desktop`, revisá que Ubuntu sea la versión 22.04 y repetí el paso del repositorio.
- Para trabajar localmente no hace falta configurar `ROS_DOMAIN_ID`; el valor por defecto alcanza.

## Próximo paso

Seguí con [Gazebo Fortress y RViz](../gazebo-rviz/) para comprobar las dos herramientas visuales que usa el simulador.

Si querés entender qué están haciendo el talker y el listener, más adelante podés volver al [Workshop 01](../../workshops/semana-01-talkers-listeners/).
