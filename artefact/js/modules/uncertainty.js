/**
 * Author: Omar Raza
 * Student ID: 230013491
 * Description: Module 3 — A confidence score that hides a range (Isla /
 * writing helper). Starts as lone confidence score 82, then reveals a range.
 * Isla’s rule (accept rewrite if score ≥ 75) flips when the bottom of the
 * range crosses the cutoff. Graph-first and More guidance layouts.
 */

(function (global) {
  "use strict";

  // ---------------------------------------------------------------------------
  // Fixed reported score; decision cutoff; ±margin from slider
  // Slider 0 = score alone (no range); 1–18 = half of the revealed range width
  // ---------------------------------------------------------------------------

  const POINT = 82;
  const THRESHOLD = 75; // Isla’s rule: accept if confidence score is at least 75

  function ui() {
    return global.CS4098.ui;
  }

  // ---------------------------------------------------------------------------
  // Mount: build Graph-first or More guidance page, then wire score → range
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
    const title = el("h1", { text: "A confidence score that hides a range" });

    // Claim card shared by both layouts (Isla / confidence score, cutoff 75)
    const claimHtml =
      '<span class="label">The claim</span>' +
      '<span class="claim-who">Isla · AI writing helper</span>' +
      "<p>Isla’s writing helper highlights a sentence in her lab draft and shows one number: " +
      "<strong>confidence score 82</strong> " +
      "(0–100 — how sure the helper claims to be about that rewrite), with no range. " +
      "Her rule is to <strong>accept the rewrite if the confidence score is at least 75</strong>. " +
      "The interface invites the reading: we know exactly where we stand.</p>";

    // ----- Your call first; Takeaway after a choice -----
    let takeawayFlow = null;
    const takeaway = buildTakeaway({
      restateHtml:
        "Confidence <strong>82</strong> with no range is exact enough for Isla to accept the rewrite under her <strong>75</strong> cutoff.",
      prompt: "Would you trust, question, or reject that claim?",
      verdictHtml:
        "<strong>Question a lone score that hides a range — especially when a yes/no cutoff is in play.</strong> " +
        "A single number with no range can look more exact than it really is. " +
        "If the bottom of a fair range would fall below Isla’s 75 cutoff, <strong>question</strong> the lone confidence score " +
        "and <strong>reject</strong> the reading that “we know exactly where we stand.”",
      judgement: {
        trust: {
          tone: "miscalibrated",
          title: "Trust — too strong for a lone score",
          body:
            "Trusting 82 as exact because the screen looks precise is easy: the number looks finished. " +
            "When the bottom of a fair range drops below 75, Isla’s accept rule flips even though the helper still shows 82. " +
            "Question 82 until a range is shown.",
        },
        question: {
          tone: "calibrated",
          title: "Question — the right call here",
          body:
            "Ask how wide a fair range is, and whether the bottom of it would change whether Isla accepts the rewrite. " +
            "A lone confidence score is not enough when a cutoff such as 75 is in play.",
        },
        reject: {
          tone: "calibrated",
          title: "Reject — right for what the screen overpromises",
          body:
            "Reject “we know exactly where we stand” when only one number is shown and a range would change the decision. " +
            "That does not mean rejecting every score; it means rejecting that “exact enough” reading.",
        },
      },
      onJudged: function () {
        if (takeawayFlow && takeawayFlow.revealAfterJudgement) {
          takeawayFlow.revealAfterJudgement();
        }
      },
    });

    // Short “Going further” (Graph-first, collapsed by default)
    const furtherShort =
      "<h3>One number vs a range</h3>" +
      "<p>A <span class=\"math\">point estimate</span> is a single summary (82). An <span class=\"math\">interval</span> (a range) is a band of nearby values that are still treated as reasonable.</p>" +
      "<h3>Looking more exact than you are</h3>" +
      "<p>Showing 82 with no range can create <span class=\"math\">overprecision</span> — trusting the digit more than the evidence allows. " +
      "Spiegelhalter warns against that habit when a lone number looks exact.</p>" +
      '<p class="formula" data-tex="\\text{reported value}\\pm\\text{margin}\\;\\rightarrow\\;[\\text{low},\\,\\text{high}]">reported value ± margin → range [low, high]</p>' +
      "<h3>Why this control goes from ±0 to ±18</h3>" +
      "<p>The slider sets a ±margin around 82 so you can see when a range would matter for Isla’s cutoff. " +
      "That cutoff is 75, so the bottom crosses it once the margin reaches <strong>±8</strong> (82 − 8 = 74). The slider continues to ±18 so you can see when the decision stays the same, flips near ±8, or clearly fails the cutoff. " +
      "82 and 75 are the numbers in Isla’s story.</p>" +
      "<h3>Trusting a specific claim</h3>" +
      "<p>Jacovi and colleagues say you trust a specific claim (for example “82 is exact enough to accept the rewrite”), not “the system” in general. " +
      "A confidence score with no range can make that claim look stronger than it is.</p>";

    const furtherSources =
      "<h3>Sources</h3>" +
      "<p>Saying how unsure a number is: Spiegelhalter, <em>The Art of Statistics</em> (2019) and <em>The Art of Uncertainty</em> (2024). " +
      "Trusting the claim on the screen: Jacovi and colleagues (2021). More on the home page under <a href=\"#sources\">Sources</a>.</p>";

    // Longer chapter notes (More guidance, shown in full)
    const furtherGuided =
      furtherShort +
      "<h3>What a range is trying to say</h3>" +
      "<p>Statisticians give confidence intervals a careful technical meaning. " +
      "In everyday reading — and in Spiegelhalter’s books — a displayed range is also a plain warning: " +
      "do not pretend the number is known more finely than this.</p>" +
      "<p>Ask for the range before you trust the score — especially when a cutoff like Isla’s 75 is in play.</p>" +
      furtherSources;

    const furtherShortWithSources = furtherShort + furtherSources;

    // ----- Interactive stage: score first, then range + decision flip -----
    const vizPane = el("div", {
      className: "viz-pane" + (guided ? " viz-pane--compact" : ""),
    });
    if (helpers.attachStageExpand) helpers.attachStageExpand(vizPane);

    // Claim already states the lone score; stage leads with range vs cutoff
    const compare = el("div", { className: "compare-strip", id: "band-compare" });
    compare.innerHTML =
      '<div class="compare-card past"><div class="compare-label">Score alone</div><div class="compare-num">82</div></div>' +
      '<div class="compare-card next"><div class="compare-label">With a range</div><div class="compare-num" id="band-readout">hidden</div></div>';

    const decision = el("div", {
      className: "decision-hero",
      id: "decision-hero",
      attrs: { "aria-live": "polite" },
    });
    decision.innerHTML =
      '<p class="decision-rule">Isla’s rule: accept if confidence score is at least ' +
      THRESHOLD +
      "</p>" +
      '<p class="decision-verdict" id="decision-verdict">—</p>' +
      '<p class="decision-explain" id="decision-explain"></p>';

    const scoreLine = el("div", {
      className: "score-line",
      id: "score-line",
      attrs: {
        role: "img",
        "aria-label": "Confidence score 82 with optional uncertainty range",
      },
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

    const stageKey = el("details", { className: "stage-key" });
    stageKey.innerHTML =
      "<summary>On this figure <span class=\"stage-key-more\">· more detail</span></summary>" +
      "<ul>" +
      "<li><strong>82</strong> = the helper’s confidence score for this rewrite (0–100)</li>" +
      "<li><strong>75</strong> = Isla’s cutoff — accept only if that score is at least 75</li>" +
      "<li>Drag right = a range around 82 · near <strong>±8</strong> the bottom of the range drops below 75 and her decision flips</li>" +
      "</ul>";
    if (typeof matchMedia === "function") {
      const wide = matchMedia("(min-width: 900px)");
      const syncKey = () => {
        stageKey.open = wide.matches;
      };
      syncKey();
      if (wide.addEventListener) wide.addEventListener("change", syncKey);
    }

    const control = el("div", { className: "control" });
    const ends = el("div", { className: "ends" });
    ends.innerHTML = "<span>Score alone (±0)</span><span>Wide range (±18)</span>";
    const slider = el("input", {
      type: "range",
      min: "0",
      max: "18",
      value: "0",
      step: "1",
      attrs: {
        "aria-label":
          "Width of a range around confidence score 82; decision flips near plus or minus 8",
      },
    });
    const prompt = el("p", {
      className: "drag-prompt",
      text: "Drag right to show a range around 82. Watch for the flip near ±8.",
    });
    const live = el("p", { className: "live", attrs: { "aria-live": "polite" } });
    control.append(ends, slider, prompt, live);

    // Compare + decision + band first (claim already covers the lone score story)
    vizPane.append(compare, decision, scoreLine, labels, stageKey, control);

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

    // Score-alone vs range revealed; decision flips when low end < 75
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
        document.getElementById("band-readout").textContent = "hidden";
        compare.classList.remove("warn");
        document.getElementById("decision-verdict").textContent =
          "Looks like accept — only 82 is showing";
        document.getElementById("decision-verdict").dataset.state = "accept";
        document.getElementById("decision-explain").textContent =
          "With no range yet, Isla’s 75 rule looks satisfied. Drag right before you treat 82 as enough.";
        live.textContent =
          "Score alone (±0): confidence score 82, no range.";
        if (outcomeP) {
          outcomeP.innerHTML =
            "Only <strong>82</strong> is showing, so 75 looks cleared. Drag right — the decision can flip near <strong>±8</strong>.";
        }
        return;
      }

      band.style.display = "block";
      band.style.left = pct(lo) + "%";
      band.style.width = pct(hi) - pct(lo) + "%";
      document.getElementById("band-readout").textContent = lo + "–" + hi;

      const verdictEl = document.getElementById("decision-verdict");
      const explainEl = document.getElementById("decision-explain");

      if (flips) {
        compare.classList.add("warn");
        verdictEl.textContent = "Decision flips — do not treat 82 as enough";
        verdictEl.dataset.state = "flip";
        explainEl.textContent =
          "The bottom of the range (" +
          lo +
          ") is below Isla’s cutoff of " +
          THRESHOLD +
          ". The helper still shows 82, but an honest range would change whether she accepts the rewrite.";
        live.textContent =
          "±" +
          half +
          " → range " +
          lo +
          "–" +
          hi +
          ": bottom crosses 75. Same centre, different decision.";
      } else {
        compare.classList.remove("warn");
        verdictEl.textContent = "Accept still OK — bottom still clears 75";
        verdictEl.dataset.state = "accept";
        explainEl.textContent =
          "Bottom of the range is " +
          lo +
          ". Still clears 75 — but 82 alone never showed that.";
        live.textContent =
          "±" + half + " → range " + lo + "–" + hi + ": bottom still clears 75 (flip starts at ±8).";
      }

      if (outcomeP) {
        if (flips) {
          outcomeP.innerHTML =
            "Range <strong>" +
            lo +
            "–" +
            hi +
            "</strong>: bottom below 75, so Isla’s rule flips while the helper still shows <strong>82</strong>.";
        } else {
          outcomeP.innerHTML =
            "Range <strong>" +
            lo +
            "–" +
            hi +
            "</strong>: bottom still clears 75. Keep widening toward <strong>±8</strong>.";
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
        '<p class="step-label">Step 1 — The claim</p>' +
        "<h2>What the confidence score claims</h2>";
      const claim = el("div", { className: "claim" });
      claim.innerHTML = claimHtml;
      step1.append(claim);
      step1.append(
        el("p", {
          className: "after-claim",
          text:
            "Two ideas. The helper’s best single summary is confidence score 82. " +
            "And that is exact enough for Isla to accept under a 75 cutoff. " +
            "The first can be reasonable while the second is not.",
        })
      );
      step1.append(
        el("p", {
          text:
            "Confidence score means how sure the helper claims to be about that rewrite (0–100). " +
            "A lone number with no range can look more exact than it really is — " +
            "especially when a cutoff such as 75 turns that digit into a yes/no decision.",
        })
      );
      flow.append(step1);

      const step2 = el("section", { className: "guided-step" });
      step2.innerHTML =
        '<p class="step-label">Step 2 — Score and range</p>' +
        "<h2>Score, range, and the 75 cutoff</h2>" +
        "<ol>" +
        "<li><strong>Confidence score 82</strong> — how sure the helper claims to be about this rewrite (0–100), shown with no range at first.</li>" +
        "<li><strong>Drag right</strong> — widen a range around 82, up to ±18.</li>" +
        "<li><strong>75 cutoff</strong> — Isla accepts the rewrite only if that confidence score is at least 75.</li>" +
        "<li><strong>Decision flip at ±8</strong> — bottom of the range becomes 74; accept becomes unsafe even though the helper still shows 82.</li>" +
        "</ol>";
      flow.append(step2);

      const step3 = el("section", { className: "guided-step" });
      step3.innerHTML =
        '<p class="step-label">Step 3 — Widen the range</p>' +
        "<h2>Reveal the range and watch the decision</h2>" +
        "<p>Start with 82 alone, then drag right. The score stays at 82 while the range widens. " +
        "At ±8 the bottom of the range crosses 75 — Isla’s rule flips even though 82 has not changed.</p>";
      step3.append(vizPane, outcomeSummary);
      flow.append(step3);

      const step4 = el("section", { className: "guided-step" });
      step4.innerHTML =
        '<p class="step-label">Step 4 — Decide</p>' +
        "<h2>Back to the confidence score</h2>" +
        "<p>82 alone invited the reading that we know exactly where we stand — exact enough to accept under 75.</p>";
      step4.append(takeaway.el);
      flow.append(step4);

      further = el("section", { className: "further-block" });
      further.innerHTML =
        "<h2>Going further — one score vs a range</h2>" + furtherGuided;
      flow.append(further);
      flow.append(nextModule("#home", "Back to Contents"));
      root.append(flow);
    } else {
      // Graph-first: left copy + right stage (outcome on Graph-first too)
      const claim = el("div", { className: "claim" });
      claim.innerHTML = claimHtml;

      const orient = el("p", {
        className: "after-claim",
        text:
          "Drag to show a range around 82. See when Isla would still accept the rewrite under her 75 rule.",
      });

      further = el("details", { className: "further" });
      further.innerHTML =
        "<summary>Going further — one score vs a range</summary>" +
        furtherShortWithSources;
      const nextEl = nextModule("#home", "Back to Contents");

      // “What just changed” on the stage — deferred until first interact
      vizPane.append(outcomeSummary);

      const copyAbove = el("div", {
        className: "module-copy module-copy--above",
      });
      copyAbove.append(kicker, title, claim, orient);

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

      takeaway.el._flowAlsoHide = [further, nextEl];
      takeaway.el._flowWithInteract = [outcomeSummary];
    }

    // Graph-first only: control inactive until Widen the range (orient gate)
    let orientGate = null;
    let interacted = false;
    if (!guided && global.CS4098.ui && global.CS4098.ui.applyOrientGate) {
      orientGate = global.CS4098.ui.applyOrientGate({
        controls: [slider],
        mountNear: control,
        stage: vizPane,
        buttonLabel: "Widen the range",
        hint: "After you’ve read the claim at the top of the page, widen the range.",
      });
      if (global.CS4098.ui.deferTakeawayUntilInteract) {
        takeawayFlow = global.CS4098.ui.deferTakeawayUntilInteract(takeaway.el, {
          hint: "When you have checked the 75 cutoff, choose trust, question, or reject.",
          alsoHide: takeaway.el._flowAlsoHide || [],
          revealWithInteract: takeaway.el._flowWithInteract || [],
        });
      }
    }

    // First interact reveals the deferred Your call (Graph-first order)
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
    title: "A confidence score that hides a range",
    mount: mount,
  };
})(window);
