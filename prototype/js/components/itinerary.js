/* Itinerary building blocks — Figma 53:62 (path options), 53:175 (known vs missing),
   53:296 (draft label), 53:302 (day card), 53:218 (chips with icons). */
import { html, esc } from "../dom.js";
import { getState } from "../state.js";
import { reduceMotion } from "./chat.js";

const icon = (name, size) =>
  `<img class="icon" src="assets/icons/${name}.svg" width="${size}" height="${size}" alt="" draggable="false">`;

/* Slide items in from the right, `gap` ms apart. */
export function stagger(items, gap) {
  if (reduceMotion.matches) return;
  items.forEach((c, i) => c.animate(
    [{ opacity: 0, transform: "translateY(8px)" }, { opacity: 1, transform: "none" }],
    { duration: 240, delay: i * gap, easing: "cubic-bezier(.2,.8,.2,1)", fill: "backwards" },
  ));
}

/* H03e path cards. onPick(option). They stay tappable. */
export function pathOptions(copy, { onPick }) {
  const el = html(`
    <div class="paths">
      ${copy.options.map((o) => `
        <button class="path tap${o.featured ? " is-featured" : ""}" type="button" data-path="${o.id}">
          ${o.featured ? `<span class="path__badge"><img class="icon" src="assets/brand/myra-sparkle-11.svg" width="11" height="11" alt="">${esc(copy.badge)}</span>` : ""}
          <span class="path__row">
            <span class="path__tile">${icon(o.icon, 22)}</span>
            <span class="path__text">
              <span class="path__title">${esc(o.title)}</span>
              <span class="path__desc">${esc(o.desc)}</span>
            </span>
            ${icon("chevron-right-20", 20)}
          </span>
        </button>`).join("")}
    </div>`);
  el.addEventListener("click", (e) => {
    const b = e.target.closest("[data-path]");
    if (b) onPick(copy.options.find((o) => o.id === b.dataset.path));
  });
  el.stagger = (gap) => stagger([...el.children], gap);
  return el;
}

export const infoHint = (text) => html(`
  <div class="info-hint">${icon("info-14", 14)}<p>${esc(text)}</p></div>`);

/* H08a — what I know vs what's missing, from state.plan. */
export function knownCard(copy) {
  const plan = getState().plan;
  const known = [], missing = [];
  copy.items.forEach((it) => {
    if (!it.plan || plan[it.plan] === "done") known.push(it.known);
    else missing.push(it);
  });
  return html(`
    <section class="known">
      <div class="known__group">
        <p class="known__label">${esc(copy.knownLabel)}</p>
        ${known.map((t) => `
          <div class="known__row"><span class="known__dot is-known">${icon("check-12-green", 12)}</span><span>${esc(t)}</span></div>`).join("")}
      </div>
      ${missing.length ? `
        <hr class="known__divider">
        <div class="known__group">
          <p class="known__label">${esc(copy.missingLabel)}</p>
          ${missing.map((it) => `
            <div class="known__row is-missing"><span class="known__dot">${icon(it.icon, 12)}</span><span>${esc(it.missing)}</span></div>`).join("")}
        </div>` : ""}
    </section>`);
}

/* A row of choice chips (some with icons). onChoose(chip). */
export function choiceChips(chips, { onChoose }) {
  const el = html(`
    <div class="chat-actions">
      ${chips.map((c) => `
        <button class="chip${c.primary ? " chip--primary" : ""}${c.icon ? " chip--icon" : ""} tap" type="button" data-choice="${c.id}">
          ${c.icon ? icon(c.icon, 16) : ""}${esc(c.label)}
        </button>`).join("")}
    </div>`);
  el.addEventListener("click", (e) => {
    const b = e.target.closest("[data-choice]");
    if (b) onChoose(chips.find((c) => c.id === b.dataset.choice));
  });
  return el;
}

export const draftLabel = (text) => html(`
  <p class="draft-label">${icon("info-12-amber", 12)}<span>${esc(text)}</span></p>`);

/* H08b — one day card. Open slots call onSlot(slot.open). */
export function dayCard(day, { onSlot }) {
  const el = html(`
    <section class="day" aria-label="${esc(day.title)}">
      <div class="day__head"><span class="day__title">${esc(day.title)}</span><span class="day__tag">${esc(day.tag)}</span></div>
      ${day.slots.map((s, i) => `
        <div class="day__slot">
          <span class="day__dot">${icon(s.icon, 13)}</span>
          <span class="day__body">
            <span class="day__time">${esc(s.time)}</span>
            <span class="day__text">${esc(s.text)}</span>
            ${s.open ? `<button class="open-slot tap" type="button" data-slot="${i}">${icon("plus-12", 12)}${esc(s.open.label)}</button>` : ""}
          </span>
        </div>`).join("")}
    </section>`);
  el.addEventListener("click", (e) => {
    const b = e.target.closest("[data-slot]");
    if (b) onSlot(day.slots[+b.dataset.slot].open);
  });
  return el;
}
