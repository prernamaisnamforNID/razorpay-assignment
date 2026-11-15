/* H06e hotel card (Figma 98:214 / 98:243): photo, name + price, an over-budget flag,
   numbered distance chips to each saved beach, and fit tags. Copy: data/journey.js `hotels`. */
import { html, esc } from "../dom.js";

export const hotelCard = (s, copy) => html(`
  <article class="hotel${s.over ? " is-over" : ""}" aria-label="${esc(s.name)}">
    <div class="hotel__photo" aria-hidden="true"></div>
    <div class="hotel__body">
      <div class="hotel__top">
        <h3 class="hotel__name">${esc(s.name)}</h3>
        <p class="hotel__price"><span class="hotel__amount">${esc(s.price)}</span><span class="hotel__nights">${esc(copy.nights)}</span></p>
      </div>
      ${s.over ? `<p class="hotel__over"><span aria-hidden="true">⚠</span> ${esc(s.over)}</p>` : ""}
      <p class="hotel__label">${esc(copy.nearLabel)}</p>
      <ul class="hotel__near">
        ${s.near.map((d) => `<li><span class="hotel__num" aria-hidden="true">${d.n}</span>${esc(d.text)}</li>`).join("")}
      </ul>
      <ul class="hotel__fits">
        ${s.fits.map((f) => `<li><span aria-hidden="true">✓</span> ${esc(f)}</li>`).join("")}
      </ul>
    </div>
  </article>`);
