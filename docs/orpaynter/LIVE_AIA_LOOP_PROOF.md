# Live AIA execution-to-learning proof

Evidence snapshot: October 2, 2026. **Full loop acceptance remains blocked.**

## Established live

The canonical authenticated AIA service runs in a protected engineering preview with persistent PostgreSQL storage. Health and readiness returned HTTP 200. Missing and invalid intake credentials returned HTTP 401.

The actual owner's original objective was uploaded with a verified content hash and admitted through `/swarm-builds/intake`. Retries retained the same objective ID. A fresh deployment with one-time account bootstrap settings removed retained the actual owner and objective, reconstructed the hash-linked evidence chain, and preserved retry identity.

A genuine HTTP readiness observation was uploaded as source evidence. Its six-stage deterministic analysis completed with `HUMAN_REVIEW`, medium risk, and explicit required approval. This proves the bounded analytical path; it does not prove autonomous reasoning, approved execution or improved decision quality.

| Record | Identity |
| --- | --- |
| Source commit at verified deployment | `d8476c05423cb30c229da007901afb0b4a5ae9fc` |
| Canonical runtime change | [AIA PR #129](https://github.com/orpaynter/AIA/pull/129) — private repository, protected engineering scope |
| Objective | `gacc:47d949631f25a8892ad45a8e6a6707c5cbef72acb8b4fb72b576e355d10fd66a` |
| Analytical run | `live-runtime-36948eb50a443a2fdd11fc35cacf6014` |
| Backend CI | [Run 36955001326](https://github.com/orpaynter/AIA/actions/runs/36955001326), all 14 jobs passed |

CI included 387 backend passes and a separate PostgreSQL integration selection with 4 passes. Those jobs test implementation and migration isolation; they do not close live acceptance clauses.

## Still required

A concrete, reviewed execution package must bind the actual input, validated capability and declared action scope. Only then can a real execution produce an artifact and receipt. Independent reconstruction must validate that output and its approval bindings, followed by a measured outcome, reconciliation and permitted learning. A new real input must consume verified learning in a second bounded cycle while retaining the authority gates.

The current learning slice measures JSON field and value preservation of actual runtime observations. It cannot establish better forecasts, customer results, market novelty or broader autonomous judgment. Missing values remain unknown.

## Evidence and privacy boundary

Owner login and setup were performed by an authorized engineering agent using the provisioned actual owner account. No human approval or independent reviewer was fabricated. Secrets, raw private account material and company records are omitted from this public snapshot. The protected engineering preview is not public production or a customer fulfillment service.
