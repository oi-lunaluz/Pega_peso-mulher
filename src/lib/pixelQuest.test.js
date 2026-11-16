import test from 'node:test'
import assert from 'node:assert/strict'
import {questName,questPhase,questChapter,questWindow} from './pixelQuest.js'
test('fase 6 não recomeça no número 1 após cinco fichas',()=>{
 const names=['Inferiores','Superiores','Glúteos','Posterior','Full body']
 assert.equal(questName(names,5),'Full body')
 assert.equal(questName(names,6),'Inferiores')
 assert.equal(questName(names,8),'Glúteos')
 assert.equal(questPhase(5),6)
})
test('sequência cadastrada sempre permanece na ordem independente da quantidade',()=>{
 const names=['A','B','C']
 assert.deepEqual([1,2,3,4,5,6,7,8].map(n=>questName(names,n)),['A','B','C','A','B','C','A','B'])
})
test('capítulos têm fases contínuas e o protótipo não altera dados originais',()=>{
 const names=['A','B']
 const before=[...names]
 assert.equal(questChapter(5),0)
 assert.equal(questChapter(6),1)
 const chapter=questWindow(1,names,5)
 assert.deepEqual(chapter.map(s=>s.number),[6,7,8,9,10])
 assert.equal(chapter[0].current,true)
 assert.deepEqual(names,before)
})
