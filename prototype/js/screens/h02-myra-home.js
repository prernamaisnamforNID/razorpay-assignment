/* H02 · Myra home — Figma node 45:2. Opens as a full-screen modal from the H01 nav button. */
import { html, esc, sprite, SHEET_MYRA } from "../dom.js";
import { myraHome as copy } from "../../data/journey.js";
import { setFirstMessage } from "../state.js";
import { myraInput } from "../components/myra-input.js";

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

const thumb = (c) => `
  <span class="h02-card__thumb" style="background:${c.thumb}">
    ${c.photo ? `<img src="${esc(c.photo)}" alt="" draggable="false">` : ""}
  </span>`;

function template() {
  return `
  <section class="h02" aria-label="Myra">
    <header class="h02-head">
      <button class="myra-circle tap" type="button" data-close aria-label="Close">
        <img class="icon" src="assets/icons/x.svg" width="22" height="22" alt="" draggable="false">
      </button>
      ${sprite("Myra wordmark", 62, 27, 712, 3636.36, -300, -336.36, "", SHEET_MYRA)}
      <button class="myra-circle tap" type="button" aria-label="More options">
        <img class="icon" src="assets/icons/ellipsis.svg" width="22" height="22" alt="" draggable="false">
      </button>
    </header>

    <div class="screen__scroll h02-scroll">
      <div class="h02-hello" data-enter>
        <h1 class="h02-greeting">
          <span class="h02-greeting__hi">Hi,</span>
          <span class="h02-greeting__name">${esc(copy.name)}</span>
          <img class="icon" src="assets/brand/myra-sparkle.svg" width="16" height="16" alt="" draggable="false">
        </h1>
        <p class="h02-intro">${esc(copy.intro)}</p>
      </div>

      <p class="h02-label" data-enter>${esc(copy.label)}</p>

      <ul class="h02-cards">
        ${copy.cards.map((c, i) => `
          <li data-enter style="--i:${i}">
            <button class="h02-card tap${c.journey ? " is-journey" : ""}" type="button" data-card="${c.id}">
              ${thumb(c)}
              <span class="h02-card__text">${esc(c.text)}</span>
            </button>
          </li>`).join("")}
      </ul>
    </div>
  </section>`;
}

let busy = false; // a message is being typed / sent

export default {
  theme: "light",
  presentation: "modal",
  statusIcons: true,

  render(ctx) {
    busy = false;
    const el = html(template());
    const input = myraInput({ placeholder: copy.inputPlaceholder, onTap: ctx.inputTap });
    el.append(input);

    // Entry animation only when arriving, not when coming back from H03.
    if (ctx.transition !== "pop") el.classList.add("is-entering");

    el.querySelector("[data-close]").addEventListener("click", ctx.back);

    el.querySelector(".h02-cards").addEventListener("click", (e) => {
      const btn = e.target.closest("[data-card]");
      if (!btn || busy) return;
      const card = copy.cards.find((c) => c.id === btn.dataset.card);
      if (card.journey) return send(card.text, ctx);
      shake(btn);
      ctx.toast(copy.otherCardToast);
    });

    el.input = input;
    return el;
  },

  /* A "Try saying" prompt: type it into the input, then send it. */
  async onPrompt(text, { el, ctx }) {
    if (busy) return;
    busy = true;
    await el.input.typeInto(text);
    send(text, ctx);
  },
};

function send(text, ctx) {
  busy = true;
  setFirstMessage(text);
  ctx.next();
}

function shake(el) {
  if (reduceMotion.matches) return;
  el.animate(
    [{ transform: "translateX(0)" }, { transform: "translateX(-4px)" }, { transform: "translateX(4px)" },
     { transform: "translateX(-3px)" }, { transform: "translateX(2px)" }, { transform: "translateX(0)" }],
    { duration: 320, easing: "ease-out" },
  );
}
