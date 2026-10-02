import {describe,it,expect} from 'vitest';
import {mapRetryBudget,validCamera} from './map-recovery';
describe('bounded renderer recovery',()=>{
 it('restores a valid camera and rejects impossible saved state',()=>{const c={lat:40,lng:-74,zoom:8,pitch:45,bearing:20};expect(validCamera(c)).toEqual(c);for(const bad of [{...c,lat:91},{...c,zoom:500},{...c,lng:NaN},{...c,pitch:-1},null])expect(validCamera(bad)).toBeNull();});
 it('halts repeated rebuilds then permits recovery after the cooldown',()=>{expect(mapRetryBudget([1000,2000],3000).allowed).toBe(false);expect(mapRetryBudget([1000,2000],123000).allowed).toBe(true);});
});
