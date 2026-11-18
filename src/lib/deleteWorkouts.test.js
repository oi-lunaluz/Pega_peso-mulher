import test from 'node:test'
import assert from 'node:assert/strict'
import {removeExerciseFromState,removeWorkoutFromState} from './deleteWorkouts.js'
const original=()=>({
 workouts:[{name:'Inferiores',exercises:['Agachamento','Leg press','Agachamento']},{name:'Superiores',exercises:['Remada']}],
 rotation:['Inferiores','Superiores'],rotationIndex:1,
 routine:[{name:'Descanso'},{name:'Inferiores'},{name:'Superiores'}],
 history:[{kind:'forca',name:'Inferiores',date:'16/11/2026',sets:{'Leg press':[{kg:70,reps:10}]}}]
})
test('lixeira remove só o exercício selecionado, preservando histórico e outro duplicado',()=>{
 const s=original()
 const n=removeExerciseFromState(new Proxy(s,{}),'Inferiores',0)
 assert.deepEqual(n.workouts[0].exercises,['Leg press','Agachamento'])
 assert.deepEqual(n.history,s.history)
 assert.equal(s.workouts[0].exercises.length,3)
})
test('lixeira da ficha exclui cadastro, rotação e agenda, sem apagar registros',()=>{
 const s=original()
 const n=removeWorkoutFromState(s,'Inferiores')
 assert.deepEqual(n.workouts.map(w=>w.name),['Superiores'])
 assert.deepEqual(n.rotation,['Superiores'])
 assert.equal(n.rotationIndex,0)
 assert.equal(n.routine[1].name,'Descanso')
 assert.deepEqual(n.history,s.history)
})
test('excluir a última ficha deixa rotação vazia sem dividir por zero',()=>{
 const s=original()
 s.workouts=[s.workouts[0]]
 s.rotation=['Inferiores']
 s.rotationIndex=0
 const n=removeWorkoutFromState(s,'Inferiores')
 assert.deepEqual(n.rotation,[])
 assert.equal(n.rotationIndex,0)
})
test('não altera estado para exclusão inválida',()=>{
 const s=original()
 assert.throws(()=>removeExerciseFromState(s,'Inferiores',99))
 assert.throws(()=>removeWorkoutFromState(s,'Ficha X'))
 assert.equal(s.workouts.length,2)
})
