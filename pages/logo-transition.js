(() => {
  const STORAGE_KEY = "livingscape-logo-transition";
  const PENDING_CLASS = "logo-transition-pending";
  const LOGO_SELECTOR = "[data-logo-transition-target]";
  const DURATION = 850;

  const getPageKey = () => document.body?.dataset.logoTransitionPage || "unknown";
  const isHomePage = (pageKey) => pageKey === "home";

  const isSameOriginInternalLink = (anchor) => {
    try {
      const url = new URL(anchor.href, window.location.href);
      return url.origin === window.location.origin && url.pathname.endsWith(".html");
    } catch {
      return false;
    }
  };

  const getLogoRect = () => {
    const logo = document.querySelector(LOGO_SELECTOR);
    if (!logo) return null;
    const rect = logo.getBoundingClientRect();
    return {
      x: rect.left,
      y: rect.top,
      width: rect.width,
      height: rect.height,
    };
  };

  const storeTransition = (toHref) => {
    const rect = getLogoRect();
    if (!rect) return;

    const fromPage = getPageKey();
    const toPage = new URL(toHref, window.location.href).pathname.endsWith("index.html")
      ? "home"
      : new URL(toHref, window.location.href).pathname.split("/").pop()?.replace(".html", "") || "unknown";

    if (!isHomePage(fromPage) && !isHomePage(toPage)) return;

    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        fromPage,
        toHref,
        rect,
      })
    );
  };

  const clearTransition = () => sessionStorage.removeItem(STORAGE_KEY);

  const markPending = () => {
    document.documentElement.classList.add(PENDING_CLASS);
  };

  const unmarkPending = () => {
    document.documentElement.classList.remove(PENDING_CLASS);
  };

  const waitForLayoutReady = async () => {
    if (document.fonts?.ready) {
      try {
        await document.fonts.ready;
      } catch {
        // Ignore font loading failures and continue with layout that is available.
      }
    }

    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  };

  const playTransition = async () => {
    const data = sessionStorage.getItem(STORAGE_KEY);
    if (!data) return;

    let payload;
    try {
      payload = JSON.parse(data);
    } catch {
      clearTransition();
      return;
    }

    clearTransition();

    const target = document.querySelector(LOGO_SELECTOR);
    if (!target) {
      unmarkPending();
      return;
    }

    const startRect = payload.rect;
    if (!startRect) {
      unmarkPending();
      return;
    }

    await waitForLayoutReady();

    const targetRect = target.getBoundingClientRect();

    const ghost = target.cloneNode(true);
    ghost.removeAttribute("data-logo-transition-target");
    ghost.classList.add("logo-transition-ghost");
    ghost.style.left = `${startRect.x}px`;
    ghost.style.top = `${startRect.y}px`;
    ghost.style.width = `${startRect.width}px`;
    ghost.style.height = `${startRect.height}px`;
    ghost.style.opacity = "0";

    document.body.appendChild(ghost);

    const startX = startRect.x;
    const startY = startRect.y;
    const startW = startRect.width;
    const startH = startRect.height;
    const endX = targetRect.left;
    const endY = targetRect.top;
    const endW = targetRect.width;
    const endH = targetRect.height;

    target.style.visibility = "hidden";

    const animation = ghost.animate(
      [
        {
          opacity: 1,
          transform: "translate3d(0, 0, 0) scale(1)",
          left: `${startX}px`,
          top: `${startY}px`,
          width: `${startW}px`,
          height: `${startH}px`,
        },
        {
          opacity: 1,
          transform: "translate3d(0, 0, 0) scale(1)",
          left: `${endX}px`,
          top: `${endY}px`,
          width: `${endW}px`,
          height: `${endH}px`,
        },
      ],
      {
        duration: DURATION,
        easing: "cubic-bezier(0.2, 0.9, 0.2, 1)",
        fill: "forwards",
      }
    );

    animation.onfinish = () => {
      ghost.remove();
      target.style.visibility = "";
      target.style.opacity = "";
      unmarkPending();
    };
  };

  document.addEventListener("click", (event) => {
    const anchor = event.target.closest?.("a[href]");
    if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download")) return;
    if (!isSameOriginInternalLink(anchor)) return;

    const url = new URL(anchor.href, window.location.href);
    if (url.pathname === window.location.pathname && url.hash) return;

    storeTransition(url.href);
  });

  window.addEventListener("pageshow", playTransition);
})();
