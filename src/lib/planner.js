/**
 * Regra de negócio da agenda flexível.
 * O calendário mostra os dias combinados, mas a fila de fichas só anda
 * depois de concluir a musculação correspondente.
 * Funções puras para permitir teste sem Vue ou navegador.
 */
export const SHORT_DAYS = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb']
export const LONG_DAYS = ['Domingo','Segunda-feira','Terça-feira','Quarta-feira','Quinta-feira','Sexta-feira','Sábado']

export function dateKey(date) {
  return [date.getFullYear(), String(date.getMonth()+1).padStart(2,'0'), String(date.getDate()).padStart(2,'0')].join('-')
}
export function fromDateKey(key) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(key))) return null
  const [year,month,day] = key.split('-').map(Number)
  const date = new Date(year, month-1, day)
  return date.getFullYear()===year && date.getMonth()===month-1 && date.getDate()===day ? date : null
}
export function fromBrazilDate(value) {
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(String(value))) return null
  const [day,month,year] = value.split('/').map(Number)
  return fromDateKey([year,String(month).padStart(2,'0'),String(day).padStart(2,'0')].join('-'))
}
export function cleanDays(days) {
  return [...new Set(Array.isArray(days)?days:[])].filter(d=>Number.isInteger(d)&&d>=0&&d<7).sort((a,b)=>a-b)
}
export function countPlannedDays(anchorKey, endKey, days) {
  const anchor = fromDateKey(anchorKey), end = fromDateKey(endKey)
  if (!anchor || !end || anchor>=end) return 0
  const enabled=new Set(cleanDays(days))
  if (!enabled.size) return 0
  // Calendários antigos não devem causar iterações ilimitadas.
  const limit=36525
  let count=0,steps=0
  for(const date=new Date(anchor);date<end&&steps<limit;date.setDate(date.getDate()+1),steps++){
    if(enabled.has(date.getDay())) count++
  }
  return count
}
export function pendingBefore({ anchor, today, days, completed=0, carry=0 }) {
  return Math.max(0, Math.max(0,carry)+countPlannedDays(anchor,today,days)-Math.max(0,completed))
}
export function pendingIncludingToday({ anchor, today, days, completed=0, carry=0 }) {
  const date=fromDateKey(today)
  if(!date)return 0
  date.setDate(date.getDate()+1)
  return pendingBefore({anchor,today:dateKey(date),days,completed,carry})
}
export function sessionOnDate(history, date) {
  return (Array.isArray(history)?history:[]).filter(h=>h.kind==='forca'&&dateKey(fromBrazilDate(h.date)||new Date(0))===date)
}
export function createWeekPlan({today,days,history,rotation,nextIndex,anchor,completed,carry}) {
  const now=fromDateKey(today)
  if(!now) return []
  const monday=new Date(now)
  monday.setDate(monday.getDate()-(monday.getDay()+6)%7)
  const scheduled=new Set(cleanDays(days))
  const queue=Array.isArray(rotation)?rotation:[]
  const oldPending=pendingBefore({anchor,today,days,completed,carry})
  const todayDue=pendingIncludingToday({anchor,today,days,completed,carry})
  const out=[]
  let forecastOffset=0
  for(let i=0;i<7;i++){
    const date=new Date(monday);date.setDate(date.getDate()+i)
    const iso=dateKey(date),day=date.getDay()
    const past=date<now,isToday=iso===today,planned=scheduled.has(day)
    const logs=sessionOnDate(history,iso)
    const isComplete=logs.length>0
    const hasFinishedToday= isToday && isComplete && todayDue===0
    let status='livre'
    if(planned){
      if(past) status=isComplete?'concluído':oldPending>0?'pendente':'reorganizado'
      else if(hasFinishedToday) status='concluído'
      else status=isToday?'hoje':'previsto'
    }
    const forecast=planned&&!past&&!hasFinishedToday
    const forecastName=forecast&&queue.length?queue[(nextIndex+forecastOffset)%queue.length]:''
    if(forecast) forecastOffset++
    out.push({
      date:iso,day,short:SHORT_DAYS[day],full:LONG_DAYS[day],isToday,
      scheduled:planned,recorded:isComplete,status,
      name:logs.at(-1)?.name||forecastName
    })
  }
  // Põe a ficha que ficou pendente no último dia perdido e mantém a mesma
  // ficha no próximo dia planejado. Não duplica sessões no histórico.
  if(oldPending>0&&queue.length){
    const missed=out.filter(d=>d.status==='pendente')
    missed.slice(-oldPending).forEach((item,index)=>{
      item.name=queue[(nextIndex+index)%queue.length]
    })
  }
  return out
}
export function cardioMinutesThisWeek(history, now) {
  const monday=new Date(now.getFullYear(),now.getMonth(),now.getDate()-(now.getDay()+6)%7)
  return Math.floor((Array.isArray(history)?history:[]).reduce((sum,entry)=>{
    const day=fromBrazilDate(entry.date)
    return entry.kind==='cardio'&&day&&day>=monday&&day<=now
      ?sum+Math.max(0,Number(entry.seconds)||0):sum
  },0)/60)
}

/**
 * Prévia sem efeitos colaterais. Selecionar um dia não registra treino.
 * Assume que os dias planejados, de hoje até o escolhido, serão concluídos
 * para projetar qual ficha aparece no próximo dia de treino.
 */
export function previewAfterDay({selected,today,days,rotation,nextIndex=0,history=[]}) {
  const selectedDate=fromDateKey(selected)
  const todayDate=fromDateKey(today)
  if(!selectedDate||!todayDate)return null
  const planned=new Set(cleanDays(days))
  const queue=Array.isArray(rotation)?rotation:[]
  const completedToday= sessionOnDate(history,today).length>0
  const selectedLog=sessionOnDate(history,selected).at(-1)
  const futureOrToday=selectedDate>=todayDate
  let steps=0
  if(futureOrToday){
    // Só uma sessão planejada ainda não feita pode avançar a fila.
    for(let d=new Date(todayDate);d<=selectedDate;d.setDate(d.getDate()+1)){
      if(planned.has(d.getDay()) && !(dateKey(d)===today && completedToday))steps++
    }
  }
  const next=new Date(selectedDate)
  next.setDate(next.getDate()+1)
  let searched=0
  while(!planned.has(next.getDay())&&searched<7){next.setDate(next.getDate()+1);searched++}
  const index=queue.length?((nextIndex+steps)%queue.length):0
  const fallbackName=queue.length?queue[nextIndex%queue.length]:''
  return {
    selected,
    selectedName:selectedLog?.name||(planned.has(selectedDate.getDay())?fallbackName:''),
    selectedComplete:!!selectedLog,
    selectedScheduled:planned.has(selectedDate.getDay()),
    nextDate:planned.size?dateKey(next):null,
    nextName:queue.length?(futureOrToday?queue[index]:fallbackName):'',
    simulated:futureOrToday&&steps>0
  }
}
