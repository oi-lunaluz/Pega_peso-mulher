import test from 'node:test'
import assert from 'node:assert/strict'
import {readJson,writeJson,normalizeTrainingState} from './storage.js'
test('preserva dados válidos da versão anterior',()=>{
 const defaults={workouts:[],history:[],routine:[]}
 const old={workouts:[{name:'Quadríceps',exercises:['Agachamento']}],history:[{name:'Quadríceps',kind:'forca',date:'11/11/2026'}],routine:[]}
 const result=normalizeTrainingState(old,defaults)
 assert.equal(result.workouts[0].name,'Quadríceps')
 assert.equal(result.history[0].kind,'forca')
 assert.deepEqual(result.history[0].sets,{})
})
test('ignora conteúdo corrompido sem derrubar a aplicação',()=>{
 const fake={getItem:()=>'{não é json'}
 assert.deepEqual(readJson('app',{enabled:false},fake),{enabled:false})
})
test('modo privado ou armazenamento bloqueado não quebra salvamento',()=>{
 const locked={setItem(){throw Error('storage blocked')}}
 assert.equal(writeJson('app',{name:'Mary'},locked),false)
})
