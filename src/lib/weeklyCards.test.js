import test from 'node:test'
import assert from 'node:assert/strict'
import {mondayOf,weekBounds,weekStrength,toggleWeekStrength} from './weeklyCards.js'
const base=()=>({workouts:['Inferiores','Superiores','Glúteos'].map(name=>({name,exercises:[]})),rotation:['Inferiores','Superiores','Glúteos'],rotationIndex:0,history:[]})
const thu=new Date(2026,10,12,9)
test('semana é segunda a domingo, inclusive cruzando meses',()=>{
 assert.deepEqual([weekBounds(thu).start,weekBounds(thu).end],['2026-11-09','2026-11-15'])
 assert.deepEqual([weekBounds(new Date(2027,0,1)).start,weekBounds(new Date(2027,0,1)).end],['2026-12-28','2027-01-03'])
 assert.equal(mondayOf(new Date(2026,10,15)).getDay(),1)
})
test('cards correspondem às fichas, não a dias da semana',()=>{
 assert.deepEqual(weekStrength(base(),thu).map(c=>c.name),['Inferiores','Superiores','Glúteos'])
})
test('marca qualquer ficha em qualquer ordem, sem carregar ou inventar pesos',()=>{
 let s=toggleWeekStrength(base(),'Glúteos',thu).state
 s=toggleWeekStrength(s,'Inferiores',thu).state
 assert.deepEqual(weekStrength(s,thu).map(c=>c.completed),[true,false,true])
 assert.equal(s.rotationIndex,1)
 assert.ok(s.history.every(h=>h.seconds===0&&Object.keys(h.sets).length===0))
 assert.deepEqual(weekStrength(s,new Date(2026,10,16)).map(c=>c.completed),[false,false,false])
})
test('desfazer afeta só ficha marcada por check e só na semana corrente',()=>{
 let s=toggleWeekStrength(base(),'Inferiores',thu).state
 s=toggleWeekStrength(s,'Inferiores',thu).state
 assert.equal(s.history.length,0)
 assert.equal(s.rotationIndex,0)
})
test('não duplica sessão detalhada nem altera histórico',()=>{
 const s=base();s.history.push({name:'Superiores',kind:'forca',date:'11/11/2026',sets:{supino:[{kg:20,reps:8}]}})
 assert.equal(weekStrength(s,thu)[1].completed,true)
 assert.throws(()=>toggleWeekStrength(s,'Superiores',thu))
 assert.equal(s.history.length,1)
})
test('aceita Proxy reativo vindo de Vue',()=>{
 const s=toggleWeekStrength(new Proxy(base(),{}),'Glúteos',thu)
 assert.equal(s.checked,true)
})

test('check legado feito por dia pode ser desfeito na ficha semanal sem perder treinos',()=>{
 const s=base()
 s.history=[{kind:'forca',name:'Inferiores',date:'09/11/2026',quick:true,seconds:0,sets:{}}]
 s.scheduleCompleted=1
 s.scheduleAnchor='2026-11-09'
 s.quickAnchorBefore='2026-11-12'
 assert.equal(weekStrength(s,thu)[0].quick,true)
 const result=toggleWeekStrength(s,'Inferiores',thu)
 assert.equal(result.checked,false)
 assert.equal(result.state.history.length,0)
 assert.equal(result.state.scheduleCompleted,0)
 assert.equal(result.state.scheduleAnchor,'2026-11-12')
})
test('cardio histórico não é alterado pelos checks da musculação',()=>{
 const s=base()
 s.history=[{kind:'cardio',name:'Cardio',date:'10/11/2026',modality:'Bike',seconds:1800,sets:{}}]
 const result=toggleWeekStrength(s,'Inferiores',thu)
 assert.equal(result.state.history.filter(x=>x.kind==='cardio').length,1)
})
