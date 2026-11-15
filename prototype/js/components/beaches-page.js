/* H05 · Pondicherry page, Beaches tab (Figma 32:128) — the body of a page sheet.
   Copy: data/journey.js `beachesPage`. Hearts update state.savedBeaches. */
import { html, esc, sprite, SHEET_MYRA } from "../dom.js";
import { getState, toggleBeach } from "../state.js";
import { reduceMotion } from "./chat.js";

const icon = (name, size) =>
  `<img class="icon" src="assets/icons/${name}.svg" width="${size}" height="${size}" alt="" draggable="false">`;

/* onToast(text) shows a toast; onClose() closes the sheet. */
export function beachesPage(c, { onToast, onClose }) {
  const saved = getState().savedBeaches;
  const el = html(`
    <div class="bp">
      <div class="bp__scroll">
        <div class="bp__hero">
          <img class="bp__hero-img" src="${c.photo}" width="676" height="380" alt="${esc(c.photoAlt)}" draggable="false">
          <span class="bp__grabber" aria-hidden="true"></span>
          <img class="bp__hero-dots" src="assets/icons/photo-dots.svg" width="73" height="6" alt="" draggable="false">
          <button class="bp__close tap" type="button" aria-label="${esc(c.close)}">${icon("x-18", 18)}</button>
        </div>

        <div class="bp__head">
          <div class="bp__titles">
            <h2 class="bp__name">${esc(c.name)}</h2>
            <p class="bp__tagline">${esc(c.tagline)}</p>
            <p class="bp__checked">
              <img class="icon" src="assets/brand/myra-sparkle-12.svg" width="12" height="12" alt="" draggable="false">${esc(c.checked)}
            </p>
          </div>
          <div class="bp__tabs" role="tablist" aria-label="${esc(c.name)}">
            ${c.tabs.map((t) => `
              <button class="bp__tab tap${t.id === c.activeTab ? " is-active" : ""}" type="button" role="tab"
                aria-selected="${t.id === c.activeTab}" data-tab="${t.id}">${esc(t.label)}</button>`).join("")}
          </div>
        </div>

        <section class="bp__content" aria-labelledby="bp-title">
          <div class="bp__section-head">
            <h3 class="bp__title" id="bp-title">${esc(c.title)}</h3>
            <p class="bp__sub">${esc(c.sub)}</p>
          </div>

          <ul class="bp__row" aria-label="${esc(c.title)}">
            ${c.beaches.map((b) => beachCard(c, b, saved.includes(b.id))).join("")}
            <li class="bp__all">
              <button class="bp__all-btn tap" type="button" data-all>
                <span class="bp__all-icon">${icon("arrow-right-20-blue", 20)}</span>
                <span class="bp__all-title">${esc(c.seeAll.title)}</span>
                <span class="bp__all-sub">${esc(c.seeAll.sub)}</span>
              </button>
            </li>
          </ul>
          <div class="bp__dots" aria-hidden="true">
            ${[...c.beaches, null].map((_, i) => `<span class="bp__dot${i ? "" : " is-on"}"></span>`).join("")}
          </div>

          <div class="bp__left-out">
            ${icon("eye-off-16", 16)}
            <div class="bp__left-text">
              <p class="bp__left-title">${esc(c.leftOut.title)}</p>
              <p class="bp__left-reason">${esc(c.leftOut.reason)}</p>
              <button class="bp__link tap" type="button" data-show-anyway>${esc(c.leftOut.action)}</button>
            </div>
          </div>
        </section>
      </div>

      <div class="bp__myra">
        <p class="bp__myra-head">
          <span class="bp__myra-name">Myra<img class="icon" src="assets/brand/myra-sparkle-11.svg" width="11" height="11" alt="" draggable="false"></span>
          <span class="bp__myra-context">${esc(c.context)}</span>
        </p>
        <div class="bp__chips">
          ${c.chips.map((t) => `<button class="chip tap" type="button" data-chip>${esc(t)}</button>`).join("")}
        </div>
        <div class="bp__ask">
          <button class="bp__ask-field" type="button" data-ask>${esc(c.ask)}</button>
          <button class="bp__speak tap" type="button" data-ask aria-label="Speak">
            ${sprite("Speak button", 69, 27, 515.94, 2962.96, -384.06, -2740.74, "", SHEET_MYRA)}
          </button>
        </div>
      </div>
    </div>`);

  el.addEventListener("click", (e) => {
    const t = e.target;
    if (t.closest(".bp__close")) return onClose();
    const heart = t.closest(".bp__heart");
    if (heart) return toggleSaved(heart);
    const tab = t.closest("[data-tab]");
    if (tab) return tab.dataset.tab === c.activeTab ? null : onToast(c.toast);
    if (t.closest("[data-show-anyway]")) return onToast(c.leftOut.toast);
    if (t.closest("[data-all], [data-details], [data-chip], [data-ask]")) return onToast(c.toast);
  });

  function toggleSaved(heart) {
    toggleBeach(heart.dataset.beach);
    const on = getState().savedBeaches.includes(heart.dataset.beach);
    heart.setAttribute("aria-pressed", String(on));
    heart.querySelector("img").src = `assets/icons/${on ? "heart-15-filled" : "heart-15"}.svg`;
    if (reduceMotion.matches) return;
    heart.animate(
      on
        ? [{ transform: "scale(1)" }, { transform: "scale(1.3)" }, { transform: "scale(.9)" }, { transform: "scale(1.05)" }, { transform: "scale(1)" }]
        : [{ transform: "scale(1)" }, { transform: "scale(.85)" }, { transform: "scale(1)" }],
      { duration: on ? 520 : 200, easing: "ease-out" },
    );
  }

  // Pager dots follow the card row (3 beaches + "See all").
  const row = el.querySelector(".bp__row");
  const dots = [...el.querySelectorAll(".bp__dot")];
  let raf = 0;
  row.addEventListener("scroll", () => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      const items = [...row.children];
      const max = row.scrollWidth - row.clientWidth;
      const i = row.scrollLeft >= max - 2
        ? items.length - 1
        : Math.round(row.scrollLeft / (items[1].offsetLeft - items[0].offsetLeft));
      dots.forEach((d, k) => d.classList.toggle("is-on", k === i));
    });
  }, { passive: true });

  return el;
}

function beachCard(c, b, isSaved) {
  const crop = b.crop
    ? `style="left:${b.crop.left}%;top:${b.crop.top}%;width:${b.crop.width}%;height:${b.crop.height}%"`
    : "";
  return `
    <li class="beach">
      <div class="beach__photo">
        ${b.photo ? `<img class="beach__img" src="${b.photo}" ${crop} alt="${esc(b.photoAlt)}" draggable="false" loading="lazy">` : ""}
        <button class="beach__heart bp__heart" type="button" data-beach="${b.id}" aria-pressed="${isSaved}"
          aria-label="${esc(c.save.replace("{name}", b.name))}">${icon(isSaved ? "heart-15-filled" : "heart-15", 15)}</button>
        <span class="beach__rating"><span class="sr-only">Rated </span>${esc(b.rating)}</span>
      </div>
      <div class="beach__body">
        <h4 class="beach__name">${esc(b.name)}</h4>
        ${b.distance ? `<p class="beach__distance">${icon("car-13", 13)}${esc(b.distance)}</p>` : ""}
        <ul class="beach__fits">
          ${b.fits.map((f) => `
            <li class="beach__fit${f.ok ? "" : " is-warn"}">
              ${icon(f.ok ? "check-12-green" : "info-12-amber", 12)}${esc(f.text)}
            </li>`).join("")}
        </ul>
        <button class="bp__link beach__details tap" type="button" data-details>${esc(c.details)}</button>
      </div>
    </li>`;
}
