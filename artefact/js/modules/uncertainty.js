/**
 * Author: Omar Raza
 * Student ID: 230013491
 * Description: Module 3 — uncertainty / overprecision (Isla / AI writing helper).
 * Starts as a lone “confidence 82” badge (the misleading UI), then reveals a
 * plausible band. A decision rule (accept rewrite if score ≥ 75) flips when
 * the low end of the band crosses the threshold. Graph-first (A) and More
 * guidance (B) layouts from the report.
 */

(function (global) {
  "use strict";

  // ---------------------------------------------------------------------------
  // Fixed reported score; decision threshold; band half-width from slider
  // Slider 0 = badge only (no range shown); 1–18 = revealed band width
  // ---------------------------------------------------------------------------

  const POINT = 82;
  const THRESHOLD = 75; // Isla’s rule: accept the AI rewrite only if score ≥ 75

  function ui() {
    return global.CS4098.ui;
  }

  // ---------------------------------------------------------------------------
  // Mount: build Graph-first or More guidance page, then wire badge → band
  // ---------------------------------------------------------------------------

  function mount(root, opts) {
    const helpers = ui();
    const el = helpers.el;
    const buildTakeaway = helpers.buildTakeaway;
    const nextModule = helpers.nextModule;

    const variant = (opts && opts.variant) || "a";
    const guided = variant === "b";
    root.innerHTML = "";

    const kicker = el("p", { className: "chapter-kicker", text: "Module 3 of 3" });
    const title = el("h1", { text: "A single score that hides a range" });

    // Claim: Isla + concrete act (accept AI rewrite of a lab sentence)
    const claimHtml =
      '<span class="label">Baseline example (Isla)</span>' +
      "<p>Isla’s AI writing helper highlights a sentence in her lab draft and shows one badge: " +
      "<strong>confidence 82</strong>. No range. No “could be lower.” " +
      "Her rule of thumb is simple: <strong>accept the rewrite if the score is at least 75</strong>. " +
      "The interface invites the reading: we know exactly where we stand.</p>";

    // ----- Takeaway + trust / question / reject -----
    const takeaway = buildTakeaway({
      verdictHtml:
        "<strong>Do not treat 82 alone as exact knowledge.</strong> " +
        "A point estimate without a range can create overprecision — more confidence than the evidence supports. " +
        "If a plausible low end would fall below Isla’s 75 cutoff, the calibrated move is to <strong>question</strong> the lone badge " +
        "and to <strong>reject</strong> “we know exactly where we stand.”",
      judgement: {
        trust: {
          tone: "miscalibrated",
          title: "Trust — too strong for a lone badge",
          body:
            "Trusting 82 as exact because the UI looks precise is how unwarranted trust forms: presentation persuades without showing uncertainty. " +
            "Reveal the band: when the low end drops below 75, Isla’s accept/reject rule flips even though the badge still says 82. " +
            "<strong>Calibrated alternative:</strong> question 82 until a range is reported.",
        },
        question: {
          tone: "calibrated",
          title: "Question — the calibrated response",
          body:
            "Ask how wide a plausible range is, and whether the low end would change the rewrite decision. " +
            "<strong>One sentence Isla can use:</strong> “82 without a range isn’t enough — would the low end still clear my 75 cutoff?”",
        },
        reject: {
          tone: "calibrated",
          title: "Reject — right for the overclaim",
          body:
            "Reject “we know exactly where we stand” when only a point is shown and the band would change the decision. " +
            "You are not rejecting every score; you are rejecting that completeness claim. " +
            "<strong>One sentence Isla can use:</strong> “A single confidence badge is not exact knowledge — I reject that reading.”",
        },
      },
    });

    // Short “Going further” (Graph-first, collapsed by default)
    const furtherShort =
      "<h3>Point estimates and intervals</h3>" +
      "<p>A <span class=\"math\">point estimate</span> is a single summary (82). An <span class=\"math\">interval</span> collects nearby values still treated as compatible with the evidence.</p>" +
      "<h3>Overprecision</h3>" +
      "<p>Showing 82 with no range can create <span class=\"math\">overprecision</span> — more confidence in the digit than the data support. That is a calibration failure (overtrust in exactness).</p>" +
      '<p class="formula">reported value ± margin → interval [low, high]</p>' +
      "<p>Isla’s decision rule (accept if ≥ 75) makes the point concrete: if the low end of the band falls below 75, the lone badge was not enough.</p>";

    // Longer chapter notes (More guidance, shown in full)
    const furtherGuided =
      "<p>These notes spell out the vocabulary behind the short interactive path.</p>" +
      furtherShort +
      "<h3>What an interval is trying to say</h3>" +
      "<p>In classical statistics, a confidence interval is defined through a long-run coverage procedure. " +
      "In everyday reading — and in Spiegelhalter-style communication — a displayed band is also a plain warning: " +
      "do not pretend the estimate is known more finely than this. This module uses that everyday reading on purpose.</p>" +
      "<h3>Contractual trust</h3>" +
      "<p>Jacovi and colleagues treat trust in AI as contractual: you trust a specific claim (for example “82 is exact enough to accept the rewrite”), not “the system” in general. " +
      "If the interface never shows uncertainty, that contract can look stronger than the evidence — unwarranted trust from presentation.</p>" +
      "<h3>What this page leaves out</h3>" +
      "<p>It does not derive a formal 95% confidence interval from a sample. It teaches the claim-literacy habit: ask for the range before you trust the point — especially when a decision threshold is in play.</p>";

    // ----- Interactive stage: badge first, then band + decision flip -----
    const vizPane = el("div", {
      className: "viz-pane" + (guided ? " viz-pane--compact" : ""),
    });

    // Fake product chrome — what Isla actually sees before a range is shown
    const badgeChrome = el("div", { className: "badge-chrome", id: "badge-chrome" });
    badgeChrome.innerHTML =
      '<p class="badge-kicker">AI writing helper</p>' +
      '<p class="badge-draft">“…the results were statistically significant (p &lt; .05)…”</p>' +
      '<div class="confidence-badge" aria-hidden="false">' +
      '<span class="confidence-badge-label">Confidence</span>' +
      '<span class="confidence-badge-num">82</span>' +
      "</div>" +
      '<p class="badge-note" id="badge-note">No range shown — this is the misleading interface.</p>';

    const compare = el("div", { className: "compare-strip", id: "band-compare" });
    compare.innerHTML =
      '<div class="compare-card past"><div class="compare-label">What the badge claims</div><div class="compare-num">exact 82</div></div>' +
      '<div class="compare-card next"><div class="compare-label">Honest range</div><div class="compare-num" id="band-readout">hidden</div></div>';

    const decision = el("div", {
      className: "decision-hero",
      id: "decision-hero",
      attrs: { "aria-live": "polite" },
    });
    decision.innerHTML =
      '<p class="decision-rule">Isla’s rule: accept rewrite if score ≥ ' +
      THRESHOLD +
      "</p>" +
      '<p class="decision-verdict" id="decision-verdict">—</p>' +
      '<p class="decision-explain" id="decision-explain"></p>';

    const scoreLine = el("div", {
      className: "score-line",
      id: "score-line",
      attrs: { role: "img", "aria-label": "Score 82 with optional uncertainty band" },
    });
    const axis = el("div", { className: "score-axis" });
    const band = el("div", { className: "score-band", id: "score-band" });
    const thresholdMark = el("div", {
      className: "score-threshold",
      attrs: { title: "Decision cutoff 75" },
    });
    const point = el("div", { className: "score-point" });
    const pointLabel = el("div", { className: "score-point-label", text: "82" });
    scoreLine.append(axis, band, thresholdMark, point, pointLabel);

    const labels = el("div", { className: "score-labels" });
    labels.innerHTML =
      "<span>0</span><span>50</span><span class=\"thresh-lab\">75 cutoff</span><span>100</span>";

    const control = el("div", { className: "control" });
    const ends = el("div", { className: "ends" });
    ends.innerHTML = "<span>Badge only</span><span>Wider “could be”</span>";
    const slider = el("input", {
      type: "range",
      min: "0",
      max: "18",
      value: "0",
      step: "1",
      attrs: { "aria-label": "Reveal and widen uncertainty around the score" },
    });
    const prompt = el("p", {
      className: "drag-prompt",
      text: "Start on the left (badge only). Drag right to reveal a range — watch whether Isla’s 75 rule still holds.",
    });
    const live = el("p", { className: "live", attrs: { "aria-live": "polite" } });
    control.append(ends, slider, prompt, live);

    vizPane.append(badgeChrome, compare, decision, scoreLine, labels, control);

    const outcomeSummary = el("div", {
      className: "outcome-summary",
      attrs: { "aria-live": "polite" },
    });
    outcomeSummary.innerHTML =
      '<span class="outcome-label">What just changed</span><p></p>';
    const outcomeP = outcomeSummary.querySelector("p");

    // Map 0–100 score onto the horizontal track (% of the line)
    function pct(v) {
      return 6 + (v / 100) * 88;
    }

    // Badge-only vs band revealed; decision flips when low end < 75
    function update() {
      const half = Number(slider.value);
      const revealed = half > 0;
      const lo = Math.max(0, POINT - half);
      const hi = Math.min(100, POINT + half);
      const flips = revealed && lo < THRESHOLD;

      // Threshold tick always visible once we have a scale
      thresholdMark.style.left = pct(THRESHOLD) + "%";
      point.style.left = pct(POINT) + "%";
      pointLabel.style.left = pct(POINT) + "%";

      if (!revealed) {
        band.style.display = "none";
        badgeChrome.classList.remove("is-honest");
        document.getElementById("badge-note").textContent =
          "No range shown — this is the misleading interface.";
        document.getElementById("band-readout").textContent = "hidden";
        compare.classList.remove("warn");
        document.getElementById("decision-verdict").textContent =
          "Accept rewrite (badge says 82 ≥ 75)";
        document.getElementById("decision-verdict").dataset.state = "accept";
        document.getElementById("decision-explain").textContent =
          "With only the badge, Isla’s rule looks satisfied. The interface never shows that 82 might sit inside a wider range.";
        live.textContent =
          "Badge only: confidence 82, no range. The helper looks exact.";
        if (outcomeP) {
          outcomeP.innerHTML =
            "Right now you see what Isla sees: a polished <strong>confidence 82</strong> with no band. " +
            "Her rule (<strong>accept if ≥ 75</strong>) looks fine. Drag right to reveal a plausible range and check whether the <em>low end</em> still clears 75.";
        }
        return;
      }

      band.style.display = "block";
      band.style.left = pct(lo) + "%";
      band.style.width = pct(hi) - pct(lo) + "%";
      badgeChrome.classList.add("is-honest");
      document.getElementById("badge-note").textContent =
        "Range revealed — same centre, honest spread.";
      document.getElementById("band-readout").textContent = lo + "–" + hi;

      const verdictEl = document.getElementById("decision-verdict");
      const explainEl = document.getElementById("decision-explain");

      if (flips) {
        compare.classList.add("warn");
        verdictEl.textContent = "Decision flips — do not treat 82 as enough";
        verdictEl.dataset.state = "flip";
        explainEl.textContent =
          "Low end " +
          lo +
          " is below Isla’s cutoff of " +
          THRESHOLD +
          ". The badge still says 82, but an honest range would change whether she accepts the rewrite.";
        live.textContent =
          "Band " +
          lo +
          "–" +
          hi +
          ": low end crosses 75. Same centre, different decision.";
      } else {
        compare.classList.remove("warn");
        verdictEl.textContent = "Accept still looks OK (low end ≥ 75)";
        verdictEl.dataset.state = "accept";
        explainEl.textContent =
          "Low end " +
          lo +
          " still clears 75. A narrow honest range can leave the decision unchanged — but 82 alone never showed that.";
        live.textContent =
          "Band " + lo + "–" + hi + ": low end still clears the 75 cutoff.";
      }

      if (outcomeP) {
        if (flips) {
          outcomeP.innerHTML =
            "The badge still shows <strong>82</strong>, but the honest band is about <strong>" +
            lo +
            "–" +
            hi +
            "</strong>. The low end is <strong>below 75</strong>, so Isla’s accept/reject rule flips. " +
            "That is the overprecision lesson: a lone score can look decision-ready while a range would change the act.";
        } else {
          outcomeP.innerHTML =
            "Band about <strong>" +
            lo +
            "–" +
            hi +
            "</strong>. Low end still clears <strong>75</strong>, so the rewrite decision may stay the same — " +
            "but only the range made that checkable. Widen further and watch the decision flip.";
        }
      }
    }

    slider.addEventListener("input", update);

    // ----- Page layout: More guidance (B) or Graph-first (A) -----
    let further = null;

    if (guided) {
      root.append(kicker, title);
      const flow = el("div", { className: "guided-flow" });

      const step1 = el("section", { className: "guided-step" });
      step1.innerHTML =
        '<p class="step-label">Step 1 — Read the claim</p>' +
        "<h2>What the confidence badge is selling</h2>";
      const claim = el("div", { className: "claim" });
      claim.innerHTML = claimHtml;
      step1.append(claim);
      step1.append(
        el("p", {
          text:
            "Separate two claims. Claim A: the system’s best single summary is 82. " +
            "Claim B: we know exactly where we stand — exact enough for Isla to accept the rewrite under a 75 cutoff. " +
            "A can be reasonable while B is not. Interfaces often present A in a way that feels like B.",
        })
      );
      step1.append(
        el("p", {
          text:
            "This page starts on the misleading UI on purpose: badge only, no range. " +
            "You then reveal a band and check whether the low end still clears 75. " +
            "That is the decision test — the same idea as opposite-swing meters or a falling PPV, but for overprecision.",
        })
      );
      flow.append(step1);

      const step2 = el("section", { className: "guided-step" });
      step2.innerHTML =
        '<p class="step-label">Step 2 — How to use the display</p>' +
        "<h2>Badge, band, and the 75 cutoff</h2>" +
        "<ol>" +
        "<li><strong>Badge only (slider left)</strong> — what Isla sees: confidence 82, no range.</li>" +
        "<li><strong>Band (drag right)</strong> — values still treated as plausible around 82.</li>" +
        "<li><strong>75 cutoff</strong> — Isla’s rule for accepting the rewrite; marked on the scale.</li>" +
        "<li><strong>Decision flip</strong> — when the low end drops below 75, accept becomes unsafe even though the badge still says 82.</li>" +
        "</ol>" +
        "<p>Move the slider slowly. After each move, read the decision line and the written summary.</p>";
      flow.append(step2);

      const step3 = el("section", { className: "guided-step" });
      step3.innerHTML =
        '<p class="step-label">Step 3 — Try the control</p>' +
        "<h2>Reveal uncertainty and watch the decision</h2>";
      step3.append(vizPane, outcomeSummary);
      flow.append(step3);

      const step4 = el("section", { className: "guided-step" });
      step4.innerHTML =
        '<p class="step-label">Step 4 — Decide</p>' +
        "<h2>From the band back to the badge</h2>" +
        "<p>Choose trust, question, or reject for the claim that 82 alone means we know exactly where we stand.</p>";
      step4.append(takeaway.el);
      flow.append(step4);

      further = el("section", { className: "further-block" });
      further.innerHTML =
        "<h2>Chapter notes — intervals and overprecision</h2>" + furtherGuided;
      flow.append(further);
      flow.append(nextModule("#home", "Back to Contents"));
      root.append(flow);
    } else {
      // Variant A: Seeing Theory — left copy + right stage (outcome on A too)
      const claim = el("div", { className: "claim" });
      claim.innerHTML = claimHtml;

      const orient = el("p", {
        className: "lede",
        text:
          "Start with the badge alone. Reveal a range and watch whether Isla’s “accept if ≥ 75” rule still holds.",
      });

      const prose = el("div", { className: "prose" });
      prose.append(
        el("p", {
          text:
            "A lone confidence badge can create overprecision — unwarranted trust in exactness. " +
            "The decision cutoff makes the cost visible: when the low end crosses 75, 82 alone was not enough.",
        })
      );
      prose.append(outcomeSummary);
      prose.append(takeaway.el);

      further = el("details", { className: "further" });
      further.innerHTML =
        "<summary>Going further — the mathematical idea</summary>" + furtherShort;
      prose.append(further);
      prose.append(nextModule("#home", "Back to Contents"));

      const copy = el("div", { className: "module-copy" });
      copy.append(kicker, title, claim, orient, prose);

      const split = el("div", { className: "module-split" });
      split.append(copy, vizPane);
      root.append(split);
    }

    update();

    return {
      reset: function () {
        slider.value = "0";
        takeaway.reset();
        if (further && further.tagName === "DETAILS") further.open = false;
        update();
      },
      destroy: function () {
        root.innerHTML = "";
      },
    };
  }

  global.CS4098 = global.CS4098 || {};
  global.CS4098.modules = global.CS4098.modules || {};
  global.CS4098.modules.uncertainty = {
    id: "uncertainty",
    title: "A single score that hides a range",
    mount: mount,
  };
})(window);
