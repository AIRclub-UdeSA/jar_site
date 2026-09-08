---
title: "07 · Obstáculos fuera del mapa"
description: "Compará el /scan contra el mapa conocido y reportá la coordenada en map de lo que no debería estar ahí."
status: listo
duration: "aprox. 90–120 min"
level: avanzado
outcome: "Al terminar, tu robot detecta objetos que el mapa no tiene registrados y publica la coordenada (x, y) en map de cada uno, visible como marcador fijo en RViz."
prerequisites:
  - "Setup completo"
  - "Workshop 04"
  - "Workshop 06"
---

## La práctica

<section class="doc-practice-plate" aria-labelledby="la-práctica">
  <div class="doc-practice-intro">
    <p class="doc-practice-statement">Comparar.<br />Agrupar.<br />Ubicar.</p>
    <p class="doc-practice-note">El mapa de la competencia es una foto fija; el terreno real no. Este workshop encuentra lo que cambió y le pone una coordenada.</p>
  </div>

  <dl class="doc-practice-facts">
    <div>
      <dt>Compara</dt>
      <dd><code>/scan</code> contra <code>/likelihood_map</code> (el campo de semana 06)</dd>
    </div>
    <div>
      <dt>Agrupa</dt>
      <dd>Rachas contiguas de puntos "no mapeados" en objetos discretos</dd>
    </div>
    <div>
      <dt>Publica</dt>
      <dd><code>PoseArray</code> + <code>MarkerArray</code> con la coordenada en <code>map</code> de cada uno</dd>
    </div>
    <div>
      <dt>Reusa</dt>
      <dd>El truco de "scan filtrado con <code>inf</code>" de <code>/scan_rojo</code>, semana 04</dd>
    </div>
  </dl>
</section>

## Antes de empezar

<ol class="doc-preflight" aria-label="Preparación del workshop">
  <li>
    <span class="doc-preflight-index" aria-hidden="true">01</span>
    <div class="doc-preflight-copy">
      <h3>Semana 06 funcionando</h3>
      <p>Necesitás <code>localizador</code> y <code>campo_verosimilitud</code> de la <a href="../semana-06-localizacion/">semana 06</a> corriendo y corrigiendo <code>map → odom</code> — este workshop consume <code>/likelihood_map</code> y la tf a <code>map</code> que ya publican.</p>
    </div>
  </li>
  <li>
    <span class="doc-preflight-index" aria-hidden="true">02</span>
    <div class="doc-preflight-copy">
      <h3>Un mundo con víctimas</h3>
      <p>Esta semana usás un mundo <code>_victimas</code> (mismo laberinto, con cubos de color que <strong>no</strong> están en el mapa que le pasás a <code>map_server</code>) en vez del mundo "limpio" que veniás usando.</p>
    </div>
  </li>
  <li>
    <span class="doc-preflight-index" aria-hidden="true">03</span>
    <div class="doc-preflight-copy">
      <h3>Chequeo</h3>
      <p>Con el mapa "limpio" corrigiendo bien la pose (comprobación de semana 06), estás listo para crear el paquete de esta semana.</p>
    </div>
  </li>
</ol>

## Concepto mínimo: comparar contra un campo que ya está calculado

La forma "directa" de comparar el `/scan` contra el mapa sería [*raycasting*](https://en.wikipedia.org/wiki/Ray_casting): para cada rayo, simular qué debería medir un lidar ideal parado en la pose actual, marchando celda por celda sobre la grilla. Es la misma cuenta que semana 06 descartó por lenta en Python puro — ahí, en vez de simular el lidar completo por cada partícula, se precalculó **una sola vez** un campo de verosimilitud (`/likelihood_map`) y después solo se lo indexa.

Ese campo ya es, literalmente, "qué tan probable es que el mapa diga que hay algo en esta celda". Compararlo acá sale gratis: transformás cada punto del `/scan` a `map` (mismo lookup de `tf2` que ya usaste en semana 04, con la tf completa que arma semana 06), lo convertís a un índice `[fila, columna]` de `/likelihood_map`, y leés la probabilidad — si es baja, el mapa no tenía nada ahí.

Un obstáculo real casi nunca genera un solo punto "no mapeado" suelto: genera una **racha** de varios rayos seguidos pegando en la misma cara, igual que ya viste con `/scan_rojo`. Agrupar esas rachas y promediar sus puntos en `map` alcanza para tener la coordenada del objeto, sin necesitar un clustering espacial genérico.

> [!NOTE]
> Un punto puede transformarse a una posición que cae **afuera** del área que cubre `/likelihood_map` (el robot mirando hacia el borde del mapa conocido). Ahí no hay ninguna celda que consultar, y tratar "no hay dato" como "probabilidad baja" reporta objetos fantasma pegados al borde — sin importar cuánto ajustes el umbral. Hay que descartar ese caso aparte.

## Implementación

### Creá tu paquete

Creá tu paquete, llamado por ejemplo `obstaculos_no_mapeados`, y modificá los archivos correspondientes — mismo procedimiento que en [semana 06](../semana-06-localizacion/). Copiá [`detector_obstaculos.py`](https://github.com/AIRclub-UdeSA/jar_workshops/blob/main/semana-07-obstaculos-no-mapeados/detector_obstaculos.py) al paquete. Por último, hacé `colcon build --symlink-install`, otra vez, porque vas a editar los TODOs muchas veces.

### Qué hay que completar

Toda la plomería está resuelta: parámetros, suscripciones (`/scan` en `qos_profile_sensor_data`, `/likelihood_map` en Transient Local), el lookup de la transformada a `map`, y la publicación del `LaserScan` filtrado, el `PoseArray` y el `MarkerArray`. Quedan **2 funciones con `TODO`**:

1. **`agrupar_en_rachas()`** — encontrar las rachas contiguas de puntos "no mapeados" en el array del scan. Ejercicio de arrays con numpy, sin librerías nuevas; el docstring guía paso a paso.
2. **`recibir_scan()`** — el corazón del workshop: transformar el scan a `map`, indexar contra `/likelihood_map`, y decidir qué puntos son "no mapeados" (incluyendo el descarte del borde de arriba). Reusá acá lo que ya escribiste en semana 04 (polar → cartesiano) y lo que ya viste en semana 06 (`pesar_particulas`, para el índice de fila/columna).

Completalas en ese orden: `agrupar_en_rachas()` se puede probar aislada, sin ROS, antes de meterte con `recibir_scan()`.

| Parámetro | Default | Qué es |
| --- | --- | --- |
| `map_frame` | `map` | Frame contra el que se reportan las coordenadas. |
| `umbral_probabilidad` | 25.0 | Probabilidad (0-100) por debajo de la cual un punto se considera "no mapeado". Sin calibrar a fondo — ver Desafío extra. |
| `racha_minima` | 3 | Cuántos puntos contiguos hacen falta para que una racha cuente como objeto. |
| `distancia_minima_valida` | 0.25 | Rango mínimo (m) válido — descarta el rebote del lidar contra la propia estructura del robot. |

## Ejecución

Sumá `detector_obstaculos` a tu propio launch de semana 06 (un `Node` más en la `LaunchDescription`, mismo patrón que ya usaste para agregar `localizador` y `campo_verosimilitud`). Dos cosas puntuales que cambian esta semana:

- Usá un mundo `_victimas` en vez del mundo "limpio" que veniás usando — son el mismo laberinto, pero con un par de cubos de color puestos en el mundo que **no** están en el mapa que le pasás a `map_server` (que sigue siendo el mismo `.yaml` de siempre, sin cambios). Esos cubos son justo los objetos "no mapeados" que este workshop tiene que encontrar; si corrés el mundo sin víctimas no vas a tener nada que detectar (lo cual también sirve para confirmar que no te tira falsos positivos contra las paredes reales).

  Para este workshop hace falta el par completo (mundo `_victimas` **y** su `.yaml`). Para ver qué pares existen:

  ```bash
  comm -12 \
    <(ls "$(ros2 pkg prefix yahboom_rosmaster_gazebo)/share/yahboom_rosmaster_gazebo/worlds/" | grep victimas | sed 's/_victimas\.world$/.yaml/' | sort) \
    <(ls "$(ros2 pkg prefix yahboom_rosmaster_gazebo)/share/yahboom_rosmaster_gazebo/maps/" | sort)
  ```

  (`comm -12` compara dos listas ordenadas y se queda solo con lo que aparece en las dos — acá, los mundos `_victimas` a los que les sacás el sufijo y les ponés `.yaml`, contra los mapas que existen de verdad.) De ejemplo vamos a usar `laberinto_simple.yaml`.
- Agregale a tu config de RViz los displays nuevos: `LaserScan` (`scan_no_mapeado`, en Best Effort — mismo QoS que el `LaserScan` de `/scan` que ya tenías), `PoseArray` (`objetos_no_mapeados`) y `MarkerArray` (`objetos_no_mapeados_markers`).

> [!WARNING]
> Si `detector_obstaculos` arranca antes de que `map_server` esté activo o antes de que `localizador` haya publicado la primera `map → odom`, vas a ver el aviso `Todavía no hay tf laser_link->map` — es esperable, no un error: en cuanto exista esa tf, el nodo arranca a detectar solo, sin que haga falta reiniciarlo.

## Comprobación

Manejá el robot cerca de una víctima y mirá en RViz:

- Aparece un marcador (esfera roja) quieto sobre la víctima, en su posición real dentro del mapa — sin importar desde dónde la mire el robot. Dale una vuelta alrededor y confirmá que el marcador no se mueve.
- `scan_no_mapeado` solo tiene puntos cerca de la víctima — si ves puntos pegados a las paredes reales, revisá el descarte del borde del Concepto mínimo (o bajá `umbral_probabilidad`).
- Alejate y volvé a acercarte: el marcador se mantiene en la misma coordenada, aunque la distancia y el ángulo relativos al robot hayan cambiado por completo — esa es la comprobación central, estás reportando una posición del mundo, no una medición relativa.

## Explicación

Con esto, cualquier nodo puede preguntar "¿hay algo que el mapa no tenga registrado, y dónde?" sin saber cómo se calculó esa respuesta — mismo patrón de desacople que `map → odom` en semana 06. Es, a mano, una versión simplificada de lo que hace la capa de obstáculos del *local costmap* de [Nav2](https://docs.nav2.org/): un costmap combina el mapa estático con una ventana rodante de datos vivos del sensor, marcando como ocupado lo que el sensor ve pero el mapa no. Cuando llegue el workshop de Nav2, esa capa reemplaza a este nodo — pero el concepto de fondo es el mismo.

> [!QUESTION]
> Si subís mucho `umbral_probabilidad`, ¿qué tipo de error crece: falsos positivos o falsos negativos? ¿Y si lo bajás mucho?

## Desafío extra

- **Calibrar `umbral_probabilidad` y `racha_minima` en serio**: los defaults funcionan en `laberinto_simple_victimas`, pero no están calibrados contra otros mapas ni movimiento sostenido. Manejá un rato largo, contá a mano falsos positivos y negativos, y ajustá los dos parámetros — mismo criterio que `sigma_sensor` en semana 06.
- **Reportar la posición de una víctima roja**: combiná este nodo con `/scan_rojo` de semana 04 — comparando `/scan_rojo` (ya filtrado a "rayos que además pegan en algo rojo") contra `/likelihood_map` en vez del `/scan` crudo. El resultado son las coordenadas de los objetos que son, a la vez, no mapeados y rojos: la víctima. No hace falta escribir nada nuevo, es cambiar qué tópico suscribís.
- **Clustering espacial en vez de por racha**: agrupar por distancia real entre puntos en `map` (por ejemplo con [`scipy.cluster.hierarchy.fclusterdata`](https://docs.scipy.org/doc/scipy/reference/generated/scipy.cluster.hierarchy.fclusterdata.html)) en vez de por racha contigua del scan, para no pegar dos objetos separados vistos desde lejos en un mismo ángulo.
