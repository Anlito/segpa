# Patron de carrosserie (une pièce) pour le châssis v8 — cotes en mm, échelle 1 (retours de Thomas du 31/10/2026)
# Châssis v8 : mêmes 7 fentes que le v5 ; ballon sur un tube incliné (23°, Ø 10, passage Ø 7) porté par une tour 20 × 20.
# Toit à 30 mm au-dessus de la plaque (40 était trop haut, 31/10) : l'embout du ballon dépasse de 23 mm. Fente du toit de
# 46 × 23 mm (tout ce qui dépasse du toit, tour comprise, entre x 11,5 et 54, mesuré sur le STL) : la carrosserie se pose
# par le dessus.
# Languettes de 10 mm, le bout en biseau (3 mm de chaque côté sur les 4 derniers mm) pour entrer facilement dans les
# fentes : elles traversent la plaque (2 mm) et se plient dessous (scotch, colle). Rabats de 12 mm, assez pour coller ou
# agrafer. L'arche arrière monte à 20 mm (le tube y passe entre 9 et 17 mm au-dessus de la plaque).
# Patron d'environ 20 × 15 cm : tapis Cricut 30 × 30 cm ; PDF d'exemple en A3.
import math
from shapely.geometry import Polygon, Point, LineString
from shapely.ops import unary_union
from shapely import affinity

H0, H1, H2 = 13, 18, 30            # hauteurs au-dessus de la plaque : avant, fin du nez, toit
XN, XR = -47, 78.9                  # fin du nez, arrière (x châssis)
W = 37                              # demi-largeur (axe des flancs)
LNH = math.hypot(15.4, H1 - H0)     # capot du nez (pente)
LMH = math.hypot(-XN, H2 - H1)      # capot principal
s_mh, s_nh = -LMH, -LMH - LNH
s_fw = s_nh - H0
LD = math.hypot(15.4, 17.1)         # pan de nez (longueur au sol)
TAB, LT = 10, 19.5                  # languette : 10 de long (plaque 2 + 8 à plier dessous), 19,5 de large
PLI_TAB = 2.5                       # pli des languettes : sous la plaque (2 mm + jeu)
BISEAU, BOUT = 3, 4                 # biseau du bout des languettes : 3 mm de chaque côté, sur les 4 derniers mm
RABAT = 12                          # rabats à coller ou agrafer

def tab(cx, cw, axe, sens):
    # languette : centre cx le long d'un bord droit
    # le long du bord : u ; en s'éloignant du mur : v. Le bout est en biseau pour guider la languette dans la fente.
    contour = [(-LT/2, 0), (LT/2, 0), (LT/2, TAB-BOUT), (LT/2-BISEAU, TAB), (-LT/2+BISEAU, TAB), (-LT/2, TAB-BOUT)]
    if axe == 's':  # bord à w = cw, languette vers sens (±w)
        return Polygon([(cx+u, cw+sens*v) for u, v in contour])
    return Polygon([(cw+sens*v, cx+u) for u, v in contour])

faces = {}
FENTE_TOIT = LineString([(21.5, 0), (44, 0)]).buffer(11.5, 32)   # tour, tube et embout du ballon : x 10 à 55,5, 23 de large
faces['TOIT'] = Polygon([(0,-W),(XR,-W),(XR,W),(0,W)]).difference(FENTE_TOIT)
faces['CAPOT'] = Polygon([(s_mh,-W),(0,-W),(0,W),(s_mh,W)])
faces['NEZ'] = Polygon([(s_nh,-20),(s_mh,-W),(s_mh,W),(s_nh,20)])
faces['AVANT'] = Polygon([(s_fw,-20),(s_nh,-20),(s_nh,20),(s_fw,20)])
D = Polygon([(s_nh,20),(s_fw,20),(s_fw,20+LD),(s_fw+H1,20+LD)])
faces['PAN1'] = D; faces['PAN2'] = affinity.scale(D, 1, -1, origin=(0,0))
def flanc():
    pts = [(XR,W),(0,W),(XN,W+(H2-H1)),(XN,W+H2)]
    b = W+H2
    for a, c in [(-44,-31),(55,68)]:   # encoches au-dessus des plots d'axes (les languettes sont ajoutées à part, en biseau)
        pts += [(a,b),(a,b-9),(c,b-9),(c,b)]
    pts += [(XR,b)]
    return Polygon(pts)
faces['CÔTÉ1'] = flanc(); faces['CÔTÉ2'] = affinity.scale(flanc(), 1, -1, origin=(0,0))
RB = XR + H2
rw = Polygon([(XR,-W),(RB,-W),(RB,W),(XR,W)])
HA = 20   # hauteur de l'arche (sortie du tube)
arche = unary_union([Polygon([(RB-HA+12.5,-12.3),(RB+1,-12.3),(RB+1,12.7),(RB-HA+12.5,12.7)]), Point(RB-HA+12.5, 0.2).buffer(12.5, 64)])
faces['ARRIÈRE'] = rw.difference(arche)
tabs = [tab(-26, RB, 'w', 1), tab(26.5, RB, 'w', 1), tab(0, s_fw, 'w', -1)]
faces['ARRIÈRE'] = unary_union([faces['ARRIÈRE'], tabs[0], tabs[1]])
faces['AVANT'] = unary_union([faces['AVANT'], tabs[2]])
tabs_flanc = [tab(x, W+H2, 's', 1) for x in (-15.5, 43.5)] + [tab(x, -W-H2, 's', -1) for x in (-15.5, 43.5)]

def rabat(p, q, parent, larg=RABAT):
    (px,py),(qx,qy) = p,q; L = math.hypot(qx-px, qy-py); dx,dy = (qx-px)/L,(qy-py)/L
    biais = min(larg, L / 3)   # bouts en biais (jamais plus d'un tiers du bord : le rabat ne se recoupe pas)
    for n in [(-dy,dx),(dy,-dx)]:
        poly = Polygon([p, q, (qx+n[0]*larg-dx*biais, qy+n[1]*larg-dy*biais), (px+n[0]*larg+dx*biais, py+n[1]*larg+dy*biais)])
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
def pli_languette(t):
    # le pli est parallèle au bord du mur, à PLI_TAB du mur : t est un rectangle collé au mur
    x0, y0, x1, y1 = t.bounds
    if x1 - x0 > y1 - y0:   # languette vers ±w (bord à w constant)
        w0 = y0 if any(abs(y0 - b) < 0.01 for b in (W+H2, -W-H2)) else y1
        w = w0 + PLI_TAB if w0 == y0 else w0 - PLI_TAB
        return ((x0, w), (x1, w))
    s0 = x0 if any(abs(x0 - b) < 0.01 for b in (RB, s_fw)) else x1
    sv = s0 + PLI_TAB if s0 == x0 else s0 - PLI_TAB
    return ((sv, y0), (sv, y1))
plis_languettes = [pli_languette(t) for t in tabs + tabs_flanc]
plis = [((0,-W),(0,W)), ((s_mh,-W),(s_mh,W)), ((s_nh,-20),(s_nh,20)), ((XR,-W),(XR,W)),
        ((0,W),(XR,W)), ((0,-W),(XR,-W)), ((s_fw,20),(s_nh,20)), ((s_fw,-20),(s_nh,-20))] + [r[1] for r in rabats] + plis_languettes

# contrôle : rien ne se chevauche
toutes = list(faces.items()) + [(f'r{i}', r[0]) for i, r in enumerate(rabats)]
for i in range(len(toutes)):
    for j in range(i+1, len(toutes)):
        a = toutes[i][1].intersection(toutes[j][1]).area
        if a > 0.5: print('CHEVAUCHEMENT', toutes[i][0], toutes[j][0], round(a,1))
print('rabats', [round(r[0].area) for r in rabats])
tout = unary_union([f for _,f in toutes] + tabs_flanc).buffer(0.01).buffer(-0.01)
minx, miny, maxx, maxy = tout.bounds; print('encombrement', round(maxx-minx), '×', round(maxy-miny))

PW, PH = 420, 297   # A3 paysage, pour un exemple à afficher
OX, OY = PW/2 - (minx+maxx)/2, PH/2 + 4 - (miny+maxy)/2
T = lambda x, y: (x+OX, y+OY)
def chemin(g):
    def anneau(c): return 'M' + ' L'.join(f'{x+OX:.2f},{y+OY:.2f}' for x,y in c.coords) + ' Z'
    return anneau(g.exterior) + ''.join(anneau(i) for i in g.interiors)
svg = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{PW}mm" height="{PH}mm" viewBox="0 0 {PW} {PH}">',
 '<style>text{font-family:Arial,sans-serif;fill:#000}.c{fill:none;stroke:#000;stroke-width:.5}.p{stroke:#000;stroke-width:.4;stroke-dasharray:2 1.5}.h{fill:url(#h)}.g{fill:#e6e6e6}.t{font-size:6.5px;font-weight:700}.s{font-size:4.2px}.m{font-size:3.4px}</style>',
 '<defs><pattern id="h" width="1.2" height="1.2" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="1.2" stroke="#000" stroke-width=".35"/></pattern></defs>']
for r,_ in rabats: svg.append(f'<path d="{chemin(r)}" class="g"/>')
for t in tabs + tabs_flanc: svg.append(f'<path d="{chemin(t)}" class="h"/>')
svg.append(f'<path d="{chemin(tout)}" class="c" fill-rule="evenodd"/>')
for (a,b) in plis: svg.append(f'<line x1="{a[0]+OX:.2f}" y1="{a[1]+OY:.2f}" x2="{b[0]+OX:.2f}" y2="{b[1]+OY:.2f}" class="p"/>')
def txt(x, y, t, cl='t'): svg.append(f'<text x="{x+OX:.2f}" y="{y+OY:.2f}" class="{cl}" text-anchor="middle">{t}</text>')
txt(66, -20, 'TOIT'); txt(33, 16.5, 'fente du tube', 's'); txt(-26, 2, 'CAPOT'); txt(s_mh - LNH/2, 2, 'NEZ', 's'); txt(s_fw + H0/2, 1.5, 'AVANT', 'm')
txt(30, W + H2/2 + 2, 'CÔTÉ'); txt(30, -W - H2/2 + 4, 'CÔTÉ'); txt(XR + H2/2, -24, 'ARRIÈRE', 's')
txt(s_fw + 6, 20 + LD/2 + 1, 'pan', 'm'); txt(s_fw + 6, -20 - LD/2 + 2, 'pan', 'm')
for x in (-37.5, 61.5): txt(x, W + H2 - 4, 'axe', 'm'); txt(x, -W - H2 + 6.5, 'axe', 'm')
svg.append('<text x="16" y="18" style="font-size:9px;font-weight:700">Patron de carrosserie — voiture à ballon (châssis v8)</text>')
svg.append('<text x="16" y="26" class="s">Imprimer à taille réelle (100 %, A3). Le trait mesure 50 mm :</text><line x1="135" y1="25" x2="185" y2="25" stroke="#000" stroke-width=".6"/>')
leg = [('je découpe', 'c'), ('je plie', 'p')]
Y = PH - 20
svg.append(f'<line x1="16" y1="{Y}" x2="28" y2="{Y}" class="c"/><text x="31" y="{Y+1.5}" class="s">je découpe</text>')
svg.append(f'<line x1="62" y1="{Y}" x2="74" y2="{Y}" class="p"/><text x="77" y="{Y+1.5}" class="s">je plie</text>')
svg.append(f'<rect x="100" y="{Y-2.5}" width="10" height="5" class="g"/><text x="113" y="{Y+1.5}" class="s">rabat : je colle ou j\'agrafe dessous</text>')
svg.append(f'<rect x="185" y="{Y-2.5}" width="10" height="5" class="h"/><text x="198" y="{Y+1.5}" class="s">languette : dans la fente du châssis, pliée et scotchée dessous</text>')
svg.append(f'<text x="16" y="{Y+9}" class="s">Je marque les plis à la règle avant de plier. Le tube du ballon passe dans la fente du toit. Je ne bouche ni la sortie d\'air, ni les roues.</text>')
svg.append('</svg>')
s = '\n'.join(svg)
open('patron.svg','w').write(s)
open('patron.html','w').write('<!doctype html><meta charset="utf-8"><style>@page{size:A3 landscape;margin:0}html,body{margin:0}</style>' + s)

# ---------- Version pour une machine de découpe (Cricut Design Space) ----------
# Pas de texte, pas de hachures, pas de remplissage : un calque « decoupe » (contour fermé + fente du tube) et un
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
  '<title>Patron de carrosserie, voiture à ballon (châssis v8) : découpe et plis</title>',
  '<g id="decoupe" fill="none" stroke="#000000" stroke-width="0.25">'] + [f'<path d="{c}"/>' for c in contours] + ['</g>',
  '<g id="plis" fill="none" stroke="#E11D48" stroke-width="0.25">'] + [f'<line x1="{a[0]+dx:.3f}" y1="{a[1]+dy:.3f}" x2="{b[0]+dx:.3f}" y2="{b[1]+dy:.3f}"/>' for a, b in plis] + ['</g>', '</svg>']
open('patron-carrosserie-cricut.svg', 'w').write('\n'.join(cricut) + '\n')
print('cricut', round(LARG, 1), '×', round(HAUT, 1), 'mm,', len(contours), 'contours,', len(plis), 'plis,', len(net.exterior.coords), 'points')
