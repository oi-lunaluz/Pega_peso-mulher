import { dateKey, fromBrazilDate, fromDateKey, cleanDays } from './planner.js'

export const REWARDS = Object.freeze([
 { id:'first_5', threshold:5, title:'Primeiro Embalo', tier:'Medalha',description:'Cinco treinos planejados concluídos em sequência.' },
 { id:'streak_15',threshold:15,title:'Constância de Bronze',tier:'Insígnia',description:'Quinze treinos planejados sem faltar.' },
 { id:'streak_30',threshold:30,title:'Rainha da Rotina',tier:'Insígnia',description:'Trinta treinos planejados em sequência.' },
 { id:'streak_60',threshold:60,title:'Lenda do Treino',tier:'Insígnia',description:'Sessenta treinos de compromisso.' },
 { id:'streak_100',threshold:100,title:'CaraMary Supreme',tier:'Troféu',description:'Cem treinos planejados em sequência.' }
])
const addDays=(date,days)=>{const d=new Date(date);d.setDate(d.getDate()+days);return d}
const todayKey=now=>dateKey(new Date(now.getFullYear(),now.getMonth(),now.getDate()))

/**
 * Contagem de sessões programadas (não dias consecutivos do calendário).
 * Dias de descanso não quebram a sequência. Só há quebra quando um dia
 * PROGRAMADO termina sem um registro de musculação na data correspondente.
 * Registros repetidos no mesmo dia contam uma vez. Cardio não conta.
 * As revisões de agenda preservam o planejamento anterior. Em dados legados
 * sem revisões, utiliza a agenda atual como aproximação histórica.
 */
export function calculateStreak({history=[],scheduledDays=[],scheduleTimeline=[],scheduleAnchor,now=new Date()}={}){
 const days=new Set(cleanDays(scheduledDays))
 const revisions=(Array.isArray(scheduleTimeline)?scheduleTimeline:[])
   .filter(r=>fromDateKey(r?.effectiveOn)&&Array.isArray(r.days))
   .sort((a,b)=>a.effectiveOn.localeCompare(b.effectiveOn))
 const hasPlan=days.size>0||revisions.some(r=>cleanDays(r.days).length>0)
 const end=todayKey(now)
 const entries=[...new Set((Array.isArray(history)?history:[])
  .filter(h=>h?.kind==='forca').map(h=>fromBrazilDate(h.date))
  .filter(Boolean).map(dateKey))].sort()
 const valid=entries.filter(d=>d<=end)
 if(!hasPlan)return {current:0,best:0,total:valid.length,qualified:0,unlocked:[],next:REWARDS[0],remaining:5,hasSchedule:false}
 const anchor=fromDateKey(scheduleAnchor)||fromDateKey(valid[0])||fromDateKey(end)
 const first=valid.length&&fromDateKey(valid[0])<anchor?fromDateKey(valid[0]):anchor
 const counted=new Set(valid)
 let run=0,best=0,qualified=0
 let revision=0
 let activeDays=new Set(revisions.length?cleanDays(revisions[0].days):[...days])
 let count=0
 // The start date is included. Clamp very old installations to avoid excessive iteration.
 for(let day=new Date(first);dateKey(day)<=end&&count<36525;day=addDays(day,1),count++){
   const key=dateKey(day)
   while(revision+1<revisions.length&&revisions[revision+1].effectiveOn<=key)revision++
   if(revisions.length&&revisions[revision].effectiveOn<=key)
     activeDays=new Set(cleanDays(revisions[revision].days))
   if(!activeDays.has(day.getDay()))continue
   if(counted.has(key)){
     run++
     qualified++
     best=Math.max(best,run)
   }else if(key!==end){
     run=0
   }
   // Current scheduled day is still available until the day ends.
 }
 const unlocked=REWARDS.filter(r=>best>=r.threshold)
 const next=REWARDS.find(r=>best<r.threshold)||null
 return {
   current:run,best,total:valid.length,qualified,unlocked,next,
   remaining:next?Math.max(0,next.threshold-run):0,hasSchedule:true
 }
}
export function newlyUnlocked(before,after){
 const previous=new Set(before.unlocked.map(r=>r.id))
 return after.unlocked.filter(r=>!previous.has(r.id))
}
