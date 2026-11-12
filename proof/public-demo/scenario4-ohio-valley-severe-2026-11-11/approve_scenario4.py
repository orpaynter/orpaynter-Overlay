#!/usr/bin/env python3
"""Record Oliver's voice YES on scenario 4 (Ohio Valley severe hail/wind,
Nov 11, 2026) and seal it — mirroring approve_scenario3.py exactly.

Oliver said yes by voice on 2026-11-11 21:44 EST in direct answer to the
question "Want to seal Scenario 4 and put those pins up?" after having seen
the package and the full explainer earlier the same evening. Classified
under his approval rules as the SEAL yes for this package only; the
GitHub push / globe pins are a SEPARATE yes, not covered by this one and
NOT done here. approved_at = 2026-11-12T02:44:00Z.

Decision outcome stays "hold", lifecycle stays "evidence_ready",
release_gate stays "locked". This yes approves the demo proof only.
PUBLIC / DEMO, $0, 4 open conflicts unchanged.
"""
import hashlib, json, shutil, uuid
from pathlib import Path

SCRATCH = Path.home() / "workspace/.jarvis/idea-executions/closed-loop-public-demo/scratch"
SCHEMA = SCRATCH / "repos/AIA_decision_package_schema_v02.json"
SRC = SCRATCH / "decision_package_v02_scenario4.json"
PRE = SCRATCH / "decision_package_v02_scenario4_pre_approval.json"
RECEIPT_OUT = SCRATCH / "sealed_receipt_scenario4.json"
APPROVED_AT = "2026-11-12T02:44:00Z"
PACKAGE_ID = "d15f3476-ea82-53db-8042-2f894d6e22da"
OLD_SEAL = "05a9967370bcde6fe8964324b9daf4544423ce2b0fef1c4bd704bc264384f35b"

def sha(text: str) -> str:
    return hashlib.sha256(text.encode()).hexdigest()

def canon(obj) -> str:
    return json.dumps(obj, sort_keys=True, separators=(",", ":"))

assert PRE.exists(), "pre-approval copy must already exist"
wrapper = json.loads(SRC.read_text())
old_seal = wrapper["package_hash"]
pkg = wrapper["package"]
pre_head = pkg["audit"]["chain_head_hash"]
assert pkg["package_id"] == PACKAGE_ID
assert old_seal == OLD_SEAL, old_seal
assert pkg["approvals"][0]["status"] == "pending"
assert not RECEIPT_OUT.exists(), "receipt already exists - do not re-seal"

# --- Approval ---
attestation = sha(canon({"package_id": PACKAGE_ID,
                         "gate": "claim_review_approval", "status": "approved"}))
appr = pkg["approvals"][0]
appr["status"] = "approved"
appr["approver"] = {"actor_type": "human", "actor_id": "oliver-paynter", "role": "founder"}
appr["approved_at"] = APPROVED_AT
appr["notes"] = "approval given by voice"
appr["attestation_hash"] = attestation

# --- Audit event 4 ---
short = "24fc77b876d85a39"
event = {
    "sequence": 4,
    "event_id": f"evt-{short}-approved",
    "event_type": "human_approval_recorded",
    "actor": {"actor_type": "human", "actor_id": "oliver-paynter", "role": "founder"},
    "occurred_at": APPROVED_AT,
    "input_hash": old_seal,
    "output_hash": attestation,
    "previous_event_hash": pre_head,
    "details": {
        "channel": "voice",
        "decision": "yes",
        "gate": "claim_review_approval",
        "approver": "Oliver Paynter",
        "label": "PUBLIC / DEMO",
        "claim_id": "demo-ohio-valley-severe-2026-11-11",
        "attestation_hash": attestation,
    },
}
event["event_hash"] = sha(canon(event))
pkg["audit"]["events"].append(event)
pkg["audit"]["chain_head_hash"] = event["event_hash"]
pkg["updated_at"] = APPROVED_AT

assert pkg["decision"]["outcome"] == "hold"
assert pkg["lifecycle_state"] == "evidence_ready"
assert pkg["release_gate"]["status"] == "locked"
assert len(pkg["conflicts"]) == 4

new_seal = sha(canon(pkg))
wrapper["package_hash"] = new_seal
wrapper["package"] = pkg
wrapper["package_hash_method"] = (
    "SHA-256 of canonical JSON (sort_keys, compact separators) of the 23-field "
    "package object, same method as claimflow/trae/decision_package.py "
    "seal_package(); recorded alongside the package because v0.2 has no "
    "package_hash field"
)
wrapper["approval_status"] = (
    "APPROVED - Oliver said yes by voice on 2026-11-11 (21:44 EST) to "
    "sealing scenario 4; sealed receipt issued - see "
    "sealed_receipt_scenario4.json. GitHub push / globe pins NOT approved "
    "by this yes - separate yes required."
)
SRC.write_text(json.dumps(wrapper, indent=2) + "\n")

# --- Sealed receipt (same structure as sealed_receipt_scenario3.json) ---
evidence_list = [
    {"evidence_id": e["evidence_id"], "sha256": e["sha256"],
     "source_uri": e["source_locator"]["uri"]}
    for e in pkg["evidence"]
]
manifest_hash = sha(canon(evidence_list))
receipt_id = str(uuid.uuid5(uuid.NAMESPACE_URL,
    f"orpaynter:sealed-receipt:public-demo:{PACKAGE_ID}:{new_seal}"))
receipt = {
    "label": "PUBLIC / DEMO \u2014 NOT A REAL CLAIM",
    "receipt_id": receipt_id,
    "receipt_type": "sealed_receipt",
    "demo_label": "DP-PUBLIC-DEMO-2026-11-11-OHIO-VALLEY-SEVERE",
    "package_id": PACKAGE_ID,
    "package_hash": new_seal,
    "previous_package_hash": old_seal,
    "previous_receipt_hash": pre_head,
    "audit_chain_head_hash": event["event_hash"],
    "sealed_at": APPROVED_AT,
    "issued_at": APPROVED_AT,
    "approval": {
        "approver": "Oliver Paynter",
        "actor_type": "human",
        "actor_id": "oliver-paynter",
        "gate": "claim_review_approval",
        "decision": "yes",
        "channel": "voice",
        "approved_at": APPROVED_AT,
        "attestation_hash": attestation,
        "notes": "approval given by voice",
    },
    "evidence_summary": {
        "event": "Ohio Valley severe hail/wind, Wed Nov 11, 2026: SPC Slight Risk with 15% hail/wind, Severe Thunderstorm Watch 704, hail to 1.75 inches at Riley, Indiana and wind damage to 3-4 homes at 2 S Riley (SPC storm reports), across IN/KY/SE IL/SW OH",
        "sources": [
            "SPC Day 1 Convective Outlook 1300Z, Nov 11, 2026 (direct agency fetch)",
            "SPC Day 1 Convective Outlook 2000Z update, Nov 11, 2026 (agency product via reproduction)",
            "SPC Mesoscale Discussion 2449, Nov 11, 2026 (agency product via reproduction)",
            "NWS Indianapolis Severe Thunderstorm Watch 704, Nov 11, 2026 (agency product via reproduction)",
            "NWS Paducah warning text, Nov 11, 2026 (agency product via reproduction)",
            "NWS Wilmington OH statements via NOAA READY, Nov 11, 2026 (direct agency fetch)",
            "IndyStar live blog, Nov 11, 2026 (non-agency news; lede date typo noted, not relied on)",
            "NWS Louisville briefing, Nov 11, 2026 (agency product via reproduction)",
        ],
        "evidence_count": 8,
        "evidence": evidence_list,
        "evidence_manifest_hash": manifest_hash,
    },
    "commerce": {"required": False, "amount_minor": 0, "currency": "USD", "status": "not_required"},
    "scope": "PUBLIC / DEMO only. This receipt seals Oliver's voice approval of the public demo DecisionPackage as proof of loop steps 1-6. It does not file a claim, authorise a repair, initiate a payment, release a claim report, or clear GACC #128. No real property, owner, or matched claim evidence exists. The exact-locations addendum (9 SPC report points) and the Grok narrowing pack are companion materials, not part of this sealed package. GitHub push / globe pins require a separate yes and have NOT been done.",
    "limits": [
        "No Final Gate run (6 checks not run - no case, no matched evidence, no correlation).",
        "No live TRAE score - TRAE would return 0 with no contractor entity, below the 40 threshold.",
        "Release gate remains locked; the 5 release requirements are still pending.",
        "No live runtime - GACC #128 RED/BLOCKED; no AIA runtime was reachable and this package is not GACC evidence.",
        "Evidence is NOT all direct agency sourcing: 2 direct agency fetches, 5 agency products via reproductions, 1 non-agency news source (IndyStar), labelled as such in the package.",
        "4 conflicts held open and unresolved: no real property/owner by design; hail forecast vs observed (partly updated by the later SPC reports addendum, which is outside this package); a tornado warning in western Indiana with NO tornado report - package records warning only; risk upgraded through the day (temporal).",
        "Workflow was mapped through the AIA spine as a MAP only - it did NOT run on a live AIA runtime.",
    ],
}
receipt["receipt_hash"] = sha(canon(receipt))
RECEIPT_OUT.write_text(json.dumps(receipt, indent=2) + "\n")

# --- Independent re-verification ---
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

reloaded = json.loads(SRC.read_text())
assert reloaded["package_hash"] == sha(canon(reloaded["package"])), "seal mismatch"
assert reloaded["package"]["approvals"][0]["status"] == "approved"
assert reloaded["package"]["approvals"][0]["attestation_hash"] == attestation
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
assert len(chain) == 4

r2 = json.loads(RECEIPT_OUT.read_text())
rh = r2.pop("receipt_hash")
assert sha(canon(r2)) == rh, "receipt hash mismatch"
assert r2["evidence_summary"]["evidence_manifest_hash"] == sha(canon(r2["evidence_summary"]["evidence"]))

print("package_id:", PACKAGE_ID)
print("old seal:", old_seal)
print("new seal:", new_seal)
print("attestation:", attestation)
print("audit head:", event["event_hash"])
print("receipt_id:", receipt_id)
print("receipt_hash:", rh)
print("SEALED OK")
