(() => {
  const tabButtons = () => Array.from(document.querySelectorAll("[data-tab]"));
  const tabPanels = () => Array.from(document.querySelectorAll("[data-tab-panel]"));

  function normalizeTab(tabName) {
    const valid = new Set(["home", "about", "log", "legacy-home", "offers", "hotel", "experience", "cruises"]);
    return valid.has(tabName) ? tabName : "home";
  }

  function setActiveTab(tabName, options = {}) {
    const nextTab = normalizeTab(tabName);
    const updateHash = options.updateHash !== false;

    tabButtons().forEach((button) => {
      button.classList.toggle("is-active", button.dataset.tab === nextTab);
    });

    tabPanels().forEach((panel) => {
      panel.classList.toggle("is-active", panel.dataset.tabPanel === nextTab);
    });

    document.body.dataset.activeTab = nextTab;
    if (updateHash) {
      history.replaceState(null, "", `#${nextTab}`);
    }
    window.dispatchEvent(new CustomEvent("travel:tabchange", { detail: { tab: nextTab } }));
    const resetViewport = () => {
      const scrollTarget = document.scrollingElement || document.documentElement;
      scrollTarget.scrollTop = 0;
      scrollTarget.scrollLeft = 0;
      document.body.scrollTop = 0;
      document.body.scrollLeft = 0;
      window.scrollTo(0, 0);
    };

    window.requestAnimationFrame(() => {
      resetViewport();
      window.requestAnimationFrame(resetViewport);
      window.setTimeout(resetViewport, 50);
    });
  }

  function initTabs(defaultTab = "home") {
    tabButtons().forEach((button) => {
      button.addEventListener("click", (event) => {
        event.preventDefault();
        setActiveTab(button.dataset.tab);
        button.closest("details")?.removeAttribute("open");
      });
    });

    Array.from(document.querySelectorAll("[data-jump-tab]")).forEach((button) => {
      button.addEventListener("click", () => {
        setActiveTab(button.dataset.jumpTab);
        button.closest("details")?.removeAttribute("open");
      });
    });

    const hashTab = normalizeTab((window.location.hash || "").replace(/^#/, ""));
    setActiveTab(hashTab || defaultTab, { updateHash: false });

    window.addEventListener("hashchange", () => {
      const next = normalizeTab((window.location.hash || "").replace(/^#/, ""));
      setActiveTab(next, { updateHash: false });
    });
  }

  window.TravelTabs = {
    initTabs,
    setActiveTab
  };
})();
