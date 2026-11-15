/* Plan checklist (Figma 53:19; "in progress" step 91:134) — pinned under a chat header.
   Reads state.plan; hidden until Family is done, then slides down.
   A step that changes state pops (1 → 1.08 → 1) and crossfades its colours. */
import { html, esc } from "../dom.js";
import { planSteps } from "../../data/journey.js";
import { getState, subscribe } from "../state.js";
import { reduceMotion } from "./chat.js";

const icon = (name) => `<img class="icon" src="assets/icons/${name}.svg" width="13" height="13" alt="" draggable="false">`;

export function planChecklist({ onStep }) {
  const el = html(`
    <div class="plan" hidden>
      <div class="plan__row" role="list" aria-label="Your plan"></div>
    </div>`);
  const row = el.querySelector(".plan__row");
  let last = {};

  function render() {
    const plan = getState().plan;
    row.innerHTML = planSteps.map((s) => {
      const st = plan[s.id];
      const ic = st === "done" ? "plan-check"
        : st === "draft" ? (s.draftIcon || s.todoIcon)
        : st === "active" ? (s.activeIcon || s.todoIcon)
        : s.todoIcon;
      const label = st === "draft" && s.draftLabel ? s.draftLabel : s.label;
      const said = { todo: "to do", active: "in progress" }[st] || st;
      return `
        <button class="plan__step tap is-${st}" type="button" role="listitem" data-step="${s.id}"
          aria-label="${esc(`${s.label}: ${said}`)}">
          ${icon(ic)}<span>${esc(label)}</span>
        </button>`;
    }).join("");
  }

  /* Show the row (slide down + fade) once Family is done. */
  function reveal(instant) {
    if (!el.hidden) return;
    el.hidden = false;
    el.closest(".chat-screen")?.classList.add("has-plan");
    if (instant || reduceMotion.matches) {
      if (!instant) el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200 });
      return;
    }
    const h = el.offsetHeight;
    el.animate(
      [{ height: "0px", opacity: 0, transform: "translateY(-8px)" }, { height: `${h}px`, opacity: 1, transform: "none" }],
      { duration: 280, easing: "cubic-bezier(.2,.8,.2,1)" },
    );
  }

  function sync(instant = false) {
    const plan = getState().plan;
    const changed = planSteps.filter((s) => last[s.id] && last[s.id] !== plan[s.id]).map((s) => s.id);
    const same = planSteps.every((s) => last[s.id] === plan[s.id]);
    last = { ...plan };
    if (same) return;
    render();
    if (plan.family === "done") reveal(instant);
    if (instant || reduceMotion.matches || el.hidden) return;
    changed.forEach((id) => row.querySelector(`[data-step="${id}"]`)?.animate(
      [{ transform: "scale(1)" }, { transform: "scale(1.08)" }, { transform: "scale(1)" }],
      { duration: 260, easing: "ease-out" },
    ));
  }

  row.addEventListener("click", (e) => {
    const b = e.target.closest("[data-step]");
    if (b) onStep(b.dataset.step);
  });

  const off = subscribe(() => sync());
  el.sync = sync;
  el.destroy = off;
  sync(true);
  return el;
}
