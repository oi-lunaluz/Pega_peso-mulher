import test from 'node:test'
import assert from 'node:assert/strict'
import {estimatedCyclePhase} from './cyclePhase.js'
const cfg={enabled:true,start:'2026-11-01',length:28,period:5}
const at=d=>new Date(2026,10,d,12)
test('menstruação nos primeiros dias',()=>{
 const x=estimatedCyclePhase(cfg,at(3))
 assert.equal(x.key,'menstrual')
 assert.equal(x.day,3)
})
test('folicular, ovulatória estimada e lútea',()=>{
 assert.equal(estimatedCyclePhase(cfg,at(9)).key,'follicular')
 assert.equal(estimatedCyclePhase(cfg,at(14)).key,'ovulatory')
 assert.equal(estimatedCyclePhase(cfg,at(25)).key,'luteal')
})
test('vira o ciclo depois de 28 dias',()=>{
 const x=estimatedCyclePhase(cfg,new Date(2026,10,29,9))
 assert.equal(x.day,1)
 assert.equal(x.key,'menstrual')
})
test('nenhum palpite se não há início válido, se desativado, ou no futuro',()=>{
 assert.equal(estimatedCyclePhase({...cfg,enabled:false},at(9)),null)
 assert.equal(estimatedCyclePhase({...cfg,start:''},at(9)),null)
 assert.equal(estimatedCyclePhase({...cfg,start:'2026-11-20'},at(9)),null)
 assert.equal(estimatedCyclePhase({...cfg,length:0},at(9)),null)
})
test('atravessa mudança do ano sem erro de fuso',()=>{
 const x=estimatedCyclePhase({...cfg,start:'2026-12-27'},new Date(2027,0,1,10))
 assert.equal(x.day,6)
 assert.equal(x.key,'follicular')
})


test('dia extra marcado no calendário aparece como fase menstrual, sem alterar média',()=>{
 const cycle={...cfg,periodDays:['2026-11-06'],editedPeriodMonths:['2026-11']}
 assert.equal(estimatedCyclePhase(cycle,at(6)).key,'menstrual')
 assert.equal(estimatedCyclePhase(cycle,at(3)).key,'follicular')
 assert.equal(cycle.period,5)
})


test('menstruação antiga registrada continua visível após cadastrar ciclo mais recente',()=>{
 const cycle={...cfg,start:'2026-11-15',periodDays:['2026-11-02','2026-11-03'],editedPeriodMonths:['2026-11']}
 const phase=estimatedCyclePhase(cycle,at(2))
 assert.equal(phase.key,'menstrual')
 assert.equal(phase.day,null)
})
test('fases diferentes existem em datas diferentes do calendário, sem considerar mês todo fértil',()=>{
 const p=(day)=>estimatedCyclePhase(cfg,at(day))?.key
 assert.equal(p(3),'menstrual')
 assert.equal(p(9),'follicular')
 assert.equal(p(14),'ovulatory')
 assert.equal(p(24),'luteal')
})
