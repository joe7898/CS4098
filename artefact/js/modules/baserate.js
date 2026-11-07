/**
 * Author: Omar Raza
 * Student ID: 230013491
 * Description: Module 2 — When a high accuracy still misleads (Claire /
 * “99% accurate” headline). Count tree out of 1,000 people; large % under
 * the counts answers “if positive, how likely?”. Graph-first and More
 * guidance layouts.
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

    // Claim card shared by both layouts (Claire / “99% accurate” headline)
    const claimHtml =
      '<span class="label">The claim</span>' +
      '<span class="claim-who">Claire · news headline</span>' +
      "<p>Claire reads a news story: an AI tool “detects illness with <strong>99% accuracy</strong>.” " +
      "The headline invites this reading: if <em>her</em> result were positive, she should treat it as almost certainly true — " +
      "without saying how rare the illness is among people like her.</p>";

    // ----- Your call first; Takeaway after a choice -----
    let takeawayFlow = null;
    const takeaway = buildTakeaway({
      restateHtml:
        "“99% accurate” means a positive result is almost certainly true — even without saying how rare the illness is.",
      prompt: "Would you trust, question, or reject that claim?",
      verdictHtml:
        "<strong>A high accuracy percentage is not, by itself, a reason to trust a positive result without asking how rare the illness is.</strong> " +
        "“99% accurate” and “99% chance you have it” are different questions. When the condition is rare, false alarms can outnumber true alarms — " +
        "so <strong>question</strong> the leap from the headline to “almost certainly yes,” " +
        "and <strong>reject</strong> any claim that the accuracy percentage alone answers Claire’s personal risk.",
      judgement: {
        trust: {
          tone: "miscalibrated",
          title: "Trust — too strong for the headline alone",
          body:
            "If Claire trusts “almost certainly yes” because the tool is 99% accurate, she is treating one kind of accuracy as if it answered a different question. " +
            "On the tree, with rarity 1 in 200 and 99% accuracy, many positive tests can still be false alarms. " +
            "Question the headline until you know how rare the illness is — and can see the counts.",
        },
        question: {
          tone: "calibrated",
          title: "Question — the right call here",
          body:
            "That matches what the counts show. “How often is the test right when someone has the illness?” is not the same as “If I tested positive, how likely is it I have it?” " +
            "Ask how rare the condition is, and how many false alarms that creates among people who do not have it.",
        },
        reject: {
          tone: "calibrated",
          title: "Reject — right for what the headline overpromises",
          body:
            "Reject the idea that accuracy alone settles a positive result. " +
            "That does not mean rejecting every screening tool; it means rejecting that wording as enough proof when rarity is not stated.",
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
      "<h3>Two different questions</h3>" +
      "<p><span class=\"math\">Sensitivity</span> asks: if someone has the condition, how often is the test positive? Headlines often call something like this “accuracy.”</p>" +
      "<p><span class=\"math\">Positive predictive value (PPV)</span> asks: if the test is positive, how often does the person actually have the condition? That is Claire’s question — the large % under the tree.</p>" +
      '<p class="formula" data-tex="\\mathrm{PPV}=\\dfrac{\\text{true positives}}{\\text{true positives}+\\text{false positives}}">PPV = true alarms ÷ (true alarms + false alarms)</p>' +
      "<h3>Why rarity and accuracy both matter</h3>" +
      "<p>When almost nobody has the condition, even a small false-alarm rate among the many healthy people creates many false alarms. Those can outnumber the true ones — so Claire’s large % falls even if “accuracy” stays high. " +
      "Lowering the second slider (how often the test is positive when someone has it) also changes the counts. Try both sliders; they pull on different parts of the same tree.</p>" +
      "<h3>Why a tree out of 1,000</h3>" +
      "<p>Gigerenzer, Hoffrage and colleagues show that many probability problems become easier when you write the facts as counts in a fixed group (for example out of 1,000 people) rather than as bare percentages. " +
      "The tree follows that format so false alarms stay visible.</p>" +
      "<h3>The same idea as a formula</h3>" +
      '<p class="formula" data-tex="P(C\\mid +)=\\dfrac{P(+\\mid C)\\,P(C)}{P(+)}">P(C | +) = P(+ | C) P(C) / P(+)</p>' +
      "<p>The tree works out that answer by counting. For this short story, “clear when you do not have it” is set to match the accuracy slider; real tests can differ.</p>" +
      "<h3>Why the defaults are 99% and 1 in 200</h3>" +
      "<p>99% matches Claire’s headline wording. 1 in 200 is a rare setting chosen so that, even at high accuracy, false alarms can already outnumber true alarms — the point of the counts.</p>";

    const furtherSources =
      "<h3>Sources</h3>" +
      "<p>Reading risk from counts: Hoffrage and colleagues (2000); Gigerenzer &amp; Edwards (2003). " +
      "More on the home page under <a href=\"#sources\">Sources</a>.</p>";

    // Longer chapter notes (More guidance, shown in full)
    const furtherGuided =
      furtherShort +
      "<h3>Back to Claire</h3>" +
      "<p>A news percentage answers how well the test does in general. Claire’s worry is what a positive result means for her. " +
      "Without knowing how rare the condition is, that second question is incomplete — the leap Hoffrage, Gigerenzer and Edwards warn against when “accuracy” is treated as personal risk.</p>" +
      furtherSources;

    // Graph-first collapsed panel: short notes + sources at the end
    const furtherShortWithSources = furtherShort + furtherSources;

    // ----- Interactive stage (sliders, tree, PPV hero) -----
    const vizPane = el("div", {
      className: "viz-pane" + (guided ? " viz-pane--compact" : ""),
    });
    if (helpers.attachStageExpand) helpers.attachStageExpand(vizPane);
    const prevField = field(el, "How rare is the condition?", "prev", 20, 500, 200, 10);
    const accField = field(el, "When someone has it, how often is the test positive?", "acc", 70, 99, 99, 1);

    const stageKey = el("details", { className: "stage-key" });
    stageKey.innerHTML =
      "<summary>On this tree <span class=\"stage-key-more\">· more detail</span></summary>" +
      "<ul>" +
      "<li><strong>1,000</strong> people · condition, then test result</li>" +
      "<li><strong>Positive tests</strong> = true alarms + false alarms</li>" +
      "<li><strong>Large %</strong> = of everyone flagged positive, how many actually have it</li>" +
      "<li>Both sliders matter — rarity can outweigh a high accuracy</li>" +
      "</ul>";
    if (typeof matchMedia === "function") {
      const wide = matchMedia("(min-width: 900px)");
      const syncKey = () => {
        stageKey.open = wide.matches;
      };
      syncKey();
      if (wide.addEventListener) wide.addEventListener("change", syncKey);
    }

    const tree = el("div", { className: "tree", attrs: { "aria-live": "polite" } });

    const ppvHero = el("div", { className: "ppv-hero" });
    ppvHero.innerHTML =
      '<p class="ppv-question">If Claire tested positive, how likely is it she actually has the condition?</p>' +
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

    // Sliders → key → tree → Claire’s % → notice (outcome appended after gate wiring)
    // Live stays for screen readers; visually hidden once outcome is shown (CSS)
    vizPane.append(prevField.wrap, accField.wrap, stageKey, tree, ppvHero, live);

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
        '<div class="tree-row pos"><span class="tag">True alarm</span> ' +
        c.tp +
        " correctly flagged</div>" +
        '<div class="tree-row neg"><span class="tag">Missed</span> ' +
        c.fn +
        " missed</div></div>" +
        '<div class="tree-row none"><span class="tag">Do not</span> ' +
        c.none +
        " people</div>" +
        '<div class="tree-indent">' +
        '<div class="tree-row pos"><span class="tag">False alarm</span> ' +
        c.fp +
        " wrongly flagged</div>" +
        '<div class="tree-row neg"><span class="tag">Clear</span> ' +
        c.tn +
        " correctly clear</div></div></div>";
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
        ") vs true alarms (" +
        c.tp +
        ").";
      if (outcomeP) {
        if (c.ppv < 40) {
          outcomeP.innerHTML =
            "Only <strong>" +
            ppv +
            "%</strong> of positive tests are true (" +
            c.fp +
            " false alarms vs " +
            c.tp +
            " true). The headline 99% is <em>not</em> Claire’s chance — that is the large % above.";
        } else if (c.ppv < 70) {
          outcomeP.innerHTML =
            "About <strong>" +
            ppv +
            "%</strong> of positives are true — far from “almost certainly.” Try rarer, then lower the second slider.";
        } else {
          outcomeP.innerHTML =
            "About <strong>" +
            ppv +
            "%</strong> true vs headline-style <strong>" +
            acc +
            "%</strong>. Make the condition rarer, then lower the second slider.";
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
      // More guidance: vertical workbook — claim → try → notice → decide
      root.append(kicker, title);
      const flow = el("div", { className: "guided-flow" });

      const step1 = el("section", { className: "guided-step" });
      step1.innerHTML =
        '<p class="step-label">Step 1 — The claim</p>' +
        "<h2>What the headline claims</h2>";
      const claim = el("div", { className: "claim" });
      claim.innerHTML = claimHtml;
      step1.append(claim);
      step1.append(
        el("p", {
          className: "after-claim",
          text:
            "Two questions. When someone has the illness, how often does the tool flag them? " +
            "When the tool flags someone, how often do they actually have the illness? " +
            "“99% accurate” speaks to the first. Claire’s worry is the second.",
        })
      );
      step1.append(
        el("p", {
          text:
            "Bare percentages make that swap easy to miss. " +
            "The same facts are clearer as counts in a fixed group — here, out of 1,000 people — so false alarms stay visible beside true alarms.",
        })
      );
      flow.append(step1);

      const step2 = el("section", { className: "guided-step" });
      step2.innerHTML =
        '<p class="step-label">Step 2 — The tree</p>' +
        "<h2>Rarity, test result, and Claire’s question</h2>" +
        "<ol>" +
        "<li><strong>Rarity</strong> — how many of the 1,000 have the condition.</li>" +
        "<li><strong>When someone has it, how often is the test positive?</strong> — among those with the condition.</li>" +
        "<li><strong>The tree</strong> — splits the 1,000 by condition, then by test result. Read top to bottom.</li>" +
        "<li><strong>The large percentage</strong> — of everyone flagged positive, how many actually have the condition (Claire’s question if she tested positive).</li>" +
        "</ol>" +
        "<p>Defaults match the headline mood: 99% and 1 in 200. " +
        "Make the condition rarer while the second slider stays high, then lower that second slider too — the large percentage should move in both cases.</p>";
      flow.append(step2);

      const step3 = el("section", { className: "guided-step" });
      step3.innerHTML =
        '<p class="step-label">Step 3 — Try the tree</p>' +
        "<h2>Follow the counts</h2>" +
        "<p>Change one slider at a time. After each change, read the tree and the large percentage — not the headline 99%.</p>";
      step3.append(vizPane, outcomeSummary);
      flow.append(step3);

      const step4 = el("section", { className: "guided-step" });
      step4.innerHTML =
        '<p class="step-label">Step 4 — Decide</p>' +
        "<h2>Back to Claire’s headline</h2>" +
        "<p>“99% accurate” does not automatically mean “almost certainly yes” for a positive result when the condition is rare.</p>";
      step4.append(takeaway.el);
      flow.append(step4);

      further = el("section", { className: "further-block" });
      further.innerHTML =
        "<h2>Going further — accuracy vs Claire’s chance</h2>" + furtherGuided;
      flow.append(further);
      flow.append(nextModule("#uncertainty", "Module 3 — A confidence score that hides a range"));
      root.append(flow);
    } else {
      // Graph-first: left copy column + right stage (both scale)
      const claim = el("div", { className: "claim" });
      claim.innerHTML = claimHtml;

      const orient = el("p", {
        className: "after-claim",
        text: "Change rarity and how often the test is positive. Watch the large percentage under the counts — not the headline 99%.",
      });

      further = el("details", { className: "further" });
      further.innerHTML =
        "<summary>Going further — accuracy vs Claire’s chance</summary>" +
        furtherShortWithSources;
      const nextEl = nextModule(
        "#uncertainty",
        "Module 3 — A confidence score that hides a range"
      );

      // Notice sits under Claire’s large % (before live); deferred until first interact
      vizPane.insertBefore(outcomeSummary, live);

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

    // Graph-first only: controls inactive until Try the tree (orient gate)
    let orientGate = null;
    let interacted = false;
    if (!guided && global.CS4098.ui && global.CS4098.ui.applyOrientGate) {
      orientGate = global.CS4098.ui.applyOrientGate({
        controls: [prevField.input, accField.input],
        mountNear: prevField.wrap,
        stage: vizPane,
        buttonLabel: "Try the tree",
        hint: "After you’ve read the claim at the top of the page, try the tree.",
      });
      if (global.CS4098.ui.deferTakeawayUntilInteract) {
        takeawayFlow = global.CS4098.ui.deferTakeawayUntilInteract(takeaway.el, {
          hint: "When you have seen what the counts do, choose trust, question, or reject.",
          alsoHide: takeaway.el._flowAlsoHide || [],
          revealWithInteract: takeaway.el._flowWithInteract || [],
        });
      }
    }

    // First interact reveals the deferred Your call (Graph-first order)
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
