# Fuentes

Nada entra a la interfaz, al pitch ni a la entrega sin una fila en este archivo. Si el dato no está aquí, es una hipótesis o no existe.

Regla de escritura: copia el número del documento original. No lo redondees de memoria en la slide. Al lado de cada cifra deja la URL y la fecha en que alguien del equipo la abrió.

## 1. NASA, lo que sí va en el MVP

Estas fuentes alcanzan para el requisito de premio global: usar al menos un dato o recurso de NASA. Guía: [Project Submission Guide](https://www.spaceappschallenge.org/resources/project-submission-guide/), sección NASA Data, publicada el 13 de noviembre de 2026.

| Uso en la app | Fuente oficial | Estado el 14 nov 2026 |
| --- | --- | --- |
| Lluvia diaria corregida `PRECTOTCORR` (mm/día), temperatura máxima `T2M_MAX` (°C) y mínima `T2M_MIN` (°C), comunidad `AG` | [POWER Daily Point API](https://power.larc.nasa.gov/docs/services/api/temporal/daily/) y [diccionario de parámetros](https://power.larc.nasa.gov/docs/tutorials/parameters/) | Ya está en `src/climate.js`. No pide llave. |
| Resumen 2015–2024 del punto 25.70° N, 99.24° O | [Request ya usada por el repo](https://power.larc.nasa.gov/api/temporal/daily/point?parameters=PRECTOTCORR,T2M_MAX,T2M_MIN&community=AG&longitude=-99.24&latitude=25.70&start=20150101&end=20241231&format=JSON&time-standard=UTC) | Cacheada en `src/sample.json`. |
| Resolución y método de la rejilla | [POWER Methodology](https://power.larc.nasa.gov/docs/methodology/) | Hay que copiar la frase de resolución de esa página antes de escribirla en la UI. No la inventes. |
| Página del reto y lista de datos que NASA sugiere | [Field Shift, pestaña Resources](https://www.spaceappschallenge.org/2026/challenges/adapting-farms-with-nasa-data/?tab=resources) | SMAP, GPM/IMERG, ECOSTRESS, Landsat, MODIS, POWER, GRACE, SRTM y Sentinel-2 de ESA están sugeridos. Sugerido no significa integrado. |

Lo que `src/sample.json` ya trae, calculado por `src/climate.js` a partir de POWER. El código ordena los años con lluvia completa y llama "dry" al segundo más seco, no al más seco. No cambies ese significado en el texto sin cambiar el código.

- Año cercano a la mediana de lluvia anual: 2018, 691 mm. Máxima diaria de ese año: 42.83 °C. Mínima diaria: −2.25 °C.
- Año que el código marca como dry: 2023, 619 mm. Máxima diaria: 47.14 °C. Mínima diaria: 3.65 °C.
- Años completos evaluados: 10, de 2015 a 2024, calendario UTC.
- Es clima regional de la celda de POWER, no la lluvia medida en el surco.

Esos dos años se parecen en lluvia anual (619 contra 691 mm). La diferencia fuerte de este cache es el calor (47.14 °C contra 42.83 °C). En la UI hay que mostrar la serie y decir qué significa la etiqueta. Ross tiene la tarea de alinear la palabra "Dry year" con el año más seco si el equipo quiere ese significado. Hasta que el código cambie, el texto describe el código real.

## 2. NASA, no prometerlo hoy

Sin cuenta de [Earthdata](https://urs.earthdata.nasa.gov/) no se descargan bien estos productos. Nadie del equipo había creado la cuenta a las 12:33 del sábado. Si alguien la crea y un archivo real queda cacheado en el repo antes de las 21:00, se puede mostrar. Si no, se mencionan solo como trabajo futuro. No se simulan.

| Dato | Para qué serviría | Por qué no es el MVP | URL |
| --- | --- | --- | --- |
| SMAP, humedad superficial | Estrés hídrico del suelo | Descarga con Earthdata. La rejilla es gruesa para una parcela. | [SMAP](https://smap.jpl.nasa.gov/) |
| GPM IMERG | Lluvia de satélite, distinta de POWER | Misma barrera de cuenta y de procesamiento | [IMERG](https://gpm.nasa.gov/data/imerg) |
| MODIS NDVI | Historia de verdor y años con estrés del cultivo | AppEEARS pide Earthdata | [MODIS](https://modis.gsfc.nasa.gov/data/) y [AppEEARS](https://appeears.earthdatacloud.nasa.gov/) |
| ECOSTRESS, GRACE, SRTM, Landsat | Calor de superficie, agua regional, relieve, imagen fina | Cada uno es un proyecto aparte en este plazo | Están listados en la pestaña Resources del reto |

[NASA Worldview](https://worldview.earthdata.nasa.gov/) sí abre sin cuenta. Sirve para una captura citada en las slides. No alimenta el puntaje.

## 3. Suelo

El reto pide información local de suelo. Este es el orden realista para el plazo.

| Fuente | ¿Entra en 24 h? | Cómo se usa | URL |
| --- | --- | --- | --- |
| ISRIC SoilGrids, API pública | Sí, un punto, si la respuesta trae números y el pin está sobre un predio | Una consulta por parcela demo. Guardar el JSON. Dividir `mean` entre `d_factor` del mismo JSON. | [SoilGrids](https://soilgrids.org/) y [API](https://rest.isric.org/soilgrids/v2.0/docs) |
| INEGI, edafología | No como mapa en vivo. Sí como una frase si alguien lee el polígono del predio | Una etiqueta de tipo de suelo, con la serie citada | [Edafología, INEGI](https://www.inegi.org.mx/temas/edafologia/) |
| Estudio de INIFAP para Nuevo León | Sí como cita de la secuencia sorgo–frijol, después de releer la tabla | No como mapa de suelo | [PDF citado en el README](https://cienciasagricolas.inifap.gob.mx/index.php/agricolas/es/article/download/2186/3423?inline=1) |

Consultas hechas el 14 de noviembre de 2026. No son el suelo de la parcela hasta que el pin esté verificado.

Consulta del punto que ya usa la app, 0–5 cm. Las medias volvieron `null`:

`https://rest.isric.org/soilgrids/v2.0/properties/query?lon=-99.24&lat=25.70&property=clay&property=sand&property=soc&property=phh2o&depth=0-5cm&value=mean`

No escribas arcilla, pH ni carbono para 25.70° N, 99.24° O. La tarjeta de suelo de esa parcela dice "Not verified" hasta que haya otra consulta con números y el predio esté confirmado en satélite.

Consulta de prueba en otro punto, lon −99.80, lat 25.30, misma profundidad. Esto solo demuestra que la API responde. Ese punto no es una parcela demo.

| Propiedad | `mean` crudo | `d_factor` | Valor |
| --- | --- | --- | --- |
| clay | 396 | 10 | 39.6 % |
| phh2o | 76 | 10 | 7.6 |
| soc | 272 | 10 | 27.2 g/kg |

URL de esa prueba:

`https://rest.isric.org/soilgrids/v2.0/properties/query?lon=-99.80&lat=25.30&property=clay&property=soc&property=phh2o&depth=0-5cm&value=mean`

SoilGrids es un modelo global de ISRIC. No es un análisis de laboratorio del productor y no es un dato de NASA. En la UI se llama por su nombre. No se etiqueta como "NASA soil".

## 4. Cultivos y cifras de Nuevo León

Hipótesis de trabajo. Salva y Axel las confirman o las tiran hoy. No van a la interfaz tal como están.

La historia del estado incluye cítricos y ganado. La decisión que el reto pide es una rotación. El naranjo es perenne: no se rota cada año. El MVP usa cultivos anuales. Los cítricos se pueden nombrar en el pitch como contexto regional, con la cifra copiada del PDF, no dentro de las tres rotaciones.

Hipótesis de cultivos para las tres tarjetas:

| Tarjeta en inglés | Hipótesis | Qué hay que abrir antes de dejarla |
| --- | --- | --- |
| Grain sorghum again | Rotación actual de temporal en el noreste del estado | Que el municipio del pin tenga sorgo grano en SIAP |
| Sorghum, then dry bean | El README ya apunta a una secuencia sorgo–frijol en un estudio de INIFAP para Nuevo León | Releer la Tabla 6 del PDF y anotar qué dice en realidad |
| Forage sorghum | Conecta con lo que contó Salva: falta agua y eso también pega al ganado, porque falta forraje | Que el municipio reporte sorgo forrajero, o marcar la tarjeta como escenario y no como práctica confirmada |

Fuentes para esa verificación:

- Cierre agrícola por estado, distrito y municipio: [nube.agricultura.gob.mx/cierre_agricola](https://nube.agricultura.gob.mx/cierre_agricola/).
- Datos abiertos de producción agrícola: [Datos abiertos, Agrícola, DGSIAP](https://nube.agricultura.gob.mx/datosAbiertos/Agricola.php).
- Descripción del programa: [Producción Agrícola, gob.mx](https://www.gob.mx/agricultura/dgsiap/acciones-y-programas/produccion-agricola-404122).
- Estadísticas del estado: [Estadisticas_Sectoriales.pdf](https://campo.nl.gob.mx/wp-content/uploads/2026/07/Estadisticas_Sectoriales.pdf), Secretaría de Desarrollo Regional y Agropecuario de Nuevo León.
- Boletín de siembra y cosecha. La propia hoja dice que la fuente es SEDRA N.L. con información de la representación estatal de la SADER: [BolAgrop.pdf](https://campo.nl.gob.mx/pdf/boletines/BolAgrop.pdf).

No copies hectáreas, toneladas ni lugares del ranking desde un buscador. Ábrelos en esos PDF o en SIAP y anota la tabla.

El rancho de la familia de Salva no es un dataset. Sirve para elegir el problema: cada vez llueve menos, el agua es el límite, y el ganado también lo resiente. No se publica el nombre de la familia, el nombre del rancho ni una ubicación que los identifique. En la app el usuario es un caso compuesto: un productor de temporal en Nuevo León.

## 5. Parcelas demo

Máximo tres. La demo del domingo funciona con una. La segunda entra solo si quedó verificada. La tercera no se construye hoy.

Método, unos 20 minutos por punto:

1. Abrir el pin en imagen de satélite. Tiene que caer en un predio agrícola, no en el pueblo, una carretera o el cerro.
2. Anotar el municipio con el [Marco Geoestadístico de INEGI](https://www.inegi.org.mx/temas/mg/) o con la etiqueta del mapa que estén usando. Guardar una captura.
3. En el [cierre agrícola](https://nube.agricultura.gob.mx/cierre_agricola/), filtrar Nuevo León y ese municipio. Anotar los tres cultivos con más superficie cosechada en el año más reciente que cargue el sitio.
4. Repetir la consulta de SoilGrids. Si `mean` viene `null`, la tarjeta de suelo queda en "Not verified".
5. Si el pin se mueve, volver a bajar POWER y reemplazar `src/sample.json`. No mezcles coordenadas viejas con números nuevos.

| ID | Coordenadas | Hipótesis de lugar | Estado |
| --- | --- | --- | --- |
| P1, la de la demo | 25.700° N, 99.240° O. El rectángulo de la app va de 25.699 a 25.701 y de −99.242 a −99.238 | Municipio de China, Nuevo León. Temporal, sorgo y forraje. Hay que confirmarlo | El clima POWER ya está cacheado. SoilGrids volvió vacío. El nombre del municipio no está confirmado en el repo |
| P2, solo si P1 ya quedó verificada | 25.30° N, 99.80° O | Valle hacia la zona citrícola. El predio demo seguiría siendo de cultivo anual, no una huerta | SoilGrids sí devolvió números el 14 nov 2026. El predio no está visto en satélite. No usar esos números todavía |
| P3, no construir | Cerca de 27.24° N, 100.13° O | Anáhuac, norte, más seco y con riego. Solo como contraste verbal si alguien lo verifica en el mapa | Sin request de POWER del equipo. Fuera del MVP |

## 6. Sequía, para el pitch o una tarjeta estática

El [Monitor de Sequía en México](https://smn.conagua.gob.mx/es/climatologia/monitor-de-sequia/monitor-de-sequia-en-mexico) es de CONAGUA y el Servicio Meteorológico Nacional. No es NASA. Si Axel descarga el mapa más reciente y lee la categoría del municipio de P1, esa categoría puede ir en una tarjeta con fecha y URL. Si no alcanza, se dice en el pitch y no se dibuja un mapa inventado.

## 7. Otras herramientas que hay que declarar

La entrega tiene un campo para datos de agencias socias y otras referencias. Ahí entra todo lo que no es NASA, aunque sea gratis. Guía: [Project Submission Guide](https://www.spaceappschallenge.org/resources/project-submission-guide/).

- Google Maps JavaScript API, si el botón de dibujar sigue en la app. [Documentación de la llave](https://developers.google.com/maps/documentation/javascript/get-api-key).
- Next.js, React y Vercel.
- SoilGrids, SIAP, SEDRA N.L., INEGI, CONAGUA o INIFAP, solo los que sí se hayan usado.
- IAs que hayan generado código, texto o imágenes. El campo del formulario se llama "Use of Super Intelligence (SI)". Esa respuesta no la ven los jueces. Sí ven marcas de agua, texto y metadatos dentro del proyecto. El código y los datos generados con IA se reconocen en la descripción. Las imágenes generadas con IA llevan marca de agua visible. La guía dice que SI no se usa para inventar la idea de la solución.

## 8. Qué se escribe en el campo NASA Data

Borrador para que Ross lo ajuste cuando el cache esté congelado. No agregues satélites que no estén en el repo.

> We used the NASA POWER Daily Point API, agroclimatology community, parameters PRECTOTCORR (corrected precipitation, mm/day), T2M_MAX and T2M_MIN (degrees Celsius), calendar years 2015 through 2024, UTC. The demo parcel is cached in the app from a point request at 25.70 N, 99.24 W. Documentation: https://power.larc.nasa.gov/docs/services/api/temporal/daily/ and https://power.larc.nasa.gov/docs/tutorials/parameters/. The values describe the regional POWER cell, not a gauge in the field.
