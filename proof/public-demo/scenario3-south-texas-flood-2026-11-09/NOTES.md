# Scenario 3 notes — South Texas flood, Nov 7–9, 2026

Built 2026-11-09 ~22:45 UTC by `build_scenario3.py` (same method as
scenarios 1–2: excerpt sha256, canonical-JSON package hash, hash-chained
audit, uuid5 package_id). Approval PENDING — no approval event exists in
the audit chain (3 events only), no sealed receipt file was created.

## Why this event

- Asked for: a current, live, difficult multi-source event for Mon
  2026-11-09, or the most recent difficult event in the last 7 days.
- Found live today: SPC Day 1 for Nov 9 says NO severe thunderstorm
  areas forecast and SPC had no severe reports for Nov 4–8, so no
  qualifying live tornado/hail/wind event exists today. The qualifying
  live event today is the South Texas flood system (Nov 7–9): flash
  flood + river flood + excessive rainfall + coastal flooding, two NWS
  offices (EWX, CRP) plus WPC, SPC, WGRFC, and a USGS gauge.
- Harder than Adair (single tornado, 1 source family) and Norman
  (single hail size, SPC + one warning): 8 evidence items, a crest
  forecast conflict, and a hazard-classification conflict, both held
  open as material conflicts in the package.

## Verification

- Primary products fetched directly 2026-11-09 ~22:38 UTC:
  NWS EWX Flash Flood Warning FF.W.0108 (forecast.weather.gov);
  NWS CRP Area Forecast Discussion 1:04 PM CST Nov 9
  (forecast.weather.gov); SPC Day 1 Outlook 1300Z Nov 9
  (spc.noaa.gov); WGRFC River Forecast 12:45 PM CST Nov 9
  (forecast.weather.gov).
- Mirrors/secondary, labelled in the evidence items themselves:
  WPC Excessive Rainfall Discussion via kamala.cod.edu (College of
  DuPage archive of NWS text); Oso Creek Flood Warning FL.W.0028 via
  stormstation247.com reproduction; USGS gauge 08211520 via
  snoflo.org mirror; Kerr advisory via kerrvillebreaking.news.
- Cross-check that held: USGS gauge height 10.48 ft (Nov 9) vs warning
  stage 10.4 ft at 6:15 AM CST — consistent.
- Cross-check that failed (kept open): Oso Creek crest 20.0 ft just
  after midnight (FL.W.0028 reproduction) vs ~23 ft late Monday /
  warning to Nov 11 in other same-day summaries of NWS products
  (e.g. NWS-product-based video summaries, Nov 9). Not resolved;
  recorded as `conf-…-oso-crest`, severity material.

## Validation

```
$ python3 build_scenario3.py
schema errors: 0
package_id: 9499e23a-9e4a-55f9-ae6a-6765e062f773
package_hash (pre-approval): 1a22c197ee67422c62d80d7950a8063a77da0cf5d9f99cf28fdd93effaa71e01
evidence sha (primary, EWX FF.W.0108): 97ce163275a96d443c2c8347c95fcb4757f9b4c1ad7e5c9d7cb63e2618718eec
evidence items: 8
audit head: f882f32f3b6dc24cbc0eee7be1949fe16ec686e002f0b5ee42fe5dd824d76281
fields: 23 — required 23
REVERIFIED OK — approval PENDING, not sealed
```

Validator: `repos/AIA_decision_package_schema_v02.json`
(Draft 2020-12, jsonschema) — the same schema file used for scenarios
1 and 2. Independent re-verification in the build script re-checks the
package hash, every evidence sha256, and the full audit hash chain.

## Globe / Overlay mapping

Normalised public-feed shape (from
`wiring/03-public-overlay-page/src/lib/publicFeed.ts`): each evidence
item maps to one globe item `{source, title, kind, severity, lat/lng or
polygon, eventTime, fetchedAt, url, verification}` — EWX warning
polygon from its LAT…LON line; Llano and Oso Creek as river points with
stage/crest in `detail`; WPC rainfall as a regional band (no single
point — do not invent coordinates for it); SPC outlook as an
event-level classification note, not a pin. Overlay page is
branch-ready PREVIEW only; nothing deployed (Vercel route is out per
Oliver, Nov 9).

## Files

- `decision_package_v02_scenario3.json` — the package (pending)
- `build_scenario3.py` — reproducible build + validator run
- `explainer_scenario3.md` — one-page plain-English explainer
- `decision_package_v02_scenario3_notes.md` — this file
- `github_commit_plan_scenario3.md` — prepared commit plan, NOT executed
- `scenario3-github-proof/` — clean copies staged for that commit plan

## APPROVAL RECORDED — 2026-11-09 by voice

**APPROVED 2026-11-09 by voice** — Oliver said yes to this package at
~21:34 EST, paused briefly, then re-confirmed at 21:46 EST
("Yeah, do both. Yes, do both, please." — the second yes was to the
GitHub push). Recorded the same way as scenarios 1–2 by
`approve_scenario3.py`: approvals[0] approved, approver Oliver Paynter
(human, founder), notes "approval given by voice",
`approved_at 2026-11-10T02:46:00Z` (the re-confirmation time), audit
event 4 `human_approval_recorded` with `details: {"channel": "voice"}`.
Decision stays "hold", lifecycle stays "evidence_ready", release gate
stays "locked". Open conflicts unchanged, including the Oso Creek
crest disagreement.

- New seal (package hash after approval): `9fc9a2f86d576a7af5abe83f2b5adb863406b74246b90eac3538e83af063bb8d`
- Pre-approval hash: `1a22c197ee67422c62d80d7950a8063a77da0cf5d9f99cf28fdd93effaa71e01` (exact pre-approval copy kept as `decision_package_v02_scenario3_pre_approval.json`)
- Attestation hash: `d7825bebcb8bf4f8d6209d4d6acf494755e2c41579efbdcd861682ee82dc6f72`
- Audit chain head after approval: `c2730157e5cb87c5c87d29815e262d04d94faa91b08495ff47763a2c81ccf56f`
- Sealed receipt: `sealed_receipt_scenario3.json` — receipt ID `6e1f7667-669f-536c-b5c1-294f89055c19`, receipt hash `6b81a70d86c87539f6554e47d6860a76c302274f227d0d54da5197b89d09413f`
- Re-validation after approval: schema errors 0, package hash, every
  evidence sha256, and the full audit hash chain (now 4 events) all
  re-verified OK.

A yes does NOT authorise action, file anything, pay anything, or
clear GACC #128. PUBLIC / DEMO only, $0, not a real claim, not GACC
evidence, no live AIA runtime ran this package.
