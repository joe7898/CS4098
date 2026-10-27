/**
 * Author: Omar Raza
 * Student ID: 230013491
 * Description: Small shared helpers used by every module — create elements,
 * build the trust/question/reject takeaway block, and a “next module” link.
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
        "What would you do with this claim? Pick one — each choice gets a clear response.") +
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

  // Expose on a single namespace used by modules and the shell
  global.CS4098 = global.CS4098 || {};
  global.CS4098.ui = {
    el: el,
    buildTakeaway: buildTakeaway,
    nextModule: nextModule,
  };
})(window);
