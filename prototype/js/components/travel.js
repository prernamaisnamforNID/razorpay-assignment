/* H07a v2 building blocks (Figma 96:2): "Checked against" strip, travel-mode cards
   with a budget bar, and the "Left out" row. Copy: data/journey.js `travel`. */
import { html, esc } from "../dom.js";
import { reduceMotion } from "./chat.js";

const icon = (name, size) =>
  `<img class="icon" src="assets/icons/${name}.svg" width="${size}" height="${size}" alt="" draggable="false">`;

/* "Checked against" strip (96:37). */
export const checkedStrip = (c) => html(`
  <section class="around" aria-label="${esc(c.title)}">
    <div class="around__head">${icon("users-14", 14)}<span class="around__title">${esc(c.title)}</span></div>
    <div class="around__pills">
      ${c.pills.map((p) => `
        <span class="around__pill"><span class="around__avatar" style="background:${p.bg}" aria-hidden="true">${esc(p.letter)}</span>${esc(p.label)}</span>`).join("")}
    </div>
  </section>`);

/* A travel-mode card (96:62 / 96:112). The budget bar's travel segment is
   cost / budget wide; el.grow() animates it in from 0. onAction(actionId). */
export function modeCard(m, budget, { onAction }) {
  const pct = Math.min(100, (m.cost / budget) * 100);
  const el = html(`
    <article class="mode${m.best ? " is-best" : ""}" aria-label="${esc(m.title)}">
      ${m.best ? `<p class="mode__best"><img class="icon" src="assets/brand/myra-sparkle-11.svg" width="11" height="11" alt="">${esc(m.best)}</p>` : ""}
      <div class="mode__head">
        <span class="mode__tile">${icon(m.icon, 20)}</span>
        <span class="mode__names">
          <h3 class="mode__title">${esc(m.title)}</h3>
          <span class="mode__sub">${esc(m.sub)}</span>
        </span>
      </div>
      <dl class="mode__metrics">
        ${m.metrics.map((x) => `<div><dt>${esc(x.label)}</dt><dd>${esc(x.value)}</dd></div>`).join("")}
      </dl>
      <div class="budget budget--${m.tone}">
        <div class="budget__bar" role="img" aria-label="${esc(`${m.travelLabel}. ${m.leftLabel}.`)}">
          <span class="budget__travel" style="width:${pct.toFixed(1)}%"></span>
          <span class="budget__left"></span>
        </div>
        <p class="budget__caption" aria-hidden="true"><span>${esc(m.travelLabel)}</span><span>${esc(m.leftLabel)}</span></p>
      </div>
      <ul class="mode__fits">
        ${m.fits.map((f) => `
          <li class="beach__fit${f.bad ? " is-bad" : f.ok ? "" : " is-warn"}">
            ${icon(f.bad ? "info-12-red" : f.ok ? "check-12-green" : "info-12-amber", 12)}${esc(f.text)}
          </li>`).join("")}
      </ul>
      <div class="mode__actions">
        ${m.actions.map((a) => `<button class="chip mode__chip${a.primary ? " chip--primary" : ""} tap" type="button" data-mode-action="${a.id}">${esc(a.label)}</button>`).join("")}
      </div>
    </article>`);

  el.addEventListener("click", (e) => {
    const b = e.target.closest("[data-mode-action]");
    if (b) onAction(b.dataset.modeAction);
  });

  el.grow = () => {
    if (reduceMotion.matches) return;
    el.querySelector(".budget__travel").animate(
      [{ width: "0%" }, { width: `${pct.toFixed(1)}%` }],
      { duration: 400, delay: 120, easing: "ease-out", fill: "backwards" },
    );
  };
  return el;
}

/* "Left out: …" row (96:150), same look as H05's. onShow() for "Show anyway". */
export function leftOutRow(c, { onShow }) {
  const el = html(`
    <div class="bp__left-out left-out">
      ${icon("eye-off-16", 16)}
      <div class="bp__left-text">
        <p class="bp__left-title">${esc(c.title)}</p>
        <p class="bp__left-reason">${esc(c.reason)}</p>
        <button class="bp__link tap" type="button">${esc(c.action)}</button>
      </div>
    </div>`);
  el.querySelector("button").addEventListener("click", onShow);
  return el;
}
