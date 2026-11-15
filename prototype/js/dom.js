/* Small DOM helpers shared by screens and panels. */

/* Build one element from an HTML string. */
export function html(str) {
  const t = document.createElement("template");
  t.innerHTML = str.trim();
  // Import into the live document: template content belongs to an inert
  // document whose animation timeline never runs.
  return document.importNode(t.content, true).firstElementChild;
}

/* Escape copy before putting it into an HTML string. */
export function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

/* A crop of a shared screenshot sheet (Figma crops it the same way).
   w/h are the slot size in px; iw/ih/l/t are the image size + offset in %. */
export const SHEET_MMT = "assets/brand/mmt-home-sheet.png";
export const SHEET_MYRA = "assets/brand/myra-home-sheet.png";

export function sprite(name, w, h, iw, ih, l, t, extraClass = "", src = SHEET_MMT) {
  return `<span class="sprite ${extraClass}" data-name="${name}" style="width:${w}px;height:${h}px">`
    + `<img src="${src}" alt="" draggable="false" style="width:${iw}%;height:${ih}%;left:${l}%;top:${t}%"></span>`;
}
