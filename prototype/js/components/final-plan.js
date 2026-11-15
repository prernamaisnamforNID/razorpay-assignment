/* H09 building blocks (Figma 100:2): final day cards, the "Ready to book" card and
   the booking sheet body. Copy: data/journey.js `finalPlan`. */
import { html, esc } from "../dom.js";
import { reduceMotion } from "./chat.js";

/* A day of the final plan (100:133). Rows with a reason are buttons:
   tapping one hides / shows its reason line (shown by default). */
export function finalDay(day) {
  const el = html(`
    <section class="fday" aria-label="${esc(`${day.title} · ${day.tag}`)}">
      <div class="fday__head"><h3 class="fday__title">${esc(day.title)}</h3><span class="fday__tag">${esc(day.tag)}</span></div>
      <ul class="fday__rows">
        ${day.rows.map((r) => `
          <li>
            ${r.why
              ? `<button class="fday__row" type="button" aria-expanded="true">`
              : `<div class="fday__row">`}
              <span class="fday__time">${esc(r.time)}</span>
              <span class="fday__what">
                <span class="fday__text">${esc(r.text)}</span>
                ${r.why ? `<span class="fday__why">${esc(r.why)}</span>` : ""}
              </span>
            ${r.why ? "</button>" : "</div>"}
          </li>`).join("")}
      </ul>
    </section>`);
  el.addEventListener("click", (e) => {
    const row = e.target.closest("button.fday__row");
    if (!row) return;
    const open = row.getAttribute("aria-expanded") !== "true";
    row.setAttribute("aria-expanded", String(open));
  });
  return el;
}

/* "Ready to book" (100:194). onBook(itemId). el.grow() animates the budget bar in;
   el.setBooked(itemId) turns that item's button into "✓ Booked". */
export function readyCard(b, { onBook }) {
  const pct = Math.min(100, (b.spent / b.budget) * 100).toFixed(1);
  const el = html(`
    <section class="ready" aria-label="${esc(b.title)}">
      <div class="ready__head"><h3 class="ready__title">${esc(b.title)}</h3><span class="ready__total">${esc(b.total)}</span></div>
      <div class="ready__bar" role="img" aria-label="${esc(b.total)}">
        <span class="ready__spent" style="width:${pct}%"></span><span class="ready__left"></span>
      </div>
      ${b.items.map((i) => `
        <div class="ready__item" data-item="${i.id}">
          <div class="ready__row">
            <div class="ready__text">
              <p class="ready__name"><span aria-hidden="true">${i.emoji}</span>  ${esc(i.name)}</p>
              <p class="ready__note">${esc(i.note)}</p>
            </div>
            <span class="ready__price">${esc(i.price)}</span>
          </div>
          <button class="ready__book tap" type="button" data-book="${i.id}">${esc(i.button)}</button>
        </div>`).join("")}
      <p class="ready__pay">${esc(b.payThere)}</p>
    </section>`);

  el.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-book]");
    if (btn && !btn.disabled) onBook(btn.dataset.book);
  });

  el.grow = () => {
    if (reduceMotion.matches) return;
    el.querySelector(".ready__spent").animate(
      [{ width: "0%" }, { width: `${pct}%` }],
      { duration: 500, delay: 150, easing: "ease-out", fill: "backwards" },
    );
  };

  el.setBooked = (id) => {
    const item = b.items.find((i) => i.id === id);
    const btn = el.querySelector(`[data-book="${id}"]`);
    btn.textContent = item.booked;
    btn.disabled = true;
    btn.classList.add("is-booked");
    btn.setAttribute("aria-label", `${item.name}: booked`);
  };
  return el;
}

/* Booking sheet body: dates, what's included, price, [Confirm booking] [Not yet]. */
export function bookingSheet(item, copy, { onConfirm, onLater }) {
  const el = html(`
    <div class="booksheet">
      <p class="booksheet__name"><span aria-hidden="true">${item.emoji}</span>  ${esc(item.name)}</p>
      <p class="booksheet__dates">${esc(item.sheet.dates)}</p>
      <ul class="booksheet__includes">
        ${item.sheet.includes.map((t) => `<li><img class="icon" src="assets/icons/check-12-green.svg" width="12" height="12" alt="">${esc(t)}</li>`).join("")}
      </ul>
      <div class="booksheet__price"><span>${esc(copy.sheetPriceLabel)}</span><strong>${esc(item.price)}</strong></div>
      <button class="booksheet__confirm tap" type="button" data-confirm>${esc(copy.sheetConfirm)}</button>
      <button class="booksheet__later tap" type="button" data-later>${esc(copy.sheetLater)}</button>
    </div>`);
  el.querySelector("[data-confirm]").addEventListener("click", onConfirm);
  el.querySelector("[data-later]").addEventListener("click", onLater);
  return el;
}
