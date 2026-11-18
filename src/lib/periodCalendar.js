import {dateKey,fromDateKey} from './planner.js'
const valid=key=>!!fromDateKey(key)
const uniqueDays=days=>[...new Set(Array.isArray(days)?days:[])].filter(valid).sort()
export const monthKey=date=>String(date).slice(0,7)
export function recordedPeriodDays(cycle){return uniqueDays(cycle?.periodDays)}
export function periodMonthEdited(cycle,date){return (cycle?.editedPeriodMonths||[]).includes(monthKey(date))}
export function earliestOfLatestPeriod(days){
 const ordered=uniqueDays(days)
 if(!ordered.length)return ''
 let first=ordered.length-1
 for(let i=ordered.length-2;i>=0;i--){
  const previous=fromDateKey(ordered[i]),current=fromDateKey(ordered[i+1])
  const gap=(Date.UTC(current.getFullYear(),current.getMonth(),current.getDate())-Date.UTC(previous.getFullYear(),previous.getMonth(),previous.getDate()))/86400000
  if(gap!==1)break
  first=i
 }
 return ordered[first]
}
export function togglePeriodDate(raw,date,now=new Date()){
 if(!valid(date))throw Error('Selecione uma data válida.')
 if(date>dateKey(now))throw Error('Não é possível registrar menstruação em uma data futura.')
 const cycle=JSON.parse(JSON.stringify(raw))
 const months=[...new Set([...(Array.isArray(cycle.editedPeriodMonths)?cycle.editedPeriodMonths:[]),monthKey(date)])]
 const days=new Set(recordedPeriodDays(cycle))
 if(days.has(date))days.delete(date)
 else days.add(date)
 cycle.periodDays=[...days].sort()
 cycle.editedPeriodMonths=months
 // Starting day of most recent consecutive recorded period. Never change
 // the average cycle length or the user's average bleeding duration.
 const latest=earliestOfLatestPeriod(cycle.periodDays)
 if(latest)cycle.start=latest
 return cycle
}
export function setLastPeriod(raw,date){
 if(date&&!valid(date))throw Error('Data inválida.')
 const cycle=JSON.parse(JSON.stringify(raw))
 cycle.start=date
 return cycle
}
export function isActualPeriodDate(cycle,date){return recordedPeriodDays(cycle).includes(date)}
export function projectedPeriodDate(cycle,date){
 if(!cycle?.start||!valid(cycle.start)||!valid(date)||date<cycle.start)return false
 if(periodMonthEdited(cycle,date))return false
 const length=Number(cycle.length),period=Number(cycle.period)
 if(!Number.isFinite(length)||length<1||!Number.isFinite(period)||period<1)return false
 const d=fromDateKey(date),start=fromDateKey(cycle.start)
 const delta=(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate())-Date.UTC(start.getFullYear(),start.getMonth(),start.getDate()))/86400000
 return delta%length<period
}
