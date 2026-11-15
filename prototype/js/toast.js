/* In-app toast: slides up above the bottom bar, auto-hides. One at a time. */
let layer = null;
let timer = null;

export function initToast(el) {
  layer = el;
}

/* toast("Saved")  or  toast("Done", { action: "Restart", onAction, duration }) */
export function toast(text, { action, onAction, duration = 2600 } = {}) {
  if (!layer) return;
  clearTimeout(timer);
  layer.replaceChildren();

  const el = document.createElement("div");
  el.className = "toast";
  el.setAttribute("role", "status");
  const label = document.createElement("span");
  label.textContent = text;
  el.append(label);

  if (action) {
    const btn = document.createElement("button");
    btn.className = "toast__action tap";
    btn.type = "button";
    btn.textContent = action;
    btn.addEventListener("click", () => {
      hide(el);
      onAction?.();
    });
    el.append(btn);
  }

  layer.append(el);
  el.getBoundingClientRect(); // commit the start state so the slide-in runs
  el.classList.add("is-in");
  timer = setTimeout(() => hide(el), duration);
}

function hide(el) {
  el.classList.remove("is-in");
  setTimeout(() => el.remove(), 300);
}
