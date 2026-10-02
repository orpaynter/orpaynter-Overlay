# OrPaynter Overlay

A navigable digital world connecting public signals, saved evidence, company work, and AI analysis. The globe is the spatial front door; Overlay connects what is happening, what was captured, what might happen, and the services that can help.

## Run locally

```sh
npm install
node tools/build-verified.mjs
node tools/self-heal-local.mjs
```

Open http://localhost:4180/. See [local operation](ORPAYNTER_LOCAL.md) for the optional existing Windows Grok/GitHub account setup and runtime limits. No shared credentials are included.

## Working now

- Globe, source layers, geographic exploration, and public CAD pilot.
- Owner-scoped AIA/ClaimFlow repository work and a durable local Grok job journal.
- Updating USGS/NWS captures, frozen captures, and retrieval of the exact capture used by a saved job.
- Source identities, original timestamps, modeled/reference labels, and bounded feed, renderer, and owned-server recovery.

Updating captures refresh while the analysis panel is open. Frozen mode stops that panel's capture refresh; it does not freeze the separate globe or company source streams. A saved capture is evidence from its recorded time, not guaranteed complete world coverage.

## Product direction

Overlay develops toward shared world spaces with three temporal modes: updating sources, recorded history, and isolated what-if scenarios. Full globe replay and scenario worlds are not implemented yet. MCP adapters will connect existing services around a common location/time/source context, with declared access and action scope. AIA remains the authority for consequential company execution.

## Credit and open source

This is a derivative of [OSIRIS by simplifaisoul and contributors](https://github.com/simplifaisoul/osiris), copied at `4ba7184ff31db06cb33c47de029c2d4255806458`. The original [MIT license](LICENSE) remains unchanged. OrPaynter additions use [MIT](LICENSE_ORPAYNTER). Other libraries keep their own licenses.

[Contributor and information-provider credits](CREDITS.md) are also visible at `/credits`. The original upstream [README](docs/reference/OSIRIS_README.md) is preserved as historical documentation; its feature and deployment claims describe the upstream project.

Source repository: [orpaynter/orpaynter-Overlay](https://github.com/orpaynter/orpaynter-Overlay). See [the public platform overview](docs/orpaynter/PUBLIC_OVERVIEW.md) for current proof and roadmap. Private records, credentials, captured company context, saved model jobs, and provider subscriptions are not part of the distributed source. Publicly reachable information remains subject to its provider's terms.

## Proof

See [the build report](docs/orpaynter/BUILD_REPORT.md). Unit tests run with `npm test`; local browser checks use Playwright. Paid Grok jobs require an operator action. Recovery does not dispatch customers, promote modeled geometry into measured CAD, or grant new authority.
