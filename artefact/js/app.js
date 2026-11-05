/**
 * Author: Omar Raza
 * Student ID: 230013491
 * Description: App shell — hash routing between home and the three modules,
 * Graph-first vs More guidance toggle, and Restart for the active module.
 */

(function () {
  "use strict";

  // ---------------------------------------------------------------------------
  // Constants and state
  // ---------------------------------------------------------------------------

  // Remember layout choice for this browser tab only (A = graph-first default)
  const STORAGE_VARIANT = "cs4098-variant";

  const MODULE_ORDER = ["home", "fit", "baserate", "uncertainty"];

  const state = {
    route: "home",
    // Graph-first is the preferred default; More guidance sticks only within this tab
    variant: sessionStorage.getItem(STORAGE_VARIANT) === "b" ? "b" : "a",
    active: null, // { reset, destroy } from the mounted module, if any
  };

  const els = {
    body: document.body,
    main: document.getElementById("main"),
    variantSeg: document.getElementById("variant-seg"),
    restartBtn: document.getElementById("restart-btn"),
    nav: document.getElementById("module-nav"),
  };

  // ---------------------------------------------------------------------------
  // Routing and variant
  // ---------------------------------------------------------------------------

  function parseRoute() {
    const hash = (location.hash || "#home").replace(/^#/, "");
    return MODULE_ORDER.indexOf(hash) !== -1 ? hash : "home";
  }

  function setVariant(v) {
    state.variant = v === "b" ? "b" : "a";
    sessionStorage.setItem(STORAGE_VARIANT, state.variant);
    // Drop any old localStorage value left by earlier builds / audit trampoline
    try {
      localStorage.removeItem(STORAGE_VARIANT);
    } catch (e) {
      /* ignore */
    }

    els.body.classList.toggle("variant-a", state.variant === "a");
    els.body.classList.toggle("variant-b", state.variant === "b");

    if (els.variantSeg) {
      els.variantSeg.querySelectorAll("button").forEach(function (btn) {
        const on = btn.getAttribute("data-variant") === state.variant;
        btn.setAttribute("aria-pressed", on ? "true" : "false");
      });
    }
  }

  function updateNav() {
    if (!els.nav) return;

    els.nav.querySelectorAll("a").forEach(function (link) {
      const route = link.getAttribute("data-route");
      if (route === state.route) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });

    // Restart only makes sense on a module page
    if (els.restartBtn) {
      els.restartBtn.hidden = state.route === "home";
    }
  }

  // ---------------------------------------------------------------------------
  // Home (contents)
  // ---------------------------------------------------------------------------

  function renderHome() {
    els.main.innerHTML = "";

    const wrap = document.createElement("div");
    wrap.innerHTML =
      '<div class="home-intro">' +
      '<p class="chapter-kicker">Three modules</p>' +
      "<h1>Calibrated trust in numbers</h1>" +
      '<p class="lede">The aim is not to increase trust in AI. It is calibrated trust: knowing when to trust, question, or reject a metric claim.</p>' +
      "<p>Each module starts from an everyday numbered claim, then a short interactive graph or count display. " +
      "Success is being able to say, in plain words, what the figure showed and when you would trust, question, or reject a similar claim. " +
      "Use <em>Graph-first</em> for a short session, or <em>More guidance</em> for a slower step-by-step path. " +
      "Precise terms sit under Going further.</p>" +
      "</div>";

    // Chapter cards — same three ideas as the report modules
    const list = document.createElement("ol");
    list.className = "chapter-list";

    const items = [
      [
        "fit",
        "1",
        "Looking perfect on old data",
        "Isla’s grade predictor looked perfect on past students — should she trust 62 for the next assessment?",
      ],
      [
        "baserate",
        "2",
        "When a high accuracy still misleads",
        "Claire’s news story: “99% accurate” illness detection — what do counts out of 1,000 show?",
      ],
      [
        "uncertainty",
        "3",
        "A single score that hides a range",
        "Isla’s writing helper shows confidence 82 with no band — enough to accept a rewrite if her cutoff is 75?",
      ],
    ];

    items.forEach(function (item) {
      const id = item[0];
      const num = item[1];
      const title = item[2];
      const blurb = item[3];

      const li = document.createElement("li");
      li.innerHTML =
        '<a href="#' +
        id +
        '"><span class="n">' +
        num +
        "</span><div><h2>" +
        title +
        "</h2><p>" +
        blurb +
        "</p></div></a>";
      list.append(li);
    });

    wrap.append(list);

    els.main.append(wrap);
  }

  // ---------------------------------------------------------------------------
  // Module mount
  // ---------------------------------------------------------------------------

  function renderModule(id) {
    const mod =
      window.CS4098 && window.CS4098.modules && window.CS4098.modules[id];

    els.main.innerHTML = "";

    if (!mod) {
      els.main.innerHTML = "<p>Module not found.</p>";
      return;
    }

    const host = document.createElement("div");
    els.main.append(host);

    // Each module exposes mount(root, { variant }) → { reset, destroy }
    state.active = mod.mount(host, { variant: state.variant });
  }

  function render() {
    if (state.active && state.active.destroy) {
      state.active.destroy();
    }
    state.active = null;

    state.route = parseRoute();
    setVariant(state.variant);
    updateNav();

    if (state.route === "home") {
      renderHome();
    } else {
      renderModule(state.route);
    }

    document.title =
      state.route === "home"
        ? "Calibrated trust in numbers"
        : window.CS4098.modules[state.route].title;

    // Helps CSS quiet unused nav links on module pages
    els.body.setAttribute("data-route", state.route);

    window.scrollTo(0, 0);
  }

  // ---------------------------------------------------------------------------
  // Events
  // ---------------------------------------------------------------------------

  if (els.variantSeg) {
    els.variantSeg.addEventListener("click", function (e) {
      const btn = e.target.closest("button[data-variant]");
      if (!btn) return;
      setVariant(btn.getAttribute("data-variant"));
      render();
    });
  }

  if (els.restartBtn) {
    els.restartBtn.addEventListener("click", function () {
      if (state.active && state.active.reset) {
        state.active.reset();
      } else {
        render();
      }
    });
  }

  window.addEventListener("hashchange", render);

  // First paint
  setVariant(state.variant);
  render();
})();
