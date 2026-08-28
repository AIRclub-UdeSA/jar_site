<!--
Copiá este archivo a src/content/docs/workshops/semana-NN-slug.md (NN con dos dígitos).
El título y la metadata alimentan automáticamente el sidebar y el catálogo.
Cambiá status a listo cuando publiques. Los links internos siempre son relativos.
-->

---
title: "NN · Título"
description: "Una frase breve que explique la práctica."
status: proximamente
duration: "aprox. XX–YY min"
level: inicial
outcome: "El resultado concreto que queda funcionando."
prerequisites:
  - "Setup completo"
---

## La práctica

<section class="doc-practice-plate" aria-labelledby="la-práctica">
  <div class="doc-practice-intro">
    <p class="doc-practice-statement">Frase corta.<br />Orientada al resultado.</p>
    <p class="doc-practice-note">Una nota breve (hasta ~34 caracteres por línea) que conecte la práctica con el trabajo sobre el robot.</p>
  </div>

  <dl class="doc-practice-facts">
    <div>
      <dt>Dato</dt>
      <dd>Valor técnico real, ej. un topic o un tipo de mensaje</dd>
    </div>
    <div>
      <dt>Dato</dt>
      <dd>Otro dato técnico real</dd>
    </div>
  </dl>

  <!-- Sumá acá un <figure class="doc-practice-graph"> SOLO si hay un diagrama
       que explica el resultado antes de entrar en la teoría (como el grafo de
       la semana 01 o la máquina de estados de la semana 03). Si el diagrama
       explica un concepto puntual de la implementación, va en "Concepto
       mínimo" en su lugar, no acá. -->
</section>

## Antes de empezar

<ol class="doc-preflight" aria-label="Preparación del workshop">
  <li>
    <span class="doc-preflight-index" aria-hidden="true">01</span>
    <div class="doc-preflight-copy">
      <h3>Título corto</h3>
      <p>Qué debe estar instalado, completado o clonado. Usá links relativos, por ejemplo la <a href="../../setup/simulador/">guía del simulador</a>.</p>
    </div>
  </li>
  <li>
    <span class="doc-preflight-index" aria-hidden="true">02</span>
    <div class="doc-preflight-copy">
      <h3>Título corto</h3>
      <p>Qué debe estar levantado o abierto antes de empezar.</p>
    </div>
  </li>
  <li>
    <span class="doc-preflight-index" aria-hidden="true">03</span>
    <div class="doc-preflight-copy">
      <h3>Chequeo</h3>
      <p>Una comprobación rápida antes de continuar.</p>
    </div>
  </li>
</ol>

## Concepto mínimo

Solo la teoría necesaria para entender la implementación. Este es el lugar previsto para una figura con texto alternativo y caption.

## Implementación

El código y las decisiones necesarias para completar la práctica.

> [!NOTE]
> Un dato complementario que ayude a entender el paso.

## Ejecución

Comandos y orden de terminales para correrlo contra el simulador. Un bloque de código por terminal (comentá `# Terminal N — qué hace`); si dos comandos corren en la misma terminal y forman parte de la misma secuencia, van en el mismo bloque. Siempre `source ~/rosmaster_ws/install/setup.bash` con ruta absoluta, nunca relativa — cada bloque tiene que poder pegarse en una terminal nueva sin depender de un `cd` previo.

## Comprobación

Qué mirar en el simulador, RViz y la terminal para saber que funciona.

> [!WARNING]
> Un riesgo o error frecuente que conviene evitar.

## Explicación

Qué ocurrió y cómo se conecta con el resto del sistema.

> [!QUESTION]
> Una pregunta concreta para interpretar el resultado.

## Desafío extra

Una variación opcional que profundice el mismo concepto.
