# Open-source additions that could help OrPaynter

Reviewed October 1, 2026. Requested by the founder after the initial category review. Exact revisions and inspected source links are in `additional-repository-sources.json`. These are candidates; no donor application, paid feed or new framework was activated.

## Strongest match: God's Eye View

The repository matching the approximate name “godeyeview” is [bilawalsidhu/gods-eye-view](https://github.com/bilawalsidhu/gods-eye-view), by Bilawal Sidhu. Its Cesium-based globe, modular layers, map-source switching, entity context, scene controls and voice interaction closely match World Portal's visual ambition.

Source inspection found useful implementation seams:

- `src/mapStackController.js` composes a map-source controller and source registry, instead of entangling map providers with company workflow.
- `src/data/contextStore.js` retains entity identity, current selection and refresh timestamps, and clears evicted selection rather than continuing to present stale entity records.
- `server/providers/aircraft/opensky.js` implements a credit governor, rate-limit cooldown and explicitly stale cache serving.
- `src/renderGovernor.js` and the map controller expose a request-render path. These are candidates for camera/detail performance work, not proof of faster rendering in OrPaynter.

Recommendation: evaluate an isolated asset detail viewer built with Cesium and selected MIT code from this project. Preserve World Portal's working MapLibre globe and its AIA-linked operating desk. Begin with entity picking, reliable source switching and explicit freshness; cinematic shaders and aircraft cockpit mode are lower priority for the company workflow. Existing Grok analysis stays separate from this project's OpenAI voice stack; voice is an optional presentation control and does not authorize consequential work.

The [license](https://github.com/bilawalsidhu/gods-eye-view/blob/main/LICENSE) grants MIT rights to source code while explicitly excluding third-party data/assets. TeleGeography submarine-cable data is CC BY-NC-SA and Bhote Koshi event imagery/derived coordinates are CC BY-NC; do not import those into a commercial OrPaynter service without separate rights. OSM-derived data and bundled 3D models have their own terms. Photorealistic imagery and voice also depend on provider credentials, commercial eligibility and service quotas. Preserve Bilawal Sidhu's notice for adopted code.

## Other useful additions

| Candidate | Actual gap it can address | Adoption decision |
|---|---|---|
| [Crawl4AI](https://github.com/unclecode/crawl4ai) | Collect permitted web pages and produce structured text/Markdown for evidence and market research | First research-collection candidate. Its inspected LICENSE includes Apache-2.0 text plus an additional attribution requirement. Use a source allowlist, enable its robots checks, bound requests, and retain URL, retrieval time, content hash and extraction uncertainty. Open-source crawling does not grant rights to republish source content. |
| [PDAL](https://github.com/PDAL/PDAL) | Read, transform and process real LiDAR/point-cloud inputs for measured asset work | First geometry-processing candidate. Inspected license uses BSD terms. `ReprojectionFilter.cpp` implements coordinate transformations; `readers.copc` supports cloud-optimized point clouds. Inspect a licensed dataset's acquisition date, CRS, vertical datum, density and coverage before proposing dimensions. PDAL does not guarantee survey accuracy or automatically supply a CAD model. |
| [World Monitor](https://github.com/koala73/worldmonitor) | Curated news/market sources, typed service contracts and economic context | Reference candidate and possible separately licensed integration. Inspected source is AGPL-3.0, not MIT; retain the license and assess the actual combination before copying code. Its hosted market API schema requires an API key and describes subscription failures; open source does not make hosted market data free. Prefer direct provider adapters for a specific OrPaynter need. |
| [MCP Python SDK](https://github.com/modelcontextprotocol/python-sdk) | Connect AIA evidence and bounded tools to compatible AI clients | Use the existing canonical backend. Begin with authenticated, tenant-scoped read resources. Every consequential tool still needs AIA policy, approval where required, idempotency and receipts. |

World Monitor source review included its original upstream repository, not an unrelated relabeled fork. Its `src/config/feeds.ts` provides a source inventory; `MarketService.openapi.yaml` includes quote timestamps, rate-limited responses and authentication/subscription errors. A source inventory is useful discovery material, not evidence that every source grants commercial reuse or is currently healthy.

## Proposed seams, not a replacement platform

```text
Permitted sources -> collector -> timestamped/hashed evidence -> canonical AIA
Licensed LiDAR -> PDAL processing -> measured artifact with uncertainty -> AIA
AIA read resources -> MCP / existing Grok -> World Portal views and drafts
Authorized action -> existing AIA receipt -> independent outcome verification
```

Use one existing evidence identifier across the collector, spatial viewer, AI draft and verification chain. Retain the distinction between live provider observation, delayed/stale observation, calculated position and scenario. Donor code cannot grant itself authority or rewrite evidence history.

## Order that advances completion

1. Close the first failing existing AIA acceptance clause and prove the complete work cycle. The inspected GACC contract remains RED/BLOCKED; additional stacks do not close it.
2. Add the smallest source/evidence adapter directly needed by that workflow. Reuse existing provider integrations before adopting a crawler.
3. If the workflow needs actual geometry, inspect one authorized public LiDAR asset and evaluate PDAL with independent checks.
4. Evaluate God's Eye View/Cesium in one asset detail surface after the gate, or when required to prove the current path. Keep company authority and runtime recovery in the existing system.
5. Add market context only when it changes a customer decision; preserve provider timestamps, access rules and uncertainty.

These projects can accelerate parts of the work. They cannot establish demand, exact CAD dimensions, improved AI judgment or a new market category by themselves. Use the matched customer pilot and second-cycle proof in `CATEGORY_AND_REPOSITORY_REVIEW.md` before stronger claims.
