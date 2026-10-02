import { describe, expect, it } from 'vitest';
import { layersForProfile, operatingProfile, resolveSetup, setupUrl } from './setup';

describe('OrPaynter operating setup', () => {
  it('starts with company context without autoplay feeds or bulk orbital layers', () => {
    const layers = resolveSetup('');
    expect(operatingProfile(layers)).toBe('company');
    expect(layers.weather && layers.infrastructure && layers.earthquakes).toBe(true);
    expect(layers.cctv_previews || layers.live_news || layers.satellites || layers.sdk_naval).toBe(false);
  });
  it('preserves explicit shared layers including an empty selection and ignores unknown names', () => {
    expect(resolveSetup('?profile=company&layers=satellites,not-a-layer').satellites).toBe(true);
    expect(Object.values(resolveSetup('?layers=')).some(Boolean)).toBe(false);
    expect(Object.keys(resolveSetup('?layers=not-a-layer'))).not.toContain('not-a-layer');
  });
  it('can return to exploration without turning on camera or broadcast playback', () => {
    const layers = resolveSetup('?profile=world');
    expect(operatingProfile(layers)).toBe('world');
    expect(layers.satellites && layers.flights && layers.maritime).toBe(true);
    expect(layers.cctv_previews || layers.live_news).toBe(false);
  });
  it('preserves explicit location opt-in, other parameters and hash in layer share URLs', () => {
    const url = new URL(setupUrl('http://localhost:4180/?locate=1&purpose=survey#site', layersForProfile('company')), 'http://localhost:4180');
    expect(url.searchParams.get('locate')).toBe('1');
    expect(url.searchParams.get('purpose')).toBe('survey');
    expect(url.searchParams.get('profile')).toBe('company');
    expect(url.hash).toBe('#site');
  });
});
