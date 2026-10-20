"use client";
import {useEffect,useState} from 'react';
import {apiFetch} from './lib/client-api';
export default function Photo({src,...props}:React.ImgHTMLAttributes<HTMLImageElement>){const [url,setUrl]=useState('');useEffect(()=>{let active=true,objectUrl='';setUrl('');if(typeof src==='string'&&src)apiFetch(src).then(async r=>{if(!r.ok)throw Error();objectUrl=URL.createObjectURL(await r.blob());if(active)setUrl(objectUrl);else URL.revokeObjectURL(objectUrl)}).catch(()=>{});return()=>{active=false;if(objectUrl)URL.revokeObjectURL(objectUrl)}},[src]);return url?<img src={url} {...props}/>:<span className={props.className} role="img" aria-label={props.alt||'Photo en cours de chargement'}/>}
