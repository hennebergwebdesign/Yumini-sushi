import {
  $, $$, S, type Tisch, type TagDaten, aenderungen, aktionen, ansichten, api, datumsLeiste, esc, hhmm, istAktiv, jetztMin, heuteIso, kannBearbeiten,
  ladeTag, minuten, render, tue, toast,
} from './team-kern';
import { dialogReservierung, tischFrei, tischNamen } from './team-tag';

// Tischplan: Belegung zu einer Uhrzeit, Tische zuweisen, im Bearbeitungsmodus Grundriss und Kombinationen pflegen.
export const P = {
  zeit: null as number | null,
  datum: '',
  neuLaden: true,
  edit: false,
  sel: null as string | null,
  zuweisen: null as { id: string; gewaehlt: Set<string> } | null,
};

function zeitenListe(tag: TagDaten) {
  const out: number[] = [];
  for (const f of [tag.fenster.mittag, tag.fenster.abend]) if (f) for (let m = minuten(f.von); m <= minuten(f.bis); m += 15) out.push(m);
  return out;
}
function standardZeit(tag: TagDaten) {
  const l = zeitenListe(tag);
  if (!l.length) return 18 * 60;
  if (tag.datum === heuteIso()) {
    const jetzt = Math.floor(jetztMin() / 15) * 15;
    return l.find((m) => m >= jetzt) ?? l[l.length - 1];
  }
  const abend = tag.fenster.abend ? minuten(tag.fenster.abend.von) : l[0];
  return abend + 60 <= l[l.length - 1] ? abend + 60 : abend;
}

const aktivBei = (tag: TagDaten, tischId: string, t: number) =>
  tag.reservierungen.find((r) => istAktiv(r.status) && r.tische.includes(tischId) && r.von <= t && t < r.von + r.dauer + r.puffer);
const naechste = (tag: TagDaten, tischId: string, t: number) =>
  tag.reservierungen.filter((r) => istAktiv(r.status) && r.tische.includes(tischId) && r.von > t).sort((a, b) => a.von - b.von)[0];
const gesperrtBei = (tag: TagDaten, tischId: string, t: number, dauer: number) =>
  tag.sperren.some((s) => (!s.tisch_id || s.tisch_id === tischId) && (s.von === null || (s.von < t + dauer && (s.bis ?? 0) > t)));

function tischHtml(tag: TagDaten, t: Tisch, T: number) {
  const r = aktivBei(tag, t.id, T);
  const zu = P.zuweisen ? tag.reservierungen.find((x) => x.id === P.zuweisen!.id) : undefined;
  let klasse = 'frei';
  let inhalt = '';
  if (r) {
    klasse = r.status === 'angekommen' ? 'da' : 'res';
    inhalt = `<span class="gast">${esc(r.name)}</span><span class="info">${r.personen} P. · ${hhmm(r.von)}</span>`;
  } else if (gesperrtBei(tag, t.id, T, tag.einst.dauer)) {
    klasse = 'gesperrt';
    inhalt = '<span class="info">gesperrt</span>';
  } else {
    const n = naechste(tag, t.id, T);
    if (n && n.von - T <= 120) inhalt = `<span class="info">ab ${hhmm(n.von)} ${esc(n.name)}</span>`;
  }
  if (zu) {
    const frei = tischFrei(tag, t.id, zu.von, zu.dauer, zu.puffer, zu.id);
    klasse = P.zuweisen!.gewaehlt.has(t.id) ? 'gewaehlt' : frei ? 'kandidat' : 'dim ' + klasse;
  }
  if (P.edit && P.sel === t.id) klasse += ' sel';
  const r2 = tag.raster;
  return `<button type="button" class="tisch ${t.form} ${klasse}" data-akt="tisch" data-id="${t.id}"
    style="left:${(t.x / r2.b) * 100}%;top:${(t.y / r2.h) * 100}%;width:${(t.b / r2.b) * 100}%;height:${(t.h / r2.h) * 100}%"
    aria-label="Tisch ${esc(t.nr)}, ${t.plaetze} Plätze${r ? ', belegt von ' + esc(r.name) : ''}">
    <span class="nr">${esc(t.nr)}</span><span class="pl">${t.plaetze}</span>${inhalt}</button>`;
}

function seite(tag: TagDaten, T: number) {
  if (P.zuweisen) {
    const r = tag.reservierungen.find((x) => x.id === P.zuweisen!.id)!;
    const ids = [...P.zuweisen.gewaehlt];
    const sum = ids.reduce((a, id) => a + (tag.tische.find((t) => t.id === id)?.plaetze ?? 0), 0);
    return `<h3>Tisch zuweisen</h3>
      <p><strong>${esc(r.name)}</strong>, ${r.personen} Personen, ${hhmm(r.von)} Uhr</p>
      <p class="klein">Grün markierte Tische sind in diesem Zeitraum frei. Für Gruppen mehrere Tische antippen.</p>
      <p>Gewählt: ${ids.length ? esc(tischNamen(tag, ids)) : 'noch kein Tisch'} <span class="${sum < r.personen && ids.length ? 'warnt' : ''}">(${sum} von ${r.personen} Plätzen)</span></p>
      <div class="knopfreihe">
        <button class="knopf primaer" data-akt="zuweisung-speichern" type="button" ${ids.length ? '' : 'disabled'}>Zuweisen</button>
        <button class="knopf" data-akt="zuweisung-abbruch" type="button">Abbrechen</button>
      </div>`;
  }
  if (P.edit) return editSeite(tag);
  const ohne = tag.reservierungen.filter((r) => istAktiv(r.status) && !r.tische.length);
  const belegt = new Set<string>();
  let gaeste = 0;
  for (const r of tag.reservierungen) {
    if (!istAktiv(r.status) || !(r.von <= T && T < r.von + r.dauer + r.puffer)) continue;
    r.tische.forEach((id) => belegt.add(id));
    gaeste += r.personen;
  }
  return `<h3>Um ${hhmm(T)} Uhr</h3>
    <p class="klein">${belegt.size} von ${tag.tische.length} Tischen belegt, ${gaeste} Gäste am Tisch.</p>
    <h3>Ohne Tisch <small>${ohne.length}</small></h3>
    ${ohne.length ? `<ul class="mini">${ohne.map((r) => `<li><span><b>${hhmm(r.von)}</b> ${esc(r.name)}, ${r.personen} P.</span><button class="knopf" data-akt="zuweisen" data-id="${r.id}" type="button">Zuweisen</button></li>`).join('')}</ul>` : '<p class="klein">Alle Reservierungen haben einen Tisch.</p>'}
    <p class="klein">Tisch antippen: belegt öffnet die Reservierung, frei trägt eine neue ein.</p>`;
}

function editSeite(tag: TagDaten) {
  const t = tag.tische.find((x) => x.id === P.sel);
  const kombis = tag.kombinationen;
  return `<h3>Grundriss bearbeiten</h3>
    <p class="klein">Tische per Ziehen verschieben. Raster ${tag.raster.b} × ${tag.raster.h}. Beispieltische sind Testdaten, kein echter Plan.</p>
    <div class="knopfreihe"><button class="knopf" data-akt="tisch-neu" type="button">+ Tisch</button><button class="knopf primaer" data-akt="plan-edit" type="button">Fertig</button></div>
    ${t ? `<form class="tform" data-tform data-id="${t.id}">
        <h4>Tisch ${esc(t.nr)}</h4>
        <label>Nummer<input name="nr" value="${esc(t.nr)}" maxlength="12" required /></label>
        <label>Plätze<input name="plaetze" type="number" min="1" max="30" value="${t.plaetze}" required /></label>
        <label>Form<select name="form"><option value="eckig" ${t.form === 'eckig' ? 'selected' : ''}>Eckig</option><option value="rund" ${t.form === 'rund' ? 'selected' : ''}>Rund</option></select></label>
        <label>Bereich<input name="bereich" value="${esc(t.bereich)}" maxlength="30" /></label>
        <label>Breite<input name="b" type="number" min="2" max="16" value="${t.b}" /></label>
        <label>Höhe<input name="h" type="number" min="2" max="16" value="${t.h}" /></label>
        <div class="knopfreihe"><button class="knopf primaer" type="submit">Speichern</button><button class="knopf gefahr" data-akt="tisch-loeschen" data-id="${t.id}" type="button">Entfernen</button></div>
      </form>` : '<p class="klein">Tisch antippen, um Nummer, Plätze, Form und Größe zu ändern.</p>'}
    <h3>Kombinationen <small>Tische, die sich zusammenstellen lassen</small></h3>
    ${kombis.length ? `<ul class="mini">${kombis.map((c) => `<li><span>${esc(tischNamen(tag, c.tische))} <small>${c.plaetze} Plätze</small></span><button class="knopf leise" data-akt="kombi-loeschen" data-id="${c.id}" type="button" aria-label="Kombination entfernen">×</button></li>`).join('')}</ul>` : '<p class="klein">Noch keine Kombination. Große Gruppen bekommen nur Tische, die hier zusammengefasst sind.</p>'}
    <form data-kombi>
      <div class="chips">${tag.tische.map((x) => `<label class="chip"><input type="checkbox" value="${x.id}" /> <b>${esc(x.nr)}</b> <small>${x.plaetze}</small></label>`).join('')}</div>
      <button class="knopf" type="submit">Kombination speichern</button>
    </form>`;
}

ansichten.plan = {
  titel: 'Tischplan',
  async html() {
    if (P.neuLaden || !S.tag || S.tag.datum !== S.datum) {
      await ladeTag();
      P.neuLaden = false;
    }
    const tag = S.tag!;
    if (P.datum !== S.datum) {
      P.datum = S.datum;
      if (!P.zuweisen) P.zeit = standardZeit(tag);
    }
    const T = P.zeit ?? standardZeit(tag);
    P.zeit = T;
    const liste = zeitenListe(tag);
    if (!liste.includes(T) && liste.length) liste.push(T), liste.sort((a, b) => a - b);
    const leiste = `<span class="zeitwahl"><button class="knopf" data-akt="plan-schritt" data-n="-15" type="button" aria-label="15 Minuten früher">‹</button>
      <label class="sr" for="plan-zeit">Uhrzeit</label>
      <select id="plan-zeit" data-chg="plan-zeit">${liste.map((m) => `<option value="${m}" ${m === T ? 'selected' : ''}>${hhmm(m)} Uhr</option>`).join('')}</select>
      <button class="knopf" data-akt="plan-schritt" data-n="15" type="button" aria-label="15 Minuten später">›</button>
      ${tag.datum === heuteIso() ? '<button class="knopf leise" data-akt="plan-jetzt" type="button">Jetzt</button>' : ''}</span>
      ${kannBearbeiten() ? `<button class="knopf ${P.edit ? 'primaer' : ''}" data-akt="plan-edit" type="button">${P.edit ? 'Bearbeiten beenden' : 'Grundriss bearbeiten'}</button>` : ''}`;
    const leer = !tag.tische.length;
    return `${datumsLeiste(leiste)}
      ${leer ? `<div class="leer"><p>Für diesen Standort sind noch keine Tische angelegt.</p>${kannBearbeiten() ? '<button class="knopf primaer" data-akt="plan-edit" type="button">Tische anlegen</button>' : ''}${S.me.rolle === 'admin' ? ' <button class="knopf" data-akt="beispiel-tische" type="button">Beispieltische (Testdaten)</button>' : ''}</div>` : ''}
      <div class="plan-layout">
        <div class="planwrap">
          <div class="plan ${P.edit ? 'edit' : ''}" data-plan style="aspect-ratio:${tag.raster.b}/${tag.raster.h}">
            ${tag.tische.map((t) => tischHtml(tag, t, T)).join('')}
          </div>
          <ul class="legende" aria-label="Legende"><li><i class="frei"></i>Frei</li><li><i class="res"></i>Reserviert</li><li><i class="da"></i>Angekommen</li><li><i class="gesperrt"></i>Gesperrt</li></ul>
        </div>
        <aside class="seite">${seite(tag, T)}</aside>
      </div>`;
  },
  nach() {
    if (P.edit) ziehen();
  },
};

const neu = async () => {
  P.neuLaden = true;
  await render(true);
};

aenderungen['plan-zeit'] = async (el) => {
  P.zeit = Number(el.value);
  await render(true);
};
aktionen['plan-schritt'] = async (el) => {
  const liste = S.tag ? zeitenListe(S.tag) : [];
  const ziel = (P.zeit ?? 0) + Number(el.dataset.n);
  if (liste.length && ziel >= liste[0] && ziel <= liste[liste.length - 1]) P.zeit = ziel;
  await render(true);
};
aktionen['plan-jetzt'] = async () => {
  P.zeit = Math.floor(jetztMin() / 15) * 15;
  await render(true);
};
aktionen['plan-edit'] = async () => {
  P.edit = !P.edit;
  P.sel = null;
  P.zuweisen = null;
  await render(true);
};

export async function starteZuweisung(id: string) {
  const r = S.tag?.reservierungen.find((x) => x.id === id);
  if (!r) return;
  P.zuweisen = { id, gewaehlt: new Set(r.tische) };
  P.zeit = r.von;
  P.datum = r.datum;
  P.edit = false;
  P.neuLaden = true;
  if (location.hash === '#plan') await render();
  else location.hash = '#plan';
}
aktionen['zuweisen'] = (el) => starteZuweisung(el.dataset.id!);
aktionen['zuweisung-abbruch'] = async () => {
  P.zuweisen = null;
  await render(true);
};
aktionen['zuweisung-speichern'] = async () => {
  const z = P.zuweisen;
  if (!z || !S.tag) return;
  const r = S.tag.reservierungen.find((x) => x.id === z.id)!;
  const ids = [...z.gewaehlt];
  const sum = ids.reduce((a, id) => a + (S.tag!.tische.find((t) => t.id === id)?.plaetze ?? 0), 0);
  const erzwingen = sum < r.personen;
  if (erzwingen && !confirm(`Die Tische haben ${sum} Plätze für ${r.personen} Gäste. Trotzdem zuweisen?`)) return;
  const ok = await tue(() => api(`/api/team/reservierung/${z.id}`, { method: 'PATCH', body: { tischIds: ids, erzwingen } }), 'Tisch zugewiesen.');
  if (ok) P.zuweisen = null;
  await neu();
};

aktionen['tisch'] = async (el) => {
  const tag = S.tag!;
  const t = tag.tische.find((x) => x.id === el.dataset.id)!;
  if (P.zuweisen) {
    const r = tag.reservierungen.find((x) => x.id === P.zuweisen!.id)!;
    const g = P.zuweisen.gewaehlt;
    if (g.has(t.id)) g.delete(t.id);
    else if (tischFrei(tag, t.id, r.von, r.dauer, r.puffer, r.id)) g.add(t.id);
    else toast(`Tisch ${t.nr} ist zu dieser Zeit belegt oder gesperrt.`, 'fehler');
    await render(true);
    return;
  }
  if (P.edit) return; // Auswahl läuft über das Ziehen (pointerup)
  const r = aktivBei(tag, t.id, P.zeit!);
  if (r) await dialogReservierung(r);
  else await dialogReservierung(null, { zeit: P.zeit!, tischIds: [t.id], personen: Math.min(t.plaetze, 4), quelle: 'telefon' });
};
aktionen['beispiel-tische'] = async () => {
  if (await tue(() => api('/api/team/testdaten', { method: 'POST', body: { standort: S.standort, aktion: 'tische' } }), 'Beispieltische angelegt.')) await neu();
};

// --- Bearbeiten ---------------------------------------------------------------------------------------------------
function freierPlatz(tag: TagDaten, b: number, h: number) {
  for (let y = 0; y <= tag.raster.h - h; y++)
    for (let x = 0; x <= tag.raster.b - b; x++) if (!tag.tische.some((t) => x < t.x + t.b && t.x < x + b && y < t.y + t.h && t.y < y + h)) return { x, y };
  return { x: 0, y: 0 };
}
aktionen['tisch-neu'] = async () => {
  const tag = S.tag!;
  const nr = String(Math.max(0, ...tag.tische.map((t) => parseInt(t.nr, 10) || 0)) + 1);
  const p = freierPlatz(tag, 6, 4);
  const r = await tue(() => api<{ id: string }>('/api/team/tische', { method: 'POST', body: { standort: S.standort, nr, plaetze: 4, form: 'eckig', bereich: 'Innen', b: 6, h: 4, ...p } }));
  if (r) P.sel = r.id;
  await neu();
};
aktionen['tisch-loeschen'] = async (el) => {
  const t = S.tag!.tische.find((x) => x.id === el.dataset.id);
  if (!t || !confirm(`Tisch ${t.nr} entfernen?`)) return;
  if (await tue(() => api('/api/team/tische', { method: 'DELETE', body: { id: t.id } }), 'Tisch entfernt.')) P.sel = null;
  await neu();
};
aktionen['kombi-loeschen'] = async (el) => {
  if (await tue(() => api('/api/team/kombinationen', { method: 'DELETE', body: { id: el.dataset.id } }), 'Kombination entfernt.')) await neu();
};

document.addEventListener('submit', async (e) => {
  const f = e.target as HTMLFormElement;
  if (f.matches('[data-tform]')) {
    e.preventDefault();
    const v = Object.fromEntries(new FormData(f).entries());
    if (await tue(() => api('/api/team/tische', { method: 'PATCH', body: { id: f.dataset.id, ...v } }), 'Tisch gespeichert.')) await neu();
  } else if (f.matches('[data-kombi]')) {
    e.preventDefault();
    const ids = $$<HTMLInputElement>('input:checked', f).map((i) => i.value);
    if (await tue(() => api('/api/team/kombinationen', { method: 'POST', body: { standort: S.standort, tische: ids } }), 'Kombination gespeichert.')) await neu();
  }
});

/** Ziehen im Bearbeitungsmodus: Rasterpositionen, gespeichert beim Loslassen. Antippen wählt den Tisch. */
function ziehen() {
  const plan = $<HTMLElement>('[data-plan]');
  const tag = S.tag;
  if (!plan || !tag) return;
  for (const el of $$<HTMLElement>('.tisch', plan)) {
    el.addEventListener('pointerdown', (e) => {
      if (e.button !== 0) return;
      const t = tag.tische.find((x) => x.id === el.dataset.id)!;
      const einheit = plan.clientWidth / tag.raster.b;
      const sx = e.clientX;
      const sy = e.clientY;
      let nx = t.x;
      let ny = t.y;
      let bewegt = false;
      el.setPointerCapture(e.pointerId);
      el.classList.add('zieht');
      const move = (m: PointerEvent) => {
        const dx = Math.round((m.clientX - sx) / einheit);
        const dy = Math.round((m.clientY - sy) / einheit);
        if (Math.abs(m.clientX - sx) + Math.abs(m.clientY - sy) > 4) bewegt = true;
        nx = Math.max(0, Math.min(tag.raster.b - t.b, t.x + dx));
        ny = Math.max(0, Math.min(tag.raster.h - t.h, t.y + dy));
        el.style.left = `${(nx / tag.raster.b) * 100}%`;
        el.style.top = `${(ny / tag.raster.h) * 100}%`;
      };
      const ende = async () => {
        el.removeEventListener('pointermove', move);
        el.removeEventListener('pointerup', ende);
        el.removeEventListener('pointercancel', ende);
        el.classList.remove('zieht');
        if (bewegt && (nx !== t.x || ny !== t.y)) await tue(() => api('/api/team/tische', { method: 'PATCH', body: { id: t.id, x: nx, y: ny } }));
        P.sel = t.id;
        await neu();
      };
      el.addEventListener('pointermove', move);
      el.addEventListener('pointerup', ende);
      el.addEventListener('pointercancel', ende);
    });
  }
}
