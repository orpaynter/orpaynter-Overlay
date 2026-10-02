"""Read public building geometry and catalogue coverage; never locate individuals."""
import urllib.request, urllib.parse, json, hashlib, datetime, math, pathlib, concurrent.futures, html, sys
sys.path.insert(0,str(pathlib.Path(".local-runs/cad-validation").resolve()))
import ezdxf
ROOT=pathlib.Path('../public-cad-pilot'); ROOT.mkdir(exist_ok=True)
SERVICE='https://services6.arcgis.com/yG5s3afENB5iO9fj/arcgis/rest/services/BUILDING_view/FeatureServer/0/query'
TNM='https://tnmaccess.nationalmap.gov/api/v1/products'
SITES=[
 ('met','Metropolitan Museum of Art','1000 Fifth Avenue, New York, NY 10028',-73.9632,40.7794,'https://www.metmuseum.org/plan-your-visit/met-fifth-avenue'),
 ('guggenheim','Solomon R. Guggenheim Museum','1071 Fifth Avenue, New York, NY 10128',-73.95895,40.78296,'https://www.guggenheim.org/plan-your-visit'),
 ('amnh','American Museum of Natural History','200 Central Park West, New York, NY 10024',-73.9739,40.7813,'https://www.amnh.org/about/contact'),
 ('moma','Museum of Modern Art','11 West 53 Street, New York, NY 10019',-73.9776,40.7614,'https://www.moma.org/visit/plan/floorplan/index'),
 ('whitney','Whitney Museum of American Art','99 Gansevoort Street, New York, NY 10014',-74.0089,40.7396,'https://whitney.org/visit'),
 ('brooklyn','Brooklyn Museum','200 Eastern Parkway, Brooklyn, NY 11238',-73.9638,40.6712,'https://www.brooklynmuseum.org/'),
 ('nypl','New York Public Library — Schwarzman Building','476 Fifth Avenue, New York, NY 10018',-73.9822,40.7532,'https://www.nypl.org/spotlight/schwarzman-plan-your-visit'),
 ('cooper','Cooper Hewitt, Smithsonian Design Museum','2 East 91st Street, New York, NY 10128',-73.9577,40.7844,'https://www.cooperhewitt.org/visit/getting-here/'),
 ('morgan','Morgan Library & Museum','225 Madison Avenue, New York, NY 10016',-73.9814652,40.7492685,'https://www.themorgan.org/campus/mckim'),
 ('mcny','Museum of the City of New York','1220 Fifth Avenue, New York, NY 10029',-73.9518020,40.7925266,'https://www.mcny.org/visit')]
def get(base,params):
 url=base+'?'+urllib.parse.urlencode(params)
 raw=urllib.request.urlopen(urllib.request.Request(url,headers={'User-Agent':'OrPaynterPublicCADPilot/1.0'}),timeout=25).read()
 return json.loads(raw),{'url':url,'sha256':hashlib.sha256(raw).hexdigest(),'capturedAt':datetime.datetime.now(datetime.timezone.utc).isoformat()}
def capture(site):
 key,name,address,lng,lat,official=site
 item={'id':key,'name':name,'address':address,'addressSource':official,'navigationPoint':{'lng':lng,'lat':lat,'precision':'approximate lookup point; not a survey control point'},'identityStatus':'candidate intersection; confirm BIN before property use','proofClass':'PUBLIC SOURCE CAPTURE; NOT SURVEY VERIFIED'}
 try:
  d,source=get(SERVICE,{'f':'json','geometry':f'{lng},{lat}','geometryType':'esriGeometryPoint','inSR':4326,'spatialRel':'esriSpatialRelIntersects','outFields':'BIN,NAME,GEOM_SOURCE,HEIGHT_ROOF,GROUND_ELEVATION,LAST_EDITED_DATE,FEATURE_CODE','returnGeometry':'true','outSR':2263})
  if d.get('error'):raise ValueError(str(d['error']))
  item['footprintSource']=source;item['footprints']=d.get('features',[]);item['coordinateSystem']=d.get('spatialReference');
 except Exception as e:item['footprintError']=str(e)[:220];item['footprints']=[]
 try:
  d,source=get(TNM,{'datasets':'Lidar Point Cloud (LPC)','bbox':f'{lng-.0003},{lat-.0003},{lng+.0003},{lat+.0003}','max':10})
  item['lidarSource']=source;item['lidarCount']=d.get('total');item['lidarCatalogue']=[{k:x.get(k) for k in ['title','sourceId','publicationDate','lastUpdated','metaUrl','downloadURL','boundingBox','sizeInBytes']} for x in d.get('items',[])];item['lidarStatus']='catalogue coverage only; points not downloaded or inspected'
 except Exception as e:item['lidarError']=str(e)[:220];item['lidarCount']=None
 (ROOT/(key+'-source.json')).write_text(json.dumps(item,indent=2))
 print(key,'footprints',len(item['footprints']),'lidar',item['lidarCount'],flush=True)
 return item
if "--reuse-capture" in sys.argv:
 records=json.loads((ROOT/"catalogue.json").read_text())["sites"]
else:
 with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:records=list(pool.map(capture,SITES))
for r in records:
 rings=[ring for feature in r['footprints'] for ring in feature.get('geometry',{}).get('rings',[])]
 if not rings:continue
 if (r['coordinateSystem'].get('latestWkid') or r['coordinateSystem'].get('wkid'))!=2263:raise ValueError('Unexpected coordinate system; refusing dimension export')
 xs=[p[0] for ring in rings for p in ring];ys=[p[1] for ring in rings for p in ring];x0,y0=min(xs),min(ys);w,h=max(xs)-x0,max(ys)-y0
 area=abs(sum(sum(a[0]*b[1]-b[0]*a[1] for a,b in zip(ring,ring[1:]))/2 for ring in rings))
 perimeter=sum(sum(math.dist(a,b) for a,b in zip(ring,ring[1:])) for ring in rings)
 r['derivedDimensions']={'gridXExtentUSFeet':round(w,2),'gridYExtentUSFeet':round(h,2),'planAreaSquareUSFeet':round(area,2),'boundaryLengthUSFeet':round(perimeter,2),'meaning':'projected source footprint only; not roof surface area, roof pitch, or measured eave lengths'}
 # Standards-based writer preserves actual State Plane coordinates and US survey-foot units.
 doc=ezdxf.new('R2018',units=21)
 doc.layers.new('PUBLIC_FOOTPRINT',dxfattribs={'color':4})
 for ring in rings:
  pts=ring[:-1] if ring[0]==ring[-1] else ring
  doc.modelspace().add_lwpolyline(pts,close=True,dxfattribs={'layer':'PUBLIC_FOOTPRINT'})
 doc.saveas(ROOT/(r['id']+'.dxf'))
 scale=min(490/w,260/h);points=[]
 for ring in rings:
  points.append('M '+' L '.join(f'{35+(x-x0)*scale:.2f},{300-(y-y0)*scale:.2f}' for x,y in ring)+' Z')
 label=f'Grid X extent {w:.1f} ft · Grid Y extent {h:.1f} ft'
 svg=f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 560 350"><rect width="560" height="350" fill="#0c1724"/><path d="{" ".join(points)}" fill="#173e50" fill-rule="evenodd" stroke="#55d7ce" stroke-width="1.5"/><text x="22" y="327" fill="#d3e7ed" font-size="14" font-family="sans-serif">{label}</text><text x="22" y="344" fill="#839aa9" font-size="11" font-family="sans-serif">EPSG:2263 · source footprint · accuracy varies by geometry source</text></svg>'
 (ROOT/(r['id']+'.svg')).write_text(svg)
report={'generatedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'scope':'10 public visitor destinations; no individuals or private home addresses','metadata':'https://github.com/CityOfNewYork/nyc-geo-metadata/blob/master/Metadata/Metadata_BuildingFootprints.md','limitations':['Photogrammetric footprint source: documented approximately +/-2 ft positional accuracy; manual geometry less accurate. This is not a guarantee for any edge.','BIN/campus identity needs confirmation. Point intersection may return only one part of a multi-building site.','LiDAR catalogue intersection proves listed coverage, not point density, usable roof returns, acquisition date or present-day accuracy.','Source feature edit date and catalogue publication date are not imagery acquisition dates.','No measured roof-plane model, interiors, current site survey or verified CAD twin created. DXF contains public plan outlines only.'],'sites':records}
(ROOT/'catalogue.json').write_text(json.dumps(report,indent=2))
cards=[]
for r in records:
 attrs=[f.get('attributes',{}) for f in r['footprints']]
 summary='; '.join(f"BIN {a.get('BIN')} · {a.get('NAME') or 'unnamed source feature'} · {a.get('GEOM_SOURCE')}" for a in attrs) or 'No intersecting footprint returned'
 photo=f'<img src="{r["id"]}.svg" alt="Source footprint outline"/>' if attrs else '<div class="missing">Footprint unavailable at lookup point</div>'
 cad=f'<a href="{r["id"]}.dxf" download>Download 2D DXF</a>' if attrs else ''
 cards.append(f'<article><span class="tag">PUBLIC DATA · IDENTITY NEEDS REVIEW</span><h2>{html.escape(r["name"])}</h2><p>{html.escape(r["address"])}</p>{photo}<p>{html.escape(summary)}</p><p>LiDAR catalogue: {r["lidarCount"] if r["lidarCount"] is not None else "unavailable"} intersecting tiles. Points not inspected.</p><nav>{cad}<a href="{r["id"]}-source.json">Source record</a><a href="{r["addressSource"]}" target="_blank" rel="noreferrer">Official address</a></nav></article>')
page='''<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>OrPaynter · Public CAD pilot</title><style>body{margin:0;background:#07111b;color:#dae8ed;font:16px/1.55 system-ui}main{max-width:1240px;margin:auto;padding:40px 24px}.kicker,.tag{color:#69dfd3;letter-spacing:.1em;font-size:11px}h1{font-size:clamp(32px,5vw,58px);line-height:1.1;max-width:820px}header p{max-width:850px;color:#a9becb}.note{background:#182332;border-left:3px solid #e4bc6b;padding:20px;margin:30px 0}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(310px,1fr));gap:20px}article{border:1px solid #243647;border-radius:16px;padding:22px;background:#0d1a28}h2{font-size:22px;line-height:1.2}article p{font-size:13px;color:#aac0cb}img{width:100%;border-radius:9px}nav{display:flex;flex-wrap:wrap;gap:15px}a{color:#6edbd4;font-size:13px}.missing{padding:55px 12px;background:#182332}footer{margin:40px 0;font-size:13px;color:#92a8b8}</style><main><header><span class="kicker">ORPAYNTER / MEASUREMENT EVIDENCE</span><h1>Ten public sites. Real geometry. Stated limits.</h1><p>This pilot uses NYC building footprints and USGS LiDAR catalogue responses. The outlines can begin a CAD workflow. They do not establish exact roof dimensions.</p></header><div class="note">Photogrammetric footprints have a documented positional accuracy of approximately ±2 feet; manually updated footprints may be less accurate. These are projected 2D building outlines, with campus identity still requiring review. LiDAR tiles are catalogued here, not yet processed into roof planes. AI-generated repairs would remain inferred.</div><div class="grid">'''+''.join(cards)+'''</div><footer><a href="catalogue.json">Download full evidence catalogue</a> · <a href="https://github.com/CityOfNewYork/nyc-geo-metadata/blob/master/Metadata/Metadata_BuildingFootprints.md">City source metadata</a><p>All measurements use New York State Plane EPSG:2263 (US survey feet). Extents are State Plane grid X/Y bounding dimensions, not building-aligned edge lengths. DXF preserves projected coordinates; configure the importing CAD application accordingly. No individuals, residences or private-location searches.</p></footer></main></html>'''
(ROOT/'index.html').write_text(page)
print('Saved pilot',ROOT.resolve(),flush=True)
