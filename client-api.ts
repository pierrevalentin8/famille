import {firebaseFetch} from '../../firebase-client';
export const apiFetch=firebaseFetch;
export function publicAsset(path:string){return import.meta.env.BASE_URL+path.slice(path.startsWith('/')?1:0)}
