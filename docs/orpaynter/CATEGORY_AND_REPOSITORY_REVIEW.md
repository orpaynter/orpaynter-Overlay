# OrPaynter category hypothesis and repository review

Reviewed October 1, 2026. This is a source review and product hypothesis, not market validation or a completed integration.

## Decision

Keep the ambition. Reject the claim that a globe, AI agents, or self-healing alone establishes a new category. The promising position is **AI operations for real-world work**: people choose an objective and place, inspect the evidence, coordinate bounded AI work, authorize consequences, and verify what actually happened. World Portal makes that chain navigable; AIA remains its authority spine. Contracting/property work is the first proving ground, not the company's ceiling.

The customer problem is fragmented coordination: world information, measurements, documents, AI drafts, approvals, execution and outcomes live in different tools. The hypothesis is that OrPaynter can reduce this coordination cost while preserving an independently reconstructable record. Affordability, reliability, demand and competitive superiority require measurement.

## Existing overlap

[Palantir Ontology](https://www.palantir.com/docs/foundry/ontology/overview) already connects data to real-world objects, digital twins, actions, granular security and operational workflows. [iTwin.js](https://www.itwinjs.org/) already combines BIM, reality, GIS and IoT data with 3D/4D visualization. [LangGraph](https://github.com/langchain-ai/langgraph) already provides durable agent execution, memory and human interrupts. These primary sources invalidate a broad first-globe-plus-AI-plus-recovery claim. This review is not an exhaustive novelty search or a comparison of vendor pricing/performance.

## Repository choices

| Repository | Useful contribution | Recommendation |
|---|---|---|
| [CesiumJS](https://github.com/CesiumGS/cesium) | 3D globe, terrain and streamed 3D Tiles/point clouds; Apache-2.0 core | First spatial candidate: an isolated asset detail view, using one licensed dataset and existing source IDs. Keep the working MapLibre surface. |
| [MCP Python SDK](https://github.com/modelcontextprotocol/python-sdk) | Standard server/client interface for tools, resources and prompts; MIT | Next connection candidate: authenticated, tenant-scoped AIA evidence as read-only resources before consequential tools. |
| [LangGraph](https://github.com/langchain-ai/langgraph) | Checkpoints, interrupts and resume for stateful agent workflows; MIT | Defer until a missing AIA behavior is demonstrated. It must not create a second authority store. |
| [iTwin.js core](https://github.com/iTwin/itwinjs-core) | Engineering-focused digital twins and model/data integration; MIT | Keep as a CAD/BIM comparator; defer until engineering inputs and a buyer justify the extra stack. |

Code inspection: Cesium `Viewer.js` handles picking entities and tile features; `Cesium3DTileset.js` exposes URL loading and level-of-detail controls. LangGraph `types.py` implements interrupt/resume contracts and validates checkpointers. The official MCP README defines both clients and servers. Licenses and exact source revisions were inspected; the accompanying `repository-review-sources.json` contains pinned links. Head revisions are review snapshots, not selected production package versions.

## Existing OrPaynter implementation

AIA's `agsi/infra/operational_store.py` already contains tenant-scoped execution receipts, unique idempotency keys, durable workflow claiming and outcome links. Its `agsi/core/swarm_build.py` and `swarm_runtime.py` represent existing governed work. The inspected GACC-E2E-01 contract remains RED/BLOCKED and requires a genuine Cycle N through Cycle N+1; passing builds or a recovering local process do not close it. This is source inspection, not a fresh production API health test.

The immediate engineering priority is the first failing acceptance clause in the existing AIA path. New spatial/framework integrations are candidates after that gate, or when directly required to close a clause. This research does not bypass the gate or replace the backend.

## Proof that would justify pushing the position

Use one authorized contracting/property workflow, retaining the broad platform ambition:

1. Record a genuine new customer objective and a baseline using their current tools.
2. Bind an official world event, an authorized asset/property and source timestamps/uncertainty to that objective. Storm exposure is not proof of damage.
3. Let bounded AI draft an inspectable work plan. Use existing AIA validation, approval, receipt and independent-verification paths.
4. Observe and reconcile the actual outcome. Demonstrate a second cycle consuming permitted learning without gaining authority.
5. Compare matched tasks against the current manual/GIS-plus-AI workflow. Measure elapsed time, human coordination time, cost, evidence completeness, unsupported claims, unauthorized actions and duplicate consequences after an injected recoverable failure.

Proposed pilot targets, not results: at least 50% less human coordination time on matched tasks; every consequential action authorized and receipted; zero unsupported measurement claims; zero duplicate consequential actions on recovery. Report denominator, failures, exclusions and uncertainty. Start with three independent customer teams and repeat use over a complete work cycle before claiming repeatable demand. That is an initial pilot threshold, not statistical proof of a market category. Willingness to pay requires actual commitments.

Advance the category story when independent customers repeatedly choose this workflow, pay for its outcome, and can explain why alternatives do not solve the problem adequately. If it yields only a better map or agent wrapper, position it in that existing category. Publish reconstructable proof before stronger claims.

## Boundaries that matter

- Precise rendering does not produce precise measurements. Satellite imagery, catalogued LiDAR coverage and public footprints do not establish exact CAD/roof dimensions. Use inspected survey/LiDAR inputs, documented coordinate systems, uncertainty and independent checks.
- Cesium's Apache-2.0 engine does not license third-party terrain, satellite imagery or buildings. Retain notices, check dataset rights, and treat optional Cesium ion service terms separately.
- Recovery means restoring a known-good bounded runtime or resuming an authorized task. It does not mean AI cannot fail or correct every real-world consequence.
- MCP tool availability does not grant execution authority. Keep credentials server-side and bind tenant, actor, policy, approval and receipt to consequential tool calls.
- No external repository was integrated, new paid service enabled, or customer/market results manufactured during this review.
