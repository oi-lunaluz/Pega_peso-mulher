import test from 'node:test'
import assert from 'node:assert/strict'
import {trainingGoal,weekProgress,weeklyStreak,toggleWeeklySlot} from './weeklyJourney.js'
const at=new Date(2026,10,18,9)
const state=()=>({workouts:['Inferiores','Superiores','Full body'].map(name=>({name,exercises:[]})),rotation:['Inferiores','Superiores','Full body'],scheduledDays:[1,2,3,4,5],history:[]})
test('cinco dias de treino fecham semana com dois descansos sem fixar dias',()=>{
 const p=weekProgress(state(),at)
 assert.equal(p.goal,5)
 assert.equal(p.rest,2)
 assert.deepEqual(p.slots.map(x=>x.name),['Inferiores','Superiores','Full body','Inferiores','Superiores'])
 assert.equal(p.complete,false)
})
test('marcação livre fecha semana com cinco checks e permite desfazer',()=>{
 let s=state()
 for(const n of [5,1,3,2,4])s=toggleWeeklySlot(s,n,at).state
 assert.equal(weekProgress(s,at).done,5)
 assert.equal(weekProgress(s,at).complete,true)
 assert.equal(weeklyStreak(s,at),1)
 s=toggleWeeklySlot(s,3,at).state
 assert.equal(weekProgress(s,at).done,4)
 assert.equal(weeklyStreak(s,at),0)
 assert.equal(s.history.length,4)
})
test('ofensiva considera semanas completas consecutivas, sem contar incompleta',()=>{
 let s=state()
 const past=new Date(2026,10,11,12)
 for(let n=1;n<=5;n++)s=toggleWeeklySlot(s,n,past).state
 assert.equal(weeklyStreak(s,at),1)
 for(let n=1;n<=5;n++)s=toggleWeeklySlot(s,n,at).state
 assert.equal(weeklyStreak(s,at),2)
 assert.equal(weeklyStreak(s,new Date(2026,10,30)),0)
})
test('sessão detalhada conta, mas não pode ser apagada no check rápido',()=>{
 const s=state();s.history.push({kind:'forca',name:'Inferiores',date:'16/11/2026',sets:{agachamento:[{kg:20,reps:10}]}})
 assert.equal(weekProgress(s,at).done,1)
 assert.throws(()=>toggleWeeklySlot(s,1,at))
})
test('mesmo treino pode se repetir na semana em slots independentes',()=>{
 let s=state()
 s=toggleWeeklySlot(s,1,at).state
 s=toggleWeeklySlot(s,4,at).state
 assert.equal(weekProgress(s,at).done,2)
 assert.equal(s.history[0].name,s.history[1].name)
})
test('sem fichas não cria progresso falso, mesmo se existirem dias planejados',()=>{
 const s=state();s.workouts=[];s.rotation=[]
 assert.equal(trainingGoal(s),0)
 assert.equal(weeklyStreak(s,at),0)
})
