"use client";
import {useState} from 'react';
import {Plus,Pencil,Trash2} from 'lucide-react';
import {Modal,type Mutate} from './shared-ui';
import {dayKey,type FamilyData,type Child} from './lib/family';
export default function Children({data,mutate,busy,error}:{data:FamilyData;mutate:Mutate;busy:boolean;error:string}){
 const [editor,setEditor]=useState<Child|'new'|null>(null);
 const children=data.children.filter(c=>data.isAdmin||c.household===data.account.household||c.guardian===data.me);
 return <section className="children-panel"><div className="sectionhead"><h2>Enfants du foyer</h2><button className="secondary" onClick={()=>setEditor('new')}><Plus size={16}/> Ajouter un enfant</button></div><p className="fieldnote">Sans compte personnel, ils peuvent être associés aux événements. Vous gérez les fiches que vous ajoutez.</p>
 {children.map(child=><div className="child-row" key={child.id}><span className="avatar">🧒</span><div><h3>{child.name}</h3><p>{child.household} · {new Date(child.birthDate+'T12:00').toLocaleDateString('fr-FR')}</p></div>{(child.guardian===data.me||data.isAdmin)&&<div className="tools"><button aria-label={'Modifier '+child.name} onClick={()=>setEditor(child)}><Pencil size={16}/></button><button disabled={busy} aria-label={'Supprimer la fiche de '+child.name} onClick={()=>mutate({action:'deleteChild',id:child.id})}><Trash2 size={16}/></button></div>}</div>)}
 {!children.length&&<p className="empty">Aucun enfant ajouté pour le moment.</p>}
 {editor&&<Modal title={editor==='new'?'Ajouter un enfant':'Modifier la fiche enfant'} onClose={()=>{if(!busy)setEditor(null)}}><form onSubmit={async e=>{e.preventDefault();if(await mutate({action:'child',...Object.fromEntries(new FormData(e.currentTarget)),...(editor!=='new'?{id:editor.id}:{})}))setEditor(null)}}><label>Prénom de l’enfant<input name="name" required maxLength={70} defaultValue={editor!=='new'?editor.name:''}/></label><label>Date de naissance de l’enfant<input name="birthDate" type="date" min="1900-01-01" max={dayKey(new Date())} required defaultValue={editor!=='new'?editor.birthDate:''}/></label><p className="fieldnote">Foyer : {data.account.household}. Son anniversaire sera ajouté automatiquement au calendrier.</p>{error&&<p role="alert" className="error">{error}</p>}<button className="primary" disabled={busy}>Enregistrer la fiche</button></form></Modal>}</section>
}
