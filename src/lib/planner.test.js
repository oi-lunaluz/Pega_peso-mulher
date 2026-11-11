import test from 'node:test'
import assert from 'node:assert/strict'
import {countPlannedDays,pendingBefore,pendingIncludingToday,createWeekPlan,dateKey,cardioMinutesThisWeek,previewAfterDay} from './planner.js'
const days=[1,2,3,4] // segunda a quinta
test('quarta perdida vira pendência na quinta sem avançar ficha',()=>{
  const data={anchor:'2026-11-09',today:'2026-11-12',days,completed:2,carry:0}
  assert.equal(pendingBefore(data),1)
  assert.equal(pendingIncludingToday(data),2)
  const plan=createWeekPlan({...data,history:[
    {kind:'forca',date:'09/11/2026',name:'Quadríceps'},
    {kind:'forca',date:'10/11/2026',name:'Superiores A'}
  ],rotation:['Quadríceps','Superiores A','Posterior','Superiores B'],nextIndex:2})
  assert.equal(plan.find(d=>d.day===3).status,'pendente')
  assert.equal(plan.find(d=>d.day===4).name,'Posterior')
})
test('concluir quinta recupera a sessão perdida sem pular a seguinte',()=>{
  const data={anchor:'2026-11-09',today:'2026-11-13',days,completed:3,carry:0}
  assert.equal(pendingBefore(data),1)
  const plan=createWeekPlan({...data,history:[
    {kind:'forca',date:'09/11/2026',name:'Quadríceps'},
    {kind:'forca',date:'10/11/2026',name:'Superiores A'},
    {kind:'forca',date:'12/11/2026',name:'Posterior'},
  ],rotation:['Quadríceps','Superiores A','Posterior','Superiores B'],nextIndex:3})
  assert.equal(plan.find(d=>d.day===4).status,'concluído')
  assert.equal(plan.find(d=>d.day===4).name,'Posterior')
})
test('segunda seguinte mantém treino pendente',()=>{
  assert.equal(pendingBefore({anchor:'2026-11-09',today:'2026-11-16',days,completed:3}),1)
})
test('sem dias marcados não cria novas pendências',()=>{
  assert.equal(countPlannedDays('2026-11-09','2026-11-30',[]),0)
})
test('data local válida e inválida',()=>{
  assert.equal(dateKey(new Date(2026,10,11)),'2026-11-11')
  assert.equal(countPlannedDays('inválido','2026-11-30',days),0)
})
test('cardio soma tempo de sessões reais sem mudar sequência',()=>{
  assert.equal(cardioMinutesThisWeek([
    {kind:'cardio',date:'09/11/2026',seconds:1200},
    {kind:'cardio',date:'10/11/2026',seconds:600},
    {kind:'cardio',date:'01/11/2026',seconds:3600}
  ],new Date(2026,10,11,14)),30)
})

test('selecionar quarta projeta quinta como treino seguinte sem gravar sessão',()=>{
 const history=[]
 const p=previewAfterDay({
  selected:'2026-11-11',today:'2026-11-11',
  days:[1,2,3,4],
  rotation:['Quadríceps','Superiores A','Posterior','Superiores B'],
  nextIndex:2,history
 })
 assert.equal(p.selectedName,'Posterior')
 assert.equal(p.nextDate,'2026-11-12')
 assert.equal(p.nextName,'Superiores B')
 assert.equal(history.length,0)
})
test('selecionar dia livre mostra próximo dia planejado sem avançar ficha',()=>{
 const p=previewAfterDay({
  selected:'2026-11-13',today:'2026-11-11',
  days:[1,2,3,4],
  rotation:['Quadríceps','Superiores A','Posterior','Superiores B'],
  nextIndex:2
 })
 assert.equal(p.nextDate,'2026-11-16')
 assert.equal(p.nextName,'Quadríceps')
})
