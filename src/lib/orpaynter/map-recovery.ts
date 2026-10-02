export type MapCamera={lat:number;lng:number;zoom:number;pitch:number;bearing:number};
export type MapRecoveryState={status:'checking'|'healthy'|'rebuilding'|'recovered'|'paused';attempts:number;at:string;detail:string};
export function validCamera(value:unknown):MapCamera|null {
 if(!value||typeof value!=='object')return null;const v=value as Record<string,unknown>;
 if(!['lat','lng','zoom','pitch','bearing'].every(k=>typeof v[k]==='number'&&Number.isFinite(v[k])))return null;
 const c=v as MapCamera;return Math.abs(c.lat)<=90&&Math.abs(c.lng)<=180&&c.zoom>=1.5&&c.zoom<=18&&c.pitch>=0&&c.pitch<=85&&Math.abs(c.bearing)<=360?c:null;
}
export function mapRetryBudget(attempts:number[],now:number){const recent=attempts.filter(t=>now-t<120000);return {allowed:recent.length<2,attempts:recent};}
