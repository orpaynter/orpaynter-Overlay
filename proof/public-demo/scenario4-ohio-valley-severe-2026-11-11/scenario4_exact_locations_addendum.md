# Scenario 4 — Exact Locations Addendum

**PUBLIC / DEMO — not a real claim. $0.**

Addendum to: Scenario 4, Ohio Valley severe hail/wind, Wed Nov 11, 2026
Package ID: `d15f3476-ea82-53db-8042-2f894d6e22da`
Status of the original package: **pre-approval, NOT sealed.**
This addendum is a **separate file only**. The original pre-approval
package was not modified, not sealed, and not pushed.

## What these locations are — and are not

These are **public storm-report locations**: a town or a town-plus-offset
(for example, "2 S Riley") with the latitude/longitude SPC published
for that report.

They are **NOT private home addresses.** No individual addresses are in
the public SPC report. The Riley wind entry below reports homes damaged
at that public location — it does not name or address any individual
home.

## Exact locations — SPC storm reports, Nov 11, 2026

Source for every row in this table: SPC storm reports for 20261111,
`261111_rpts.csv` and the filtered version of the same file, SPC direct
fetch. Times are as SPC lists them, in UTC. Local conversions are
labelled: Indiana (Vigo County) is Eastern, EST = UTC-5 in November;
Daviess County, Kentucky is Central, CST = UTC-6 in November.

| Time (UTC) | Time (local, converted) | Type | Size / speed | Location | County / State | Lat | Lon | Comments |
|---|---|---|---|---|---|---|---|---|
| 2230 | Nov 11, 5:30 PM EST | WIND | UNK (no speed in the report) | 2 S Riley | Vigo, IN | 39.36 | -87.30 | "3 to 4 homes with roof damage. A grain bin partially damaged and thrown into nearby trees. Trees downed in roadway. Time estimated from radar. (IND)" |
| 2229 | Nov 11, 5:29 PM EST | HAIL | 1.75 inch | Riley | Vigo, IN | 39.39 | -87.30 | Largest hail report in this verified set. |
| 0024 | Nov 11, 6:24 PM CST | HAIL | 1.00 inch | Macio [Maceo] | Daviess, KY | 37.86 | -86.99 | SPC spells the place "Macio" (Maceo). 0024 UTC on the SPC Nov 11 report day converts to 6:24 PM CST Nov 11 local. The NWS Paducah warning reproduction in the original package reported this hail at 6:23 PM CST — a 1-minute difference between the two public products, kept as-is. |

**Count: 3 exact report entries, at 3 published lat/lon pairs
(2 at Riley, IN, 1 at Maceo, KY).**

The same data is in `scenario4_exact_locations.csv` in this folder.

## Other Ohio Valley places named for that evening — NOT counted above

The parent brief named additional IN/KY/IL hail entries from the same
SPC file for that evening: Crossville, IL; Terre Haute / Vigo, IN;
Patoka, IN; Poseyville, IN (multiple entries); Princeton, IN; and
Reed / Warrick, IN.

Their individual SPC rows (exact time, size, lat, lon) were **not**
included in the verified excerpt available when this addendum was
built, and an independent re-fetch of the SPC CSV in this session
failed (the fetch tool returned an upstream failure). Those rows are
therefore **not listed with coordinates here, and no coordinates have
been invented for them.** They are named places from the same evening's
SPC report file, pending a successful re-pull of the full CSV to add
their exact rows.

## What this updates in the original Scenario 4 package

Two open conflicts in the original pre-approval package change —
on paper here only; the original package itself was not edited:

1. **SPC filtered report list — now published.**
   At original build time, no SPC filtered report list for that
   evening had been published. It has now been published and pulled.
   That open item is resolved by this addendum.

2. **Hail size, forecast vs observed — observed now reaches the
   forecast peak range.**
   Original package: forecast hail peaked at 1.00–1.75 inches, while
   the largest observed / radar-indicated hail in the package was
   1.0 inch (Maceo spotter report) and 0.50 inch (radar).
   Updated by this addendum: SPC reports **1.75-inch hail at Riley,
   Vigo County, IN at 2229 UTC** — the top of the forecast peak
   range. The forecast-vs-observed gap recorded in the original
   package is therefore closed at the top end by a real report,
   recorded honestly here. Smaller reports (1.00 inch at Maceo,
   0.50 inch radar-indicated in the original package) still stand
   as reported.

## What this does NOT change

- **The Riley wind report is a wind report, not a tornado report.**
  Its speed is UNK in SPC. It is **not** upgraded to a tornado here,
  and it must not be used as tornado evidence. The original package's
  conflict — a tornado *warning* in western Indiana with no tornado
  report — still stands.
- No real property, owner, or individual address has been added.
  This stays PUBLIC / DEMO, $0, with no claim, no filing, no payment.
- Approval status does not change: still **pending Oliver's yes**
  to the Scenario 4 package. This addendum is not a seal and carries
  no receipt.

## Warning polygons — tried, not retrieved

NWS api.weather.gov was tried for warning polygon geometry for the
relevant warnings. The active-alerts endpoint for the Riley point
(39.39, -87.30) returned an empty FeatureCollection (checked
2026-11-12 ~02:15 UTC) — the event was over and no active alerts
remained. **Historical warning polygon geometry for Nov 11, 2026 was
not retrieved in this build, and no polygons are included or invented
in this addendum.**

## Sources and failures, plainly

- SPC `261111_rpts.csv` / filtered version: verified live pull by
  the parent; the exact rows in the table above are from that pull.
  An independent re-fetch attempt in this addendum session failed
  with an upstream fetch error, so the additional named places above
  could not be re-verified row-by-row in this session.
- NWS api.weather.gov (active alerts, Riley point): retrieved,
  returned no features — see warning polygons section above.
- No other source was used for coordinates in this addendum, and no
  coordinate was estimated, geocoded, or invented.

---

## Correction / completion — 2026-11-11 evening, parent re-pull verified twice

The section above was built from a partial excerpt because that build session's SPC re-fetch failed. The parent re-fetched the SPC filtered report list directly (`261111_rpts_filtered.csv`) twice with identical results. The exact Ohio Valley locations for this event are therefore **9 verified points**, not 3:

| Time (UTC) | Type | Location | County, State | Lat | Lon | Note |
|---|---|---|---|---|---|---|
| 2230 | Wind, UNK speed | 2 S Riley | Vigo, IN | 39.36 | -87.30 | 3 to 4 homes with roof damage, grain bin damaged, trees down (IND) |
| 2211 | Hail 1.00" | 2 NE Crossville | White, IL | 38.19 | -88.04 | CR1800 E / IL 1 covered in quarter+ hail (PAH) |
| 2220 | Hail 1.00" | Patoka | Gibson, IN | 38.41 | -87.58 | dime to quarter hail, social media video (PAH) |
| 2229 | Hail 1.75" | Riley | Vigo, IN | 39.39 | -87.30 | largest hail (IND) |
| 2245 | Hail 1.00" | 5 S Poseyville | Posey, IN | 38.10 | -87.79 | (PAH) |
| 2249 | Hail 1.00" | Princeton | Gibson, IN | 38.36 | -87.57 | (PAH) |
| 2310 | Hail 1.00" | 2 SW Poseyville | Posey, IN | 38.14 | -87.80 | North Posey High School, media video (PAH) |
| 2358 | Hail 1.00" | 5 NE Reed | Warrick, IN | 37.92 | -87.30 | (PAH) |
| 0024 | Hail 1.00" | Macio [Maceo] | Daviess, KY | 37.86 | -86.99 | relayed from media (PAH) |

The unfiltered list adds 3 nearby duplicate/close points (4 S Indiana State Univ, Terre Haute 39.41/-87.41; 3 E Princeton 38.34/-87.52; Poseyville town 38.17/-87.78). Full source CSV saved alongside as `scenario4_spc_reports_261111_filtered.csv`.
These are public storm-report locations, NOT private home addresses.
