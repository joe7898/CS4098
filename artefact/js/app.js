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
    // #sources lives on the home page (scroll target after render)
    if (hash === "sources") return "home";
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
      '<p class="lede">Not “trust AI more” — just know when a number is enough to trust, when to question it, and when to reject what it is being used to claim.</p>' +
      "<p>Each page is a short story with a number attached — Isla’s grade predictor, Claire’s news headline, Isla’s writing helper. " +
      "Use the chart or the counts, then choose trust, question, or reject. " +
      "<em>Graph-first</em> puts the story and the chart up front; <em>More guidance</em> walks you through step by step. " +
      "Want more detail? Open Going further on each page. " +
      "Where the ideas come from: <a href=\"#sources\">Sources</a>.</p>" +
      "</div>";

    // Chapter cards — titles match each module H1
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
        "A confidence score that hides a range",
        "Isla’s writing helper shows confidence score 82 (0–100) with no range — enough to accept a rewrite if her cutoff is 75?",
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

    // Where the ideas come from (plain list; full refs in the project report)
    const sources = document.createElement("section");
    sources.className = "home-sources";
    sources.id = "sources";
    sources.innerHTML =
      "<h2>Sources</h2>" +
      "<p>Isla and Claire’s stories are made up. The lessons behind them come from people who write about when to trust a number:</p>" +
      "<ul>" +
      "<li><strong>When to trust a number</strong> — Lee &amp; See (2004), <em>Trust in Automation</em>. Jacovi and colleagues (2021): trust what the screen is claiming, not “the AI” in general. Ahn and colleagues (2024): it helps to see how a prediction turned out.</li>" +
      "<li><strong>1 · Old data</strong> — Domingos (2012), <em>A Few Useful Things to Know about Machine Learning</em>: looking perfect only on old examples can be an “illusion of success.”</li>" +
      "<li><strong>2 · Accuracy</strong> — Hoffrage and colleagues (2000); Gigerenzer &amp; Edwards (2003): risks are easier to read as counts (for example out of 1,000) than as bare percentages.</li>" +
      "<li><strong>3 · Confidence</strong> — Spiegelhalter, <em>The Art of Statistics</em> (2019) and <em>The Art of Uncertainty</em> (2024): say how unsure a number is. Jacovi and colleagues again on trusting the claim on the screen.</li>" +
      "<li><strong>Clear wording</strong> — Field’s <em>Discovering Statistics</em> books.</li>" +
      "</ul>" +
      "<p class=\"home-sources-note\">Full reference list: CS4098 project report.</p>";
    wrap.append(sources);

    els.main.append(wrap);

    // Footer / intro link #sources → scroll after home paints
    if ((location.hash || "").replace(/^#/, "") === "sources") {
      requestAnimationFrame(function () {
        const target = document.getElementById("sources");
        if (target) target.scrollIntoView({ block: "start" });
      });
    }
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
    if (window.CS4098.ui && window.CS4098.ui.typesetMath) {
      window.CS4098.ui.typesetMath(host);
    }
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
