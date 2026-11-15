/* Family question card (Figma 25:108, skip row 28:135, stacked avatars 48:57).
   Chips are multi-select: once one is picked, the skip button becomes "Send".
   A chip with `skip: true` acts like the skip button. disable() dims it once answered. */
import { html, esc } from "../dom.js";

export const avatarStack = (list, cls) => `
  <span class="${cls}-stack">${list.map((a) =>
    `<span class="${cls}" style="background:${a.bg}">${esc(a.letter)}</span>`).join("")}</span>`;

export function questionCard(q, { chips, sendLabel, onSend, onSkip }) {
  const avatars = q.avatars || [q.avatar];
  const el = html(`
    <section class="qc" aria-label="${esc(q.name)}">
      <div class="qc__who">
        ${avatarStack(avatars, "qc__avatar")}
        <span class="qc__titles">
          <span class="qc__name">${esc(q.name)}</span>
          <span class="qc__progress">${esc(q.progress)}</span>
        </span>
      </div>
      <p class="qc__text">${esc(q.text)}</p>
      <p class="qc__starter">${esc(q.starterLabel)}</p>
      <div class="qc__chips">
        ${chips.map((c, i) => `<button class="chip tap" type="button" data-i="${i}" aria-pressed="false">${esc(c.label)}</button>`).join("")}
      </div>
      <hr class="qc__divider">
      <div class="qc__skip-row">
        <span class="qc__skip-note">${esc(q.skipNote)}</span>
        <button class="qc__skip tap" type="button">${esc(q.skip)}</button>
        <button class="qc__send chip chip--primary tap" type="button" hidden>${esc(sendLabel)}</button>
      </div>
    </section>`);

  const skipBtn = el.querySelector(".qc__skip");
  const sendBtn = el.querySelector(".qc__send");
  const selected = () => [...el.querySelectorAll('.qc__chips [aria-pressed="true"]')].map((b) => chips[+b.dataset.i]);

  el.querySelector(".qc__chips").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-i]");
    if (!btn || el.classList.contains("is-answered")) return;
    const chip = chips[+btn.dataset.i];
    if (chip.skip) return onSkip(chip.label);
    btn.setAttribute("aria-pressed", String(btn.getAttribute("aria-pressed") !== "true"));
    const n = selected().length;
    sendBtn.hidden = n === 0;
    skipBtn.hidden = n > 0;
  });
  skipBtn.addEventListener("click", () => onSkip(q.skip));
  sendBtn.addEventListener("click", () => onSend(selected()));

  el.disable = () => {
    el.classList.add("is-answered");
    el.querySelectorAll("button").forEach((b) => { b.disabled = true; });
  };
  return el;
}
