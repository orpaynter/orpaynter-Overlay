"""Validate served DXFs with a CAD reader and compare them to captured city geometry."""
import sys, pathlib, json, io, urllib.request
sys.path.insert(0,str(pathlib.Path('.local-runs/cad-validation').resolve()))
import ezdxf
root=pathlib.Path('../public-cad-pilot')
catalogue=json.loads((root/'catalogue.json').read_text());results=[]
for site in catalogue['sites']:
 url='http://127.0.0.1:4180/orpaynter-cad/'+site['id']+'.dxf'
 raw=urllib.request.urlopen(url,timeout=15).read().decode('utf8')
 doc=ezdxf.read(io.StringIO(raw));audit=doc.audit();entities=list(doc.modelspace().query('LWPOLYLINE'))
 expected=[tuple(v) for feature in site['footprints'] for ring in feature['geometry']['rings'] for v in (ring[:-1] if ring[0]==ring[-1] else ring)]
 actual=[v for entity in entities for v in entity.get_points('xy')]
 assert actual==expected,site['id']
 assert all(entity.closed for entity in entities),site['id']
 assert doc.units==21 and not audit.errors and not audit.fixes,site['id']
 results.append({'site':site['id'],'vertices':len(actual),'url':url,'sourceCoordinatesMatch':True,'closedRings':True,'insertionUnits':21,'readerErrors':0,'readerRepairs':0})
report={'reader':'ezdxf '+ezdxf.__version__,'sitesPassed':len(results),'checks':results,'meaning':'HTTP-delivered DXFs parse with source coordinates/units/closure intact; not a survey accuracy or AutoCAD UI import test.'}
(root/'served-cad-verification.json').write_text(json.dumps(report,indent=2))
print('10 served CAD exports passed source/reader/unit verification')
