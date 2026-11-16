import {dateKey,fromBrazilDate,fromDateKey} from './planner.js'

export function mondayOf(date){
 const d=new Date(date.getFullYear(),date.getMonth(),date.getDate())
 d.setDate(d.getDate()-(d.getDay()+6)%7)
 return d
}
export function weekBounds(now){
 const monday=mondayOf(now)
 const sunday=new Date(monday);sunday.setDate(sunday.getDate()+6)
 return {start:dateKey(monday),end:dateKey(sunday),monday,sunday}
}
export function strengthNames(state){
 const known=(state.workouts||[]).map(w=>w.name).filter(Boolean)
 return [...new Set([...(state.rotation||[]).filter(n=>known.includes(n)),...known])]
}
export function weekStrength(state,now){
 const bounds=weekBounds(now)
 const nameList=strengthNames(state)
 const entries=(state.history||[]).filter(entry=>{
  if(entry.kind!=='forca')return false
  const date=fromBrazilDate(entry.date)
  return date&&dateKey(date)>=bounds.start&&dateKey(date)<=bounds.end
 })
 const namesDone=new Set(entries.map(e=>e.name))
 return nameList.map((name,index)=>({
  name,number:index+1,
  exercises:(state.workouts||[]).find(w=>w.name===name)?.exercises?.length||0,
  completed:namesDone.has(name),
  quick:entries.some(e=>e.name===name&&e.weekCheck===true),
  detailed:entries.some(e=>e.name===name&&!e.weekCheck),
  date:entries.find(e=>e.name===name)?.date||''
 }))
}
export function toggleWeekStrength(raw,name,now){
 const names=strengthNames(raw)
 if(!names.includes(name))throw new Error('Ficha não encontrada. Confira seus treinos cadastrados.')
 const cards=weekStrength(raw,now)
 const card=cards.find(x=>x.name===name)
 if(card.detailed)throw new Error('Esta ficha já tem treino detalhado nesta semana.')
 // Clone JSON rather than Vue proxies.
 const next=JSON.parse(JSON.stringify(raw))
 if(card.quick){
  next.history=next.history.filter(h=>!(h.kind==='forca'&&h.name===name&&h.weekCheck===true&&fromBrazilDate(h.date)&&dateKey(fromBrazilDate(h.date))>=weekBounds(now).start&&dateKey(fromBrazilDate(h.date))<=weekBounds(now).end))
 }else{
  if(card.completed)throw new Error('Já existe um registro desta ficha nesta semana.')
  next.history.push({kind:'forca',name,date:now.toLocaleDateString('pt-BR'),weekCheck:true,quick:true,seconds:0,sets:{}})
 }
 // The next workout is the first unchecked card, independent of weekday.
 const remaining=weekStrength(next,now).find(c=>!c.completed)
 next.rotationIndex=remaining?names.indexOf(remaining.name):0
 return {state:next,checked:!card.quick}
}
export function weekLabel(now){
 const {monday,sunday}=weekBounds(now)
 const fmt=d=>d.toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit'})
 return fmt(monday)+' a '+fmt(sunday)
}
