/* "Your trip so far" card (Figma 25:29): header + scroll-snap row of summary
   cards + pager. Tapping a card (or its pencil) calls onEdit(cardId). */
import { html, esc } from "../dom.js";
import { reduceMotion } from "./chat.js";

const icon = (name, size) =>
  `<img class="icon" src="assets/icons/${name}.svg" width="${size}" height="${size}" alt="" draggable="false">`;

const avatars = (list) => `
  <span class="ts-avatars">${list.map((a) =>
    `<span class="ts-avatar" style="background:${a.bg}">${esc(a.letter)}</span>`).join("")}</span>`;

const card = (c) => `
  <button class="ts-card tap" type="button" data-edit="${c.id}" aria-label="${esc(`Edit ${c.label.toLowerCase()}: ${c.value}`)}">
    <span class="ts-card__top">
      <span class="ts-card__icon">${icon(c.icon, 18)}</span>
      <span class="ts-card__edit">${icon("pencil", 15)}</span>
    </span>
    <span class="ts-card__label">${esc(c.label)}</span>
    <span class="ts-card__value">${esc(c.value)}</span>
    ${c.avatars ? avatars(c.avatars) : ""}
    <span class="ts-card__note">${esc(c.note)}</span>
  </button>`;

export function tripSummary(copy, { onEdit }) {
  const n = copy.cards.length;
  const el = html(`
    <section class="ts" aria-label="${esc(copy.title)}">
      <div class="ts__head">
        <span class="ts__check">${icon("check", 20)}</span>
        <span class="ts__titles">
          <span class="ts__title">${esc(copy.title)}</span>
          <span class="ts__sub">${esc(copy.subtitle)}<span class="ts__confirmed" hidden>✓ ${esc(copy.confirmed)}</span></span>
        </span>
      </div>
      <div class="ts__scroller">${copy.cards.map(card).join("")}</div>
      <div class="ts__pager" aria-hidden="true"></div>
    </section>`);

  const scroller = el.querySelector(".ts__scroller");
  const pager = el.querySelector(".ts__pager");
  const cards = [...scroller.children];
  let index = -1;
  const goTo = (i) => scroller.scrollTo({ left: cards[i].offsetLeft - cards[0].offsetLeft, behavior: "smooth" });

  /* Pager: the pill sits where the current dot would be. */
  function setIndex(i) {
    if (i === index) return;
    index = i;
    pager.innerHTML = Array.from({ length: n }, (_, k) => k === i
      ? `<span class="ts__pill">${i + 1}/${n}</span>`
      : `<button class="ts__dot" type="button" data-go="${k}" tabindex="-1"></button>`).join("");
  }
  setIndex(0);

  scroller.addEventListener("scroll", () => {
    const max = scroller.scrollWidth - scroller.clientWidth;
    if (scroller.scrollLeft >= max - 2) return setIndex(n - 1);
    const step = cards[1].offsetLeft - cards[0].offsetLeft;
    setIndex(Math.round(scroller.scrollLeft / step));
  }, { passive: true });

  pager.addEventListener("click", (e) => {
    const dot = e.target.closest("[data-go]");
    if (dot) goTo(+dot.dataset.go);
  });

  // Mouse drag-to-scroll (desktop reviewers); touch scrolls natively.
  let drag = null;
  scroller.addEventListener("pointerdown", (e) => {
    if (e.pointerType !== "mouse") return;
    drag = { x: e.clientX, left: scroller.scrollLeft, moved: false };
  });
  const onMove = (e) => {
    if (!drag) return;
    const dx = e.clientX - drag.x;
    if (Math.abs(dx) > 4 && !drag.moved) { drag.moved = true; scroller.classList.add("is-dragging"); }
    if (drag.moved) scroller.scrollLeft = drag.left - dx;
  };
  const onUp = () => {
    if (!drag) return;
    const moved = drag.moved;
    drag = null;
    if (!moved) return;
    scroller.classList.remove("is-dragging");
    goTo(index);
    // swallow the click that ends a drag
    scroller.addEventListener("click", (e) => e.stopPropagation(), { capture: true, once: true });
  };
  window.addEventListener("pointermove", onMove);
  window.addEventListener("pointerup", onUp);
  el.destroy = () => {
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("pointerup", onUp);
  };

  scroller.addEventListener("click", (e) => {
    const c = e.target.closest("[data-edit]");
    if (c) onEdit(c.dataset.edit);
  });

  /* Cards slide in from the right, `gap` ms apart. */
  el.stagger = (gap) => {
    if (reduceMotion.matches) return;
    cards.forEach((c, i) => c.animate(
      [{ opacity: 0, transform: "translateX(24px)" }, { opacity: 1, transform: "none" }],
      { duration: 240, delay: i * gap, easing: "cubic-bezier(.2,.8,.2,1)", fill: "backwards" },
    ));
  };

  el.setConfirmed = (instant = false) => {
    el.classList.add("is-confirmed");
    const badge = el.querySelector(".ts__confirmed");
    badge.hidden = false;
    if (!instant && !reduceMotion.matches) {
      badge.animate([{ opacity: 0, transform: "scale(.8)" }, { opacity: 1, transform: "none" }],
        { duration: 240, easing: "cubic-bezier(.2,.8,.2,1)" });
    }
  };

  return el;
}
