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

    // Layout toggle and Restart only make sense on a module page
    if (els.variantSeg) {
      els.variantSeg.hidden = state.route === "home";
    }
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
    wrap.className = "home";

    // Opening pitch: AI everywhere → the accuracy question → what this site offers
    const intro = document.createElement("div");
    intro.className = "home-intro";
    intro.innerHTML =
      '<p class="chapter-kicker">AI is talking. Are you listening?</p>' +
      "<h1>Calibrated trust in numbers</h1>" +
      "<p>AI is everywhere! It’s taken the world by storm and is almost unavoidable today. " +
      "You have likely encountered it in your own life at some point — whether by using it for a task, " +
      "seeing news articles and social media posts, or simply through a conversation with peers. " +
      "Most people just accept what it generates as correct.</p>" +
      "<p>Those outputs often arrive wrapped in scores, percentages, and wording like “accurate.”</p>" +
      '<p class="home-hook"><strong>But what is the number asking you to believe?</strong></p>' +
      "<p>That is the purpose of this site. Through three short interactive modules, it will help you " +
      "explore and question claims about AI tools — not through lengthy and complicated maths and notes, " +
      "but through simple story-based scenarios. Interactivity lets you see exactly what is going on. " +
      "Each module ends with a short question to support your learning, and a simple takeaway of when to " +
      "<strong>trust</strong>, <strong>question</strong>, or <strong>reject</strong> a claim. " +
      "You will leave with a clearer sense of when to question a confident-looking number — and when not to.</p>";
    wrap.append(intro);

    const cta = document.createElement("p");
    cta.className = "home-cta-row";
    cta.innerHTML =
      '<a class="home-cta" href="#fit">Start here</a>';
    wrap.append(cta);

    // Paths in after the story — not the opening frame
    const listHead = document.createElement("h2");
    listHead.className = "home-list-heading";
    listHead.textContent = "Three short stories";
    wrap.append(listHead);

    const list = document.createElement("ol");
    list.className = "chapter-list";

    const items = [
      [
        "fit",
        "1",
        "Looking perfect on old data",
        "A tool looked flawless on past students — should that settle a prediction for the next assessment?",
      ],
      [
        "baserate",
        "2",
        "When a high accuracy still misleads",
        "A news story boasts “99% accurate” detection — what changes when you count people out of 1,000?",
      ],
      [
        "uncertainty",
        "3",
        "A confidence score that hides a range",
        "A writing helper shows confidence 82 with no range — is that enough to accept a rewrite?",
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
      // Remount the module so the graph and controls reset cleanly,
      // then return the reader to the top of the page.
      if (state.route === "home") return;
      render();
      window.scrollTo(0, 0);
      if (els.main && typeof els.main.focus === "function") {
        try {
          els.main.focus({ preventScroll: true });
        } catch (e) {
          els.main.focus();
        }
      }
    });
  }

  window.addEventListener("hashchange", render);

  // First paint
  setVariant(state.variant);
  render();
})();
