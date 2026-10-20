import {
  $, $$, S, type Res, type Sperre, aenderungen, aktionen, ansichten, api, datumKurz, dialog, esc, hhmm, heuteIso, kannBearbeiten,
  QUELLE_TEXT, render, schliesse, STATUS_TEXT, tue, toast, wochentagName, type Nutzer,
} from './team-kern';

// --- Suche -------------------------------------------------------------------------------------------------------
let suchtext = '';
let suchAlle = false;
let treffer: Res[] = [];

ansichten.suche = {
  titel: 'Suche',
  html() {
    return `<section class="block">
      <h2>Reservierung suchen</h2>
      <form data-suche class="suchform">
        <label class="sr" for="q">Name, Telefon oder Mail</label>
        <input id="q" name="q" type="search" value="${esc(suchtext)}" placeholder="Name, Telefon oder Mail" minlength="2" autocomplete="off" />
        <button class="knopf primaer" type="submit">Suchen</button>
      </form>
      <label class="schalter"><input type="checkbox" data-chg="such-alle" ${suchAlle ? 'checked' : ''} /> Auch vergangene Reservierungen</label>
      ${suchtext ? ergebnis() : '<p class="klein">Ab zwei Zeichen. Standard: Reservierungen ab heute.</p>'}
    </section>`;
  },
};
const ergebnis = () =>
  treffer.length
    ? `<table class="tabelle"><thead><tr><th>Datum</th><th>Zeit</th><th>Name</th><th>Pers.</th><th>Telefon</th><th>Status</th><th></th></tr></thead><tbody>${treffer
        .map(
          (r) => `<tr><td>${datumKurz(r.datum)}</td><td>${hhmm(r.von)}</td><td>${esc(r.name)}<small> ${QUELLE_TEXT[r.quelle]}</small></td><td>${r.personen}</td><td>${esc(r.telefon)}</td><td><span class="badge s-${r.status}">${STATUS_TEXT[r.status]}</span></td>
          <td><button class="knopf leise" data-akt="zum-tag" data-datum="${r.datum}" type="button">Zum Tag</button></td></tr>`,
        )
        .join('')}</tbody></table>`
    : '<p class="leer">Keine Treffer.</p>';

document.addEventListener('submit', async (e) => {
  const f = e.target as HTMLFormElement;
  if (!f.matches('[data-suche]')) return;
  e.preventDefault();
  suchtext = String(new FormData(f).get('q') ?? '').trim();
  await sucheAusfuehren();
});
async function sucheAusfuehren() {
  if (suchtext.length < 2) {
    treffer = [];
  } else {
    const r = await tue(() => api<{ treffer: Res[] }>(`/api/team/suche?standort=${S.standort}&q=${encodeURIComponent(suchtext)}${suchAlle ? '&alle=1' : ''}`));
    treffer = r?.treffer ?? [];
  }
  await render(true);
}
aenderungen['such-alle'] = async (el) => {
  suchAlle = (el as HTMLInputElement).checked;
  if (suchtext) await sucheAusfuehren();
};
aktionen['zum-tag'] = (el) => {
  S.datum = el.dataset.datum!;
  location.hash = '#tag';
};

// --- Sperren -----------------------------------------------------------------------------------------------------
ansichten.sperren = {
  titel: 'Sperren',
  async html() {
    const [{ sperren }, tag] = await Promise.all([api<{ sperren: Sperre[] }>(`/api/team/sperren?standort=${S.standort}`), api<any>(`/api/team/tag?standort=${S.standort}&datum=${heuteIso()}`)]);
    const bearbeiten = kannBearbeiten();
    return `<section class="block">
      <h2>Sperren</h2>
      <p class="klein">Gesperrte Tage, Zeiten oder Tische sind online nicht buchbar und werden bei der Tischvergabe übersprungen. Bestehende Reservierungen bleiben bestehen.</p>
      ${
        bearbeiten
          ? `<form class="formraster" data-sperre>
        <label>Von<input type="date" name="datumVon" value="${heuteIso()}" required /></label>
        <label>Bis (optional)<input type="date" name="datumBis" /></label>
        <label class="check"><input type="checkbox" name="ganztag" checked data-chg="sperre-ganztag" /> Ganzer Tag</label>
        <label data-zeit hidden>Ab<input type="time" name="von" step="900" value="17:30" /></label>
        <label data-zeit hidden>Bis<input type="time" name="bis" step="900" value="23:00" /></label>
        <label>Gilt für<select name="tischId"><option value="">Ganzer Standort</option>${tag.tische.map((t: any) => `<option value="${t.id}">Tisch ${esc(t.nr)} (${t.plaetze} Plätze)</option>`).join('')}</select></label>
        <label class="breit">Grund<input name="grund" maxlength="120" placeholder="Feier, Ruhetag, Personalmangel" /></label>
        <button class="knopf primaer" type="submit">Sperre anlegen</button>
      </form>`
          : ''
      }
      ${
        sperren.length
          ? `<table class="tabelle"><thead><tr><th>Zeitraum</th><th>Uhrzeit</th><th>Gilt für</th><th>Grund</th><th></th></tr></thead><tbody>${sperren
              .map(
                (s) => `<tr><td>${datumKurz(s.datum_von)}${s.datum_bis !== s.datum_von ? ` bis ${datumKurz(s.datum_bis)}` : ''}</td><td>${s.von !== null ? `${hhmm(s.von)} bis ${hhmm(s.bis!)}` : 'ganztägig'}</td><td>${s.tisch_id ? `Tisch ${esc(s.tisch_nr)}` : 'Ganzer Standort'}</td><td>${esc(s.grund)}</td>
                <td>${bearbeiten ? `<button class="knopf leise" data-akt="sperre-weg" data-id="${s.id}" type="button">Aufheben</button>` : ''}</td></tr>`,
              )
              .join('')}</tbody></table>`
          : '<p class="leer">Keine Sperren eingetragen.</p>'
      }
    </section>`;
  },
};
aenderungen['sperre-ganztag'] = (el) => {
  const an = (el as HTMLInputElement).checked;
  $$('[data-zeit]', el.closest('form')!).forEach((l) => (l.hidden = an));
};
document.addEventListener('submit', async (e) => {
  const f = e.target as HTMLFormElement;
  if (!f.matches('[data-sperre]')) return;
  e.preventDefault();
  const v = Object.fromEntries(new FormData(f).entries()) as Record<string, string>;
  const body: Record<string, unknown> = { standort: S.standort, datumVon: v.datumVon, datumBis: v.datumBis || v.datumVon, tischId: v.tischId || undefined, grund: v.grund };
  if (!v.ganztag) {
    body.von = v.von;
    body.bis = v.bis;
  }
  if (await tue(() => api('/api/team/sperren', { method: 'POST', body }), 'Sperre angelegt.')) await render(true);
});
aktionen['sperre-weg'] = async (el) => {
  if (confirm('Sperre aufheben?') && (await tue(() => api('/api/team/sperren', { method: 'DELETE', body: { id: el.dataset.id } }), 'Sperre aufgehoben.'))) await render(true);
};

// --- Einstellungen -----------------------------------------------------------------------------------------------
const REIHE = [1, 2, 3, 4, 5, 6, 0]; // Montag zuerst

ansichten.einst = {
  titel: 'Einstellungen',
  rollen: ['admin', 'leitung'],
  async html() {
    const { einst: e } = await api<any>(`/api/team/einstellungen?standort=${S.standort}`);
    const zeile = (wd: number) => {
      const t = e.oeffnung[wd];
      const f = (n: 'mittag' | 'abend') =>
        `<span class="fenster"><label class="check"><input type="checkbox" name="${n}${wd}" ${t[n] ? 'checked' : ''} aria-label="${wochentagName(wd)} ${n === 'mittag' ? 'Mittag' : 'Abend'} geöffnet" /> offen</label>
         <input type="time" name="${n}${wd}von" value="${t[n]?.von ?? (n === 'mittag' ? '12:00' : '17:30')}" step="900" aria-label="${wochentagName(wd)} ${n} von" /> bis
         <input type="time" name="${n}${wd}bis" value="${t[n]?.bis ?? (n === 'mittag' ? '15:00' : '23:00')}" step="900" aria-label="${wochentagName(wd)} ${n} bis" /></span>`;
      return `<tr><th scope="row">${wochentagName(wd)}</th><td>${f('mittag')}</td><td>${f('abend')}</td></tr>`;
    };
    return `<section class="block">
      <h2>Einstellungen ${S.standorte.find((s) => s.id === S.standort)?.name ?? ''}</h2>
      <form data-einst>
        <fieldset class="formraster">
          <legend>Reservierung</legend>
          <label>Zeit am Tisch (Minuten)<input type="number" name="dauer" min="30" max="360" step="15" value="${e.dauer}" /></label>
          <label>Puffer danach (Minuten)<input type="number" name="puffer" min="0" max="120" step="5" value="${e.puffer}" /></label>
          <label>Letzte Reservierung vor Schluss (Minuten)<input type="number" name="letzteVorSchluss" min="0" max="360" step="15" value="${e.letzteVorSchluss}" /></label>
          <label>Online frühestens (Minuten vorher)<input type="number" name="vorlauf" min="0" max="1440" step="15" value="${e.vorlauf}" /></label>
          <label>Größte Online Gruppe (Personen)<input type="number" name="maxOnline" min="1" max="40" value="${e.maxOnline}" /></label>
        </fieldset>
        <fieldset>
          <legend>Öffnungszeiten (Reservierungsfenster)</legend>
          <table class="tabelle oeffnung"><thead><tr><th>Tag</th><th>Mittag</th><th>Abend</th></tr></thead><tbody>${REIHE.map(zeile).join('')}</tbody></table>
        </fieldset>
        <div class="knopfreihe"><button class="knopf primaer" type="submit">Speichern</button><button class="knopf" type="button" data-akt="einst-vorgabe">Auf Vorgabe zurücksetzen</button></div>
      </form>
      ${S.me.rolle === 'admin' ? testBlock() : ''}
    </section>`;
  },
};
const testBlock = () => `<fieldset class="testblock">
  <legend>Testphase</legend>
  <p class="klein">Nur Admin, nur solange <code>TESTPHASE</code> nicht auf <code>false</code> steht. Beispieltische sind ein erfundener Grundriss, kein echter Plan.</p>
  <div class="knopfreihe">
    <button class="knopf" data-akt="test" data-a="tische" type="button">Beispieltische anlegen</button>
    <button class="knopf" data-akt="test" data-a="reservierungen" type="button">Beispielreservierungen (heute, morgen)</button>
    <button class="knopf gefahr" data-akt="test" data-a="leeren" type="button">Alle Reservierungen und Sperren löschen</button>
  </div>
</fieldset>`;

document.addEventListener('submit', async (e) => {
  const f = e.target as HTMLFormElement;
  if (!f.matches('[data-einst]')) return;
  e.preventDefault();
  const d = new FormData(f);
  const num = (n: string) => Number(d.get(n));
  const fenster = (n: string, wd: number) => (d.get(`${n}${wd}`) ? { von: String(d.get(`${n}${wd}von`)), bis: String(d.get(`${n}${wd}bis`)) } : null);
  const oeffnung = [0, 1, 2, 3, 4, 5, 6].map((wd) => ({ mittag: fenster('mittag', wd), abend: fenster('abend', wd) }));
  const einst = { dauer: num('dauer'), puffer: num('puffer'), letzteVorSchluss: num('letzteVorSchluss'), vorlauf: num('vorlauf'), maxOnline: num('maxOnline'), oeffnung };
  if (await tue(() => api('/api/team/einstellungen', { method: 'PUT', body: { standort: S.standort, einst } }), 'Einstellungen gespeichert.')) await render(true);
});
aktionen['einst-vorgabe'] = async () => {
  if (!confirm('Öffnungszeiten und Werte auf die Vorgabe aus dem Infopaket zurücksetzen?')) return;
  const { vorgabe } = await api<any>(`/api/team/einstellungen?standort=${S.standort}`);
  if (await tue(() => api('/api/team/einstellungen', { method: 'PUT', body: { standort: S.standort, einst: vorgabe } }), 'Auf Vorgabe zurückgesetzt.')) await render(true);
};
aktionen['test'] = async (el) => {
  const a = el.dataset.a!;
  let bestaetigung: string | undefined;
  if (a === 'leeren') {
    bestaetigung = prompt('Alle Reservierungen und Sperren dieses Standorts löschen? Zur Bestätigung LEEREN eingeben.') ?? undefined;
    if (!bestaetigung) return;
  }
  const r = await tue(() => api<any>('/api/team/testdaten', { method: 'POST', body: { standort: S.standort, aktion: a, bestaetigung } }));
  if (r) toast(a === 'tische' ? 'Beispieltische angelegt.' : a === 'reservierungen' ? `${r.anzahl} Beispielreservierungen angelegt.` : 'Gelöscht.');
};

// --- Benutzer ----------------------------------------------------------------------------------------------------
type Ben = Nutzer & { aktiv: number; letzter_login: string | null; erstellt: string };
let benutzerListe: Ben[] = [];
const ROLLE_TEXT = { admin: 'Admin (alle Standorte)', leitung: 'Standortleitung', service: 'Service' } as const;

ansichten.benutzer = {
  titel: 'Benutzer',
  rollen: ['admin'],
  async html() {
    benutzerListe = (await api<{ benutzer: Ben[] }>('/api/team/benutzer')).benutzer;
    const ort = (id: string | null) => S.standorte.find((s) => s.id === id)?.name ?? '';
    return `<section class="block">
      <h2>Benutzer</h2>
      <p class="klein">Admin sieht und verwaltet alle Standorte. Standortleitung verwaltet Tische, Sperren und Einstellungen ihres Standorts. Service trägt Reservierungen ein und weist Tische zu. Zwei Faktor Anmeldung folgt nach der Testphase.</p>
      <table class="tabelle"><thead><tr><th>Name</th><th>Benutzername</th><th>Rolle</th><th>Standort</th><th>Letzte Anmeldung</th><th></th></tr></thead><tbody>
        ${benutzerListe.map((b) => `<tr class="${b.aktiv ? '' : 'inaktiv'}"><td>${esc(b.name)}</td><td>${esc(b.benutzername)}</td><td>${ROLLE_TEXT[b.rolle]}</td><td>${esc(ort(b.standort))}</td><td>${esc(b.letzter_login ?? 'nie')}</td>
        <td><button class="knopf leise" data-akt="benutzer-bearbeiten" data-id="${b.id}" type="button">Bearbeiten</button></td></tr>`).join('')}
      </tbody></table>
      <button class="knopf primaer" data-akt="benutzer-neu" type="button">+ Benutzer anlegen</button>
    </section>`;
  },
};
const ortOptionen = (sel: string | null) => S.standorte.map((s) => `<option value="${s.id}" ${s.id === sel ? 'selected' : ''}>${s.name}</option>`).join('');

function benutzerDialog(b: Ben | null) {
  const d = dialog(`<form class="dlg" data-benutzerform novalidate>
    <h2>${b ? 'Benutzer bearbeiten' : 'Benutzer anlegen'}</h2>
    <div class="raster2">
      <label>Name<input name="name" value="${esc(b?.name ?? '')}" required /></label>
      <label>Benutzername<input name="benutzername" value="${esc(b?.benutzername ?? '')}" ${b ? 'disabled' : ''} autocapitalize="none" required /></label>
      <label>Rolle<select name="rolle">${(['service', 'leitung', 'admin'] as const).map((r) => `<option value="${r}" ${b?.rolle === r ? 'selected' : ''}>${ROLLE_TEXT[r]}</option>`).join('')}</select></label>
      <label data-ortfeld>Standort<select name="standort">${ortOptionen(b?.standort ?? S.standort)}</select></label>
      <label class="breit">${b ? 'Neues Passwort (leer lassen, um es zu behalten)' : 'Passwort (mindestens 10 Zeichen)'}<input name="passwort" type="password" autocomplete="new-password" ${b ? '' : 'required'} /></label>
      ${b ? `<label class="check breit"><input type="checkbox" name="aktiv" ${b.aktiv ? 'checked' : ''} /> Konto aktiv</label>` : ''}
    </div>
    <p class="fehler" data-dfehler role="alert" hidden></p>
    <div class="knopfreihe"><button class="knopf primaer" type="submit">Speichern</button><button class="knopf" type="button" data-schliessen>Abbrechen</button></div>
  </form>`);
  const f = $<HTMLFormElement>('form', d)!;
  const rolle = f.elements.namedItem('rolle') as HTMLSelectElement;
  const feld = $<HTMLElement>('[data-ortfeld]', d)!;
  const zeig = () => (feld.hidden = rolle.value === 'admin');
  rolle.addEventListener('change', zeig);
  zeig();
  $('[data-schliessen]', d)!.addEventListener('click', schliesse);
  f.addEventListener('submit', async (e) => {
    e.preventDefault();
    const v = new FormData(f);
    const fehlerBox = $<HTMLElement>('[data-dfehler]', d)!;
    try {
      if (!b) await api('/api/team/benutzer', { method: 'POST', body: { benutzername: v.get('benutzername'), name: v.get('name'), rolle: v.get('rolle'), standort: v.get('standort'), passwort: v.get('passwort') } });
      else {
        const body: Record<string, unknown> = { id: b.id, name: v.get('name'), rolle: v.get('rolle'), standort: v.get('standort'), aktiv: v.get('aktiv') ? 1 : 0 };
        if (v.get('passwort')) body.passwort = v.get('passwort');
        await api('/api/team/benutzer', { method: 'PATCH', body });
      }
    } catch (x) {
      fehlerBox.textContent = x instanceof Error ? x.message : 'Fehler';
      fehlerBox.hidden = false;
      return;
    }
    schliesse();
    toast('Gespeichert.');
    await render(true);
  });
}
aktionen['benutzer-neu'] = () => benutzerDialog(null);
aktionen['benutzer-bearbeiten'] = (el) => benutzerDialog(benutzerListe.find((b) => b.id === el.dataset.id) ?? null);

// --- Protokoll ---------------------------------------------------------------------------------------------------
ansichten.protokoll = {
  titel: 'Protokoll',
  rollen: ['admin', 'leitung'],
  async html() {
    const { eintraege } = await api<{ eintraege: { zeit: string; benutzer: string | null; standort: string | null; aktion: string; details: string }[] }>('/api/team/protokoll');
    return `<section class="block"><h2>Protokoll</h2><p class="klein">Die letzten 200 Änderungen. Zeiten in UTC.</p>
      <table class="tabelle"><thead><tr><th>Zeit</th><th>Wer</th><th>Standort</th><th>Aktion</th><th>Details</th></tr></thead><tbody>
      ${eintraege.map((e) => `<tr><td>${esc(e.zeit)}</td><td>${esc(e.benutzer ?? 'Gast')}</td><td>${esc(e.standort ?? '')}</td><td>${esc(e.aktion)}</td><td>${esc(e.details)}</td></tr>`).join('')}
      </tbody></table></section>`;
  },
};

// --- Konto -------------------------------------------------------------------------------------------------------
export function kontoDialog() {
  const d = dialog(`<form class="dlg" data-konto-form novalidate>
    <h2>${esc(S.me.name)}</h2>
    <p class="klein">${ROLLE_TEXT[S.me.rolle]}${S.me.standort ? `, ${esc(S.standorte.find((s) => s.id === S.me.standort)?.name ?? '')}` : ''}</p>
    <h3>Passwort ändern</h3>
    <div class="raster2">
      <label>Bisheriges Passwort<input name="alt" type="password" autocomplete="current-password" /></label>
      <label>Neues Passwort (mindestens 10 Zeichen)<input name="neu" type="password" autocomplete="new-password" /></label>
    </div>
    <p class="fehler" data-dfehler role="alert" hidden></p>
    <div class="knopfreihe">
      <button class="knopf primaer" type="submit">Passwort ändern</button>
      <button class="knopf" type="button" data-schliessen>Schließen</button>
      <button class="knopf gefahr" type="button" data-logout>Abmelden</button>
    </div>
  </form>`);
  $('[data-schliessen]', d)!.addEventListener('click', schliesse);
  $('[data-logout]', d)!.addEventListener('click', async () => {
    await api('/api/team/logout', { method: 'POST' }).catch(() => {});
    location.reload();
  });
  const f = $<HTMLFormElement>('form', d)!;
  f.addEventListener('submit', async (e) => {
    e.preventDefault();
    const v = new FormData(f);
    const fehlerBox = $<HTMLElement>('[data-dfehler]', d)!;
    try {
      await api('/api/team/passwort', { method: 'POST', body: { alt: v.get('alt'), neu: v.get('neu') } });
    } catch (x) {
      fehlerBox.textContent = x instanceof Error ? x.message : 'Fehler';
      fehlerBox.hidden = false;
      return;
    }
    schliesse();
    toast('Passwort geändert.');
  });
}
