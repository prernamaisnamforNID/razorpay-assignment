/* Placeholder screen factory — used until each screen is built from Figma.
   Shows the screen ID, what will appear, and a Next button. Copy comes from data/journey.js. */
import { html, esc } from "../dom.js";
import { stepById, stepIndex, steps, noteFor, myraHome } from "../../data/journey.js";

const list = (items) => `<ul class="ph-list">${items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>`;

export function placeholderScreen(id) {
  return {
    theme: "light",
    render(ctx) {
      const step = stepById(id);
      const isLast = stepIndex(id) === steps.length - 1;
      const note = noteFor(id, ctx.state.scenario);
      // H03 receives the parent's first message from H02 (falls back to card 1 on a jump).
      const firstMessage = step.showsFirstMessage ? (ctx.state.firstMessage || myraHome.cards[0].text) : null;

      const el = html(`
        <section class="ph" aria-label="${esc(step.title)}">
          <header class="ph-top">
            <button class="ph-top__back tap" type="button" aria-label="Back" ${ctx.canBack ? "" : "hidden"}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg>
            </button>
            <span class="ph-top__title">Myra</span>
          </header>

          <div class="screen__scroll ph-body">
            ${firstMessage ? `<p class="ph-bubble">${esc(firstMessage)}</p>` : ""}
            ${step.lead ? `<p class="ph-lead">${esc(step.lead)}</p>` : ""}
            <article class="ph-card">
              <span class="ph-badge">${esc(step.screen)} · placeholder</span>
              <h1 class="ph-title">${esc(step.title)}</h1>
              <p class="ph-step">Step ${esc(step.num)} of the journey</p>
              ${note ? `<p class="ph-note"><strong>Scenario:</strong> ${esc(note)}</p>` : ""}
              <h2 class="ph-h">What will appear here</h2>
              ${list(step.shows)}
              <h2 class="ph-h">In-app actions</h2>
              ${list(step.actions)}
            </article>
          </div>

          <footer class="ph-foot">
            ${step.input ? `
              <button class="ph-input tap" type="button" aria-label="Type or speak to Myra">
                <span>Ask Myra anything…</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19v3"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><rect x="9" y="2" width="6" height="13" rx="3"/></svg>
              </button>` : ""}
            <button class="ph-next tap" type="button">${isLast ? "Finish" : "Next"} →</button>
          </footer>
        </section>`);

      el.querySelector(".ph-top__back").addEventListener("click", ctx.back);
      el.querySelector(".ph-next").addEventListener("click", isLast ? ctx.finish : ctx.next);
      el.querySelector(".ph-input")?.addEventListener("click", ctx.inputTap);
      return el;
    },
  };
}
