/**
 * Author: Omar Raza
 * Student ID: 230013491
 * Description: Module 1 — overfitting / generalisation (Isla grade-predictor
 * example). Slider mixes a simple trend with a zigzag through past points;
 * fit % on past vs new swings in opposite directions. Supports Graph-first
 * (Variant A) and More guidance (Variant B) layouts from the report.
 */

(function (global) {
  "use strict";

  // ---------------------------------------------------------------------------
  // Data: simple trend, bumpy “past” points, smooth “new” points between them
  // ---------------------------------------------------------------------------

  // Gentle upward trend used as the “simple” pattern (and where new points sit)
  const trueFn = function (x) {
    return 0.18 + 0.64 * x;
  };

  // Past / training-like points — large zigzag so chasing them leaves the trend
  const oldPts = [
    { x: 0.1, y: 0.72 },
    { x: 0.28, y: 0.12 },
    { x: 0.46, y: 0.78 },
    { x: 0.64, y: 0.16 },
    { x: 0.82, y: 0.84 },
  ];

  // New / next-assessment points — on the smooth trend BETWEEN the blues
  const newPts = [
    { x: 0.19, y: trueFn(0.19) },
    { x: 0.37, y: trueFn(0.37) },
    { x: 0.55, y: trueFn(0.55) },
    { x: 0.73, y: trueFn(0.73) },
    { x: 0.91, y: trueFn(0.91) },
  ];

  // Smooth path that passes through consecutive blue points
  function interpolateOld(x) {
    const pts = oldPts;
    if (x <= pts[0].x) return pts[0].y;
    if (x >= pts[pts.length - 1].x) return pts[pts.length - 1].y;

    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i];
      const b = pts[i + 1];
      if (x >= a.x && x <= b.x) {
        const u = (x - a.x) / (b.x - a.x);
        const s = u * u * (3 - 2 * u);
        return a.y + s * (b.y - a.y);
      }
    }

    return pts[pts.length - 1].y;
  }

  // Ease so mid–high slider values already look badly overfit
  function blend(w) {
    const t = w / 8;
    return t * t * (3 - 2 * t);
  }

  // Mix simple trend with the path through blue points (slider controls mix)
  function curveY(x, w) {
    const t = blend(w);
    return (1 - t) * trueFn(x) + t * interpolateOld(x);
  }

  // Mean absolute vertical miss from points to the current curve
  function mae(pts, w) {
    let sum = 0;
    for (let i = 0; i < pts.length; i++) {
      sum += Math.abs(pts[i].y - curveY(pts[i].x, w));
    }
    return sum / pts.length;
  }

  // Map MAE → fit % (higher = closer); maeBad is “worst” miss for that set
  function fitPct(maeVal, maeBad) {
    return Math.max(0, Math.min(100, Math.round(100 * (1 - maeVal / maeBad))));
  }

  const MAE_BAD_OLD = mae(oldPts, 0) * 1.05;
  const MAE_BAD_NEW = mae(newPts, 8) * 1.05;

  // ---------------------------------------------------------------------------
  // Mount: build Graph-first or More guidance page, then wire the canvas
  // ---------------------------------------------------------------------------

  function mount(root, opts) {
    const variant = (opts && opts.variant) || "a";
    const guided = variant === "b";
    root.innerHTML = "";

    root.append(el("p", { className: "chapter-kicker", text: "Module 1 of 3" }));
    root.append(el("h1", { text: "Looking perfect on old data" }));

    // Claim text shared by both layouts (Isla / grade predictor)
    const claimHtml =
      '<span class="label">Baseline example (Isla)</span>' +
      "<p>A department grade predictor was fitted to last year’s coursework marks. " +
      "On <strong>those past students</strong> it looked perfect. It now shows Isla a predicted mark of 62 for her <strong>next</strong> assessment and calls the estimate “accurate on past results.”</p>";

    // Short “Going further” (Graph-first, collapsed by default)
    const furtherBodyShort =
      "<h3>Training set and test set</h3>" +
      "<p>The blue points stand in for a <span class=\"math\">training set</span> (past students used to fit the tool). The red points stand in for a <span class=\"math\">test set</span> (new assessments). Good performance on training alone does not establish generalisation.</p>" +
      "<h3>Generalisation and overfitting</h3>" +
      "<p><span class=\"math\">Generalisation</span> means useful predictions on unseen cases. <span class=\"math\">Overfitting</span> means matching training points — including their quirks — so closely that new points are missed. Low training error with high test error is the warning sign.</p>" +
      "<h3>Why the meters swing opposite ways</h3>" +
      "<p>Each meter is a rescaled mean absolute error (average vertical miss):</p>" +
      '<p class="formula">MAE = (1/n) Σ |yᵢ − ŷ(xᵢ)|</p>' +
      "<p>As the solid curve is forced through every blue zigzag, MAE on blue falls (fit % rises) while MAE on red rises (fit % falls). The reds sit on the smooth trend between the blues — exactly where an overfit curve overshoots.</p>" +
      "<h3>What this module is not</h3>" +
      "<p>Not a neural-network playground. One control, two colours, and an opposite-swing readout are enough for the claim Isla meets.</p>";

    // Longer chapter notes (More guidance, shown in full)
    const furtherBodyGuided =
      "<h3>Training set and test set</h3>" +
      "<p>In machine learning and predictive modelling, the examples used to build a model are often called the <span class=\"math\">training set</span>. " +
      "A separate collection held back to check performance is a <span class=\"math\">test set</span> (sometimes people also use a validation set while tuning). " +
      "In Isla’s story, last year’s coursework marks play the role of training data: they are what the department tool was fitted to. " +
      "Her next assessment is like a test case — something the fitting procedure has not been allowed to “see” and chase.</p>" +
      "<p>A common mistake — and the one this page is built around — is to report accuracy only on the training set and then talk as if that number applied automatically to new cases. " +
      "Textbooks stress the split precisely so that “how well did we do on the data we used?” is not confused with “how well will we do next?”</p>" +
      "<h3>Generalisation and overfitting</h3>" +
      "<p>The usual aim of fitting is <span class=\"math\">generalisation</span>: useful predictions on data the model has not seen. " +
      "<span class=\"math\">Overfitting</span> is what happens when a model (or a curve) matches the training points very closely — including quirks and noise — and then performs worse on new points. " +
      "Domingos describes checking only the training examples as an “illusion of success”: the fit can look excellent while the real goal (doing well on new cases) has not been checked.</p>" +
      "<p>On the figure, overfitting looks like this: the solid line threads every blue zigzag, so past fit rises toward 100%, while the red points — which still follow the simpler dashed pattern — are left behind, so new fit falls. " +
      "That opposite swing is not a bug in the demo; it is the definition made visible.</p>" +
      "<h3>A simple measure of miss</h3>" +
      "<p>One standard way to summarise how far points sit from a curve is mean absolute error — the average vertical distance:</p>" +
      '<p class="formula">MAE = (1/n) Σ |yᵢ − ŷ(xᵢ)|</p>' +
      "<p>The fit percentages on this page are a rescaled version of that idea (higher % means smaller average miss). " +
      "You do not need to compute MAE by hand; the point is that “looking perfect on blue” and “staying near red” are two different scores, and a past-only claim only reports the first.</p>" +
      "<h3>Back to Isla’s 62</h3>" +
      "<p>If the department only says the predictor was accurate on past results, it has answered a training-set question. " +
      "Whether 62 is trustworthy for the next assessment is a generalisation question. " +
      "Without evidence on new cases, the calibrated responses are to <strong>question</strong> the estimate and to <strong>reject</strong> the leap from past perfection to future certainty — not to treat the interface wording as sufficient proof.</p>" +
      "<h3>What this page deliberately leaves out</h3>" +
      "<p>A full course would introduce regularisation, cross-validation, and model complexity more formally. " +
      "This guided version keeps one control and one picture so the claim-literacy point stays clear: " +
      "perfect on the data you fitted is not, by itself, a reason to trust a new prediction.</p>";

    // ----- Takeaway + trust / question / reject -----
    const take = el("div", { className: "takeaway" });
    take.innerHTML =
      "<h2>Takeaway</h2>" +
      '<p class="verdict"><strong>Do not trust 62 on the strength of “accurate on past results” alone.</strong> ' +
      "When the fit looks perfect on past students (blue) it can still fail on new assessments (red). " +
      "That is the contract behind the claim: past performance was never shown to transfer. " +
      "The calibrated move is to <strong>question</strong> the estimate until you know how the tool did on held-out / new cases — " +
      "and to <strong>reject</strong> any suggestion that a perfect past fit is proof for Isla’s next mark.</p>" +
      "<p class=\"note\">What would <em>you</em> do with the department’s claim? Pick one — each choice gets a clear response.</p>";
    const choices = el("div", {
      className: "choices",
      attrs: { role: "group", "aria-label": "Your judgement" },
    });
    const feedback = el("div", {
      className: "choice-feedback",
      attrs: { "aria-live": "polite", hidden: "true" },
    });
    const judgement = {
      trust: {
        tone: "miscalibrated",
        title: "Trust — usually too strong here",
        body:
          "If Isla trusts 62 because the tool looked perfect on last year’s students, she is relying on the wrong evidence. " +
          "Drag the slider to the right: fit on past (blue) can hit ~100% while fit on new (red) collapses. " +
          "Trust would be more warranted only if the department also showed good performance on new assessments — not past-only accuracy. " +
          "<strong>Calibrated alternative:</strong> question the 62 until that check exists.",
      },
      question: {
        tone: "calibrated",
        title: "Question — the calibrated response",
        body:
          "This matches what the figure shows. “Accurate on past results” answers a different question from “will this work for Isla’s next assessment?” " +
          "Questioning means asking: was performance checked on new cases? How large was the miss there? " +
          "Until those answers arrive, treat 62 as a past-fitted number, not a settled forecast. " +
          "<strong>One sentence Isla can use:</strong> “It looked perfect on the students it was fitted to — that is not enough for me to trust the next mark.”",
      },
      reject: {
        tone: "calibrated",
        title: "Reject — right for the overclaim",
        body:
          "Reject the leap from “perfect on past students” to “trust 62 for the next assessment.” " +
          "You are not rejecting every use of the tool; you are rejecting that wording as sufficient proof. " +
          "The graph makes the failure mode visible: a line can hit every blue point and still miss the reds. " +
          "<strong>One sentence Isla can use:</strong> “A perfect look on past data is not proof for new cases — I reject that claim as stated.”",
      },
    };
    [
      ["trust", "I would trust it"],
      ["question", "I would question it"],
      ["reject", "I would reject it"],
    ].forEach(([k, label]) => {
      const b = el("button", {
        className: "choice",
        type: "button",
        text: label,
        attrs: { "data-kind": k, "aria-pressed": "false" },
      });
      b.addEventListener("click", () => {
        choices.querySelectorAll(".choice").forEach((c) =>
          c.setAttribute("aria-pressed", "false")
        );
        b.setAttribute("aria-pressed", "true");
        const j = judgement[k];
        feedback.hidden = false;
        feedback.dataset.tone = j.tone;
        feedback.innerHTML =
          '<p class="feedback-kicker">' +
          (j.tone === "calibrated" ? "Calibrated judgement" : "Miscalibrated for this claim") +
          "</p>" +
          "<h3>" +
          j.title +
          "</h3>" +
          "<p>" +
          j.body +
          "</p>";
      });
      choices.append(b);
    });
    take.append(choices, feedback);

    // ----- Interactive stage (canvas, meters, slider) -----
    const vizPane = el("div", {
      className: "viz-pane" + (guided ? " viz-pane--compact" : ""),
    });
    const canvas = el("canvas");
    canvas.width = 680;
    canvas.height = guided ? 300 : 400;
    canvas.setAttribute(
      "aria-label",
      "Past marks versus new assessments with a fitted curve"
    );

    const compare = el("div", { className: "compare-strip" });
    compare.innerHTML =
      '<div class="compare-card past"><div class="compare-label">Fit on past (blue)</div><div class="compare-num" id="fit-past">—</div></div>' +
      '<div class="compare-card next"><div class="compare-label">Fit on new (red)</div><div class="compare-num" id="fit-new">—</div></div>';

    const legend = el("p", { className: "legend" });
    legend.innerHTML =
      '<span><i class="swatch" style="background:#4da3ff"></i>Past (fitted)</span>' +
      '<span><i class="swatch square" style="background:#ff6b5a"></i>New</span>' +
      "<span>Dashed = simple · Solid = current</span>";
    const axis = el("div", { className: "axis-caption" });
    axis.innerHTML =
      "<span>Past coursework →</span><span>→ Next assessment</span>";

    const meters = el("div", { className: "meters" });
    const mOld = meter("How well it matches past marks", false);
    const mNew = meter("How well it matches new assessments", true);
    meters.append(mOld.el, mNew.el);

    const control = el("div", { className: "control" });
    const ends = el("div", { className: "ends" });
    ends.innerHTML =
      "<span>Simple pattern</span><span>Hit every past mark</span>";
    const slider = el("input", {
      type: "range",
      min: "0",
      max: "8",
      value: "0",
      step: "1",
      attrs: {
        "aria-label": "How closely the curve follows past marks",
      },
    });
    const prompt = el("p", {
      className: "drag-prompt",
      text: "Try dragging all the way to the right.",
    });
    const live = el("p", { className: "live", attrs: { "aria-live": "polite" } });
    control.append(ends, slider, prompt, live);
    vizPane.append(compare, canvas, legend, axis, meters, control);

    const outcomeSummary = el("div", {
      className: "outcome-summary",
      attrs: { "aria-live": "polite" },
    });
    outcomeSummary.innerHTML =
      '<span class="outcome-label">What just changed (read this)</span>' +
      "<p></p>";
    const outcomeP = outcomeSummary.querySelector("p");

    // ----- Page layout: More guidance (B) or Graph-first (A) -----
    let further = null;

    if (guided) {
      // Variant B: vertical workbook — instruct → try → notice → conclude
      const flow = el("div", { className: "guided-flow" });

      const step1 = el("section", { className: "guided-step" });
      step1.innerHTML =
        '<p class="step-label">Step 1 — Read the claim</p>' +
        "<h2>What Isla is being asked to believe</h2>";
      const claim = el("div", { className: "claim" });
      claim.innerHTML = claimHtml;
      step1.append(claim);
      step1.append(
        el("p", {
          text:
            "Start by separating two questions that everyday wording often glues together. " +
            "Question A: how well did the grade predictor match the past students it was fitted to? " +
            "Question B: how much should Isla trust the number 62 for an assessment that has not happened yet? " +
            "The department’s phrase “accurate on past results” answers A. The interface invites her to treat it as an answer to B.",
        })
      );
      step1.append(
        el("p", {
          text:
            "Prediction tools are almost always built from examples someone already has — last year’s marks, last month’s clicks, last week’s lab readings. " +
            "That is normal and often necessary. The difficulty is what happens next. New cases can follow the same broad pattern and still refuse to match every bump in the old data. " +
            "If you only inspect the old examples, a flexible fit can look flawless while missing the next ones.",
        })
      );
      step1.append(
        el("p", {
          text:
            "Writers on machine learning call that trap an “illusion of success”: excellence on the data used for fitting is not automatically excellence on new data. " +
            "Before you touch the slider, hold onto Isla’s decision. She is not being asked to admire a graph. She is being asked whether a past-only accuracy story is enough reason to trust a future mark.",
        })
      );
      flow.append(step1);

      const step2 = el("section", { className: "guided-step" });
      step2.innerHTML =
        '<p class="step-label">Step 2 — How to use the display</p>' +
        "<h2>What each part means</h2>" +
        "<p>This page uses a small picture to stand in for the grade tool. It is deliberately simpler than a real predictor, so the idea stays visible. Read the key once, then follow the steps in order.</p>" +
        "<ol>" +
        "<li><strong>Blue points — past students.</strong> These are the marks the tool was fitted to. In textbook language they behave like a <em>training set</em>: the fitting procedure is allowed to chase them.</li>" +
        "<li><strong>Red points — new assessments.</strong> These stand for cases the fit has not been tuned to, including something like Isla’s next assessment. They behave like a <em>test set</em>.</li>" +
        "<li><strong>Dashed line — simple pattern.</strong> A smooth trend the new points still follow. Think of it as “the broad story” rather than every quirk in last year’s marks.</li>" +
        "<li><strong>Solid line — current fit.</strong> This is what the slider controls. On the left it stays near the dashed pattern. On the right it bends until it hits every blue point.</li>" +
        "<li><strong>Two fit percentages.</strong> One score for how close the solid line is to the blues; one for how close it is to the reds. They are the lesson: they can move in opposite directions.</li>" +
        "</ol>" +
        "<p><strong>What you should do:</strong> leave the slider on the left and note both percentages. Then move it gradually to the right until the solid line threads every blue point. " +
        "After each move, stop and read the written summary under the figure. In this “more guidance” layout that paragraph is meant to carry the explanation the way a textbook caption would — not as a one-line status tip.</p>" +
        "<p><strong>What to look for:</strong> as past fit rises, new fit should fall. If both stayed high together, Isla’s past-only claim would look safer. The interesting case — and the common failure mode — is when past look perfect while new cases are left behind.</p>";
      flow.append(step2);

      const stepTry = el("section", { className: "guided-step" });
      stepTry.innerHTML =
        '<p class="step-label">Step 3 — Try the control</p>' +
        "<h2>Change the fit and watch both colours</h2>" +
        "<p>Use the slider below. Treat it like a worked example in a statistics chapter: change one thing, then read what the change means in words before you move on.</p>";
      stepTry.append(vizPane, outcomeSummary);
      flow.append(stepTry);

      const step3 = el("section", { className: "guided-step" });
      step3.innerHTML =
        '<p class="step-label">Step 4 — Decide what Isla should do</p>' +
        "<h2>From the picture back to the claim</h2>" +
        "<p>You have now seen that a line can look excellent on past students and weak on new assessments at the same time. " +
        "Return to the department wording. “Accurate on past results” can be literally true about the blues and still be a poor reason to trust 62 for the next assessment. " +
        "Calibrated trust here means matching your confidence to what was actually evidenced — past fit — not to what the interface implied.</p>" +
        "<p>Read the takeaway, then choose trust, question, or reject. Each choice gives feedback so you can check whether your judgement matches the figure.</p>";
      step3.append(take);
      flow.append(step3);

      further = el("section", { className: "further-block" });
      further.innerHTML =
        "<h2>Chapter notes — the mathematical idea in more detail</h2>" +
        "<p>The short interactive path stops at the takeaway. This section is the textbook-style continuation: the same story with the usual vocabulary spelled out.</p>" +
        furtherBodyGuided;
      flow.append(further);
      if (global.CS4098.ui && global.CS4098.ui.nextModule) {
        flow.append(
          global.CS4098.ui.nextModule(
            "#baserate",
            "Module 2 — When a high accuracy still misleads"
          )
        );
      }

      root.append(flow);
    } else {
      // Variant A: Seeing Theory rhythm — teaching text left, dark stage right
      const claim = el("div", { className: "claim" });
      claim.innerHTML = claimHtml;
      root.append(claim);

      const orient = el("p", {
        className: "lede",
        text: "Drag the slider. Watch the two fit numbers move in opposite directions — then decide what Isla should do.",
      });
      root.append(orient);

      const lesson = el("div", { className: "lesson" });
      const prose = el("div", { className: "prose" });
      prose.append(
        el("p", {
          text:
            "Blue circles are past students the tool was fitted to. Red squares are new assessments. A line that hits every past mark can still miss what comes next — Domingos’s “illusion of success.”",
        })
      );
      prose.append(take);

      further = el("details", { className: "further" });
      further.innerHTML =
        "<summary>Going further — the mathematical idea</summary>" +
        furtherBodyShort;
      prose.append(further);

      if (global.CS4098.ui && global.CS4098.ui.nextModule) {
        prose.append(
          global.CS4098.ui.nextModule(
            "#baserate",
            "Module 2 — When a high accuracy still misleads"
          )
        );
      }

      lesson.append(prose, vizPane);
      root.append(lesson);
    }

    // ----- Canvas drawing + live updates -----
    const fitPastEl = compare.querySelector("#fit-past");
    const fitNewEl = compare.querySelector("#fit-new");
    const ctx = canvas.getContext("2d");
    const pad = { l: 40, r: 16, t: 20, b: 34 };

    // Map data coords (0–1) onto canvas pixels
    function xy(x, y) {
      return {
        cx: pad.l + x * (canvas.width - pad.l - pad.r),
        cy: pad.t + (1 - y) * (canvas.height - pad.t - pad.b),
      };
    }

    // Redraw curve, residuals, and points for the current slider value
    function draw(w) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#1a2026";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = "#3a4550";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(pad.l, pad.t);
      ctx.lineTo(pad.l, canvas.height - pad.b);
      ctx.lineTo(canvas.width - pad.r, canvas.height - pad.b);
      ctx.stroke();

      // Dashed simple pattern (always visible reference)
      ctx.setLineDash([5, 5]);
      ctx.strokeStyle = "#8a9aaa";
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i <= 120; i++) {
        const x = i / 120;
        const p = xy(x, trueFn(x));
        if (i === 0) ctx.moveTo(p.cx, p.cy);
        else ctx.lineTo(p.cx, p.cy);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      function residuals(pts, col) {
        for (const p of pts) {
          const miss = Math.abs(p.y - curveY(p.x, w));
          if (miss < 0.02) continue;
          const a = xy(p.x, p.y);
          const b = xy(p.x, curveY(p.x, w));
          ctx.strokeStyle = col;
          ctx.globalAlpha = 0.4 + Math.min(0.5, miss * 1.1);
          ctx.lineWidth = 1.5 + miss * 8;
          ctx.beginPath();
          ctx.moveTo(a.cx, a.cy);
          ctx.lineTo(b.cx, b.cy);
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
        ctx.lineWidth = 1;
      }
      residuals(oldPts, "#4da3ff");
      residuals(newPts, "#ff6b5a");

      // Solid fitted curve
      ctx.strokeStyle = "#f2f5f7";
      ctx.lineWidth = 2.75;
      ctx.beginPath();
      for (let i = 0; i <= 140; i++) {
        const x = i / 140;
        const p = xy(x, curveY(x, w));
        if (i === 0) ctx.moveTo(p.cx, p.cy);
        else ctx.lineTo(p.cx, p.cy);
      }
      ctx.stroke();

      function dots(pts, fill, square) {
        for (const p of pts) {
          const q = xy(p.x, p.y);
          if (square) {
            ctx.fillStyle = fill;
            ctx.fillRect(q.cx - 6, q.cy - 6, 12, 12);
          } else {
            ctx.beginPath();
            ctx.fillStyle = fill;
            ctx.arc(q.cx, q.cy, 7, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
      dots(oldPts, "#4da3ff", false);
      dots(newPts, "#ff6b5a", true);
    }

    // Redraw + update meters, big numbers, and status / outcome text
    function update() {
      const w = Number(slider.value);
      const cOld = fitPct(mae(oldPts, w), MAE_BAD_OLD);
      const cNew = fitPct(mae(newPts, w), MAE_BAD_NEW);
      draw(w);
      mOld.fill.style.width = cOld + "%";
      mNew.fill.style.width = cNew + "%";
      mOld.val.textContent = cOld + "%";
      mNew.val.textContent = cNew + "%";
      fitPastEl.textContent = cOld + "%";
      fitNewEl.textContent = cNew + "%";
      compare.classList.toggle("warn", cOld - cNew >= 35);

      if (w <= 1) {
        live.textContent =
          "Simple pattern: stays with the new assessments (" +
          cNew +
          "% fit) even though it misses some past bumps (" +
          cOld +
          "%). This is closer to something you might trust for the next mark.";
        prompt.textContent = "Now drag all the way to the right.";
        if (outcomeP) {
          outcomeP.innerHTML =
            "Right now the solid line sits on the <strong>simple dashed pattern</strong>. " +
            "Fit on <strong>new</strong> assessments is about <strong>" +
            cNew +
            "%</strong>; fit on <strong>past</strong> students is only about <strong>" +
            cOld +
            "%</strong>, because the blue points zigzag away from that smooth trend. " +
            "In words: the pattern that still tracks Isla-like new cases does <em>not</em> look perfect on last year’s marks. " +
            "That is uncomfortable for anyone who only celebrates past accuracy — and it is exactly why textbooks separate training performance from test performance. " +
            "<strong>Your next move:</strong> drag the slider slowly to the right. After each jump, check whether past fit rises while new fit falls.";
        }
      } else if (w >= 7) {
        live.textContent =
          "Hits every past mark (" +
          cOld +
          "% fit on blue) — but collapses on new assessments (" +
          cNew +
          "% fit on red). That is the illusion: perfect on the past students, weak on what comes next.";
        prompt.textContent = "Notice the two big numbers: one high, one low.";
        if (outcomeP) {
          outcomeP.innerHTML =
            "The solid line now threads <strong>every blue point</strong> (past fit about <strong>" +
            cOld +
            "%</strong>). Visually, that is what “accurate on past results” can mean: the fit was allowed to chase last year’s students until the misses vanished. " +
            "At the same moment, fit on the <strong>red</strong> points has dropped to about <strong>" +
            cNew +
            "%</strong>. Those new assessments still follow the dashed pattern; the wiggly solid line does not. " +
            "So both of the following can be true at once: (1) the tool looked excellent on the past students it was fitted to, and (2) that excellence is a weak reason to trust Isla’s <strong>62</strong> for the next assessment. " +
            "This is the illusion of success in one picture — and the reason a careful reader questions past-only claims. " +
            "<strong>When you are ready:</strong> go to Step 4 and choose trust, question, or reject.";
        }
      } else {
        live.textContent =
          "Past fit " +
          cOld +
          "% · new fit " +
          cNew +
          "%. Keep dragging right until the solid line threads every blue point.";
        prompt.textContent = "Keep going — the gap should get obvious.";
        if (outcomeP) {
          outcomeP.innerHTML =
            "You are part-way along the trade-off. Past fit is about <strong>" +
            cOld +
            "%</strong> and new fit about <strong>" +
            cNew +
            "%</strong>. " +
            "As the solid line bends toward the blue zigzags, it leaves the dashed pattern — and the red points that sit on that pattern. " +
            "Pause here and say the pattern out loud: improving the look on past students is starting to cost performance on new assessments. " +
            "In a textbook exercise you would keep adjusting until the contrast is unmistakable; do the same with the slider, then read Step 4.";
        }
      }
    }

    slider.addEventListener("input", update);
    update();

    return {
      reset() {
        slider.value = "0";
        choices.querySelectorAll(".choice").forEach((c) =>
          c.setAttribute("aria-pressed", "false")
        );
        feedback.hidden = true;
        feedback.innerHTML = "";
        feedback.removeAttribute("data-tone");
        if (further && further.tagName === "DETAILS") further.open = false;
        update();
      },
      destroy() {
        root.innerHTML = "";
      },
    };
  }

  // ---------------------------------------------------------------------------
  // Local helpers (prefer shared CS4098.ui.el when present)
  // ---------------------------------------------------------------------------

  function meter(label, red) {
    const wrap = el("div", { className: "meter" });
    wrap.append(el("span", { text: label }));

    const val = el("span", { className: "val", text: "—" });
    wrap.append(val);

    const track = el("div", { className: "track" });
    const fill = el("div", { className: "fill" + (red ? " red" : "") });
    track.append(fill);
    wrap.append(track);

    return { el: wrap, fill: fill, val: val };
  }

  function el(tag, opts) {
    if (global.CS4098 && global.CS4098.ui && global.CS4098.ui.el) {
      return global.CS4098.ui.el(tag, opts);
    }

    const n = document.createElement(tag);
    if (!opts) return n;
    if (opts.className) n.className = opts.className;
    if (opts.type) n.type = opts.type;
    if (opts.min != null) n.min = opts.min;
    if (opts.max != null) n.max = opts.max;
    if (opts.value != null) n.value = opts.value;
    if (opts.step != null) n.step = opts.step;
    if (opts.text != null) n.textContent = opts.text;
    if (opts.attrs) {
      Object.keys(opts.attrs).forEach(function (k) {
        n.setAttribute(k, opts.attrs[k]);
      });
    }
    return n;
  }

  global.CS4098 = global.CS4098 || {};
  global.CS4098.modules = global.CS4098.modules || {};
  global.CS4098.modules.fit = {
    id: "fit",
    title: "Looking perfect on old data",
    mount: mount,
  };
})(window);
