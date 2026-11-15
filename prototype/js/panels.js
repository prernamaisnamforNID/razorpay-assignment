/* Environment panels: scenario switcher, journey tracker, "Try saying" prompts,
   and the phone-layout drawer. Renders into every [data-slot] it finds, so the
   same lists appear in the side panels and in the drawer. */
import { steps, scenarios, ending, promptsFor, stepIndex, busyHint } from "../data/journey.js";
import { getState, subscribe } from "./state.js";
import { esc } from "./dom.js";

let handlers = {};
let lastPromptKey = "";

export function initPanels({ onScenario, onJump, onPrompt, onRestart }) {
  handlers = { onScenario, onJump, onPrompt, onRestart };

  slots("scenarios").forEach(renderScenarios);
  slots("journey").forEach(renderJourney);

  document.addEventListener("click", (e) => {
    const t = e.target.closest("[data-scenario],[data-jump],[data-prompt],[data-restart]");
    if (!t) return;
    if (t.dataset.scenario) handlers.onScenario(t.dataset.scenario);
    else if (t.dataset.jump) handlers.onJump(t.dataset.jump);
    else if (t.dataset.prompt !== undefined) handlers.onPrompt(t.dataset.prompt);
    else handlers.onRestart();
    if (t.closest(".drawer")) closeDrawer();
  });

  initDrawer();
  subscribe(sync);
  sync(getState());
}

const slots = (name) => document.querySelectorAll(`[data-slot="${name}"]`);

function renderScenarios(host) {
  host.innerHTML = scenarios.map((s) => `
    <li>
      <button class="opt" type="button" data-scenario="${s.id}" aria-pressed="false">
        <span class="opt__dot" aria-hidden="true"></span>
        <span class="opt__text">
          <span class="opt__name">${esc(s.name)}</span>
          <span class="opt__desc">${esc(s.desc)}</span>
        </span>
      </button>
    </li>`).join("");
}

function renderJourney(host) {
  host.innerHTML = steps.map((s) => `
    <li${s.branch ? ' class="jstep-branch"' : ""}>
      <button class="jstep${s.branch ? " jstep--branch" : ""}" type="button" data-jump="${s.id}">
        <span class="jstep__num">${esc(s.num)}</span>
        <span class="jstep__name">${esc(s.name)}</span>
        <span class="jstep__id">${esc(s.screen)}</span>
      </button>
    </li>`).join("");
}

function renderPrompts(host, state) {
  const { step, scenario, substep, busy } = state;
  if (step === "end") {
    host.innerHTML = `
      <p class="prompts__hint">${esc(ending.panelText)}</p>
      <button class="btn-quiet" type="button" data-restart>↺ Restart</button>`;
    return;
  }
  const prompts = promptsFor(step, scenario, substep, state);
  const hint = steps[stepIndex(step)]?.hint || "Tap inside the app for this step.";
  if (busy) {
    host.innerHTML = `<p class="prompts__hint prompts__hint--busy">${esc(busyHint)}</p>`
      + (prompts.length ? list(prompts, true) : "");
    return;
  }
  host.innerHTML = prompts.length ? list(prompts, false) : `<p class="prompts__hint">${esc(hint)}</p>`;
}

const list = (prompts, disabled) => `<ul class="prompts__list">${prompts.map((p) => `
  <li><button class="prompt" type="button" data-prompt="${esc(p.text)}"${disabled ? " disabled" : ""}>“${esc(p.text)}”</button></li>`).join("")}</ul>`;

function sync(state) {
  // A chat stage (e.g. "Where to start") is current when its host screen is at that substep.
  const stage = steps.find((s) => s.host === state.step && s.substeps.includes(state.substep));
  const curId = stage ? stage.id : state.step;
  const cur = state.step === "end" ? steps.length : stepIndex(curId);

  document.querySelectorAll("[data-scenario]").forEach((b) =>
    b.setAttribute("aria-pressed", b.dataset.scenario === state.scenario));

  document.querySelectorAll("[data-jump]").forEach((b) => {
    const i = stepIndex(b.dataset.jump);
    const isBranch = steps[i].branch;
    // A side branch is only "done" once it has been used (the draft exists).
    const done = isBranch ? state.plan.days !== "todo" && i !== cur : i < cur;
    b.classList.toggle("is-done", done);
    b.classList.toggle("is-current", i === cur);
    if (i === cur) b.setAttribute("aria-current", "step");
    else b.removeAttribute("aria-current");
  });

  const key = `${state.step}|${state.scenario}|${state.substep}|${state.busy}|${state.needs.map((n) => n.key).join()}`;
  if (key !== lastPromptKey) {
    lastPromptKey = key;
    slots("prompts").forEach((host) => renderPrompts(host, state));
    const count = state.step === "end" || state.busy ? 0 : promptsFor(state.step, state.scenario, state.substep, state).length;
    document.querySelectorAll("[data-prompt-count]").forEach((el) => {
      el.textContent = count;
      el.hidden = count === 0;
    });
  }
}

/* Pulse wherever the prompts live (side panel or floating button). */
export function pulsePrompts() {
  document.querySelectorAll(".panel--right, .fab").forEach((el) => {
    el.classList.remove("is-pulsing");
    void el.offsetWidth; // restart the animation
    el.classList.add("is-pulsing");
  });
}

/* ---------- Phone drawer ---------- */
let drawer, fab, lastFocus, hideTimer;

function initDrawer() {
  drawer = document.querySelector(".drawer");
  fab = document.querySelector(".fab");
  if (!drawer || !fab) return;
  fab.addEventListener("click", openDrawer);
  drawer.querySelector(".drawer__scrim").addEventListener("click", closeDrawer);
  drawer.querySelector(".drawer__close").addEventListener("click", closeDrawer);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !drawer.hidden) closeDrawer();
  });
}

function openDrawer() {
  clearTimeout(hideTimer);
  lastFocus = document.activeElement;
  drawer.hidden = false;
  fab.setAttribute("aria-expanded", "true");
  drawer.getBoundingClientRect();
  drawer.classList.add("is-open");
  drawer.querySelector(".drawer__close").focus();
}

function closeDrawer() {
  if (!drawer || drawer.hidden) return;
  drawer.classList.remove("is-open");
  fab.setAttribute("aria-expanded", "false");
  hideTimer = setTimeout(() => { drawer.hidden = true; }, 250);
  lastFocus?.focus?.();
}
