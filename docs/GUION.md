# Guion

Sede: domingo 15 de noviembre de 2026, 12:00, UDEM. Hablan Axel y Gael. Español. 2 minutos, y después 1 minuto de preguntas. Las slides o la pantalla que estén detrás van en inglés.

El video de YouTube es otra pieza. Máximo 30 segundos. También en inglés. No se recicla este guion completo dentro del video, porque no cabe.

Ensayo 1 a las 10:30. Ensayo 2 a las 11:00. Si pasan de 2:00, se corta primero la frase de los cítricos y después la frase del trabajo futuro. No se corta la demo de los sliders.

## Minuto de Axel (0:00–1:00)

Problema y parcela. No toca la laptop.

> En Nuevo León un productor de temporal ya no puede asumir el año pasado. Nos contaron un caso real de la región: cada vez llueve menos, el límite es el agua, y cuando falta agua también falta forraje para el ganado. No vamos a decirle qué sembrar.
>
> Field Shift compara tres rotaciones en una parcela de Nuevo León, con datos de NASA POWER de 2015 a 2024. En la pantalla están las cuatro cosas que pide el reto: observaciones de NASA, suelo local, características del cultivo y lo que al productor le importa.

Si a las 16:00 del sábado el pin sigue sin municipio confirmado, Axel dice "una parcela de ejemplo en Nuevo León". No dice "China".

## Minuto de Gael (1:00–2:00)

La pantalla. Mueve un slider. No dibuja un polígono.

> Esta es la rotación actual, sorgo otra vez. Al lado, sorgo y después frijol, y una opción de forraje. El año que estamos usando sale de NASA POWER. La lluvia de ese año y la temperatura máxima están en la tarjeta, con la liga a la fuente.
>
> Si subo el ahorro de agua, el orden cambia. Si subo el ingreso o la salud del suelo, cambia otra vez. No hay un solo ganador. Hay una mejor para agua, una mejor para suelo y una mejor para ingreso.
>
> La frase de abajo dice por qué, y también dice lo que no sabemos: esto no es un pronóstico de cosecha, el suelo de este pin no está verificado, y POWER es la celda regional, no un pluviómetro en el predio.

Cierra Axel, una frase, si sobran diez segundos:

> La cooperativa, con varias parcelas, queda para después. Hoy es una persona y un predio.

## Textos en inglés que la app tiene que poder mostrar

Axel puede reescribirlos. No puede quitarles el año, los milímetros ni la advertencia. Si Ross cambia el significado de "dry", se actualizan estos números el sábado antes de las 22:30.

Etiqueta del año, mientras el código siga igual:

> 2023 is the second-driest complete year in this POWER series: 623 mm of corrected precipitation, and a hottest day of 46.60 °C. The year closest to median rainfall is 2017, with 711 mm and a hottest day of 42.86 °C. Source: NASA POWER Daily Point API. This is the regional cell, not a gauge on the field.

Esa frase está apretada a propósito. Versión para la tarjeta, más corta:

> 2023, second-driest year in this cache: 623 mm and a daily maximum of 46.60 °C. NASA POWER, regional cell, not a field gauge.

Por qué, cuando gana el ahorro de agua:

> With water saving weighted highest, this rotation ranks first among the three options you are comparing. The score uses your sliders and team estimates of crop traits. It is not a yield forecast. Rainfall and temperature come from NASA POWER for this point, 2015–2024.

Suelo, mientras SoilGrids siga en null para el pin:

> Local soil: not verified for this pin. A SoilGrids query for 0–5 cm returned no mean value. We are not substituting a nearby point.

Huecos, siempre visibles:

> This does not know the farmer's yield, market price, or lab soil test. It does not tell anyone what to plant. A local advisor still has to review the choice.

## Plan B en la sede

Si la app no carga, Gael no intenta "Analyze field" ni dibujar el mapa. Axel sigue su minuto. Gael enseña tres capturas en el teléfono, en este orden:

1. Sliders con water saving bajo.
2. Los mismos datos con water saving alto, y el orden distinto.
3. El panel "What this does not know".

Las capturas las toma Mau el domingo a las 9:30, del link que ya abrió en incógnito.

## Preguntas

Las respuestas están en [PLAN.md](PLAN.md), sección "Preguntas de los jueces". En el minuto se contesta una, máximo dos. Axel toma las de campo y de validación. Gael toma las de datos, precisión e internet. Si no saben, la respuesta es: "Eso no está en esta versión. Está en el panel de huecos." No se improvisa un satélite.

## Video de 30 segundos

Lo hace Mau. YouTube, público o no listado. Texto en inglés quemado en la imagen. Sin voz, para no depender de subtítulos. Si alguien habla en español, los subtítulos en inglés van quemados igual y el video se vuelve a cronometrar.

Límite duro: 30.0 segundos o menos. La guía del 13 de noviembre de 2026 deja fuera del jueceo global lo que se pase. [Project Submission Guide](https://www.spaceappschallenge.org/resources/project-submission-guide/).

Shot list:

| Tiempo | Imagen | Texto en pantalla |
| --- | --- | --- |
| 0:00–0:02 | Cara o nombres del equipo, sin intro larga | Field Shift. UDEM, Monterrey. |
| 0:02–0:05 | Predio de temporal, puede ser la captura de satélite del pin | Less reliable rain. A farmer still has to choose a rotation. |
| 0:05–0:10 | Título de la app | Field Shift. Compare three rotations against your field's dry year. |
| 0:10–0:20 | Pantalla real: POWER, tres tarjetas, un slider que se mueve y el orden cambia | NASA POWER, 2015–2024. Your priorities change the order. Not a planting order. |
| 0:20–0:30 | Panel de huecos y el mapa de Nuevo León que ya esté citado | One field in Nuevo León. Soil still marked when it is not verified. Next: more parcels, still with a person in the loop. |

Antes de pegar el enlace en Space Apps, Mau lo abre en el teléfono de Ross, anota la duración que marca YouTube y se la manda a Ross por escrito.

## Deck de 7 slides, solo si el video no está listo

Edson. Si el video ya reproduce a las 10:30, este deck no se envía. Contar las slides con la de título incluida. Ocho slides invalidan el demo global.

1. Título, nombres del equipo, UDEM, Field Shift.
2. El problema del agua en un predio de temporal en Nuevo León.
3. La parcela y las cuatro entradas del reto.
4. Las tres rotaciones, una de ellas es la actual.
5. Dos estados de los sliders.
6. Qué número es de NASA POWER y de qué URL sale.
7. Qué no se sabe, y que la cooperativa queda fuera de esta versión.
