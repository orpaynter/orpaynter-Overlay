# Authorized property pilot: operator runbook and decision record

## Scope and current decision

This is the bounded contracting/property proving ground for OrPaynter Overlay; it does not replace the broader platform direction. This repository contains source capture, owner-scoped GitHub metadata, analysis-only Grok, and local recovery code. It does **not** contain the AIA `agsi/infra/operational_store.py`, `agsi/core/swarm_build.py`, or `swarm_runtime.py` paths cited by the category review, nor a tenant-scoped property/customer store or a callable AIA pilot API. The existing public-source observations and local process journal are not substitutes for those systems.

The code in `src/lib/orpaynter/property-pilot.ts` checks evidence-record shape and cross-field invariants and reconstructs matched-task comparisons. A complete schema assessment is **not** authorization, proof of source authenticity, AIA validation, a durable receipt, or permission to execute. Its handoff state is deliberately always `blocked` and `executionEnabled` is always `false`; the app does not accept or persist pilot/customer records. AIA must remain the only authority for consequential work.

The local-only `GET /api/orpaynter/pilot/readiness` endpoint exposes this blocked capability state without accepting a payload. It is a readiness diagnostic, not an intake API.

**Integration decision:** no external repository, dependency, MCP connector, new event provider, or paid service was needed to close an acceptance clause that can be validated in this checkout. Existing USGS/NWS captures are public context only and do not bind an event to an authorized asset or establish damage. No third-party data rights are expanded. The current public CI run for the initial-plan revision was `action_required` with zero jobs, not a passing implementation check; rerun normal CI after repository authorization is restored.

**Service decision:** no provider, plan, price, or spending cap was supplied or approved. No subscription, free trial, metered model call, paid adapter, or customer outreach is enabled by this pilot slice. Pricing was not verified and is therefore not quoted. Existing non-pilot Grok behavior is unchanged; do not use it for a pilot record until a provider, plan, data handling, credentials, terms, and cost cap have explicit operator approval.

The historical review statement—“No external repository was integrated, new paid service enabled, or customer/market results manufactured during this review”—remains a statement about that original review, not a permanent prohibition. This implementation likewise added no such integration or service and has no live customer or market results.

## Owner-supplied prerequisites before intake

Do not put live values in this repository, tests, issues, PR comments, screenshots, logs, or public exports. Use the existing tenant-scoped AIA store and its access controls for live records. Before any live pilot:

1. Supply access to the actual AIA backend/API and its current contract, validation, approval, receipt, independent-verification, outcome-reconciliation and learning paths. Identify the accepted endpoint and test environment, and demonstrate tenant isolation and durable idempotency/restart behavior there. Do not treat mocked AIA behavior as integration.
2. Provide an authentic customer objective, the customer's informed consent, a named tenant and authorized intake actor, plus a prospective manual/GIS-plus-AI baseline and matched-task criteria. Do not invent a customer to fill this requirement.
3. Provide the property/asset identity, current evidence of the customer's authority over it, jurisdiction and permitted scope, the evidence custodian, validity/expiry and revocation process. An event-area intersection or storm exposure is not asset authority or damage evidence.
4. Identify an official event source and verify its publisher, record ID, URL, event/publication/update/retrieval timestamps, spatial reference, uncertainty, limitations, freshness and data rights. Keep source observation, inference and unknown distinct. Recheck the provider's current official API/schema documentation before adding any adapter.
5. Identify a bounded plan reviewer, the AIA policy revision and approval scope, the server-side credential owner and exact credential scope, and a distinct authorized outcome verifier. Never put credentials in a browser or this repository. Approval must bind the exact tenant, plan revision/hash, policy revision and scope and be revalidated after any material change.
6. Define prospective elapsed-time clock boundaries, coordination-time capture, labor and AI cost assumptions with currency/units, evidence-completeness rubric, uncertainty, failure/exclusion rules, and the recovery injection window. Retain original observations so the report can be reconstructed.
7. Approve any use of metered AI or another paid provider by naming provider, exact plan, spend cap and cadence, data handling, credential source and terms. Without all of these, paid pilot calls remain disabled.
8. Decide private retention, access, redaction, incident response and publication review with the customer. Obtain separate approval before any public report or quote.

## Operator procedure once prerequisites exist

1. **Consent and intake:** create a tenant-scoped record in AIA; record customer consent, actor identity, objective, authorized asset/property, evidence of authority, precise allowed scope and expiry. Reject absent/revoked consent and cross-tenant links.
2. **Baseline:** record current tools and a manual/GIS-plus-AI task using a prospective matched-task definition. Capture elapsed and human coordination times separately, cost assumptions, task outcome, evidence completeness, and missing values as `null`/unknown—not zero.
3. **Source check:** capture a current official event and its immutable source identity/timestamps/rights/spatial reference/uncertainty. Preserve raw source evidence in the approved private store. Label event exposure as context; do not infer property damage from a storm, imagery, catalog coverage or footprint.
4. **Plan:** allow bounded AI to draft only an inspectable, source-linked proposal. Treat every measurement assertion as unsupported unless inspected survey or LiDAR evidence includes CRS, uncertainty and an independent check. Rendering precision, imagery, public footprints and LiDAR catalogue coverage alone are not measurement evidence.
5. **Approval and action boundary:** use AIA's existing validation, policy, approval and receipt paths. Verify tenant, actor, scope, plan/policy revisions and approval freshness immediately before every consequential call. MCP availability or a generated plan does not grant authority. Keep real-world execution disabled until valid credentials, policy and scope are approved.
6. **Observe and reconcile:** record intended action, actual result, durable receipt and outcome evidence. Inject recoverable failures before and after operation/receipt boundaries in the AIA test environment. Resume only with durable idempotency evidence; if an external result is ambiguous, stop and enter reconciliation-required state rather than retrying blindly. Count only observed duplicate consequences. Do not claim universal exactly-once delivery or restoration of every real-world consequence.
7. **Independent verification:** have a separately authorized verifier inspect the result and evidence; the executor/agent cannot verify itself. Capture the verifier's identity/authority evidence, time, result and limitations.
8. **Second cycle:** use only provenance-linked, permitted learning to improve a draft or ordering. Revalidate the new plan. Learning may not alter policy, create approval, grant privileges or broaden tenant/property access.
9. **Compare and report:** retain matched baseline and pilot observations, failures, aborted tasks, exclusions with reasons, missing metrics, uncertainty and all cost units/assumptions. The report denominator consists only of completed, prospectively matched tasks with both coordination-time observations and a positive baseline. Per-task reduction is `(baseline - pilot) / baseline * 100`. Missing or zero baselines have no percentage. Keep elapsed time, cost, evidence completeness, unsupported claims, unauthorized actions and duplicate consequences separate and reconstructable.
10. **Redact and decide:** review privacy, evidence rights and customer publication consent before export. A missing flag in an unreviewed record is not independently established accuracy; an AIA receipt is not proof that every external consequence was recorded.

## Metrics, targets and category claims

Targets are prospective thresholds, never results: at least 50% less human coordination time on valid matched tasks; every consequential action authorized and receipted; zero unsupported measurement claims; zero duplicate consequences in the tested recovery cases. Keep the denominator, uncertainty, failures, aborted work and reasoned exclusions visible.

The initial repeat-use threshold is three independent customer teams, each using the workflow again over a complete work cycle. It is not statistical proof of category demand. Interviews or intent are not commitments. Willingness to pay requires authentic signed commitments and collected payment evidence, handled privately. Position this as an existing mapping/workflow/agent category unless independent customers repeatedly choose and pay for the workflow and can explain why alternatives are inadequate.

## Evidence and blocker matrix

| Requirement | State in this change | What this does not establish |
|---|---|---|
| Contract checks for consent, tenant binding, evidence freshness, plan claims, approval bindings, receipts, verification and learning limits | Implemented as pure record-shape/invariant assessment | Authentication, trustworthy evidence, actual AIA integration or authority |
| Matched-task report preserving raw metric records and missing/zero/failure/abort/exclusion cases | Implemented as a pure reconstruction helper | A live intake/export, complete cost analysis, or measured pilot performance |
| Focused invariant tests | Automated-tested with explicitly synthetic fixtures | Production AIA behavior, durable persistence, concurrency or real-world side effects |
| Sanitized example | Synthetic only; not a customer, property, event observation or pilot outcome | Customer consent, asset ownership, damage, market evidence or willingness to pay |
| Existing official event feeds | Existing public-source context only | Property authorization, event-to-asset binding, current source rights for a new use, or damage |
| AIA validation/approval/receipt/verification/learning path | Blocked: AIA source/backend is not in this checkout and no integration contract/credentials were supplied | Any AIA-specific passing clause |
| Tenant-scoped private record storage and operator intake | Blocked pending authorized AIA store/access controls | Safe acceptance of live/private payloads by Overlay |
| Customer baseline, property authorization, execution and outcome | Live-unvalidated; no customer records, credentials, consent or field outcomes supplied | Pilot launch or customer result |
| Durable idempotency, crash-window/concurrency/restart proof | Blocked pending tests against actual AIA durable store and authorized downstream test tool | Universal exactly-once execution or reversal of external effects |
| Three independent teams, repeat use, commitments and payment | No actual observed evidence supplied | Demand, category creation, revenue or market validation |
| Paid provider | Disabled for this pilot; no named approved provider/plan/cap | Current pricing or approved spending |

**Go/no-go:** no live intake, customer call, plan approval, real-world action, field dispatch, contract/payment, paid model call or public customer claim until the owner supplies and separately approves the relevant prerequisites above and the canonical AIA path passes its own acceptance tests.
