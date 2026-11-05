/**
 * Author: Omar Raza
 * Student ID: 230013491
 * Description: Module 2 — accuracy vs base rate (Claire / “99% accurate”
 * headline). Natural-frequency tree out of 1,000 people; hero PPV readout.
 * Supports Graph-first (A) and More guidance (B) layouts from the report.
 */

(function (global) {
  "use strict";

  // ---------------------------------------------------------------------------
  // Counts: fixed population, rarity + accuracy → tree leaves and PPV
  // ---------------------------------------------------------------------------

  const POP = 1000;

  function ui() {
    return global.CS4098.ui;
  }

  // prevalencePer = “1 in N”; accuracyPct ≈ sensitivity / clear-negative rate
  function compute(prevalencePer, accuracyPct) {
    const have = Math.max(1, Math.round(POP / prevalencePer));
    const none = POP - have;
    const rate = accuracyPct / 100;
    const tp = Math.round(have * rate);
    const fn = have - tp;
    const tn = Math.round(none * rate);
    const fp = none - tn;
    const pos = tp + fp;
    const ppv = pos === 0 ? 0 : (100 * tp) / pos;
    return { have: have, none: none, tp: tp, fn: fn, tn: tn, fp: fp, pos: pos, ppv: ppv };
  }

  // ---------------------------------------------------------------------------
  // Mount: build Graph-first or More guidance page, then wire the tree
  // ---------------------------------------------------------------------------

  function mount(root, opts) {
    const helpers = ui();
    const el = helpers.el;
    const buildTakeaway = helpers.buildTakeaway;
    const nextModule = helpers.nextModule;

    const variant = (opts && opts.variant) || "a";
    const guided = variant === "b";
    root.innerHTML = "";

    const kicker = el("p", { className: "chapter-kicker", text: "Module 2 of 3" });
    const title = el("h1", { text: "When a high accuracy still misleads" });

    // Claim text shared by both layouts (Claire / “99% accurate” headline)
    const claimHtml =
      '<span class="label">Example — Claire</span>' +
      "<p>Claire reads a news story: an AI tool “detects illness with <strong>99% accuracy</strong>.” " +
      "The headline invites this reading: if <em>her</em> result were positive, she should treat it as almost certainly true — " +
      "without saying how rare the illness is among people like her.</p>";

    // ----- Takeaway + trust / question / reject -----
    const takeaway = buildTakeaway({
      verdictHtml:
        "<strong>A high accuracy percentage is not, by itself, a reason to trust a positive claim without asking about the base rate.</strong> " +
        "“99% accurate” and “99% chance you have it” are different questions. When the condition is rare, false alarms can outnumber true positives — " +
        "so <strong>question</strong> the leap from the headline to “almost certainly yes,” " +
        "and <strong>reject</strong> any claim that the accuracy percentage alone answers Claire’s personal risk.",
      judgement: {
        trust: {
          tone: "miscalibrated",
          title: "Trust — too strong for the headline alone",
          body:
            "If Claire trusts “almost certainly yes” because the tool is 99% accurate, she is treating one kind of accuracy as if it answered a different question. " +
            "On the tree, with rarity 1 in 200 and 99% accuracy, many positive tests can still be false alarms. " +
            "Question the headline until the base rate — and the counts — are in view.",
        },
        question: {
          tone: "calibrated",
          title: "Question — the calibrated response",
          body:
            "This matches what the counts show. “How often is the test right when the condition is present?” is not the same as “If I tested positive, how likely is the condition?” " +
            "Ask how rare the condition is, and how many false alarms that creates among the people who do not have it.",
        },
        reject: {
          tone: "calibrated",
          title: "Reject — right for the overclaim",
          body:
            "Reject the implication that accuracy alone settles a positive result. " +
            "That does not mean rejecting every screening tool; it means rejecting that wording as enough proof when rarity is not stated.",
        },
      },
    });

    // Short “Going further” (Graph-first, collapsed by default)
    const furtherShort =
      "<h3>Two different probabilities</h3>" +
      "<p><span class=\"math\">Sensitivity</span> asks: if the condition is present, how often is the test positive? Headlines often call something like this “accuracy.”</p>" +
      "<p><span class=\"math\">Positive predictive value (PPV)</span> asks: if the test is positive, how often is the condition present?</p>" +
      '<p class="formula">PPV = true positives ÷ (true positives + false positives)</p>' +
      "<h3>Why rarity and accuracy both matter</h3>" +
      "<p>When almost nobody has the condition, even a small false-alarm rate among the many healthy people creates many false positives. Those can outnumber the true ones — so PPV falls even if “accuracy” stays high. " +
      "Lowering the accuracy slider increases misses and false alarms in this short model, which also moves PPV. Try both controls; they are different levers on the same tree.</p>" +
      "<h3>Natural frequencies (why a tree out of 1,000)</h3>" +
      "<p>Gigerenzer, Hoffrage and colleagues show that many probability problems become easier when information is written as counts in a fixed reference class (for example out of 1,000 people) rather than as bare percentages. " +
      "The tree follows that format so false alarms stay visible.</p>" +
      "<h3>Bayes’ rule (same counts)</h3>" +
      '<p class="formula">P(C | +) = P(+ | C) P(C) / P(+)</p>' +
      "<p>The frequency tree computes that quantity by counting. This module sets the “clear negative” rate equal to the accuracy slider for a short story; real tests can differ on sensitivity vs specificity.</p>" +
      "<h3>Why the defaults are 99% and 1 in 200</h3>" +
      "<p>99% matches Claire’s headline wording. 1 in 200 is a rare-condition setting chosen so that, at high accuracy, false alarms can already outnumber true positives — the classic base-rate point in count form.</p>";

    // Longer chapter notes (More guidance, shown in full)
    const furtherGuided =
      "<p>Optional detail for keen readers. The short path above is enough for a calibrated takeaway; these notes name the quantities properly.</p>" +
      furtherShort +
      "<h3>Back to Claire</h3>" +
      "<p>A news percentage answers a performance question about the test. Claire’s worry is a predictive question about a positive result. " +
      "Without the base rate, the second question is underspecified. That is why the leap should be questioned — and accuracy-alone wording rejected as proof (Hoffrage et al.; Gigerenzer &amp; Edwards).</p>";

    // ----- Interactive stage (sliders, tree, PPV hero) -----
    const vizPane = el("div", {
      className: "viz-pane" + (guided ? " viz-pane--compact" : ""),
    });
    if (helpers.attachStageExpand) helpers.attachStageExpand(vizPane);
    const prevField = field(el, "How rare is the condition?", "prev", 20, 500, 200, 10);
    const accField = field(el, "How often is the test right?", "acc", 70, 99, 99, 1);

    const readHint = el("div", { className: "read-tree" });
    readHint.innerHTML =
      "<strong>How to read the tree</strong>" +
      "<ol>" +
      "<li>Start at the top: 1,000 people screened.</li>" +
      "<li>Split by who actually has the condition (rarity).</li>" +
      "<li>Then split by test result. Positives = true positives + false alarms.</li>" +
      "<li>The big percentage below is: true positives ÷ all positives.</li>" +
      "</ol>";

    const tree = el("div", { className: "tree", attrs: { "aria-live": "polite" } });

    const ppvHero = el("div", { className: "ppv-hero" });
    ppvHero.innerHTML =
      '<p class="ppv-question">If someone tests positive, what’s the chance they actually have the condition?</p>' +
      '<p class="ppv-big" id="ppv-big">—</p>' +
      '<p class="ppv-explain" id="ppv-explain"></p>';

    const live = el("p", { className: "live", attrs: { "aria-live": "polite" } });
    const outcomeSummary = el("div", {
      className: "outcome-summary",
      attrs: { "aria-live": "polite" },
    });
    outcomeSummary.innerHTML =
      '<span class="outcome-label">What the counts are saying</span><p></p>';
    const outcomeP = outcomeSummary.querySelector("p");

    const paramNote = el("p", { className: "param-note" });
    paramNote.innerHTML =
      "<strong>Why these controls.</strong> " +
      "Defaults match the headline: <strong>99%</strong> accuracy and rarity <strong>1 in 200</strong>. " +
      "Use <em>both</em> sliders: make the condition rarer with accuracy still high, then also lower accuracy — the large percentage should move in both cases. " +
      "Counts are out of 1,000 people (natural frequencies).";

    vizPane.append(paramNote, prevField.wrap, accField.wrap, readHint, tree, ppvHero, live);

    // ----- Tree rendering + live count / PPV updates -----

    // Paint the frequency tree from current counts
    function renderTree(c) {
      tree.innerHTML =
        '<div class="tree-row root">Out of ' +
        POP +
        " people screened</div>" +
        '<div class="tree-indent">' +
        '<div class="tree-row have"><span class="tag">Have it</span> ' +
        c.have +
        " people</div>" +
        '<div class="tree-indent">' +
        '<div class="tree-row pos"><span class="tag">True +</span> ' +
        c.tp +
        " true positives</div>" +
        '<div class="tree-row neg"><span class="tag">Missed</span> ' +
        c.fn +
        " missed</div></div>" +
        '<div class="tree-row none"><span class="tag">Do not</span> ' +
        c.none +
        " people</div>" +
        '<div class="tree-indent">' +
        '<div class="tree-row pos"><span class="tag">False +</span> ' +
        c.fp +
        " false alarms</div>" +
        '<div class="tree-row neg"><span class="tag">Clear −</span> ' +
        c.tn +
        " clear negatives</div></div></div>";
    }

    // Recompute counts, refresh tree / PPV / live and outcome copy
    function update() {
      const prev = Number(prevField.input.value);
      const acc = Number(accField.input.value);
      prevField.val.textContent = "1 in " + prev;
      accField.val.textContent = acc + "%";
      const c = compute(prev, acc);
      renderTree(c);
      const ppv = c.ppv.toFixed(1);
      document.getElementById("ppv-big").textContent = ppv + "%";
      document.getElementById("ppv-explain").textContent =
        "Of " +
        c.pos +
        " positive tests, " +
        c.tp +
        " are true and " +
        c.fp +
        " are false alarms. " +
        c.tp +
        " ÷ " +
        c.pos +
        " = " +
        ppv +
        "%.";
      live.textContent =
        "Headline accuracy " +
        acc +
        "% with rarity 1 in " +
        prev +
        ": false alarms (" +
        c.fp +
        ") vs true positives (" +
        c.tp +
        ").";
      if (outcomeP) {
        const levers =
          " You can move <strong>rarity</strong>, <strong>accuracy</strong>, or both — each changes the counts and the large percentage.";
        if (c.ppv < 40) {
          outcomeP.innerHTML =
            "With rarity <strong>1 in " +
            prev +
            "</strong> and accuracy <strong>" +
            acc +
            "%</strong>, only about <strong>" +
            ppv +
            "%</strong> of positive tests are true. " +
            "False alarms (<strong>" +
            c.fp +
            "</strong>) outnumber or rival true positives (<strong>" +
            c.tp +
            "</strong>). " +
            "So Claire’s headline percentage is <em>not</em> the chance a positive result means she has the condition. " +
            "That chance is the big figure above — true positives divided by all positives." +
            levers;
        } else if (c.ppv < 70) {
          outcomeP.innerHTML =
            "About <strong>" +
            ppv +
            "%</strong> of positive tests are true. Better than a coin flip, but far from “almost certainly.” " +
            "Try a rarer condition (higher “1 in …”) with accuracy still high, and try lowering accuracy — watch how false alarms and true positives shift." +
            levers;
        } else {
          outcomeP.innerHTML =
            "About <strong>" +
            ppv +
            "%</strong> of positive tests are true. Notice that accuracy (<strong>" +
            acc +
            "%</strong>) and that chance (<strong>" +
            ppv +
            "%</strong>) are already not the same number. " +
            "Make the condition rarer while keeping accuracy near 99%, then also drag accuracy down — both should change the large percentage." +
            levers;
        }
      }
    }

    // Temporary listeners so the tree paints before layout; swapped for
    // onInteract after the orient gate is wired (see below)
    prevField.input.addEventListener("input", update);
    accField.input.addEventListener("input", update);

    // ----- Page layout: More guidance (B) or Graph-first (A) -----
    let further = null;

    if (guided) {
      // Variant B: vertical workbook — instruct → try → notice → conclude
      root.append(kicker, title);
      const flow = el("div", { className: "guided-flow" });

      const step1 = el("section", { className: "guided-step" });
      step1.innerHTML =
        '<p class="step-label">Step 1 — Read the claim</p>' +
        "<h2>What the headline claims</h2>";
      const claim = el("div", { className: "claim" });
      claim.innerHTML = claimHtml;
      step1.append(claim);
      step1.append(
        el("p", {
          text:
            "Separate two questions. When someone has the illness, how often does the tool flag them? " +
            "When the tool flags someone, how often do they actually have the illness? " +
            "“99% accurate” is aimed at the first. Claire’s personal worry is the second. Everyday headlines often blur them.",
        })
      );
      step1.append(
        el("p", {
          text:
            "Percentages and nested conditionals are easy to misread. " +
            "Counts out of 1,000 people keep a fixed reference class in view, so false alarms stay visible. " +
            "That is why this page uses a frequency tree rather than a bare percentage.",
        })
      );
      flow.append(step1);

      const step2 = el("section", { className: "guided-step" });
      step2.innerHTML =
        '<p class="step-label">Step 2 — How to use the display</p>' +
        "<h2>Controls, tree, and the big percentage</h2>" +
        "<ol>" +
        "<li><strong>Rarity</strong> sets how many of the 1,000 have the condition (the base rate).</li>" +
        "<li><strong>Accuracy</strong> here means: among those who have it, how often the test is positive — and, in this short module, a matching clear-negative rate among those who do not.</li>" +
        "<li><strong>The tree</strong> splits the 1,000 by condition, then by test result. Read top to bottom.</li>" +
        "<li><strong>The large percentage</strong> is the chance a positive is true (true positives ÷ all positives) — Claire’s question if she tested positive.</li>" +
        "</ol>" +
        "<p>Start from the defaults (99%, 1 in 200). First make the condition rarer while accuracy stays high. " +
        "Then change the accuracy slider too: the large percentage should move when either control changes.</p>";
      flow.append(step2);

      const step3 = el("section", { className: "guided-step" });
      step3.innerHTML =
        '<p class="step-label">Step 3 — Try the controls</p>' +
        "<h2>Follow the counts, then read the summary</h2>" +
        "<p>Change one slider at a time. After each change, read the tree and the short summary under it.</p>";
      step3.append(vizPane, outcomeSummary);
      flow.append(step3);

      const step4 = el("section", { className: "guided-step" });
      step4.innerHTML =
        '<p class="step-label">Step 4 — Decide</p>' +
        "<h2>From the tree back to the headline</h2>" +
        "<p>“99% accurate” does not automatically mean “almost certainly yes” for a positive result when the condition is rare. " +
        "Choose trust, question, or reject for Claire’s headline leap.</p>";
      step4.append(takeaway.el);
      flow.append(step4);

      further = el("section", { className: "further-block" });
      further.innerHTML =
        "<h2>Going further — sensitivity, PPV, and Bayes</h2>" + furtherGuided;
      flow.append(further);
      flow.append(nextModule("#uncertainty", "Module 3 — A single score that hides a range"));
      root.append(flow);
    } else {
      // Variant A: Seeing Theory — left copy column + right stage (both scale)
      const claim = el("div", { className: "claim" });
      claim.innerHTML = claimHtml;

      const orient = el("p", {
        className: "lede",
        text:
          "Read Claire’s claim first. Then try the chart: use both sliders. Make the condition rarer with accuracy still high, then also change accuracy — watch the large percentage (chance a positive is true), not the headline.",
      });

      const proseAbove = el("div", { className: "prose" });
      proseAbove.append(
        el("p", {
          text:
            "Natural frequencies (counts out of 1,000) make false alarms visible — the format Gigerenzer and Hoffrage recommend over bare percentages. That is why the tree is the main display.",
        })
      );

      further = el("details", { className: "further" });
      further.innerHTML =
        "<summary>Going further — the mathematical idea</summary>" + furtherShort;
      const nextEl = nextModule(
        "#uncertainty",
        "Module 3 — A single score that hides a range"
      );

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

    // Graph-first only: controls inactive until Try the chart (Design orient gate)
    let orientGate = null;
    let takeawayFlow = null;
    let interacted = false;
    if (!guided && global.CS4098.ui && global.CS4098.ui.applyOrientGate) {
      orientGate = global.CS4098.ui.applyOrientGate({
        controls: [prevField.input, accField.input],
        mountNear: prevField.wrap,
        stage: vizPane,
        buttonLabel: "Try the chart",
        hint: "Read the claim on the left first. The tree is a preview until you press Try the chart.",
      });
      if (global.CS4098.ui.deferTakeawayUntilInteract) {
        takeawayFlow = global.CS4098.ui.deferTakeawayUntilInteract(takeaway.el, {
          hint: "After you try the chart, you’ll decide trust, question, or reject here.",
          alsoHide: takeaway.el._flowAlsoHide || [],
        });
      }
    }

    // First interact reveals the deferred takeaway (Graph-first Design order)
    function onInteract() {
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
    }

    // Replace the early update listeners with the interact-aware handlers
    prevField.input.removeEventListener("input", update);
    accField.input.removeEventListener("input", update);
    prevField.input.addEventListener("input", onInteract);
    accField.input.addEventListener("input", onInteract);

    update();

    return {
      reset: function () {
        prevField.input.value = "200";
        accField.input.value = "99";
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
  // Local helper: labelled range slider used by rarity and accuracy
  // ---------------------------------------------------------------------------

  function field(elFn, label, id, min, max, value, step) {
    const wrap = elFn("div", { className: "field" });
    const lab = document.createElement("label");
    lab.htmlFor = id;

    const name = document.createElement("span");
    name.textContent = label;
    const val = document.createElement("strong");
    lab.append(name, val);

    const input = elFn("input", {
      id: id,
      type: "range",
      min: String(min),
      max: String(max),
      value: String(value),
      step: String(step),
    });
    wrap.append(lab, input);
    return { wrap: wrap, input: input, val: val };
  }

  // ---------------------------------------------------------------------------
  // Register with the app shell (hash route #baserate)
  // ---------------------------------------------------------------------------

  global.CS4098 = global.CS4098 || {};
  global.CS4098.modules = global.CS4098.modules || {};
  global.CS4098.modules.baserate = {
    id: "baserate",
    title: "When a high accuracy still misleads",
    mount: mount,
  };
})(window);
