import test from 'node:test'
import assert from 'node:assert/strict'
import {clockLabel,validSet,totalSetVolume,maximumWeight,lastWeight} from './trainingMath.js'
test('cronômetro formata horas sem zerar em 60 minutos',()=>{
  assert.equal(clockLabel(3661),'01:01:01')
  assert.equal(clockLabel(0),'00:00:00')
})
test('validação impede peso negativo e repetição fracionada',()=>{
  assert.equal(validSet(20,12),true)
  assert.equal(validSet(-1,10),false)
  assert.equal(validSet(20,2.5),false)
  assert.equal(validSet('',10),false)
})
test('volume, recorde e última carga vêm de dados registrados',()=>{
  const history=[{sets:{'Agachamento':[{kg:30,reps:12},{kg:40,reps:8}]}}]
  assert.equal(totalSetVolume(history[0].sets),680)
  assert.equal(maximumWeight(history,'Agachamento',[{kg:35,reps:10}]),40)
  assert.equal(lastWeight(history,'Agachamento'),40)
})
test('histórico antigo sem séries não derruba indicadores',()=>{
  assert.equal(maximumWeight([{name:'Cardio'}],'Agachamento'),0)
  assert.equal(totalSetVolume(null),0)
})
