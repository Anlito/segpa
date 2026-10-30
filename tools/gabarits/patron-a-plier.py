# Patron de carrosserie (une pièce) pour le châssis v5 — cotes en mm, échelle 1
import math
from shapely.geometry import Polygon, Point, LineString
from shapely.ops import unary_union
from shapely import affinity

H0, H1, H2 = 12, 16, 27            # hauteurs au-dessus de la plaque : avant, fin du nez, toit
XN, XR = -47, 78.9                  # fin du nez, arrière (x châssis)
W = 37                              # demi-largeur (axe des flancs)
LNH = math.hypot(15.4, H1 - H0)     # capot du nez (pente)
LMH = math.hypot(-XN, H2 - H1)      # capot principal
s_mh, s_nh = -LMH, -LMH - LNH
s_fw = s_nh - H0
LD = math.hypot(15.4, 17.1)         # pan de nez (longueur au sol)
TAB, LT = 3, 19.5

def tab(cx, cw, axe, sens):
    # languette : centre cx le long d'un bord droit
    if axe == 's':  # bord à w = cw, languette vers sens (±w)
        return Polygon([(cx-LT/2, cw), (cx+LT/2, cw), (cx+LT/2, cw+sens*TAB), (cx-LT/2, cw+sens*TAB)])
    return Polygon([(cw, cx-LT/2), (cw, cx+LT/2), (cw+sens*TAB, cx+LT/2), (cw+sens*TAB, cx-LT/2)])

faces = {}
faces['TOIT'] = Polygon([(0,-W),(XR,-W),(XR,W),(0,W)]).difference(Point(28.3, 0).buffer(11, 64))
faces['CAPOT'] = Polygon([(s_mh,-W),(0,-W),(0,W),(s_mh,W)])
faces['NEZ'] = Polygon([(s_nh,-20),(s_mh,-W),(s_mh,W),(s_nh,20)])
faces['AVANT'] = Polygon([(s_fw,-20),(s_nh,-20),(s_nh,20),(s_fw,20)])
D = Polygon([(s_nh,20),(s_fw,20),(s_fw,20+LD),(s_fw+H1,20+LD)])
faces['PAN1'] = D; faces['PAN2'] = affinity.scale(D, 1, -1, origin=(0,0))
def flanc():
    pts = [(XR,W),(0,W),(XN,W+(H2-H1)),(XN,W+H2)]
    b = W+H2
    for a, c, kind in [(-44,-31,'e'),(-15.5-LT/2,-15.5+LT/2,'t'),(43.5-LT/2,43.5+LT/2,'t'),(55,68,'e')]:
        d = b-9 if kind == 'e' else b
        pts += [(a,b),(a,d if kind=='e' else b+TAB),(c,d if kind=='e' else b+TAB),(c,b)]
    pts += [(XR,b)]
    return Polygon(pts)
faces['CÔTÉ1'] = flanc(); faces['CÔTÉ2'] = affinity.scale(flanc(), 1, -1, origin=(0,0))
RB = XR + H2
rw = Polygon([(XR,-W),(RB,-W),(RB,W),(XR,W)])
arche = unary_union([Polygon([(RB-18+12.5,-12.3),(RB+1,-12.3),(RB+1,12.7),(RB-18+12.5,12.7)]), Point(RB-18+12.5, 0.2).buffer(12.5, 64)])
faces['ARRIÈRE'] = rw.difference(arche)
tabs = [tab(-26, RB, 'w', 1), tab(26.5, RB, 'w', 1), tab(0, s_fw, 'w', -1)]
faces['ARRIÈRE'] = unary_union([faces['ARRIÈRE'], tabs[0], tabs[1]])
faces['AVANT'] = unary_union([faces['AVANT'], tabs[2]])
tabs_flanc = [tab(x, W+H2, 's', 1) for x in (-15.5, 43.5)] + [tab(x, -W-H2, 's', -1) for x in (-15.5, 43.5)]

def rabat(p, q, parent, larg=5):
    (px,py),(qx,qy) = p,q; L = math.hypot(qx-px, qy-py); dx,dy = (qx-px)/L,(qy-py)/L
    for n in [(-dy,dx),(dy,-dx)]:
        poly = Polygon([p, q, (qx+n[0]*larg-dx*larg, qy+n[1]*larg-dy*larg), (px+n[0]*larg+dx*larg, py+n[1]*larg+dy*larg)])
        if poly.intersection(faces[parent]).area < 1: break
    autres = unary_union([f for k,f in faces.items() if k != parent]).buffer(1.2)
    r = poly.difference(autres)
    if r.geom_type != 'Polygon': r = max(r.geoms, key=lambda g: g.area)
    return r, (p, q)
rabats = []
for sg in (1, -1):
    c, pan = ('CÔTÉ1','PAN1') if sg == 1 else ('CÔTÉ2','PAN2')
    rabats.append(rabat((s_mh+1, sg*W), (-1, sg*W), 'CAPOT'))                        # capot -> côté
    rabats.append(rabat((s_nh, sg*20), (s_mh, sg*W), 'NEZ'))                         # nez -> pan
    rabats.append(rabat((XN, sg*(W+H2-H1)), (XN, sg*(W+H2)), c))                     # côté -> pan
    rabats.append(rabat((XR, sg*W), (XR, sg*(W+H2)), c))                             # côté -> arrière
plis = [((0,-W),(0,W)), ((s_mh,-W),(s_mh,W)), ((s_nh,-20),(s_nh,20)), ((XR,-W),(XR,W)),
        ((0,W),(XR,W)), ((0,-W),(XR,-W)), ((s_fw,20),(s_nh,20)), ((s_fw,-20),(s_nh,-20))] + [r[1] for r in rabats]

# contrôle : rien ne se chevauche
toutes = list(faces.items()) + [(f'r{i}', r[0]) for i, r in enumerate(rabats)]
for i in range(len(toutes)):
    for j in range(i+1, len(toutes)):
        a = toutes[i][1].intersection(toutes[j][1]).area
        if a > 0.5: print('CHEVAUCHEMENT', toutes[i][0], toutes[j][0], round(a,1))
print('rabats', [round(r[0].area) for r in rabats])
tout = unary_union([f for _,f in toutes] + tabs_flanc).buffer(0.01).buffer(-0.01)
minx, miny, maxx, maxy = tout.bounds; print('encombrement', round(maxx-minx), '×', round(maxy-miny))

OX, OY = 297/2 - (minx+maxx)/2, 112 - (miny+maxy)/2
T = lambda x, y: (x+OX, y+OY)
def chemin(g):
    def anneau(c): return 'M' + ' L'.join(f'{x+OX:.2f},{y+OY:.2f}' for x,y in c.coords) + ' Z'
    return anneau(g.exterior) + ''.join(anneau(i) for i in g.interiors)
svg = [f'<svg xmlns="http://www.w3.org/2000/svg" width="297mm" height="210mm" viewBox="0 0 297 210">',
 '<style>text{font-family:Arial,sans-serif;fill:#000}.c{fill:none;stroke:#000;stroke-width:.5}.p{stroke:#000;stroke-width:.4;stroke-dasharray:2 1.5}.h{fill:url(#h)}.g{fill:#e6e6e6}.t{font-size:5px;font-weight:700}.s{font-size:3.3px}.m{font-size:2.6px}</style>',
 '<defs><pattern id="h" width="1.2" height="1.2" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="1.2" stroke="#000" stroke-width=".35"/></pattern></defs>']
for r,_ in rabats: svg.append(f'<path d="{chemin(r)}" class="g"/>')
for t in tabs + tabs_flanc: svg.append(f'<path d="{chemin(t)}" class="h"/>')
svg.append(f'<path d="{chemin(tout)}" class="c" fill-rule="evenodd"/>')
for (a,b) in plis: svg.append(f'<line x1="{a[0]+OX:.2f}" y1="{a[1]+OY:.2f}" x2="{b[0]+OX:.2f}" y2="{b[1]+OY:.2f}" class="p"/>')
def txt(x, y, t, cl='t'): svg.append(f'<text x="{x+OX:.2f}" y="{y+OY:.2f}" class="{cl}" text-anchor="middle">{t}</text>')
txt(55, -18, 'TOIT'); txt(28.3, 16, 'trou du ballon', 's'); txt(-24, 2, 'CAPOT'); txt(-57, 2, 'NEZ', 's'); txt(-70.5, 1.5, 'AVANT', 's')
txt(35, 52, 'CÔTÉ'); txt(35, -50, 'CÔTÉ'); txt(88, -24, 'ARRIÈRE', 's')
txt(-67.5, 33, 'pan', 'm'); txt(-67.5, -31, 'pan', 'm')
for x in (-37.5, 61.5): txt(x, 61, 'axe', 'm'); txt(x, -59, 'axe', 'm')
svg.append('<text x="12" y="12" style="font-size:6.5px;font-weight:700">Patron de carrosserie — voiture à ballon (châssis v5)</text>')
svg.append('<text x="12" y="18" class="s">Imprimer à taille réelle (100 %). Le trait mesure 50 mm :</text><line x1="100" y1="17" x2="150" y2="17" stroke="#000" stroke-width=".6"/>')
leg = [('je découpe', 'c'), ('je plie', 'p')]
svg.append('<line x1="12" y1="197" x2="22" y2="197" class="c"/><text x="24" y="198.2" class="s">je découpe</text>')
svg.append('<line x1="48" y1="197" x2="58" y2="197" class="p"/><text x="60" y="198.2" class="s">je plie</text>')
svg.append('<rect x="80" y="195" width="8" height="4" class="g"/><text x="90" y="198.2" class="s">rabat : je colle dessous</text>')
svg.append('<rect x="128" y="195" width="8" height="4" class="h"/><text x="138" y="198.2" class="s">languette : dans la fente du châssis</text>')
svg.append('<text x="12" y="204" class="s">Je marque les plis à la règle avant de plier. Le tube du ballon passe dans le trou du toit. Je ne bouche ni la sortie d\'air, ni les roues.</text>')
svg.append('</svg>')
s = '\n'.join(svg)
open('patron.svg','w').write(s)
open('patron.html','w').write('<!doctype html><meta charset="utf-8"><style>@page{size:A4 landscape;margin:0}html,body{margin:0}</style>' + s)

# ---------- Version pour une machine de découpe (Cricut Design Space) ----------
# Pas de texte, pas de hachures, pas de remplissage : un calque « decoupe » (contour fermé + trou du ballon) et un
# calque « plis » (traits simples, à régler sur « Rainurer » ou « Dessiner » dans Design Space). Unités : mm.
MARGE = 0  # pas de marge : la taille du fichier est celle du dessin (Design Space mesure le dessin)
net = tout.simplify(0.05, preserve_topology=True)
minx, miny, maxx, maxy = net.bounds
LARG, HAUT = maxx - minx + 2 * MARGE, maxy - miny + 2 * MARGE
dx, dy = MARGE - minx, MARGE - miny
def anneau_c(c): return 'M' + ' L'.join(f'{x+dx:.3f},{y+dy:.3f}' for x, y in c.coords) + ' Z'
contours = [anneau_c(net.exterior)] + [anneau_c(i) for i in net.interiors]
cricut = [f'<?xml version="1.0" encoding="UTF-8"?>',
  f'<svg xmlns="http://www.w3.org/2000/svg" width="{LARG:.2f}mm" height="{HAUT:.2f}mm" viewBox="0 0 {LARG:.2f} {HAUT:.2f}">',
  '<title>Patron de carrosserie, voiture à ballon (châssis v5) : découpe et plis</title>',
  '<g id="decoupe" fill="none" stroke="#000000" stroke-width="0.25">'] + [f'<path d="{c}"/>' for c in contours] + ['</g>',
  '<g id="plis" fill="none" stroke="#E11D48" stroke-width="0.25">'] + [f'<line x1="{a[0]+dx:.3f}" y1="{a[1]+dy:.3f}" x2="{b[0]+dx:.3f}" y2="{b[1]+dy:.3f}"/>' for a, b in plis] + ['</g>', '</svg>']
open('patron-carrosserie-cricut.svg', 'w').write('\n'.join(cricut) + '\n')
print('cricut', round(LARG, 1), '×', round(HAUT, 1), 'mm,', len(contours), 'contours,', len(plis), 'plis,', len(net.exterior.coords), 'points')
