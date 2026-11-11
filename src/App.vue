<script setup>
import { ref, computed, watch } from 'vue'
const key='pega-peso-mulher-mvp-v1'
const initial={routine:[{name:'Descanso',cardio:0},{name:'Quadríceps',cardio:30},{name:'Superiores A',cardio:30},{name:'Descanso',cardio:0},{name:'Posterior e glúteos',cardio:30},{name:'Superiores B',cardio:30},{name:'Cardio',cardio:30}],workouts:[{name:'Quadríceps',exercises:['Agachamento livre','Leg press','Cadeira extensora']},{name:'Superiores A',exercises:['Puxada alta','Remada baixa']},{name:'Posterior e glúteos',exercises:['Stiff','Mesa flexora','Elevação pélvica']},{name:'Superiores B',exercises:['Supino máquina','Elevação lateral']}],history:[]}
let saved;try{saved=JSON.parse(localStorage.getItem(key))}catch{}
const state=ref(saved&&saved.routine&&saved.workouts?saved:initial)
watch(state,v=>localStorage.setItem(key,JSON.stringify(v)),{deep:true})
const view=ref('home'),today=new Date().getDay(),day=ref(today),editDay=ref(today)
const weekdays=['Domingo','Segunda-feira','Terça-feira','Quarta-feira','Quinta-feira','Sexta-feira','Sábado']
const short=['Dom','Seg','Ter','Qua','Qui','Sex','Sáb']
const current=computed(()=>state.value.routine[day.value])
const editName=ref(''),editCardio=ref(0)
function edit(d){editDay.value=d;editName.value=state.value.routine[d].name;editCardio.value=state.value.routine[d].cardio;view.value='edit'}
function saveRoutine(){state.value.routine[editDay.value]={name:editName.value.trim()||'Descanso',cardio:Math.max(0,Number(editCardio.value)||0)};day.value=editDay.value;view.value='home'}
const workoutName=ref(''),newWorkout=ref(''),newExercise=ref('')
const workout=computed(()=>state.value.workouts.find(w=>w.name===workoutName.value))
function openWorkout(name){workoutName.value=name;view.value='workout'}
function addWorkout(){let n=newWorkout.value.trim();if(!n||state.value.workouts.some(w=>w.name===n))return;state.value.workouts.push({name:n,exercises:[]});newWorkout.value=''}
function addExercise(){let n=newExercise.value.trim();if(!n||!workout.value)return;workout.value.exercises.push(n);newExercise.value=''}
const started=ref(null),finished=ref(null),kind=ref('forca'),exercise=ref(''),kg=ref(''),reps=ref('10'),sets=ref({}),completed=ref([])
const clock=ref(Date.now());let ticker=null
function start(k){kind.value=k;started.value=Date.now();clock.value=Date.now();finished.value=null;sets.value={};completed.value=[];view.value='session';if(ticker)clearInterval(ticker);ticker=setInterval(()=>clock.value=Date.now(),1000)}
const elapsed=computed(()=>started.value?Math.max(0,Math.floor(((finished.value||clock.value)-started.value)/1000)):0)
const time=computed(()=>[Math.floor(elapsed.value/3600),Math.floor(elapsed.value%3600/60),elapsed.value%60].map(n=>String(n).padStart(2,'0')).join(':'))
function maxFor(e){return Math.max(0,...state.value.history.flatMap(h=>(h.sets[e]||[]).map(s=>s.kg)),...(sets.value[e]||[]).map(s=>s.kg))}
function lastFor(e){const a=state.value.history.flatMap(h=>h.sets[e]||[]);return a.length?a[a.length-1].kg:0}
function choose(e){exercise.value=e;kg.value=String(lastFor(e)||'');reps.value='10';view.value='exercise'}
function addSet(){const k=Number(kg.value),r=Number(reps.value);if(!(k>=0&&r>0&&kg.value!==''))return;sets.value={...sets.value,[exercise.value]:[...(sets.value[exercise.value]||[]),{kg:k,reps:r}]}}
function finish(){finished.value=Date.now();if(ticker){clearInterval(ticker);ticker=null}state.value.history.push({date:new Date().toLocaleDateString('pt-BR'),name:kind.value==='cardio'?'Cardio':workoutName.value,kind:kind.value,seconds:elapsed.value,sets:JSON.parse(JSON.stringify(sets.value))});view.value='done'}
const weeklyCardio=computed(()=>state.value.routine.reduce((a,r)=>a+Number(r.cardio||0),0))
</script>
<template>
<div class="app"><header><div><small>🐕 PEGA PESO, MULHER!</small><h1>{{view==='home'?'Bora treinar, mulher!':view==='edit'?'Editar rotina':view==='list'?'Meus treinos':view==='done'?'Treino pago!':workoutName||'Seu treino'}}</h1></div><span class="chair">🪑</span></header>
<main>
<template v-if="view==='home'"><div class="top"><div><small>HOJE É</small><h2>{{weekdays[day]}}</h2></div><button class="outline" @click="edit(day)">✏️ Editar rotina</button></div>
<p class="muted">Sua semana</p><div class="week"><button v-for="(d,i) in short" :key="i" :class="{selected:day===i}" @click="day=i">{{d}}<span>{{state.routine[i].name==='Descanso'?'–':'●'}}</span></button></div>
<section class="pink"><small>🏋️ TREINO DO DIA</small><h2>{{current.name}}</h2><button v-if="current.name!=='Descanso'&&current.name!=='Cardio'" @click="openWorkout(current.name)">Ver treino e iniciar →</button><p v-else>Sem musculação planejada neste dia.</p></section>
<section v-if="current.cardio>0" class="green"><small>🏃 CARDIO DO DIA</small><h2>{{current.cardio}} minutos</h2><button @click="start('cardio')">▶ Iniciar cardio</button></section>
<section class="soft"><b>Meta semanal de cardio</b><p>{{weeklyCardio}} min planejados · referência de 150 min moderados</p><div class="bar"><div :style="{width:Math.min(100,weeklyCardio/150*100)+'%'}"></div></div></section>
<button class="outline full" @click="view='list'">Ver e criar meus treinos</button><p class="mascot">🐕 “Se for perna, a cadeira de plástico te espera!”</p></template>
<template v-else-if="view==='edit'"><button class="back" @click="view='home'">← Voltar</button><label>Dia da semana</label><select v-model.number="editDay" @change="edit(editDay)"><option v-for="(d,i) in weekdays" :key="i" :value="i">{{d}}</option></select><label>Treino de força</label><select v-model="editName"><option value="Descanso">Descanso</option><option v-for="w in state.workouts" :key="w.name" :value="w.name">{{w.name}}</option><option value="Cardio">Somente cardio</option></select><label>Cardio planejado (minutos)</label><input v-model.number="editCardio" type="number" min="0" step="5"/><button @click="saveRoutine">Salvar alterações</button><p class="muted">Você pode alterar a rotina sempre que precisar.</p></template>
<template v-else-if="view==='list'"><button class="back" @click="view='home'">← Início</button><section v-for="w in state.workouts" :key="w.name" class="item" @click="openWorkout(w.name)"><b>{{w.name}}</b><span>{{w.exercises.length}} exercícios →</span></section><label>Criar novo treino</label><input v-model="newWorkout" placeholder="Ex.: Quadríceps"/><button @click="addWorkout">+ Criar treino</button></template>
<template v-else-if="view==='workout'"><button class="back" @click="view='home'">← Início</button><h2>{{workoutName}}</h2><section v-if="workout"><div class="item" v-for="e in workout.exercises" :key="e"><b>{{e}}</b><small>Recorde: {{maxFor(e)}} kg</small></div><label>Adicionar exercício</label><input v-model="newExercise" placeholder="Nome do exercício"/><button class="outline" @click="addExercise">+ Adicionar exercício</button></section><button @click="start('forca')">▶ Iniciar treino</button></template>
<template v-else-if="view==='session'"><section class="timer"><small>TEMPO TOTAL</small><h2>{{time}}</h2></section><template v-if="kind==='cardio'"><h2>🏃 Cardio em andamento</h2><p>Seu cronômetro continua contando.</p></template><template v-else><h3>Escolha o exercício</h3><div class="item" v-for="e in (workout?.exercises||[])" :key="e" @click="choose(e)"><div><b>{{e}}</b><small>{{(sets[e]||[]).length}} séries · Máximo {{maxFor(e)}} kg</small></div><span>{{completed.includes(e)?'✓':'→'}}</span></div></template><button class="outline" @click="finish">✓ Finalizar sessão</button></template>
<template v-else-if="view==='exercise'"><button class="back" @click="view='session'">← Exercícios</button><section class="timer"><small>TEMPO TOTAL</small><h2>{{time}}</h2></section><h2>{{exercise}}</h2><div class="stats"><section class="pink"><small>🏆 Recorde</small><h2>{{maxFor(exercise)}} kg</h2></section><section class="soft"><small>Último peso</small><h2>{{lastFor(exercise)}} kg</h2></section></div><h3>Séries de hoje</h3><div class="item" v-for="(s,i) in (sets[exercise]||[])" :key="i"><span>✓ {{i+1}}ª série</span><b>{{s.kg}} kg × {{s.reps}}</b><button class="mini" @click="sets[exercise].splice(i,1)">✕</button></div><div class="stats"><div><label>Peso (kg)</label><input type="number" min="0" v-model="kg"/></div><div><label>Repetições</label><input type="number" min="1" v-model="reps"/></div></div><button @click="addSet">+ Adicionar série</button><button class="outline" @click="completed.includes(exercise)?null:completed.push(exercise);view='session'">✓ Concluir exercício</button></template>
<template v-else-if="view==='done'"><div class="celebrate"><span>🏆🐕🪑</span><h2>Treino concluído!</h2><h1>{{time}}</h1><p>{{Object.values(sets).reduce((a,s)=>a+s.length,0)}} séries registradas</p></div><button @click="view='home'">Voltar ao início</button></template>
</main><footer>Protótipo local · dados salvos apenas neste navegador · sem cadastro ou sincronização</footer></div>
</template>