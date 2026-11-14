# Plan de trabajo — sábado 14 y domingo 15 de noviembre de 2026

Hora de este plan: 12:33 CST del sábado. Meta: la app pública, el video y la entrega listos el domingo a las 11:00. El pitch de la sede es a las 12:00. La plataforma global cierra a las 23:59, hora de la sede. No se usa ese margen.

No te agregues como colaborador del repo ni del equipo de Space Apps. El equipo está cerrado. El detalle está en [README.md](README.md).

## Decisiones cerradas

- Stack: Next.js, el que ya está en `main`. React 19. Vercel de Gael.
- Idioma de la app, slides, video y formulario: inglés. En la sede se habla español.
- Pitch de la sede: 2 minutos hablando, 1 minuto de preguntas. Presentan Axel y Gael.
- Usuario: un productor chico de temporal en Nuevo León. Una pantalla, una parcela.
- La vista de cooperativa o empresa es trabajo futuro. Se dice en una frase del pitch y no se diseña.
- El ganado entra en la historia (falta agua, falta forraje). No hay pantalla de hato.
- Diferenciadores que no se cortan: los sliders de prioridades y la frase de por qué, con fuente.
- Dato NASA del producto: POWER, ya conectado. El resto de satélites no se prometen.
- Base de datos: opcional. A las 21:00 del sábado, si Neon no responde, se borra de la lista y el cache sigue en JSON.

## Lo que ya existe y no se vuelve a hacer

- `src/app/page.jsx` monta `src/App.jsx`.
- "Use sample field" carga `src/sample.json` sin red.
- "Analyze field" llama a POWER en vivo, con timeout de 25 segundos.
- El reporte deja cambiar "Typical year" y "Dry year" y muestra lluvia anual, máxima y mínima.
- Hay dos tarjetas de cultivo, todavía sin puntaje: "Plant sorghum again" y "Plant dry beans".
- El mapa de Google está detrás de `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`. Si no hay llave, el botón de dibujar sale deshabilitado. El campo de ejemplo no depende de esa llave.
- El README ya explica el deploy en Vercel.

Eso es el mockup. El trabajo de hoy es volverlo una comparación de tres rotaciones que se mueva con los sliders.

## La característica que sí nos separa

Muchos equipos van a dibujar un polígono, jalar POWER y poner una recomendación. Eso ya lo parece nuestro mockup. No alcanza.

La pantalla que tiene que quedar en la memoria del juez es esta: tres rotaciones, incluida la actual, un año seco de NASA POWER al lado, y tres sliders. Al subir "water saving", el orden cambia y la frase de por qué cita el año, los milímetros y la liga de POWER. Abajo, un recuadro de lo que el equipo no sabe.

"Reproducir tu historia" como simulación de cuánta cosecha habrías salvado no se hace. No tenemos rendimiento por parcela ni un modelo que se pueda defender. En este cache, además, 2023 y 2018 se parecen en lluvia anual (619 mm y 691 mm) y se separan en la temperatura (47.14 °C y 42.83 °C). Una frase de "habrías perdido menos agua" sería un invento. La versión honesta es un gráfico de los años y una comparación de opciones, no un resultado de cosecha.

Los sliders y el porqué se quedan aunque se acabe el tiempo. El gráfico de los diez años entra en el MVP 2 porque los datos ya están en el flujo de POWER. Si Ross no alcanza a pintar las diez barras, se quedan los dos años que ya muestra la app y la frase igual cita `src/sample.json`.

## Otras ideas, y cuáles entran

Valor para el productor, esfuerzo, riesgo, y en qué MVP vive. "Bajo" cabe en una tarde de este equipo. "Alto" no cabe.

| Idea | Valor para el productor | Esfuerzo | Riesgo | Dónde queda |
| --- | --- | --- | --- | --- |
| Sliders de income, water saving y soil health que reordenan las tres rotaciones | Ve el trade-off de lo que a él le importa | Bajo | Bajo | MVP 2. Protegido |
| Frase de por qué con año, mm, liga de POWER y una incertidumbre | Puede explicar la pantalla sin ser agrónomo | Bajo | Bajo | MVP 2. Protegido |
| Tres rotaciones siempre visibles, una de ellas es "seguir con el sorgo" | Compara contra lo que ya hace, que es lo que pide el reto | Bajo | Bajo | MVP 1 |
| Tres etiquetas a la vez: mejor para agua, mejor para suelo, mejor para ingreso. No hay un solo ganador | No se siente una orden | Bajo | Bajo | MVP 2 |
| Botones Water first, Soil first, Income first | En 2 minutos el juez ve el cambio sin cazar el slider | Bajo | Bajo | MVP 3. Si el domingo va justo, se cortan y quedan los sliders |
| Panel "What this does not know" | Le dice dónde hace falta un técnico local | Bajo | Bajo | MVP 2. Sube Validity |
| Etiqueta "forage for the herd" en el sorgo forrajero | Conecta la parcela con el ganado sin simular un hato | Bajo | Bajo, si la tarjeta está marcada como escenario hasta que SIAP la confirme | MVP 2 |
| Leyenda de que POWER es la celda regional, no el pluviómetro del predio | Evita que el juez crea que medimos su parcela | Bajo | Bajo. La frase de resolución se copia de la metodología de POWER | MVP 1 |
| Campo de ejemplo cacheado, el pitch no llama a NASA en vivo | El demo sobrevive a la red de la sede | Bajo | Bajo | MVP 3. El botón ya existe |
| Serie de 10 años, no solo dos tarjetas | Se ve si el "año seco" de verdad se separa | Medio | Bajo | MVP 2 si Ross termina el JSON de años. Si no, MVP futuro verbal |
| Meses con suelo desnudo, a partir de fechas de siembra citadas | El reto lo sugiere y se entiende en un calendario | Medio | Alto si las fechas están mal | Solo si Axel deja una tabla citada antes de las 18:00. Si no, trabajo futuro |
| Categoría del Monitor de Sequía del municipio | Contexto local que no es NASA | Medio | Bajo si es una frase con fecha | Pitch, o una tarjeta estática el domingo temprano |
| SoilGrids del pin verificado | La entrada "local soil" deja de estar vacía | Medio | Medio. En P1 la API devolvió null | MVP 3 solo con números reales. Si no, la tarjeta dice "Not verified" |
| Dibujar cualquier polígono | Un productor podría traer su predio | Ya está | Alto en vivo: llave, red y POWER | Se queda en la app. No se usa en el pitch |
| Vista de varias parcelas para una cooperativa | Otro usuario | Alto | Alto | Trabajo futuro. Una frase en el pitch |
| NDVI, SMAP o IMERG en el puntaje | Más observación de la Tierra | Alto | Alto sin Earthdata | Trabajo futuro. No se mencionan como si ya estuvieran |
| Rendimiento y precio en pesos desde SIAP | El slider de income tendría dinero real | Medio | Alto si se presenta como pronóstico | Una cita en el texto de entrega, si Axel la copió. No entra a la fórmula |
| PDF o tarjeta de WhatsApp | Se la podría llevar al predio | Medio | Bajo | Trabajo futuro |

## MVPs

### MVP técnico 1 — sábado 17:00

Un flujo en inglés, de la pantalla vacía al reporte, con el campo de ejemplo. Todavía puede vivir solo en las laptops.

Criterios de aceptación:

- [ ] "Use sample field" muestra coordenadas 25.700° N, 99.240° O, lluvia, temperatura y la liga a POWER.
- [ ] Se ven cuatro bloques con los títulos NASA observations, Local soil, Crop characteristics, Farmer priorities.
- [ ] Hay tres tarjetas. Una dice que continúa el cultivo actual.
- [ ] Local soil dice "Not verified" y no inventa pH ni arcilla.
- [ ] Hay una frase visible de que esto no es una orden de siembra y de que el número es regional.
- [ ] Los sliders se ven, aunque el orden todavía no cambie.
- [ ] Ross y Gael recorren el flujo sin explicar el código.

### MVP técnico 2 — sábado 22:30, ya desde casa si hace falta

Los sliders hacen algo. La frase cita datos reales del cache.

Criterios de aceptación:

- [ ] Mover water saving, soil health o income cambia el orden o las etiquetas de las tres rotaciones.
- [ ] Con los tres sliders en el mismo valor, el orden es estable y explicable.
- [ ] La frase de por qué nombra la rotación, el año que el código está usando, los mm de `src/sample.json` y la URL de POWER.
- [ ] La frase dice que el puntaje no es una cosecha estimada.
- [ ] Se ven a la vez "best for water", "best for soil" y "best for income", aunque las tres no sean la misma tarjeta.
- [ ] El panel de huecos menciona al menos: sin modelo de rendimiento, suelo no verificado en este pin, POWER no es una estación en el predio.
- [ ] Mau puede grabar esa pantalla y se entiende sin que nadie hable.

### MVP técnico 3 — domingo 9:30, funciones congeladas

La misma pantalla, en un link público. Después de las 9:30 no se agregan pantallas ni datos.

Criterios de aceptación:

- [ ] La URL de Vercel abre en una ventana de incógnito, sin login y sin la llave de Google, usando "Use sample field".
- [ ] El pitch de las 12:00 no necesita que POWER responda en ese momento.
- [ ] Los textos de la app están en inglés.
- [ ] Si P1 ya tiene municipio confirmado, el nombre del municipio aparece. Si no, no aparece.
- [ ] Si SoilGrids sigue en null, la tarjeta sigue en "Not verified".
- [ ] `npm run build` pasa en la máquina de Gael antes del deploy.

### MVP del pitch — domingo 11:00

- [ ] Guion de [GUION.md](GUION.md) ensayado dos veces con cronómetro, Axel y Gael, en menos de 2:00.
- [ ] Plan B de la sede: tres capturas de la app (sliders bajos en agua, sliders altos en agua, panel de huecos) en el teléfono de Mau y de Axel.
- [ ] Video de máximo 30 segundos en YouTube, público o no listado, enlace que abre sin cuenta. Subtítulos en inglés quemados en el video si alguien habla. Mejor todavía: texto en inglés en pantalla y sin voz.
- [ ] Si a las 10:30 el video no reproduce en el teléfono de Ross, el enlace de demo de la entrega pasa al deck de 7 slides. No se entregan los dos.
- [ ] Formulario de Space Apps guardado. Ross aprieta "Submit for Judging" en cuanto el enlace de la app y el enlace del demo abren en incógnito. Hora objetivo: 11:15. Límite interno: 11:40.

## Horario

Comer y pausar está dentro del horario. A las 00:00 se deja de escribir funcionalidad. El domingo a las 08:00 ya están en la UDEM.

### Sábado 14

- [ ] 13:00–13:20. Los seis leen `docs/README.md` y `docs/CONTEXTO-PARA-IAS.md`. Quien abra una IA, pega ese contexto primero.
- [ ] 13:20–13:40. Ross lee en voz alta las decisiones cerradas y el orden de corte. Gael confirma que puede hacer deploy en su Vercel.
- [ ] 13:40–15:30. Bloque 1, en paralelo. Ross arma la fórmula y el tercer cultivo con valores marcados como estimación. Gael deja las cuatro secciones y la tercera tarjeta en `src/App.jsx` sin esperar el Figma final. Mau hace un solo frame en Figma de esa pantalla, en inglés. Edson arma la retícula de las 7 slides, todavía con huecos. Salva y Axel verifican P1 con el método de `docs/FUENTES.md`.
- [ ] 15:30–15:45. Pausa. Parados, sin pantalla.
- [ ] 15:45–17:00. Gael aplica del frame solo jerarquía y texto, no un rediseño. Salva le pasa a Ross por escrito qué cultivo se cayó. A las 17:00 los dos de código hacen el recorrido del MVP 1 frente al equipo.
- [ ] 17:00–17:20. El resto mira la pantalla y anota frases que no se entienden. No se proponen pantallas nuevas en esa revisión.
- [ ] 17:20–19:00. Ross conecta los sliders a la fórmula. Gael muestra la frase y el panel de huecos. Axel escribe las oraciones en inglés en `docs/GUION.md`, sección de textos de la app, o se las dicta a Gael.
- [ ] 19:00–19:30. Comer.
- [ ] 19:30–20:30. Cerrar MVP 2. Gael hace el primer deploy, aunque se vea feo. El primer deploy no puede ser el del domingo.
- [ ] 20:00–22:00. Ventana para irse a casa. Quien siga en la sede, sigue. A las 22:00 ya no se depende de estar en la misma mesa.
- [ ] 21:00. Corte de Neon. Si la base no está conectada y el campo de ejemplo no sale de ella, no se toca más.
- [ ] 22:30. MVP 2 aceptado o recortado con la lista de abajo. Mau graba un primer video solo si la pantalla ya se entiende. Si no, se duerme y graba el domingo a las 08:15.
- [ ] 00:00. Se cierra el código de funciones. Después de esa hora solo se arregla un bug que impida cargar el campo de ejemplo.

### Domingo 15, en la UDEM desde las 08:00

- [ ] 08:00–08:15. Ross dice qué quedó roto en la noche. Nadie abre un archivo todavía.
- [ ] 08:15–09:30. Gael deja el link público estable. Ross solo entra a código si el campo de ejemplo no carga. Mau graba y sube a YouTube. Edson llena las 7 slides por si el video falla. Axel y Salva pegan el borrador de la entrega en un doc de Google, en inglés.
- [ ] 09:30. Congelar funciones. La app no gana pantallas nuevas.
- [ ] 09:30–10:15. Probar el link en el teléfono de Ross, en datos, no en el wifi de la sede. Probar el video igual.
- [ ] 10:15. Congelar el guion. Ya no se cambian frases.
- [ ] 10:30. Ensayo 1, cronómetro a la vista, hasta las preguntas.
- [ ] 10:45. Se cambia una sola frase, la que se haya trabado.
- [ ] 11:00. Ensayo 2 completo.
- [ ] 11:15. Ross envía en Space Apps si los dos enlaces abren en incógnito.
- [ ] 11:40. Último minuto para enviar si el primer intento falló. Después se deja de editar la página del proyecto.
- [ ] 11:40–12:00. Estar en el lugar del pitch. Mau tiene las capturas abiertas.

## Tareas por persona

Las dependencias están en la última columna de cada bloque. Si el insumo no llega a la hora, se usa el plan de esa fila y no se espera.

### Ross — fórmula, datos, envío

- [ ] 13:40. Crear `src/score.js` con pesos que suman 1. Si los tres sliders están en 0, pesos iguales.
- [ ] 13:40. Crear `src/crops.js` con tres rotaciones. Cada una tiene enteros del 1 al 5 para water, soil e income, más `forage: true` o `false`, más `isCurrent: true` en una sola.
- [ ] Esos enteros se llaman team estimates en un comentario con la fecha. No se presentan como datos de NASA.
- [ ] 16:30. Sustituir un entero solo si Axel dejó la cita en `docs/FUENTES.md`. Si no hay cita, el entero se queda y la UI dice "team estimate, not a yield model".
- [ ] 17:20. La función devuelve el orden, las tres etiquetas de "best for", y los datos que la frase necesita: nombre, año, mm, URL.
- [ ] Revisar si "Dry year" debe ser el año más seco (`years[0]` en `src/climate.js`) y no el segundo. Si se cambia el código, se actualizan `src/sample.json` y la frase. Si no se cambia, la frase dice "second-driest".
- [ ] 21:00. Decidir Neon en voz alta y anotarlo aquí, en el chat del equipo: conectado, o cortado.
- [ ] Domingo 08:15. No abrir features. Arreglar solo "el sample no carga".
- [ ] Domingo 11:15. Ser quien aprieta Submit. Antes, abrir la app y el demo en incógnito.

Depende de Axel para las citas de cultivos. No depende de él para tener un MVP: la estimación etiquetada ya deja avanzar.

### Gael — pantalla, merge, Vercel

- [ ] 13:40. En `src/App.jsx`, cuatro secciones con los títulos en inglés, tercera tarjeta, sliders visibles, texto "Not verified" en suelo.
- [ ] No reescribir el mapa ni el fetch de POWER.
- [ ] 15:45. Tomar del Figma de Mau el orden visual, el tamaño de tipo y los colores. Ignorar componentes que no existan en el MVP 1.
- [ ] 17:20. Conectar la salida de `src/score.js` a las tarjetas y a la frase.
- [ ] 19:30. Primer deploy en su Vercel. Framework Next.js. La app tiene que abrir el campo de ejemplo sin la variable de Google.
- [ ] Merge a `main` solo él. Antes del merge, `npm run build` en local.
- [ ] Domingo 08:15. Confirmar el link público. Probar incógnito.
- [ ] Domingo 09:30. Declarar el freeze en el chat.

Depende del frame de Mau a las 15:30, no antes. Depende de `src/score.js` a las 17:20. Si Ross se retrasa, Gael deja la frase con los números fijos de `src/sample.json` (2023, 619 mm, 47.14 °C) y un TODO visible en el código, no en la UI.

### Mau — una pantalla y el video

- [ ] 15:30. Un frame de Figma, escritorio, en inglés, con las cuatro secciones, tres tarjetas y tres sliders. No un design system, no versión móvil, no logo de NASA.
- [ ] 17:20. Mirar el MVP 1 y anotar solo problemas de lectura: contraste, texto cortado, botones que parecen la acción principal.
- [ ] 22:30 o domingo 08:15. Grabar el video siguiendo el shot list de [GUION.md](GUION.md).
- [ ] Subirlo a YouTube público o no listado. El enlace tiene que abrir sin iniciar sesión.
- [ ] Quemar el texto en inglés en el video. No depender de los subtítulos automáticos.
- [ ] Si el video pasa de 30 segundos, cortarlo. No acelerar la voz para "que quepa".
- [ ] Dejar tres capturas en el teléfono antes de las 10:30 del domingo.
- [ ] Tener el video y las capturas también en el teléfono de Axel.

Depende de una pantalla que ya se mueva. No graba el mockup de las dos tarjetas si a las 22:30 los sliders siguen muertos. En ese caso graba el domingo.

### Edson — slides de respaldo y apoyo visual

- [ ] 15:30. Deck de máximo 7 slides, contando la de título. Títulos grandes, poco texto, en inglés. Plantilla sin marca de NASA.
- [ ] Las 7, en este orden: título y equipo, el problema en Nuevo León, la parcela y las cuatro entradas, las tres rotaciones, los sliders con dos estados, qué dato de NASA entra, qué no sabemos y qué seguiría.
- [ ] No poner una hectárea, un ranking ni un pH hasta que esté escrito en `docs/FUENTES.md` con URL.
- [ ] Domingo 10:30. Si el video de Mau ya reproduce, este deck no se sube como demo. Se guarda por si YouTube falla.
- [ ] Si el video no reproduce, Edson pega el deck en Drive público y le pasa el enlace a Ross. Máximo 7 slides. Contarlas otra vez antes de pegar el enlace.

Depende de los textos de Axel para no llenar las slides con adjetivos. Puede usar los títulos de arriba desde las 13:40.

### Salva — problema y verificación de campo

- [ ] 15:30. Terminar el método de P1: captura de satélite, municipio sí o no, y si el pin cae en un predio.
- [ ] Si el pin cae en el pueblo o en suelo sin dato, proponer otro pin dentro del mismo paisaje y decirlo en el chat antes de las 16:00. Ross vuelve a bajar POWER. Nadie más mueve las coordenadas.
- [ ] Escribir cinco líneas, en español, de cómo se cuenta el problema sin nombrar a su familia: menos lluvia, el agua manda, el forraje también alcanza para el ganado.
- [ ] 18:00. Leer la Tabla 6 del PDF de INIFAP y anotar una frase de lo que sí dice. Si no habla de sorgo y frijol, la tercera tarjeta no cita ese PDF.
- [ ] Domingo 08:30. Revisar el inglés de Axel en voz alta. Si una frase suena a orden ("you should plant"), se reescribe a "you can compare".

Salva no bloquea el código. Si a las 16:00 no hay municipio, la app dice "sample field" y no dice "China".

### Axel — ciencia, inglés y pitch

- [ ] 15:30. En el cierre agrícola, anotar municipio, año, y los cultivos con más superficie. Pegar la liga y la fecha de consulta al final de `docs/FUENTES.md`.
- [ ] 16:30. Decirle a Ross qué tarjeta se queda. Si el sorgo forrajero no aparece en el municipio, la tarjeta se llama escenario, no práctica local.
- [ ] 18:00. Tres frases en inglés, una por rotación, con la estructura del [GUION.md](GUION.md).
- [ ] 19:30. Borrador hablado de su minuto. Cronómetro. Tiene que caber en 60 segundos sin la parte de Gael.
- [ ] Domingo 08:30–09:30. Pasar el borrador de la entrega a inglés con Salva. Cada número lleva su URL o se borra.
- [ ] Domingo 10:30 y 11:00. Ensayar con Gael.

Axel presenta el problema y la parcela. Gael presenta la pantalla. No se intercambian a las 11:00.

## Dependencias entre duplas

| Hora | Quién espera | Qué necesita | Si no llega |
| --- | --- | --- | --- |
| 15:30 | Gael | Frame de Mau | Sigue con la maquetación que ya tiene la app |
| 16:00 | Ross | Pin definitivo de Salva | Se queda el 25.70, −99.24 y la UI no nombra municipio |
| 16:30 | Ross | Cultivos citados por Axel | Fórmula con estimaciones etiquetadas |
| 17:20 | Gael | `src/score.js` | Frase fija con 2023 y 619 mm, marcada en código como temporal |
| 18:00 | Edson | Frases de Axel | Slides solo con títulos |
| 19:30 | Mau | Pantalla con sliders vivos | Graba el domingo 08:15 |
| 09:30 dom | Ross, el envío | URL de Vercel y URL de YouTube o del deck | Se usa el que sí abra. No se inventa un tercer formato |
| 10:15 dom | Axel y Gael | App congelada | Ensayan con las capturas |

## Repo, para que dos personas no se pisen

Repositorio: `https://github.com/Gael-sanchez-ramos/Nasa-2026-field-shift`. Hoy es privado. Puede seguir privado. Los jueces necesitan la app pública, no el GitHub. Hacerlo público el domingo es decisión de Gael y no requiere invitar a nadie.

No te agregues como colaborador. No invites a Mau, Edson, Salva, Axel ni a una IA. Si alguien no puede hacer push, manda el archivo por el chat y Gael lo sube.

Ramas:

- `main`. Solo entra por merge de Gael, después de `npm run build`.
- `ross/score`. Solo `src/score.js`, `src/crops.js`, `src/climate.js`, `src/sample.json`.
- `gael/screen`. `src/App.jsx`, `src/App.css`, `src/FieldMap.jsx`, `src/app/*`.
- `salva/fuentes`. Solo archivos dentro de `docs/`.

Commits en inglés, en presente, una idea por commit. Ejemplos: `Add weighted rotation scores`, `Show the four challenge inputs`.

El mensaje no lleva `Co-authored-by`. No se firma una IA. Quien sube el commit es la persona que lo va a poder explicar el domingo.

Archivos que no se tocan a dos manos:

- `src/App.jsx` lo edita Gael.
- `src/score.js` lo edita Ross.
- `package.json` no se le agregan librerías después de las 19:30. El gráfico de barras se hace con CSS o SVG. No hace falta una librería de mapas nueva ni un cliente de base de datos para el MVP.

Estructura que se busca esta noche:

```text
src/app/page.jsx          sigue montando la app
src/App.jsx               pantalla
src/climate.js            POWER, ya existe
src/score.js              pesos y orden
src/crops.js              tres rotaciones y estimaciones
src/sample.json           cache del pitch
docs/                     este plan
```

Si Gael insiste en Neon, el esquema mínimo es este. Se crea solo si el corte de las 21:00 no se activó.

- `parcels`: id, name, lat, lng, municipality (texto vacío si no está verificado), source_note.
- `climate_years`: parcel_id, year, rain_mm, tmax_c, tmin_c, source_url, fetched_at.
- `rotations`: id, name, water_score, soil_score, income_score, is_current, forage, evidence_note.

No hay tabla de usuarios. No hay login. Los puntajes se calculan en el request, no se guardan por visitante.

La página es una sola: `/`. No hay `/admin`, `/cooperative` ni `/about`. El flujo del usuario:

1. Entra y ve el campo de ejemplo ya elegido, o el botón "Use sample field" arriba del todo.
2. Lee las cuatro entradas sin hacer scroll largo en una laptop de la sede.
3. Ve los años de POWER y las tres rotaciones.
4. Mueve un slider o aprieta un preset.
5. Lee la frase y el panel de lo que no se sabe.
6. No hay botón de "sembrar esto".

## Orden de corte

Cuando alguien diga "vamos tarde", se corta desde arriba. No se discute otra vez.

1. Neon y cualquier Postgres.
2. La parcela P2 y todo Anáhuac.
3. Llamada en vivo a POWER durante el pitch. Queda el JSON.
4. Dibujar polígono y la llave de Google, si estorba el deploy.
5. SoilGrids. La tarjeta se queda en "Not verified".
6. Calendario de meses con suelo desnudo.
7. Presets Water first / Soil first / Income first.
8. Serie de diez barras. Se quedan los dos años que ya existen.
9. El deck de 7 slides, solo si el video ya está público y probado.

No se corta, en este orden de importancia: tres rotaciones, sliders que cambien el resultado, frase con fuente, POWER visible, inglés, la advertencia de que no es una orden, link público, demo de 30 segundos o 7 slides, botón de Submit.

## Riesgos

| Riesgo | Señal | Qué se hace |
| --- | --- | --- |
| Los dos programan `src/App.jsx` | Diff imposible a las 18:00 | Gael es el único que lo guarda. Ross le pasa la firma de la función |
| Vercel falla el primer domingo | No hay un deploy del sábado | Por eso el primer deploy es el sábado 19:30 |
| YouTube se queda procesando | A las 10:30 no reproduce en el teléfono | El demo de la entrega es el deck de Edson |
| El pin no es un predio | La captura de Salva muestra casas | La UI dice "sample field" y el pitch dice que el municipio está en verificación |
| Alguien pone pH o hectáreas sin URL | Aparece un número que no está en `docs/FUENTES.md` | Se quita. Un hueco se defiende mejor que una cifra inventada |
| El wifi de la sede se cae en el pitch | La app en vivo no carga | Axel y Gael hablan sobre las tres capturas del teléfono |
| Se agrega un colaborador o un miembro a medias | Alguien "se invita para poder subir" | No se hace. Gael sube el archivo. En Space Apps el equipo queda como está |
| El video dura 31 segundos o el deck tiene 8 slides | La guía del 13 nov 2026 saca ese proyecto del jueceo global | Se corta antes de pegar el enlace |
| La página de entrega queda en español | El formulario exige inglés | Axel lee el formulario en voz alta a las 10:00 |

## Entrega, campo por campo

Guías usadas, ambas del 13 de noviembre de 2026:

- [Project Submission Guide](https://www.spaceappschallenge.org/resources/project-submission-guide/)
- [Judging and Awards Guide](https://www.spaceappschallenge.org/resources/judging-awards-guide/)

Ross envía. Otra persona puede tener el texto listo en un doc. Una sola persona pega en el formulario, con el candado de edición encendido, para no pisarse.

- [ ] Project Name: `Field Shift`.
- [ ] High-Level Project Summary, en inglés, un párrafo: qué es, qué reto cubre, por qué importa en un predio de temporal de Nuevo León. Sin hectáreas no citadas.
- [ ] Link to Project Demo: YouTube de máximo 30 segundos, o el deck de máximo 7. Uno solo. Probado en incógnito.
- [ ] Link to Final Project: URL de Vercel. Probada en incógnito. Sin login.
- [ ] Detailed Project Description: qué hace la pantalla, cómo se calcula el orden, qué beneficio tiene, qué se espera de un técnico local, y que el stack es Next.js. Decir que el puntaje es una suma ponderada por los sliders, con estimaciones del equipo separadas de los números de POWER.
- [ ] Use of Super Intelligence: declarar en qué partes una IA escribió código, texto o imágenes. Decir que la idea de las tres rotaciones, los sliders y el caso de Nuevo León es del equipo. Este campo no lo ven los jueces. Aun así se llena completo.
- [ ] NASA Data: el borrador de [FUENTES.md](FUENTES.md), sección 8, actualizado si cambió el pin.
- [ ] Space Agency Partner Data and Other References: Google Maps si sigue en el build, SoilGrids si se usó, SIAP, SEDRA, INEGI, CONAGUA, INIFAP, Next.js, React, Vercel, y cualquier imagen. Lo que no se usó no se lista para verse más completo.
- [ ] Imágenes generadas con IA, si existen, con marca de agua visible. Si no hay, no se generan el domingo para "llenar".
- [ ] Nada de logos de NASA.
- [ ] Save Progress varias veces. Submit for Judging antes de las 11:40.

Cómo se cubren los cinco criterios en esa página, no solo en el pitch:

| Criterio 2026 | Dónde queda escrito |
| --- | --- |
| Impact | Un productor de temporal compara opciones de agua, suelo e ingreso antes de sembrar. El caso es local. El alcance es una parcela, y la página lo dice así. |
| Creativity | Los sliders cambian el orden y la herramienta se niega a dar un solo ganador. |
| Validity | POWER citado, estimaciones etiquetadas, panel de huecos, sin modelo de cosecha. |
| Relevance | Las cuatro entradas del reto están en la pantalla. Hay tres rotaciones y una es la actual. |
| Presentation | El demo de 30 segundos o las 7 slides, más una página que se puede leer sin ver el pitch. |

Los nombres de los premios globales se copian de la guía de 2026 cuando alguien redacte la página. No se reutilicen de memoria los nombres de 2025.

## Preguntas de los jueces

Respuestas cortas, en español, para el minuto de la sede. Si el juez pregunta en inglés, se contesta en inglés con la misma idea. No se alarga.

**¿Qué tan preciso es?**
Es el clima de la celda regional de NASA POWER, de 2015 a 2024, no un pluviómetro en el predio. En el cache, el año que el código marca como seco es 2023, con 619 mm, y tuvo una máxima diaria de 47.14 °C. No calculamos toneladas.

**¿Cómo lo validaron?**
Los números de lluvia y temperatura salen de POWER y están cacheados. Los cultivos se contrastan con SIAP y con la estadística de Nuevo León. Si un cultivo no aparece, la tarjeta se queda como escenario. El suelo de este pin no pasó SoilGrids: por eso dice "Not verified". La familia de Salva nos dio el problema del agua. No usamos su rancho como dato.

**¿Y si el productor no tiene internet?**
Esta versión necesita red para un pin nuevo. La parcela de la demo está guardada en la app para que la sede no dependa de POWER. Llevarlo al predio sin señal es trabajo futuro.

**¿Por qué no usaron un modelo de machine learning?**
Porque en un fin de semana no lo podíamos explicar ni defender. El orden es una suma de tres criterios, con pesos que pone la persona. Se ve de dónde sale.

**¿La IA hizo el proyecto?**
Una IA ayudó a escribir código y documentos. La idea, el caso de Nuevo León y la decisión de no dar una orden de siembra son del equipo. Está declarado en el formulario. El campo de Super Intelligence no se les muestra a los jueces. El reconocimiento dentro del proyecto sí.

**¿Dónde está SMAP o el NDVI?**
No están en el producto. POWER sí está, y con eso se cumple el uso de un recurso NASA. SMAP, MODIS e IMERG piden cuenta de Earthdata y un procesamiento que hoy nos haría inventar el hueco. Están en el trabajo futuro.

**¿Por qué no cítricos, si Nuevo León es cítricos?**
Porque el reto pide explorar rotaciones. Un huerto de naranja no se rota cada temporada. El MVP es sorgo, frijol y forraje. Los cítricos se quedan como contexto del estado cuando tengamos la cifra abierta en el PDF oficial.

**¿Y el ganado?**
Salva nos dijo que la falta de agua también pega al hato. Por eso una de las opciones es forraje. No modelamos animales ni carga animal.

**¿Le dice al productor qué sembrar?**
No. Muestra tres opciones, el año difícil y el criterio que la persona movió. La decisión y el técnico local se quedan afuera, a propósito.

**¿Una empresa o una cooperativa lo puede usar?**
En esta versión, no. Es una parcela y una persona. Varias parcelas serían otra pantalla, y preferimos terminar esta.

**¿Qué pasa si el productor no está de acuerdo?**
La herramienta está cumpliendo su trabajo. El panel de huecos existe para eso. Mejor un desacuerdo informado que una recomendación cerrada.
