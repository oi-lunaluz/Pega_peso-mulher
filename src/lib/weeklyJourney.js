import {fromBrazilDate,dateKey,fromDateKey} from './planner.js'
import {weekBounds,strengthNames} from './weeklyCards.js'

// Weekly goals use planned frequency, falling back to the number of fichas.
// Training slots are not tied to weekdays: users can train at different hours/days.
export function trainingGoal(state){
 const configured=Number(state?.weeklyWorkoutGoal)
 if(Number.isInteger(configured)&&configured>=1&&configured<=7)return configured
 const planned=Array.isArray(state?.scheduledDays)?new Set(state.scheduledDays.filter(d=>Number.isInteger(d)&&d>=0&&d<7)).size:0
 const names=strengthNames(state||{}).length
 return names?Math.min(7,planned||names):0
}
export function weekSessions(state,weekStart){
 const start=fromDateKey(weekStart)
 if(!start)return []
 const end=new Date(start);end.setDate(end.getDate()+6)
 const endKey=dateKey(end)
 return (state?.history||[]).filter(h=>{
  if(h.kind!=='forca')return false
  const d=fromBrazilDate(h.date)
  return d&&dateKey(d)>=weekStart&&dateKey(d)<=endKey
 })
}
export function weekProgress(state,now=new Date()){
 const bounds=weekBounds(now)
 const names=strengthNames(state||{})
 const goal=trainingGoal(state)
 const sessions=weekSessions(state,bounds.start)
 // A session belongs to one slot; explicitly checked slots have precedence.
 const marked=new Map()
 for(const s of sessions){
  if(s.weekSlotStart===bounds.start&&Number.isInteger(s.weekSlot)&&s.weekSlot>=1&&s.weekSlot<=goal)
    marked.set(s.weekSlot,s)
 }
 let unassigned=0
 for(const s of sessions){
  if(s.weekSlotStart===bounds.start&&Number.isInteger(s.weekSlot)&&s.weekSlot>=1&&s.weekSlot<=goal)continue
  while(marked.has(unassigned+1)&&unassigned<goal)unassigned++
  if(unassigned<goal)marked.set(++unassigned,s)
 }
 const slots=Array.from({length:goal},(_,i)=>({
  number:i+1,
  name:names.length?names[i%names.length]:'',
  done:marked.has(i+1),
  quick:!!marked.get(i+1)?.quick,
  detailed:!!marked.get(i+1)&&!marked.get(i+1)?.quick,
  entry:marked.get(i+1)||null
 }))
 return {
  start:bounds.start,end:bounds.end,goal,rest:Math.max(0,7-goal),
  done:slots.filter(s=>s.done).length,
  complete:goal>0&&slots.every(s=>s.done),
  slots
 }
}
export function weeklyStreak(state,now=new Date()){
 const current=weekBounds(now).monday
 const thisWeek=weekProgress(state,now)
 const cursor=new Date(current)
 if(!thisWeek.complete)cursor.setDate(cursor.getDate()-7)
 let weeks=0
 // Stop at the first incomplete past week. Historical goal edits may change
 // comparisons: we do not invent past completions or backfill missing weeks.
 for(let i=0;i<156;i++){
  if(!weekProgress(state,cursor).complete)break
  weeks++
  cursor.setDate(cursor.getDate()-7)
 }
 return weeks
}
export function toggleWeeklySlot(raw,slot,now=new Date()){
 const progress=weekProgress(raw,now)
 if(!Number.isInteger(slot)||slot<1||slot>progress.goal)throw new Error('Treino não encontrado nesta semana.')
 const selected=progress.slots[slot-1]
 const next=JSON.parse(JSON.stringify(raw))
 if(selected.done){
  if(!selected.quick||!selected.entry?.weekSlotStart||selected.entry.weekSlot!==slot){
   throw new Error('Treinos registrados com acompanhamento não podem ser apagados por aqui.')
  }
  const target=next.history.findIndex(h=>h.weekSlotStart===progress.start&&h.weekSlot===slot&&h.kind==='forca'&&h.quick)
  if(target<0)throw new Error('Não encontrei a marcação para desfazer.')
  next.history.splice(target,1)
 }else{
  next.history.push({
   kind:'forca',date:now.toLocaleDateString('pt-BR'),
   name:selected.name,weekSlotStart:progress.start,weekSlot:slot,
   quick:true,seconds:0,sets:{}
  })
 }
 return {state:next,checked:!selected.done}
}
