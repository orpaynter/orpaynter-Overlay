export const LAYER_KEYS = ['flights','private','jets','military','maritime','satellites','sat_comms','sat_military','sat_navigation','sat_earth','sat_science','balloons','cctv','cctv_previews','live_news','earthquakes','fires','weather','radiation','infrastructure','global_incidents','alert_pins','war_alerts','day_night','cables','sdk_sea','sdk_air','sdk_naval','terrain_3d','terrain_elevation','malware','cyber_attacks','gdelt_events','cf_outages','cf_attacks'] as const;
export type Layers = Record<typeof LAYER_KEYS[number], boolean>;
export type OperatingProfile = 'company' | 'world' | 'custom';
export const COMPANY_PROFILES = {
  company: ['weather','earthquakes','infrastructure','alert_pins','day_night'],
  world: ['satellites','maritime','flights','earthquakes','weather','infrastructure','cables','day_night'],
} as const;

export function layersForProfile(profile: 'company' | 'world'): Layers {
  const selected: readonly string[] = COMPANY_PROFILES[profile];
  return Object.fromEntries(LAYER_KEYS.map(key => [key, selected.includes(key)])) as Layers;
}

export function operatingProfile(layers: Layers): OperatingProfile {
  for (const profile of ['company','world'] as const) {
    const expected = layersForProfile(profile);
    if (LAYER_KEYS.every(key => expected[key] === layers[key])) return profile;
  }
  return 'custom';
}

export function resolveSetup(search: string): Layers {
  const params = new URLSearchParams(search);
  if (params.has('layers')) {
    const selected = new Set((params.get('layers') || '').split(','));
    return Object.fromEntries(LAYER_KEYS.map(key => [key, selected.has(key)])) as Layers;
  }
  return layersForProfile(params.get('profile') === 'world' ? 'world' : 'company');
}

export function setupUrl(href: string, layers: Layers): string {
  const url = new URL(href);
  url.searchParams.set('profile', operatingProfile(layers));
  url.searchParams.set('layers', LAYER_KEYS.filter(key => layers[key]).join(','));
  return url.pathname + url.search + url.hash;
}
