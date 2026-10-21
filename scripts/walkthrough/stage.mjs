/**
 * Shared helpers for the EnquiryFlow walkthrough recorder.
 *
 * Nothing here modifies the application — the cursor and the caption bar are
 * injected into the page at runtime, and the overlay markup lives in the
 * browser only while a scene is being recorded.
 */

export const VIEWPORT = { width: 1920, height: 1080 };

/**
 * A visible mouse cursor with a click ripple.
 *
 * Playwright's screencast does not include the system cursor, so without this
 * a viewer has no idea where the presenter is pointing.
 */
export const CURSOR_SCRIPT = `
(() => {
  if (window.__wfCursor) return;
  window.__wfCursor = true;

  const mount = () => {
    const style = document.createElement("style");
    style.id = "wf-cursor-style";
    style.textContent = \`
      #wf-cursor {
        position: fixed;
        left: 0;
        top: 0;
        width: 26px;
        height: 26px;
        pointer-events: none;
        z-index: 2147483647;
        opacity: 0;
        transition: opacity 180ms ease;
        will-change: transform;
      }
      #wf-cursor svg {
        display: block;
        filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.45));
      }
      .wf-ripple {
        position: fixed;
        width: 16px;
        height: 16px;
        border-radius: 9999px;
        border: 2px solid rgba(139, 130, 255, 0.95);
        box-shadow: 0 0 18px rgba(99, 102, 241, 0.55);
        pointer-events: none;
        z-index: 2147483646;
      }
    \`;
    document.head.appendChild(style);

    const el = document.createElement("div");
    el.id = "wf-cursor";
    el.innerHTML =
      '<svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">' +
      '<path d="M3.4 2 L3.4 19.9 L8.2 15.4 L11.3 22.3 L14.3 20.8 L11.2 14.1 L17.4 13.8 Z" ' +
      'fill="#ffffff" stroke="#111827" stroke-width="1.35" stroke-linejoin="round"/></svg>';
    document.body.appendChild(el);

    let tx = window.innerWidth / 2;
    let ty = window.innerHeight / 2;
    let cx = tx;
    let cy = ty;
    let shown = false;

    window.addEventListener(
      "mousemove",
      (event) => {
        tx = event.clientX;
        ty = event.clientY;
        if (!shown) {
          shown = true;
          el.style.opacity = "1";
        }
      },
      { passive: true },
    );

    window.addEventListener(
      "mousedown",
      (event) => {
        const ripple = document.createElement("div");
        ripple.className = "wf-ripple";
        ripple.style.left = event.clientX - 8 + "px";
        ripple.style.top = event.clientY - 8 + "px";
        document.body.appendChild(ripple);
        ripple
          .animate(
            [
              { transform: "scale(0.35)", opacity: 0.95 },
              { transform: "scale(2.8)", opacity: 0 },
            ],
            { duration: 560, easing: "cubic-bezier(0.2, 0.7, 0.4, 1)" },
          )
          .finished.then(() => ripple.remove())
          .catch(() => ripple.remove());
      },
      { passive: true },
    );

    const tick = () => {
      cx += (tx - cx) * 0.32;
      cy += (ty - cy) * 0.32;
      el.style.transform = "translate(" + (cx - 3.4) + "px, " + (cy - 2) + "px)";
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount, { once: true });
  } else {
    mount();
  }
})();
`;

const easeInOutQuad = (t) =>
  t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

/**
 * Small stage around a Playwright page: smooth pointer movement, smooth
 * scrolling and injectable captions.
 */
export function createStage(page) {
  const pointer = { x: VIEWPORT.width / 2, y: VIEWPORT.height / 2 };
  const startedAt = Date.now();

  /** Caption visibility timeline, so the editor knows what may be cut. */
  const captions = [];
  let openCaption = null;

  /** Title / outro card timeline, so the editor can hold on the card. */
  const cards = [];

  const closeCaption = () => {
    if (openCaption && openCaption.to === null) {
      openCaption.to = (Date.now() - startedAt) / 1000;
    }
    openCaption = null;
  };

  async function glide(target, { duration = 520, offset } = {}) {
    const box = await target.boundingBox();
    if (!box) return;

    const x = offset?.x ?? box.x + box.width / 2;
    const y = offset?.y ?? box.y + box.height / 2;
    const steps = Math.max(8, Math.round(duration / 16));

    for (let i = 1; i <= steps; i += 1) {
      const t = easeInOutQuad(i / steps);
      await page.mouse.move(
        pointer.x + (x - pointer.x) * t,
        pointer.y + (y - pointer.y) * t,
      );
      await page.waitForTimeout(16);
    }

    pointer.x = x;
    pointer.y = y;
  }

  async function glideToPoint(x, y, { duration = 520 } = {}) {
    const steps = Math.max(8, Math.round(duration / 16));

    for (let i = 1; i <= steps; i += 1) {
      const t = easeInOutQuad(i / steps);
      await page.mouse.move(
        pointer.x + (x - pointer.x) * t,
        pointer.y + (y - pointer.y) * t,
      );
      await page.waitForTimeout(16);
    }

    pointer.x = x;
    pointer.y = y;
  }

  async function click(target, { pause = 260 } = {}) {
    await glide(target);
    await page.waitForTimeout(pause);
    await target.click();
    await page.waitForTimeout(pause);
  }

  async function scrollTo(targetY, { duration = 900 } = {}) {
    const from = await page.evaluate(() => window.scrollY);
    const steps = Math.max(10, Math.round(duration / 16));

    for (let i = 1; i <= steps; i += 1) {
      const t = easeInOutQuad(i / steps);
      await page.evaluate((y) => window.scrollTo(0, y), from + (targetY - from) * t);
      await page.waitForTimeout(16);
    }
  }

  async function caption(text) {
    closeCaption();

    openCaption = {
      text,
      from: (Date.now() - startedAt) / 1000,
      to: null,
    };
    captions.push(openCaption);

    await page.evaluate((value) => {
      let host = document.getElementById("wf-caption");
      if (!host) {
        host = document.createElement("div");
        host.id = "wf-caption";
        host.style.cssText =
          "position:fixed;left:0;right:0;bottom:32px;display:flex;justify-content:center;" +
          "z-index:2147483645;pointer-events:none;padding:0 48px;";
        document.body.appendChild(host);
      }

      const previous = host.firstElementChild;
      if (previous) previous.remove();

      const pill = document.createElement("div");
      pill.style.cssText =
        "display:flex;align-items:stretch;max-width:1420px;overflow:hidden;border-radius:14px;" +
        "background:rgba(14,17,30,0.90);border:1px solid rgba(255,255,255,0.16);" +
        "box-shadow:0 18px 50px rgba(0,0,0,0.45);";

      const accent = document.createElement("div");
      accent.style.cssText =
        "width:6px;flex:none;background:linear-gradient(180deg,#6d5ce7,#31b6c9);";

      const body = document.createElement("div");
      body.textContent = value;
      body.style.cssText =
        "padding:14px 26px;color:#f6f7fb;font-size:23px;line-height:1.35;font-weight:500;" +
        "letter-spacing:-0.012em;font-family:var(--font-geist-sans),system-ui,sans-serif;";

      pill.append(accent, body);
      host.appendChild(pill);

      pill.animate(
        [
          { opacity: 0, transform: "translateY(16px)" },
          { opacity: 1, transform: "translateY(0)" },
        ],
        { duration: 420, easing: "cubic-bezier(0.22,0.8,0.3,1)", fill: "both" },
      );
    }, text);
  }

  async function clearCaption() {
    await page.evaluate(() => {
      const host = document.getElementById("wf-caption");
      const pill = host?.firstElementChild;
      if (!pill) return;

      pill
        .animate([{ opacity: 1 }, { opacity: 0 }], {
          duration: 320,
          easing: "ease-out",
          fill: "forwards",
        })
        .finished.then(() => pill.remove())
        .catch(() => pill.remove());
    });

    closeCaption();
  }

  /**
   * A full-screen title / closing card rendered over the live app.
   */
  async function overlayCard({ eyebrow, title, subtitle, footer }) {
    cards.push({ from: (Date.now() - startedAt) / 1000, to: null });

    await page.evaluate(
      ({ eyebrow, title, subtitle, footer }) => {
        let host = document.getElementById("wf-card");
        if (!host) {
          host = document.createElement("div");
          host.id = "wf-card";
          host.style.cssText =
            "position:fixed;inset:0;z-index:2147483646;display:flex;align-items:center;" +
            "justify-content:center;pointer-events:none;opacity:0;" +
            "background:radial-gradient(120% 90% at 50% 40%, rgba(10,12,22,0.82), rgba(6,8,15,0.93));" +
            "backdrop-filter:blur(22px) saturate(115%);-webkit-backdrop-filter:blur(22px) saturate(115%);";
          document.body.appendChild(host);
        }

        const content = document.createElement("div");
        content.style.cssText =
          "display:flex;flex-direction:column;align-items:center;text-align:center;" +
          "font-family:var(--font-geist-sans),system-ui,sans-serif;";

        const mark = document.createElement("div");
        mark.style.cssText =
          "width:84px;height:84px;border-radius:20px;display:flex;align-items:center;" +
          "justify-content:center;color:#fff;margin-bottom:30px;" +
          "background:linear-gradient(135deg,#6d5ce7,#4b8fe0);" +
          "box-shadow:0 18px 46px rgba(109,92,231,0.45);";
        mark.innerHTML =
          '<svg viewBox="0 0 24 24" fill="none" width="52" height="52" stroke="currentColor" ' +
          'stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round">' +
          '<path d="M4 6.5h10.5"/><path d="M4 12h7.5"/><path d="M4 17.5h5"/><path d="m14 15.5 2.2 2.2 4.3-4.6"/></svg>';

        const eyebrowEl = document.createElement("p");
        eyebrowEl.textContent = eyebrow;
        eyebrowEl.style.cssText =
          "margin:0 0 18px;font-size:17px;font-weight:600;letter-spacing:0.16em;" +
          "text-transform:uppercase;color:#9aa4c7;";

        const titleEl = document.createElement("h1");
        titleEl.textContent = title;
        titleEl.style.cssText =
          "margin:0;font-size:76px;line-height:1.05;font-weight:650;letter-spacing:-0.035em;" +
          "color:#fbfbff;";

        const rule = document.createElement("div");
        rule.style.cssText =
          "width:92px;height:4px;border-radius:9999px;margin:28px 0;" +
          "background:linear-gradient(90deg,#6d5ce7,#31b6c9);";

        const subEl = document.createElement("p");
        subEl.textContent = subtitle;
        subEl.style.cssText =
          "margin:0;max-width:900px;font-size:27px;line-height:1.45;font-weight:450;" +
          "color:#c3c9de;";

        const footerEl = document.createElement("p");
        footerEl.textContent = footer;
        footerEl.style.cssText =
          "margin:40px 0 0;font-size:18px;font-weight:500;letter-spacing:0.08em;" +
          "text-transform:uppercase;color:#7f88a8;";

        content.append(mark, eyebrowEl, titleEl, rule, subEl, footerEl);
        host.replaceChildren(content);

        host.animate([{ opacity: 0 }, { opacity: 1 }], {
          duration: 700,
          easing: "ease-out",
          fill: "both",
        });
      },
      { eyebrow, title, subtitle, footer },
    );
  }

  return {
    pointer,
    glide,
    glideToPoint,
    click,
    scrollTo,
    caption,
    clearCaption,
    overlayCard,
    captions,
    cards,
    closeCaption,
  };
}

export function isoDate(daysFromToday) {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + daysFromToday);
  return date.toISOString().slice(0, 10);
}
