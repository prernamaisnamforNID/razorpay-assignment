/* Fits the phone mockup into the centre column: scales down, never up.
   On the phone layout (< 600px) the app fills the screen and no scaling applies. */
const phoneLayout = window.matchMedia("(max-width: 599px)");

export function initStage() {
  if (new URLSearchParams(location.search).get("embed") === "1") {
    document.documentElement.classList.add("is-embed");
  }

  const centre = document.querySelector(".stage__centre");
  const fit = document.querySelector(".device-fit");
  const device = document.querySelector(".device");

  const update = () => {
    if (phoneLayout.matches) {
      fit.style.width = fit.style.height = device.style.transform = "";
      return;
    }
    const cs = getComputedStyle(centre);
    const availW = centre.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    const availH = centre.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
    const w = device.offsetWidth;
    const h = device.offsetHeight;
    const scale = Math.min(1, availW / w, availH / h);
    fit.style.width = `${w * scale}px`;
    fit.style.height = `${h * scale}px`;
    device.style.transform = `scale(${scale})`;
  };

  new ResizeObserver(update).observe(centre);
  phoneLayout.addEventListener("change", update);
  update();
}
