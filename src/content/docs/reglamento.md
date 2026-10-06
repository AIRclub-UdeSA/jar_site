---
title: "Reglamento oficial"
description: "Condiciones de participación, interfaz ROS 2, formato, puntaje y entrega del Challenge JAR 2026."
status: listo
---

| Parámetro | Definición Oficial |
| :--- | :--- |
| **Robot** | Yahboom ROSMASTER X3, provisto por la organización en pista |
| **Equipos** | Sin límite de integrantes. Participación libre y gratuita. Al menos un integrante presente en Rosario |
| **Tiempo de corrida** | 10 minutos como máximo por corrida |
| **Víctimas (N)** | N cajas rojas en posiciones desconocidas. **N es variable** y se comunica antes de largar |
| **Límite de reportes** | **Exactamente N reportes máximos** a `/victimas` (igual a la cantidad de víctimas de la corrida) |
| **Punto de largada** | Cerca del origen (0, 0, 0) del mapa, sin ser exacto ([§1](#1-descripción-del-desafío)) |
| **Formato** | **Clasificación (miércoles 4):** 2 corridas por equipo (cuenta la mejor).<br/>**Final (jueves 5, 17 hs):** 1 corrida por equipo (4 mejores finalistas) |
| **Arbitraje** | **Nodo de juez oficial** (registro en rosbag) + **Jueces de pista** (evaluación visual de colisiones) |
| **Entrega** | Fork del repositorio de la competencia y Pull Request con CI en verde |

---

## 0. Alcance y objetivo

El Challenge JAR 2026 es una competencia abierta de robótica autónoma desarrollada en el marco de la Jornada Argentina de Robótica. Cada equipo diseña e implementa software en **ROS 2** para que un robot ROSMASTER X3 explore de manera 100% autónoma un laberinto desconocido, localice víctimas (cajas rojas), reporte sus coordenadas georreferenciadas y esquive obstáculos sin intervención humana.

El objetivo central es poner a prueba algoritmos de localización probabilística, navegación robusta y percepción artificial en un robot real frente a un entorno no observado previamente.

Este reglamento fija las condiciones de participación, interfaces oficiales, formato de competencia y sistema de puntaje. Se aplica de forma estricta a todos los equipos.

---

## 1. Descripción del desafío

El robot arranca en el punto de largada de la arena, cerca del origen **(0, 0, 0)** del mapa. Los jueces lo ubican a mano, así que la posición no es exacta. Al iniciarse la corrida, el juez publica el mapa del laberinto en el topic `/map`. El robot no conoce a priori la ubicación de las víctimas.

La misión comprende las siguientes fases:

1. **Localización inicial:** El robot estima su pose en el mapa recibido, usando como referencia aproximada que arranca cerca del origen (ver arriba).
2. **Exploración y detección:** Recorre el laberinto de forma autónoma, esquivando paredes, obstáculos señuelo y distractores, detectando las víctimas mediante su cámara RGB y sensor LiDAR.
3. **Reporte:** Publica la posición estimada (x, y) de cada víctima en el topic `/victimas`.
4. **Regreso a largada (opcional):** Si el robot retorna al punto de largada y publica en `/done`, accede a un bono de puntos extra.

El mapa específico, las víctimas, los señuelos y los distractores recién se conocen en la pista de Rosario. Un software que dependa de mapas fijos o coordenadas hardcodeadas no es válido: debe generalizar ante escenarios nuevos.

---

## 2. Equipos y participación

### 2.1 Composición
- No hay límite de integrantes por equipo.
- No se exige condición de estudiante ni pertenecer a una institución educativa.
- La participación es libre y gratuita. La organización no cubre ningún gasto: viaje, alojamiento, comidas y cualquier otro corren por cuenta de cada equipo.
- Al menos una persona del equipo (capitán o representante) debe estar presente en Rosario durante las corridas del equipo.
- Una misma persona no puede integrar más de un equipo.
- El robot lo provee la organización en pista. El software no debe depender de una unidad física particular.

### 2.2 Requisitos del software
- Se admite cualquier paradigma de control: navegación reactiva, Nav2, SLAM, filtros de partículas (MCL), visión clásica (segmentación en HSV) o modelos entrenados.
- Se permite el uso de bibliotecas de código abierto, modelos preentrenados y código generado con asistentes de IA.
- Todo el software debe iniciar mediante un **único launch file** oficial definido en el template.
- **Parámetro N configurable:** La cantidad de víctimas N es variable y debe estar expuesta como parámetro configurable en el software (argumento del launch).
- Los equipos no pueden modificar ni ampliar la interfaz oficial de topics.

---

## 3. Recursos que provee la organización

<!-- TODO antes de mergear: agregar el link al repo template cuando exista (§3 y §9.1). -->
- **Repositorio template de la competencia:** *(enlace próximamente)* Contiene la arquitectura de paquetes, launch de ejemplo, gestión de parámetros en `params/` y configuración de CI.
- **Simulador oficial ([`AIRclub-UdeSA/yahboom_rosmaster`](https://github.com/AIRclub-UdeSA/yahboom_rosmaster)):** Modelo fiel del robot ROSMASTER X3 con cinemática mecanum, plugins de sensores y mundos de simulación en Gazebo Fortress. La [guía de instalación](../setup/simulador/) explica cómo compilarlo.
- **Mundos y mapas de práctica:** Los pares de mundos (ej. `laberinto_simple_victimas.world`) y mapas (`laberinto_simple.yaml`) provistos en el simulador constituyen la **referencia oficial** para calibrar visión, LiDAR y detección de obstáculos no mapeados.
- **Workshops de formación:** [Workshops](../workshops/) técnicos asincrónicos en el sitio web oficial, que cubren desde cinemática mecanum y detección de color hasta localización y navegación con Nav2.

---

## 4. Formato de competencia

### 4.1 Clasificación (Miércoles 4 de noviembre)
- Se disputa en una arena única durante toda la jornada.
- Cada equipo dispone de **dos (2) corridas oficiales**.
- Para el ranking clasificatorio cuenta **la mejor corrida** de cada equipo.
- Los **cuatro (4) mejores equipos** del ranking avanzan a la Gran Final.

### 4.2 Gran Final (Jueves 5 de noviembre)
- La final se disputa a las **17 hs**.
- Participan exclusivamente los 4 equipos finalistas.
- En la final se disputa **una única corrida por equipo**.
- La arena de la final presenta un nuevo layout con posiciones de víctimas y obstáculos modificadas respecto de la clasificación.
- Gana el equipo con más puntos en su corrida final.

### 4.3 Reglas de pista
- El orden de corridas en clasificación se administra por fila/turnos coordinados por el jurado.
- Las corridas son abiertas y públicas.

---

## 5. Dinámica de cada corrida

1. **Despliegue:** La organización despliega en la estación de pista el commit del equipo con CI en verde y verifica enlace con el robot.
2. **Posicionamiento:** Los jueces ubican el robot en el punto de largada, en las inmediaciones del origen (0, 0, 0).
3. **Espera:** El launch del equipo se inicia y permanece a la espera de la publicación de `/map`.
4. **Largada:** El juez publica el mapa en `/map`. Ese instante exacto inicia el cronómetro oficial de 10 minutos.
5. **Exploración y detección:** El robot opera de forma 100% autónoma. Al detectar víctimas publica su posición estimada en `/victimas`.
6. **Fin de corrida:** La corrida concluye ante el primer suceso entre:
   - El equipo publica un mensaje en `/done`.
   - Se alcanzan los 10 minutos cronometrados desde la publicación de `/map`.
   - El robot permanece inmóvil durante 60 segundos consecutivos ([§11.3](#11-casos-especiales-y-contingencias)).
   - Decisión arbitral por vuelco, salida del laberinto o fuerza mayor ([§11](#11-casos-especiales-y-contingencias)).

Concluida la corrida, el jurado publica el puntaje oficial.

---

## 6. Víctimas, señuelos y distractores

### 6.1 Víctimas
- Cada víctima es una caja de color rojo, detectable por la cámara RGB frontal y por el sensor LiDAR.
- En cada layout hay **N víctimas** (N es variable y se anuncia antes de largar).
- Las víctimas están separadas entre sí a suficiente distancia para que ningún reporte pueda solapar con dos víctimas simultáneamente.
- La posición de una víctima es el centro geométrico de la caja proyectado sobre el plano del piso, expresado en el marco `map`.
- Las características físicas y de reflectividad toman como referencia los modelos provistos en los mundos del simulador.

### 6.2 Obstáculos señuelo
Son objetos volumétricos físicos presentes en la arena pero **ausentes en el mapa `/map`**. El robot debe detectarlos en tiempo real y esquivarlos. Colisionar con ellos computa penalización.

### 6.3 Distractores
Son objetos de diversas formas y colores (azul, amarillo, verde, neutro) distribuidos por el laberinto. Ningún distractor utiliza el color rojo de las víctimas. No otorgan puntos; emitir un reporte erróneo sobre un distractor consume un intento de reporte.

---

## 7. Interfaz oficial ROS 2

### 7.1 Topics oficiales

| Topic | Sentido | Tipo de mensaje | QoS / Notas |
| :--- | :--- | :--- | :--- |
| `/map` | Juez → Equipo | `nav_msgs/msg/OccupancyGrid` | Reliable, Transient Local. Publicado por el juez al iniciar. |
| `/victimas` | Equipo → Juez | `geometry_msgs/msg/PointStamped` | Reliable. `frame_id: 'map'`. Reporte de posición estimada. |
| `/done` | Equipo → Juez | `std_msgs/msg/Empty` | Reliable. Finaliza voluntariamente la corrida. |
| `/cmd_vel` | Equipo → Robot | `geometry_msgs/msg/Twist` | Reliable. Canal exclusivo de comando de velocidad. |
| `/scan` | Robot → Equipo | `sensor_msgs/msg/LaserScan` | **Best Effort**. Sensor LiDAR 2D 360°. |
| `/odom` | Robot → Equipo | `nav_msgs/msg/Odometry` | Reliable. Odometría de ruedas mecanum. |
| `/imu/data` | Robot → Equipo | `sensor_msgs/msg/Imu` | Reliable. Aceleraciones y orientación inercial. |
| `/cam_1/color/image_raw` | Robot → Equipo | `sensor_msgs/msg/Image` | **Best Effort**. Cámara RGB frontal. |
| `/cam_1/color/camera_info` | Robot → Equipo | `sensor_msgs/msg/CameraInfo` | **Best Effort**. Parámetros intrínsecos de la cámara. |
| `/cam_1/depth/color/points` | Robot → Equipo | `sensor_msgs/msg/PointCloud2` | **Best Effort**. Nube de puntos 3D RGB-D. |
| `/tf`, `/tf_static` | Robot → Equipo | `tf2_msgs/msg/TFMessage` | Transformadas y árbol cinemático del robot. |

> [!WARNING]
> **REGLA CRÍTICA DE QOS (BEST EFFORT):**  
> El sensor LiDAR (`/scan`) y las salidas de la cámara RGB-D publican con política de confiabilidad **Best Effort**. En ROS 2, un subscriber configurado con el default *Reliable* **no se conectará** a un publisher *Best Effort* y no recibirá mensajes, sin arrojar ningún error en terminal. Es mandatorio suscribirse utilizando `qos_profile_sensor_data` (`from rclpy.qos import qos_profile_sensor_data`).

### 7.2 Reportes de víctimas
- Cada mensaje en `/victimas` cuenta como un reporte.
- El límite es de **exactamente N reportes** por corrida (igual a la cantidad de víctimas informada). Mensajes adicionales serán ignorados por el nodo del juez.
- Un mensaje mal formado (campo `frame_id` distinto de `map`, NaN o valores infinitos) cuenta como reporte gastado y otorga 0 puntos.
- Se puede re-reportar una misma víctima: consume un nuevo reporte y el sistema adjudica el puntaje del mejor de ellos.
- Cada reporte solo puede asociarse a una única víctima, y cada víctima solo puede otorgar puntaje a un único reporte.

### 7.3 Reloj del sistema
El robot real opera con reloj de pared (*wall-clock time*). No se publica el topic `/clock` durante la competencia real. El simulador sí provee `/clock`, y el template de entrega maneja esta diferencia mediante el argumento estándar `use_sim_time`.

---

## 8. Sistema de puntaje

| Criterio | Puntos | Condiciones |
| :--- | :---: | :--- |
| **Víctima reportada a ≤ 0.25 m** | **+100** | Distancia euclídea entre el reporte y la posición real en el plano del mapa. |
| **Víctima reportada entre 0.25 m y 0.50 m** | **+50** | Precisión media aceptable. |
| **Víctima reportada a > 0.50 m** | **0** | Fuera de tolerancia. **Consume un reporte**. |
| **Bono: Rescate completo veloz** | **+200** | Las N víctimas reportadas con puntaje antes de los primeros 5 minutos de corrida. |
| **Bono: Regreso a largada** | **+100** | Publicar `/done` con el robot a ≤ 0.25 m del punto de largada y con ≥ 1 víctima puntuada. |
| **Colisión con pared, obstáculo o víctima** | **−50** | Por cada evento físico de colisión ([§8.1](#81-detección-y-cómputo-de-colisiones)). |
| **Salida del laberinto** | **−50** y fin | Las cuatro ruedas cruzan el perímetro delimitado. Concluye la corrida. |

*El puntaje mínimo acumulado de una corrida no puede ser menor a 0 puntos.*

> [!NOTE]
> La distancia de cada reporte se mide contra el **centro geométrico de la caja** ([§6.1](#61-víctimas)), no contra las paredes visibles.

### 8.1 Detección y cómputo de colisiones
- La detección de colisiones está a cargo de los **jueces de pista** mediante inspección visual directa.
- Una colisión se define como el contacto físico tangible del chasis o ruedas con paredes, obstáculos o víctimas.
- El contacto continuo se computa como un **único evento de colisión**.
- Si el robot se desacopla, retrocede y vuelve a colisionar, constituye un nuevo evento (−50 pts).
- La telemetría inercial (`/imu/data`) registrada por el nodo del juez constituye la herramienta técnica de respaldo en caso de revisiones.

### 8.2 Criterio de desempate
En caso de igualdad de puntos en el puntaje computable, se desempata aplicando estrictamente el siguiente orden:

1. **Mayor puntaje acumulado** en la corrida computable.
2. **Menor tiempo total de corrida:** Duración cronometrada desde la largada (publicación de `/map`) hasta la finalización efectiva (publicación de `/done` o detención).
3. **Menor cantidad de penalizaciones** por colisión acumuladas.
4. En clasificación, si persiste el empate, se evalúa el puntaje de la segunda corrida realizada.

---

## 9. Entrega y validación

### 9.1 Mecanismo de entrega
- Cada equipo realiza un fork del repositorio template oficial y envía un **Pull Request (PR)** hacia la rama principal del repositorio de la competencia.
- Todo el software debe iniciar con un **único launch file** oficial.
- Todas las configuraciones editables deben residir en la carpeta `params/`. La cantidad de víctimas N no va en `params/`: se recibe como argumento del launch ([§2.2](#22-requisitos-del-software)).

### 9.2 Validación continua (CI)
Para que una entrega sea admisible, todos los checks del CI del PR deben estar en verde. El CI verifica:
- Compilación limpia en ROS 2 Humble sin errores.
- Que el launch file levante correctamente y espere la publicación de `/map`.
- Que los mensajes a `/victimas` cumplan estrictamente la interfaz oficial.
- Compatibilidad del software en simulación frente a mundos de prueba con distintas posiciones de víctimas.
- No utilización de topics ni servicios prohibidos.
- Revisiones estáticas automáticas contra el hardcodeo de geometrías.

---

## 10. Reglas de autonomía y prohibiciones

- **Autonomía total:** El robot opera de forma 100% autónoma durante toda la prueba. Está prohibida cualquier intervención humana, telemando, teleoperación o comunicación bidireccional externa durante la corrida.
- **Prohibición de hardcodeo:** Queda terminantemente prohibido incorporar en el código, parámetros o modelos información geométrica prefijada de la arena de competencia, posiciones de víctimas o waypoints derivados de la observación previa.
- **Fair Play:** Los PR y repositorios son públicos. Se promueve el intercambio de ideas y el código abierto, pero cualquier intento deliberado de sabotaje, manipulación del sistema de arbitraje o interferencia física implicará la inmediata descalificación del equipo.

---

## 11. Casos especiales y contingencias

- **11.1 Fallas de la organización:** Si ocurre una falla comprobada en el hardware del robot, sensores, batería o sistema del jurado (no atribuible al código del equipo), la corrida se repite de inmediato y no descuenta el cupo de corridas.
- **11.2 Vuelco del robot:** Si el chasis supera los 45° de inclinación o queda volcado, la corrida concluye en el acto y se anula: queda en 0 puntos y cuenta como corrida usada.
- **11.3 Robot inmóvil:** Si el robot permanece sin traslación ni rotación durante **60 segundos consecutivos**, el jurado da por concluida la corrida, conservando los puntos acumulados.
- **11.4 Falla de software del equipo:** Si el software del equipo se cae (crash, segfault, excepción), la corrida sigue su curso hasta que venza el cronómetro de 10 minutos o aplique la regla de robot inmóvil. No se permite reiniciar software.

---

## 12. Jurado y arbitraje

- **Composición:** Juez Principal (dirección y fiscalización general), Jueces Técnicos (operación del nodo de registro, CI y rosbag) y Jueces de Pista (seguimiento físico de colisiones y perímetros).
- **Registro oficial:** El nodo del juez graba la totalidad de los topics (`/victimas`, `/done`, `/odom`, `/tf`, `/cmd_vel`, `/imu/data`) constituyendo la fuente de verdad matemática.
- **Reclamos:** Se presentan por escrito ante el jurado dentro de los **15 minutos** posteriores a la publicación del puntaje. La decisión del comité arbitral es definitiva.

---

## 13. Cronograma del evento

Desarrollado en el Predio del CUR, "La Siberia", Rosario:

| Instancia | Fecha | Dinámica |
| :--- | :--- | :--- |
| **Clasificación oficial** | Miércoles 4 de noviembre | 2 corridas por equipo (computa la mejor). Clasifican los 4 mejores |
| **Gran Final** | Jueves 5 de noviembre, 17 hs | 1 única corrida por finalista en arena con nuevo layout |
| **Premiación y cierre** | Jueves 5 de noviembre | Ceremonia de cierre de la JAR 2026 |

---

## 14. Contacto oficial

- **Correo institucional:** `airclub@udesa.edu.ar`
- **Sitio web oficial:** [https://clubroboticaudesa.netlify.app](https://clubroboticaudesa.netlify.app)
- **Organización GitHub:** [https://github.com/AIRclub-UdeSA](https://github.com/AIRclub-UdeSA)
