/**
 * Author: Omar Raza
 * Student ID: 230013491
 * Description: Shared helpers for every module — DOM create, Your call +
 * Takeaway, next-module link, Graph-first orient gate, deferred Your call /
 * Going further, outcome flash, KaTeX for Going further, and mobile stage
 * expand. Modules and the shell read these via CS4098.ui.
 */

(function (global) {
  "use strict";

  // ---------------------------------------------------------------------------
  // DOM helper
  // ---------------------------------------------------------------------------

  /**
   * Create an element with optional class, text, attributes, and form fields.
   * Keeps module code shorter without pulling in a framework.
   */
  function el(tag, opts) {
    const node = document.createElement(tag);
    if (!opts) return node;

    if (opts.className) node.className = opts.className;
    if (opts.id) node.id = opts.id;
    if (opts.type) node.type = opts.type;
    if (opts.min != null) node.min = opts.min;
    if (opts.max != null) node.max = opts.max;
    if (opts.value != null) node.value = opts.value;
    if (opts.step != null) node.step = opts.step;
    if (opts.text != null) node.textContent = opts.text;
    if (opts.html != null) node.innerHTML = opts.html;

    if (opts.attrs) {
      Object.keys(opts.attrs).forEach(function (key) {
        node.setAttribute(key, opts.attrs[key]);
      });
    }

    return node;
  }

  // ---------------------------------------------------------------------------
  // Your call first; Takeaway only after a choice
  // ---------------------------------------------------------------------------

  /**
   * Build end-of-module Your call + Takeaway.
   * Order: restate the claim → trust / question / reject → choice feedback
   * → Takeaway (revealed only after a choice so the verdict does not spoil).
   *
   * opts.restateHtml — claim in different words, shown before the buttons
   * opts.verdictHtml — plain-language conclusion (HTML string)
   * opts.prompt — optional line above the three buttons
   * opts.judgement — { trust|question|reject: { tone, title, body } }
   *   tone is "calibrated" or "miscalibrated" (styles the feedback panel)
   * opts.onJudged — optional callback after the first choice (e.g. reveal
   *   Going further / next on Graph-first)
   *
   * Returns { el, reset, verdictEl }.
   */
  function buildTakeaway(opts) {
    const wrap = el("div", { className: "takeaway" });

    const decide = el("div", { className: "takeaway-decide" });
    decide.innerHTML =
      "<h2>Your call</h2>" +
      (opts.restateHtml
        ? '<p class="decide-restate">' + opts.restateHtml + "</p>"
        : "") +
      '<p class="note">' +
      (opts.prompt || "Would you trust, question, or reject this claim?") +
      "</p>";

    const choices = el("div", {
      className: "choices",
      attrs: { role: "group", "aria-label": "Your call" },
    });

    const feedback = el("div", {
      className: "choice-feedback",
      attrs: { "aria-live": "polite", hidden: "true" },
    });

    const verdictBlock = el("div", {
      className: "takeaway-verdict is-choice-deferred",
    });
    verdictBlock.innerHTML =
      "<h2>Takeaway</h2>" +
      '<p class="verdict">' +
      opts.verdictHtml +
      "</p>";

    let judged = false;

    function revealVerdict() {
      verdictBlock.classList.remove("is-choice-deferred");
      verdictBlock.removeAttribute("aria-hidden");
      verdictBlock.classList.remove("is-takeaway-flash");
      void verdictBlock.offsetWidth;
      verdictBlock.classList.add("is-takeaway-flash");
      try {
        verdictBlock.scrollIntoView({ behavior: "smooth", block: "nearest" });
      } catch (e) {
        /* ignore */
      }
    }

    function hideVerdict() {
      verdictBlock.classList.add("is-choice-deferred");
      verdictBlock.setAttribute("aria-hidden", "true");
      verdictBlock.classList.remove("is-takeaway-flash");
    }

    hideVerdict();

    const labels = [
      ["trust", "I would trust it"],
      ["question", "I would question it"],
      ["reject", "I would reject it"],
    ];

    labels.forEach(function (pair) {
      const kind = pair[0];
      const label = pair[1];

      const button = el("button", {
        className: "choice",
        type: "button",
        text: label,
        attrs: { "data-kind": kind, "aria-pressed": "false" },
      });

      button.addEventListener("click", function () {
        choices.querySelectorAll(".choice").forEach(function (c) {
          c.setAttribute("aria-pressed", "false");
        });
        button.setAttribute("aria-pressed", "true");

        const j = opts.judgement[kind];
        feedback.hidden = false;
        feedback.dataset.tone = j.tone;
        feedback.innerHTML =
          '<p class="feedback-kicker">' +
          (j.tone === "calibrated"
            ? "Fits this claim"
            : "Too strong for this claim") +
          "</p><h3>" +
          j.title +
          "</h3><p>" +
          j.body +
          "</p>";

        revealVerdict();
        if (!judged) {
          judged = true;
          if (typeof opts.onJudged === "function") opts.onJudged();
        }
      });

      choices.append(button);
    });

    decide.append(choices);
    wrap.append(decide, feedback, verdictBlock);

    return {
      el: wrap,
      verdictEl: verdictBlock,
      reset: function () {
        judged = false;
        choices.querySelectorAll(".choice").forEach(function (c) {
          c.setAttribute("aria-pressed", "false");
        });
        feedback.hidden = true;
        feedback.innerHTML = "";
        feedback.removeAttribute("data-tone");
        hideVerdict();
      },
    };
  }

  // ---------------------------------------------------------------------------
  // Footer link to the next module (or home)
  // ---------------------------------------------------------------------------

  function nextModule(href, label) {
    const p = el("p", { className: "next-module" });
    p.innerHTML =
      'Next: <a href="' +
      href +
      '">' +
      label +
      '</a> · or return to <a href="#home">Contents</a>';
    return p;
  }

  // ---------------------------------------------------------------------------
  // Graph-first orient gate: stage visible, control inactive until one advance
  // (read the claim first, then Try the chart / tree / Widen the range)
  // ---------------------------------------------------------------------------

  /**
   * opts.controls — inputs to disable while locked
   * opts.mountNear — insert the CTA immediately before this node
   * opts.stage — optional viz pane; gets class orient-locked while locked
   * opts.buttonLabel — default "Try the chart"
   * opts.hint — short line above the button
   * opts.onUnlock — optional callback after unlock
   *
   * Returns { lock, unlock, isLocked }.
   */
  function applyOrientGate(opts) {
    const controls = Array.prototype.slice.call(opts.controls || []);
    const mountNear = opts.mountNear;
    const stage = opts.stage || null;
    const label = opts.buttonLabel || "Try the chart";
    let locked = true;

    const bar = el("div", {
      className: "orient-gate",
      attrs: { role: "region", "aria-label": "Start exploring" },
    });
    const hint = el("p", {
      className: "orient-gate-hint",
      text: opts.hint || "After you’ve read the claim at the top of the page, try the chart.",
    });
    const btn = el("button", {
      type: "button",
      className: "orient-gate-btn",
      text: label,
    });
    bar.append(hint, btn);

    function setControlsDisabled(disabled) {
      controls.forEach(function (c) {
        if (!c) return;
        c.disabled = !!disabled;
        if (disabled) c.setAttribute("aria-disabled", "true");
        else c.removeAttribute("aria-disabled");
      });
    }

    function lock() {
      locked = true;
      setControlsDisabled(true);
      bar.hidden = false;
      if (stage) stage.classList.add("orient-locked");
    }

    function unlock() {
      locked = false;
      setControlsDisabled(false);
      bar.hidden = true;
      if (stage) stage.classList.remove("orient-locked");
      if (controls[0] && typeof controls[0].focus === "function") {
        try {
          controls[0].focus();
        } catch (e) {
          /* ignore */
        }
      }
      if (typeof opts.onUnlock === "function") opts.onUnlock();
    }

    btn.addEventListener("click", function () {
      unlock();
    });

    if (mountNear && mountNear.parentNode) {
      mountNear.parentNode.insertBefore(bar, mountNear);
    }

    lock();

    return {
      lock: lock,
      unlock: unlock,
      isLocked: function () {
        return locked;
      },
      el: bar,
    };
  }

  // ---------------------------------------------------------------------------
  // Graph-first flow: hide Your call until first stage use
  // ---------------------------------------------------------------------------

  /**
   * Graph-first order:
   * - hide Your call until first chart / tree / range use (reveal)
   * - revealWithInteract extras (e.g. “What just changed”) show with Your call
   * - alsoHide (Going further / next) wait until after trust/question/reject
   *   via revealAfterJudgement()
   */
  function deferTakeawayUntilInteract(takeawayEl, opts) {
    opts = opts || {};
    const alsoHide = opts.alsoHide || [];
    const withInteract = opts.revealWithInteract || [];
    const placeholder = el("p", {
      className: "flow-next-hint",
      text:
        opts.hint ||
        "When you have seen what changes, choose trust, question, or reject.",
    });
    let revealed = false;
    let afterJudged = false;

    function setDeferred(node, deferred) {
      if (!node) return;
      if (deferred) {
        node.classList.add("is-flow-deferred");
        node.setAttribute("aria-hidden", "true");
      } else {
        node.classList.remove("is-flow-deferred");
        node.removeAttribute("aria-hidden");
      }
    }

    function hideAll() {
      setDeferred(takeawayEl, true);
      withInteract.forEach(function (node) {
        setDeferred(node, true);
      });
      alsoHide.forEach(function (node) {
        setDeferred(node, true);
      });
    }

    if (takeawayEl && takeawayEl.parentNode) {
      hideAll();
      takeawayEl.parentNode.insertBefore(placeholder, takeawayEl);
    }

    function reveal() {
      if (revealed) return;
      revealed = true;
      if (placeholder.parentNode) placeholder.parentNode.removeChild(placeholder);
      // Your call (+ outcome); Going further / next wait for a choice
      setDeferred(takeawayEl, false);
      withInteract.forEach(function (node) {
        setDeferred(node, false);
      });
    }

    function revealAfterJudgement() {
      if (afterJudged) return;
      afterJudged = true;
      alsoHide.forEach(function (node) {
        setDeferred(node, false);
      });
    }

    function reset() {
      revealed = false;
      afterJudged = false;
      hideAll();
      if (placeholder.parentNode == null && takeawayEl && takeawayEl.parentNode) {
        takeawayEl.parentNode.insertBefore(placeholder, takeawayEl);
      }
    }

    return {
      reveal: reveal,
      revealAfterJudgement: revealAfterJudgement,
      reset: reset,
      isRevealed: function () {
        return revealed;
      },
    };
  }

  function flashOutcome(outcomeEl) {
    if (!outcomeEl) return;
    outcomeEl.classList.remove("is-outcome-flash");
    // reflow so the animation can re-trigger
    void outcomeEl.offsetWidth;
    outcomeEl.classList.add("is-outcome-flash");
  }

  // ---------------------------------------------------------------------------
  // Mobile: expand stage to (near) full viewport without breaking listeners
  // ---------------------------------------------------------------------------

  /**
   * Adds Expand figure / Close figure on a viz pane. Uses a fixed overlay +
   * placeholder so the page does not jump; Escape closes. Desktop hides the
   * control via CSS — dual-column scroll handles large screens instead.
   */
  function attachStageExpand(stage) {
    if (!stage || stage.getAttribute("data-expand-ready") === "1") return;
    stage.setAttribute("data-expand-ready", "1");

    const bar = el("div", { className: "stage-expand-bar" });
    const btn = el("button", {
      type: "button",
      className: "stage-expand-btn",
      text: "Expand figure",
      attrs: {
        "aria-expanded": "false",
        "aria-controls": stage.id || undefined,
      },
    });
    bar.appendChild(btn);
    stage.insertBefore(bar, stage.firstChild);

    let placeholder = null;

    function expanded() {
      return stage.classList.contains("viz-pane--expanded");
    }

    function collapse() {
      if (!expanded()) return;
      stage.classList.remove("viz-pane--expanded");
      document.body.classList.remove("stage-expanded");
      btn.textContent = "Expand figure";
      btn.setAttribute("aria-expanded", "false");
      if (placeholder && placeholder.parentNode) {
        placeholder.parentNode.removeChild(placeholder);
      }
      placeholder = null;
    }

    function expand() {
      if (expanded()) return;
      placeholder = document.createElement("div");
      placeholder.className = "viz-pane-placeholder";
      placeholder.style.height = stage.offsetHeight + "px";
      placeholder.setAttribute("aria-hidden", "true");
      if (stage.parentNode) {
        stage.parentNode.insertBefore(placeholder, stage);
      }
      stage.classList.add("viz-pane--expanded");
      document.body.classList.add("stage-expanded");
      btn.textContent = "Close figure";
      btn.setAttribute("aria-expanded", "true");
      try {
        btn.focus();
      } catch (err) {
        /* ignore */
      }
    }

    btn.addEventListener("click", function () {
      if (expanded()) collapse();
      else expand();
    });

    function onKey(e) {
      if (e.key === "Escape") collapse();
    }

    function onResize() {
      // Crossing to desktop dual-scroll: drop overlay
      if (window.matchMedia("(min-width: 900px)").matches) collapse();
    }

    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);

    const obs = new MutationObserver(function () {
      if (!document.body.contains(stage)) {
        collapse();
        document.removeEventListener("keydown", onKey);
        window.removeEventListener("resize", onResize);
        obs.disconnect();
      }
    });
    obs.observe(document.body, { childList: true, subtree: true });
  }

  // ---------------------------------------------------------------------------
  // Going further: typeset .formula[data-tex] with KaTeX when available
  // ---------------------------------------------------------------------------

  function typesetMath(root) {
    root = root || document;

    function run() {
      if (!global.katex || typeof global.katex.renderToString !== "function") {
        return false;
      }
      const nodes = root.querySelectorAll
        ? root.querySelectorAll(".formula[data-tex]:not([data-typeset='1'])")
        : [];
      Array.prototype.forEach.call(nodes, function (el) {
        const tex = el.getAttribute("data-tex");
        if (!tex) return;
        try {
          el.innerHTML = global.katex.renderToString(tex, {
            displayMode: true,
            throwOnError: false,
            strict: "ignore",
          });
          el.setAttribute("data-typeset", "1");
        } catch (err) {
          /* keep plain-text fallback already in the element */
        }
      });
      return true;
    }

    if (run()) return;
    let tries = 0;
    const timer = setInterval(function () {
      tries += 1;
      if (run() || tries > 50) clearInterval(timer);
    }, 40);
  }

  // ---------------------------------------------------------------------------
  // Register helpers on CS4098.ui (modules and shell)
  // ---------------------------------------------------------------------------

  global.CS4098 = global.CS4098 || {};
  global.CS4098.ui = {
    el: el,
    buildTakeaway: buildTakeaway,
    nextModule: nextModule,
    applyOrientGate: applyOrientGate,
    deferTakeawayUntilInteract: deferTakeawayUntilInteract,
    flashOutcome: flashOutcome,
    attachStageExpand: attachStageExpand,
    typesetMath: typesetMath,
  };
})(window);
