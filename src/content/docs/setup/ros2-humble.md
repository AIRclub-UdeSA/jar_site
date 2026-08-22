---
title: "Instalar ROS 2 Humble"
description: "Instalación de ROS 2 Humble en Ubuntu 22.04 paso a paso."
status: listo
---

# Instalar ROS 2 Humble

En esta página instalamos ROS 2 Humble siguiendo los pasos canónicos de la [documentación oficial de ROS 2](https://docs.ros.org/en/humble/Installation/Ubuntu-Install-Debs.html). Abrí una terminal y ejecutá cada bloque antes de pasar al siguiente.

## 1. Habilitar universe y configurar el locale

```bash
sudo apt update && sudo apt install software-properties-common
sudo add-apt-repository universe
sudo apt update && sudo apt install locales
sudo locale-gen es_AR.UTF-8 en_US.UTF-8
sudo update-locale LC_ALL=en_US.UTF-8 LANG=en_US.UTF-8
export LANG=en_US.UTF-8
```

Si preferís trabajar con locale argentino, podés usar `es_AR.UTF-8` en lugar de `en_US.UTF-8`; cualquiera de los dos funciona.

## 2. Agregar el repositorio apt de ROS 2

Primero agregá la clave GPG oficial:

```bash
sudo curl -sSL https://raw.githubusercontent.com/ros/rosdistro/master/ros.key -o /usr/share/keyrings/ros-archive-keyring.gpg
```

Después agregá el repositorio a tus fuentes:

```bash
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/ros-archive-keyring.gpg] http://packages.ros.org/ros2/ubuntu $(. /etc/os-release && echo $UBUNTU_CODENAME) main" | sudo tee /etc/apt/sources.list.d/ros2.list > /dev/null
```

## 3. Instalar ROS 2 Humble Desktop

```bash
sudo apt update && sudo apt upgrade
sudo apt install ros-humble-desktop
```

La instalación puede tardar varios minutos porque descarga e instala muchos paquetes.

## 4. Cargar el entorno automáticamente

Para no tener que hacer source en cada terminal nueva:

```bash
echo "source /opt/ros/humble/setup.bash" >> ~/.bashrc
source ~/.bashrc
```

## 5. Instalar herramientas de build

Estas herramientas las vamos a necesitar para compilar el simulador más adelante:

```bash
sudo apt install python3-colcon-common-extensions python3-rosdep git
```

## 6. Inicializar rosdep

```bash
sudo rosdep init
rosdep update
```

Si `rosdep init` te dice que ya existe (`ERROR: default sources list file already exists`), salteá ese paso y corré directamente `rosdep update`.

## 7. Verificar la instalación

Abrí dos terminales (asegurate de que ambas tengan el entorno cargado) y en la primera corré:

```bash
ros2 run demo_nodes_cpp talker
```

Y en la segunda:

```bash
ros2 run demo_nodes_cpp listener
```

Deberías ver al *talker* publicando mensajes `Hello world: N` con el número incrementando, y al *listener* imprimiendo `I heard: [Hello world: N]` por cada mensaje recibido. Si eso pasa, tu instalación de ROS 2 está funcionando y los nodos se comunican correctamente.

> Para este desafío no hace falta configurar `ROS_DOMAIN_ID`: el valor por defecto funciona sin problemas para simular todo en tu máquina local.
