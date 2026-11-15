/* Draggable bottom sheet, mounted inside the app (phone screen).
   openSheet({ title, body, onClose }) → { el, close() }.
   Drag the handle/header down to close; tap the dimmed backdrop or press Esc too.
   variant "page" (H05): a full-height sheet with no header — `body` is the whole
   sheet, and `dragFrom` (a selector inside it) is the area you drag down. */
import { html, esc } from "../dom.js";
import { reduceMotion } from "./chat.js";

const DURATION = 280;
const EASE = "cubic-bezier(.2,.8,.2,1)";

export function openSheet({ title, body, onClose, variant = "panel", dragFrom = null }) {
  const app = document.querySelector(".app");
  const page = variant === "page";
  const layer = html(`
    <div class="sheet-layer">
      <div class="sheet__scrim"></div>
      <section class="sheet${page ? " sheet--page" : ""}" role="dialog" aria-modal="true" aria-label="${esc(title)}">
        ${page ? "" : `
        <div class="sheet__grip">
          <span class="sheet__handle" aria-hidden="true"></span>
          <h2 class="sheet__title">${esc(title)}</h2>
        </div>
        <div class="sheet__body"></div>`}
      </section>
    </div>`);
  const sheet = layer.querySelector(".sheet");
  const scrim = layer.querySelector(".sheet__scrim");
  (page ? sheet : layer.querySelector(".sheet__body")).append(body);
  app.append(layer);

  const motion = !reduceMotion.matches;
  sheet.animate(
    motion ? [{ transform: "translateY(100%)" }, { transform: "none" }] : [{ opacity: 0 }, { opacity: 1 }],
    { duration: DURATION, easing: EASE },
  );
  scrim.animate([{ opacity: 0 }, { opacity: 1 }], { duration: DURATION, easing: "ease" });

  let closed = false;
  function close() {
    if (closed) return;
    closed = true;
    document.removeEventListener("keydown", onKey);
    const from = getComputedStyle(sheet).transform;
    const a = sheet.animate(
      motion ? [{ transform: from === "none" ? "none" : from }, { transform: "translateY(100%)" }] : [{ opacity: 1 }, { opacity: 0 }],
      { duration: 220, easing: EASE, fill: "forwards" },
    );
    scrim.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 220, easing: "ease", fill: "forwards" });
    a.finished.finally(() => { layer.remove(); onClose?.(); });
  }

  const onKey = (e) => { if (e.key === "Escape") close(); };
  document.addEventListener("keydown", onKey);
  scrim.addEventListener("click", close);

  // Drag down to close (buttons inside the drag area still just tap).
  const grip = page ? sheet.querySelector(dragFrom) : layer.querySelector(".sheet__grip");
  let drag = null;
  grip.addEventListener("pointerdown", (e) => {
    if (e.target.closest("button")) return;
    drag = { y: e.clientY, t: e.timeStamp, dy: 0 };
    grip.setPointerCapture(e.pointerId);
  });
  grip.addEventListener("pointermove", (e) => {
    if (!drag) return;
    // pointer coords are in page px; the phone may be scaled
    const scale = sheet.getBoundingClientRect().height / sheet.offsetHeight || 1;
    drag.dy = Math.max(0, (e.clientY - drag.y) / scale);
    sheet.style.transform = `translateY(${drag.dy}px)`;
  });
  const end = (e) => {
    if (!drag) return;
    const { dy, t } = drag;
    drag = null;
    const velocity = dy / Math.max(1, e.timeStamp - t);
    if (dy > sheet.offsetHeight * 0.3 || velocity > 0.6) return close();
    sheet.animate([{ transform: `translateY(${dy}px)` }, { transform: "none" }], { duration: 200, easing: EASE });
    sheet.style.transform = "";
  };
  grip.addEventListener("pointerup", end);
  grip.addEventListener("pointercancel", end);

  requestAnimationFrame(() => sheet.querySelector("button, [tabindex]")?.focus({ preventScroll: true }));
  return { el: sheet, close };
}
