/* Screen stack: push / pop / replace / reset with iOS-style slides.
   Only the top screen stays in the DOM; screens re-render from state on pop. */
import { setState } from "./state.js";

const DURATION = 280;
const EASE = "cubic-bezier(.2,.8,.2,1)";
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

let host = null;        // .app__stack element
let screens = {};       // id -> screen module { render(ctx), theme? }
let makeContext = null; // (id) => ctx passed to render
let stack = [];
let current = null;     // { id, el, mod }
let running = [];       // animations in flight

export function initRouter(stackEl, registry, contextFactory) {
  host = stackEl;
  screens = registry;
  makeContext = contextFactory;
}

export const getStack = () => [...stack];
export const canPop = () => stack.length > 1;

export function push(id) {
  stack.push(id);
  show(id, "push");
}

export function pop() {
  if (!canPop()) return;
  stack.pop();
  show(stack[stack.length - 1], "pop");
}

export function replace(id) {
  stack[stack.length - 1] = id;
  show(id, "fade");
}

/* Replace the whole stack (journey jumps, scenarios, restart). */
export function reset(ids, transition = "fade") {
  stack = [...ids];
  show(stack[stack.length - 1], transition);
}

function show(id, transition) {
  const mod = screens[id];
  if (!mod) throw new Error(`No screen registered for "${id}"`);

  running.forEach((a) => a.finish());
  running = [];

  // Modal screens (presentation: "modal") slide up on push and down on pop.
  if (transition === "push" && mod.presentation === "modal") transition = "modal-in";
  if (transition === "pop" && current?.mod.presentation === "modal") transition = "modal-out";

  setState({ step: id, substep: null, busy: false });
  const ctx = { ...makeContext(id), transition };
  const el = mod.render(ctx);
  el.classList.add("screen");
  el.dataset.screen = id;
  const app = host.closest(".app");
  app.dataset.theme = mod.theme || "light";
  app.dataset.screen = id;
  app.toggleAttribute("data-status-icons", !!mod.statusIcons);

  const prev = current;
  current = { id, el, mod, ctx };

  // Incoming sits under the outgoing when the outgoing is the one that moves.
  if (transition === "pop" || transition === "modal-out") host.prepend(el);
  else host.append(el);

  if (!prev) return;
  if (transition === "none") return removeScreen(prev);

  let anims;
  if (reduceMotion.matches || transition === "fade") anims = fade(prev.el, el);
  else if (transition === "modal-in") anims = modal(el, true);
  else if (transition === "modal-out") anims = modal(prev.el, false);
  else anims = slide(prev.el, el, transition === "push");

  running = anims;
  Promise.all(anims.map((a) => a.finished.catch(() => {}))).then(() => removeScreen(prev));
}

/* The screen on top right now (module, element, the context it was rendered with). */
export const currentScreen = () => current;

function removeScreen(screen) {
  screen.mod.destroy?.(screen.el);
  screen.el.remove();
}

/* Incoming animations end on the natural state (fill none); outgoing hold
   their last frame until the element is removed (fill forwards). */
function slide(outEl, inEl, forward) {
  const inOpts = { duration: DURATION, easing: EASE };
  const outOpts = { ...inOpts, fill: "forwards" };
  const back = "translateX(-30%)";
  const off = "translateX(100%)";
  const shadow = "-8px 0 24px rgba(0,0,0,.12)";
  if (forward) {
    return [
      inEl.animate([{ transform: off, boxShadow: shadow }, { transform: "none", boxShadow: shadow }], inOpts),
      outEl.animate([{ transform: "none", filter: "brightness(1)" }, { transform: back, filter: "brightness(.92)" }], outOpts),
    ];
  }
  return [
    outEl.animate([{ transform: "none", boxShadow: shadow }, { transform: off, boxShadow: shadow }], outOpts),
    inEl.animate([{ transform: back, filter: "brightness(.92)" }, { transform: "none", filter: "brightness(1)" }], inOpts),
  ];
}

/* Full-screen modal: slides up over the screen below, or back down off it. */
function modal(el, up) {
  const frames = [{ transform: "translateY(100%)" }, { transform: "none" }];
  return [el.animate(up ? frames : frames.reverse(), { duration: DURATION, easing: EASE, fill: up ? "none" : "forwards" })];
}

function fade(outEl, inEl) {
  const inOpts = { duration: 200, easing: "ease" };
  return [
    inEl.animate([{ opacity: 0 }, { opacity: 1 }], inOpts),
    outEl.animate([{ opacity: 1 }, { opacity: 0 }], { ...inOpts, fill: "forwards" }),
  ];
}
