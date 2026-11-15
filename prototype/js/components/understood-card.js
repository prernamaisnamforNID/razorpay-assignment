/* "Here's what I understood about …" card (Figma 48:30).
   Pills come from state (js/family.js); × removes, tapping a pill opens the editor. */
import { html, esc } from "../dom.js";
import { groupPills, removeNeed } from "../family.js";
import { avatarStack } from "./question-card.js";
import { reduceMotion } from "./chat.js";

export function understoodCard({ groupId, avatars, title, footer, empty }, { onEdit }) {
  const el = html(`
    <section class="uc" aria-label="${esc(title)}">
      <div class="uc__head">
        ${avatarStack(avatars, "uc__avatar")}
        <p class="uc__title">${esc(title)}</p>
      </div>
      <div class="uc__pills"></div>
      <div class="uc__foot">
        <img class="icon" src="assets/icons/pencil-12.svg" width="12" height="12" alt="" draggable="false">
        <span>${esc(footer)}</span>
      </div>
    </section>`);
  const box = el.querySelector(".uc__pills");

  el.refresh = () => {
    const pills = groupPills(groupId);
    box.innerHTML = pills.length
      ? pills.map((p) => `
        <span class="pill" data-key="${p.key}" data-person="${p.person}">
          <button class="pill__label" type="button">${esc(p.label)}</button>
          <button class="pill__x tap" type="button" aria-label="Remove ${esc(p.label)}">
            <img class="icon" src="assets/icons/x-pill.svg" width="13" height="13" alt="" draggable="false">
          </button>
        </span>`).join("")
      : `<span class="uc__empty">${esc(empty)}</span>`;
  };

  box.addEventListener("click", (e) => {
    const pill = e.target.closest(".pill");
    if (!pill) return;
    if (e.target.closest(".pill__x")) return removePill(pill, () => removeNeed(pill.dataset.key));
    onEdit(pill.dataset.person);
  });

  el.refresh();
  return el;
}

/* Shrink + fade, then run `done` (which updates state). */
export function removePill(pill, done) {
  if (reduceMotion.matches) {
    const a = pill.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 120, fill: "forwards" });
    return a.finished.then(done, done);
  }
  const a = pill.animate(
    [{ opacity: 1, transform: "scale(1)" }, { opacity: 0, transform: "scale(.6)" }],
    { duration: 160, easing: "ease-in", fill: "forwards" },
  );
  a.finished.then(done, done);
}
