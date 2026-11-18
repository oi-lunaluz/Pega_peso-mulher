/**
 * Updates current workout definitions without deleting recorded session history.
 * Pure helpers also make deletion behavior testable.
 */
export function removeExerciseFromState(raw,workoutName,index){
 const next=JSON.parse(JSON.stringify(raw))
 const workout=next.workouts?.find(w=>w.name===workoutName)
 if(!workout||!Number.isInteger(index)||index<0||index>=workout.exercises.length)
   throw new Error('Exercício não encontrado nesta ficha.')
 workout.exercises.splice(index,1)
 return next
}
export function removeWorkoutFromState(raw,name){
 const next=JSON.parse(JSON.stringify(raw))
 if(!next.workouts?.some(w=>w.name===name))
   throw new Error('Ficha não encontrada.')
 const originalOrder=(next.rotation||[]).filter(n=>next.workouts.some(w=>w.name===n))
 const previousNext=originalOrder.length?originalOrder[(Number(next.rotationIndex)||0)%originalOrder.length]:null
 next.workouts=next.workouts.filter(w=>w.name!==name)
 next.rotation=(next.rotation||[]).filter(n=>n!==name)
 const remaining=next.rotation.filter(n=>next.workouts.some(w=>w.name===n))
 next.rotationIndex=remaining.length?Math.max(0,remaining.indexOf(previousNext)>=0?remaining.indexOf(previousNext):0):0
 if(Array.isArray(next.routine))next.routine=next.routine.map(slot=>
   slot?.name===name?{...slot,name:'Descanso'}:slot)
 // Old detailed and quick history remains available for progress and audit.
 return next
}
