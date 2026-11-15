/* Chat building blocks shared by Myra chat screens (Figma 25:19):
   Myra label, Myra text, user bubble, timestamp, typing dots — plus a
   cancellable "run" for staged conversations and the timing helper. */
import { html, esc } from "../dom.js";
import { timing } from "../../data/journey.js";

export const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

/* A delay from data/journey.js `timing`, shortened when reduced motion is on. */
export const ms = (key) => Math.round(timing[key] * (reduceMotion.matches ? timing.reducedMotionScale : 1));

/* A staged conversation. wait() pauses; stop() cancels everything pending.
   In instant mode (replaying a conversation on Back) waits are skipped;
   set run.instant = false once the replay is done so the chat goes live again. */
export function createRun({ instant = false } = {}) {
  let alive = true;
  const timers = new Set();
  const run = {
    instant,
    get alive() { return alive; },
    wait(delay) {
      if (!alive) return new Promise(() => {});
      if (run.instant) return Promise.resolve();
      return new Promise((resolve) => {
        const id = setTimeout(() => { timers.delete(id); if (alive) resolve(); }, delay);
        timers.add(id);
      });
    },
    stop() { alive = false; timers.forEach(clearTimeout); timers.clear(); },
  };
  return run;
}

export function clock(fixed) {
  return fixed || new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

export const myraLabel = () => html(`
  <div class="chat-label">
    <span class="chat-label__name">Myra</span>
    <img class="icon" src="assets/brand/myra-sparkle-14.svg" width="14" height="14" alt="" draggable="false">
  </div>`);

export const myraText = (text) => html(`<p class="chat-text">${esc(text)}</p>`);

export const userBubble = (text) => html(`
  <div class="chat-user"><p class="chat-user__bubble">${esc(text)}</p></div>`);

export const timestamp = (text, side = "left") => html(`<p class="chat-time chat-time--${side}">${esc(text)}</p>`);

export const typingDots = () => html(`
  <div class="chat-typing" role="status" aria-label="Myra is typing"><i></i><i></i><i></i></div>`);

/* Add an element to the log with an entrance, then scroll to it.
   anim: "rise" (Myra), "user" (scales in from the input bar), "none". */
export function append(log, el, { anim = "rise", instant = false } = {}) {
  log.append(el);
  if (!instant && anim !== "none") {
    el.animate(...entrance(anim));
  }
  scrollToEnd(log, instant);
  return el;
}

function entrance(anim) {
  if (reduceMotion.matches) return [[{ opacity: 0 }, { opacity: 1 }], { duration: 200, easing: "ease" }];
  if (anim === "user") {
    return [[{ opacity: 0, transform: "translateY(40px) scale(.92)" }, { opacity: 1, transform: "none" }],
      { duration: 280, easing: "cubic-bezier(.2,.8,.2,1)" }];
  }
  return [[{ opacity: 0, transform: "translateY(8px)" }, { opacity: 1, transform: "none" }],
    { duration: 240, easing: "cubic-bezier(.2,.8,.2,1)" }];
}

/* Fade an element out, then remove it. */
export function fadeOut(el, instant = false) {
  if (instant) { el.remove(); return Promise.resolve(); }
  const a = el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 160, easing: "ease", fill: "forwards" });
  return a.finished.then(() => el.remove(), () => el.remove());
}

export function scrollToEnd(log, instant = false) {
  const scroller = log.closest(".screen__scroll");
  if (!scroller) return;
  requestAnimationFrame(() => {
    scroller.scrollTo({ top: scroller.scrollHeight, behavior: instant || reduceMotion.matches ? "auto" : "smooth" });
  });
}
