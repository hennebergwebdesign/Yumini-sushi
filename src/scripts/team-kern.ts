// Gemeinsamer Kern des Dashboards: Zustand, Aufrufe, Hilfen, Dialoge. Die Ansichten (team-*.ts) tragen sich in `ansichten` ein.

export type Nutzer = { id: string; benutzername: string; name: string; rolle: 'admin' | 'leitung' | 'service'; standort: string | null };
export type Tisch = { id: string; standort: string; nr: string; plaetze: number; form: 'eckig' | 'rund'; bereich: string; x: number; y: number; b: number; h: number };
export type Kombi = { id: string; tische: string[]; plaetze: number };
export type Sperre = { id: string; datum_von: string; datum_bis: string; von: number | null; bis: number | null; tisch_id: string | null; tisch_nr?: string | null; grund: string };
export type Status = 'bestaetigt' | 'angekommen' | 'abgeschlossen' | 'nicht_erschienen' | 'storniert';
export type Res = {
  id: string; standort: string; datum: string; von: number; dauer: number; puffer: number; personen: number;
  name: string; telefon: string; mail: string; anmerkung: string; intern: string; status: Status; quelle: 'online' | 'telefon' | 'laufkunde';
  tische: string[]; erstellt: string;
};
export type TagDaten = {
  standort: string; datum: string; raster: { b: number; h: number }; jetzt: { datum: string; minuten: number }; wochentag: number; geschlossen: boolean;
  fenster: { mittag: { von: string; bis: string } | null; abend: { von: string; bis: string } | null };
  startzeiten: { t: string; gruppe: string }[]; einst: { dauer: number; puffer: number; vorlauf: number };
  tische: Tisch[]; kombinationen: Kombi[]; sperren: Sperre[]; reservierungen: Res[];
};

export const S = {
  me: null as unknown as Nutzer,
  standorte: [] as { id: string; name: string }[],
  standort: '',
  datum: '',
  ansicht: 'tag',
  tag: null as TagDaten | null,
  filterErledigt: false,
};

export const ansichten: Record<string, { titel: string; rollen?: string[]; html: () => Promise<string> | string; nach?: () => void; mitDatum?: boolean }> = {};
export const aktionen: Record<string, (el: HTMLElement, e: Event) => void | Promise<void>> = {};
export const aenderungen: Record<string, (el: HTMLInputElement | HTMLSelectElement, e: Event) => void | Promise<void>> = {};

export const $ = <T extends HTMLElement>(s: string, r: ParentNode = document) => r.querySelector<T>(s);
export const $$ = <T extends HTMLElement>(s: string, r: ParentNode = document) => [...r.querySelectorAll<T>(s)];
export const esc = (s: unknown) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

export const hhmm = (m: number) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
export const minuten = (s: string) => {
  const [h, m] = s.split(':').map(Number);
  return h * 60 + (m || 0);
};
const WT = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
export const wochentag = (iso: string) => new Date(`${iso}T00:00:00Z`).getUTCDay();
export const plusTage = (iso: string, n: number) => {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};
export const datumKurz = (iso: string) => `${WT[wochentag(iso)].slice(0, 2)}., ${iso.slice(8, 10)}.${iso.slice(5, 7)}.${iso.slice(0, 4)}`;
export const datumLang = (iso: string) => `${WT[wochentag(iso)]}, ${Number(iso.slice(8, 10))}.${Number(iso.slice(5, 7))}.${iso.slice(0, 4)}`;
export const wochentagName = (i: number) => WT[i];
export const heuteIso = () => {
  const t = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Berlin' }).format(new Date());
  return t;
};
export const jetztMin = () => {
  const t = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Berlin', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(new Date());
  return minuten(t);
};

export const kannBearbeiten = () => S.me.rolle === 'admin' || S.me.rolle === 'leitung';
export const istAktiv = (s: Status) => s === 'bestaetigt' || s === 'angekommen';
export const STATUS_TEXT: Record<Status, string> = { bestaetigt: 'Bestätigt', angekommen: 'Angekommen', abgeschlossen: 'Abgeschlossen', nicht_erschienen: 'Nicht erschienen', storniert: 'Storniert' };
export const QUELLE_TEXT = { online: 'Online', telefon: 'Telefon', laufkunde: 'Laufkunde' } as const;

export class ApiFehler extends Error {
  constructor(m: string, public status: number) {
    super(m);
  }
}

export async function api<T = any>(pfad: string, o: { method?: string; body?: unknown } = {}): Promise<T> {
  // trailingSlash ist "always", Serverrouten brauchen den abschließenden Schrägstrich
  const [pf, q] = pfad.split('?');
  const r = await fetch(`${pf.endsWith('/') ? pf : pf + '/'}${q ? '?' + q : ''}`, {
    method: o.method ?? 'GET',
    headers: { 'Content-Type': 'application/json', 'X-Yumini': '1' },
    body: o.body === undefined ? undefined : JSON.stringify(o.body),
    credentials: 'same-origin',
  });
  const d = await r.json().catch(() => ({}));
  if (r.status === 401 && S.me) {
    location.reload();
    throw new ApiFehler('Sitzung abgelaufen', 401);
  }
  if (!r.ok) throw new ApiFehler(d.fehler ?? 'Fehler', r.status);
  return d as T;
}

export function toast(text: string, art: 'ok' | 'fehler' = 'ok') {
  const box = $('[data-toasts]')!;
  const el = document.createElement('div');
  el.className = `toast ${art}`;
  el.textContent = text;
  el.setAttribute('role', art === 'fehler' ? 'alert' : 'status');
  box.append(el);
  setTimeout(() => el.remove(), art === 'fehler' ? 6000 : 3200);
}

export const meldeFehler = (e: unknown) => toast(e instanceof Error ? e.message : 'Fehler', 'fehler');

/** Führt eine Aktion aus und meldet Fehler als Hinweis */
export async function tue<T>(f: () => Promise<T>, ok?: string): Promise<T | undefined> {
  try {
    const r = await f();
    if (ok) toast(ok);
    return r;
  } catch (e) {
    meldeFehler(e);
  }
}

export function speicher(k: string, v?: string) {
  try {
    if (v === undefined) return localStorage.getItem(k);
    localStorage.setItem(k, v);
  } catch {
    /* privater Modus: ohne Merken weiter */
  }
  return null;
}

export async function ladeTag(still = false): Promise<TagDaten> {
  const d = await api<TagDaten>(`/api/team/tag?standort=${S.standort}&datum=${S.datum}`);
  S.tag = d;
  if (!still) S.datum = d.datum;
  return d;
}

// --- Dialog ---------------------------------------------------------------------------------------------------
export function dialog(html: string, klasse = '') {
  const d = $<HTMLDialogElement>('[data-dialog]')!;
  d.className = klasse;
  d.innerHTML = html;
  if (!d.open) d.showModal();
  const f = d.querySelector<HTMLElement>('[autofocus], input:not([type=hidden]), select, textarea, button');
  f?.focus();
  return d;
}
export function schliesse() {
  const d = $<HTMLDialogElement>('[data-dialog]')!;
  if (d.open) d.close();
  d.innerHTML = '';
}
export const dialogOffen = () => !!$<HTMLDialogElement>('[data-dialog]')?.open;

// --- Darstellung ----------------------------------------------------------------------------------------------
export async function render(still = false) {
  const a = ansichten[S.ansicht] ?? ansichten.tag;
  const box = $('[data-inhalt]')!;
  const y = window.scrollY;
  try {
    const html = await a.html();
    box.innerHTML = html;
    a.nach?.();
  } catch (e) {
    box.innerHTML = `<p class="fehler" role="alert">${esc(e instanceof Error ? e.message : 'Fehler')}</p>`;
  }
  if (still) window.scrollTo({ top: y });
  renderTabs();
}

export function renderTabs() {
  const nav = $('[data-tabs]')!;
  nav.innerHTML = Object.entries(ansichten)
    .filter(([, a]) => !a.rollen || a.rollen.includes(S.me.rolle))
    .map(([k, a]) => `<a href="#${k}" class="tab" ${k === S.ansicht ? 'aria-current="page"' : ''}>${esc(a.titel)}</a>`)
    .join('');
}

/** Leiste mit Datumswahl für Tag und Tischplan */
export function datumsLeiste(extra = '') {
  const heute = heuteIso();
  return `<div class="leiste">
    <div class="datum">
      <button class="knopf" data-akt="tag-vor" data-n="-1" aria-label="Vorheriger Tag" type="button">‹</button>
      <label class="sr" for="datum">Datum</label>
      <input id="datum" type="date" value="${S.datum}" data-chg="datum" />
      <button class="knopf" data-akt="tag-vor" data-n="1" aria-label="Nächster Tag" type="button">›</button>
      <button class="knopf leise" data-akt="heute" type="button" ${S.datum === heute ? 'disabled' : ''}>Heute</button>
      <strong class="tagname">${datumLang(S.datum)}${S.tag?.geschlossen ? ' <span class="badge zu">Geschlossen</span>' : ''}</strong>
    </div>
    <div class="extra">${extra}</div>
  </div>`;
}

aktionen['tag-vor'] = async (el) => {
  S.datum = plusTage(S.datum, Number(el.dataset.n));
  await render();
};
aktionen['heute'] = async () => {
  S.datum = heuteIso();
  await render();
};
aenderungen['datum'] = async (el) => {
  if (/^\d{4}-\d{2}-\d{2}$/.test(el.value)) {
    S.datum = el.value;
    await render();
  }
};
