/* H06a building blocks (Figma 33:2): system note, beach-windows meter, inline map
   card, saved list and Myra's stay tip. Copy: data/journey.js `beachFit`. */
import { html, esc } from "../dom.js";
import { reduceMotion } from "./chat.js";

const icon = (name, size) =>
  `<img class="icon" src="assets/icons/${name}.svg" width="${size}" height="${size}" alt="" draggable="false">`;

/* Centered grey note: "♡ You saved 3 beaches" (33:20). */
export const systemNote = (text) => html(`
  <div class="sys-note"><span class="sys-note__pill">${icon("heart-12", 12)}${esc(text)}</span></div>`);

/* Beach windows meter (33:31). el.fill() animates the used segments in, one by one. */
export function fitMeter(m) {
  const el = html(`
    <section class="meter" aria-label="${esc(`${m.title}: ${m.used}`)}">
      <div class="meter__head">
        <span class="meter__title">${icon("clock-15", 15)}${esc(m.title)}</span>
        <span class="meter__used">${esc(m.used)}</span>
      </div>
      <ol class="meter__slots">
        ${m.slots.map((s, i) => `
          <li class="meter__slot${i < m.filled ? " is-used" : ""}">
            <span class="meter__bar" aria-hidden="true"><i></i></span>
            <span class="meter__label">${esc(s)}<span class="sr-only">${i < m.filled ? ": used" : ": free"}</span></span>
          </li>`).join("")}
      </ol>
      <p class="meter__note">${esc(m.note)}</p>
    </section>`);

  el.fill = (gap = 160) => {
    if (reduceMotion.matches) return;
    el.querySelectorAll(".meter__slot.is-used .meter__bar i").forEach((bar, i) => bar.animate(
      [{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }],
      { duration: 420, delay: 200 + i * gap, easing: "cubic-bezier(.2,.8,.2,1)", fill: "backwards" },
    ));
  };
  return el;
}

/* Inline map card (33:93). onOpen() opens the full map (H06b). */
export function mapCard(m, { onOpen }) {
  const el = html(`
    <section class="map-card" aria-label="${esc(m.title)}">
      <div class="map-card__head">
        <div class="map-card__text">
          <p class="map-card__title">${esc(m.title)}</p>
          <p class="map-card__sub">${esc(m.sub)}</p>
        </div>
        <button class="map-card__open tap" type="button">${icon("maximize-13", 13)}${esc(m.open)}</button>
      </div>
      <div class="map-card__map" role="img" aria-label="${esc(m.alt)}">
        <img class="map-card__base" src="assets/maps/beaches-inline.svg" width="358" height="210" alt="" draggable="false">
        ${m.labels.map((l) => `<span class="map-label map-label--${l.tone}" style="left:${l.x}px;top:${l.y}px">${esc(l.text)}</span>`).join("")}
        ${m.pins.map((p) => `
          <span class="map-pin map-pin--26" style="left:${p.x}px;top:${p.y}px">
            <img src="assets/icons/pin-26.svg" width="26" height="31" alt="" draggable="false"><b>${p.n}</b>
          </span>`).join("")}
        <img class="map-pin-grey" src="assets/icons/pin-grey-26.svg" width="34" height="39" alt="" draggable="false"
          style="left:${m.leftOut.x - 4}px;top:${m.leftOut.y - 2}px">
      </div>
    </section>`);
  el.querySelector(".map-card__open").addEventListener("click", onOpen);
  el.querySelector(".map-card__map").addEventListener("click", onOpen);
  return el;
}

/* Numbered saved list (33:133). names: beach names in pin order. */
export const savedList = (names) => html(`
  <ol class="saved-list" aria-label="Saved beaches">
    ${names.map((n, i) => `<li class="saved-list__item"><span class="saved-list__num">${i + 1}</span>${esc(n)}</li>`).join("")}
  </ol>`);

/* Myra's tip (33:146). */
export const myraTip = (text) => html(`
  <div class="myra-tip">
    <img class="icon" src="assets/brand/myra-sparkle.svg" width="16" height="16" alt="" draggable="false">
    <p>${esc(text)}</p>
  </div>`);
