/* Case study page: renders the data-driven blocks, then wires the cover video,
   lightbox, nav, scrollspy, section reveals and the sticky-note legend. */
import { evidence, moments, people, legend, notes, insights, directions, evolution } from "./data.js";

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const icon = (id, cls) => `<svg class="${cls}" aria-hidden="true"><use href="#i-${id}"/></svg>`;
const noteColour = (n) => `var(--s${n})`;
const insightName = (n) => (n ? `Insight ${n}` : "Other");
/* Does a file exist yet? (cover video, walkthrough). A missing file logs one 404. */
const exists = (url) => fetch(url, { method: "HEAD", cache: "no-store" }).then((r) => r.ok, () => false);

/* ── Render ──────────────────────────────────────────────── */

/* The problem: three evidence cards. Each starts as a placeholder and swaps to the
   screenshot once it loads; a loaded screenshot opens full size in the lightbox. */
function renderEvidence() {
  const list = $("[data-evidence]");
  list.innerHTML = evidence.map((e, i) => {
    const c = e.crop, n = e.note;
    const frame = c ? ` ev__frame--crop" style="--w:${c.width}%;--l:${c.left}%;--shift:-${c.shift}%` : "";
    const size = e.width ? ` width="${e.width}" height="${e.height}"` : "";
    return `
    <li class="ev" style="--i:${i}">
      <button class="ev__shot" type="button" disabled>
        <span class="ev__ph" aria-hidden="true">${icon("image", "icon-28")}<span>Myra test screenshot</span></span>
        <span class="ev__frame${frame}">
          <span class="sr-only">Open full size: </span>
          <img src="${e.src}"${size} alt="${esc(e.alt)}" loading="lazy" decoding="async">
          ${n ? `<span class="ev__note" style="left:${n.left}%;top:${n.top}%;width:${n.width}%;height:${n.height}%" aria-hidden="true"><span class="ev__label">${esc(n.label)}</span></span>` : ""}
        </span>
      </button>
      <p class="ev__num">${String(i + 1).padStart(2, "0")}</p>
      <h3 class="ev__title">${esc(e.title)}</h3>
      <p class="ev__text">${esc(e.text)}</p>
    </li>`;
  }).join("");

  $$(".ev", list).forEach((li) => {
    const btn = $(".ev__shot", li), img = $("img", li);
    const ready = () => { li.classList.add("has-img"); btn.disabled = false; };
    const missing = () => $(".ev__frame", li).remove();
    if (img.complete) (img.naturalWidth ? ready() : missing());
    else {
      img.addEventListener("load", ready, { once: true });
      img.addEventListener("error", missing, { once: true });
    }
    btn.addEventListener("click", () => {
      const big = document.createElement("img");
      big.src = img.currentSrc || img.src;
      big.alt = img.alt;
      openLightbox(big);
    });
  });
}

function renderLegend() {
  const el = $("[data-legend]");
  el.innerHTML = legend.map((l) => {
    const count = notes.filter((n) => n.insight === l.id).length;
    const label = l.id ? `${l.id} · ${l.label}` : l.label;
    return `<li><button type="button" data-insight="${l.id}" aria-label="${esc(`${label}: ${count} notes`)}">
      <span class="legend__swatch" style="--c:${noteColour(l.id)}"></span>${esc(label)}<span class="legend__count">${count}</span>
    </button></li>`;
  }).join("");
}

function renderBoard() {
  let i = 0;
  $("[data-board]").innerHTML = Object.entries(people).map(([id, p]) => `
    <section class="board__col" aria-label="${esc(`${id} · ${p.name}`)}">
      <h4 class="board__head"><span class="avatar-28" style="--tint:${p.tint}">${id}</span>${esc(p.name)}</h4>
      <ul class="notes">
        ${notes.filter((n) => n.person === id).map((n) => `
          <li class="note" data-insight="${n.insight}" style="--c:${noteColour(n.insight)};--i:${i++}">
            <p class="note__text">${esc(n.text)}</p>
            <p class="note__foot"><b>${id}</b><span>${insightName(n.insight)}</span></p>
          </li>`).join("")}
      </ul>
    </section>`).join("");
}

function renderPrinciples() {
  $("[data-principles]").innerHTML = insights.map((r, idx) => `
    <li class="principle-row">
      <div class="insight-card" style="--c:${noteColour(r.insight)}">
        <p class="insight-card__tag">Insight ${r.insight}</p>
        <h3 class="insight-card__title">${esc(r.title)}</h3>
        <p class="insight-card__evidence">${esc(r.evidence)}</p>
        <div class="insight-card__need">
          <p class="insight-card__need-label">The human need</p>
          <p class="insight-card__quote">${esc(r.need)}</p>
        </div>
      </div>
      <span class="principle-row__arrow">${icon("arrow-right", "icon-24")}</span>
      <div class="principle">
        <p class="principle__head"><span class="principle__num">${String(idx + 1).padStart(2, "0")}</span><strong class="principle__title">${esc(r.principle)}</strong></p>
        <p class="principle__line">${esc(r.line)}</p>
      </div>
      <figure>
        <div class="shot shot--thumb"><img src="${r.screen}" width="360" height="388" alt="${esc(r.alt)}" loading="lazy" decoding="async"></div>
        <figcaption>${esc(r.caption)}</figcaption>
      </figure>
    </li>`).join("");
}

function renderDirections() {
  $("[data-directions]").innerHTML = directions.map((d) => `
    <article class="direction${d.chosen ? " is-chosen" : ""}">
      <div class="direction__head">
        <p class="direction__label">Direction ${d.id}</p>
        ${d.chosen ? `<span class="badge badge--dark">${icon("check", "icon-12")}Chosen direction</span>` : ""}
      </div>
      <h3 class="direction__title">${esc(d.title)}</h3>
      <ol class="flow" aria-label="Flow">
        ${d.steps.map((s, i) => `
          ${i ? `<li class="flow__arrow" aria-hidden="true">${icon("arrow-down", "icon-12")}</li>` : ""}
          <li class="flow__step${s.ai ? " is-ai" : ""}">${s.ai ? `${icon("spark", "")}<span><span class="sr-only">AI step: </span>${esc(s.text)}</span>` : esc(s.text)}</li>`).join("")}
      </ol>
      <p class="direction__pro">${icon("plus", "icon-14")}<span><span class="sr-only">Strength: </span>${esc(d.plus)}</span></p>
      <p class="direction__con">${icon("minus", "icon-14")}<span><span class="sr-only">Risk: </span>${esc(d.minus)}</span></p>
    </article>`).join("");
}

function renderMoments() {
  $("[data-moments]").innerHTML = moments.map((m, i) => `
    <li class="moment">
      <div class="moment__top">
        <div class="moment__text">
          <p class="moment__num">${String(i + 1).padStart(2, "0")}</p>
          <h3 class="moment__title">${esc(m.title)}</h3>
          <p class="moment__desc">${esc(m.desc)}</p>
        </div>
        <ul class="moment__points">
          ${m.points.map((p) => `<li>${icon("check", "icon-16")}<span>${esc(p)}</span></li>`).join("")}
        </ul>
      </div>
      <div class="moment__screens">
        ${m.screens.map((s) => `<img src="${s.src}" width="${s.w}" height="${s.h}" alt="${esc(s.alt)}" loading="lazy" decoding="async">`).join("")}
      </div>
    </li>`).join("");
}

function renderEvolution() {
  const shot = (s, kind) => `
    <figure class="is-${kind}">
      <div class="shot shot--evo shot--${kind}"><img src="${s.src}" width="300" height="368" alt="${esc(s.alt)}" loading="lazy" decoding="async"></div>
      <figcaption>${esc(s.caption)}</figcaption>
    </figure>`;
  $("[data-evolution]").innerHTML = evolution.map((c, i) => `
    <li class="change">
      <div class="change__text">
        <p class="change__num">${String(i + 1).padStart(2, "0")}</p>
        <h4 class="change__title">${esc(c.title)}</h4>
        <p class="change__why">${esc(c.why)}</p>
      </div>
      <div class="compare">
        ${shot(c.before, "before")}
        <span class="compare__arrow" aria-label="became">${icon("arrow-right", "icon-18")}</span>
        ${shot(c.after, "after")}
      </div>
    </li>`).join("");
}

/* ── Lightbox (walkthrough video, full-size screenshots) ── */
/* <dialog>.showModal() traps focus, closes on Esc and returns focus on close. */

const lightbox = $("[data-lightbox]");
const lightboxBody = $("[data-lightbox-body]");

function openLightbox(node) {
  lightboxBody.replaceChildren(node);
  lightbox.showModal();
}

function wireLightbox() {
  lightbox.addEventListener("close", () => {
    $("video", lightboxBody)?.pause();
    lightboxBody.replaceChildren();
  });
  // A click on the backdrop lands on the <dialog> itself.
  lightbox.addEventListener("click", (e) => { if (e.target === lightbox) lightbox.close(); });
  $("[data-lightbox-close]").addEventListener("click", () => lightbox.close());
}

/* "Watch walkthrough": disabled with a "coming soon" tooltip until the file exists. */
function wireWalkthrough() {
  const btn = $("[data-walkthrough]");
  const tip = $("#walk-tip");
  if (!btn || !tip) return; // button not on the page
  btn.setAttribute("aria-disabled", "true");
  tip.hidden = false;
  exists(btn.dataset.src).then((ok) => {
    if (!ok) return;
    btn.removeAttribute("aria-disabled");
    btn.removeAttribute("aria-describedby");
    tip.remove();
  });
  btn.addEventListener("click", () => {
    if (btn.getAttribute("aria-disabled") === "true") return;
    const v = document.createElement("video");
    Object.assign(v, { src: btn.dataset.src, controls: true, autoplay: true, playsInline: true });
    v.setAttribute("aria-label", "Prototype walkthrough video");
    openLightbox(v);
  });
}

/* ── Cover video ─────────────────────────────────────────── */
/* Shows the poster until assets/video/cover.mp4 exists. Autoplays muted on loop,
   except with reduced motion: then it waits behind a play button. */
function wireCover() {
  const video = $(".cover__video");
  const controls = $("[data-cover-controls]");
  const toggle = $("[data-cover-toggle]");
  const mute = $("[data-cover-mute]");
  const bigPlay = $("[data-cover-bigplay]");
  const setIcon = (btn, id) => $("use", btn).setAttribute("href", `#i-${id}`);

  const sync = () => {
    const playing = !video.paused;
    setIcon(toggle, playing ? "pause" : "play");
    toggle.setAttribute("aria-label", playing ? "Pause video" : "Play video");
    setIcon(mute, video.muted ? "volume-x" : "volume");
    mute.setAttribute("aria-label", video.muted ? "Unmute video" : "Mute video");
    bigPlay.hidden = playing;
  };
  video.addEventListener("play", sync);
  video.addEventListener("pause", sync);
  video.addEventListener("volumechange", sync);
  toggle.addEventListener("click", () => (video.paused ? video.play() : video.pause()));
  mute.addEventListener("click", () => { video.muted = !video.muted; });
  bigPlay.addEventListener("click", () => { video.play(); toggle.focus(); });

  exists(video.dataset.src).then((ok) => {
    if (!ok) return;
    const source = document.createElement("source");
    Object.assign(source, { src: video.dataset.src, type: "video/mp4" });
    video.append(source);
    video.load();
    controls.hidden = false;
    sync();
    if (reduceMotion.matches) return;
    video.play().catch(sync); // autoplay blocked → show the play button
  });
}

/* ── Legend hover: highlight one insight's notes ─────────── */

function wireLegend() {
  const board = $("[data-board]");
  const buttons = $$("[data-legend] button");
  const show = (id) => {
    board.classList.toggle("is-dimmed", id !== null);
    buttons.forEach((b) => b.classList.toggle("is-on", b.dataset.insight === id));
    $$(".note", board).forEach((n) => n.classList.toggle("is-hit", n.dataset.insight === id));
  };
  buttons.forEach((b) => {
    b.addEventListener("mouseenter", () => show(b.dataset.insight));
    b.addEventListener("focus", () => show(b.dataset.insight));
    b.addEventListener("mouseleave", () => { if (document.activeElement !== b) show(null); });
    b.addEventListener("blur", () => show(null));
  });
}

/* ── Nav: smooth scroll + scrollspy ──────────────────────── */

function wireNav() {
  const links = $$(".toc__link");
  const nav = $(".toc");
  const sections = links.map((a) => document.getElementById(a.hash.slice(1))).filter(Boolean);
  let current = null;
  let lockUntil = 0; // ignore scrollspy while a click-scroll is running

  function setActive(id) {
    if (id === current) return;
    current = id;
    links.forEach((a) => {
      const on = a.hash === `#${id}`;
      a.classList.toggle("is-active", on);
      if (on) a.setAttribute("aria-current", "location"); else a.removeAttribute("aria-current");
    });
    keepPillInView(links.find((a) => a.hash === `#${id}`));
  }

  // On the pill bar, scroll the active pill into view (horizontal only).
  function keepPillInView(a) {
    if (!a || nav.scrollWidth <= nav.clientWidth) return;
    const left = a.offsetLeft - (nav.clientWidth - a.offsetWidth) / 2;
    nav.scrollTo({ left: Math.max(0, left), behavior: reduceMotion.matches ? "auto" : "smooth" });
  }

  links.forEach((a) => a.addEventListener("click", (e) => {
    const target = document.getElementById(a.hash.slice(1));
    if (!target) return;
    e.preventDefault();
    const behavior = reduceMotion.matches ? "auto" : "smooth";
    lockUntil = Date.now() + 1200;
    setActive(target.id);
    if (target.id === sections[0].id) window.scrollTo({ top: 0, behavior });
    else target.scrollIntoView({ behavior, block: "start" });
    history.pushState(null, "", a.hash);
  }));
  window.addEventListener("scrollend", () => { lockUntil = 0; spy(); });

  $(".toc__top").addEventListener("click", (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: reduceMotion.matches ? "auto" : "smooth" });
    history.pushState(null, "", location.pathname + location.search);
  });

  // A section is "current" when it crosses a line ~30% down the viewport.
  const visible = new Set();
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => (en.isIntersecting ? visible.add(en.target) : visible.delete(en.target)));
    spy();
  }, { rootMargin: "-30% 0px -69% 0px" });
  sections.forEach((s) => io.observe(s));

  function spy() {
    if (Date.now() < lockUntil) return;
    if (window.scrollY < 8) return setActive(sections[0].id);
    const hit = sections.find((s) => visible.has(s));
    if (hit) setActive(hit.id);
  }

  const start = sections.find((s) => `#${s.id}` === location.hash) || sections[0];
  setActive(start.id);
}

/* ── Reveal on enter (once) ──────────────────────────────── */

function wireReveal() {
  const items = [...$$(".reveal"), $("[data-board]"), $("[data-evidence]"), ...$$("[data-stagger]")];
  if (reduceMotion.matches || !("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("is-in"));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      en.target.classList.add("is-in");
      io.unobserve(en.target);
    });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.01 });
  items.forEach((el) => io.observe(el));
}

renderEvidence();
renderLegend();
renderBoard();
renderPrinciples();
renderDirections();
renderEvolution();
renderMoments();
wireCover();
wireLightbox();
wireWalkthrough();
wireLegend();
wireNav();
wireReveal();
