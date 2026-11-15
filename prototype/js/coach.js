/* "Start here" coach mark: dims + blurs the whole page except a spotlight on
   [data-coach-target], with a tooltip above it. Placeholder style — restyle in
   css/coach.css. Follows the target every frame while visible, so it tracks
   window resizes, phone rescaling and layout changes. */

const COPY = {
  title: "Start here",
  text: "Tap Myra to plan a family weekend in Pondicherry.",
  sub: "You're Anjali, planning for 5. Use Try saying to talk to Myra; tap everything else in the app.",
};

const SPARKLE = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9.94 15.5A2 2 0 0 0 8.5 14.06l-6.14-1.58a.5.5 0 0 1 0-.96L8.5 9.94A2 2 0 0 0 9.94 8.5l1.58-6.14a.5.5 0 0 1 .96 0L14.06 8.5a2 2 0 0 0 1.44 1.44l6.14 1.58a.5.5 0 0 1 0 .96L15.5 14.06a2 2 0 0 0-1.44 1.44l-1.58 6.14a.5.5 0 0 1-.96 0z"/><path d="M20 3v4"/><path d="M22 5h-4"/><path d="M4 17v2"/><path d="M5 18H3"/></svg>`;
const CLOSE = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>`;

const GAP = 14;     // space between spotlight and tooltip
const MARGIN = 12;  // min distance from viewport edges
const PAD = 8;      // spotlight padding around the target

let root, tip, arrow, hit, closeBtn, raf = 0, last = "", onActivate = () => {};

export function initCoach(opts) {
  onActivate = opts.onActivate;
  root = document.createElement("div");
  root.className = "coach";
  root.hidden = true;
  root.setAttribute("role", "dialog");
  root.setAttribute("aria-modal", "true");
  root.setAttribute("aria-labelledby", "coach-title");
  root.setAttribute("aria-describedby", "coach-text");
  root.innerHTML = `
    <div class="coach__scrim"></div>
    <div class="coach__ring" aria-hidden="true"></div>
    <button class="coach__hit" type="button" aria-label="Open Myra"></button>
    <div class="coach__tip">
      <div class="coach__head">
        <span class="coach__icon">${SPARKLE}</span>
        <span class="coach__title" id="coach-title">${COPY.title}</span>
        <button class="coach__close" type="button" aria-label="Close">${CLOSE}</button>
      </div>
      <div class="coach__body" id="coach-text">
        <p class="coach__text">${COPY.text}</p>
        <p class="coach__sub">${COPY.sub}</p>
      </div>
      <span class="coach__arrow" aria-hidden="true"></span>
    </div>`;
  document.body.append(root);

  tip = root.querySelector(".coach__tip");
  arrow = root.querySelector(".coach__arrow");
  hit = root.querySelector(".coach__hit");
  closeBtn = root.querySelector(".coach__close");

  hit.addEventListener("click", () => { hideCoach(); onActivate(); });
  closeBtn.addEventListener("click", hideCoach);
  root.addEventListener("keydown", onKey);
}

export function showCoach() {
  if (!root || coachVisible()) return;
  root.hidden = false;
  setInert(true);
  last = "";
  tick();
  root.getBoundingClientRect();
  root.classList.add("is-in");
  hit.focus({ preventScroll: true });
}

export function hideCoach() {
  if (!coachVisible()) return;
  root.classList.remove("is-in");
  cancelAnimationFrame(raf);
  setInert(false);
  setTimeout(() => { if (!root.classList.contains("is-in")) root.hidden = true; }, 250);
}

export const coachVisible = () => root && !root.hidden && root.classList.contains("is-in");

function tick() {
  position();
  raf = requestAnimationFrame(tick);
}

function position() {
  const target = document.querySelector("[data-coach-target]");
  if (!target) return;
  const r = target.getBoundingClientRect();
  const cx = r.left + r.width / 2;
  const cy = r.top + r.height / 2;
  const rad = Math.max(r.width, r.height) / 2 + PAD;
  const vw = window.innerWidth;
  const key = [cx, cy, rad, vw, window.innerHeight].map(Math.round).join();
  if (key === last) return;
  last = key;

  root.style.setProperty("--cx", `${cx}px`);
  root.style.setProperty("--cy", `${cy}px`);
  root.style.setProperty("--r", `${rad}px`);

  const tw = tip.offsetWidth;
  const left = Math.min(Math.max(MARGIN, cx - tw / 2), vw - MARGIN - tw);
  tip.style.left = `${left}px`;
  tip.style.bottom = `${window.innerHeight - (cy - rad) + GAP}px`;
  arrow.style.left = `${cx - left}px`;
}

function onKey(e) {
  if (e.key === "Escape") return hideCoach();
  if (e.key !== "Tab") return;
  // Keep focus inside the coach mark: the spotlight button and the close button.
  e.preventDefault();
  (document.activeElement === hit ? closeBtn : hit).focus();
}

/* Everything except the coach mark is unreachable while it's open. */
function setInert(on) {
  document.querySelectorAll("body > :not(.coach)").forEach((el) => { el.inert = on; });
}
