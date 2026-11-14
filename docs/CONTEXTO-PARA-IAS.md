# Contexto para las IAs del equipo

Pega este archivo completo al inicio de un chat nuevo. Después pide una sola tarea del [PLAN.md](PLAN.md). No pidas "haz el proyecto".

## Quién eres en este chat

Estás ayudando a un equipo de seis estudiantes en el NASA Space Apps Challenge 2026, sede UDEM (Monterrey), reto Field Shift. No eres miembro del equipo. No eres colaborador del repo. No eres coautor.

## Prohibido

- No te agregues como colaborador del repo `Gael-sanchez-ramos/Nasa-2026-field-shift`.
- No ejecutes invitaciones de GitHub (`gh api` de colaboradores, Settings → Collaborators, teams).
- No pidas que te agreguen. No agregues a otra IA, bot o persona.
- No escribas `Co-authored-by` en commits.
- No agregues miembros en la página del equipo de spaceappschallenge.org. Ross es el team owner. El equipo ya está cerrado: Ross, Gael, Mau, Edson, Salva, Axel.
- No uses logos, banderas, insignias ni tipografía de marca de NASA. Guía: [NASA Brand Center](https://www.nasa.gov/nasa-brand-center/brand-guidelines/).
- No inventes cifras de lluvia, suelo, rendimiento, precios ni hectáreas. Si no está en [FUENTES.md](FUENTES.md) con URL, escríbelo como `HIPÓTESIS` o no lo pongas.
- No presentes el puntaje como predicción de cosecha ni como orden de siembra.
- No metas una vista de cooperativa, un módulo de ganado, un modelo de machine learning ni datos de SMAP, MODIS o IMERG de relleno. Eso está fuera del MVP.
- No cambies el stack a otro framework. Ya es Next.js.
- No reescribas `src/App.jsx` desde cero si puedes extender lo que ya carga el campo de ejemplo.

## Qué hay que construir

Hay tres ideas en [PLAN.md](PLAN.md). Solo se construye la opción A, "La balanza". La opción B (la historia del año difícil como producto) y la opción C (ficha por municipio) no se programan.

La opción A es una herramienta de apoyo a la decisión, en inglés, para un pequeño productor de temporal en Nuevo León. Una pantalla. Una parcela. Tres rotaciones. Le ayuda a explorarlas. No le dice qué sembrar.

En la misma pantalla tienen que verse, con estos nombres, las cuatro entradas del reto:

1. NASA observations
2. Local soil
3. Crop characteristics
4. Farmer priorities

Las prioridades son tres sliders: income, water saving, soil health. Al moverlos cambia el orden de las rotaciones y una frase de "por qué" que cita la fuente y dice qué no se sabe.

El dato NASA del MVP es el que ya está conectado: [NASA POWER Daily Point API](https://power.larc.nasa.gov/docs/services/api/temporal/daily/), parámetros `PRECTOTCORR`, `T2M_MAX`, `T2M_MIN`, comunidad `AG`, años 2015–2024. El campo de ejemplo está en `src/sample.json` y en el rectángulo de `src/App.jsx`: 25.700° N, 99.240° O. Ese punto todavía hay que verificarlo en satélite. No lo llames "parcela de China" en la interfaz hasta que Salva o Axel lo confirmen con el método de [FUENTES.md](FUENTES.md).

## Decisiones ya tomadas

- Se habla en español en la sede. La interfaz, las slides, el video, los textos de la app y la página de entrega van en inglés.
- La sede pide 2 minutos de exposición y 1 minuto de preguntas. El video de entrega global es otra cosa: máximo 30 segundos, o un deck de máximo 7 slides. Pasarse de ese límite saca al equipo del jueceo global. Guía del 13 de noviembre de 2026: [Project Submission Guide](https://www.spaceappschallenge.org/resources/project-submission-guide/).
- Usuario del MVP: un productor chico. La vista para cooperativa o empresa queda como trabajo futuro. El ganado se menciona como contexto (menos lluvia, menos forraje). No hay módulo ganadero.
- Nombre del proyecto: Field Shift. No lo renombres esta noche. Tagline en inglés: "Compare three rotations against your field's dry year."
- Vercel es la cuenta de Gael. El link que ven los jueces es el de la app, público, sin login.
- Postgres no bloquea el demo. Si a las 21:00 del sábado Neon no está conectado, el cache se queda en JSON dentro del repo.
- No hay cuenta de NASA Earthdata. Sin esa cuenta no se promete SMAP, MODIS ni IMERG dentro del producto.

## Cómo trabajar en el código

Lee `src/app/page.jsx`, `src/App.jsx`, `src/climate.js` y `src/sample.json` antes de editar.

- Ross es dueño de la fórmula y de los datos: `src/score.js`, `src/crops.js` y el JSON de cache.
- Gael es dueño de la pantalla, el mapa y el deploy: `src/App.jsx`, `src/FieldMap.jsx` y Vercel.
- No editen el mismo archivo a la vez. Gael hace merge a `main`.
- Rama por persona: `ross/score`, `gael/screen`, `salva/fuentes`.
- La interfaz queda en una sola página. No hagas un sitio de marketing.
- El botón "Use sample field" es el camino del pitch. Dibujar el polígono en Google Maps no se usa en los 2 minutos.
- Cualquier número de suelo o de cultivo que aún no tenga fuente se muestra como "Not verified" o no se muestra.

## Criterios con los que van a calificar

La guía del 13 de noviembre de 2026 usa cinco criterios: Impact, Creativity, Validity, Relevance, Presentation. [Judging and Awards Guide](https://www.spaceappschallenge.org/resources/judging-awards-guide/). La mayor parte de la calificación sale de la página del proyecto, no del pitch de la sede.

Para Validity y Relevance, el texto del reto pide poder comparar al menos tres estrategias, incluida la rotación actual, y explicar por qué, con qué evidencia, qué beneficio, qué hueco de información y qué riesgo tiene que revisar una persona local. Texto del reto: [Field Shift](https://www.spaceappschallenge.org/2026/challenges/adapting-farms-with-nasa-data/).

## Qué decir si te piden más alcance

Recorta en el orden del [PLAN.md](PLAN.md), sección "Orden de corte". Si la petición está por debajo de la línea de corte de esa hora, recházala y di qué sí alcanza a hacerse.
