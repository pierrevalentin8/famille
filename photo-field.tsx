"use client";
import Photo from './private-photo';
import {apiFetch,publicAsset} from './lib/client-api';
import {useState} from 'react';
export default function PhotoField({initialUrl='',onUploading}:{initialUrl?:string;onUploading:(v:boolean)=>void}){
 const [url,setUrl]=useState(initialUrl),[busy,setBusy]=useState(false),[error,setError]=useState('');
 async function upload(file?:File){if(!file)return;setError('');if(file.size>5*1024*1024){setError('La photo doit faire moins de 5 Mo.');return}setBusy(true);onUploading(true);try{const r=await apiFetch('/api/photos',{method:'POST',headers:{'Content-Type':file.type},body:file});const result=await r.json() as {url:string;error?:string};if(!r.ok)throw Error(result.error||'Importation impossible.');setUrl(result.url)}catch(e){setError((e as Error).message)}finally{setBusy(false);onUploading(false)}}
 return <div className="gift-photo-editor"><input type="hidden" name="imageUrl" value={url}/>{url&&<Photo src={url} alt="Photo de la collection"/>}<label>Photo (facultative)<input type="file" accept="image/png,image/jpeg,image/webp" disabled={busy} onChange={e=>upload(e.target.files?.[0])}/></label><p className="fieldnote">{busy?'Importation…':'JPG, PNG ou WebP · 5 Mo maximum · Non exportée dans Excel'}</p>{url&&<button type="button" className="textbtn" disabled={busy} onClick={()=>setUrl('')}>Retirer la photo</button>}{error&&<p className="error" role="alert">{error}</p>}</div>
}
