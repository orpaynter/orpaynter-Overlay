# Scenario 4 notes — Ohio Valley severe hail/wind, Wed Nov 11, 2026

Built 2026-11-12 ~02:30 UTC by `build_scenario4.py` (same method as
scenarios 1–3: excerpt sha256, canonical-JSON package hash, hash-chained
audit, uuid5 package_id). Approval PENDING — no approval event exists in
the audit chain (3 events only), no sealed receipt file was created.
Nothing pushed to GitHub. NOT run on a live AIA runtime: no hosted AIA
runtime has ever been observed, and AIA's `public_workflow.py` is, in its
own header, an in-memory development demo (synthetic files only) with
claim-package case operations blocked. The workflow here is MAPPED to
the FUSION_MANIFEST spine and the six-stage governed pipeline — it is
not a claim that AIA executed it.

## Why this event

- Asked for (2026-11-11 ~21:11 EST): a fresh PUBLIC / DEMO public storm
  case. Not Adair OK tornado, not Norman OK hail (Nov 2), not South
  Texas flood (Scenario 3).
- Found live today: Wed Nov 11, 2026 Ohio Valley severe event. SPC
  Day 1 started Marginal (0655 CST), was upgraded to Slight at 2000Z
  (15% hail and wind probabilities), SPC Mesoscale Discussion 2449
  flagged a possible watch (40%), Severe Thunderstorm Watch 704 was
  issued until 11 PM EST, and evening NWS warnings carried a
  spotter-reported 1.0-inch hail report near Maceo, KY with impact text
  explicitly expecting wind damage to roofs, siding and trees — the
  most roof-relevant public event of the day, in a new region (Indiana
  / Kentucky / Illinois / Ohio) not used by scenarios 1–3.

## Spine / pipeline mapping (mapped, not executed by a live runtime)

- **Sense** — SPC Day 1 outlooks (1300Z + 2000Z), MD 2449, Watch 704.
- **TRAE** — no contractor/owner entity exists in a public demo; TRAE
  contractor score is 0, below the 40 threshold (flagged in risk).
- **Filter** — territory/license/capacity cannot be checked; no
  property, no foreman run.
- **Marketplace** — not run; $0, no lead distribution, no payment.
- **Inspection** — no inspection; the human gate is the pending
  approval on the package.
- **DecisionPackage** — this file, frozen v0.2, 23 fields, schema
  errors 0, held at evidence_ready, release locked.
- Six-stage governed pipeline mapping: Intake = trigger at the
  6:23 PM CST Maceo hail report; Evidence = the 8 items below;
  Analysis = deterministic excerpt hashing + risk signals;
  Challenge = the 4 open conflicts; Risk = risk_assessment block;
  Audit/Synthesis = the 3-event hash chain ending in a hold decision.

## Verification

- Primary products fetched directly 2026-11-12 ~02:12 UTC:
  SPC Day 1 Outlook 1300Z, Nov 11 (forecast.weather.gov, ACUS01 KWNS
  111257); NWS Wilmington OH Special Weather Statements 8:02 PM and
  8:20 PM EST and Severe Weather Statement 8:36 PM EST cancelling
  SV.W.0288, plus the 12:09 AM EST Hazardous Weather Outlook, all via
  the NOAA READY archive (ready.noaa.gov).
- Secondary reproductions, labelled in the evidence items themselves:
  SPC Day 1 2000Z update via westtennesseestormtrackers.net; SPC MD
  2449 via the SPC graphic shared on social media and stormnews.org;
  Watch 704 and its county-by-county cancellations, and the NWS
  Paducah warnings (Knottsville / Waitman / Rockport, Maceo hail),
  via paulpoteet.com reproductions of NWS products; NWS Louisville
  3:32 PM EST briefing via the office's official Facebook page;
  IndyStar live blog (local news) for central Indiana statements and
  the western Indiana tornado-warning cell.
- Cross-check that held: Watch 704 was in effect over the same
  counties/times where NWS Paducah, Indianapolis and Wilmington
  warnings and statements were later issued and then cancelled
  county by county as storms weakened (SV.W.0288 cancelled 8:36 PM).
- Cross-checks that failed (kept open): (1) hail size — forecast peaks
  1.00–1.75 in (MD 2449), ~1–1.5 in (SPC 2000Z) and ping-pong/1.5 in
  (Watch 704 graphic) vs observed 1.0 in spotter (Maceo) and 0.50 in
  radar-indicated (Oldenburg); at build time no SPC filtered
  storm-reports list for the evening of Nov 11 had been published (the
  SPC reports product for the window ending 06 CST Nov 11 closed
  before the evening storms — and its summary versions disagreed with
  each other about a Nov 10 Benavides TX report, which is a different
  event and was NOT used here). (2) Tornado — a western Indiana cell
  triggered a tornado warning (IndyStar quoting NWS) but no tornado
  report appears in any SPC product fetched at build time.
- Source-quality note: the IndyStar article's lede, as returned by
  search, contained an apparent "Oct. 11" date error while its timed
  updates are all Nov 11, 2026. Only its timed, NWS-attributed updates
  were used as evidence; the package does not rely on the lede.

## Validation

```
$ python3 build_scenario4.py
schema errors: 0
package_id: d15f3476-ea82-53db-8042-2f894d6e22da
package_hash (pre-approval): 05a9967370bcde6fe8964324b9daf4544423ce2b0fef1c4bd704bc264384f35b
evidence sha (primary, NWS Paducah warnings): 79284574ae27a619301270ca13a2650d5180b6f97080a0856f4547c5fb533410
evidence items: 8
audit head: 882f12435ec6e8544851c42d9bf326f9f8faea7336f0bff82c927bc25f421777
fields: 23 — required 23
REVERIFIED OK — approval PENDING, not sealed
```

Validator: `repos/AIA_decision_package_schema_v02.json`
(Draft 2020-12, jsonschema) — the same schema file used for scenarios
1–3. Independent re-verification in the build script re-checks the
package hash, every evidence sha256, and the full audit hash chain.

## Files

- `decision_package_v02_scenario4_pre_approval.json` — the package
  (pending; identical copy also at `decision_package_v02_scenario4.json`,
  following the scenario 3 file pattern)
- `build_scenario4.py` — reproducible build + validator run
- `explainer_scenario4.md` — one-page plain-English explainer
- `decision_package_v02_scenario4_notes.md` — this file

## State

- NOT sealed. NOT approved. Oliver has not seen this package yet and
  has not said yes to scenario 4; his yeses to scenarios 1–3 do not
  carry over.
- NOT pushed to GitHub, nothing merged, no PR.
- NOT GACC evidence. GACC #128 still needs a reachable authenticated
  AIA runtime, one real run, a second run learning from the first,
  and independent verification.
- Missing for anything more: a real property and owner, matched
  carrier/contractor evidence, deterministic correlation, two-layer
  validation, a live AIA runtime run, and Oliver's yes to this package.
