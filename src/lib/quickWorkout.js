import {dateKey,fromDateKey,fromBrazilDate,cleanDays,sessionOnDate} from './planner.js'

const labelBr=key=>fromDateKey(key)?.toLocaleDateString('pt-BR')||''

/**
 * Marks scheduled strength sessions done, with no fictitious sets, loads or time.
 * Mutates a cloned state only after all validation has passed.
 * Quick marks can be checked/unchecked in any order; sequence is chronological.
 */
export function toggleQuickWorkout(raw,date,today){
 const day=fromDateKey(date),todayDate=fromDateKey(today)
 if(!day||!todayDate||day>todayDate)throw new Error('Só é possível confirmar treinos de hoje ou de dias anteriores.')
 const days=cleanDays(raw.scheduledDays)
 if(!days.includes(day.getDay()))throw new Error('Este dia não está marcado para musculação na sua rotina.')
 const rotation=(raw.rotation||[]).filter(name=>raw.workouts?.some(w=>w.name===name))
 if(!rotation.length)throw new Error('Cadastre ao menos uma ficha antes de marcar um treino.')
 // Vue passes a reactive Proxy. structuredClone(proxy) throws DataCloneError.
 // JSON data is the persisted app format, so clone it before modifying any state.
 const next=JSON.parse(JSON.stringify(raw))
 const original=next.history||[]
 const sameDate=sessionOnDate(original,date)
 const quick=sameDate.find(h=>h.quick===true)
 if(sameDate.length&&!quick)throw new Error('Já existe um treino detalhado registrado neste dia.')
 const laterDetailed=original.some(h=>h.kind==='forca'&&!h.quick&&fromBrazilDate(h.date)>day)
 if(laterDetailed)throw new Error('Há um treino detalhado posterior. Para não mudar sua sequência já registrada, não é possível alterar esse dia pelo check rápido.')
 const quicks=original.filter(h=>h.kind==='forca'&&h.quick)
 const base=(Number(next.rotationIndex)||0)-quicks.length
 if(quick){
   next.history=original.filter(h=>h!==quick)
   next.scheduleCompleted=Math.max(0,(Number(next.scheduleCompleted)||0)-1)
 }else{
   next.history.push({date:labelBr(date),name:'',kind:'forca',quick:true,seconds:0,sets:{}})
   next.scheduleCompleted=(Number(next.scheduleCompleted)||0)+1
   // A newly configured schedule often starts on the registration date.
   // Backfill the anchor to the first checked day for accurate missed-day counts.
   if(!next.scheduleAnchor||next.scheduleAnchor>date){
     if(!Object.hasOwn(next,'quickAnchorBefore'))next.quickAnchorBefore=next.scheduleAnchor||''
     next.scheduleAnchor=date
   }
 }
 const updated=next.history.filter(h=>h.kind==='forca'&&h.quick)
 if(!updated.length&&Object.hasOwn(next,'quickAnchorBefore')){
   next.scheduleAnchor=next.quickAnchorBefore||dateKey(todayDate)
   delete next.quickAnchorBefore
 }
 updated.sort((a,b)=>fromBrazilDate(a.date)-fromBrazilDate(b.date))
 const first=(base%rotation.length+rotation.length)%rotation.length
 updated.forEach((entry,i)=>{entry.name=rotation[(first+i)%rotation.length]})
 next.rotationIndex=(first+updated.length)%rotation.length
 return {state:next,checked:!quick,completed:quick?.name||updated.find(e=>e.date===labelBr(date))?.name||''}
}
