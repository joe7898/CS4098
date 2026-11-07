# Calibrated trust in numbers (CS4098 artefact)

Short interactive pages on when to **trust**, **question**, or **reject** everyday statistical and AI metric claims.

Aligned with the project report: claim-first framing (Field / Spiegelhalter), outcome feedback (Ahn), natural frequencies (Gigerenzer / Hoffrage), overfitting intuition (Domingos), contractual / calibrated trust (Lee & See; Jacovi). Depth for interested readers sits under **Going further**.

## Run

Open `index.html`, or from this folder:

```bash
python3 -m http.server 8765 --bind 127.0.0.1
```

Then visit `http://127.0.0.1:8765/index.html`.

## Modules

1. **Looking perfect on old data** — past vs new match % (Isla / grade predictor).
2. **When a high accuracy still misleads** — counts out of 1,000 and the large % (Claire / “99% accurate”).
3. **A confidence score that hides a range** — score 82 vs cutoff 75 (Isla / writing helper).

## Layouts

- **Graph-first** — claim at the top, interactive stage early, then Your call (preferred). Controls stay locked until the orient button (Try the chart / Try the tree / Widen the range).
- **More guidance** — step list first (comparison layout).

Same lessons either way. No login, no chatbot, no GenAI.

## Notes for maintainers

- Cache-bust with `?v=flow…` on CSS/JS in `index.html` after copy or layout edits.
- Author / Student ID / Description headers on each JS and CSS file match the repo convention.
- Learner-facing copy prefers plain language on the main path; specialist terms stay under Going further.
- Home **Sources** (`#sources`) and each Going further end with plain-language attributions (full refs stay in the project report).
