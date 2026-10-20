"use client";
import {useEffect,useRef} from 'react';
import {X} from 'lucide-react';
import {AVATARS,HOUSEHOLDS,dayKey,type Me} from './lib/family';
export type Mutate=(body:Record<string,unknown>)=>Promise<boolean>;
export function Modal({title,onClose,children}:{title:string;onClose:()=>void;children:React.ReactNode}){
 const ref=useRef<HTMLDialogElement>(null);
 useEffect(()=>{const d=ref.current;d?.showModal();return()=>{d?.close()}},[]);
 return <dialog className="modal-card" ref={ref} onCancel={onClose} onClick={e=>{if(e.target===e.currentTarget)onClose()}}><div className="modal-content"><button className="close" onClick={onClose} aria-label="Fermer"><X size={22}/></button><div className="eyebrow">NOTRE ESPACE FAMILLE</div><h2>{title}</h2>{children}</div></dialog>
}
export function ProfileForm({account,mutate,busy,onboarding=false,adminTarget=''}:{account:Me;mutate:Mutate;busy:boolean;onboarding?:boolean;adminTarget?:string}){
 return <form key={account.id} onSubmit={async e=>{e.preventDefault();await mutate({action:'profile',...(adminTarget?{memberId:adminTarget}:{}),...Object.fromEntries(new FormData(e.currentTarget))})}}>
 <div className="formrow"><label>Prénom<input name="name" defaultValue={account.name} required maxLength={70} autoComplete="given-name"/></label><label>Mon avatar<select name="avatar" defaultValue={account.avatar}>{AVATARS.map(a=><option key={a}>{a}</option>)}</select></label></div>
 <label>Adresse e-mail<input name="email" type="email" defaultValue={account.email} required maxLength={254} autoComplete="email"/></label>
 <div className="formrow"><label>Date de naissance<input type="date" name="birthDate" defaultValue={account.birthDate} min="1900-01-01" max={dayKey(new Date())} required autoComplete="bday"/></label><label>Mon foyer<select name="household" defaultValue={account.household} required><option value="" disabled>Choisir un foyer</option>{HOUSEHOLDS.map(h=><option key={h}>{h}</option>)}</select></label></div>
 <p className="fieldnote">Votre anniversaire apparaîtra chaque année dans le calendrier avec votre âge.</p>
 {!onboarding&&<><label>Ma ville<input name="city" defaultValue={account.city} maxLength={100}/></label><label>Quelques mots sur moi<textarea name="bio" defaultValue={account.bio} maxLength={500}/></label></>}
 {onboarding&&<><input type="hidden" name="city" value={account.city}/><input type="hidden" name="bio" value={account.bio}/></>}
 <button className="primary" disabled={busy}>{busy?'Enregistrement…':onboarding?'Rejoindre mon foyer':'Enregistrer mon profil'}</button>
 <p className="fieldnote">Connexion sécurisée avec Firebase. L’e-mail de ce profil sert de contact ; il ne change pas votre identifiant de connexion.</p>
 </form>
}
