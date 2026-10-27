/**
 * Author: Omar Raza
 * Student ID: 230013491
 * Description: Module 3 — uncertainty / overprecision (Isla or Harris /
 * lone “confidence 82” badge). Point estimate stays fixed; slider widens a
 * plausible band. Supports Graph-first (A) and More guidance (B) layouts.
 */

(function (global) {
  "use strict";

  // ---------------------------------------------------------------------------
  // Fixed reported score; band half-width comes from the slider
  // ---------------------------------------------------------------------------

  const POINT = 82;

  function ui() {
    return global.CS4098.ui;
  }

  // ---------------------------------------------------------------------------
  // Mount: build Graph-first or More guidance page, then wire the band
  // ---------------------------------------------------------------------------

  function mount(root, opts) {
    const helpers = ui();
    const el = helpers.el;
    const buildTakeaway = helpers.buildTakeaway;
    const nextModule = helpers.nextModule;

    const variant = (opts && opts.variant) || "a";
    const guided = variant === "b";
    root.innerHTML = "";

    root.append(el("p", { className: "chapter-kicker", text: "Module 3 of 3" }));
    root.append(el("h1", { text: "A single score that hides a range" }));

    // Claim text shared by both layouts (lone confidence badge)
    const claimHtml =
      '<span class="label">Baseline example (Isla or Harris)</span>' +
      "<p>An AI writing helper highlights a draft sentence and shows one badge: " +
      "<strong>confidence 82</strong>. No range. No “could be lower.” " +
      "The interface invites the reading: we know exactly where we stand.</p>";

    // ----- Takeaway + trust / question / reject -----
    const takeaway = buildTakeaway({
      verdictHtml:
        "<strong>Do not treat 82 alone as exact knowledge.</strong> " +
        "A point estimate without a range can create overprecision — more confidence than the evidence supports. " +
        "The calibrated move is to <strong>question</strong> a lone score until a plausible band is shown, " +
        "and to <strong>reject</strong> the claim “we know exactly where we stand” when the band would change the decision.",
      judgement: {
        trust: {
          tone: "miscalibrated",
          title: "Trust — too strong for a lone badge",
          body:
            "Trusting 82 as exact because the UI looks precise is how unwarranted trust forms: presentation persuades without showing uncertainty. " +
            "Widen the band on the figure: the same centre can sit inside a range that would change what you do. " +
            "<strong>Calibrated alternative:</strong> question 82 until a range is reported.",
        },
        question: {
          tone: "calibrated",
          title: "Question — the calibrated response",
          body:
            "Ask how wide a plausible range is, and whether the low end would change your decision. " +
            "<strong>One sentence to use:</strong> “82 without a range isn’t enough — how wide could this still be?”",
        },
        reject: {
          tone: "calibrated",
          title: "Reject — right for the overclaim",
          body:
            "Reject “we know exactly where we stand” when only a point is shown and uncertainty is material. " +
            "You are not rejecting every score; you are rejecting that completeness claim. " +
            "<strong>One sentence to use:</strong> “A single confidence badge is not exact knowledge — I reject that reading.”",
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
      "<p>If a decision would change at the low end of the band, the single number was not enough.</p>";

    // Longer chapter notes (More guidance, shown in full)
    const furtherGuided =
      "<p>These notes spell out the vocabulary behind the short interactive path.</p>" +
      furtherShort +
      "<h3>What an interval is trying to say</h3>" +
      "<p>In classical statistics, a confidence interval is defined through a long-run coverage procedure. " +
      "In everyday reading — and in Spiegelhalter-style communication — a displayed band is also a plain warning: " +
      "do not pretend the estimate is known more finely than this. This module uses that everyday reading on purpose.</p>" +
      "<h3>Contractual trust</h3>" +
      "<p>Jacovi and colleagues treat trust in AI as contractual: you trust a specific claim (for example “82 is exact enough to act on”), not “the system” in general. " +
      "If the interface never shows uncertainty, that contract can look stronger than the evidence — unwarranted trust from presentation.</p>" +
      "<h3>What this page leaves out</h3>" +
      "<p>It does not derive a formal 95% confidence interval from a sample. It teaches the claim-literacy habit: ask for the range before you trust the point.</p>";

    // ----- Interactive stage (point, band, width slider) -----
    const vizPane = el("div", {
      className: "viz-pane" + (guided ? " viz-pane--compact" : ""),
    });
    const scoreLine = el("div", {
      className: "score-line",
      attrs: { role: "img", "aria-label": "Score 82 with uncertainty band" },
    });
    const axis = el("div", { className: "score-axis" });
    const band = el("div", { className: "score-band" });
    const point = el("div", { className: "score-point" });
    const pointLabel = el("div", { className: "score-point-label", text: "82" });
    scoreLine.append(axis, band, point, pointLabel);

    const labels = el("div", { className: "score-labels" });
    labels.innerHTML = "<span>0</span><span>50</span><span>100</span>";

    const compare = el("div", { className: "compare-strip" });
    compare.innerHTML =
      '<div class="compare-card past"><div class="compare-label">Reported point</div><div class="compare-num">82</div></div>' +
      '<div class="compare-card next"><div class="compare-label">Plausible band</div><div class="compare-num" id="band-readout">—</div></div>';

    const control = el("div", { className: "control" });
    const ends = el("div", { className: "ends" });
    ends.innerHTML = "<span>Narrower band</span><span>Wider “could be”</span>";
    const slider = el("input", {
      type: "range",
      min: "1",
      max: "18",
      value: "4",
      step: "1",
      attrs: { "aria-label": "Width of uncertainty around the score" },
    });
    const prompt = el("p", {
      className: "drag-prompt",
      text: "Widen the band and watch whether 82 still feels “exact.”",
    });
    const live = el("p", { className: "live", attrs: { "aria-live": "polite" } });
    control.append(ends, slider, prompt, live);
    vizPane.append(compare, scoreLine, labels, control);

    const outcomeSummary = el("div", {
      className: "outcome-summary",
      attrs: { "aria-live": "polite" },
    });
    outcomeSummary.innerHTML =
      '<span class="outcome-label">What the band is saying</span><p></p>';
    const outcomeP = outcomeSummary.querySelector("p");

    // Map 0–100 score onto the horizontal track (% of the line)
    function pct(v) {
      return 6 + (v / 100) * 88;
    }

    // Place band + tick, refresh readout and outcome copy
    function update() {
      const half = Number(slider.value);
      const lo = Math.max(0, POINT - half);
      const hi = Math.min(100, POINT + half);

      band.style.left = pct(lo) + "%";
      band.style.width = pct(hi) - pct(lo) + "%";
      point.style.left = pct(POINT) + "%";
      pointLabel.style.left = pct(POINT) + "%";

      const bandEl = document.getElementById("band-readout");
      if (bandEl) bandEl.textContent = lo + "–" + hi;

      let gloss;
      if (half <= 3) {
        gloss =
          "Narrow band: 82 may still be usable as a centre if the method is sound — but it remains a range, not a certainty.";
      } else if (half <= 8) {
        gloss =
          "Moderate band: nearby values remain plausible. Acting as if 82 were exact skips that spread.";
      } else {
        gloss =
          "Wide band: the same situation is compatible with quite different scores. “We know exactly where we stand” overclaims.";
      }

      live.textContent =
        "Reported score " + POINT + "; plausible band about " + lo + "–" + hi + ". " + gloss;

      if (outcomeP) {
        outcomeP.innerHTML =
          "The dark tick is the <strong>point</strong> the helper showed (82). The shaded region is a <strong>plausible band</strong> you control: about <strong>" +
          lo +
          "–" +
          hi +
          "</strong>. " +
          gloss +
          " " +
          "Spiegelhalter-style communication keeps an honest place for uncertainty: say what you know, and how shaky it is. " +
          "If your decision would change near the low end of this band, the lone badge was not a complete story.";
      }
    }

    slider.addEventListener("input", update);

    // ----- Page layout: More guidance (B) or Graph-first (A) -----
    let further = null;

    if (guided) {
      // Variant B: vertical workbook — instruct → try → notice → conclude
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
            "Claim B: we know exactly where we stand. A can be reasonable while B is not. " +
            "Interfaces often present A in a way that feels like B — polish and a single digit doing the persuading.",
        })
      );
      step1.append(
        el("p", {
          text:
            "Trust research on automation and AI argues for appropriate (calibrated) trust: match confidence to capability. " +
            "Overtrust here looks like treating a point estimate as exact. Distrust would be ignoring a narrow, well-supported range. " +
            "This page targets the first failure — overprecision from a lone score.",
        })
      );
      flow.append(step1);

      const step2 = el("section", { className: "guided-step" });
      step2.innerHTML =
        '<p class="step-label">Step 2 — How to use the display</p>' +
        "<h2>Point, band, and the decision test</h2>" +
        "<ol>" +
        "<li><strong>Point (82)</strong> — the reported score; fixed on this page.</li>" +
        "<li><strong>Band</strong> — values still treated as plausible; you widen or narrow it.</li>" +
        "<li><strong>Decision test</strong> — ask whether the low end of the band would change what you do with the draft sentence.</li>" +
        "<li>If yes, a lone badge was incomplete. If the band is narrow and the method is trusted, acting on the centre can be more warranted.</li>" +
        "</ol>" +
        "<p>Move the slider slowly. After each move, read the written summary under the figure.</p>";
      flow.append(step2);

      const step3 = el("section", { className: "guided-step" });
      step3.innerHTML =
        '<p class="step-label">Step 3 — Try the control</p>' +
        "<h2>Widen uncertainty and watch the story change</h2>";
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
      // Variant A: Seeing Theory rhythm — teaching text left, dark stage right
      const claim = el("div", { className: "claim" });
      claim.innerHTML = claimHtml;
      root.append(claim);
      root.append(
        el("p", {
          className: "lede",
          text: "Widen the band around 82. If the low end would change your decision, a lone badge was not enough.",
        })
      );

      const lesson = el("div", { className: "lesson" });
      const prose = el("div", { className: "prose" });
      prose.append(
        el("p", {
          className: "lede",
          text:
            "The point stays put. Only honesty about uncertainty moves. If the low end would change your decision, 82 alone was not enough.",
        })
      );
      prose.append(
        el("p", {
          text:
            "A lone confidence badge can create overprecision — unwarranted trust in exactness. Ask for the range.",
        })
      );
      prose.append(takeaway.el);

      further = el("details", { className: "further" });
      further.innerHTML =
        "<summary>Going further — the mathematical idea</summary>" + furtherShort;
      prose.append(further);
      prose.append(nextModule("#home", "Back to Contents"));

      lesson.append(prose, vizPane);
      root.append(lesson);
    }

    update();

    return {
      reset: function () {
        slider.value = "4";
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
