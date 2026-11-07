/**
 * Author: Omar Raza
 * Student ID: 230013491
 * Description: Module 1 — Looking perfect on old data (Isla / grade predictor).
 * Slider mixes a simple trend with a zigzag through past marks; match % on
 * past (blue) vs new (red) can swing opposite ways. Graph-first and More
 * guidance layouts.
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

    const kicker = el("p", { className: "chapter-kicker", text: "Module 1 of 3" });
    const title = el("h1", { text: "Looking perfect on old data" });

    // Claim card shared by both layouts (Isla / grade predictor)
    const claimHtml =
      '<span class="label">The claim</span>' +
      '<span class="claim-who">Isla · department grade predictor</span>' +
      "<p>A department tool was built from last year’s coursework marks. " +
      "On <strong>those past students</strong> it looked perfect. It now shows Isla a predicted mark of <strong>62</strong> for her <strong>next</strong> assessment and calls the estimate “accurate on past results.”</p>";

    // Short “Going further” (Graph-first, collapsed by default)
    const furtherBodyShort =
      "<h3>Past data and new data</h3>" +
      "<p>The blue points stand in for a <span class=\"math\">training set</span> — the past students used to build the tool. " +
      "The red points stand in for a <span class=\"math\">test set</span> — new assessments the tool did not practise on. " +
      "Looking good on past data alone does not mean it will work on new cases.</p>" +
      "<h3>Doing well next time vs chasing every old mark</h3>" +
      "<p><span class=\"math\">Generalisation</span> means useful predictions on cases you have not seen yet. " +
      "<span class=\"math\">Overfitting</span> means matching the old points — including their quirks — so closely that new points are missed. " +
      "Domingos calls checking only the old examples an “illusion of success”: the fit can look excellent while nobody checked what happens next.</p>" +
      "<h3>Why the two % swing opposite ways</h3>" +
      "<p>Each match % is based on average vertical miss (how far points sit from the line):</p>" +
      '<p class="formula" data-tex="\\mathrm{MAE}=\\dfrac{1}{n}\\sum_{i}\\lvert y_i-\\hat{y}(x_i)\\rvert">MAE = (1/n) Σ |yᵢ − ŷ(xᵢ)|</p>' +
      "<p>As the solid curve is forced through every blue zigzag, miss on blue falls (past % rises) while miss on red rises (new % falls). " +
      "The reds sit on the smooth trend between the blues — exactly where a line that chased every old bump overshoots.</p>" +
      "<h3>Why this slider</h3>" +
      "<p>Left = a simple pattern that still fits the new (red) points. Right = chase every past (blue) mark. " +
      "Dragging right makes the trade-off visible in one move.</p>" +
      "<h3>Sources</h3>" +
      "<p>Looking perfect only on past data as an “illusion of success”: Domingos (2012), <em>A Few Useful Things to Know about Machine Learning</em>. " +
      "More on the home page under <a href=\"#sources\">Sources</a>.</p>";

    // Longer chapter notes (More guidance, shown in full)
    const furtherBodyGuided =
      "<h3>Past data and new data</h3>" +
      "<p>People who build prediction tools often call the examples used to build the tool a <span class=\"math\">training set</span>. " +
      "A separate collection held back to check how well it works is a <span class=\"math\">test set</span>. " +
      "In Isla’s story, last year’s coursework marks are the past data the department tool was built from. " +
      "Her next assessment is like a new case — something that building process has not been allowed to “see” and chase.</p>" +
      "<p>A common mistake — and the one Isla’s department wording invites — is to report how well the tool did on the old data and then talk as if that applied automatically to new cases. " +
      "The split exists so that “how well did we do on the data we used?” is not confused with “how well will we do next?”</p>" +
      "<h3>Doing well next time vs chasing every old mark</h3>" +
      "<p>The usual aim is <span class=\"math\">generalisation</span>: useful predictions on data the tool has not seen. " +
      "<span class=\"math\">Overfitting</span> is what happens when a line matches the old points very closely — including quirks and noise — and then does worse on new points. " +
      "Domingos describes checking only the old examples as an “illusion of success”: the fit can look excellent while the real goal (doing well on new cases) has not been checked.</p>" +
      "<p>On the chart, that looks like this: the solid line threads every blue zigzag, so past match rises toward 100%, while the red points — which still follow the simpler dashed pattern — are left behind, so new match falls. " +
      "That opposite swing is the whole point of the picture.</p>" +
      "<h3>A simple measure of miss</h3>" +
      "<p>One standard way to summarise how far points sit from a curve is mean absolute error — the average vertical distance:</p>" +
      '<p class="formula" data-tex="\\mathrm{MAE}=\\dfrac{1}{n}\\sum_{i}\\lvert y_i-\\hat{y}(x_i)\\rvert">MAE = (1/n) Σ |yᵢ − ŷ(xᵢ)|</p>' +
      "<p>The match percentages here turn that idea into “higher % = smaller average miss.” " +
      "“Looking perfect on blue” and “staying near red” are two different scores, and a past-only claim only reports the first.</p>" +
      "<h3>Back to Isla’s 62</h3>" +
      "<p>If the department only says the predictor was accurate on past results, it has answered an old-data question. " +
      "Whether 62 is trustworthy for the next assessment is a new-data question. " +
      "Without evidence on new cases, the better moves are to <strong>question</strong> the estimate and to <strong>reject</strong> the leap from past perfection to future certainty — not to treat the department’s wording as enough proof.</p>" +
      "<h3>Sources</h3>" +
      "<p>Looking perfect only on past data as an “illusion of success”: Domingos (2012), <em>A Few Useful Things to Know about Machine Learning</em>. " +
      "More on the home page under <a href=\"#sources\">Sources</a>.</p>";

    // ----- Your call first; Takeaway after a choice -----
    let takeawayFlow = null;
    const takeaway = global.CS4098.ui.buildTakeaway({
      restateHtml:
        "The tool looked perfect on last year’s students, so Isla can treat <strong>62</strong> as accurate for her next assessment.",
      prompt: "Would you trust, question, or reject that claim?",
      verdictHtml:
        "<strong>Looking perfect on past students is not enough reason to trust the same prediction for new cases.</strong> " +
        "When the line looks perfect on past marks (blue) it can still miss new assessments (red). " +
        "So the department’s “accurate on past results” wording should be <strong>questioned</strong> rather than trusted on its own — " +
        "and the leap from past perfection to certainty about Isla’s 62 should be <strong>rejected</strong>.",
      judgement: {
        trust: {
          tone: "miscalibrated",
          title: "Trust — usually too strong here",
          body:
            "If Isla trusts 62 because the tool looked perfect on last year’s students, she is using the wrong check. " +
            "On the chart, match on past (blue) can look excellent while match on new (red) collapses. " +
            "Trust would make more sense only if the department also showed good results on new assessments. " +
            "Until that check exists, the better move is to question the 62.",
        },
        question: {
          tone: "calibrated",
          title: "Question — the right call here",
          body:
            "That matches what the chart shows. “Accurate on past results” answers a different question from “will this work for Isla’s next assessment?” " +
            "Ask whether anyone checked new cases, and how far off the line was there. " +
            "Until those answers arrive, treat 62 as a number from last year’s marks — not a settled forecast.",
        },
        reject: {
          tone: "calibrated",
          title: "Reject — right for what the wording overpromises",
          body:
            "Reject the leap from “perfect on past students” to “trust 62 for the next assessment.” " +
            "That does not mean rejecting every use of the tool; it means rejecting that wording as enough proof. " +
            "A line can hit every blue point and still miss the reds.",
        },
      },
      onJudged: function () {
        if (takeawayFlow && takeawayFlow.revealAfterJudgement) {
          takeawayFlow.revealAfterJudgement();
        }
      },
    });
    const take = takeaway.el;

    // ----- Interactive stage (canvas, meters, slider) -----
    const vizPane = el("div", {
      className: "viz-pane" + (guided ? " viz-pane--compact" : ""),
    });
    if (global.CS4098.ui && global.CS4098.ui.attachStageExpand) {
      global.CS4098.ui.attachStageExpand(vizPane);
    }
    const canvas = el("canvas");
    canvas.width = 680;
    canvas.height = guided ? 280 : 300;
    canvas.setAttribute(
      "aria-label",
      "Past marks versus new assessments with a curve through the past points"
    );

    // Match bitmap size to the stage width; keep height modest so compare % +
    // chart + meters + slider stay in view together (esp. on mobile).
    function sizeCanvas() {
      const avail = Math.max(
        320,
        Math.floor((vizPane.clientWidth || canvas.clientWidth || 680) - 4)
      );
      const h = guided
        ? Math.max(240, Math.min(Math.round(avail * 0.38), Math.round(window.innerHeight * 0.34)))
        : Math.max(260, Math.round(avail * 0.38));
      if (canvas.width !== avail || canvas.height !== h) {
        canvas.width = avail;
        canvas.height = h;
      }
    }

    const compare = el("div", { className: "compare-strip" });
    compare.innerHTML =
      '<div class="compare-card past"><div class="compare-label">Match on past (blue)</div><div class="compare-num" id="fit-past">—</div></div>' +
      '<div class="compare-card next"><div class="compare-label">Match on new (red)</div><div class="compare-num" id="fit-new">—</div></div>';

    const legend = el("p", { className: "legend" });
    legend.innerHTML =
      '<span><i class="swatch" style="background:#4da3ff"></i>Past students</span>' +
      '<span><i class="swatch square" style="background:#ff6b5a"></i>New assessments</span>' +
      "<span>Dashed = simple pattern · Solid = what you set</span>";

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
      text: "Drag all the way to the right.",
    });
    const live = el("p", { className: "live", attrs: { "aria-live": "polite" } });

    // How-to-read on the stage; compact + collapsible on narrow viewports
    const stageKey = el("details", { className: "stage-key" });
    stageKey.innerHTML =
      "<summary>On this chart <span class=\"stage-key-more\">· more detail</span></summary>" +
      "<ul>" +
      "<li><strong>Blue</strong> = past students · <strong>Red</strong> = new assessments</li>" +
      "<li><strong>Left</strong> = simple pattern · <strong>Right</strong> = hit every past mark</li>" +
      "<li>The two % often move opposite ways</li>" +
      "</ul>";
    if (typeof matchMedia === "function") {
      const wide = matchMedia("(min-width: 900px)");
      const syncKey = () => {
        stageKey.open = wide.matches;
      };
      syncKey();
      if (wide.addEventListener) wide.addEventListener("change", syncKey);
    }

    control.append(ends, slider, prompt, live);
    // Numbers + chart first on mobile fold; key sits with the figure (opens by default on desktop)
    // No x-axis “past → next” caption: colour (blue/red) carries that; the slider ends
    // are a different dimension (simple pattern ↔ hit every past mark).
    vizPane.append(compare, canvas, legend, stageKey, meters, control);

    const outcomeSummary = el("div", {
      className: "outcome-summary",
      attrs: { "aria-live": "polite" },
    });
    outcomeSummary.innerHTML =
      '<span class="outcome-label">What just changed</span>' +
      "<p></p>";
    const outcomeP = outcomeSummary.querySelector("p");

    // ----- Page layout: More guidance (B) or Graph-first (A) -----
    let further = null;

    if (guided) {
      // More guidance: vertical workbook — claim → try → notice → decide
      root.append(kicker, title);
      const flow = el("div", { className: "guided-flow" });

      const step1 = el("section", { className: "guided-step" });
      step1.innerHTML =
        '<p class="step-label">Step 1 — The claim</p>' +
        "<h2>What Isla is being shown</h2>";
      const claim = el("div", { className: "claim" });
      claim.innerHTML = claimHtml;
      step1.append(claim);
      step1.append(
        el("p", {
          className: "after-claim",
          text:
            "Two questions sit under one claim. How well did the tool match the past students it was built from? " +
            "And how much should Isla trust 62 for an assessment that has not happened yet? " +
            "“Accurate on past results” answers the first. The wording invites her to treat it as the second.",
        })
      );
      step1.append(
        el("p", {
          text:
            "Prediction tools are usually built from examples someone already has. That is normal. " +
            "The difficulty is what happens next: new cases can follow the same broad pattern and still miss every bump in the old data. " +
            "If you only check the old examples, a flexible line can look flawless while missing the next ones.",
        })
      );
      flow.append(step1);

      const step2 = el("section", { className: "guided-step" });
      step2.innerHTML =
        '<p class="step-label">Step 2 — The chart</p>' +
        "<h2>What each part means</h2>" +
        "<p>One picture for Isla’s grade tool — past students and new assessments side by side.</p>" +
        "<ol>" +
        "<li><strong>Blue points — past students.</strong> Marks the tool was built from.</li>" +
        "<li><strong>Red points — new assessments.</strong> Cases not used to build the tool, including something like Isla’s next mark.</li>" +
        "<li><strong>Dashed line — simple pattern.</strong> The broad trend the new points still follow.</li>" +
        "<li><strong>Solid line — what you set.</strong> Left stays near the dashed pattern; right threads every blue point.</li>" +
        "<li><strong>Two match percentages.</strong> How close the solid line is to blues vs reds — they can swing opposite ways.</li>" +
        "</ol>";
      flow.append(step2);

      const stepTry = el("section", { className: "guided-step" });
      stepTry.innerHTML =
        '<p class="step-label">Step 3 — Try the chart</p>' +
        "<h2>Change the line and watch both colours</h2>" +
        "<p>Start on the left, then drag right until the solid line hits every blue point. " +
        "Watch whether the past % rises while the new % falls — looking perfect on old marks in one move.</p>";
      stepTry.append(vizPane, outcomeSummary);
      flow.append(stepTry);

      const step3 = el("section", { className: "guided-step" });
      step3.innerHTML =
        '<p class="step-label">Step 4 — Decide</p>' +
        "<h2>Back to Isla’s 62</h2>" +
        "<p>A line can look excellent on past students and weak on new assessments at the same time. " +
        "“Accurate on past results” can be true about the blues and still be a poor reason to trust 62 for the next assessment.</p>";
      step3.append(take);
      flow.append(step3);

      further = el("section", { className: "further-block" });
      further.innerHTML =
        "<h2>Going further — why past success can mislead</h2>" +
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
      // Graph-first: left copy column + right stage (both scale)
      const claim = el("div", { className: "claim" });
      claim.innerHTML = claimHtml;

      const orient = el("p", {
        className: "after-claim",
        text: "Move the slider. Watch how well the line matches past students (blue) and new assessments (red).",
      });

      further = el("details", { className: "further" });
      further.innerHTML =
        "<summary>Going further — why past success can mislead</summary>" +
        furtherBodyShort;

      let nextEl = null;
      if (global.CS4098.ui && global.CS4098.ui.nextModule) {
        nextEl = global.CS4098.ui.nextModule(
          "#baserate",
          "Module 2 — When a high accuracy still misleads"
        );
      }

      // “What just changed” on the stage — deferred until first interact
      vizPane.append(outcomeSummary);

      // Split copy so mobile order is claim → chart → Your call
      const copyAbove = el("div", {
        className: "module-copy module-copy--above",
      });
      copyAbove.append(kicker, title, claim, orient);

      const copyBelow = el("div", {
        className: "module-copy module-copy--below",
      });
      const proseBelow = el("div", { className: "prose" });
      proseBelow.append(take, further);
      if (nextEl) proseBelow.append(nextEl);
      copyBelow.append(proseBelow);

      const copyStack = el("div", { className: "module-copy-stack" });
      copyStack.append(copyAbove, copyBelow);

      const split = el("div", { className: "module-split" });
      split.append(copyStack, vizPane);
      root.append(split);

      take._flowAlsoHide = [further, nextEl];
      take._flowWithInteract = [outcomeSummary];
    }

    // Graph-first only: control inactive until Try the chart (orient gate)
    let orientGate = null;
    let interacted = false;
    if (!guided && global.CS4098.ui && global.CS4098.ui.applyOrientGate) {
      orientGate = global.CS4098.ui.applyOrientGate({
        controls: [slider],
        mountNear: control,
        stage: vizPane,
        buttonLabel: "Try the chart",
        hint: "After you’ve read the claim at the top of the page, try the chart.",
      });
      if (global.CS4098.ui.deferTakeawayUntilInteract) {
        takeawayFlow = global.CS4098.ui.deferTakeawayUntilInteract(take, {
          hint: "When you have seen what changes, choose trust, question, or reject.",
          alsoHide: take._flowAlsoHide || [],
          revealWithInteract: take._flowWithInteract || [],
        });
      }
    }

    // ----- Canvas drawing + live meter / outcome updates -----
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
        for (let i = 0; i < pts.length; i++) {
          const p = pts[i];
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

      // Solid curve for the current slider mix
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
        for (let i = 0; i < pts.length; i++) {
          const p = pts[i];
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
          "Simple pattern: still matches new assessments well (" +
          cNew +
          "%) even though it misses some past bumps (" +
          cOld +
          "%).";
        prompt.textContent = "Drag all the way to the right.";
        if (outcomeP) {
          outcomeP.innerHTML =
            "Simple pattern: new about <strong>" +
            cNew +
            "%</strong>, past about <strong>" +
            cOld +
            "%</strong>. Drag right — watch past rise while new falls.";
        }
      } else if (w >= 7) {
        live.textContent =
          "Hits every past mark (" +
          cOld +
          "% on blue) — but collapses on new assessments (" +
          cNew +
          "% on red). Perfect on past students, weak on what comes next.";
        prompt.textContent = "Notice the two big numbers: one high, one low.";
        if (outcomeP) {
          outcomeP.innerHTML =
            "Past <strong>" +
            cOld +
            "%</strong> vs new <strong>" +
            cNew +
            "%</strong>. Perfect on last year is still a weak reason to trust Isla’s <strong>62</strong> — choose trust, question, or reject.";
        }
      } else {
        live.textContent =
          "Past match " +
          cOld +
          "% · new match " +
          cNew +
          "%. Keep dragging right until the solid line threads every blue point.";
        prompt.textContent = "Keep going — the gap should get obvious.";
        if (outcomeP) {
          outcomeP.innerHTML =
            "Past <strong>" +
            cOld +
            "%</strong> · new <strong>" +
            cNew +
            "%</strong>. Keep dragging until past is high and new drops.";
        }
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

    // Keep canvas bitmap matched to the stage width (More guidance full column)
    function onStageResize() {
      sizeCanvas();
      update();
    }
    window.addEventListener("resize", onStageResize);
    let stageRo = null;
    if (typeof ResizeObserver !== "undefined") {
      stageRo = new ResizeObserver(onStageResize);
      stageRo.observe(vizPane);
    }
    sizeCanvas();
    update();

    return {
      reset: function () {
        slider.value = "0";
        interacted = false;
        takeaway.reset();
        if (further && further.tagName === "DETAILS") further.open = false;
        if (orientGate) orientGate.lock();
        if (takeawayFlow) takeawayFlow.reset();
        sizeCanvas();
        update();
      },
      destroy: function () {
        window.removeEventListener("resize", onStageResize);
        if (stageRo) stageRo.disconnect();
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

  // ---------------------------------------------------------------------------
  // Register with the app shell (hash route #fit)
  // ---------------------------------------------------------------------------

  global.CS4098 = global.CS4098 || {};
  global.CS4098.modules = global.CS4098.modules || {};
  global.CS4098.modules.fit = {
    id: "fit",
    title: "Looking perfect on old data",
    mount: mount,
  };
})(window);
