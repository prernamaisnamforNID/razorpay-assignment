/* Boot: wires state, router, panels, coach mark and toast together. */
import { steps, stepIndex, scenarioById, ending, timing } from "../data/journey.js";
import { getState, setState, resetState } from "./state.js";
import { initRouter, push, pop, reset, canPop, currentScreen } from "./router.js";
import { screens } from "./screens/index.js";
import { initPanels, pulsePrompts } from "./panels.js";
import { initCoach, showCoach, hideCoach } from "./coach.js";
import { initStage } from "./stage.js";
import { initToast, toast } from "./toast.js";

const app = document.querySelector(".app");

/* Screens only — tracker entries with a `host` live inside another screen's chat. */
const screenSteps = steps.filter((s) => !s.host);

/* Stack for a jump: every screen up to and including the target, so Back works. */
const pathTo = (id) => {
  const i = screenSteps.findIndex((s) => s.id === id);
  return screenSteps.slice(0, i + 1).map((s) => s.id);
};

function next() {
  const i = screenSteps.findIndex((s) => s.id === getState().step);
  if (i > -1 && i < screenSteps.length - 1) push(screenSteps[i + 1].id);
}

let oosShown = 0;
function outOfScope() {
  if (Date.now() - oosShown < 1500) return;
  oosShown = Date.now();
  toast("Not part of this prototype. Tap Myra to start.");
}

function finish() {
  setState({ step: "end" });
  toast(ending.toast, { action: "Restart", onAction: restart, duration: 6000 });
}

function restart() {
  resetState("happy");
  reset(["h01"]);
  showCoach();
}

function startScenario(id) {
  hideCoach();
  resetState(id);
  reset(pathTo(scenarioById(id).start));
}

function jumpTo(id) {
  hideCoach();
  const step = steps[stepIndex(id)];
  // A stage inside a chat: open its screen and fast-forward the conversation there.
  if (step.host) {
    setState({ jumpTo: id });
    return reset(pathTo(step.host));
  }
  reset(pathTo(id));
}

/* A "Try saying" prompt. The current screen handles it if it can;
   otherwise (placeholders) it's just acknowledged with a toast. */
function sendPrompt(text) {
  const cur = currentScreen();
  if (cur?.mod.onPrompt) return cur.mod.onPrompt(text, cur);
  toast(`You said: “${text}”`);
}

// CSS-driven timings come from the data file too.
document.documentElement.style.setProperty("--shimmer-loop", `${timing.shimmerLoop}ms`);

initStage();
initToast(document.querySelector(".app__toasts"));
initRouter(document.querySelector(".app__stack"), screens, (id) => ({
  step: id,
  state: getState(),
  canBack: canPop(),
  next,
  go: push,
  back: pop,
  finish,
  outOfScope,
  toast,
  inputTap: pulsePrompts,
}));
initPanels({ onScenario: startScenario, onJump: jumpTo, onPrompt: sendPrompt, onRestart: restart });
initCoach({ onActivate: next });

// Let :active fire on iOS so the press state shows.
app.addEventListener("touchstart", () => {}, { passive: true });

reset(["h01"], "none");
showCoach();
