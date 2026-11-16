import test from 'node:test'
import assert from 'node:assert/strict'
import { createAdventureDemoSnapshot } from './adventureDemo.js'
import { questWindow,questPhase } from './pixelQuest.js'
import { strengthNames } from './weeklyCards.js'
test('prévia começa com cinco fichas fictícias e não contém dados pessoais',()=>{
 const snapshot=createAdventureDemoSnapshot()
 assert.equal(snapshot.state.workouts.length,5)
 assert.equal(snapshot.state.history.length,0)
 assert.equal(snapshot.cycle.enabled,false)
 assert.equal(snapshot.profile.nickname,'Aventureira')
})
test('as cinco fases da área 2 mantêm a ordem cadastrada',()=>{
 const snap=createAdventureDemoSnapshot(),names=strengthNames(snap.state)
 const stages=questWindow(1,names,5)
 assert.deepEqual(stages.map(x=>x.number),[6,7,8,9,10])
 assert.deepEqual(stages.map(x=>x.name),names)
 assert.equal(questPhase(5),6)
})
test('editar fichas da prévia não altera o objeto inicial usado na próxima visita',async()=>{
 const {renameWorkoutState}=await import('./workoutManagement.js')
 const original=createAdventureDemoSnapshot()
 const updated=renameWorkoutState(original.state,'Quadríceps','Treino de pernas')
 assert.equal(updated.workouts[0].name,'Treino de pernas')
 assert.equal(createAdventureDemoSnapshot().state.workouts[0].name,'Quadríceps')
})
