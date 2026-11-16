// Pure, non-mutating editing operations shared by the classic and pixel Home.
const clone=state=>JSON.parse(JSON.stringify(state))
const cleanName=value=>String(value||'').trim().replace(/\s+/g,' ')
function assertName(name,limit){
  if(!name||name.length>limit)throw new Error('Informe um nome de até '+limit+' caracteres.')
}
export function renameWorkoutState(raw,oldName,newName){
  const name=cleanName(newName);assertName(name,60)
  const next=clone(raw)
  const workout=next.workouts.find(w=>w.name===oldName)
  if(!workout)throw new Error('Não encontrei essa ficha.')
  if(next.workouts.some(w=>w.name.toLocaleLowerCase('pt-BR')===name.toLocaleLowerCase('pt-BR')&&w!==workout))
    throw new Error('Já existe uma ficha com esse nome.')
  workout.name=name
  next.rotation=(next.rotation||[]).map(x=>x===oldName?name:x)
  next.routine=(next.routine||[]).map(day=>day.name===oldName?{...day,name}:day)
  for(const h of next.history||[])if(h.kind==='forca'&&h.name===oldName)h.name=name
  return next
}
export function renameExerciseState(raw,workoutName,oldName,newName){
  const name=cleanName(newName);assertName(name,120)
  const next=clone(raw),workout=next.workouts.find(w=>w.name===workoutName)
  if(!workout||!workout.exercises.includes(oldName))throw new Error('Não encontrei esse exercício na ficha.')
  if(workout.exercises.some(e=>e.toLocaleLowerCase('pt-BR')===name.toLocaleLowerCase('pt-BR')&&e!==oldName))
    throw new Error('Esse exercício já está na ficha.')
  workout.exercises=workout.exercises.map(e=>e===oldName?name:e)
  for(const h of next.history||[]){
    if(h.kind==='forca'&&h.name===workoutName&&h.sets?.[oldName]){
      h.sets[name]=h.sets[oldName]
      if(name!==oldName)delete h.sets[oldName]
    }
  }
  return next
}
export function removeExerciseState(raw,workoutName,exercise){
  const next=clone(raw),workout=next.workouts.find(w=>w.name===workoutName)
  if(!workout)throw new Error('Ficha não encontrada.')
  workout.exercises=workout.exercises.filter(e=>e!==exercise)
  // Historical series stay untouched.
  return next
}
export function removeWorkoutState(raw,workoutName){
  const next=clone(raw)
  if(!next.workouts.some(w=>w.name===workoutName))throw new Error('Ficha não encontrada.')
  next.workouts=next.workouts.filter(w=>w.name!==workoutName)
  next.rotation=(next.rotation||[]).filter(n=>n!==workoutName)
  next.rotationIndex=Math.min(Math.max(0,Number(next.rotationIndex)||0),Math.max(0,next.rotation.length-1))
  next.routine=(next.routine||[]).map(d=>d.name===workoutName?{...d,name:'Descanso'}:d)
  // Do not delete recorded sessions or weights.
  return next
}
