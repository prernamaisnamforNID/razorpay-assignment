/* H04 building blocks (Figma 91:2): "Planning around" strip (91:31),
   destination card (91:57) and the rain note (91:96). Copy: data/journey.js `destination`. */
import { html, esc } from "../dom.js";
import { stripPills, people } from "../family.js";
import { reduceMotion } from "./chat.js";

const icon = (name, size) =>
  `<img class="icon" src="assets/icons/${name}.svg" width="${size}" height="${size}" alt="" draggable="false">`;

/* Who Myra is planning around, from state.needs. el.refresh() re-reads it. */
export function planningStrip(copy, { onEdit }) {
  const el = html(`
    <section class="around" aria-label="${esc(copy.title)}">
      <div class="around__head">
        ${icon("users-14", 14)}
        <span class="around__title">${esc(copy.title)}</span>
        <button class="around__edit tap" type="button" aria-label="Edit family needs">· ${esc(copy.edit)}</button>
      </div>
      <div class="around__pills"></div>
    </section>`);
  const box = el.querySelector(".around__pills");

  el.refresh = () => {
    const pills = stripPills();
    box.innerHTML = pills.length
      ? pills.map((p) => {
        const a = people[p.person].avatars[0];
        return `
          <span class="around__pill">
            <span class="around__avatar" style="background:${a.bg}" aria-hidden="true">${esc(a.letter)}</span>
            <span><span class="sr-only">${esc(people[p.person].name)}: </span>${esc(p.label)}</span>
          </span>`;
      }).join("")
      : `<span class="around__none">${esc(copy.none)}</span>`;
  };

  el.querySelector(".around__edit").addEventListener("click", onEdit);
  el.refresh();
  return el;
}

/* Pondicherry card: photo, name, save heart, "Known for" tags, Explore link. */
export function destinationCard(c, { onExplore }) {
  const el = html(`
    <article class="dest" aria-label="${esc(c.name)}">
      <div class="dest__photo"><img src="${c.photo}" width="676" height="380" alt="${esc(c.photoAlt)}" draggable="false"></div>
      <div class="dest__info">
        <div class="dest__top">
          <h3 class="dest__name">${esc(c.name)}</h3>
          <button class="dest__heart" type="button" aria-pressed="false" aria-label="${esc(c.save)}">${icon("heart-20", 20)}</button>
        </div>
        <p class="dest__tagline">${esc(c.tagline)}</p>
        <p class="dest__label">${esc(c.knownFor)}</p>
        <ul class="dest__tags">
          ${c.tags.map((t) => `<li class="dest__tag">${icon(t.icon, 13)}${esc(t.label)}</li>`).join("")}
        </ul>
        <button class="dest__explore tap" type="button">${esc(c.explore)}</button>
      </div>
    </article>`);

  const heart = el.querySelector(".dest__heart");
  heart.addEventListener("click", () => {
    const on = heart.getAttribute("aria-pressed") !== "true";
    heart.setAttribute("aria-pressed", String(on));
    heart.querySelector("img").src = `assets/icons/${on ? "heart-20-filled" : "heart-20"}.svg`;
    if (reduceMotion.matches) return;
    // Spring: overshoot, undershoot, settle.
    heart.animate(
      on
        ? [{ transform: "scale(1)" }, { transform: "scale(1.35)" }, { transform: "scale(.88)" }, { transform: "scale(1.06)" }, { transform: "scale(1)" }]
        : [{ transform: "scale(1)" }, { transform: "scale(.82)" }, { transform: "scale(1)" }],
      { duration: on ? 520 : 200, easing: "ease-out" },
    );
  });
  el.querySelector(".dest__explore").addEventListener("click", onExplore);
  return el;
}

export const rainNote = (text) => html(`
  <div class="rain-note">${icon("cloud-rain-18", 18)}<p>${esc(text)}</p></div>`);
