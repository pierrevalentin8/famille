import type {Gift} from './family';
export function money(amount:number,currency:string){return new Intl.NumberFormat('fr-FR',{style:'currency',currency}).format(amount)}
export function sortGifts(gifts:Gift[],sort:string){return [...gifts].sort((a,b)=>{
 if(sort==='priceAsc'||sort==='priceDesc'){
  if(!a.price||!b.price){if(a.price!==b.price)return a.price?-1:1}
  else {const currency=a.currency.localeCompare(b.currency);if(currency)return currency;const price=Number(a.price)-Number(b.price);if(price)return sort==='priceAsc'?price:-price}
 }
 const order=a.addedOrder-b.addedOrder;
 return sort==='oldest'?order:-order;
})}
export function giftTotals(gifts:Gift[]){const amounts=new Map<string,number>();let unpriced=0;for(const gift of gifts){if(!gift.price){unpriced++;continue}amounts.set(gift.currency,(amounts.get(gift.currency)||0)+Math.round(Number(gift.price)*100))}return {amounts:[...amounts].sort(([a],[b])=>a.localeCompare(b)).map(([currency,cents])=>({currency,cents})),unpriced}}
