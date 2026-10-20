import { $, S, aenderungen, aktionen, api, dialogOffen, esc, heuteIso, ladeTag, meldeFehler, render, speicher, toast, ansichten, type Nutzer } from './team-kern';
import './team-tag';
import { P } from './team-plan';
import { kontoDialog } from './team-sonst';

// Einstieg des Dashboards: Anmeldung, Ersteinrichtung oder die App.
const modus = document.body.dataset.modus;

function auth() {
  const form = $<HTMLFormElement>('[data-auth]')!;
  const fehler = $<HTMLElement>('[data-fehler]')!;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    fehler.hidden = true;
    const v = Object.fromEntries(new FormData(form).entries());
    const knopf = form.querySelector<HTMLButtonElement>('button[type=submit]')!;
    knopf.disabled = true;
    try {
      await api(modus === 'setup' ? '/api/team/setup' : '/api/team/login', { method: 'POST', body: v });
      location.reload();
    } catch (x) {
      fehler.textContent = x instanceof Error ? x.message : 'Fehler';
      fehler.hidden = false;
      knopf.disabled = false;
    }
  });
}

async function start() {
  const me = await api<{ nutzer: Nutzer; standorte: { id: string; name: string }[] }>('/api/team/me');
  S.me = me.nutzer;
  S.standorte = me.standorte;
  const gemerkt = speicher('team.ort');
  S.standort = me.standorte.find((s) => s.id === gemerkt)?.id ?? me.standorte[0].id;
  S.datum = heuteIso();

  const sel = $<HTMLSelectElement>('[data-ort]')!;
  sel.innerHTML = me.standorte.map((s) => `<option value="${s.id}">${esc(s.name)}</option>`).join('');
  sel.value = S.standort;
  sel.disabled = me.standorte.length < 2;
  sel.addEventListener('change', async () => {
    S.standort = sel.value;
    speicher('team.ort', S.standort);
    S.tag = null;
    P.neuLaden = true;
    P.zuweisen = null;
    await render();
  });
  $('[data-username]')!.textContent = me.nutzer.name;
  $('[data-konto]')!.addEventListener('click', kontoDialog);

  const route = () => {
    const h = location.hash.slice(1);
    const a = ansichten[h];
    S.ansicht = a && (!a.rollen || a.rollen.includes(S.me.rolle)) ? h : 'tag';
    render();
  };
  window.addEventListener('hashchange', route);

  document.addEventListener('click', async (e) => {
    const el = (e.target as HTMLElement).closest<HTMLElement>('[data-akt]');
    if (!el || el.hasAttribute('disabled')) return;
    const f = aktionen[el.dataset.akt!];
    if (!f) return;
    try {
      await f(el, e);
    } catch (x) {
      meldeFehler(x);
    }
  });
  document.addEventListener('change', async (e) => {
    const el = (e.target as HTMLElement).closest<HTMLInputElement>('[data-chg]');
    if (!el) return;
    const f = aenderungen[el.dataset.chg!];
    if (f) {
      try {
        await f(el, e);
      } catch (x) {
        meldeFehler(x);
      }
    }
  });
  // Klick neben den Dialog schließt ihn
  const dlg = $<HTMLDialogElement>('[data-dialog]')!;
  dlg.addEventListener('click', (e) => {
    if (e.target === dlg) dlg.close();
  });

  // Neue Online Reservierungen erscheinen von selbst (alle 30 Sekunden), solange nichts bearbeitet wird.
  setInterval(async () => {
    if (document.visibilityState !== 'visible' || dialogOffen() || !['tag', 'plan'].includes(S.ansicht) || P.edit || P.zuweisen) return;
    try {
      const alt = JSON.stringify(S.tag?.reservierungen ?? []);
      const anzahl = S.tag?.reservierungen.length ?? 0;
      const neu = await ladeTag(true);
      if (JSON.stringify(neu.reservierungen) !== alt) {
        if (neu.reservierungen.length > anzahl) toast('Neue Reservierung eingegangen.');
        await render(true);
      }
    } catch {
      /* nächster Versuch in 30 Sekunden */
    }
  }, 30000);

  route();
}

if (modus === 'login' || modus === 'setup') auth();
else if (modus === 'app') start().catch(meldeFehler);
void ansichten;
