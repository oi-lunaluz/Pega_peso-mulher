import test from 'node:test'
import assert from 'node:assert/strict'
import {renameWorkoutState,renameExerciseState,removeExerciseState,removeWorkoutState} from './workoutManagement.js'
const fixture=()=>({workouts:[{name:'A',exercises:['Agachamento','Leg press']},{name:'B',exercises:['Remada']}],
  rotation:['A','B'],rotationIndex:1,routine:[{name:'A'}],
  history:[{kind:'forca',name:'A',sets:{Agachamento:[{kg:50,reps:8}]}}]})
test('alterar nome da ficha mantém ordem, rotina e histórico vinculados',()=>{
 const initial=fixture(),out=renameWorkoutState(initial,'A','Inferiores')
 assert.equal(out.rotation[0],'Inferiores')
 assert.equal(out.history[0].name,'Inferiores')
 assert.equal(out.routine[0].name,'Inferiores')
 assert.equal(initial.workouts[0].name,'A')
 assert.throws(()=>renameWorkoutState(initial,'A','B'))
})
test('alterar exercício preserva séries e pesos históricos',()=>{
 const out=renameExerciseState(fixture(),'A','Agachamento','Agachamento livre')
 assert.equal(out.history[0].sets['Agachamento livre'][0].kg,50)
 assert.equal(out.history[0].sets.Agachamento,undefined)
})
test('excluir exercício ou ficha não apaga histórico de sessões',()=>{
 const withoutExercise=removeExerciseState(fixture(),'A','Agachamento')
 assert.equal(withoutExercise.history[0].sets.Agachamento[0].kg,50)
 const withoutWorkout=removeWorkoutState(fixture(),'A')
 assert.deepEqual(withoutWorkout.rotation,['B'])
 assert.equal(withoutWorkout.history.length,1)
})
