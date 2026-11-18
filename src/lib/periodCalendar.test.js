import test from 'node:test'
import assert from 'node:assert/strict'
import {togglePeriodDate,projectedPeriodDate,isActualPeriodDate,earliestOfLatestPeriod} from './periodCalendar.js'
const today=new Date(2026,10,18)
const base=()=>({enabled:true,start:'2026-10-12',length:28,period:5,periodDays:[],editedPeriodMonths:[]})
test('editar um dia não marca o período inteiro automaticamente',()=>{
 let c=togglePeriodDate(base(),'2026-11-10',today)
 assert.deepEqual(c.periodDays,['2026-11-10'])
 assert.equal(c.start,'2026-11-10')
 assert.equal(c.period,5)
 assert.equal(c.length,28)
 assert.equal(projectedPeriodDate(c,'2026-11-11'),false)
})
test('cada dia rosa é independente e o lápis pode desfazer seleção',()=>{
 let c=base()
 for(const d of ['2026-11-12','2026-11-10','2026-11-11'])c=togglePeriodDate(c,d,today)
 assert.equal(c.start,'2026-11-10')
 assert.equal(c.periodDays.length,3)
 c=togglePeriodDate(c,'2026-11-11',today)
 assert.equal(isActualPeriodDate(c,'2026-11-11'),false)
 assert.equal(c.period,5)
})
test('estimativa antiga só vale nos meses que ainda não foram editados',()=>{
 const c=base()
 assert.equal(projectedPeriodDate(c,'2026-10-13'),true)
 const changed=togglePeriodDate(c,'2026-11-10',today)
 assert.equal(isActualPeriodDate(changed,'2026-11-10'),true)
 assert.equal(projectedPeriodDate(changed,'2026-11-11'),false)
})
test('dias registrados em meses diferentes preservam histórico e ajustam último início',()=>{
 let c=base()
 c=togglePeriodDate(c,'2026-10-12',today)
 c=togglePeriodDate(c,'2026-10-13',today)
 c=togglePeriodDate(c,'2026-11-16',today)
 c=togglePeriodDate(c,'2026-11-17',today)
 assert.deepEqual(c.periodDays,['2026-10-12','2026-10-13','2026-11-16','2026-11-17'])
 assert.equal(c.start,'2026-11-16')
 assert.equal(earliestOfLatestPeriod(c.periodDays),'2026-11-16')
})
test('não permite marcar dia futuro',()=>{
 assert.throws(()=>togglePeriodDate(base(),'2026-11-21',today))
})
