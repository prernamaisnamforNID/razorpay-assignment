/* Myra's "Working on your request…" loading card.
   Cycles through steps (crossfade), then collapses to a "Done" row that
   re-expands to show every step. Copy comes from the caller (data file). */
import { html, esc } from "../dom.js";
import { reduceMotion } from "./chat.js";

const SPARKLE = `<img class="icon" src="assets/brand/myra-sparkle.svg" width="16" height="16" alt="" draggable="false">`;
const CHEVRON = `<img class="icon mw__chev" src="assets/icons/chevron-down.svg" width="18" height="18" alt="" draggable="false">`;

export function myraWorking({ title, done, steps }) {
  const el = html(`
    <div class="mw is-working is-open">
      <button class="mw__head" type="button" aria-expanded="true" disabled>
        ${SPARKLE}
        <span class="mw__title shimmer">${esc(title)}</span>
        ${CHEVRON}
      </button>
      <div class="mw__body">
        <div class="mw__inner">
          <div class="mw__step">
            <p class="mw__step-title shimmer"></p>
            <p class="mw__step-desc shimmer"></p>
          </div>
        </div>
      </div>
    </div>`);

  const head = el.querySelector(".mw__head");
  const titleEl = el.querySelector(".mw__title");
  const body = el.querySelector(".mw__body");
  const inner = el.querySelector(".mw__inner");
  const stepEl = el.querySelector(".mw__step");

  const fill = (i) => {
    stepEl.querySelector(".mw__step-title").textContent = steps[i].title;
    stepEl.querySelector(".mw__step-desc").textContent = steps[i].desc;
  };

  /* Show step i — crossfades from the previous one. */
  el.showStep = (i, instant = false) => {
    if (instant || i === 0 || reduceMotion.matches) return fill(i);
    const out = stepEl.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 140, easing: "ease", fill: "forwards" });
    out.finished.then(() => {
      fill(i);
      out.cancel();
      stepEl.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 160, easing: "ease" });
    }, () => {});
  };

  /* Collapse into the "Done" row. Resolves when the animation ends. */
  el.finish = (duration, instant = false) => {
    const from = body.offsetHeight; // measure before the content changes
    el.classList.remove("is-working");
    titleEl.textContent = done;
    titleEl.classList.remove("shimmer");
    inner.innerHTML = steps.map((s) => `
      <div class="mw__step mw__step--done">
        <p class="mw__step-title">${esc(s.title)}</p>
        <p class="mw__step-desc">${esc(s.desc)}</p>
      </div>`).join("");
    head.disabled = false;
    return toggle(false, instant ? 0 : duration, from);
  };

  head.addEventListener("click", () => toggle(!el.classList.contains("is-open"), 260));

  function toggle(open, duration, from = body.offsetHeight) {
    el.classList.toggle("is-open", open);
    head.setAttribute("aria-expanded", String(open));
    const to = open ? inner.offsetHeight : 0;
    if (!duration) { body.style.height = open ? "" : "0px"; return Promise.resolve(); }
    const anim = body.animate([{ height: `${from}px` }, { height: `${to}px` }], { duration, easing: "cubic-bezier(.2,.8,.2,1)" });
    body.style.height = open ? "" : "0px";
    return anim.finished.catch(() => {});
  }

  return el;
}
