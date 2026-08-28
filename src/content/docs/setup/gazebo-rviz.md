---
title: "Gazebo Fortress y RViz"
description: "Instalá la integración con ROS 2 y comprobá que Gazebo y RViz abran correctamente."
status: listo
duration: "aprox. 10–20 min"
level: inicial
outcome: "Al terminar, Gazebo Fortress y RViz van a abrir sin errores de renderizado."
prerequisites:
  - "ROS 2 Humble instalado"
---

Gazebo simula el robot y su entorno; RViz permite mirar los datos que ROS 2 recibe de sensores, odometría y transformaciones. Antes de compilar el simulador vamos a comprobar las dos herramientas por separado.

## Qué vas a dejar funcionando

Gazebo Fortress y RViz van a quedar instalados y listos para abrir. Esta prueba separada permite detectar problemas gráficos antes de sumar el simulador completo.

## Qué necesitás

- ROS 2 Humble funcionando.
- Una sesión gráfica de Ubuntu 22.04.
- Aceleración 3D habilitada si trabajás dentro de una máquina virtual.

El proyecto usa **Gazebo Fortress**, no Gazebo Classic. Fortress representa mejor los contactos que necesita el movimiento de las ruedas mecanum.

## Pasos

### 1. Instalar la integración con ROS 2

```bash
sudo apt update
sudo apt install ros-humble-ros-gz
```

Este metapaquete instala Gazebo Fortress, el puente `ros_gz` y las herramientas necesarias para intercambiar datos con ROS 2 Humble.

### 2. Comprobar Gazebo

Revisá la versión instalada:

```bash
ign gazebo --version
```

La salida debería indicar `Ignition Gazebo, version 6.x.x`. Después abrí un mundo vacío:

```bash
ign gazebo -r empty.sdf
```

Esperá a que aparezca la ventana y cerrala cuando confirmes que responde normalmente.

### 3. Comprobar RViz

RViz ya viene con `ros-humble-desktop`. Abrilo con:

```bash
rviz2
```

Deberías ver una vista 3D vacía y el panel de displays a la izquierda. Por ahora no hace falta configurar nada.

## Qué deberías ver

Las dos aplicaciones tienen que abrir, responder normalmente y cerrarse sin errores.

Por ahora las dos se ven vacías: Gazebo con un mundo sin nada y RViz con la vista 3D en gris, sin ningún dato. Está bien que sea así, porque todavía no hay un robot ni nadie publicando. Recién cuando levantes el simulador y avances con los workshops las vas a ver como en estas capturas:

<div class="doc-media-pair doc-figure">
  <figure>
    <img src="../../media/donatello-gazebo-poster.webp" alt="Donatello dentro del simulador de Gazebo" width="960" height="520" loading="lazy" />
    <figcaption>Más adelante: Gazebo con Donatello en el mundo del desafío, simulando movimiento y contactos.</figcaption>
  </figure>
  <figure>
    <img src="../../media/donatello-rviz-poster.webp" alt="Datos de Donatello visualizados en RViz" width="960" height="520" loading="lazy" />
    <figcaption>Más adelante: RViz mostrando lo que publica el robot, como el LiDAR, la cámara y la odometría.</figcaption>
  </figure>
</div>

> [!CHECK]
> Si las dos ventanas abren y podés cerrarlas sin errores, el entorno gráfico está listo para usar el simulador.

## Problemas frecuentes

Si Gazebo o RViz se ven lentos, muestran artefactos o fallan al abrir, la causa más común es la aceleración gráfica.

- En VirtualBox: activá **Configuración → Pantalla → Habilitar aceleración 3D**.
- En VMware: activá la aceleración 3D en la configuración de display.
- Si el problema continúa, probá Ubuntu nativo o dual boot, que es el camino recomendado.

> [!WARNING]
> Una máquina virtual puede abrir las aplicaciones y aun así rendir demasiado lento para trabajar cómodamente con sensores y física en tiempo real.

## Próximo paso

Con las herramientas verificadas, continuá con [Levantar el simulador](../simulador/).
