/* One state object for the whole prototype + tiny pub/sub. */
import { scenarioById } from "../data/journey.js";

const initial = () => ({
  step: "h01",          // current step id, or "end" after the last step
  scenario: "happy",
  savedBeaches: [],
  travelMode: null,     // "drive" | "fly" | "train" | "bus" | null
  firstMessage: null,   // the parent's first message to Myra (sent from H02)
  substep: null,        // stage within a step (H03: "confirm" | "question")
  busy: false,          // Myra is working — prompts are disabled
  needs: [],            // family needs: [{ key, who: ["papa", …] }] — see js/family.js
  plan: { family: "todo", places: "todo", travel: "todo", stay: "todo", days: "todo" }, // plan checklist
  jumpTo: null,         // tracker jump into the middle of a chat (e.g. "h03e")
});

const state = initial();
const listeners = new Set();

export function getState() {
  return state;
}

export function setState(patch) {
  Object.assign(state, patch);
  listeners.forEach((fn) => fn(state));
}

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/* Reset everything and load a scenario's preset values. */
export function resetState(scenarioId = "happy") {
  const sc = scenarioById(scenarioId);
  setState({ ...initial(), ...structuredClone(sc.preset || {}), scenario: sc.id, step: sc.start });
}

/* Update helpers used by screens later. */
export function toggleBeach(id) {
  const saved = state.savedBeaches.includes(id)
    ? state.savedBeaches.filter((b) => b !== id)
    : [...state.savedBeaches, id];
  setState({ savedBeaches: saved });
}

export function setPlan(stepId, value) {
  if (state.plan[stepId] === value) return;
  setState({ plan: { ...state.plan, [stepId]: value } });
}

export function setFirstMessage(text) {
  setState({ firstMessage: text });
}

export function chooseTravelMode(mode) {
  setState({ travelMode: mode });
}
