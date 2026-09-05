---
title: "Simulador con Docker (opcional)"
description: "Levantá el simulador dentro de un contenedor Docker si no tenés Ubuntu 22.04 nativo."
status: listo
duration: "aprox. 30–60 min"
level: intermedio
outcome: "Al terminar, vas a tener el simulador de Donatello corriendo dentro de un contenedor, sin instalar ROS 2 Humble en tu sistema."
---

Este camino sirve si tenés Linux pero no Ubuntu 22.04 nativo — por ejemplo, una versión más nueva de Ubuntu u otra distribución. Docker aísla todo lo que necesita el simulador (ROS 2 Humble, Gazebo Fortress) en un contenedor propio, sin tocar tu instalación de base.

> [!NOTE]
> Es un camino alternativo, no el recomendado por defecto. Si tenés Ubuntu 22.04 nativo o podés instalarlo, seguí la [guía de instalación](../) normal: es más simple y es la que el club puede acompañar más de cerca. En macOS con Apple Silicon, el simulador tiene su propio camino nativo con RoboStack — mirá la sección [macOS (Apple Silicon)](https://github.com/AIRclub-UdeSA/yahboom_rosmaster#macos-apple-silicon) del repositorio.

## Qué vas a dejar funcionando

Docker Engine instalado, el simulador compilado dentro de un contenedor aislado, y Gazebo y RViz abriendo en tu propia pantalla para que puedas mover a Donatello desde el teclado.

## Qué necesitás

- Linux con Docker Engine. Probamos este recorrido en Ubuntu 24.04; cualquier distribución compatible con Docker debería funcionar igual.
- Una cuenta con acceso a `sudo`.
- `xauth` instalado en el sistema, para que Gazebo y RViz puedan abrir ventanas.
- Aproximadamente 8 GB libres en disco, entre la imagen del contenedor y el workspace compilado.
- Una GPU no es obligatoria. Si tenés una GPU NVIDIA, `container.sh` activa el NVIDIA Container Toolkit automáticamente cuando está instalado, pero no probamos ese camino nosotros — ver el aviso más abajo.

## Pasos

### 1. Instalar Docker Engine

```bash
sudo apt-get update
sudo apt-get install -y ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc
```

```bash
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update
```

```bash
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

> [!NOTE]
> Si usás otra distribución, seguí la [guía oficial de instalación](https://docs.docker.com/engine/install/) para tu caso — los pasos de arriba son para Ubuntu/Debian.

### 2. Sumar tu usuario al grupo `docker`

```bash
sudo usermod -aG docker $USER
```

Este cambio no se aplica a la sesión actual. Cerrá sesión y volvé a entrar (o reiniciá) antes de continuar.

```bash
groups
```

> [!CHECK]
> El comando anterior tiene que listar `docker` entre tus grupos. Si no aparece, todavía estás en la sesión vieja.

### 3. Clonar el repositorio

```bash
mkdir -p ~/rosmaster_ws/src
cd ~/rosmaster_ws/src
git clone https://github.com/AIRclub-UdeSA/yahboom_rosmaster.git
```

### 4. Levantar el contenedor

```bash
cd ~/rosmaster_ws/src/yahboom_rosmaster/dockerfiles
./container.sh start
```

La primera vez construye la imagen desde cero: descarga ROS 2 Humble, Gazebo Fortress y sus dependencias, así que puede tardar varios minutos según tu conexión. Las siguientes veces arranca en segundos.

### 5. Instalar dependencias y compilar

```bash
./container.sh build
```

Este paso corre `rosdep` y `colcon build` dentro del contenedor, igual que en la instalación nativa.

### 6. Abrir el simulador

```bash
./container.sh sim
```

El arranque es escalonado, igual que en la instalación nativa: primero abre Gazebo, después crea el robot y finalmente inicia sus interfaces y RViz.

> [!CHECK]
> Donatello debería aparecer en Gazebo y RViz, en ventanas sobre tu propio escritorio. Las dos aplicaciones corren dentro del contenedor, pero se muestran en tu pantalla normal.

Si preferís no abrir ninguna ventana, usá la versión sin GUI:

```bash
./container.sh sim-headless
```

### 7. Moverlo desde el teclado

En otra terminal, dentro de la misma carpeta `dockerfiles`:

```bash
./container.sh teleop
```

La propia herramienta imprime el mapa de teclas — es el mismo `teleop_twist_keyboard` que en la instalación nativa. Mirá la sección "Moverlo desde el teclado" de [Levantar el simulador](../simulador/#6-moverlo-desde-el-teclado) para el detalle de teclas y el modo holonómico.

## Qué deberías ver

Lo mismo que en la instalación nativa: el chasis se mueve y las ruedas mecanum responden en Gazebo, la pose y la odometría cambian en RViz, y podés revisar las interfaces principales con `ros2 topic list` desde otra terminal dentro del contenedor (`./container.sh enter`). La tabla completa de interfaces está en [Levantar el simulador](../simulador/#interfaces-principales).

## Problemas frecuentes

- **`permission denied` al correr cualquier comando `docker`**: tu sesión todavía no cargó el grupo `docker`. Cerrá sesión y volvé a entrar.
- **Gazebo o RViz no abren ninguna ventana**: corré `./container.sh doctor` para revisar Docker, el estado del contenedor, `DISPLAY` y si `xauth` está instalado.
- **El robot se ve con fallas o RViz repite mensajes de "jump back in time"**: quedó una corrida anterior sin cerrar del todo. Pará el contenedor completo antes de volver a lanzar `sim`:

  ```bash
  ./container.sh stop
  ./container.sh start
  ```

- **`./container.sh sim` falla después de un `./container.sh clean`**: `clean` borra el contenedor entero, incluidas las dependencias que instaló `build`. Corré `./container.sh build` de nuevo antes de `sim`. Para simplemente pausar sin perder nada, usá `stop` en vez de `clean`.

> [!WARNING]
> No tuvimos una GPU NVIDIA disponible para validar el camino con el NVIDIA Container Toolkit. `container.sh` lo activa automáticamente si está instalado, pero probalo vos mismo antes de asumir que funciona sin ajustes.

## Próximo paso

Con Donatello funcionando dentro del contenedor, empezá por [01 · Talkers y listeners](../../workshops/semana-01-talkers-listeners/) para entender cómo se comunican los nodos que después van a controlarlo.
