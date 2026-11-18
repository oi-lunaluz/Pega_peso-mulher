import test from 'node:test'
import assert from 'node:assert/strict'
import {achievementSummary} from './achievements.js'
import {toggleWeeklySlot} from './weeklyJourney.js'
const now=new Date(2026,10,18,9)
const base=()=>({workouts:[{name:'Inferiores',exercises:['Agachamento']}],rotation:['Inferiores'],scheduledDays:[1,2],history:[]})
const medal=(s,id,cycle={})=>achievementSummary(s,cycle,now).items.find(m=>m.id===id)
test('não desbloqueia conquistas sem registros',()=>{
 const s=base();assert.equal(achievementSummary(s,{},now).unlocked,0)
})
test('primeira semana e duas seguidas exigem meta completa',()=>{
 let s=base();for(const n of [1,2])s=toggleWeeklySlot(s,n,new Date(2026,10,11)).state
 assert.equal(medal(s,'week').unlocked,true)
 assert.equal(medal(s,'streak2').unlocked,false)
 for(const n of [1,2])s=toggleWeeklySlot(s,n,now).state
 assert.equal(medal(s,'streak2').unlocked,true)
})
test('100 kg exige carga de uma série, não volume somado',()=>{
 const s=base();s.history=[{kind:'forca',date:'18/11/2026',sets:{Agachamento:[{kg:40,reps:10}]}}]
 assert.equal(medal(s,'100kg').unlocked,false)
 s.history[0].sets.Agachamento.push({kg:100,reps:1})
 assert.equal(medal(s,'100kg').unlocked,true)
})
test('medalha de superação só com nota explícita e recorde posterior',()=>{
 const s=base();s.history=[
 {kind:'forca',date:'10/11/2026',sets:{Agachamento:[{kg:50,reps:8}]}},
 {kind:'forca',date:'18/11/2026',sets:{Agachamento:[{kg:60,reps:6}]}}]
 const notes=[{date:'2026-11-18',energy:'baixa'}]
 assert.equal(medal(s,'cycle-pr',{enabled:false,notes}).unlocked,false)
 assert.equal(medal(s,'cycle-pr',{enabled:true,notes}).unlocked,true)
})
test('cardio só desbloqueia com 150 minutos numa mesma semana',()=>{
 const s=base();s.history=[{kind:'cardio',date:'10/11/2026',seconds:4800},{kind:'cardio',date:'18/11/2026',seconds:4800}]
 assert.equal(medal(s,'cardio150').unlocked,false)
 s.history.push({kind:'cardio',date:'19/11/2026',seconds:4200})
 assert.equal(medal(s,'cardio150').unlocked,true)
})
