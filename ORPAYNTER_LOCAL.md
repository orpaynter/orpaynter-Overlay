# Run the local OrPaynter Overlay workspace

Open http://localhost:4180/ while the local server is running. The company panel shows actual owner-scoped GitHub work, local worker activity and source receipts. Select a real task to open Grok with that context, or click **ORPAYNTER** for a public-source investigation. **Explore the public CAD pilot** opens ten source footprints and DXF downloads.

From this directory:

```sh
npm ci --ignore-scripts --no-audit --no-fund
node tools/build-verified.mjs
node tools/self-heal-local.mjs
```

The Grok adapter uses the founder's existing installation at `C:\Users\OrPay\.grok\bin\grok.exe` and the current local workspace path. Signing in remains managed by that installation. Account readiness is checked at runtime; expired metadata is not presented as ready. No keys go into this project.

The completed source/run journal stays under `.local-runs/`. The previous Living City prototype stays in `../prototype`. The CAD capture artifacts and standalone viewer also stay in `../public-cad-pilot`.

Read [the build report](docs/orpaynter/BUILD_REPORT.md) for measured proof, source identity and remaining gaps. Read upstream [README](README.md) and [LICENSE](LICENSE) for OSIRIS documentation and attribution.

To recapture the public CAD pilot (read-only source requests):

```sh
python3 -m pip install --target .local-runs/cad-validation ezdxf
python3 tools/capture-public-cad-pilot.py
```

Use `--reuse-capture` to regenerate exports from the saved catalogue without repeating source requests. Viewer/export artifacts live in `../public-cad-pilot`; the current served copy lives in `public/orpaynter-cad`.

Run `python3 tools/verify-public-cad.py` against the running workspace to validate the HTTP-delivered DXFs with a CAD reader and captured source geometry.


Company work uses the existing authenticated Windows GitHub CLI. GitHub metadata refreshes every 30 seconds in the foreground. A missing/mismatched owner account clears the connected work inventory rather than showing another account's tasks. Notion company context is a dated local capture, not a live connector.

The local run journal retains selected task, GitHub revision, company capture, source snapshot, provider response and process state. The Workers view checks it every five seconds. AIA/ClaimFlow customer data and OpenClaw company jobs still require their own authenticated integrations.

Automated browser QA: `node tools/company-browser-qa.mjs`. `tools/company-live-job.mjs` starts one real, bounded Grok analysis using the configured account; it is a live proof, not a routine no-cost test.

Start with automatic local server recovery after building:

```sh
node tools/self-heal-local.mjs
```

The launcher owns its server process on port 4180, verifies the same build's health, and restarts it after an exit or repeated failed health checks. It refuses to take over another running server. Stop it normally to end supervision.

The **Healing** tab shows source recovery, integrity hashes, source age, renderer rebuilds and supervisor status. Last-good packets and the recovery journal stay under `.local-runs/recovery`. Company owner mismatches clear company data. Automatic recovery does not alter the canonical AIA state, approvals or measured CAD.

`node tools/self-heal-browser-qa.mjs` is a disruptive local fault proof: it deliberately loses the browser GPU context and stops the supervisor-owned server process, then verifies automatic recovery. Run it only on this local supervised workspace.


The verified build checks that the new workspace stylesheet is actually present in the generated assets. If the build cache serves stale styles, it clears that cache and rebuilds once, then records a build receipt. The supervisor requires that receipt and restarts only that build. A failed integrity check prevents startup.

## Overlay capture modes and credit

Choose **Updating sources** for periodic source captures, **Freeze this capture** to retain the current capture, or **Open saved job capture** to retrieve the integrity-verified input used by the saved Grok job. Frozen mode applies to this source panel; globe and company feeds keep their own cadence. Full globe replay and what-if worlds remain planned. Contributor credits are visible at `/credits`; original notices and new OrPaynter MIT terms are preserved separately.

## Company operating setup

The initial view is **Company operations**: weather, earthquakes, infrastructure, placed source alerts and day/night. Camera previews, broadcasts, all-satellite clouds and modeled naval SDK overlays start off. **World exploration** switches to orbits, aircraft, maritime, weather and infrastructure; streaming previews remain opt-in. Existing explicit layer URLs retain their choices, including an empty selection, and other query parameters remain intact.

Open `http://localhost:4180/?profile=company` for the company preset or `http://localhost:4180/?profile=world` for exploration. The switches are in the company panel. These are presentation presets, not new access roles or provider entitlements. Authenticated owner reads, user-started Grok analysis, source truth labels and bounded recovery retain their existing limits.

Use `npm run build:verified` followed by `npm run start:company` for supervised local operation. The launcher remains attached to this local session; no machine-boot service or deployment is claimed.

The original OrPaynter orbital O/P mark now appears in the splash, header, browser favicon and installation manifest. The founder-avatar/AI-companion concept is parked in [Great Ideas](docs/orpaynter/GREAT_IDEAS.md), with no activation.
