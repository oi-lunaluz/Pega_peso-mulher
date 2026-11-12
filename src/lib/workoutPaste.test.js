import test from 'node:test'
import assert from 'node:assert/strict'
import {parsePastedWorkout} from './workoutPaste.js'

test('interpreta texto do WhatsApp separado por dias',()=>{
 const p=parsePastedWorkout('Segunda - Inferiores\n• Agachamento livre 4x12\n- Leg press - 3x10\n3. Cadeira extensora 3x15\n\nTerça: Superiores\nPuxada alta — 4x10\nRemada curvada 3 x 12\n\nQuarta-feira: Glúteos\nElevação pélvica 4x12')
 assert.deepEqual(p.sections.map(s=>s.day),[1,2,3])
 assert.deepEqual(p.sections[0].exercises,['Agachamento livre','Leg press','Cadeira extensora'])
 assert.deepEqual(p.sections[1].exercises,['Puxada alta','Remada curvada'])
 assert.equal(p.sections[2].name,'Glúteos')
})
test('identifica fichas A e B sem inventar dias',()=>{
 const p=parsePastedWorkout('Treino A - Inferiores\nAgachamento 4x10\nStiff 3x12\n\nTreino B: Superiores\nPuxada alta - 3x10\nRemada baixa - 3x12')
 assert.deepEqual(p.sections.map(s=>s.day),[null,null])
 assert.deepEqual(p.sections.map(s=>s.name),['Treino A - Inferiores','Treino B - Superiores'])
 assert.equal(p.warnings.length>0,true)
})
test('ignora prescrições isoladas, observações e duplicatas',()=>{
 const p=parsePastedWorkout('Segunda: Pernas\n1. Agachamento 4x12\n4x12\n2. Agachamento 3x10\nObs: pausar 90 segundos\nCardio: 20 min')
 assert.deepEqual(p.sections[0].exercises,['Agachamento'])
 assert.ok(p.warnings.some(w=>w.includes('Cardio')))
})
test('lista sem cabeçalho fica sem dia, aguardando confirmação',()=>{
 const p=parsePastedWorkout('Agachamento livre 3x12\nLeg press 4x10')
 assert.equal(p.sections.length,1)
 assert.equal(p.sections[0].day,null)
 assert.deepEqual(p.sections[0].exercises,['Agachamento livre','Leg press'])
})
test('texto vazio não inventa fichas',()=>{
 assert.equal(parsePastedWorkout('  ').sections.length,0)
})

test('dia em uma linha e Treino A na seguinte pertencem à mesma ficha',()=>{
 const p=parsePastedWorkout('Segunda-feira\nTreino A - Inferiores\nExercícios:\nAgachamento livre 3x12\nLeg press 4x10\nTerça-feira\nTreino B - Superiores\nPuxada alta 3x12')
 assert.equal(p.sections.length,2)
 assert.deepEqual(p.sections.map(s=>s.day),[1,2])
 assert.deepEqual(p.sections[0].exercises,['Agachamento livre','Leg press'])
 assert.equal(p.sections[1].name,'Treino B - Superiores')
})
