// Fichier Excel (.xlsx) sans bibliothèque : un .xlsx est un ZIP de fichiers XML (ici sans compression).
// Repris d'atelier-cereales (ZIP) et complété pour refaire le classeur d'évaluation de Thomas : styles (gras,
// couleurs, retour à la ligne), formules, listes déroulantes, mise en forme conditionnelle, cellules fusionnées,
// volets figés, largeurs de colonnes. Excel recalcule les formules à l'ouverture.
(function (global) {
  'use strict';

  const enNode = typeof module === 'object' && module.exports;
  const S = enNode ? require('./evaluation.js') : global.Segpa;
  const encodeur = new TextEncoder();

  // ---------- ZIP (méthode « stockée ») ----------

  const TABLE_CRC = (() => {
    const t = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      t[n] = c >>> 0;
    }
    return t;
  })();
  function crc32(octets) {
    let c = 0xffffffff;
    for (let i = 0; i < octets.length; i++) c = TABLE_CRC[(c ^ octets[i]) & 0xff] ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
  }

  function zip(fichiers) {
    const morceaux = [];
    const central = [];
    let decalage = 0;
    for (const f of fichiers) {
      const nom = encodeur.encode(f.nom);
      const donnees = typeof f.contenu === 'string' ? encodeur.encode(f.contenu) : f.contenu;
      const crc = crc32(donnees);
      const local = new DataView(new ArrayBuffer(30));
      local.setUint32(0, 0x04034b50, true);
      local.setUint16(4, 20, true);
      local.setUint16(6, 0x0800, true); // noms en UTF-8
      local.setUint16(8, 0, true); // stocké
      local.setUint32(14, crc, true);
      local.setUint32(18, donnees.length, true);
      local.setUint32(22, donnees.length, true);
      local.setUint16(26, nom.length, true);
      morceaux.push(new Uint8Array(local.buffer), nom, donnees);
      const c = new DataView(new ArrayBuffer(46));
      c.setUint32(0, 0x02014b50, true);
      c.setUint16(4, 20, true);
      c.setUint16(6, 20, true);
      c.setUint16(8, 0x0800, true);
      c.setUint32(16, crc, true);
      c.setUint32(20, donnees.length, true);
      c.setUint32(24, donnees.length, true);
      c.setUint16(28, nom.length, true);
      c.setUint32(42, decalage, true);
      central.push(new Uint8Array(c.buffer), nom);
      decalage += 30 + nom.length + donnees.length;
    }
    const tailleCentral = central.reduce((t, m) => t + m.length, 0);
    const fin = new DataView(new ArrayBuffer(22));
    fin.setUint32(0, 0x06054b50, true);
    fin.setUint16(8, fichiers.length, true);
    fin.setUint16(10, fichiers.length, true);
    fin.setUint32(12, tailleCentral, true);
    fin.setUint32(16, decalage, true);
    const tout = [...morceaux, ...central, new Uint8Array(fin.buffer)];
    const sortie = new Uint8Array(tout.reduce((t, m) => t + m.length, 0));
    let i = 0;
    for (const m of tout) {
      sortie.set(m, i);
      i += m.length;
    }
    return sortie;
  }

  // ---------- Classeur ----------

  const xml = (s) =>
    String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '');

  function colonne(n) {
    let s = '';
    for (n += 1; n > 0; n = Math.floor((n - 1) / 26)) s = String.fromCharCode(65 + ((n - 1) % 26)) + s;
    return s;
  }

  // Styles nommés → index dans styles.xml. style : { gras, italique, taille, couleur, fond, retour, centre, bordure, format }
  function tableStyles(styles) {
    const polices = ['<font><sz val="11"/><name val="Calibri"/></font>'];
    const fonds = ['<fill><patternFill patternType="none"/></fill>', '<fill><patternFill patternType="gray125"/></fill>'];
    const bordures = ['<border><left/><right/><top/><bottom/><diagonal/></border>', '<border><left style="thin"><color rgb="FFBFBFBF"/></left><right style="thin"><color rgb="FFBFBFBF"/></right><top style="thin"><color rgb="FFBFBFBF"/></top><bottom style="thin"><color rgb="FFBFBFBF"/></bottom><diagonal/></border>'];
    const formats = [];
    const xfs = ['<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>'];
    const index = {};
    for (const [nom, st] of Object.entries(styles)) {
      polices.push(`<font>${st.gras ? '<b/>' : ''}${st.italique ? '<i/>' : ''}<sz val="${st.taille || 11}"/>${st.couleur ? `<color rgb="FF${st.couleur}"/>` : ''}<name val="Calibri"/></font>`);
      let fill = 0;
      if (st.fond) {
        fonds.push(`<fill><patternFill patternType="solid"><fgColor rgb="FF${st.fond}"/><bgColor indexed="64"/></patternFill></fill>`);
        fill = fonds.length - 1;
      }
      let fmt = 0;
      if (st.format === 'pourcent') fmt = 9;
      else if (st.format) {
        formats.push(st.format);
        fmt = 163 + formats.length;
      }
      const alignement = st.retour || st.centre ? `<alignment${st.centre ? ' horizontal="center"' : ''} vertical="center"${st.retour ? ' wrapText="1"' : ''}/>` : '';
      xfs.push(`<xf numFmtId="${fmt}" fontId="${polices.length - 1}" fillId="${fill}" borderId="${st.bordure ? 1 : 0}" xfId="0" applyFont="1"${fill ? ' applyFill="1"' : ''}${st.bordure ? ' applyBorder="1"' : ''}${fmt ? ' applyNumberFormat="1"' : ''}${alignement ? ' applyAlignment="1"' : ''}>${alignement}</xf>`);
      index[nom] = xfs.length - 1;
    }
    return {
      index,
      xml(dxfs) {
        return (
          '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
          '<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">' +
          (formats.length ? `<numFmts count="${formats.length}">${formats.map((f, i) => `<numFmt numFmtId="${164 + i}" formatCode="${xml(f)}"/>`).join('')}</numFmts>` : '') +
          `<fonts count="${polices.length}">${polices.join('')}</fonts>` +
          `<fills count="${fonds.length}">${fonds.join('')}</fills>` +
          `<borders count="${bordures.length}">${bordures.join('')}</borders>` +
          '<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>' +
          `<cellXfs count="${xfs.length}">${xfs.join('')}</cellXfs>` +
          '<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>' +
          `<dxfs count="${dxfs.length}">${dxfs
            .map((d) => `<dxf><font>${d.gras ? '<b/>' : ''}<color rgb="FF${d.encre}"/></font><fill><patternFill patternType="solid"><fgColor rgb="FF${d.fond}"/><bgColor rgb="FF${d.fond}"/></patternFill></fill></dxf>`)
            .join('')}</dxfs>` +
          '</styleSheet>'
        );
      },
    };
  }

  // feuille : { nom, colonnes: [largeurs], lignes: [[cellule]], hauteurs: { n°: pt }, fusions: ['A1:N1'],
  //             figer: 'D3', listes: [{ plage, valeurs: [] }], conditions: [{ plage, regles: [{ egal, fond, encre }] }] }
  // cellule : texte, nombre, null, ou { v, f (formule sans « = »), s (nom de style) }
  function feuilleXml(f, styles, dxfs) {
    let x =
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">';
    if (f.figer) {
      const m = /^([A-Z]+)(\d+)$/.exec(f.figer);
      const col = m[1].split('').reduce((t, c) => t * 26 + c.charCodeAt(0) - 64, 0) - 1;
      const lig = Number(m[2]) - 1;
      x += `<sheetViews><sheetView workbookViewId="0"><pane${col ? ` xSplit="${col}"` : ''}${lig ? ` ySplit="${lig}"` : ''} topLeftCell="${f.figer}" activePane="bottomRight" state="frozen"/></sheetView></sheetViews>`;
    }
    if (f.colonnes) x += '<cols>' + f.colonnes.map((l, i) => `<col min="${i + 1}" max="${i + 1}" width="${l}" customWidth="1"/>`).join('') + '</cols>';
    x += '<sheetData>';
    f.lignes.forEach((ligne, i) => {
      const n = i + 1;
      const ht = f.hauteurs && f.hauteurs[n];
      x += `<row r="${n}"${ht ? ` ht="${ht}" customHeight="1"` : ''}>`;
      (ligne || []).forEach((cel, j) => {
        if (cel === null || cel === undefined || cel === '') return;
        const o = typeof cel === 'object' ? cel : { v: cel };
        const ref = colonne(j) + n;
        const s = o.s !== undefined ? ` s="${styles.index[o.s]}"` : '';
        if (o.f) x += `<c r="${ref}"${s}${typeof o.v === 'string' ? ' t="str"' : ''}><f>${xml(o.f)}</f></c>`;
        else if (typeof o.v === 'number' && Number.isFinite(o.v)) x += `<c r="${ref}"${s}><v>${o.v}</v></c>`;
        else if (o.v !== undefined && o.v !== null && o.v !== '') x += `<c r="${ref}"${s} t="inlineStr"><is><t xml:space="preserve">${xml(o.v)}</t></is></c>`;
        else if (s) x += `<c r="${ref}"${s}/>`;
      });
      x += '</row>';
    });
    x += '</sheetData>';
    if (f.fusions && f.fusions.length) x += `<mergeCells count="${f.fusions.length}">${f.fusions.map((r) => `<mergeCell ref="${r}"/>`).join('')}</mergeCells>`;
    let priorite = 1;
    for (const c of f.conditions || []) {
      x += `<conditionalFormatting sqref="${c.plage}">`;
      for (const r of c.regles) {
        dxfs.push({ fond: r.fond, encre: r.encre, gras: r.gras });
        x += `<cfRule type="cellIs" dxfId="${dxfs.length - 1}" priority="${priorite++}" operator="equal"><formula>"${xml(r.egal)}"</formula></cfRule>`;
      }
      x += '</conditionalFormatting>';
    }
    if (f.listes && f.listes.length)
      x += `<dataValidations count="${f.listes.length}">${f.listes
        .map((l) => `<dataValidation type="list" allowBlank="1" showErrorMessage="1" sqref="${l.plage}"><formula1>"${xml(l.valeurs.join(','))}"</formula1></dataValidation>`)
        .join('')}</dataValidations>`;
    x += '<pageMargins left="0.5" right="0.5" top="0.6" bottom="0.6" header="0.3" footer="0.3"/>';
    if (f.paysage) x += '<pageSetup orientation="landscape" fitToWidth="1" fitToHeight="0"/>';
    return x + '</worksheet>';
  }

  function classeur(feuilles, styles) {
    const st = tableStyles(styles || {});
    const dxfs = [];
    const xmlFeuilles = feuilles.map((f) => feuilleXml(f, st, dxfs));
    const nomFeuille = (n) => xml(String(n).replace(/[\\/?*[\]:]/g, ' ').slice(0, 31));
    const fichiers = [
      {
        nom: '[Content_Types].xml',
        contenu:
          '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
          '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
          '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
          '<Default Extension="xml" ContentType="application/xml"/>' +
          '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>' +
          '<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>' +
          feuilles.map((_, i) => `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join('') +
          '</Types>',
      },
      {
        nom: '_rels/.rels',
        contenu:
          '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
          '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
          '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>' +
          '</Relationships>',
      },
      {
        nom: 'xl/workbook.xml',
        contenu:
          '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
          '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">' +
          '<sheets>' +
          feuilles.map((f, i) => `<sheet name="${nomFeuille(f.nom)}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`).join('') +
          '</sheets><calcPr calcId="191029" fullCalcOnLoad="1"/></workbook>',
      },
      {
        nom: 'xl/_rels/workbook.xml.rels',
        contenu:
          '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
          '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
          feuilles.map((_, i) => `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`).join('') +
          `<Relationship Id="rId${feuilles.length + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>` +
          '</Relationships>',
      },
      ...xmlFeuilles.map((contenu, i) => ({ nom: `xl/worksheets/sheet${i + 1}.xml`, contenu })),
      { nom: 'xl/styles.xml', contenu: st.xml(dxfs) },
    ];
    return zip(fichiers);
  }

  // ---------- Le classeur d'évaluation (même organisation que Evaluation_projet_demontage.xlsx) ----------
  // Évaluation · Synthèse classe · Légende · Référentiel compétences · Pronote. Corrections demandées
  // (cahier des charges §8.5) : la ligne d'exemple est dans la légende (grise, en italique) et n'entre pas dans la
  // synthèse ; une ligne vide n'est plus comptée (formules protégées) ; onglet Pronote ajouté.
  const STYLES = {
    titre: { gras: true, taille: 14, couleur: 'FFFFFF', fond: '1E4E70', centre: true },
    entete: { gras: true, taille: 10, couleur: 'FFFFFF', fond: '2C6E9E', centre: true, retour: true, bordure: true },
    texte: { bordure: true },
    centre: { bordure: true, centre: true },
    gras: { gras: true },
    retour: { retour: true },
    commentaire: { bordure: true, retour: true },
    exemple: { italique: true, couleur: '7F7F7F', fond: 'F2F2F2', bordure: true, centre: true },
    pourcent: { format: 'pourcent', bordure: true, centre: true },
    note: { italique: true, couleur: '595959', retour: true },
  };

  function classeurEvaluation(lignes, def, options) {
    const o = options || {};
    const crit = def.criteres;
    const nb = crit.length;
    const max = nb * 3;
    const N = S.NIVEAUX;
    const noms = N.map((n) => n.nom);
    const lettre = (i) => colonne(i);
    const c1 = 3; // première colonne des critères (D)
    const cScore = lettre(c1 + nb);
    const cNote = lettre(c1 + nb + 1);
    const cApp = lettre(c1 + nb + 2);
    const cCom = lettre(c1 + nb + 3);
    const dernier = lettre(c1 + nb + 3);
    const n = Math.max(lignes.length, 16);
    const fin = n + 2;
    const plageCrit = (r) => `${lettre(c1)}${r}:${lettre(c1 + nb - 1)}${r}`;
    const app = (ref) => `IF(${ref}="","",IF(${ref}>=16,"Très satisfaisant",IF(${ref}>=12,"Satisfaisant",IF(${ref}>=8,"Fragile","Insuffisant"))))`;
    const couleursNiveaux = N.map((x) => ({ egal: x.nom, fond: x.fond, encre: x.encre })).reverse();
    const couleursApp = S.APPRECIATIONS.map((a) => ({ egal: a.nom, fond: N[a.niveau].fond, encre: N[a.niveau].encre }));

    const eval_ = [[{ v: def.titreExcel || 'ÉVALUATION', s: 'titre' }], ['N°', 'Prénom', 'Binôme', ...crit.map((c) => c.entete), `Score brut\n(/${max})`, 'Note /20', 'Appréciation', 'Commentaire'].map((v) => ({ v, s: 'entete' }))];
    for (let i = 0; i < n; i++) {
      const r = i + 3;
      const l = lignes[i];
      const score = N.map((x) => `COUNTIF(${plageCrit(r)},"${x.nom}")*${x.valeur}`).join('+');
      eval_.push([
        { v: i + 1, s: 'centre' },
        { v: l ? l.eleve : '', s: 'texte' },
        { v: l ? l.binome : '', s: 'texte' },
        ...crit.map((c) => ({ v: l && Number.isInteger(l.niveaux[c.id]) ? N[l.niveaux[c.id]].nom : '', s: 'centre' })),
        { f: `IF(COUNTA(${plageCrit(r)})=0,"",${score})`, v: 0, s: 'centre' },
        { f: `IF(${cScore}${r}="","",ROUND(${cScore}${r}/${max}*20,1))`, v: 0, s: 'centre' },
        { f: app(`${cNote}${r}`), v: '', s: 'centre' },
        { v: l ? l.commentaire : '', s: 'commentaire' },
      ]);
    }

    const ref = (col) => `'Évaluation'!$${col}$3:$${col}$${fin}`;
    const synthese = [
      [{ v: 'SYNTHÈSE DE CLASSE', s: 'titre' }],
      [],
      ['Moyenne de classe /20', { f: `IFERROR(ROUND(AVERAGE(${ref(cNote)}),1),"")`, v: 0, s: 'centre' }],
      ['Note la plus haute', { f: `IF(COUNT(${ref(cNote)})=0,"",MAX(${ref(cNote)}))`, v: 0, s: 'centre' }],
      ['Note la plus basse', { f: `IF(COUNT(${ref(cNote)})=0,"",MIN(${ref(cNote)}))`, v: 0, s: 'centre' }],
      [],
      ['Appréciation', "Nombre d'élèves", '% des élèves évalués'].map((v) => ({ v, s: 'entete' })),
      ...S.APPRECIATIONS.map((a, i) => [{ v: a.nom, s: 'centre' }, { f: `COUNTIF(${ref(cApp)},"${a.nom}")`, v: 0, s: 'centre' }, { f: `IF($B$12=0,0,B${8 + i}/$B$12)`, v: 0, s: 'pourcent' }]),
      [{ v: 'Total élèves évalués', s: 'gras' }, { f: 'SUM(B8:B11)', v: 0, s: 'centre' }],
    ];

    const exemple = ['Ex.', 'Prénom', 'Binôme', 'Jaune', 'Vert clair', 'Vert clair', 'Jaune', 'Vert foncé', 'Vert clair', 'Vert clair'].slice(0, 3 + nb);
    const legende = [
      [{ v: "LÉGENDE ET MODE D'EMPLOI", s: 'titre' }],
      [],
      [{ v: 'Colonnes à remplir', s: 'gras' }, { v: `Prénom, Binôme, et les ${nb} colonnes de critères (menu déroulant : ${noms.join(' / ')}).`, s: 'retour' }],
      [{ v: 'Barème des couleurs', s: 'gras' }, { v: N.map((x) => `${x.nom} = ${x.valeur} pt${x.valeur > 1 ? 's' : ''}`).join(' · ') + ' (par critère).', s: 'retour' }],
      [{ v: 'Colonnes automatiques', s: 'gras' }, { v: `"Score brut /${max}", "Note /20" et "Appréciation" se calculent seules — ne pas écrire dedans. Une ligne sans aucune couleur n'est pas comptée.`, s: 'retour' }],
      [{ v: 'Calcul de la note', s: 'gras' }, { v: `Score brut = somme des points sur les ${nb} critères (max ${max}). Note /20 = Score brut ÷ ${max} × 20, arrondie à 0,1 près.`, s: 'retour' }],
      [{ v: 'Très satisfaisant', s: 'gras' }, 'Note ≥ 16/20.'],
      [{ v: 'Satisfaisant', s: 'gras' }, 'Note entre 12 et 15,9/20.'],
      [{ v: 'Fragile', s: 'gras' }, 'Note entre 8 et 11,9/20.'],
      [{ v: 'Insuffisant', s: 'gras' }, 'Note < 8/20.'],
      [{ v: 'Ceinture (élèves)', s: 'gras' }, { v: `Niveau du critère « ${(crit.find((c) => c.id === def.critereCeinture) || {}).libelle || ''} » : ${N.map((x, i) => `${x.nom} → ${def.ceintures[i]}`).join(' · ')}. Les élèves voient la ceinture, jamais la note.`, s: 'retour' }],
      [{ v: 'Carnet de classe', s: 'gras' }, { v: 'Le Carnet recalcule sa propre note (moyenne des niveaux 1 à 4 × 5) : elle peut différer de la note de ce fichier, qui reste la note de référence.', s: 'retour' }],
      [{ v: "Ligne d'exemple", s: 'gras' }, { v: 'La ligne ci-dessous (grise, en italique) montre le remplissage attendu. Elle est sur cette feuille : elle ne compte jamais dans la synthèse.', s: 'retour' }],
      [],
      exemple.map((v) => ({ v, s: 'exemple' })),
    ];

    const referentiel = [
      [{ v: 'RÉFÉRENTIEL — LIEN AVEC LE PROGRAMME CYCLE 3', s: 'titre' }],
      [],
      ['Critère évalué', 'Compétence travaillée (sciences et technologie, cycle 3)', 'Domaine du socle commun'].map((v) => ({ v, s: 'entete' })),
      ...crit.map((c) => [{ v: (c.seance ? c.seance + ' - ' : '') + c.libelle, s: 'commentaire' }, { v: c.competence, s: 'commentaire' }, { v: c.domaine, s: 'commentaire' }]),
      [],
      [{ v: o.noteReferentiel || 'Rattachement validé par le professeur (28/10/2026). Libellés à vérifier sur Éduscol ; nouveau programme de cycle 3 pour la 6e annoncé à la rentrée 2027.', s: 'note' }],
    ];

    const pronote = [
      [{ v: 'PRONOTE — NIVEAUX DE MAÎTRISE', s: 'titre' }],
      [],
      ['Prénom', ...crit.map((c) => c.libelle)].map((v) => ({ v, s: 'entete' })),
    ];
    for (let i = 0; i < n; i++) {
      const r = i + 3;
      const conv = (cel) => `IF(${cel}="","",IF(${cel}="${N[0].nom}","${N[0].pronote}",IF(${cel}="${N[1].nom}","${N[1].pronote}",IF(${cel}="${N[2].nom}","${N[2].pronote}",IF(${cel}="${N[3].nom}","${N[3].pronote}","")))))`;
      pronote.push([{ f: `IF('Évaluation'!B${r}="","",'Évaluation'!B${r})`, v: '', s: 'texte' }, ...crit.map((c, j) => ({ f: conv(`'Évaluation'!${lettre(c1 + j)}${r}`), v: '', s: 'centre' }))]);
    }
    pronote.push([], [{ v: 'Correspondance : ' + N.map((x) => `${x.nom} → ${x.pronote}`).join(' · '), s: 'note' }]);

    return classeur(
      [
        {
          nom: 'Évaluation',
          colonnes: [5, 16, 12, ...crit.map(() => 24), 10, 10, 16, 30],
          lignes: eval_,
          hauteurs: { 1: 26, 2: 48 },
          fusions: [`A1:${dernier}1`],
          figer: 'D3',
          listes: [{ plage: `${lettre(c1)}3:${lettre(c1 + nb - 1)}${fin}`, valeurs: noms }],
          conditions: [...crit.map((_, j) => ({ plage: `${lettre(c1 + j)}3:${lettre(c1 + j)}${fin}`, regles: couleursNiveaux })), { plage: `${cApp}3:${cApp}${fin}`, regles: couleursApp }],
          paysage: true,
        },
        { nom: 'Synthèse classe', colonnes: [26, 18, 20], lignes: synthese, fusions: ['A1:C1'], conditions: S.APPRECIATIONS.map((a, i) => ({ plage: `A${8 + i}`, regles: [couleursApp[i]] })) },
        { nom: 'Légende', colonnes: [24, 80, 12, 12, 12, 12, 12, 12, 12, 12], lignes: legende, fusions: ['A1:B1'], conditions: [{ plage: `D15:${lettre(2 + nb)}15`, regles: couleursNiveaux }] },
        { nom: 'Référentiel compétences', colonnes: [40, 46, 46], lignes: referentiel, fusions: ['A1:C1', `A${crit.length + 5}:C${crit.length + 5}`], hauteurs: { 3: 30 } },
        { nom: 'Pronote', colonnes: [16, ...crit.map(() => 22)], lignes: pronote, fusions: [`A1:${lettre(nb)}1`], hauteurs: { 3: 45 }, figer: 'B4' },
      ],
      STYLES
    );
  }

  Object.assign(S, { zip, classeur, classeurEvaluation, colonneExcel: colonne });
  if (enNode) module.exports = S;
})(typeof window !== 'undefined' ? window : globalThis);
