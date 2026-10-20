import {dayKey,type FamilyEvent,type Member,type Child,birthdaysForYear,childrenBirthdays} from './family';
function sunday(year:number,month:number,n:number){const first=new Date(year,month,1);return new Date(year,month,1+(7-first.getDay())%7+7*(n-1))}
function easter(year:number){const a=year%19,b=Math.floor(year/100),c=year%100,d=Math.floor(b/4),e=b%4,f=Math.floor((b+8)/25),g=Math.floor((b-f+1)/3),h=(19*a+b-d-g+15)%30,i=Math.floor(c/4),k=c%4,l=(32+2*e+2*i-h-k)%7,m=Math.floor((a+11*h+22*l)/451),n=h+l-7*m+114;return new Date(year,Math.floor(n/31)-1,n%31+1)}
export function familyOccasions(year:number):FamilyEvent[]{
 const lastMay=new Date(year,5,0);lastMay.setDate(lastMay.getDate()-lastMay.getDay());
 const pentecost=easter(year);pentecost.setDate(pentecost.getDate()+49);
 const mothers=dayKey(lastMay)===dayKey(pentecost)?sunday(year,5,1):lastMay;
 const dates=[
 {key:'grandmothers',title:'💐 Fête des grands-mères',date:sunday(year,2,1),source:'https://www.laposte.fr/modeles-lettres/fetes-des-grands-meres'},
 {key:'mothers',title:'🌷 Fête des mères',date:mothers,source:'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000006905391'},
 {key:'fathers',title:'🎉 Fête des pères',date:sunday(year,5,3),source:'https://www.laposte.fr/modeles-lettres/fete-des-peres'},
 {key:'grandfathers',title:'🍂 Fête des grands-pères',date:sunday(year,9,1),source:'https://www.laposte.fr/modeles-lettres/fete-des-grands-peres'}
 ];
 return dates.map(d=>({id:'occasion-'+d.key+'-'+year,title:d.title,date:dayKey(d.date),time:'',description:'Une attention pour ceux qu’on aime.',author:'',holiday:true,universal:true,sourceUrl:d.source}));
}
export function nextFamilyOccasions(members:Member[],children:Child[],today=dayKey(new Date())){
 const year=Number(today.slice(0,4));
 const candidates=[year,year+1].flatMap(y=>[...birthdaysForYear(members,y),...childrenBirthdays(children,y),...familyOccasions(y)]).filter(e=>e.date>=today).sort((a,b)=>a.date.localeCompare(b.date)||a.title.localeCompare(b.title));
 return candidates.length?candidates.filter(e=>e.date===candidates[0].date):[];
}
