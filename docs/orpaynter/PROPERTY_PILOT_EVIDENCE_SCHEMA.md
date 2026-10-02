# Property pilot private evidence and report schema

This is a field specification for records held in the authorized tenant-scoped AIA store, **not** a repository storage format. `src/lib/orpaynter/property-pilot.ts` contains the local shape/invariant contract and intentionally does not accept or persist payloads. Never commit real records, credentials, property identifiers, signed consent, raw provider payloads, or customer reports here. The companion `PROPERTY_PILOT_SYNTHETIC_DEMO.json` is fabricated test data.

## Record schema

All identity and evidence references are tenant-scoped opaque IDs. Store private source payloads and signed authority/consent documents in the owner's approved AIA evidence store; retain only a reference, hash, access policy, and required metadata in a report. Missing values remain `null`/unknown and are never filled with zero or inferred.

| Field | Required for a complete record | Required content / handling |
|---|---|---|
| `tenantId`, `actorId` | Yes | Tenant and authenticated intake actor from AIA, not caller-supplied claims. |
| `consent` | Yes | Status, evidence reference, permitted consent scope and recorded time. Missing/revoked consent blocks intake. |
| `objective` | Yes | Genuine customer objective and private source reference; do not publish customer text by default. |
| `baseline` | Yes | Current manual/GIS-plus-AI tools, prospective match criteria, elapsed and coordination minutes, cost amount/currency and labor/AI assumptions. |
| `property` | Yes | Tenant, asset reference, authority-evidence reference, permitted scope and review/expiry/revocation status. A footprint or event-area intersection is not authority. |
| `event` | Yes | Official source ID, HTTPS URL, publisher, bound tenant asset reference, event/published/updated/retrieved times, CRS, uncertainty, limitations and use rights. Preserve observations separately from inference/unknown. |
| `plan` | Yes | Revision, policy revision, permitted scope, evidence IDs, proposed steps and typed claims. Link each assertion to evidence. |
| `approval` | Before consequence | Tenant, approver identity and separately bound authorized actor, exact plan and policy revisions, scope, approval/expiry/revocation times. Material change invalidates approval and requires AIA revalidation. |
| `actions[]` | For each consequence | Tenant/actor, exact policy/scope/plan/approval binding, durable AIA receipt ID, idempotency key, actual outcome or reconciliation-required state. Ambiguous external results are not retried blindly. |
| `verification` | After outcome | Distinct authorized verifier, tenant and asset, authority-evidence reference, outcome-evidence reference and timestamp. Executor or agent self-attestation is not independent verification. |
| `learning` | For second cycle | Verified outcome IDs, provenance, permitted use and target plan revision. It may inform drafts only; it cannot modify policy, create approval, grant privileges or broaden tenant/asset access. |

The local assessment checks required references, event freshness, tenant matches, unsupported measurement claims, approval revision/scope/expiry/revocation, receipt/idempotency fields, ambiguous outcomes, verifier independence, and learning escalation flags. These are record-shape checks only: an ID, boolean, URL, receipt field or completed test does **not** authenticate its source or prove authority. That verification remains with AIA and authorized humans.

Measurement assertion metadata includes method, inspection state, CRS, uncertainty and independent-check reference. Only inspected survey or inspected LiDAR inputs can satisfy the local measurement-shape check. Imagery, a public footprint, or catalogued LiDAR coverage alone is insufficient. Passing that check still requires source inspection and independent verification.

## Matched-task report schema

Each retained `MatchedTaskMetrics` record has a stable `taskId`, prospectively defined `matchKey`, outcome (`completed`, `failed`, `aborted`, or `excluded`), and a reason for each failure/abort/exclusion. It contains paired `baseline` and `pilot` observations:

- `elapsedMinutes` and `coordinationMinutes`;
- cost `{ amount, currency, laborAssumption, aiAssumption }`;
- evidence completeness `{ supported, required }`;
- `unsupportedClaims`, `unauthorizedActions`, and `duplicateConsequencesAfterFailure`.

Each measure can be unknown (`null`). Zero is valid only when actually observed and counted. Keep units/currency and assumptions per record; do not add incompatible currencies or impute costs. Preserve all paired source records in the export so an independent reviewer can reconstruct the result.

The current helper returns every raw record, denominator, failures, aborted tasks, exclusions/reasons, and per-task coordination reduction. The denominator includes only completed records with a match key and both coordination observations, where baseline coordination time is positive. Formula: `(baselineCoordinationMinutes - pilotCoordinationMinutes) / baselineCoordinationMinutes * 100`. Missing/zero baselines have a null result with a reason. No percentage is a pilot result unless backed by authentic, authorized records and reviewed comparisons.

Counts of unsupported claims, unauthorized actions and duplicate consequences are not inferred from absence of flags. A reviewer must establish the evidence sources and completeness. Receipts do not prove every external action was recorded. Recovery tests must identify injection point and observed consequences; do not promise universal exactly-once behavior or reversal of real-world consequences.
