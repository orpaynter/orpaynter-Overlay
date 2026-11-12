#!/usr/bin/env python3
"""Build scenario 4: Ohio Valley severe hail/wind event, Wed Nov 11 2026 — LIVE today.
v0.2 DecisionPackage, approval PENDING. Mirrors build_scenario3.py structure/method.
Evidence sha256 = SHA-256 of the recorded excerpt text.
Seal = SHA-256 of canonical JSON (sort_keys, compact separators) of the 23-field package.
Audit event_hash = SHA-256 of canonical JSON of event dict excluding event_hash,
chained via previous_event_hash. Package_id = uuid5(NAMESPACE_URL,
"orpaynter:claimflow:public-demo:demo-ohio-valley-severe-2026-11-11:<primary sha>").
Sources verified 2026-11-12 ~02:12-02:30 UTC from primary NWS/SPC products where
available; secondary reproductions are labelled as such in the evidence items.
PUBLIC / DEMO only. No real claim, no filing, no payment, $0.
NOT run on a live AIA runtime — workflow is MAPPED to the FUSION_MANIFEST spine
and the six-stage governed pipeline, not executed by a hosted AIA runtime.
"""
import hashlib, json, shutil, uuid
from pathlib import Path

SCRATCH = Path.home() / "workspace/.jarvis/idea-executions/closed-loop-public-demo/scratch"
SCHEMA = SCRATCH / "repos/AIA_decision_package_schema_v02.json"

def sha(text: str) -> str:
    return hashlib.sha256(text.encode()).hexdigest()

def canon(obj) -> str:
    return json.dumps(obj, sort_keys=True, separators=(",", ":"))

# --- Evidence excerpts (recorded from sources, see scenario4 notes) ---
EXCERPT_SPC_1300 = (
    "Day 1 Convective Outlook, NWS Storm Prediction Center Norman OK, "
    "0655 AM CST Wed Nov 11 2026 (ACUS01 KWNS 111257), valid 111300Z - 121200Z. "
    "THERE IS A MARGINAL RISK OF SEVERE THUNDERSTORMS FROM PARTS OF EASTERN "
    "ILLINOIS INTO INDIANA, WESTERN/CENTRAL KENTUCKY, AND MIDDLE TENNESSEE. "
    "Thunderstorms capable of producing isolated hail, damaging winds, and "
    "perhaps a tornado may occur this afternoon and evening across parts of "
    "eastern Illinois into Indiana, western/central Kentucky, and middle "
    "Tennessee. Surface-based thunderstorms expected to initially develop "
    "over eastern IL by 18-21Z. Weak but potentially sufficient MLCAPE and "
    "30-40 kt of deep-layer shear should support updraft organization; a mix "
    "of clusters and marginal supercells expected. Main uncertainty and likely "
    "limiting factor: shallow/limited low-level moisture ahead of the front, "
    "dewpoints generally in the 30s to mid 40s. Modestly enhanced low-level "
    "shear may also support a tornado risk, especially if a supercell can "
    "develop and be sustained."
)
EXCERPT_SPC_2000 = (
    "Day 1 Convective Outlook, NWS Storm Prediction Center Norman OK, "
    "0200 PM CST Wed Nov 11 2026 (SPC AC 112000), valid 112000Z - 121200Z. "
    "THERE IS A SLIGHT RISK OF SEVERE THUNDERSTORMS ACROSS PARTS OF "
    "CENTRAL/SOUTHERN INDIANA, WESTERN KENTUCKY, AND FAR SOUTHEASTERN "
    "ILLINOIS. Thunderstorms capable of producing severe hail, damaging "
    "winds, and perhaps a tornado are forecast this afternoon and evening. "
    "20Z Update: A Slight Risk was introduced for parts of central/southern "
    "IN, western KY, and far southeastern IL, driven by 15-percent hail and "
    "wind probabilities. As lower 50s dewpoints (along/ahead of the cold "
    "front) continue spreading eastward beneath steepening midlevel lapse "
    "rates, a corridor of 500-1000 J/kg MLCAPE should support a gradual "
    "increase in updraft intensity this afternoon into the evening. "
    "Scattered severe hail (around 1-1.5 inches in diameter) and damaging "
    "wind gusts are capable of occurring. See MCD #2449 for more details. "
    "Modestly enhanced low-level shear may also support a low-probability "
    "tornado risk."
)
EXCERPT_MD2449 = (
    "Mesoscale Discussion 2449, NWS Storm Prediction Center Norman OK, "
    "0120 PM CST Wed Nov 11 2026, valid 111920Z - 112145Z. Areas affected: "
    "far eastern Illinois into Indiana and Kentucky. Concerning: Severe "
    "potential, Watch possible. Probability of Watch Issuance: 40 percent. "
    "Summary: Storms are expected to develop over eastern IL, spreading "
    "east/southeast through early evening. Locally severe hail and wind are "
    "most likely. Most probable peak intensity: hail 1.00-1.75 inches, "
    "tornado up to 90 mph, wind up to 60 mph. Surface observations show "
    "dewpoints in the 50s F, with a low pressure system over northern "
    "Illinois and radar echoes developing near it. This is a reproduction "
    "of the SPC graphic/product as shared via social media and a storm-news "
    "archive, not a direct spc.noaa.gov fetch in this build."
)
EXCERPT_WATCH704 = (
    "Severe Thunderstorm Watch 704, National Weather Service Indianapolis IN, "
    "Wed Nov 11 2026, in effect until 11 PM EST / 10 PM CST this evening. "
    "This watch includes 9 counties in south central Indiana (Clark, Crawford, "
    "Dubois, Floyd, Harrison, Orange, Perry, Scott, Washington) and 6 counties "
    "in central Kentucky. The watch graphic issued with it listed: a couple of "
    "tornadoes possible, scattered hail up to ping-pong size possible, scattered "
    "gusts up to 70 mph possible, with a potential exposure of 3,855,596 people, "
    "1,092 schools and 91 hospitals in the affected area. Watch county "
    "notifications later the same evening cancelled the watch county by county: "
    "7:31 PM EST cancelled 9 counties in central Indiana including Hancock, "
    "Johnson, Marion and Morgan; 7:54 PM EST cancelled 5 counties including "
    "Bartholomew, Rush and Shelby; 8:28 PM EST cancelled 3 counties including "
    "Decatur and Jackson. Reproduced by an Indiana weather site from NWS "
    "Indianapolis watch county notification products."
)
EXCERPT_PAH = (
    "Severe Thunderstorm Warnings, National Weather Service Paducah KY, "
    "Wed Nov 11 2026, southwestern Indiana and northwestern Kentucky. "
    "At 6:23 PM CST, quarter size hail was reported in Maceo, Kentucky. "
    "At 6:25 PM CST, a severe thunderstorm was located near Knottsville, or "
    "6 miles southeast of Rockport, moving east at 35 mph. HAZARD: 60 mph "
    "wind gusts and quarter size hail. SOURCE: Broadcast media reported. "
    "At 6:27 PM CST, a severe thunderstorm was located 5 miles southeast of "
    "Waitman, or 9 miles southwest of Hawesville, moving east at 35 mph. "
    "HAZARD: 60 mph wind gusts and quarter size hail. SOURCE: Trained spotters "
    "reported 1.0 inch hail near Maceo in eastern Daviess County. IMPACT: "
    "Hail damage to vehicles is expected. Expect wind damage to roofs, "
    "siding, and trees. At 6:45 PM CST, a severe thunderstorm was located "
    "over Rockport, moving east at 30 mph. HAZARD: 60 mph wind gusts and "
    "quarter size hail, for southwestern Spencer County in southwestern "
    "Indiana and northeastern Daviess County in northwestern Kentucky, "
    "until 7:30 PM CST. Reproduced by an Indiana weather site from NWS "
    "Paducah warning products."
)
EXCERPT_ILN = (
    "Special Weather Statements and Severe Weather Statement, National "
    "Weather Service Wilmington OH, Wed Nov 11 2026, as archived by NOAA "
    "READY. Special Weather Statement 8:02 PM EST: a strong thunderstorm "
    "will impact south central Fayette County in east central Indiana and "
    "northeastern Ripley, Franklin and northwestern Dearborn counties in "
    "southeastern Indiana until 8:30 PM EST. At 8:02 PM EST, radar was "
    "tracking a strong thunderstorm near Oldenburg, moving east at 25 mph. "
    "HAZARD: Wind gusts up to 45 mph and half inch size hail. SOURCE: Radar "
    "indicated. MAX HAIL SIZE: 0.50 IN. MAX WIND GUST: 45 MPH. Locations "
    "include Batesville, Brookville, Oldenburg, Sunman and Metamora. "
    "Special Weather Statement 8:20 PM EST: a strong thunderstorm 5 miles "
    "southeast of Versailles, moving east at 50 mph, gusts up to 50 mph "
    "and pea size hail. Severe Weather Statement 8:36 PM EST: Severe "
    "Thunderstorm Warning SV.W.0288 is CANCELLED for northern Dearborn, "
    "south central Franklin and northeastern Ripley counties; the storm "
    "which prompted the warning has weakened below severe limits. Earlier "
    "the same day, the NWS Wilmington Hazardous Weather Outlook (12:09 AM "
    "EST) said the probability for widespread hazardous weather was low "
    "and spotter activation was not expected."
)
EXCERPT_INDYSTAR = (
    "IndyStar live weather blog, Wed Nov 11 2026, evening. A line of strong "
    "to severe thunderstorms was expected to pass through the Indianapolis "
    "area the evening of Nov 11, according to the National Weather Service. "
    "The system could produce winds of up to 60 mph and hail up to an inch "
    "in diameter. The risk of a tornado is low, but not nonexistent, NWS "
    "meteorologist Chad Swain said. Indianapolis will remain under a severe "
    "thunderstorm watch through at least 11 p.m. A special weather statement "
    "urged people to seek shelter from the possibility of strong winds and "
    "nickel-sized hail until at least 7 p.m. As the storm moved into "
    "Hendricks County, a special weather statement cautioned residents of "
    "winds over 50 mph and half-inch hail in Brownsburg, Lebanon and "
    "Danville through at least 6:15 p.m. A cell that triggered a tornado "
    "warning in western Indiana was moving south and weakening as of about "
    "5:45 p.m., Swain said. A special weather statement issued 7:31 PM ET "
    "for Columbus, Seymour and Bedford: at 7:21 p.m., radar detected a line "
    "of strong storms from about Greensburg to Bedford moving east at 45 mph, "
    "with winds over 40 mph and half-inch hail. Local news source reporting "
    "NWS products and an NWS meteorologist."
)
EXCERPT_LMK_BRIEF = (
    "NWS Louisville KY briefing slide, Wed Nov 11 2026, 3:32 PM EST, as "
    "shared by the NWS Louisville office on its official Facebook page. "
    "Headline: Showers and Isolated Storms This Evening. Subtitle: Low "
    "Threat of Stronger Winds. Key messages: showers and isolated "
    "thunderstorms ahead of a cold front over the Ohio Valley; a newly "
    "added Level 2 (Slight) risk for gusty winds and hail; main impacts of "
    "strong gusty winds up to 60 mph and near-severe quarter-size hail. "
    "Confidence in strong storms is marked as Low. The outlook map shows a "
    "yellow Level 2 Slight area covering western Kentucky and southern "
    "Indiana, and a darker green Level 1 Marginal area to the east."
)

sha_spc1300 = sha(EXCERPT_SPC_1300)
sha_spc2000 = sha(EXCERPT_SPC_2000)
sha_md2449 = sha(EXCERPT_MD2449)
sha_watch = sha(EXCERPT_WATCH704)
sha_pah = sha(EXCERPT_PAH)
sha_iln = sha(EXCERPT_ILN)
sha_indy = sha(EXCERPT_INDYSTAR)
sha_lmk = sha(EXCERPT_LMK_BRIEF)
primary_sha = sha_pah

package_id = str(uuid.uuid5(uuid.NAMESPACE_URL,
    f"orpaynter:claimflow:public-demo:demo-ohio-valley-severe-2026-11-11:{primary_sha}"))
created = "2026-11-12T02:30:00Z"
expires = "2026-11-13T02:30:00Z"
claim = "demo-ohio-valley-severe-2026-11-11"
demo_label = "DP-PUBLIC-DEMO-2026-11-11-OHIO-VALLEY-SEVERE"
short = "ohio-valley-severe-261111"

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
    evidence("ev-spc-day1-1300z-20261111", "system_output", "spc-day1-outlook-2026-11-11-1300z.txt",
             "text/plain", EXCERPT_SPC_1300, sha_spc1300,
             "https://forecast.weather.gov/product.php?site=FGF&issuedby=DY1&product=SWO&format=TXT&version=4&glossary=1",
             {"event": "SPC Day 1 Convective Outlook, Wed Nov 11, 2026 (1300Z issue)",
              "issued": "0655 AM CST Wed Nov 11 2026, valid 111300Z - 121200Z",
              "risk": "MARGINAL RISK of severe thunderstorms from parts of eastern Illinois into Indiana, western/central Kentucky, and middle Tennessee",
              "hazards": "Isolated hail, damaging winds, and perhaps a tornado this afternoon and evening",
              "development": "Surface-based thunderstorms initially over eastern IL by 18-21Z; MLCAPE weak but potentially sufficient; 30-40 kt deep-layer shear",
              "limiting_factor": "Shallow/limited low-level moisture ahead of the front; dewpoints generally in the 30s to mid 40s",
              "status": "primary SPC product, fetched directly"}),
    evidence("ev-spc-day1-2000z-20261111", "system_output", "spc-day1-outlook-2026-11-11-2000z.txt",
             "text/plain", EXCERPT_SPC_2000, sha_spc2000,
             "https://westtennesseestormtrackers.net/severe/",
             {"event": "SPC Day 1 Convective Outlook, Wed Nov 11, 2026 (2000Z update)",
              "issued": "0200 PM CST Wed Nov 11 2026, valid 112000Z - 121200Z",
              "risk": "SLIGHT RISK of severe thunderstorms across parts of central/southern Indiana, western Kentucky, and far southeastern Illinois - an upgrade from the morning Marginal Risk",
              "probabilities": "15-percent hail and wind probabilities drove the Slight Risk",
              "hail_forecast_in": "Scattered severe hail around 1-1.5 inches in diameter",
              "instability": "Corridor of 500-1000 J/kg MLCAPE as lower 50s dewpoints spread eastward",
              "tornado": "Low-probability tornado risk",
              "status": "SPC product as reproduced by a storm-tracker site; not a direct spc.noaa.gov fetch in this build"}),
    evidence("ev-spc-md2449-20261111", "other", "spc-mesoscale-discussion-2449-2026-11-11.txt",
             "text/plain", EXCERPT_MD2449, sha_md2449,
             "https://stormnews.org/news/what-is-a-blizzard-official-criteria-and-where-they-hit-the-most",
             {"event": "SPC Mesoscale Discussion 2449, Wed Nov 11, 2026",
              "issued": "0120 PM CST Wed Nov 11 2026, valid 111920Z - 112145Z",
              "areas": "Far eastern Illinois into Indiana and Kentucky",
              "watch_probability": "40 percent, Watch possible",
              "development": "Storms expected to develop over eastern IL, spreading east/southeast through early evening; locally severe hail and wind most likely",
              "peak_hail_in": "1.00-1.75 inches (most probable peak intensity)",
              "peak_wind_mph": 60, "peak_tornado_mph": 90,
              "status": "SPC product as reproduced via the SPC graphic shared on social media and a storm-news archive; not a direct spc.noaa.gov fetch in this build"}),
    evidence("ev-nws-ind-watch704-20261111", "system_output", "nws-ind-severe-thunderstorm-watch-704-2026-11-11.txt",
             "text/plain", EXCERPT_WATCH704, sha_watch,
             "https://paulpoteet.com/category/weather/forecasts/indianas-weather/",
             {"event": "Severe Thunderstorm Watch 704, central/southern Indiana and central Kentucky",
              "issued": "Wed Nov 11, 2026, in effect until 11 PM EST / 10 PM CST",
              "counties_included": "9 counties south central Indiana (Clark, Crawford, Dubois, Floyd, Harrison, Orange, Perry, Scott, Washington) and 6 counties central Kentucky",
              "watch_graphic_hazards": "A couple of tornadoes possible; scattered hail up to ping-pong size possible; scattered gusts up to 70 mph possible",
              "watch_exposure": "Population 3,855,596; 1,092 schools; 91 hospitals in the affected area (per watch graphic)",
              "cancellations": "7:31 PM EST cancelled 9 central Indiana counties incl. Marion (Indianapolis); 7:54 PM EST cancelled 5 counties; 8:28 PM EST cancelled 3 counties incl. Decatur and Jackson",
              "status": "NWS Indianapolis watch county notification products as reproduced by an Indiana weather site; not a direct fetch in this build"}),
    evidence("ev-nws-pah-warnings-20261111", "system_output", "nws-pah-severe-warnings-2026-11-11.txt",
             "text/plain", EXCERPT_PAH, sha_pah,
             "https://paulpoteet.com/category/weather/forecasts/indianas-weather/",
             {"event": "NWS Paducah severe thunderstorm warnings, southwestern Indiana / northwestern Kentucky",
              "hail_report": "Trained spotters reported 1.0 inch hail near Maceo in eastern Daviess County, Kentucky; broadcast media reported quarter size hail in Maceo at 6:23 PM CST",
              "hazard": "60 mph wind gusts and quarter size hail",
              "roof_relevance": "Warning impact text: 'Hail damage to vehicles is expected. Expect wind damage to roofs, siding, and trees.'",
              "warnings": "Knottsville/Rockport storm 6:25 PM CST; Waitman/Hawesville storm 6:27 PM CST; Rockport storm 6:45 PM CST until 7:30 PM CST",
              "status": "NWS Paducah warning products as reproduced by an Indiana weather site; not a direct fetch in this build"}),
    evidence("ev-nws-iln-sps-svs-20261111", "system_output", "nws-iln-statements-2026-11-11.txt",
             "text/plain", EXCERPT_ILN, sha_iln,
             "https://www.ready.noaa.gov/ready2-bin/state.pl?product=spwx&state=oh",
             {"event": "NWS Wilmington OH statements, southeastern Indiana / southwestern Ohio, Wed Nov 11, 2026",
              "sps_802pm": "Strong thunderstorm near Oldenburg, IN, moving east 25 mph; gusts up to 45 mph, half inch hail; MAX HAIL SIZE 0.50 IN, MAX WIND GUST 45 MPH",
              "sps_820pm": "Strong thunderstorm 5 miles southeast of Versailles, moving east 50 mph; gusts up to 50 mph, pea size hail",
              "svs_836pm": "Severe Thunderstorm Warning SV.W.0288 CANCELLED for northern Dearborn, south central Franklin and northeastern Ripley counties; storm weakened below severe limits",
              "morning_outlook": "NWS Wilmington Hazardous Weather Outlook 12:09 AM EST said probability for widespread hazardous weather was low and spotter activation was not expected",
              "status": "primary NWS products via the NOAA READY archive"}),
    evidence("ev-indystar-live-20261111", "other", "indystar-live-blog-2026-11-11.txt",
             "text/plain", EXCERPT_INDYSTAR, sha_indy,
             "https://www.indystar.com/story/weather/indianapolis/2026/11/11/nws-warns-of-strong-to-severe-indianapolis-thunderstorms--live/92733853007/",
             {"event": "IndyStar live weather blog, Indianapolis, Wed Nov 11, 2026, evening",
              "forecast": "Line of strong to severe thunderstorms through Indianapolis evening; winds up to 60 mph, hail up to an inch; tornado risk low but not nonexistent (NWS meteorologist Chad Swain)",
              "hendricks_county": "Special weather statement: winds over 50 mph and half-inch hail in Brownsburg, Lebanon and Danville through at least 6:15 p.m.",
              "tornado_warning_cell": "A cell that triggered a tornado warning in western Indiana was moving south and weakening as of about 5:45 p.m.",
              "columbus_seymour_bedford": "7:31 PM ET statement: line Greensburg to Bedford moving east 45 mph, winds over 40 mph, half-inch hail",
              "status": "local news source reporting NWS products and an NWS meteorologist; not an NWS product itself"}),
    evidence("ev-nws-lmk-briefing-20261111", "system_output", "nws-lmk-briefing-2026-11-11.txt",
             "text/plain", EXCERPT_LMK_BRIEF, sha_lmk,
             "https://www.facebook.com/NWSLouisville/posts/pfbid02AETAo6uhiRwrmM5GX5GV9GvsJhwTnCBBpMN7nKPWKU3cBxu4qzVdkd1A6Y5bgL22l",
             {"event": "NWS Louisville KY briefing, Wed Nov 11, 2026",
              "issued": "3:32 PM EST Wed Nov 11, 2026",
              "headline": "Showers and Isolated Storms This Evening; Low Threat of Stronger Winds",
              "risk": "Newly added Level 2 (Slight) risk for gusty winds and hail",
              "impacts": "Strong gusty winds up to 60 mph and near-severe quarter-size hail",
              "confidence": "Low",
              "status": "NWS Louisville office briefing as shared on its official Facebook page; not a direct weather.gov fetch in this build"}),
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
                 "2026-11-12T02:30:01Z", primary_sha, sha(EXCERPT_SPC_2000 + EXCERPT_PAH),
                 e1["event_hash"],
                 {"parser_version": "public-demo-0.1.0", "evidence_count": 8,
                  "provenance_retained": True,
                  "conflicts_found": ["hail-size-forecast-vs-observed", "tornado-warning-no-confirmed-report", "risk-upgrade-morning-to-afternoon", "morning-low-probability-vs-evening-warnings"]})
e3 = audit_event(3, f"evt-{short}-package", "decision_package_emitted",
                 {"actor_type": "system", "actor_id": "claimflow-package-adapter",
                  "role": "package_builder", "runtime": "python"},
                 "2026-11-12T02:30:02Z",
                 sha(EXCERPT_SPC_2000 + EXCERPT_PAH), primary_sha,
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
    "occurred_at": "2026-11-12T00:23:00Z",
    "source_event_id": demo_label,
  },
  "objective": "PUBLIC / DEMO - NOT A REAL CLAIM. LIVE public-data case, Wed Nov 11, 2026: an Ohio Valley severe hail/wind event sensed through the globe/Overlay view - an SPC outlook upgraded Marginal to Slight during the day, Mesoscale Discussion 2449, Severe Thunderstorm Watch 704, NWS severe warnings with a spotter-reported 1.0-inch hail report near Maceo, Kentucky and warning text expecting wind damage to roofs, and a tornado-warning cell in western Indiana that was never confirmed as a tornado - preserved with provenance in a DecisionPackage, then held. Workflow MAPPED to the FUSION_MANIFEST spine (Sense, TRAE, Filter, Marketplace, Inspection with human gate, DecisionPackage) and to the AIA six-stage governed pipeline (Intake, Evidence, Analysis, Challenge, Risk, Audit/Synthesis) as a mapped workflow only: no hosted AIA runtime has ever been observed and no live AIA runtime executed this package. Approve for inspection only if a real property in this area were ever presented by a real owner. No filing, no repair, no payment, no contact with any owner. Nothing is authorised until matched evidence, correlation, two-layer validation, and human approval are complete.",
  "subject": {
    "domain": "insurance_claim_review", "entity_type": "claim", "entity_id": claim,
    "identity_assertions": [
      {"field": "claim_id", "normalized_value": claim, "evidence_refs": ["ev-nws-pah-warnings-20261111"], "status": "unverified"},
      {"field": "event_location", "normalized_value": "Ohio Valley: central and southern Indiana, western and central Kentucky, far southeastern Illinois, and southeastern Indiana / southwestern Ohio (NWS Indianapolis, Paducah, Louisville and Wilmington areas)", "evidence_refs": ["ev-spc-day1-1300z-20261111", "ev-nws-ind-watch704-20261111", "ev-nws-pah-warnings-20261111"], "status": "unverified"},
      {"field": "event_type", "normalized_value": "Severe hail/wind event, Wed Nov 11, 2026: scattered severe hail around 1-1.5 inches forecast, spotter-reported 1.0-inch hail near Maceo, KY, 60 mph wind gusts in warnings, a tornado-warning cell in western Indiana with no confirmed tornado, and a Severe Thunderstorm Watch 704; NOT a flood event and NOT a confirmed tornado event", "evidence_refs": ["ev-spc-day1-2000z-20261111", "ev-nws-pah-warnings-20261111", "ev-indystar-live-20261111"], "status": "unverified"},
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
       "started_at": created, "completed_at": "2026-11-12T02:30:01Z",
       "input_refs": ev_ids, "output_refs": ev_ids},
      {"step_id": f"package-step-{primary_sha[:16]}", "component": "document_ocr_decision_package_adapter",
       "version": "0.1.0", "runtime": "python", "status": "succeeded",
       "started_at": "2026-11-12T02:30:01Z", "completed_at": "2026-11-12T02:30:02Z",
       "input_refs": ev_ids, "output_refs": [package_id]},
    ],
    "input_bundle_hash": primary_sha,
    "output_bundle_hash": sha(EXCERPT_SPC_2000 + EXCERPT_PAH),
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
    "overall_level": "high", "score": 0.60, "blocked": False,
    "signals": [
      {"signal_id": "sig-source-hash", "type": "source_hash_present", "value": True, "threshold": True, "result": "pass", "evidence_refs": ev_ids},
      {"signal_id": "sig-multi-office-corroboration", "type": "independent_sources_agree_on_event", "value": 4, "threshold": 2, "result": "pass", "evidence_refs": ["ev-spc-day1-1300z-20261111", "ev-nws-ind-watch704-20261111", "ev-nws-pah-warnings-20261111", "ev-nws-iln-sps-svs-20261111"]},
      {"signal_id": "sig-hail-size-agreement", "type": "hail_size_forecast_vs_observed_agree", "value": False, "threshold": True, "result": "flag", "evidence_refs": ["ev-spc-md2449-20261111", "ev-spc-day1-2000z-20261111", "ev-nws-pah-warnings-20261111", "ev-nws-iln-sps-svs-20261111"]},
      {"signal_id": "sig-tornado-confirmed", "type": "tornado_confirmed_by_report", "value": False, "threshold": True, "result": "flag", "evidence_refs": ["ev-indystar-live-20261111", "ev-spc-day1-2000z-20261111"]},
      {"signal_id": "sig-watch-vs-warnings", "type": "warnings_issued_inside_watch_area", "value": True, "threshold": True, "result": "pass", "evidence_refs": ["ev-nws-ind-watch704-20261111", "ev-nws-pah-warnings-20261111"]},
      {"signal_id": "sig-trae-contractor-score", "type": "trae_contractor_score", "value": 0, "threshold": 40, "result": "flag", "evidence_refs": ["ev-nws-pah-warnings-20261111"]},
      {"signal_id": "sig-matched-pair", "type": "matched_evidence_pair_present", "value": False, "threshold": True, "result": "flag", "evidence_refs": ["ev-nws-pah-warnings-20261111"]},
      {"signal_id": "sig-public-only", "type": "public_data_only", "value": True, "threshold": True, "result": "pass", "evidence_refs": ev_ids},
    ],
    "assessed_at": "2026-11-12T02:30:02Z",
  },
  "conflicts": [
    {"conflict_id": f"conf-{primary_sha[:16]}-counterpart", "type": "missing_item", "severity": "warning",
     "description": "No real property, owner, or matched counterpart estimate is attached; correlation cannot begin. By design in a public demo.",
     "evidence_refs": ev_ids, "status": "open"},
    {"conflict_id": f"conf-{primary_sha[:16]}-hail-size", "type": "other", "severity": "material",
     "description": "Hail size numbers disagree between forecast and observed values: SPC Mesoscale Discussion 2449 gives a most probable peak of 1.00-1.75 inches, the SPC 2000Z outlook gives scattered severe hail around 1-1.5 inches, the Watch 704 graphic gives hail up to ping-pong size (1.5 inches), while the observed/reported values in the package are 1.0 inch from trained spotters near Maceo, KY and 0.50 inch radar-indicated near Oldenburg, IN (plus half-inch radar-indicated statements in central Indiana). Forecast peak and observed values are not reconciled, and at build time no SPC filtered storm-reports list for the evening of Nov 11 had been published. The package does not pick a winner.",
     "evidence_refs": ["ev-spc-md2449-20261111", "ev-spc-day1-2000z-20261111", "ev-nws-ind-watch704-20261111", "ev-nws-pah-warnings-20261111", "ev-nws-iln-sps-svs-20261111"], "status": "open"},
    {"conflict_id": f"conf-{primary_sha[:16]}-tornado", "type": "other", "severity": "material",
     "description": "Tornado warning versus no confirmed tornado: a cell triggered a tornado warning in western Indiana and was moving south and weakening as of about 5:45 p.m. (per the IndyStar live blog quoting an NWS meteorologist), and SPC products and Watch 704 list only a low/possible tornado risk (a couple possible in the watch graphic). No tornado report appears in any SPC product fetched at build time. This package records a tornado WARNING, not a tornado, and must not be used as tornado-damage evidence.",
     "evidence_refs": ["ev-indystar-live-20261111", "ev-spc-day1-2000z-20261111", "ev-nws-ind-watch704-20261111"], "status": "open"},
    {"conflict_id": f"conf-{primary_sha[:16]}-risk-upgrade", "type": "other", "severity": "info",
     "description": "Temporal evolution, not a contradiction: the morning SPC Day 1 outlook (0655 AM CST) was Marginal Risk and the NWS Wilmington Hazardous Weather Outlook (12:09 AM EST) said the probability for widespread hazardous weather was low with spotter activation not expected; by the 2000Z SPC update the risk was upgraded to Slight (15% hail and wind probabilities) and NWS Louisville added a Level 2 Slight risk, followed by Watch 704 and evening severe warnings. The globe view must show items with their own valid times, not one risk level for the day.",
     "evidence_refs": ["ev-spc-day1-1300z-20261111", "ev-spc-day1-2000z-20261111", "ev-nws-lmk-briefing-20261111", "ev-nws-iln-sps-svs-20261111", "ev-nws-ind-watch704-20261111"], "status": "open"},
  ],
  "decision": {
    "decision_id": f"decision-{primary_sha[:16]}-hold",
    "decision_type": "hold_pending_human_approval", "outcome": "hold",
    "rationale": "PUBLIC / DEMO. LIVE same-day severe hail/wind evidence and provenance succeeded, and two hard problems were caught and held open instead of smoothed over (forecast hail peak 1.00-1.75 inches versus observed 1.0 inch at Maceo and 0.50 inch radar-indicated at Oldenburg; a tornado warning in western Indiana with no confirmed tornado). A consequential claim decision is still prohibited until a real property and owner exist, matched evidence, deterministic correlation, two-layer validation, and human approval are complete. Recommendation: approve for inspection only, if a real property in this area were ever presented by a real owner.",
    "evidence_refs": ev_ids,
    "policy_refs": ["orpaynter-public-demo-boundary-policy@0.1.0"],
    "conflict_refs": [f"conf-{primary_sha[:16]}-counterpart", f"conf-{primary_sha[:16]}-hail-size", f"conf-{primary_sha[:16]}-tornado", f"conf-{primary_sha[:16]}-risk-upgrade"],
    "authority_exercised": "record_evidence_and_hold",
    "decided_at": "2026-11-12T02:30:02Z",
  },
  "approvals": [
    {"approval_id": f"approval-{primary_sha[:16]}-pending", "gate": "claim_review_approval",
     "status": "pending",
     "approver": {"actor_type": "human", "actor_id": "unassigned-reviewer", "role": "claims_reviewer"},
     "approved_at": None,
     "notes": "Approval is unavailable until a real property/owner exists and correlation and two-layer validation pass. Oliver's yes to THIS package (scenario 4) is the gate - his yeses to scenarios 1, 2 and 3 do not carry over.",
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
      {"requirement_id": "matched-evidence", "description": "Carrier and contractor evidence belong to the same claim.", "status": "pending", "evidence_ref": "ev-nws-pah-warnings-20261111"},
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
                    "last_test": {"mode": "dry_run", "tested_at": "2026-11-12T02:30:02Z",
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
  "package_hash_method": "SHA-256 of canonical JSON (sort_keys, compact separators) of the 23-field package object, same method as claimflow/trae/decision_package.py seal_package(); recorded alongside the package because v0.2 has no package_hash field. This is the pre-approval package hash, NOT a sealed receipt - no approval has been given to scenario 4.",
  "scenario": 4,
  "event_window": "2026-11-11 (live on 2026-11-11, built 2026-11-12T02:30:00Z)",
  "first_scenario_package_id": "37c1fce8-e2b9-580e-b783-2c2010736e48",
  "second_scenario_package_id": "fda2704f-987c-5f0f-91a2-56850e7b8adb",
  "third_scenario_package_id": "9499e23a-9e4a-55f9-ae6a-6765e062f773",
  "approval_status": "PENDING - Oliver has not said yes to scenario 4",
  "package": pkg,
}
out = SCRATCH / "decision_package_v02_scenario4.json"
out.write_text(json.dumps(wrapper, indent=2) + "\n")
pre = SCRATCH / "decision_package_v02_scenario4_pre_approval.json"
shutil.copyfile(out, pre)

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
print("evidence sha (primary, NWS Paducah warnings):", primary_sha)
print("evidence items:", len(ev))
print("audit head:", chain[-1]["event_hash"])
print("fields:", len(pkg), "- required 23")
print("REVERIFIED OK - approval PENDING, not sealed")
