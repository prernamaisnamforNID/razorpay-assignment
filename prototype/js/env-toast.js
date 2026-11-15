/* Canvas toast: a one-line note on the simulation canvas, outside the phone
   (top-centre of the stage). For evaluator messages, not app UI. */
import { timing } from "../data/journey.js";

let timer = null;
const el = () => document.querySelector(".env-toast");

export function envToast(text, duration = timing.envToast) {
  const t = el();
  if (!t) return;
  clearTimeout(timer);
  t.textContent = text;
  t.hidden = false;
  t.getBoundingClientRect(); // commit the start state so the fade-in runs
  t.classList.add("is-in");
  timer = setTimeout(hideEnvToast, duration);
}

export function hideEnvToast() {
  const t = el();
  if (!t) return;
  clearTimeout(timer);
  t.classList.remove("is-in");
  timer = setTimeout(() => { t.hidden = true; }, 250);
}

/* Pulse the Restart buttons once (end of the prototype). */
export function pulseRestart() {
  document.querySelectorAll("[data-restart]").forEach((b) => {
    b.classList.remove("is-pulsing");
    void b.offsetWidth; // restart the animation
    b.classList.add("is-pulsing");
    b.addEventListener("animationend", () => b.classList.remove("is-pulsing"), { once: true });
  });
}
