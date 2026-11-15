/* H01 · MMT Home — Figma node 40:2. */
import { html, esc, sprite } from "../dom.js";

const I = "assets/icons/";

/* [label, slot w, slot h, img w%, img h%, left%, top%] — values from Figma. */
const MAIN = [
  ["Flights", 50, 40, 712, 2000, -55, -431.25],
  ["Hotels", 50, 45, 712, 1777.78, -225, -377.78],
  ["Holiday Packages", 55, 45, 647.27, 1777.78, -350, -383.33],
  ["Trains/ Bus", 65, 39, 547.69, 2051.28, -415.38, -446.15],
];

const MORE = [
  [
    ["Airport Cabs & Rentals", 43, 35, 791.11, 2222.22, -68.89, -761.11],
    ["Villas & Homestays", 44, 36, 773.91, 2105.26, -247.83, -721.05],
    ["Outstation Cabs", 40, 36, 847.62, 2162.16, -466.67, -740.54],
    ["Forex Card & Currency", 36, 36, 962.16, 2105.26, -759.46, -721.05],
  ],
  [
    ["Tours & Attractions", 30, 36, 1148.39, 2105.26, -132.26, -942.11],
    ["Hourly Stays", 42, 35, 809.09, 2222.22, -263.64, -994.44],
    ["Visa", 28, 36, 1227.59, 2162.16, -710.34, -967.57],
    ["Travel Insurance", 31, 35, 1112.5, 2222.22, -896.87, -994.44],
  ],
  [
    ["Nearby Getaways", 38, 35, 890, 2222.22, -90, -1219.44],
    ["Gift Cards", 35, 36, 988.89, 2162.16, -330.56, -1181.08],
    ["Flight Status", 37, 33, 912.82, 2352.94, -515.38, -1288.24],
    ["PNR Status", 38, 35, 890, 2222.22, -700, -1216.67],
  ],
];

const TABS = ["Trending", "Flights", "Cabs", "Hotels", "Homestays"];

const icon = (file, size, alt = "") =>
  `<img class="icon" src="${I}${file}" width="${size}" height="${size}" alt="${alt}" draggable="false">`;

const spriteOf = ([label, ...crop]) => sprite(label, ...crop);

function template() {
  return `
  <section class="home" aria-label="MakeMyTrip home">
    <header class="home-top">
      <div class="home-top__group home-top__group--left">
        <button class="home-top__btn tap" type="button" data-oos aria-label="Menu">${icon("menu.svg", 24)}</button>
        ${sprite("MMT logo", 23, 24, 1873.68, 4000, -236.84, -345)}
      </div>
      <div class="home-top__group home-top__group--right">
        <button class="home-top__btn tap" type="button" data-oos aria-label="Search">${icon("search.svg", 22)}</button>
        <button class="home-top__btn tap" type="button" data-oos aria-label="myCash">${sprite("myCash", 51, 17, 773.91, 5333.33, -532.61, -493.33)}</button>
        <button class="home-top__btn tap" type="button" data-oos aria-label="myBiz">${sprite("myBiz", 31, 18, 1271.43, 5000, -1100, -443.75)}</button>
      </div>
    </header>

    <div class="screen__scroll home-scroll">
      <button class="home-search tap" type="button" data-myra>
        ${sprite("Myra sparkle", 20, 21, 1977.78, 4210.53, -144.44, -594.74)}
        <span class="home-search__text">Explore your next adventure with Myra</span>
        ${sprite("Mic", 29, 28, 1483.33, 3478.26, -1287.5, -491.3)}
      </button>

      <div class="home-main">
        ${MAIN.map((s) => `
          <button class="home-main__tile tap" type="button" data-oos>
            ${spriteOf(s)}
            <span class="home-main__label">${esc(s[0])}</span>
          </button>`).join("")}
      </div>

      <div class="home-more">
        ${MORE.map((row) => `
          <div class="home-more__row">
            ${row.map((s) => `
              <button class="home-more__item tap" type="button" data-oos>
                ${spriteOf(s)}
                <span class="home-more__label">${esc(s[0])}</span>
              </button>`).join("")}
          </div>`).join("")}
      </div>

      <div class="home-offers-head">
        <h2 class="home-offers-head__title">Offers</h2>
        <button class="home-offers-head__all tap" type="button" data-oos>View All ${icon("chevron-right.svg", 16)}</button>
      </div>

      <div class="home-tabs" role="tablist">
        ${TABS.map((t, i) => `
          <button class="home-tabs__tab tap${i === 0 ? " is-active" : ""}" type="button" role="tab" aria-selected="${i === 0}">${t}</button>`).join("")}
      </div>

      <div class="home-banners">
        <button class="home-banners__item tap" type="button" data-oos aria-label="Offer">${sprite("Offer banner", 308, 118, 143.55, 842.11, -4.84, -660.53)}</button>
        <button class="home-banners__item tap" type="button" data-oos aria-label="Offer">${sprite("Offer banner 2", 110, 118, 402.26, 842.11, -302.26, -660.53)}</button>
      </div>
    </div>

    <nav class="home-nav" aria-label="Main">
      <button class="home-nav__item is-active tap" type="button">${icon("house.svg", 24)}<span>Home</span></button>
      <button class="home-nav__item tap" type="button" data-oos>${icon("briefcase.svg", 24)}<span>My Trips</span></button>
      <button class="home-nav__myra tap" type="button" data-myra data-coach-target aria-label="Myra">
        ${sprite("Myra button", 56, 56, 868.29, 1951.22, -385.37, -1767.07, "home-nav__myra-img")}
      </button>
      <button class="home-nav__item tap" type="button" data-oos>${icon("heart.svg", 24)}<span>Wishlists</span><em class="home-nav__badge">New</em></button>
      <button class="home-nav__item tap" type="button" data-oos>${icon("credit-card.svg", 24)}<span>Credit Card</span></button>
    </nav>
  </section>`;
}

export default {
  theme: "light",
  render(ctx) {
    const el = html(template());

    el.addEventListener("click", (e) => {
      const btn = e.target.closest("button");
      if (!btn) return;
      if (btn.matches("[data-myra]")) return ctx.next();
      if (btn.matches(".home-tabs__tab")) return selectTab(el, btn);
      if (btn.matches("[data-oos]")) return ctx.outOfScope();
    });

    return el;
  },
};

function selectTab(root, tab) {
  root.querySelectorAll(".home-tabs__tab").forEach((t) => {
    const on = t === tab;
    t.classList.toggle("is-active", on);
    t.setAttribute("aria-selected", on);
  });
}
