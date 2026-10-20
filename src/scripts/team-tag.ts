import {
  $, $$, S, type TagDaten, type Res, aenderungen, aktionen, ansichten, api, datumsLeiste, dialog, esc, hhmm, istAktiv, jetztMin, heuteIso,
  ladeTag, minuten, QUELLE_TEXT, render, schliesse, STATUS_TEXT, tue, toast, type Status,
} from './team-kern';

// --- Belegung auf dem Client (nur Anzeige, der Server prüft jede Buchung selbst) ---------------------------------
export function tischFrei(tag: TagDaten, tischId: string, von: number, dauer: number, puffer: number, ausser?: string) {
  for (const r of tag.reservierungen) {
    if (r.id === ausser || !istAktiv(r.status) || !r.tische.includes(tischId)) continue;
    if (r.von < von + dauer + puffer && von < r.von + r.dauer + r.puffer) return false;
  }
  for (const s of tag.sperren) {
    if (s.tisch_id && s.tisch_id !== tischId) continue;
    if (s.von === null || s.bis === null) return false;
    if (s.von < von + dauer && s.bis > von) return false;
  }
  return true;
}

export const tischNamen = (tag: TagDaten, ids: string[]) => ids.map((id) => tag.tische.find((t) => t.id === id)?.nr ?? '?').join(' + ');

// --- Tagesansicht ------------------------------------------------------------------------------------------------
function auslastung(tag: TagDaten) {
  const starts = tag.startzeiten.map((s) => minuten(s.t));
  if (!starts.length) return '';
  const kap = tag.tische.reduce((a, t) => a + t.plaetze, 0) || 1;
  const von = Math.floor(Math.min(...starts) / 60) * 60;
  const bis = Math.ceil((Math.max(...starts) + tag.einst.dauer) / 60) * 60;
  let bars = '';
  let max = 0;
  for (let m = von; m < bis; m += 15) {
    const g = tag.reservierungen.filter((r) => istAktiv(r.status) && r.von <= m && m < r.von + r.dauer).reduce((a, r) => a + r.personen, 0);
    max = Math.max(max, g);
    bars += `<i style="--h:${Math.min(100, Math.round((g / kap) * 100))}%" class="${g > kap ? 'voll' : ''}" title="${hhmm(m)} Uhr, ${g} Gäste von ${kap} Plätzen"></i>`;
  }
  const ticks = [];
  for (let m = von; m < bis; m += 60) ticks.push(`<span>${hhmm(m)}</span>`);
  return `<section class="ausl" aria-label="Auslastung nach Uhrzeit">
    <h3>Besetzte Plätze <small>von ${kap}, Spitze ${max}</small></h3>
    <div class="bars" style="--n:${(bis - von) / 15}">${bars}</div>
    <div class="ticks" style="--n:${(bis - von) / 60}">${ticks.join('')}</div>
  </section>`;
}

function zeile(r: Res, tag: TagDaten, heute: boolean, jetzt: number) {
  const aktiv = istAktiv(r.status);
  const ohne = aktiv && r.tische.length === 0;
  const ueberfaellig = heute && r.status === 'bestaetigt' && jetzt > r.von + 15;
  const knoepfe =
    r.status === 'bestaetigt'
      ? `<button class="knopf primaer" data-akt="status" data-id="${r.id}" data-s="angekommen" type="button">Angekommen</button>
         <button class="knopf" data-akt="status" data-id="${r.id}" data-s="nicht_erschienen" data-frage="Als nicht erschienen markieren? Der Tisch wird frei." type="button">Nicht erschienen</button>
         <button class="knopf leise" data-akt="status" data-id="${r.id}" data-s="storniert" data-frage="Reservierung stornieren? Der Tisch wird frei." type="button">Stornieren</button>`
      : r.status === 'angekommen'
        ? `<button class="knopf primaer" data-akt="status" data-id="${r.id}" data-s="abgeschlossen" type="button">Fertig, Tisch frei</button>`
        : `<button class="knopf leise" data-akt="status" data-id="${r.id}" data-s="bestaetigt" type="button">Wieder öffnen</button>`;
  return `<li class="res st-${r.status}${ohne ? ' ohne' : ''}">
    <div class="zeit">${hhmm(r.von)}<small>bis ${hhmm(r.von + r.dauer)}</small></div>
    <div class="wer">
      <strong>${esc(r.name)}</strong>
      <span class="meta">${r.personen} ${r.personen === 1 ? 'Person' : 'Personen'}
        · ${aktiv ? (ohne ? '<span class="badge warn">Tisch offen</span>' : `Tisch ${esc(tischNamen(tag, r.tische))}`) : ''}
        <span class="badge q-${r.quelle}">${QUELLE_TEXT[r.quelle]}</span>
        <span class="badge s-${r.status}">${STATUS_TEXT[r.status]}</span>
        ${ueberfaellig ? '<span class="badge warn">noch nicht da</span>' : ''}
      </span>
      ${r.telefon ? `<span class="meta"><a href="tel:${esc(r.telefon.replace(/[^\d+]/g, ''))}">${esc(r.telefon)}</a>${r.mail ? ` · ${esc(r.mail)}` : ''}</span>` : ''}
      ${r.anmerkung ? `<span class="anm">${esc(r.anmerkung)}</span>` : ''}
      ${r.intern ? `<span class="anm intern">Notiz: ${esc(r.intern)}</span>` : ''}
    </div>
    <div class="aktionen">
      ${knoepfe}
      ${ohne ? `<button class="knopf" data-akt="zuweisen" data-id="${r.id}" type="button">Tisch zuweisen</button>` : ''}
      <button class="knopf leise" data-akt="bearbeiten" data-id="${r.id}" type="button">Bearbeiten</button>
    </div>
  </li>`;
}

ansichten.tag = {
  titel: 'Tag',
  async html() {
    const tag = await ladeTag();
    const heute = S.datum === heuteIso();
    const jetzt = jetztMin();
    const alle = tag.reservierungen;
    const aktiv = alle.filter((r) => istAktiv(r.status));
    const gaeste = aktiv.reduce((a, r) => a + r.personen, 0);
    const erwartet = aktiv.filter((r) => r.status === 'bestaetigt');
    const ohne = aktiv.filter((r) => !r.tische.length).length;
    const sichtbar = alle.filter((r) => S.filterErledigt || istAktiv(r.status));
    const versteckt = alle.length - alle.filter((r) => istAktiv(r.status)).length;
    const gruppe = (a: Res[], titel: string) =>
      a.length ? `<h3 class="gruppe">${titel}</h3><ul class="liste">${a.map((r) => zeile(r, tag, heute, jetzt)).join('')}</ul>` : '';
    const mittag = sichtbar.filter((r) => r.von < 16 * 60);
    const abend = sichtbar.filter((r) => r.von >= 16 * 60);
    return `${datumsLeiste(`<button class="knopf primaer" data-akt="neu" type="button">+ Reservierung</button>
        <button class="knopf" data-akt="neu-laufkunde" type="button">+ Laufkundschaft</button>`)}
      <div class="kennzahlen">
        <div><b>${aktiv.length}</b><span>Reservierungen</span></div>
        <div><b>${gaeste}</b><span>Gäste</span></div>
        <div><b>${erwartet.length}</b><span>noch erwartet</span></div>
        <div class="${ohne ? 'warn' : ''}"><b>${ohne}</b><span>ohne Tisch</span></div>
      </div>
      ${auslastung(tag)}
      ${tag.sperren.length ? `<div class="hinweisband">${tag.sperren.map((s) => `Gesperrt${s.von !== null ? ` ${hhmm(s.von)} bis ${hhmm(s.bis!)}` : ' (ganzer Tag)'}${s.tisch_id ? `, Tisch ${esc(tischNamen(tag, [s.tisch_id]))}` : ''}${s.grund ? `: ${esc(s.grund)}` : ''}`).join('<br />')}</div>` : ''}
      <label class="schalter"><input type="checkbox" data-chg="erledigt" ${S.filterErledigt ? 'checked' : ''} /> Erledigte, stornierte und nicht erschienene anzeigen (${versteckt})</label>
      ${sichtbar.length ? gruppe(mittag, 'Mittag') + gruppe(abend, 'Abend') : `<p class="leer">${tag.geschlossen ? 'An diesem Tag ist geschlossen.' : 'Keine Reservierungen für diesen Tag.'}</p>`}`;
  },
};

aenderungen['erledigt'] = async (el) => {
  S.filterErledigt = (el as HTMLInputElement).checked;
  await render(true);
};

aktionen['status'] = async (el) => {
  const { id, s, frage } = el.dataset as { id: string; s: Status; frage?: string };
  if (frage && !confirm(frage)) return;
  const r = await tue(() => api(`/api/team/reservierung/${id}`, { method: 'PATCH', body: { status: s } }));
  if (r) await render(true);
};
aktionen['neu'] = () => dialogReservierung(null);
aktionen['neu-laufkunde'] = () => dialogReservierung(null, { quelle: 'laufkunde', personen: 2 });
aktionen['bearbeiten'] = (el) => {
  const r = S.tag?.reservierungen.find((x) => x.id === el.dataset.id);
  if (r) return dialogReservierung(r);
};

// --- Dialog Reservierung -----------------------------------------------------------------------------------------
type Vorgabe = { zeit?: number; tischIds?: string[]; personen?: number; quelle?: 'telefon' | 'laufkunde'; datum?: string };

export async function dialogReservierung(r: Res | null, vor: Vorgabe = {}) {
  let datum = r?.datum ?? vor.datum ?? S.datum;
  let tag: TagDaten = S.tag && S.tag.datum === datum ? S.tag : await api<TagDaten>(`/api/team/tag?standort=${S.standort}&datum=${datum}`);
  const neu = !r;
  const quelle = r?.quelle ?? vor.quelle ?? 'telefon';
  const laufkunde = quelle === 'laufkunde';
  const sollModus = vor.tischIds?.length ? 'manuell' : neu ? 'auto' : 'behalten';
  const d = dialog(
    `<form method="dialog" class="dlg" novalidate>
      <h2>${neu ? (laufkunde ? 'Laufkundschaft eintragen' : 'Reservierung eintragen') : 'Reservierung bearbeiten'}</h2>
      <div class="raster2">
        <label>Datum<input type="date" name="datum" value="${datum}" required /></label>
        <label>Uhrzeit<select name="zeit"></select></label>
        <label>Personen<input type="number" name="personen" min="1" max="60" value="${r?.personen ?? vor.personen ?? 2}" inputmode="numeric" required /></label>
        ${neu ? `<label>Art<select name="quelle"><option value="telefon" ${!laufkunde ? 'selected' : ''}>Telefonisch</option><option value="laufkunde" ${laufkunde ? 'selected' : ''}>Laufkundschaft</option></select></label>` : `<label>Herkunft<input value="${QUELLE_TEXT[r!.quelle]}" disabled /></label>`}
      </div>
      <div class="raster2">
        <label>Name<input name="name" value="${esc(r?.name ?? '')}" autocomplete="off" ${laufkunde ? 'placeholder="optional"' : 'required'} /></label>
        <label>Telefon<input name="telefon" type="tel" value="${esc(r?.telefon ?? '')}" autocomplete="off" /></label>
        <label class="breit">E-Mail<input name="mail" type="email" value="${esc(r?.mail ?? '')}" autocomplete="off" /></label>
        <label class="breit">Anmerkung des Gastes<input name="anmerkung" value="${esc(r?.anmerkung ?? '')}" placeholder="Kinderstuhl, Geburtstag, Allergie" maxlength="300" /></label>
        <label class="breit">Interne Notiz<input name="intern" value="${esc(r?.intern ?? '')}" placeholder="Nur für das Team" maxlength="300" /></label>
      </div>
      <fieldset class="tischwahl">
        <legend>Tischvergabe</legend>
        <label class="radio"><input type="radio" name="tischmodus" value="auto" ${sollModus === 'auto' ? 'checked' : ''} /> Automatisch, kleinster passender Tisch</label>
        ${neu ? '' : `<label class="radio"><input type="radio" name="tischmodus" value="behalten" ${sollModus === 'behalten' ? 'checked' : ''} /> Beibehalten${r!.tische.length ? ` (Tisch ${esc(tischNamen(tag, r!.tische))})` : ' (noch ohne Tisch)'}</label>`}
        <label class="radio"><input type="radio" name="tischmodus" value="manuell" ${sollModus === 'manuell' ? 'checked' : ''} /> Tische selbst wählen</label>
        <label class="radio"><input type="radio" name="tischmodus" value="ohne" /> Ohne Tisch speichern, später zuweisen</label>
        <div class="tischliste" data-tischliste hidden></div>
        <label class="hinweis-zwang" data-zwang hidden><input type="checkbox" name="erzwingen" /> Die gewählten Tische haben weniger Plätze als Gäste. Trotzdem zuweisen.</label>
      </fieldset>
      <p class="fehler" data-dfehler role="alert" hidden></p>
      <div class="knopfreihe">
        <button class="knopf primaer" type="submit">${neu ? 'Eintragen' : 'Speichern'}</button>
        <button class="knopf" type="button" data-schliessen>Abbrechen</button>
      </div>
    </form>`,
    'gross',
  );
  const f = d.querySelector<HTMLFormElement>('form')!;
  const el = (n: string) => f.elements.namedItem(n) as HTMLInputElement & HTMLSelectElement;
  const fehlerBox = $<HTMLElement>('[data-dfehler]', d)!;
  const liste = $<HTMLElement>('[data-tischliste]', d)!;
  const wahl = new Set<string>(r?.tische ?? vor.tischIds ?? []);
  const modus = () => (f.querySelector('input[name=tischmodus]:checked') as HTMLInputElement)?.value ?? 'auto';
  const personen = () => Math.max(1, Number(el('personen').value) || 1);
  const dauer = r?.dauer ?? tag.einst.dauer;
  const puffer = r?.puffer ?? tag.einst.puffer;

  const zeitenLaden = async () => {
    const aktuell = el('zeit').value || (r ? hhmm(r.von) : vor.zeit !== undefined ? hhmm(vor.zeit) : '');
    let zeiten: { t: string; gruppe: string; frei: boolean }[] = [];
    try {
      zeiten = (await api<{ zeiten: typeof zeiten }>(`/api/team/reservierung?standort=${S.standort}&datum=${datum}&personen=${personen()}`)).zeiten;
    } catch {
      /* Auswahl bleibt leer */
    }
    const opts: string[] = [];
    if (datum === heuteIso()) opts.push(`<option value="${hhmm(jetztMin())}">Jetzt (${hhmm(jetztMin())})</option>`);
    const hat = new Set(zeiten.map((z) => z.t));
    if (aktuell && !hat.has(aktuell) && !(datum === heuteIso() && aktuell === hhmm(jetztMin()))) opts.push(`<option value="${aktuell}">${aktuell} Uhr</option>`);
    for (const g of ['Mittag', 'Abend']) {
      const teil = zeiten.filter((z) => z.gruppe === g);
      if (teil.length) opts.push(`<optgroup label="${g}">${teil.map((z) => `<option value="${z.t}">${z.t} Uhr${z.frei ? '' : ' (voll)'}</option>`).join('')}</optgroup>`);
    }
    el('zeit').innerHTML = opts.join('') || '<option value="">Keine Zeiten</option>';
    if (aktuell) el('zeit').value = aktuell;
    if (!el('zeit').value && zeiten.length) el('zeit').value = (zeiten.find((z) => z.frei) ?? zeiten[0]).t;
    tischeZeigen();
  };

  const tischeZeigen = () => {
    const manuell = modus() === 'manuell';
    liste.hidden = !manuell;
    f.querySelector<HTMLElement>('[data-zwang]')!.hidden = true;
    if (!manuell) return;
    const von = minuten(el('zeit').value || '0:0');
    liste.innerHTML = tag.tische
      .map((t) => {
        const frei = tischFrei(tag, t.id, von, dauer, puffer, r?.id);
        return `<label class="chip ${frei ? '' : 'belegt'}"><input type="checkbox" value="${t.id}" ${wahl.has(t.id) ? 'checked' : ''} ${frei ? '' : 'disabled'} /> <b>${esc(t.nr)}</b> <small>${t.plaetze} Pl.${t.bereich ? ', ' + esc(t.bereich) : ''}${frei ? '' : ', belegt'}</small></label>`;
      })
      .join('');
    pruefeSumme();
  };
  const pruefeSumme = () => {
    const sum = [...wahl].reduce((a, id) => a + (tag.tische.find((t) => t.id === id)?.plaetze ?? 0), 0);
    f.querySelector<HTMLElement>('[data-zwang]')!.hidden = !(modus() === 'manuell' && wahl.size > 0 && sum < personen());
  };

  f.addEventListener('change', async (e) => {
    const t = e.target as HTMLInputElement;
    if (t.name === 'datum' && /^\d{4}-\d{2}-\d{2}$/.test(t.value)) {
      datum = t.value;
      tag = await api<TagDaten>(`/api/team/tag?standort=${S.standort}&datum=${datum}`);
      wahl.clear();
      await zeitenLaden();
    } else if (t.name === 'personen') await zeitenLaden();
    else if (t.name === 'zeit' || t.name === 'tischmodus') tischeZeigen();
    else if (t.type === 'checkbox' && liste.contains(t)) {
      if (t.checked) wahl.add(t.value);
      else wahl.delete(t.value);
      pruefeSumme();
    }
  });
  $('[data-schliessen]', d)!.addEventListener('click', schliesse);
  f.addEventListener('submit', async (e) => {
    e.preventDefault();
    fehlerBox.hidden = true;
    const m = modus();
    const body: Record<string, unknown> = {
      standort: S.standort,
      datum,
      zeit: el('zeit').value,
      personen: personen(),
      name: el('name').value,
      telefon: el('telefon').value,
      mail: el('mail').value,
      anmerkung: el('anmerkung').value,
      intern: el('intern').value,
      erzwingen: el('erzwingen').checked,
    };
    if (!body.zeit) return zeigeFehler('Bitte eine Uhrzeit wählen.');
    if (neu) {
      body.quelle = el('quelle').value;
      if (m === 'ohne') body.tischmodus = 'ohne';
      if (m === 'manuell') body.tischIds = [...wahl];
      if (m === 'manuell' && !wahl.size) return zeigeFehler('Bitte mindestens einen Tisch wählen.');
    } else {
      if (m === 'ohne') body.tischmodus = 'ohne';
      else if (m === 'manuell') {
        if (!wahl.size) return zeigeFehler('Bitte mindestens einen Tisch wählen.');
        body.tischIds = [...wahl];
      } else if (m === 'auto') body.neuSuchen = true;
    }
    try {
      if (neu) await api('/api/team/reservierung', { method: 'POST', body });
      else await api(`/api/team/reservierung/${r!.id}`, { method: 'PATCH', body });
    } catch (x) {
      return zeigeFehler(x instanceof Error ? x.message : 'Fehler');
    }
    schliesse();
    toast(neu ? 'Reservierung eingetragen.' : 'Gespeichert.');
    S.datum = datum;
    await render(true);
  });
  const zeigeFehler = (t: string) => {
    fehlerBox.textContent = t;
    fehlerBox.hidden = false;
  };
  await zeitenLaden();
  if (!neu || vor.zeit !== undefined) {
    if (vor.zeit !== undefined && !$$('option', el('zeit') as HTMLElement).some((o) => (o as HTMLOptionElement).value === hhmm(vor.zeit!))) {
      el('zeit').insertAdjacentHTML('afterbegin', `<option value="${hhmm(vor.zeit)}">${hhmm(vor.zeit)} Uhr</option>`);
    }
    if (vor.zeit !== undefined) el('zeit').value = hhmm(vor.zeit);
    tischeZeigen();
  }
}
