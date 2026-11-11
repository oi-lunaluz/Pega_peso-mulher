/** Cálculos compartilhados por execução, histórico e evolução. */
export function clockLabel(seconds) {
  const time=Math.max(0,Math.floor(Number(seconds)||0))
  const parts=[Math.floor(time/3600),Math.floor(time%3600/60),time%60]
  return parts.map(n=>String(n).padStart(2,'0')).join(':')
}
export function validSet(weight,reps) {
  const kg=Number(weight),count=Number(reps)
  return String(weight).trim()!==''&&String(reps).trim()!==''&&
    Number.isFinite(kg)&&kg>=0&&Number.isInteger(count)&&count>0
}
export function totalSetVolume(sets) {
  return Object.values(sets||{}).flatMap(rows=>Array.isArray(rows)?rows:[])
    .reduce((sum,row)=>sum+Math.max(0,Number(row.kg)||0)*Math.max(0,Number(row.reps)||0),0)
}
export function maximumWeight(history,exercise,current=[]) {
  const recorded=(history||[]).flatMap(entry=>entry.sets?.[exercise]||[])
  return Math.max(0,...[...recorded,...current].map(row=>Number(row.kg)||0))
}
export function lastWeight(history,exercise) {
  const recorded=(history||[]).flatMap(entry=>entry.sets?.[exercise]||[])
  return recorded.length?Number(recorded.at(-1).kg)||0:0
}
