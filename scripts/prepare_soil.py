"""Convert the official INEGI Linares G14-11 shapefile into a browser lookup.

Requires pyshp and pyproj. Pass the original ZIP and the output JSON path.
Source: https://www.inegi.org.mx/app/biblioteca/ficha.html?upc=702825236120
"""
import json
from pathlib import Path
import sys
from zipfile import ZipFile

from pyproj import Transformer
import shapefile

# The chart metadata specifies ITRF92, UTM zone 14N.
transform = Transformer.from_crs('EPSG:4487', 'EPSG:4326', always_xy=True)
with ZipFile(sys.argv[1]) as archive:
    layers = shapefile.Reader(
        shp=archive.open('conjunto_de_datos/G1411e.shp'),
        dbf=archive.open('conjunto_de_datos/G1411e.dbf'),
        encoding='latin1',
    )
    polygons = []
    for feature in layers.iterShapeRecords():
        shape = feature.shape
        if not shape.points:
            continue
        geometry = []
        starts = [*shape.parts, len(shape.points)]
        for start, end in zip(starts, starts[1:]):
            geometry.append([
                [round(lng, 6), round(lat, 6)]
                for lng, lat in transform.itransform(shape.points[start:end])
            ])
        coordinates = [point for ring in geometry for point in ring]
        lng, lat = zip(*coordinates)
        polygons.append([
            [min(lng), min(lat), max(lng), max(lat)],
            feature.record['CLAVE_WRB'],
            feature.record['CLASE_TEXT'],
            geometry,
        ])
Path(sys.argv[2]).write_text(json.dumps(polygons, separators=(',', ':')) + '\n')
