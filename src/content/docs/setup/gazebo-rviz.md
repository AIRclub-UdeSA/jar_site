---
title: "Gazebo Fortress y RViz"
description: "Instalación de la integración Gazebo-ROS 2 y verificación de RViz."
status: listo
---

# Gazebo Fortress y RViz

Este desafío usa Gazebo Fortress (la versión "nueva" de Ignition) y NO Gazebo Classic: el movimiento mecanum del ROSMASTER X3 se simula con física real de contactos entre ruedas y suelo, algo que Fortress resuelve mucho mejor que Classic.

## 1. Instalar la integración Gazebo-ROS 2

```bash
sudo apt update && sudo apt install ros-humble-ros-gz
```

Este metapaquete trae el puente `ros_gz` y toda la integración entre ROS 2 Humble y Fortress, incluyendo los launch files que combinan ambos mundos.

## 2. Verificar Gazebo

Comprobá que tenés Fortress instalado:

```bash
ign gazebo --version
```

La salida debe mostrar `Ignition Gazebo, version 6.x.x`, es decir, la serie Fortress. Después abrí Gazebo sin ningún robot para verificar que arranca bien:

```bash
ign gazebo -r empty.sdf
```

Se debería abrir la ventana de Gazebo con un mundo vacío corriendo. Cuando confirmes que funciona, cerrala.

## 3. Verificar RViz2

RViz2 viene incluido con `ros-humble-desktop`. Abrilo con:

```bash
rviz2
```

Debería aparecer la ventana de RViz con la vista 3D vacía y el panel de displays a la izquierda. Cerrala cuando verifiques que abre sin errores.

## Problemas de renderizado en máquinas virtuales

Si Gazebo o RViz se ven lentos, con artefactos o directamente fallan al abrir, probablemente sea por falta de aceleración gráfica en la VM. En ese caso conviene:

- Usar Ubuntu nativo o dual boot, que es la opción recomendada.
- O bien activar la aceleración 3D de la máquina virtual (en VirtualBox: Configuración > Pantalla > Habilitar aceleración 3D; en VMware: acelerar gráficos 3D en la configuración del display).
