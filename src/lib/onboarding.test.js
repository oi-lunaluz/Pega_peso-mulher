import test from 'node:test'
import assert from 'node:assert/strict'
import {emptyTrainingState,isUnconfiguredSnapshot,createOnboardingPayload} from './onboarding.js'

test('conta sem importação não recebe fichas, histórico ou dias automáticos',()=>{
 const x=emptyTrainingState(new Date(2026,10,12))
 assert.equal(x.workouts.length,0)
 assert.equal(x.history.length,0)
 assert.equal(x.scheduledDays.length,0)
 assert.equal(x.scheduleAnchor,'2026-11-12')
})
test('reconhece fichas de exemplo antigas sem apagar fichas personalizadas',()=>{
 const examples=[
  {name:'Quadríceps',exercises:['Agachamento livre','Leg press','Cadeira extensora']},
  {name:'Superiores A',exercises:['Puxada alta','Remada baixa']},
  {name:'Posterior e glúteos',exercises:['Stiff','Mesa flexora','Elevação pélvica']},
  {name:'Superiores B',exercises:['Supino máquina','Elevação lateral']}
 ]
 assert.equal(isUnconfiguredSnapshot({state:{workouts:examples,history:[]}}),true)
 assert.equal(isUnconfiguredSnapshot({state:{workouts:[{name:'Minha ficha',exercises:[]}],history:[]}}),false)
 assert.equal(isUnconfiguredSnapshot({onboardingCompleted:true,state:{workouts:examples,history:[]}}),false)
 assert.equal(isUnconfiguredSnapshot({state:{workouts:examples,history:[{date:'12/11/2026'}]}}),false)
})
test('questionário cria somente fichas nomeadas, sem exercícios ou sessões pré-prontos',()=>{
 const payload=createOnboardingPayload({
   days:[1,2,4],workoutNames:{1:'Inferiores',2:'Superiores',4:'Inferiores'},
   goal:'Ganhar força',cardioMinutes:90,bodyWeightKg:'62.5',usualLoadKg:'25',
   nickname:'Mary',trackCycle:true,lastPeriod:'2026-11-03',cycleLength:28,periodLength:5
 },new Date(2026,10,12))
 assert.equal(payload.onboardingCompleted,true)
 assert.deepEqual(payload.state.rotation,['Inferiores','Superiores'])
 assert.equal(payload.state.workouts.length,2)
 assert.deepEqual(payload.state.workouts[0].exercises,[])
 assert.deepEqual(payload.state.history,[])
 assert.deepEqual(payload.state.scheduledDays,[1,2,4])
 assert.equal(payload.state.cardioGoal,90)
 assert.equal(payload.profile.usualLoadKg,25)
 assert.equal(payload.cycle.start,'2026-11-03')
})
test('ciclo é opcional e não exige data; cardio zero é válido',()=>{
 const p=createOnboardingPayload({
  days:[3],workoutNames:{},goal:'Saúde e bem-estar',cardioMinutes:0,
  bodyWeightKg:'',usualLoadKg:'',trackCycle:false
 },new Date(2026,10,12))
 assert.equal(p.state.workouts.length,0)
 assert.equal(p.state.cardioSessionTarget,0)
 assert.equal(p.cycle.enabled,false)
})
test('não aceita ausência de dias nem data futura de menstruação',()=>{
 const base={workoutNames:{},goal:'Ganhar força',cardioMinutes:20,
  trackCycle:true,lastPeriod:'2026-11-14'}
 assert.throws(()=>createOnboardingPayload({...base,days:[]},new Date(2026,10,12)))
 assert.throws(()=>createOnboardingPayload({...base,days:[1]},new Date(2026,10,12)))
})

test('não reinicia conta com dados menstruais ou metas personalizadas',()=>{
 assert.equal(isUnconfiguredSnapshot({
   state:{workouts:[],history:[]},
   cycle:{enabled:true,start:'2026-11-01',notes:[]}
 }),false)
 assert.equal(isUnconfiguredSnapshot({
   state:{workouts:[],history:[],cardioGoal:240}
 }),false)
 assert.equal(isUnconfiguredSnapshot({
   state:{workouts:[],history:[]},
   profile:{goal:'Emagrecer'}
 }),false)
})
