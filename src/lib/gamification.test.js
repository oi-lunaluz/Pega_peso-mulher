import test from 'node:test'
import assert from 'node:assert/strict'
import {calculateStreak,newlyUnlocked} from './gamification.js'
const log=(date,kind='forca')=>({date,kind,name:'Treino 1'})
const evaluate=(history,now='2026-11-16',days=[1,2,3,4,5],anchor='2026-11-09')=>
 calculateStreak({history,scheduledDays:days,scheduleAnchor:anchor,now:new Date(now+'T12:00:00')})
test('cinco treinos planejados liberam Primeira Medalha, sábado e domingo não quebram',()=>{
 const logs=['09','10','11','12','13'].map(d=>log(d+'/11/2026'))
 const r=evaluate(logs)
 assert.equal(r.current,5)
 assert.equal(r.best,5)
 assert.equal(r.unlocked[0].id,'first_5')
 assert.equal(r.next.threshold,15)
 assert.equal(r.remaining,10)
})
test('uma falta de quarta rompe sequência, mesmo se treinar na quinta',()=>{
 const r=evaluate(['09','10','12','13'].map(d=>log(d+'/11/2026')))
 assert.equal(r.current,2)
 assert.equal(r.best,2)
 assert.equal(r.unlocked.length,0)
})
test('domingo de descanso não rompe sequência de treino segunda-quarta-sexta',()=>{
 const r=evaluate(['09','11','13'].map(d=>log(d+'/11/2026')),'2026-11-16',[1,3,5])
 assert.equal(r.current,3)
})
test('hoje programado ainda não concluído não quebra e treino duplicado vale só uma vez',()=>{
 const r=evaluate(['09','10','10','11','12','13'].map(d=>log(d+'/11/2026')),'2026-11-16')
 assert.equal(r.current,5)
 assert.equal(r.total,5)
})
test('cardio nunca avança medalha e dias sem agenda não geram conquistas',()=>{
 const entries=[log('09/11/2026'),log('10/11/2026','cardio')]
 assert.equal(evaluate(entries).current,0)
 assert.equal(evaluate(entries).qualified,1)
 assert.equal(evaluate(entries,'2026-11-16',[]).unlocked.length,0)
})
test('15 e 30 dias planejados geram insígnias, sem repetir prêmio',()=>{
 const entries=[]
 for(let i=0;i<42;i++){const d=new Date(2026,8,28+i);if(d.getDay()!==0&&d.getDay()!==6)entries.push(log(d.toLocaleDateString('pt-BR')))}
 const r=calculateStreak({history:entries,scheduledDays:[1,2,3,4,5],scheduleAnchor:'2026-09-28',now:new Date(2026,10,8)})
 assert.equal(r.best,30)
 assert.deepEqual(r.unlocked.slice(0,3).map(x=>x.threshold),[5,15,30])
 assert.deepEqual(newlyUnlocked(evaluate([]),r).map(x=>x.threshold),[5,15,30])
})
test('check desfeito remove progresso, sem registrar vitória fictícia',()=>{
 const one=evaluate(['09','10','11','12','13'].map(d=>log(d+'/11/2026')))
 const two=evaluate(['09','10','12','13'].map(d=>log(d+'/11/2026')))
 assert.equal(one.unlocked.length,1)
 assert.equal(two.unlocked.length,0)
 assert.equal(two.best,2)
})
