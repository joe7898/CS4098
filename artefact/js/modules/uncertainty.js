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

    // Claim text shared by both layouts (Isla / confidence badge, cutoff 75)
    const claimHtml =
      '<span class="label">Example — Isla</span>' +
      "<p>Isla’s AI writing helper highlights a sentence in her lab draft and shows one badge: " +
      "<strong>confidence 82</strong>, with no range. " +
      "Her rule of thumb is to <strong>accept the rewrite if the score is at least 75</strong>. " +
      "The interface invites the reading: we know exactly where we stand.</p>";

    // ----- Takeaway + trust / question / reject -----
    const takeaway = buildTakeaway({
      verdictHtml:
        "<strong>Question a lone score that hides a range — especially when a decision threshold is in play.</strong> " +
        "A point estimate without a range can invite more confidence than the evidence supports. " +
        "If a plausible low end would fall below Isla’s 75 cutoff, <strong>question</strong> the lone badge " +
        "and <strong>reject</strong> the reading that “we know exactly where we stand.”",
      judgement: {
        trust: {
          tone: "miscalibrated",
          title: "Trust — too strong for a lone badge",
          body:
            "Trusting 82 as exact because the interface looks precise is how unwarranted trust forms: presentation persuades without showing uncertainty. " +
            "When the low end of a plausible band drops below 75, Isla’s accept/reject rule flips even though the badge still says 82. " +
            "Question 82 until a range is reported.",
        },
        question: {
          tone: "calibrated",
          title: "Question — the calibrated response",
          body:
            "Ask how wide a plausible range is, and whether the low end would change the rewrite decision. " +
            "A lone confidence badge is not enough when a cutoff such as 75 is in play.",
        },
        reject: {
          tone: "calibrated",
          title: "Reject — right for the overclaim",
          body:
            "Reject “we know exactly where we stand” when only a point is shown and a range would change the decision. " +
            "That does not mean rejecting every score; it means rejecting that completeness claim.",
        },
      },
    });

    // Short “Going further” (Graph-first, collapsed by default)
    const furtherShort =
      "<h3>Point estimates and intervals</h3>" +
      "<p>A <span class=\"math\">point estimate</span> is a single summary (82). An <span class=\"math\">interval</span> collects nearby values still treated as compatible with the evidence.</p>" +
      "<h3>Overprecision</h3>" +
      "<p>Showing 82 with no range can create <span class=\"math\">overprecision</span> — more confidence in the digit than the data support. That is a calibration failure (overtrust in exactness), the habit Spiegelhalter-style communication warns against when a lone number looks exact.</p>" +
      '<p class="formula">reported value ± margin → interval [low, high]</p>' +
      "<h3>Why this control goes from ±0 to ±18</h3>" +
      "<p>The slider sets a half-width around 82 so you can see when uncertainty would matter for Isla’s cutoff. " +
      "That cutoff is 75, so the low end crosses it once the half-width reaches <strong>8</strong> (82 − 8 = 74). The control continues to ±18 so you can feel “still OK” vs “decision flips” vs “clearly below.” " +
      "82 and 75 are the numbers in Isla’s story for that decision test.</p>" +
      "<h3>Contractual trust</h3>" +
      "<p>Jacovi and colleagues treat trust in AI as contractual: you trust a specific claim (for example “82 is exact enough to accept the rewrite”), not “the system” in general. " +
      "A badge with no range can make that contract look stronger than the evidence.</p>";

    // Longer chapter notes (More guidance, shown in full)
    const furtherGuided =
      "<p>Optional detail for keen readers. The short path above is enough for a calibrated takeaway.</p>" +
      furtherShort +
      "<h3>What an interval is trying to say</h3>" +
      "<p>In classical statistics, a confidence interval is defined through a long-run coverage procedure. " +
      "In everyday reading — and in Spiegelhalter’s public communication of uncertainty — a displayed band is also a plain warning: " +
      "do not pretend the estimate is known more finely than this. This module uses that everyday reading on purpose.</p>" +
      "<h3>Keeping the page small</h3>" +
      "<p>Ask for the range before you trust the point — especially when a decision threshold is in play.</p>";

    // ----- Interactive stage: badge first, then band + decision flip -----
    const vizPane = el("div", {
      className: "viz-pane" + (guided ? " viz-pane--compact" : ""),
    });
    if (helpers.attachStageExpand) helpers.attachStageExpand(vizPane);

    // Fake product chrome — what Isla actually sees before a range is shown
    const badgeChrome = el("div", { className: "badge-chrome", id: "badge-chrome" });
    badgeChrome.innerHTML =
      '<p class="badge-kicker">AI writing helper</p>' +
      '<p class="badge-draft">“…the results were statistically significant (p &lt; .05)…”</p>' +
      '<div class="confidence-badge" aria-hidden="false">' +
      '<span class="confidence-badge-label">Confidence</span>' +
      '<span class="confidence-badge-num">82</span>' +
      "</div>" +
      '<p class="badge-note" id="badge-note">No range shown — only the single score.</p>';

    const compare = el("div", { className: "compare-strip", id: "band-compare" });
    compare.innerHTML =
      '<div class="compare-card past"><div class="compare-label">What the badge claims</div><div class="compare-num">exact 82</div></div>' +
      '<div class="compare-card next"><div class="compare-label">With a range</div><div class="compare-num" id="band-readout">hidden</div></div>';

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

    const paramNote = el("p", { className: "param-note" });
    paramNote.innerHTML =
      "<strong>Why this range control.</strong> " +
      "It widens a band around the fixed badge <strong>82</strong>. " +
      "Isla accepts only if score ≥ <strong>75</strong>, so the decision flips once half-width reaches <strong>±8</strong> (low end 74). " +
      "The slider goes to ±18 so you can compare “still clears 75,” “just flipped,” and “clearly below.”";

    const control = el("div", { className: "control" });
    const ends = el("div", { className: "ends" });
    ends.innerHTML = "<span>Badge only (±0)</span><span>Wide band (±18)</span>";
    const slider = el("input", {
      type: "range",
      min: "0",
      max: "18",
      value: "0",
      step: "1",
      attrs: {
        "aria-label":
          "Half-width of uncertainty around confidence 82; decision flips near plus or minus 8",
      },
    });
    const prompt = el("p", {
      className: "drag-prompt",
      text:
        "Start on the left (badge only). Drag right to widen the band — watch for the flip near ±8 when the low end crosses 75.",
    });
    const live = el("p", { className: "live", attrs: { "aria-live": "polite" } });
    control.append(ends, slider, prompt, live);

    vizPane.append(badgeChrome, compare, decision, scoreLine, labels, paramNote, control);

    const outcomeSummary = el("div", {
      className: "outcome-summary",
      attrs: { "aria-live": "polite" },
    });
    outcomeSummary.innerHTML =
      '<span class="outcome-label">What just changed</span><p></p>';
    const outcomeP = outcomeSummary.querySelector("p");

    // ----- Band geometry + live decision updates -----

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
          "No range shown — only the single score.";
        document.getElementById("band-readout").textContent = "hidden";
        compare.classList.remove("warn");
        document.getElementById("decision-verdict").textContent =
          "Accept rewrite (badge says 82 ≥ 75)";
        document.getElementById("decision-verdict").dataset.state = "accept";
        document.getElementById("decision-explain").textContent =
          "With only the badge, Isla’s rule looks satisfied. The interface never shows that 82 might sit inside a wider range.";
        live.textContent =
          "Badge only (±0): confidence 82, no range. The helper looks exact.";
        if (outcomeP) {
          outcomeP.innerHTML =
            "Right now you see what Isla sees: a polished <strong>confidence 82</strong> with no band. " +
            "Her rule (<strong>accept if ≥ 75</strong>) looks fine. " +
            "Drag right to widen the band. The decision flips once half-width reaches <strong>±8</strong>.";
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
          "±" +
          half +
          " → band " +
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
          "±" + half + " → band " + lo + "–" + hi + ": low end still clears 75 (flip starts at ±8).";
      }

      if (outcomeP) {
        if (flips) {
          outcomeP.innerHTML =
            "Half-width <strong>±" +
            half +
            "</strong> gives band <strong>" +
            lo +
            "–" +
            hi +
            "</strong>. The badge still shows <strong>82</strong>, but the low end is <strong>below 75</strong>, so Isla’s rule flips. " +
            "That is the overprecision lesson: a lone score can look decision-ready while a range would change the act.";
        } else {
          outcomeP.innerHTML =
            "Half-width <strong>±" +
            half +
            "</strong> → band <strong>" +
            lo +
            "–" +
            hi +
            "</strong>. Low end still clears <strong>75</strong>, so the rewrite decision may stay the same — " +
            "but only the range made that checkable. Keep widening; the flip begins at <strong>±8</strong>.";
        }
      }
    }

    // ----- Page layout: More guidance (B) or Graph-first (A) -----
    let further = null;

    if (guided) {
      root.append(kicker, title);
      const flow = el("div", { className: "guided-flow" });

      const step1 = el("section", { className: "guided-step" });
      step1.innerHTML =
        '<p class="step-label">Step 1 — Read the claim</p>' +
        "<h2>What the confidence badge claims</h2>";
      const claim = el("div", { className: "claim" });
      claim.innerHTML = claimHtml;
      step1.append(claim);
      step1.append(
        el("p", {
          text:
            "Separate two claims. The system’s best single summary is 82. " +
            "And we know exactly where we stand — exact enough for Isla to accept the rewrite under a 75 cutoff. " +
            "The first can be reasonable while the second is not. Interfaces often present a point estimate in a way that feels like exact knowledge.",
        })
      );
      step1.append(
        el("p", {
          text:
            "This page starts with the badge Isla sees: 82, no range. " +
            "You then reveal a band and check whether the low end still clears 75. " +
            "When it falls below the cutoff, the accept/reject decision flips even though the badge still says 82.",
        })
      );
      flow.append(step1);

      const step2 = el("section", { className: "guided-step" });
      step2.innerHTML =
        '<p class="step-label">Step 2 — How to use the display</p>' +
        "<h2>Badge, band, and the 75 cutoff</h2>" +
        "<ol>" +
        "<li><strong>Badge only (±0)</strong> — what Isla sees: confidence 82, no range.</li>" +
        "<li><strong>Half-width (drag right)</strong> — a ±margin around 82, up to ±18.</li>" +
        "<li><strong>75 cutoff</strong> — Isla’s rule for accepting the rewrite; marked on the scale.</li>" +
        "<li><strong>Decision flip at ±8</strong> — low end becomes 74; accept becomes unsafe even though the badge still says 82.</li>" +
        "</ol>" +
        "<p>Move the slider slowly. After each move, read the decision line and the short summary. Notice why ±8 matters given 82 and 75.</p>";
      flow.append(step2);

      const step3 = el("section", { className: "guided-step" });
      step3.innerHTML =
        '<p class="step-label">Step 3 — Try the control</p>' +
        "<h2>Reveal the range and watch the decision</h2>";
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
        "<h2>Going further — intervals and overprecision</h2>" + furtherGuided;
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
          "Read the claim first. Then try the control: start with the badge alone, widen the band, and watch Isla’s “accept if ≥ 75” rule — it flips near ±8.",
      });

      const proseAbove = el("div", { className: "prose" });
      proseAbove.append(
        el("p", {
          text:
            "A lone confidence badge can create overprecision — unwarranted trust in exactness. " +
            "Widen the band and check whether the low end still clears Isla’s 75 cutoff.",
        })
      );

      further = el("details", { className: "further" });
      further.innerHTML =
        "<summary>Going further — the mathematical idea</summary>" + furtherShort;
      const nextEl = nextModule("#home", "Back to Contents");

      // “What just changed” on the stage — deferred until first interact
      vizPane.append(outcomeSummary);

      const copyAbove = el("div", {
        className: "module-copy module-copy--above",
      });
      copyAbove.append(kicker, title, claim, orient, proseAbove);

      const copyBelow = el("div", {
        className: "module-copy module-copy--below",
      });
      const proseBelow = el("div", { className: "prose" });
      proseBelow.append(takeaway.el, further, nextEl);
      copyBelow.append(proseBelow);

      const copyStack = el("div", { className: "module-copy-stack" });
      copyStack.append(copyAbove, copyBelow);

      const split = el("div", { className: "module-split" });
      split.append(copyStack, vizPane);
      root.append(split);

      takeaway.el._flowAlsoHide = [further, nextEl, outcomeSummary];
    }

    // Graph-first only: control inactive until Try the control (Design orient gate)
    let orientGate = null;
    let takeawayFlow = null;
    let interacted = false;
    if (!guided && global.CS4098.ui && global.CS4098.ui.applyOrientGate) {
      orientGate = global.CS4098.ui.applyOrientGate({
        controls: [slider],
        mountNear: control,
        stage: vizPane,
        buttonLabel: "Try the control",
        hint: "Read the claim on the left first. The badge is a preview until you press Try the control.",
      });
      if (global.CS4098.ui.deferTakeawayUntilInteract) {
        takeawayFlow = global.CS4098.ui.deferTakeawayUntilInteract(takeaway.el, {
          hint: "After you try the control, you’ll decide trust, question, or reject here.",
          alsoHide: takeaway.el._flowAlsoHide || [],
        });
      }
    }

    // First interact reveals the deferred takeaway (Graph-first Design order)
    slider.addEventListener("input", function () {
      if (!guided && orientGate && !orientGate.isLocked()) {
        if (!interacted) {
          interacted = true;
          if (takeawayFlow) takeawayFlow.reveal();
          if (global.CS4098.ui && global.CS4098.ui.flashOutcome) {
            global.CS4098.ui.flashOutcome(outcomeSummary);
          }
        }
      }
      update();
    });

    update();

    return {
      reset: function () {
        slider.value = "0";
        interacted = false;
        takeaway.reset();
        if (further && further.tagName === "DETAILS") further.open = false;
        if (orientGate) orientGate.lock();
        if (takeawayFlow) takeawayFlow.reset();
        update();
      },
      destroy: function () {
        root.innerHTML = "";
      },
    };
  }

  // ---------------------------------------------------------------------------
  // Register with the app shell (hash route #uncertainty)
  // ---------------------------------------------------------------------------

  global.CS4098 = global.CS4098 || {};
  global.CS4098.modules = global.CS4098.modules || {};
  global.CS4098.modules.uncertainty = {
    id: "uncertainty",
    title: "A single score that hides a range",
    mount: mount,
  };
})(window);
