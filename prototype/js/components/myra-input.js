/* Myra input bar (Figma 45:47) — shared by Myra screens.
   The parent never types here: tapping it pulses the "Try saying" panel, and
   prompts from that panel are typed in with typeInto(). */
import { html, esc, sprite, SHEET_MYRA } from "../dom.js";

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

/* variant: "home" (H02, Figma 45:47) or "chat" (chat screens, Figma 25:126) */
export function myraInput({ placeholder, onTap, variant = "home" }) {
  const el = html(`
    <div class="myra-input myra-input--${variant}">
      <button class="myra-input__field" type="button" aria-label="${esc(placeholder)}">
        <span class="myra-input__text is-placeholder">${esc(placeholder)}</span>
      </button>
      <div class="myra-input__actions">
        <button class="myra-input__speak tap" type="button" aria-label="Speak">
          ${sprite("Speak button", 83, 32, 515.94, 2962.96, -384.06, -2740.74, "", SHEET_MYRA)}
        </button>
      </div>
    </div>`);

  const field = el.querySelector(".myra-input__field");
  const text = el.querySelector(".myra-input__text");
  field.addEventListener("click", onTap);

  /* Type `value` in one character at a time, then resolve. */
  el.typeInto = (value, msPerChar = 25) => new Promise((resolve) => {
    text.classList.remove("is-placeholder");
    text.classList.add("is-typing");
    if (reduceMotion.matches) {
      text.textContent = value;
      return setTimeout(resolve, 200);
    }
    let i = 0;
    text.textContent = "";
    const step = () => {
      text.textContent = value.slice(0, ++i);
      if (i < value.length) setTimeout(step, msPerChar);
      else setTimeout(resolve, 250);
    };
    step();
  });

  el.setPlaceholder = (value) => {
    placeholder = value;
    field.setAttribute("aria-label", value);
    if (text.classList.contains("is-placeholder")) text.textContent = value;
  };

  el.clear = () => {
    text.textContent = placeholder;
    text.classList.add("is-placeholder");
    text.classList.remove("is-typing");
  };

  return el;
}
