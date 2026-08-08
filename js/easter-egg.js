/**
 * Footer easter egg loader.
 *
 * <pixel-tetris> is roughly 13 KB — enough to matter against the 50 KB
 * critical-path JavaScript budget, and it is a game nobody asked for on
 * page load. So the module is not imported until the footer actually
 * approaches the viewport, which means it never lands on the critical
 * path of any page.
 *
 * If IntersectionObserver is missing, or the dynamic import fails, the
 * <pixel-tetris> element simply never upgrades and renders nothing —
 * the footer is unaffected.
 */

function upgrade(el) {
  import("../components/pixel-tetris.js")
    .then(({ PixelTetris }) => {
      if (!customElements.get("pixel-tetris")) {
        customElements.define("pixel-tetris", PixelTetris);
      }
    })
    .catch(() => {
      /* Optional enhancement — leave no broken affordance behind. */
      el.remove();
    });
}

function init() {
  const el = document.querySelector("pixel-tetris");
  if (!el) { return; }

  if (!("IntersectionObserver" in window)) {
    upgrade(el);
    return;
  }

  const io = new IntersectionObserver((entries) => {
    if (!entries[0].isIntersecting) { return; }
    io.disconnect();
    upgrade(el);
  }, { rootMargin: "300px" });

  io.observe(el);
}

if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
}
