---
title: "01 · Talkers y listeners"
description: "Completá un talker y un listener para entender cómo se comunican dos nodos de ROS 2."
status: listo
duration: "aprox. 60–90 min"
level: inicial
outcome: "Al terminar, vas a poder publicar y suscribirte a un topic completando el código vos mismo."
prerequisites:
  - "Setup completo"
---

## La práctica

<section class="doc-practice-plate" aria-labelledby="la-práctica">
  <div class="doc-practice-intro">
    <p class="doc-practice-statement">Publicar.<br />Escuchar.<br />Comprobar.</p>
    <p class="doc-practice-note">Empezamos con el caso más chico posible: un nodo publica y otro recibe. Sin sensores ni movimiento, para mirar solamente cómo se comunican dos programas de ROS 2.</p>
  </div>

  <dl class="doc-practice-facts">
    <div>
      <dt>Topic</dt>
      <dd><code>mensaje</code></dd>
    </div>
    <div>
      <dt>Tipo</dt>
      <dd><code>std_msgs/String</code></dd>
    </div>
    <div>
      <dt>Ritmo</dt>
      <dd><code>1 Hz</code></dd>
    </div>
    <div>
      <dt>Código</dt>
      <dd>4 comentarios <code>TODO</code></dd>
    </div>
  </dl>

  <figure class="doc-practice-graph">
    <img src="../../media/docs/ros-graph.svg" alt="Un nodo Talker publica mensajes en el topic mensaje y un nodo Listener los recibe" width="960" height="360" loading="lazy" />
    <figcaption>El talker y el listener no se llaman entre sí: los dos se conectan al mismo topic.</figcaption>
  </figure>
</section>

## Antes de empezar

<ol class="doc-preflight" aria-label="Preparación del workshop">
  <li>
    <span class="doc-preflight-index" aria-hidden="true">01</span>
    <div class="doc-preflight-copy">
      <h3>Entorno</h3>
      <p><code>rclpy</code> y <code>std_msgs</code> ya vienen con <code>ros-humble-desktop</code>. No hace falta instalar nada extra esta semana.</p>
    </div>
  </li>
  <li>
    <span class="doc-preflight-index" aria-hidden="true">02</span>
    <div class="doc-preflight-copy">
      <h3>Repositorio</h3>
      <p>Si todavía no tenés el repo de workshops, clonalo dentro de tu workspace, junto a <code>yahboom_rosmaster</code>.</p>
    </div>
  </li>
  <li>
    <span class="doc-preflight-index" aria-hidden="true">03</span>
    <div class="doc-preflight-copy">
      <h3>Workspace</h3>
      <p>Cargá el entorno y confirmá que ROS 2 responda antes de continuar.</p>
    </div>
  </li>
</ol>

```bash
# Solo si todavía no clonaste el repo de workshops
cd ~/rosmaster_ws/src
git clone https://github.com/AIRclub-UdeSA/jar_workshops.git

# Cargá el workspace y comprobá que ROS 2 responda
source ~/rosmaster_ws/install/setup.bash
ros2 node list
```

## Concepto mínimo: nodos, topics y timers

Un [nodo](https://docs.ros.org/en/lyrical/Tutorials/Beginner-CLI-Tools/Understanding-ROS2-Nodes/Understanding-ROS2-Nodes.html) es un programa que corre dentro de ROS 2 y puede hablar con otros nodos. En un robot real puede haber decenas corriendo a la vez — uno que lee el lidar, otro la cámara, otro que mueve las ruedas — cada uno un proceso separado. Los nodos no se conocen entre sí directamente: se comunican a través de [topics](https://docs.ros.org/en/lyrical/Tutorials/Beginner-CLI-Tools/Understanding-ROS2-Topics/Understanding-ROS2-Topics.html), canales con nombre (acá, `mensaje`) a los que unos publican y otros se suscriben, sin necesitarse mutuamente para funcionar.

Cada topic tiene un tipo de mensaje fijo — usamos [`std_msgs/String`](https://docs.ros2.org/latest/api/std_msgs/msg/String.html), el más simple que hay. Publisher y subscriber tienen que declarar el mismo tipo para el mismo topic, o ROS 2 no los deja conectarse. El tamaño de cola que le pasás a `create_publisher`/`create_subscription` (acá, `10`) es cuántos mensajes sin procesar guarda ROS 2 como máximo antes de descartar los más viejos; con un mensaje por segundo casi nunca se llena, pero en sensores más rápidos importa más.

El talker no publica "cuando quiere": publica a un ritmo fijo con un **timer**.

```python
self.timer = self.create_timer(1.0, self.publicar)
```

Esto le dice a ROS 2 "llamá a `self.publicar` cada 1.0 segundos mientras el nodo esté vivo". Usar un timer en vez de, por ejemplo, un `while True` con `time.sleep(1.0)` es lo que se repite en todos los workshops siguientes: le deja a ROS 2 el control de cuándo se ejecuta cada cosa, y permite que un mismo nodo tenga varios timers y callbacks corriendo intercalados sin pisarse.

> [!NOTE]
> Desde la semana 03 vamos a usar una convención: el callback de cada sensor guarda el último dato recibido y un timer separado toma las decisiones a una frecuencia conocida. No es la única arquitectura posible en ROS 2, pero nos permite combinar sensores que publican a ritmos diferentes sin atar el comportamiento del robot a uno de ellos.

## Implementación

Los dos archivos del paquete `talkers_listeners`, [`talker.py`](https://github.com/AIRclub-UdeSA/jar_workshops/blob/main/semana-01-talkers-listeners/talkers_listeners/talkers_listeners/talker.py) y [`listener.py`](https://github.com/AIRclub-UdeSA/jar_workshops/blob/main/semana-01-talkers-listeners/talkers_listeners/talkers_listeners/listener.py), tienen comentarios `TODO` simples: líneas ya escritas, comentadas, que solo hay que descomentar en el lugar indicado. No hay que escribir código nuevo — la idea es que el primer contacto sea leer y entender qué hace cada línea.

Completalos en este orden, probando cada uno antes de pasar al siguiente:

1. **`talker.py` primero.** Tiene 3 comentarios `TODO`: crear el publisher, crear el timer, y publicar el mensaje dentro de `publicar()`. Compilá y corré *solo* el talker, y confirmá con `ros2 topic echo /mensaje` que está publicando antes de tocar el listener.
2. **`listener.py`, después.** Tiene 1 `TODO`: suscribirse al topic `mensaje`. Con el talker ya andando en una terminal, corré el listener en otra y confirmá en sus logs que va recibiendo cada mensaje.

En `talker.py` vas a habilitar estas tres líneas:

```python
self.publisher_ = self.create_publisher(String, 'mensaje', 10)
self.timer = self.create_timer(1.0, self.publicar)
self.publisher_.publish(msg)
```

En `listener.py`, vas a habilitar la suscripción:

```python
self.subscription = self.create_subscription(
    String, 'mensaje', self.recibir, 10
)
```

> [!NOTE]
> Todo paquete `ament_python` necesita [`package.xml`](https://github.com/AIRclub-UdeSA/jar_workshops/blob/main/semana-01-talkers-listeners/talkers_listeners/package.xml) (declara dependencias con `<depend>`) y [`setup.py`](https://github.com/AIRclub-UdeSA/jar_workshops/blob/main/semana-01-talkers-listeners/talkers_listeners/setup.py) (registra en `entry_points` qué ejecutables expone el paquete). Esta semana ya vienen completos — alcanza con mirarlos una vez, porque de acá en adelante los vas a tener que tocar vos.

## Ejecución

```bash
# Terminal 1 — build
cd ~/rosmaster_ws
colcon build --symlink-install --packages-select talkers_listeners
source ~/rosmaster_ws/install/setup.bash
```

```bash
# Terminal 2 — el talker (probalo solo, primero)
source ~/rosmaster_ws/install/setup.bash
ros2 run talkers_listeners talker
```

```bash
# Terminal 3 — chequeo mientras el talker corre solo
source ~/rosmaster_ws/install/setup.bash
ros2 topic echo /mensaje
```

Una vez confirmado que el talker publica, detené `echo` con `Ctrl+C`. Con `listener.py` ya completado, reutilizá esa terminal:

```bash
# Terminal 3 — el listener
source ~/rosmaster_ws/install/setup.bash
ros2 run talkers_listeners listener
```

## Comprobación

Con las dos terminales corriendo a la vez, cada mensaje del talker debería aparecer en el listener apenas se publica. Vas a ver un par nuevo por segundo: `Publiqué: "Hola desde el talker, mensaje N"` de un lado y `Recibí: "..."` del otro, con `N` incrementando.

Abrí una cuarta terminal para inspeccionar el sistema mientras los dos nodos siguen activos:

```bash
source ~/rosmaster_ws/install/setup.bash
ros2 topic list
ros2 topic info /mensaje
ros2 topic hz /mensaje
```

`ros2 topic list` debería incluir `/mensaje`; `ros2 topic info` debería encontrar un publisher y una suscripción; y `ros2 topic hz` debería medir una frecuencia cercana a `1 Hz`.

> [!QUESTION]
> Cerrá el talker y dejá el listener corriendo. ¿Qué cambia en `ros2 topic info /mensaje`? El topic sigue declarado por el suscriptor, pero deja de recibir datos hasta que aparece otro publisher.

## Explicación: el mismo patrón con Donatello

Con el simulador levantado (ver la [guía del simulador](../../setup/simulador/#6-moverlo-desde-el-teclado)), abrí otra terminal para la teleoperación por teclado:

```bash
source ~/rosmaster_ws/install/setup.bash
ros2 run teleop_twist_keyboard teleop_twist_keyboard
```

En otra terminal, inspeccioná el topic real del robot mientras manejás:

```bash
source ~/rosmaster_ws/install/setup.bash
ros2 topic echo /cmd_vel
```

Es el mismo patrón que tu talker y listener, pero con un topic real: `teleop_twist_keyboard` publica `geometry_msgs/Twist` en `/cmd_vel`, y el controlador de Donatello lo escucha para mover las ruedas. Fijate cómo cambian `linear.x`, `linear.y` y `angular.z` según las teclas que uses — el publisher no sabe ni le importa que del otro lado hay ruedas de verdad, es el mismo desacople que viste entre tu talker y tu listener.

## Desafío extra

Modificá `listener.py` para que en vez de suscribirse a `mensaje` escuche `/cmd_vel` (tipo `geometry_msgs/Twist`) y loguee `linear.x`, `linear.y` y `angular.z` cada vez que llega un mensaje. Agregá también `<depend>geometry_msgs</depend>` a `package.xml`, porque el nodo ahora importa ese paquete.

Volvé a compilar, cargá el overlay y corré tu listener modificado mientras manejás con la teleoperación por teclado:

```bash
cd ~/rosmaster_ws
colcon build --symlink-install --packages-select talkers_listeners
source ~/rosmaster_ws/install/setup.bash
ros2 run talkers_listeners listener
```

Confirmá que ves los mismos valores que en `ros2 topic echo /cmd_vel`.
