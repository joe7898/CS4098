/**
 * Author: Omar Raza
 * Student ID: 230013491
 * Description: Shared helpers for every module — DOM create, takeaway chips,
 * next-module link, Graph-first orient gate, deferred takeaway, outcome flash,
 * and mobile stage expand. Modules and the shell read these via CS4098.ui.
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
  // Takeaway: verdict + Trust / Question / Reject with feedback
  // ---------------------------------------------------------------------------

  /**
   * Build the end-of-module takeaway (report FR3).
   *
   * opts.verdictHtml — plain-language conclusion (HTML string)
   * opts.prompt — optional line above the three buttons
   * opts.judgement — { trust|question|reject: { tone, title, body } }
   *   tone is "calibrated" or "miscalibrated" (styles the feedback panel)
   *
   * Returns { el, reset } so Restart can clear the choice.
   */
  function buildTakeaway(opts) {
    const wrap = el("div", { className: "takeaway" });

    wrap.innerHTML =
      "<h2>Takeaway</h2>" +
      '<p class="verdict">' +
      opts.verdictHtml +
      "</p>" +
      '<p class="note">' +
      (opts.prompt ||
        "Would you trust, question, or reject this claim? Each choice gets a short response.") +
      "</p>";

    const choices = el("div", {
      className: "choices",
      attrs: { role: "group", "aria-label": "Your judgement" },
    });

    const feedback = el("div", {
      className: "choice-feedback",
      attrs: { "aria-live": "polite", hidden: "true" },
    });

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
        // Only one choice pressed at a time
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
            ? "Calibrated judgement"
            : "Miscalibrated for this claim") +
          "</p><h3>" +
          j.title +
          "</h3><p>" +
          j.body +
          "</p>";
      });

      choices.append(button);
    });

    wrap.append(choices, feedback);

    return {
      el: wrap,
      reset: function () {
        choices.querySelectorAll(".choice").forEach(function (c) {
          c.setAttribute("aria-pressed", "false");
        });
        feedback.hidden = true;
        feedback.innerHTML = "";
        feedback.removeAttribute("data-tone");
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
  // (report Design: orient before interact)
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
      attrs: { role: "region", "aria-label": "Try the interactive chart" },
    });
    const hint = el("p", {
      className: "orient-gate-hint",
      text:
        opts.hint ||
        "Read the claim first. The chart is a preview until you press Try the chart.",
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
  // Graph-first flow: hide takeaway until first chart use (Design order)
  // ---------------------------------------------------------------------------

  /**
   * Defer judgement UI until after Try the chart + first meaningful interact.
   * Shows a short placeholder so the path stays clear.
   */
  function deferTakeawayUntilInteract(takeawayEl, opts) {
    opts = opts || {};
    const alsoHide = opts.alsoHide || [];
    const placeholder = el("p", {
      className: "flow-next-hint",
      text:
        opts.hint ||
        "After you try the chart, you’ll decide trust, question, or reject here.",
    });
    let revealed = false;

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
      alsoHide.forEach(function (node) {
        setDeferred(node, true);
      });
    }

    function showAll() {
      setDeferred(takeawayEl, false);
      alsoHide.forEach(function (node) {
        setDeferred(node, false);
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
      showAll();
    }

    function reset() {
      revealed = false;
      hideAll();
      if (placeholder.parentNode == null && takeawayEl && takeawayEl.parentNode) {
        takeawayEl.parentNode.insertBefore(placeholder, takeawayEl);
      }
    }

    return { reveal: reveal, reset: reset, isRevealed: function () { return revealed; } };
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
   * Adds Expand chart / Close chart on a viz pane. Uses a fixed overlay +
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
      text: "Expand chart",
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
      btn.textContent = "Expand chart";
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
      btn.textContent = "Close chart";
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
  };
})(window);
