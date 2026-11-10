#!/usr/bin/env python3
"""Build scenario 3: South Texas multi-source flood system, Nov 7-9 2026 — LIVE today.
v0.2 DecisionPackage, approval PENDING. Mirrors build_scenario2.py structure/method.
Evidence sha256 = SHA-256 of the recorded excerpt text.
Seal = SHA-256 of canonical JSON (sort_keys, compact separators) of the 23-field package.
Audit event_hash = SHA-256 of canonical JSON of event dict excluding event_hash,
chained via previous_event_hash. Package_id = uuid5(NAMESPACE_URL,
"orpaynter:claimflow:public-demo:demo-south-texas-flood-2026-11-09:<primary sha>").
Sources verified 2026-11-09 ~22:38 UTC from primary NWS/SPC/WPC products where
available; secondary reproductions are labelled as such in the evidence items.
PUBLIC / DEMO only. No real claim, no filing, no payment, $0.
"""
import hashlib, json, uuid
from pathlib import Path

SCRATCH = Path.home() / "workspace/.jarvis/idea-executions/closed-loop-public-demo/scratch"
SCHEMA = SCRATCH / "repos/AIA_decision_package_schema_v02.json"

def sha(text: str) -> str:
    return hashlib.sha256(text.encode()).hexdigest()

def canon(obj) -> str:
    return json.dumps(obj, sort_keys=True, separators=(",", ":"))

# --- Evidence excerpts (recorded from sources, see scenario3 notes) ---
EXCERPT_EWX_FFW = (
    "Flash Flood Warning, NWS Austin/San Antonio TX, 7:46 PM CST Sun Nov 8 2026, "
    "extended (FF.W.0108) until midnight CST, for Edwards County, northwestern "
    "Kinney County and northeastern Val Verde County, south central Texas. "
    "At 7:46 PM CST, emergency management and TxDOT reports flooding across the "
    "warned area with several roads flooded and closed, including near US Highway "
    "377, SH 55 and CR 450. A water rescue was reported this evening in the Newby "
    "Hills subdivision along CR 450. Between 2 and 5 inches of rain have fallen "
    "over the past 24 to 36 hours. Additional rainfall amounts up to 1 inch are "
    "possible. HAZARD: Life threatening flash flooding. FLASH FLOOD DAMAGE "
    "THREAT: CONSIDERABLE. Locations include Rocksprings, Kickapoo Cavern State "
    "Park, Devils River State Natural Area and Pafford Crossing. Polygon "
    "LAT/LON points include 3029 10079, 3029 9985, 2951 10049, 2972 10115."
)
EXCERPT_CRP_AFD = (
    "Area Forecast Discussion, NWS Corpus Christi TX, 1:04 PM CST Mon Nov 9 2026 "
    "(key messages issued 1:01 PM CST). The chance for heavy rain continues through "
    "tonight mainly across the southern Coastal Bend. Slight Risk (level 2 of 4) of "
    "Excessive Rainfall across the southern Coastal Bend with flash flooding "
    "possible. Minor coastal flooding expected through late tonight during times "
    "of high tide; P-ETSS guidance indicated tide levels may exceed the 2 ft MSL "
    "threshold with up to 2.2 feet above MSL possible. The Flash Flood Watch was "
    "allowed to expire (afternoon update). Watches/Warnings/Advisories listed: "
    "Coastal Flood Advisory until 3 AM CST Tuesday; High Rip Current Risk until "
    "6 PM CST this evening; Small Craft Advisory until 3 PM CST this afternoon."
)
EXCERPT_SPC = (
    "SPC Day 1 Convective Outlook, NWS Storm Prediction Center Norman OK, "
    "0640 AM CST Mon Nov 09 2026, valid 091300Z - 101200Z: NO SEVERE THUNDERSTORM "
    "AREAS FORECAST. Organized severe thunderstorms are not forecast through "
    "tonight. Generally elevated thunderstorms are ongoing this morning across "
    "parts of south TX to the north of a weak inverted surface trough. Weak "
    "MUCAPE and poor lapse rates aloft are expected to limit the severe threat "
    "this morning (reference the 12Z observed CRP/BRO soundings)."
)
EXCERPT_WPC = (
    "Excessive Rainfall Discussion, NWS Weather Prediction Center College Park MD, "
    "2:31 PM EST Mon Nov 9 2026, Day 1 valid 16Z Mon Nov 09 - 12Z Tue Nov 10 2026. "
    "There is a Slight Risk of excessive rainfall across portions of far "
    "southeastern Texas. Numerous showers and thunderstorms continue across much "
    "of south-central and southern Texas. Any additional rain will fall on very "
    "saturated soils (NASA SPoRT-LIS 0-10 cm soil moisture >95th percentile region "
    "wide), leading to an isolated to scattered flash flooding threat at least "
    "into the early afternoon hours. Some areas have already seen 4-9 inches, "
    "especially within the zone between the southwestern side of Corpus Christi "
    "to about 50 miles east of Laredo. The area southwest of Corpus Christi near "
    "Kingsville was the epicentre of the heavy rain episode, with local totals "
    "ranging from 5-10 inches noted within observations and MRMS gauge-corrected "
    "data. Text as archived by the University of Illinois College of DuPage "
    "meteorology archive (kamala.cod.edu), a mirror of the NWS product."
)
EXCERPT_RVF_LLANO = (
    "River Forecast, NWS West Gulf River Forecast Center Fort Worth TX, issued "
    "via NWS Austin/San Antonio, 12:45 PM CST Mon Nov 09 2026. Llano River at "
    "Llano: action stage 10.0 ft, flood stage 10.0 ft, moderate stage 12.0 ft, "
    "major stage 23.0 ft. Latest river stage 4.2 ft at 1200 PM CST on Nov 09. "
    "Forecast crest 11.3 ft on Nov 10 (crest line: LLAT2 1110, crest value 11.3) "
    "- above flood stage, below moderate stage. Forecaster comments: rise based "
    "on observed and forecast routed flow."
)
EXCERPT_OSO = (
    "Flood Warning for Oso Creek near Corpus Christi, Nueces County TX, as "
    "reproduced by Storm Station 247 from the NWS Corpus Christi product: "
    "moderate flooding is forecast; warning in effect until Tuesday evening. "
    "At 6:15 AM CST Monday the stage was 10.4 feet. Bankfull stage is 11.0 feet. "
    "Forecast: the river is expected to rise to a crest of 20.0 feet just after "
    "midnight tonight, then fall below flood stage late tonight. Flood stage is "
    "20.0 feet. At 20.0 feet, moderate lowland flooding occurs from the "
    "headwaters near Violet Road / Farm to Market 24 to Oso Bay. This is a "
    "secondary reproduction of an NWS product, not a direct fetch of the "
    "warning text in this build. Other same-day summaries of NWS products "
    "reported a crest near 23 feet late Monday night and a warning running "
    "longer (to Nov 11) - that difference is recorded as an open conflict, "
    "not resolved here."
)
EXCERPT_USGS_OSO = (
    "USGS stream gauge 08211520, Oso Creek at Corpus Christi, Texas, as mirrored "
    "by SnoFlo (source: USGS gauge data, refreshed throughout the day). As of "
    "November 9, 2026: flow 132 cfs, gage height 10.48 ft, described as a major "
    "flow event at 4414% of median, up sharply over the past 24 hours. The "
    "10.48 ft gage height is consistent with the 10.4 ft stage at 6:15 AM CST "
    "in the Oso Creek flood warning reproduction. Mirror, not a direct USGS "
    "fetch in this build."
)
EXCERPT_KERR = (
    "Kerrville Breaking News, Nov 9, 2026, 12:38 PM CT, updated 1:33 PM CT: "
    "Kerr County is under a Flood Advisory until 4 p.m. Monday. The National "
    "Weather Service in Austin/San Antonio issued the advisory at 8:17 a.m. "
    "for Kerr County and seven neighbouring counties: Bandera, Edwards, "
    "Kinney, Medina, Real, Uvalde and Val Verde. As of 8:15 a.m., radar showed "
    "1 to 2 inches of rain had already fallen Monday morning, with up to 2 more "
    "inches expected through the afternoon. On Sunday, NWS issued a Flash Flood "
    "Warning for northwestern Kerr County after 3 to 5 inches fell across the "
    "warned area. Communities expected to see flooding include Hunt, "
    "Vanderpool, Leakey, Tarpley, Medina, Camp Wood, Barksdale, Rocksprings, "
    "Uvalde and Del Rio. Local secondary source reporting NWS products."
)

sha_ewx = sha(EXCERPT_EWX_FFW)
sha_crp = sha(EXCERPT_CRP_AFD)
sha_spc = sha(EXCERPT_SPC)
sha_wpc = sha(EXCERPT_WPC)
sha_rvf = sha(EXCERPT_RVF_LLANO)
sha_oso = sha(EXCERPT_OSO)
sha_usgs = sha(EXCERPT_USGS_OSO)
sha_kerr = sha(EXCERPT_KERR)
primary_sha = sha_ewx

package_id = str(uuid.uuid5(uuid.NAMESPACE_URL,
    f"orpaynter:claimflow:public-demo:demo-south-texas-flood-2026-11-09:{primary_sha}"))
created = "2026-11-09T22:45:00Z"
expires = "2026-11-10T22:45:00Z"
claim = "demo-south-texas-flood-2026-11-09"
demo_label = "DP-PUBLIC-DEMO-2026-11-09-SOUTH-TEXAS-FLOOD"
short = "south-texas-flood-261109"

producer = {"actor_type": "agent", "actor_id": "orpaynter-public-demo",
            "role": "sense", "runtime": "python"}

def evidence(eid, cls, filename, ctype, excerpt, digest, uri, facts):
    return {
        "evidence_id": eid, "class": cls, "filename": filename,
        "content_type": ctype, "sha256": digest, "captured_at": created,
        "source_locator": {"source_type": "api", "uri": uri},
        "raw_text_excerpt": excerpt, "extracted_facts": facts,
        "provenance": {"producer": producer,
                       "method": "bounded_public_fetch_and_deterministic_parse",
                       "parser_version": "public-demo-0.1.0",
                       "input_hash": digest},
    }

ev = [
    evidence("ev-nws-ewx-ffw-0108", "system_output", "nws-ewx-flash-flood-warning-0108-2026-11-08.txt",
             "text/plain", EXCERPT_EWX_FFW, sha_ewx,
             "http://forecast.weather.gov/product.php?site=NWS&issuedby=EWX&product=FFW&format=CI&version=1&glossary=1",
             {"event": "Flash Flood Warning FF.W.0108, Hill Country, Texas",
              "issued": "7:46 PM CST Sun Nov 8, 2026 (2026-11-09T01:46:00Z)",
              "valid_until": "midnight CST Nov 9, 2026",
              "counties": "Edwards, northwestern Kinney, northeastern Val Verde, TX",
              "hazard": "Life threatening flash flooding, damage threat CONSIDERABLE",
              "source_of_report": "Emergency management reported",
              "impacts_reported": "Several roads flooded and closed incl. near US 377, SH 55 and CR 450; water rescue reported in Newby Hills subdivision along CR 450",
              "rainfall_in": "2 to 5 inches in past 24 to 36 hours, up to 1 additional inch possible",
              "polygon_lat_lon_sample": "30.29,-100.79 / 30.29,-99.85 / 29.51,-100.49 / 29.72,-101.15",
              "status": "primary NWS product, fetched directly"}),
    evidence("ev-nws-crp-afd-20261109", "system_output", "nws-crp-afd-2026-11-09-1304cst.txt",
             "text/plain", EXCERPT_CRP_AFD, sha_crp,
             "https://forecast.weather.gov/product.php?site=CAE&product=AFD&issuedby=CRP",
             {"event": "Area Forecast Discussion, Coastal Bend / South Texas",
              "issued": "1:04 PM CST Mon Nov 9, 2026",
              "excessive_rainfall_risk": "WPC Slight Risk, level 2 of 4, southern Coastal Bend, flash flooding possible",
              "coastal": "Minor coastal flooding through late tonight at high tide, up to 2.2 ft above MSL possible; Coastal Flood Advisory until 3 AM CST Tuesday",
              "watch_status_update": "Flash Flood Watch was allowed to expire in the afternoon update - earlier Monday it ran through noon CST",
              "status": "primary NWS product, fetched directly"}),
    evidence("ev-spc-day1-20261109", "other", "spc-day1-outlook-2026-11-09-1300z.txt",
             "text/plain", EXCERPT_SPC, sha_spc,
             "https://www.spc.noaa.gov/products/outlook/day1otlk_1300_prt.html",
             {"event": "SPC Day 1 Convective Outlook, Mon Nov 9, 2026",
              "issued": "0640 AM CST Mon Nov 09 2026, valid 1300Z Nov 9 - 1200Z Nov 10",
              "severe_forecast": "NO SEVERE THUNDERSTORM AREAS FORECAST; organized severe thunderstorms are not forecast through tonight",
              "south_texas_note": "Generally elevated thunderstorms ongoing this morning across parts of south TX",
              "classification_warning": "This event is a flood event, not a severe convective (tornado/hail/wind) event. SPC says no severe thunderstorms - a system that labels this as roof/hail damage evidence would be misclassifying it.",
              "status": "primary SPC product, fetched directly"}),
    evidence("ev-wpc-ero-20261109", "system_output", "wpc-excessive-rainfall-discussion-2026-11-09.txt",
             "text/plain", EXCERPT_WPC, sha_wpc,
             "https://kamala.cod.edu/HPC/latest.fous30.KWBC.html",
             {"event": "WPC Excessive Rainfall Discussion, Day 1",
              "issued": "2:31 PM EST Mon Nov 9, 2026, valid 16Z Nov 9 - 12Z Nov 10",
              "risk": "Slight Risk of excessive rainfall across portions of far southeastern Texas",
              "soil_state": "NASA SPoRT-LIS 0-10 cm soil moisture >95th percentile region wide (saturated)",
              "rainfall_in": "4 to 9 inches already in the zone from SW Corpus Christi to about 50 miles east of Laredo; local totals 5 to 10 inches near Kingsville (observations + MRMS gauge-corrected data)",
              "status": "NWS WPC product via College of DuPage archive mirror"}),
    evidence("ev-wgrfc-rvf-llano-20261109", "system_output", "wgrfc-river-forecast-llano-2026-11-09.txt",
             "text/plain", EXCERPT_RVF_LLANO, sha_rvf,
             "https://forecast.weather.gov/product.php?site=LMK&product=RVF&issuedby=EWX",
             {"event": "River Forecast, Llano River at Llano, Texas",
              "issued": "12:45 PM CST Mon Nov 09 2026, West Gulf River Forecast Center",
              "latest_stage_ft": "4.2 ft at 1200 PM CST Nov 09",
              "flood_stage_ft": 10.0, "moderate_stage_ft": 12.0, "major_stage_ft": 23.0,
              "forecast_crest_ft": 11.3, "forecast_crest_when": "Nov 10, 2026 (crest line LLAT2 1110)",
              "meaning": "A second river system, in the Hill Country, is forecast to go above flood stage on Nov 10 - flooding continues after the rain warnings end",
              "status": "primary NWS product, fetched directly"}),
    evidence("ev-oso-creek-flood-warning", "system_output", "nws-crp-oso-creek-flood-warning-2026-11-09.txt",
             "text/plain", EXCERPT_OSO, sha_oso,
             "https://www.stormstation247.com/alerts/2026-kcrp-fl-w-0028",
             {"event": "Flood Warning, Oso Creek near Corpus Christi, Nueces County, TX",
              "stage_0615_cst_mon_ft": 10.4, "bankfull_ft": 11.0, "flood_stage_ft": 20.0,
              "forecast_crest_ft_this_product": 20.0, "forecast_crest_when": "just after midnight tonight (Nov 9-10)",
              "severity_this_product": "Moderate flooding forecast",
              "conflict": "Other same-day summaries of NWS products reported a crest near 23 ft late Monday night and a longer warning window (to Nov 11). Unresolved in this package.",
              "status": "secondary reproduction of an NWS Corpus Christi product (FL.W.0028); not a direct fetch"}),
    evidence("ev-usgs-oso-gauge-08211520", "other", "usgs-gauge-08211520-oso-creek-2026-11-09.txt",
             "text/plain", EXCERPT_USGS_OSO, sha_usgs,
             "https://snoflo.org/report/flow/texas/oso-ck-at-corpus-christi/",
             {"event": "USGS stream gauge 08211520, Oso Creek at Corpus Christi, TX",
              "date": "November 9, 2026",
              "flow_cfs": 132, "gage_height_ft": 10.48,
              "note": "Gage height 10.48 ft corroborates the 10.4 ft stage in the Oso Creek warning reproduction; described by the mirror as a major flow event, 4414% of median",
              "status": "USGS gauge data via SnoFlo mirror; not a direct USGS fetch in this build"}),
    evidence("ev-kerr-flood-advisory-20261109", "other", "kerrville-flood-advisory-2026-11-09.txt",
             "text/plain", EXCERPT_KERR, sha_kerr,
             "https://kerrvillebreaking.news/article/kerr-countys-risk-of-extreme-flood-increases-greatly-monday-know-your-plan",
             {"event": "Flood Advisory, Kerr County and Hill Country, Texas",
              "published": "Nov 9, 2026, 12:38 PM CT; updated 1:33 PM CT",
              "advisory": "Issued 8:17 AM Mon Nov 9 by NWS Austin/San Antonio, until 4 PM Monday, for Kerr plus Bandera, Edwards, Kinney, Medina, Real, Uvalde and Val Verde counties",
              "rainfall_monday_morning_in": "1 to 2 inches already, up to 2 more expected through the afternoon",
              "sunday_context": "NWS Flash Flood Warning for northwestern Kerr County on Sunday after 3 to 5 inches fell",
              "status": "local secondary source reporting NWS products"}),
]
ev_ids = [e["evidence_id"] for e in ev]

def audit_event(seq, eid, etype, actor, occurred, in_h, out_h, prev, details):
    evd = {"sequence": seq, "event_id": eid, "event_type": etype, "actor": actor,
           "occurred_at": occurred, "input_hash": in_h, "output_hash": out_h,
           "previous_event_hash": prev, "details": details}
    evd["event_hash"] = sha(canon(evd))
    return evd

e1 = audit_event(1, f"evt-{short}-ingested", "public_evidence_ingested", producer,
                 created, primary_sha, primary_sha, None,
                 {"claim_id": claim, "label": "PUBLIC / DEMO", "evidence_count": 8})
e2 = audit_event(2, f"evt-{short}-checked", "public_evidence_checked", producer,
                 "2026-11-09T22:45:01Z", primary_sha, sha(EXCERPT_SPC + EXCERPT_OSO),
                 e1["event_hash"],
                 {"parser_version": "public-demo-0.1.0", "evidence_count": 8,
                  "provenance_retained": True,
                  "conflicts_found": ["oso-crest-forecast-discrepancy", "spc-no-severe-vs-flood-hazard", "flood-watch-expired-while-river-warnings-continue"]})
e3 = audit_event(3, f"evt-{short}-package", "decision_package_emitted",
                 {"actor_type": "system", "actor_id": "claimflow-package-adapter",
                  "role": "package_builder", "runtime": "python"},
                 "2026-11-09T22:45:02Z",
                 sha(EXCERPT_SPC + EXCERPT_OSO), primary_sha,
                 e2["event_hash"],
                 {"schema_version": "0.2.0", "lifecycle_state": "evidence_ready",
                  "release_locked": True, "approval": "pending"})
events = [e1, e2, e3]

pkg = {
  "schema_version": "0.2.0",
  "package_id": package_id,
  "package_type": "claim_review",
  "lifecycle_state": "evidence_ready",
  "tenant_context": {
    "tenant_id": "public-demo", "principal_id": "user-demo-oliver",
    "isolation_mode": "application_filter",
    "storage_prefix": f"public-demo/claims/{claim}",
    "production_rls_required": True,
  },
  "trigger": {
    "event_type": "public_storm_event_sensed",
    "initiated_by": {"actor_type": "agent", "actor_id": "orpaynter-public-demo",
                     "role": "sense", "runtime": "python"},
    "occurred_at": "2026-11-09T01:46:00Z",
    "source_event_id": demo_label,
  },
  "objective": "PUBLIC / DEMO - NOT A REAL CLAIM. LIVE public-data case, Mon Nov 9, 2026: a multi-source, multi-office South Texas flood system (Nov 7-9) sensed through the globe/Overlay view - flash flood warnings, river flood warnings and forecasts, an excessive rainfall outlook, and a conflicting severe-weather classification - preserved with provenance in a DecisionPackage, then held. Approve for inspection only if a real property in this area were ever presented by a real owner. No filing, no repair, no payment, no contact with any owner. Nothing is authorised until matched evidence, correlation, two-layer validation, and human approval are complete.",
  "subject": {
    "domain": "insurance_claim_review", "entity_type": "claim", "entity_id": claim,
    "identity_assertions": [
      {"field": "claim_id", "normalized_value": claim, "evidence_refs": ["ev-nws-ewx-ffw-0108"], "status": "unverified"},
      {"field": "event_location", "normalized_value": "South and south-central Texas: Hill Country (Edwards, Kinney, Val Verde, Kerr and neighbouring counties) and Coastal Bend (Nueces, Kleberg, Duval, Webb and neighbouring counties)", "evidence_refs": ["ev-nws-ewx-ffw-0108", "ev-nws-crp-afd-20261109", "ev-kerr-flood-advisory-20261109"], "status": "unverified"},
      {"field": "event_type", "normalized_value": "Multi-day flood system, Nov 7-9, 2026: flash flooding (life-threatening, Hill Country), river flooding forecast (Llano River crest 11.3 ft Nov 10; Oso Creek crest at flood stage), minor coastal flooding; NOT a severe convective event per SPC", "evidence_refs": ["ev-nws-ewx-ffw-0108", "ev-wpc-ero-20261109", "ev-spc-day1-20261109"], "status": "unverified"},
    ],
  },
  "authority": {
    "mode": "read_only",
    "allowed_actions": ["extract public evidence", "record evidence and provenance", "emit evidence-ready package"],
    "prohibited_actions": ["approve claim review", "initiate payment", "release report", "alter source evidence", "file a claim", "contact any owner"],
    "requires_human_approval": True, "expires_at": expires,
  },
  "evidence": ev,
  "execution": {
    "run_id": f"public-demo-run-{primary_sha[:16]}",
    "orchestrator": "orpaynter-public-demo-adapter",
    "steps": [
      {"step_id": f"sense-step-{primary_sha[:16]}", "component": "public_sense",
       "version": "public-demo-0.1.0", "runtime": "python", "status": "succeeded",
       "started_at": created, "completed_at": "2026-11-09T22:45:01Z",
       "input_refs": ev_ids, "output_refs": ev_ids},
      {"step_id": f"package-step-{primary_sha[:16]}", "component": "document_ocr_decision_package_adapter",
       "version": "0.1.0", "runtime": "python", "status": "succeeded",
       "started_at": "2026-11-09T22:45:01Z", "completed_at": "2026-11-09T22:45:02Z",
       "input_refs": ev_ids, "output_refs": [package_id]},
    ],
    "input_bundle_hash": primary_sha,
    "output_bundle_hash": sha(EXCERPT_SPC + EXCERPT_OSO),
  },
  "policies": [
    {"policy_id": "orpaynter-public-demo-boundary-policy", "version": "0.1.0",
     "ruleset_hash": "1f7d0c0bcbf3b9c11e0e1036bb14868f87ca84ddaecb68f3a79f7ef7da15e95e",
     "rules": [
       {"rule_id": "public-data-only", "description": "Only public storm data may enter this demo package; no personal address, no named person, no specific property.", "condition": "non-public or personal data present", "effect": "block"},
       {"rule_id": "human-approval-required", "description": "No action, filing, payment or release without Oliver's yes.", "condition": "human approval missing", "effect": "require_approval"},
       {"rule_id": "correlation-required", "description": "Public evidence alone cannot authorize a claim recommendation or release.", "condition": "matched evidence or correlation missing", "effect": "hold"},
       {"rule_id": "validation-required", "description": "Two-layer DecisionPackage validation is required before approval or payment.", "condition": "validation status != passed", "effect": "hold"},
     ]},
  ],
  "risk_assessment": {
    "model": "deterministic-public-demo-boundary-risk", "model_version": "0.1.0",
    "overall_level": "high", "score": 0.65, "blocked": False,
    "signals": [
      {"signal_id": "sig-source-hash", "type": "source_hash_present", "value": True, "threshold": True, "result": "pass", "evidence_refs": ev_ids},
      {"signal_id": "sig-multi-office-corroboration", "type": "independent_sources_agree_on_event", "value": 5, "threshold": 2, "result": "pass", "evidence_refs": ["ev-nws-ewx-ffw-0108", "ev-nws-crp-afd-20261109", "ev-wpc-ero-20261109", "ev-spc-day1-20261109", "ev-wgrfc-rvf-llano-20261109"]},
      {"signal_id": "sig-gauge-vs-warning-stage", "type": "gauge_stage_matches_warning_stage", "value": "10.48 ft gauge vs 10.4 ft warning stage", "threshold": "within 0.5 ft", "result": "pass", "evidence_refs": ["ev-usgs-oso-gauge-08211520", "ev-oso-creek-flood-warning"]},
      {"signal_id": "sig-crest-forecast-agreement", "type": "crest_forecasts_agree", "value": False, "threshold": True, "result": "flag", "evidence_refs": ["ev-oso-creek-flood-warning"]},
      {"signal_id": "sig-hazard-classification", "type": "hazard_classification_unambiguous", "value": False, "threshold": True, "result": "flag", "evidence_refs": ["ev-spc-day1-20261109", "ev-wpc-ero-20261109"]},
      {"signal_id": "sig-trae-contractor-score", "type": "trae_contractor_score", "value": 0, "threshold": 40, "result": "flag", "evidence_refs": ["ev-nws-ewx-ffw-0108"]},
      {"signal_id": "sig-matched-pair", "type": "matched_evidence_pair_present", "value": False, "threshold": True, "result": "flag", "evidence_refs": ["ev-nws-ewx-ffw-0108"]},
      {"signal_id": "sig-public-only", "type": "public_data_only", "value": True, "threshold": True, "result": "pass", "evidence_refs": ev_ids},
    ],
    "assessed_at": "2026-11-09T22:45:02Z",
  },
  "conflicts": [
    {"conflict_id": f"conf-{primary_sha[:16]}-counterpart", "type": "missing_item", "severity": "warning",
     "description": "No real property, owner, or matched counterpart estimate is attached; correlation cannot begin. By design in a public demo.",
     "evidence_refs": ev_ids, "status": "open"},
    {"conflict_id": f"conf-{primary_sha[:16]}-oso-crest", "type": "other", "severity": "material",
     "description": "Oso Creek crest forecasts disagree between same-day summaries of NWS products: 20.0 ft just after midnight (warning reproduction, FL.W.0028) versus near 23 ft late Monday night in other summaries, with different warning end times (Tuesday evening vs Nov 11). The package does not pick a winner; a live run would have to re-fetch the current NWS product and use only that one.",
     "evidence_refs": ["ev-oso-creek-flood-warning"], "status": "open"},
    {"conflict_id": f"conf-{primary_sha[:16]}-classification", "type": "other", "severity": "material",
     "description": "Hazard classification conflict: SPC Day 1 (Nov 9) says NO severe thunderstorm areas forecast, while WPC/NWS flood products say flash and river flooding is occurring and forecast. Both are right about different hazards. This package classifies the event as FLOOD only; it must not be used as hail/wind/tornado or roof-damage evidence.",
     "evidence_refs": ["ev-spc-day1-20261109", "ev-wpc-ero-20261109", "ev-nws-ewx-ffw-0108"], "status": "open"},
    {"conflict_id": f"conf-{primary_sha[:16]}-watch-timing", "type": "other", "severity": "info",
     "description": "Temporal evolution, not a contradiction: the South Texas Flood Watch ran through noon CST Mon Nov 9 and was allowed to expire in the Corpus Christi afternoon discussion, while river flood warnings/forecasts (Oso Creek, Llano River crest Nov 10) continue after it. The globe view must show items with their own valid times, not one event window.",
     "evidence_refs": ["ev-nws-crp-afd-20261109", "ev-wgrfc-rvf-llano-20261109", "ev-oso-creek-flood-warning"], "status": "open"},
  ],
  "decision": {
    "decision_id": f"decision-{primary_sha[:16]}-hold",
    "decision_type": "hold_pending_human_approval", "outcome": "hold",
    "rationale": "PUBLIC / DEMO. LIVE multi-source flood evidence and provenance succeeded, and two hard problems were caught and held open instead of smoothed over (Oso Creek crest disagreement; flood-vs-severe classification). A consequential claim decision is still prohibited until a real property and owner exist, matched evidence, deterministic correlation, two-layer validation, and human approval are complete. Recommendation: approve for inspection only, if a real property in this area were ever presented by a real owner.",
    "evidence_refs": ev_ids,
    "policy_refs": ["orpaynter-public-demo-boundary-policy@0.1.0"],
    "conflict_refs": [f"conf-{primary_sha[:16]}-counterpart", f"conf-{primary_sha[:16]}-oso-crest", f"conf-{primary_sha[:16]}-classification", f"conf-{primary_sha[:16]}-watch-timing"],
    "authority_exercised": "record_evidence_and_hold",
    "decided_at": "2026-11-09T22:45:02Z",
  },
  "approvals": [
    {"approval_id": f"approval-{primary_sha[:16]}-pending", "gate": "claim_review_approval",
     "status": "pending",
     "approver": {"actor_type": "human", "actor_id": "unassigned-reviewer", "role": "claims_reviewer"},
     "approved_at": None,
     "notes": "Approval is unavailable until a real property/owner exists and correlation and two-layer validation pass. Oliver's yes to THIS package (scenario 3) is the gate - his yeses to scenarios 1 and 2 do not carry over.",
     "evidence_refs": ev_ids,
     "attestation_hash": sha(canon({"package_id": package_id, "gate": "claim_review_approval", "status": "pending"}))},
  ],
  "commerce": {
    "required": False,
    "amount": {"amount_minor": 0, "currency": "USD"},
    "idempotency_key": f"inactive:{package_id}",
    "checkout_session_id": None, "payment_intent_id": None, "webhook_event_id": None,
    "status": "not_required", "durable_record_ref": None,
  },
  "release_gate": {
    "requirements": [
      {"requirement_id": "matched-evidence", "description": "Carrier and contractor evidence belong to the same claim.", "status": "pending", "evidence_ref": "ev-nws-ewx-ffw-0108"},
      {"requirement_id": "correlation-complete", "description": "Deterministic correlation has completed.", "status": "pending", "evidence_ref": None},
      {"requirement_id": "two-layer-validation", "description": "Structural and semantic validation passed.", "status": "pending", "evidence_ref": None},
      {"requirement_id": "human-approved", "description": "A role-gated reviewer approved the package.", "status": "pending", "evidence_ref": None},
      {"requirement_id": "payment-verified", "description": "The required payment was verified after approval.", "status": "pending", "evidence_ref": None},
    ],
    "status": "locked", "released_artifact_ref": None, "released_at": None,
  },
  "recovery": {
    "kill_switch": {"endpoint": "POST /claims/reviews/{id}/kill", "auth_required": True,
                    "reason_required": True, "current_status": "armed",
                    "last_test": {"mode": "dry_run", "tested_at": "2026-11-09T22:45:02Z",
                                  "result": "not_run", "observed_effects": []}},
    "rollback_manifest": {"reversible": True,
      "preconditions": ["report has not been released", "no payment has been initiated"],
      "steps": ["mark package killed", "lock downstream transitions", "preserve evidence", "append kill reason"],
      "irreversible_effects": ["audit events remain append-only"]},
  },
  "audit": {
    "ledger_type": "hash_chained_jsonl", "events": events,
    "chain_head_hash": events[-1]["event_hash"],
    "query_keys": ["package_id", "claim_id", "tenant_id", "source_sha256", "lifecycle_state"],
  },
  "portability": {
    "profile": "orpaynter-decision-package-claimflow-v0.2",
    "source_runtime": "python-public-demo", "tested_target_runtimes": [],
    "export_bundle_hash": sha(canon(ev)),
    "external_standard_mappings": [],
  },
  "created_at": created, "updated_at": created,
}

seal = sha(canon(pkg))
wrapper = {
  "label": "PUBLIC / DEMO - NOT A REAL CLAIM",
  "demo_label": demo_label,
  "schema": "https://schemas.orpaynter.com/decision-package/v0.2/decision-package.schema.json",
  "schema_version": "0.2.0",
  "package_hash": seal,
  "package_hash_method": "SHA-256 of canonical JSON (sort_keys, compact separators) of the 23-field package object, same method as claimflow/trae/decision_package.py seal_package(); recorded alongside the package because v0.2 has no package_hash field. This is the pre-approval package hash, NOT a sealed receipt - no approval has been given to scenario 3.",
  "scenario": 3,
  "event_window": "2026-11-07 to 2026-11-09 (live on 2026-11-09)",
  "first_scenario_package_id": "37c1fce8-e2b9-580e-b783-2c2010736e48",
  "second_scenario_package_id": "fda2704f-987c-5f0f-91a2-56850e7b8adb",
  "approval_status": "PENDING - Oliver has not said yes to scenario 3",
  "package": pkg,
}
out = SCRATCH / "decision_package_v02_scenario3.json"
out.write_text(json.dumps(wrapper, indent=2) + "\n")

errors = []
try:
    import jsonschema
    schema = json.loads(SCHEMA.read_text())
    v = jsonschema.Draft202012Validator(schema)
    errors = sorted(v.iter_errors(pkg), key=lambda e: list(e.path))
    print("schema errors:", len(errors))
    for e in errors:
        print(" -", list(e.path), e.message)
except Exception as exc:
    print("validation skipped:", exc)

reloaded = json.loads(out.read_text())
assert reloaded["package_hash"] == sha(canon(reloaded["package"])), "seal mismatch"
for e in reloaded["package"]["evidence"]:
    assert e["sha256"] == sha(e["raw_text_excerpt"]), f"evidence hash mismatch {e['evidence_id']}"
chain = reloaded["package"]["audit"]["events"]
prev = None
for evd in chain:
    assert evd["previous_event_hash"] == prev, "chain break"
    h = evd.pop("event_hash")
    assert sha(canon(evd)) == h, "event hash mismatch"
    evd["event_hash"] = h
    prev = h
assert chain[-1]["event_hash"] == reloaded["package"]["audit"]["chain_head_hash"]
assert reloaded["package"]["approvals"][0]["status"] == "pending"
assert len(chain) == 3, "no approval event may exist in a pending package"
print("package_id:", package_id)
print("package_hash (pre-approval):", seal)
print("evidence sha (primary, EWX FF.W.0108):", primary_sha)
print("evidence items:", len(ev))
print("audit head:", chain[-1]["event_hash"])
print("fields:", len(pkg), "- required 23")
print("REVERIFIED OK - approval PENDING, not sealed")
