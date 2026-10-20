import {initializeApp} from 'firebase/app';
import {getAuth,connectAuthEmulator} from 'firebase/auth';
const env=import.meta.env;
export const configured=!!(env.VITE_FIREBASE_API_KEY&&env.VITE_FIREBASE_PROJECT_ID&&env.VITE_API_URL);
export const auth=configured?getAuth(initializeApp({apiKey:env.VITE_FIREBASE_API_KEY,authDomain:env.VITE_FIREBASE_AUTH_DOMAIN,projectId:env.VITE_FIREBASE_PROJECT_ID,storageBucket:env.VITE_FIREBASE_STORAGE_BUCKET,messagingSenderId:env.VITE_FIREBASE_MESSAGING_SENDER_ID,appId:env.VITE_FIREBASE_APP_ID})):null;
if(auth){auth.languageCode='fr';if(env.DEV&&env.VITE_USE_EMULATORS==='true')connectAuthEmulator(auth,'http://127.0.0.1:9099',{disableWarnings:true})}
export async function firebaseFetch(path:string,init:RequestInit={}){const user=auth?.currentUser;if(!user)return Response.json({error:'Connexion requise'},{status:401});const headers=new Headers(init.headers);headers.set('Authorization','Bearer '+await user.getIdToken());return fetch(env.VITE_API_URL.replace(/\/$/,'')+path.replace(/^\/api/,''),{...init,headers,credentials:'omit',cache:'no-store'})}
