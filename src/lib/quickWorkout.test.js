import test from 'node:test'
import assert from 'node:assert/strict'
import {toggleQuickWorkout} from './quickWorkout.js'
const initial=()=>({
 workouts:['A','B','C','D'].map(name=>({name,exercises:[]})),
 rotation:['A','B','C','D'],rotationIndex:0,
 history:[],scheduledDays:[1,2,3,4],scheduleAnchor:'2026-11-12',
 scheduleCompleted:0,scheduleCarry:0
})
test('check retroativo de segunda reorganiza pendências e sequência',()=>{
 const x=toggleQuickWorkout(initial(),'2026-11-09','2026-11-12')
 assert.equal(x.checked,true)
 assert.equal(x.completed,'A')
 assert.equal(x.state.scheduleAnchor,'2026-11-09')
 assert.equal(x.state.rotationIndex,1)
 assert.equal(x.state.scheduleCompleted,1)
 assert.equal(x.state.history[0].quick,true)
 assert.deepEqual(x.state.history[0].sets,{})
})
test('checks feitos fora da ordem dos dias ainda seguem ordem cronológica',()=>{
 let s=initial()
 s=toggleQuickWorkout(s,'2026-11-11','2026-11-12').state
 s=toggleQuickWorkout(s,'2026-11-09','2026-11-12').state
 s=toggleQuickWorkout(s,'2026-11-10','2026-11-12').state
 assert.deepEqual(s.history.filter(h=>h.quick).sort((a,b)=>a.date.localeCompare(b.date)).map(h=>h.name).sort(),['A','B','C'])
 assert.equal(s.history.find(h=>h.date==='09/11/2026').name,'A')
 assert.equal(s.history.find(h=>h.date==='10/11/2026').name,'B')
 assert.equal(s.history.find(h=>h.date==='11/11/2026').name,'C')
 assert.equal(s.rotationIndex,3)
 assert.equal(s.scheduleCompleted,3)
})
test('desfazer check reverte sessão e sequência',()=>{
 let s=toggleQuickWorkout(initial(),'2026-11-09','2026-11-12').state
 const r=toggleQuickWorkout(s,'2026-11-09','2026-11-12')
 assert.equal(r.checked,false)
 assert.equal(r.state.rotationIndex,0)
 assert.equal(r.state.scheduleCompleted,0)
 assert.equal(r.state.history.length,0)
})
test('não permite futuro, dia livre nem sessão detalhada duplicada',()=>{
 assert.throws(()=>toggleQuickWorkout(initial(),'2026-11-13','2026-11-12'))
 assert.throws(()=>toggleQuickWorkout(initial(),'2026-11-15','2026-11-16'))
 const s=initial()
 s.history=[{kind:'forca',date:'12/11/2026',name:'A',sets:{Agachamento:[{kg:30,reps:10}]}}]
 assert.throws(()=>toggleQuickWorkout(s,'2026-11-12','2026-11-12'))
})
