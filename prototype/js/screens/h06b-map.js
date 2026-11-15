/* H06b v2 · Full-screen map: saved beaches → hotels around them (Figma 94:2).
   Opened from "Open map" on the H06a map card; Back returns to the chat.
   Copy + pin positions: data/journey.js `beachMap`. */
import { html, esc } from "../dom.js";
import { beachMap as c } from "../../data/journey.js";
import { markVisited } from "../state.js";

const icon = (name, size) =>
  `<img class="icon" src="assets/icons/${name}.svg" width="${size}" height="${size}" alt="" draggable="false">`;

function template() {
  return `
  <section class="bmap" aria-label="${esc(c.title)}">
    <div class="bmap__map" role="img" aria-label="${esc(c.alt)}">
      <img class="bmap__base" src="assets/maps/beaches-full.svg" width="390" height="844" alt="" draggable="false">
      ${c.labels.map((l) => `
        <span class="map-label map-label--${l.tone}" style="left:${l.x}px;top:${l.y}px;font-size:${l.size}px">${esc(l.text)}</span>`).join("")}
      ${c.pins.map((p) => `
        <span class="map-tag" style="left:${p.tagX}px;top:${p.y + 6.63}px">${esc(p.name)}</span>
        <span class="map-pin map-pin--34" style="left:${p.x}px;top:${p.y}px">
          <img src="assets/icons/pin-34.svg" width="34" height="41" alt="" draggable="false"><b>${p.n}</b>
        </span>`).join("")}
      <span class="map-tag" style="left:${c.leftOut.tagX}px;top:${c.leftOut.y + 6.63}px">${esc(c.leftOut.name)}</span>
      <img class="map-pin-grey" src="assets/icons/pin-grey-34.svg" width="42" height="49" alt="" draggable="false"
        style="left:${c.leftOut.x - 4}px;top:${c.leftOut.y - 2}px">
    </div>

    <div class="bmap__top">
      <div class="bmap__bar">
        <button class="bmap__round tap" type="button" data-back aria-label="${esc(c.back)}">${icon("chevron-left-20", 20)}</button>
        <p class="bmap__title">${icon("waves-16-blue", 16)}${esc(c.title)}</p>
        <button class="bmap__round tap" type="button" data-soon aria-label="${esc(c.layers)}">${icon("layers-20", 20)}</button>
      </div>
      <div class="bmap__filters">
        ${c.filters.map((f) => `
          <button class="chip bmap__filter tap${f.active ? " is-active" : ""}${f.icon ? " chip--icon" : ""}" type="button"
            aria-pressed="${!!f.active}" ${f.active ? "" : "data-soon"}>${f.icon ? icon(f.icon, 16) : ""}${esc(f.label)}</button>`).join("")}
      </div>
    </div>

    <div class="bmap__legend" aria-hidden="true">
      <span><i class="is-saved"></i>${esc(c.legend.saved)}</span>
      <span><i></i>${esc(c.legend.left)}</span>
    </div>
    <p class="bmap__fit">${icon("check-13-green", 13)}${esc(c.fit)}</p>

    <div class="bmap__card">
      <span class="bmap__handle" aria-hidden="true"></span>
      <p class="bmap__myra">Myra</p>
      <p class="bmap__text">${esc(c.card.text)}</p>
      <ul class="bmap__checks">
        ${c.card.checks.map((t) => `<li><span aria-hidden="true">✓</span> ${esc(t)}</li>`).join("")}
      </ul>
      <button class="bmap__primary tap" type="button" data-hotels>${esc(c.card.primary)}</button>
      <div class="bmap__near">
        ${c.card.near.map((t) => `<button class="chip bmap__near-btn tap" type="button" data-hotels>${esc(t)}</button>`).join("")}
      </div>
    </div>
  </section>`;
}

export default {
  theme: "light",
  statusIcons: true,

  render(ctx) {
    const el = html(template());
    markVisited("h06b");
    el.addEventListener("click", (e) => {
      if (e.target.closest("[data-back]")) return ctx.back();
      if (e.target.closest("[data-hotels]")) return ctx.toast(c.hotelsToast);
      if (e.target.closest("[data-soon]")) return ctx.toast(c.toast);
    });
    return el;
  },
};
