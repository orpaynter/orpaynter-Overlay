# STATUS UPDATE — APPROVED AND SEALED (2026-11-09, by voice)

Oliver approved this package by voice on 2026-11-09 (yes at ~21:34 EST,
re-confirmed 21:46 EST), and a sealed receipt was issued:
`sealed_receipt_scenario3.json` in this folder.

- Package ID: `9499e23a-9e4a-55f9-ae6a-6765e062f773`
- Package hash after approval (seal): `9fc9a2f86d576a7af5abe83f2b5adb863406b74246b90eac3538e83af063bb8d`
- Receipt ID: `6e1f7667-669f-536c-b5c1-294f89055c19`
- Receipt hash: `6b81a70d86c87539f6554e47d6860a76c302274f227d0d54da5197b89d09413f`
- Validation after approval: schema errors 0; package hash, evidence
  hashes, and audit chain re-verified.

The explainer text below was written before approval. Any statement in
it that approval is pending, or that no receipt exists for scenario 3,
is superseded by this update. PUBLIC / DEMO, $0, not a real claim, not
GACC evidence, no live AIA runtime ran this package.

---

# Scenario 3, in plain words — the South Texas flood, live today

**PUBLIC / DEMO — not a real claim. No homeowner, no house, no money. $0.**

This is the harder case Oliver asked for: not one hail report, but a live,
multi-part flood system, checked against several public sources at once,
with the problems left visible instead of smoothed over.

## The event

A slow storm system sat over South Texas from **Saturday Nov 7 to Monday
Nov 9, 2026** — and it was still live today, Monday Nov 9.

- **Hill Country (west side):** Flash Flood Warning on Sunday night,
  Nov 8, for Edwards, Kinney and Val Verde counties. The Weather Service
  called it **life-threatening**, with roads flooded and closed near
  US 377, SH 55 and CR 450, and a **water rescue** reported on CR 450.
  2 to 5 inches of rain had fallen in 24 to 36 hours.
- **Coastal Bend (east side):** 5 to 10 inches of rain near Kingsville,
  4 to 9 inches in the band from southwest Corpus Christi toward Laredo.
  The ground was already soaked — soil moisture above the 95th
  percentile across the region.
- **Rivers still rising today:** Oso Creek at Corpus Christi is under a
  Flood Warning, forecast to reach flood stage tonight. The Llano River
  is forecast to crest at 11.3 feet on Tuesday Nov 10 — above its
  10-foot flood stage. Flooding outlasts the rain.
- **The coast too:** minor coastal flooding at high tide tonight, up to
  2.2 feet above mean sea level, with a Coastal Flood Advisory until
  3 AM Tuesday.

That is four kinds of water problem at once — flash flood, river flood,
excessive rain on saturated ground, and coastal flooding — across two
Weather Service offices, about 200 miles apart, from the same system.

## What the globe shows for this event

On Oliver's globe / Overlay view, this one event is not one pin. It is a
spread of pins and shapes, each with its own source and its own clock:

- A **red warning polygon** in the Hill Country — the flash flood warning
  shape the Weather Service itself drew (its corners are in the package).
- **River pins** on the Llano River and on Oso Creek, showing stage now
  and crest forecast — one rising Tuesday, one cresting tonight.
- A **rainfall band** from Laredo to Corpus Christi, coloured by the
  Weather Prediction Center's totals (4–9 inches, 5–10 near Kingsville).
- A **coastal strip** along the Gulf for the coastal flood advisory.
- And a label that matters: **“No severe thunderstorms forecast”** —
  the Storm Prediction Center's outlook for today. The globe shows that
  too, because it changes what this event *is*. It is a flood, not a
  hail or tornado event.

Every item carries where it came from and when it was issued. One source
going down does not blank the others. That is how the existing Overlay
public page was built (NWS alerts + USGS feeds, SPC reports labelled
PRELIMINARY), and it is the view this package was built from.

**Honest limit:** the Overlay public page is branch-ready code, not a
live website today. Nothing was deployed. The globe part of this proof
is the *view and the data shape*, shown from the package — not a public
URL anyone can open yet.

## The evidence used (8 items, all public)

1. **NWS Austin/San Antonio** — Flash Flood Warning FF.W.0108, 7:46 PM
   CST Sun Nov 8, extended to midnight. Primary product, read directly.
2. **NWS Corpus Christi** — Area Forecast Discussion, 1:04 PM CST Mon
   Nov 9: heavy rain continues, Slight Risk (2 of 4) for excessive
   rainfall, coastal flooding tonight, flood watch expired that
   afternoon. Primary product, read directly.
3. **Storm Prediction Center** — Day 1 Outlook, Mon Nov 9: **no severe
   thunderstorm areas forecast**; elevated thunderstorms over south
   Texas. Primary product, read directly.
4. **Weather Prediction Center** — Excessive Rainfall Discussion,
   2:31 PM EST Mon Nov 9: saturated soils, 5–10 inch totals near
   Kingsville. Read via the College of DuPage archive mirror of the
   NWS product.
5. **West Gulf River Forecast Center** — River Forecast, 12:45 PM CST
   Mon Nov 9: Llano River at 4.2 ft at noon, crest 11.3 ft forecast
   Nov 10, flood stage 10 ft. Primary product, read directly.
6. **Oso Creek Flood Warning** (NWS Corpus Christi) — stage 10.4 ft at
   6:15 AM Monday, flood stage 20 ft, crest 20.0 ft forecast just after
   midnight. Read via a secondary reproduction of the NWS product —
   labelled as such in the package.
7. **USGS gauge 08211520, Oso Creek** — flow 132 cfs, gage height
   10.48 ft on Nov 9, via a mirror of USGS gauge data. It matches the
   warning's 10.4 ft stage — two independent readings of the same river.
8. **Kerrville Breaking News** — Flood Advisory for Kerr + 7 counties,
   Mon Nov 9, 8:17 AM to 4 PM, reporting the NWS products locally.

## The two hard problems this case caught (and held open)

1. **The crest numbers disagree.** One reading of the Oso Creek warning
   says crest 20.0 ft just after midnight; other same-day summaries of
   Weather Service products said near 23 ft late Monday, with a longer
   warning window. The package does **not** pick a winner. It records
   the disagreement as an open, material conflict. A real run would
   re-fetch the one current NWS product and use only that.
2. **It would be easy to mislabel this storm.** The flood products say
   flooding is happening; the Storm Prediction Center says no severe
   thunderstorms. Both are right — about different hazards. This package
   classifies the event as **flood only**. It must never be used as
   hail, wind or tornado evidence, or as roof-damage evidence.

Catching those two, instead of hiding them, is the point of the harder
case. Adair was one tornado report. Norman was one hail size. This one
forced the system to reconcile five sources, two offices, and a
classification trap — and to hold, not guess.

## The package

- **Format:** Oliver's frozen DecisionPackage **v0.2**, exactly — same
  23 fields, same validator. **Schema errors: 0.**
- **Package ID:** `9499e23a-9e4a-55f9-ae6a-6765e062f773`
- **State:** evidence-ready, **approval PENDING**, release locked,
  kill switch armed, $0, read-only.
- **Package hash (pre-approval):**
  `1a22c197ee67422c62d80d7950a8063a77da0cf5d9f99cf28fdd93effaa71e01`
  — this is a fingerprint of the package as built. It is **not** a
  sealed receipt. No receipt exists for scenario 3, because Oliver has
  not said yes to *this* package yet. His yeses to Adair and Norman do
  not carry over.

## The GitHub route (Oliver's direction, Nov 9 evening)

Oliver said: go through **GitHub, not Vercel** — he will not pay to get
around the Vercel team block, and that route is out.

So this proof is prepared as files that can be committed to the
**public** Overlay repo, `orpaynter/orpaynter-Overlay`:

- Free, public, and permanent: anyone can open the repo, read the
  package, check the hashes, and re-run the validator themselves.
- That is the reproducible run record: evidence, sources, timestamps,
  conflicts, and the pending approval — all in the open, in Oliver's
  exact format.

**What the GitHub route does NOT do — plainly:**

- Putting files in a public repo does **not** prove a live AIA runtime
  ran them. This package was built with the same bounded public-demo
  adapter as scenarios 1 and 2, not by an authenticated AIA runtime.
- It does **not** flip GACC #128, and it is not GACC evidence. GACC
  still needs a real run through the canonical runtime, then a second
  run, independently verified.
- It does **not** make the globe live on a website. It makes the proof
  public and checkable. A live page is a separate step, on Oliver's go.
- Nothing has been pushed or committed. The files and the commit plan
  are prepared; **Oliver approves before any push.**

## What is demo, and what is real

**Real:** the storm, the warnings, the rainfall, the river forecasts,
the water rescue report — all from public Weather Service and USGS
sources, today. The package format is Oliver's real v0.2 format, and
it validates clean.

**Demo:** there is no real claim behind this. No homeowner, no property,
no address, no damage inspection, no filing, no payment. The “claim”
here is a public situation used to run the loop's evidence → workflow →
approval step in the open.

**Still missing for a real claim:** a real property and owner, matched
carrier/contractor evidence, correlation, and a run through the
canonical AIA runtime.

## The one thing needed from Oliver

Say yes — or no — to **this** package:

> Scenario 3, South Texas flood, package
> `9499e23a-9e4a-55f9-ae6a-6765e062f773`, PUBLIC / DEMO, $0,
> approval pending.

A yes records his approval in the package (voice yes counts — that is
his rule) and only then is a sealed receipt issued for scenario 3.
A yes also approves the GitHub commit plan *only if he says so
separately* — approving the package and approving a public push are
two different yeses, and neither is assumed from the other.
