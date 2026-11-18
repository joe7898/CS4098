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
    wrap.className = "home";

    // Story first: what people already see, why it matters, what practice gives you
    const intro = document.createElement("div");
    intro.className = "home-intro";
    intro.innerHTML =
      '<p class="chapter-kicker">Everyday numbers</p>' +
      "<h1>Calibrated trust in numbers</h1>" +
      '<p class="lede">You already meet confident figures all the time — a predicted mark on a dashboard, ' +
      "a headline that says a test is “99% accurate,” a writing helper that flashes <strong>confidence&nbsp;82</strong>. " +
      "They look finished. They invite you to nod and move on.</p>" +
      "<p>Often the hard part is not the maths. It is noticing what the number is quietly asking you to believe. " +
      "That it will hold for the next person. That “accurate” means almost never wrong for you. " +
      "That a high score means the answer is safe to take.</p>" +
      "<p>This site is a few minutes of practice for that pause. " +
      "You will sit with short, made-up situations — the kind of claims tools and news already make — " +
      "change a picture or a set of counts, and decide for yourself: " +
      "is this enough to <strong>trust</strong>, something to <strong>question</strong>, or a leap you should <strong>reject</strong>?</p>" +
      "<p>You will not leave as a statistician. You might leave a little slower to accept a polished figure — " +
      "and clearer about when that caution is earned. " +
      "No account, no live chatbot; just you and the screen.</p>";
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
