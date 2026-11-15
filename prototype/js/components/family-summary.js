/* "Planning around your family" card (Figma 48:229). Reads needs from state. */
import { html, esc } from "../dom.js";
import { people, peopleOrder, personPills, needCount } from "../family.js";
import { avatarStack } from "./question-card.js";
import { reduceMotion } from "./chat.js";

export function familySummary(copy, { onEdit }) {
  const el = html(`
    <section class="fs" aria-label="${esc(copy.title)}">
      <div class="fs__head">
        <span class="fs__icon"><img class="icon" src="assets/icons/users-white.svg" width="20" height="20" alt="" draggable="false"></span>
        <span class="fs__titles">
          <span class="fs__title">${esc(copy.title)}</span>
          <span class="fs__sub"><span class="fs__count"></span><span class="fs__confirmed" hidden>✓ ${esc(copy.confirmed)}</span></span>
        </span>
      </div>
      <div class="fs__people"></div>
      <div class="fs__lock">
        <img class="icon" src="assets/icons/lock.svg" width="13" height="13" alt="" draggable="false">
        <p>${esc(copy.lock)}</p>
      </div>
    </section>`);
  const list = el.querySelector(".fs__people");

  el.refresh = () => {
    const n = needCount();
    el.querySelector(".fs__count").textContent = n === 1 ? copy.subtitleOne : copy.subtitle.replace("{n}", n);
    list.innerHTML = peopleOrder.map((id) => {
      const pills = personPills(id);
      return `
        <div class="fs__person" data-person="${id}">
          ${avatarStack(people[id].avatars, "fs__avatar")}
          <div class="fs__body">
            <div class="fs__name-row">
              <span class="fs__name">${esc(people[id].name)}</span>
              <button class="fs__edit tap" type="button" data-edit="${id}" aria-label="Edit ${esc(people[id].name)}">
                <img class="icon" src="assets/icons/pencil-13.svg" width="13" height="13" alt="" draggable="false">
              </button>
            </div>
            <div class="fs__pills">
              ${pills.length
                ? pills.map((p) => `<button class="fs__pill" type="button" data-edit="${id}" data-key="${p.key}">${esc(p.label)}</button>`).join("")
                : `<span class="fs__none">${esc(copy.none)}</span>`}
            </div>
          </div>
        </div>`;
    }).join("");
  };

  list.addEventListener("click", (e) => {
    const t = e.target.closest("[data-edit]");
    if (t) onEdit(t.dataset.edit);
  });

  el.setConfirmed = (instant = false) => {
    el.classList.add("is-confirmed");
    const badge = el.querySelector(".fs__confirmed");
    badge.hidden = false;
    if (!instant && !reduceMotion.matches) {
      badge.animate([{ opacity: 0, transform: "scale(.8)" }, { opacity: 1, transform: "none" }],
        { duration: 240, easing: "cubic-bezier(.2,.8,.2,1)" });
    }
  };

  el.refresh();
  return el;
}
