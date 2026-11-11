<script setup>
import { ref, computed, watch } from 'vue'
import AppIcon from './AppIcon.vue'
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
const createModal=ref(false),createError=ref('')
function openCreateModal(){newWorkout.value='';createError.value='';createModal.value=true}
const workout=computed(()=>state.value.workouts.find(w=>w.name===workoutName.value))
function openWorkout(name){workoutName.value=name;view.value='workout'}
function addWorkout(){const n=newWorkout.value.trim();if(!n){createError.value='Digite o nome do treino.';return}if(state.value.workouts.some(w=>w.name.toLowerCase()===n.toLowerCase())){createError.value='Você já tem um treino com esse nome.';return}state.value.workouts.push({name:n,exercises:[]});createModal.value=false;newWorkout.value='';createError.value='';openWorkout(n)}
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
const workoutTab=ref('fichas')
const selectedStat=ref('all')
const selectedWorkoutStat=ref('all')
const workoutStatNames=computed(()=>[...new Set([...state.value.workouts.map(w=>w.name),...state.value.history.map(h=>h.name)].filter(Boolean))])
const statsSessions=computed(()=>state.value.history.filter(h=>selectedWorkoutStat.value==='all'||h.name===selectedWorkoutStat.value))
const allExercises=computed(()=>[...new Set(statsSessions.value.flatMap(h=>Object.keys(h.sets||{})).concat(selectedWorkoutStat.value==='all'?state.value.workouts.flatMap(w=>w.exercises):(state.value.workouts.find(w=>w.name===selectedWorkoutStat.value)?.exercises||[])))])
const exerciseStats=computed(()=>statsSessions.value.flatMap(h=>Object.entries(h.sets||{}).flatMap(([name,ss])=>ss.map(s=>({name,kg:Number(s.kg)||0,reps:Number(s.reps)||0,date:h.date})))))
const bestExercise=computed(()=>exerciseStats.value.filter(s=>selectedStat.value==='all'||s.name===selectedStat.value))
const maxLoad=computed(()=>Math.max(0,...bestExercise.value.map(s=>s.kg)))
const totalVolume=computed(()=>bestExercise.value.reduce((a,s)=>a+s.kg*s.reps,0))
const completedSessions=computed(()=>statsSessions.value.length)
function onWorkoutStatChange(){selectedStat.value='all'}
const cycleKey='pega-peso-mulher-cycle-v1'
let cycleSaved;try{cycleSaved=JSON.parse(localStorage.getItem(cycleKey))}catch{}
const cycle=ref(cycleSaved||{enabled:false,start:'',length:28,period:5,notes:[]})
watch(cycle,v=>localStorage.setItem(cycleKey,JSON.stringify(v)),{deep:true})
const noteDate=ref(new Date().toISOString().slice(0,10)),noteEnergy=ref('normal'),noteSymptoms=ref(''),noteDifficulty=ref('normal')
const cycleDay=computed(()=>{if(!cycle.value.start)return null;const diff=Math.floor((new Date().setHours(12,0,0,0)-new Date(cycle.value.start+'T12:00:00').getTime())/86400000);return ((diff%Math.max(1,cycle.value.length))+Math.max(1,cycle.value.length))%Math.max(1,cycle.value.length)+1})
function addNote(){cycle.value.notes.unshift({date:noteDate.value,energy:noteEnergy.value,symptoms:noteSymptoms.value,difficulty:noteDifficulty.value});noteSymptoms.value=''}
const weeklyCardio=computed(()=>state.value.routine.reduce((a,r)=>a+Number(r.cardio||0),0))
const cycleCalendarMonth=ref(new Date().getMonth())
const cycleCalendarYear=ref(new Date().getFullYear())
function moveCycleMonth(delta){const d=new Date(cycleCalendarYear.value,cycleCalendarMonth.value+delta,1);cycleCalendarMonth.value=d.getMonth();cycleCalendarYear.value=d.getFullYear()}
function dateISO(d){return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-')}
const calendarMonthName=computed(()=>new Date(cycleCalendarYear.value,cycleCalendarMonth.value,1).toLocaleDateString('pt-BR',{month:'long',year:'numeric'}))
const cycleCalendarDays=computed(()=>{const first=new Date(cycleCalendarYear.value,cycleCalendarMonth.value,1);const offset=first.getDay();return Array.from({length:42},(_,i)=>{const d=new Date(first.getFullYear(),first.getMonth(),1-offset+i);let phase='';if(cycle.value.start){const n=Math.max(1,Number(cycle.value.length)||28);const diff=Math.round((new Date(dateISO(d)+'T12:00:00').getTime()-new Date(cycle.value.start+'T12:00:00').getTime())/86400000);if(diff>=0){const step=diff%n;phase=step<Number(cycle.value.period||5)?'period':Math.abs(step-(n-14))<=2?'fertile':''}}return {date:dateISO(d),number:d.getDate(),outside:d.getMonth()!==cycleCalendarMonth.value,phase,today:dateISO(d)===dateISO(new Date())}})})
const chartWeeks=computed(()=>{const now=new Date();return Array.from({length:4},(_,i)=>{const newest=3-i;const end=new Date(now.getFullYear(),now.getMonth(),now.getDate()-newest*7,23,59,59);const start=new Date(end.getFullYear(),end.getMonth(),end.getDate()-6);const value=statsSessions.value.reduce((total,h)=>{const parts=h.date?.split('/');if(!parts||parts.length!==3)return total;const d=new Date(Number(parts[2]),Number(parts[1])-1,Number(parts[0]));return d>=start&&d<=end?total+Object.values(h.sets||{}).flat().reduce((sum,s)=>sum+(Number(s.kg)||0)*(Number(s.reps)||0),0):total},0);return {label:'S'+(i+1),value}})})
const chartMax=computed(()=>Math.max(1,...chartWeeks.value.map(x=>x.value)))
const profileKey='pega-peso-mulher-profile-v1'
let profileSaved;try{profileSaved=JSON.parse(localStorage.getItem(profileKey))}catch{}
const profile=ref(profileSaved||{nickname:'',goal:'Ganhar força e massa muscular'})
watch(profile,value=>localStorage.setItem(profileKey,JSON.stringify(value)),{deep:true})

const todayWorkout=computed(()=>state.value.workouts.find(w=>w.name===current.value.name))
const strengthThisMonth=computed(()=>{const prefix=new Date().toLocaleDateString('pt-BR').slice(3);return state.value.history.filter(h=>h.kind==='forca'&&h.date?.slice(3)===prefix).length})
const personalRecords=computed(()=>new Set(state.value.history.flatMap(h=>Object.keys(h.sets||{})).filter(e=>state.value.history.some(h=>(h.sets?.[e]||[]).length)) ).size)
const homeGreeting=computed(()=>{const hour=new Date().getHours();return hour<12?'Bom dia':hour<18?'Boa tarde':'Boa noite'})
const selectedWorkoutIsStrength=computed(()=>current.value.name!=='Descanso'&&current.value.name!=='Cardio')
function openToday(){if(todayWorkout.value)openWorkout(todayWorkout.value.name);else view.value='list'}
</script>
<template>
<div class="app" :class="{'on-home':view==='home','brazil-app':view!=='home'}">
<header :class="{'home-header':view==='home','brazil-header':view!=='home'}">
<div><small class="brand-wordmark"><span class="brand-mark"><AppIcon name="dumbbell" :size="17"/></span> PEGA PESO, MULHER!</small><h1 v-if="view!=='home'">{{view==='edit'?'Editar rotina':view==='list'?'Meus treinos':view==='stats'?'Minha evolução':view==='cycle'?'Meu ciclo':view==='routine'?'Minha semana':view==='profile'?'Meu perfil':view==='done'?'Missão cumprida!':view==='session'?'Treino em ação':view==='exercise'?exercise:workoutName||'Seu treino'}}</h1></div>
<button v-if="view!=='profile'" class="header-profile" title="Meu perfil" aria-label="Abrir meu perfil" @click="view='profile'"><AppIcon name="user" :size="21"/></button>
<button v-else class="header-profile" aria-label="Voltar ao início" @click="view='home'"><AppIcon name="close" :size="20"/></button>
</header>
<main>
<template v-if="view==='home'">
<div class="home-greeting">
 <div class="greeting-copy"><span class="eyebrow">BORA PRA CIMA!</span><h2>{{homeGreeting}},<br/><em>mulher!</em></h2><p>O caramelo tá de olho na sua evolução!</p></div>
 <img class="home-dog" src="/caramelo-treino.svg" alt="Cachorro caramelo de óculos e bandana rosa, sorrindo"/>
</div>
<div class="home-week"><div class="home-section-title"><strong>Sua semana</strong><button class="home-text-link" @click="view='routine'">Editar <span aria-hidden="true">›</span></button></div><div class="home-week-days"><button v-for="(d,i) in short" :key="i" :class="{active:day===i,hasWorkout:state.routine[i].name!=='Descanso'&&state.routine[i].name!=='Cardio'}" :aria-label="d+': '+state.routine[i].name" @click="day=i"><span>{{d}}</span><AppIcon v-if="state.routine[i].name!=='Descanso'&&state.routine[i].name!=='Cardio'" name="dumbbell" :size="15" :strokeWidth="2.6"/><span v-else class="week-rest-mark">{{state.routine[i].name==='Cardio'?'•':'–'}}</span></button></div></div>
<div class="home-metrics">
 <button class="home-metric mint" @click="view='stats'"><small>Treinos no mês</small><strong>{{strengthThisMonth}}</strong><span class="metric-caption">Você tá construindo!</span></button>
 <button class="home-metric peach" @click="view='stats'"><small>Exercícios registrados</small><strong>{{personalRecords}}</strong><span class="metric-caption">Sua evolução conta!</span></button>
</div>
<section class="home-today">
 <div class="home-today-header"><span class="eyebrow">TREINO DO DIA</span><span class="today-pill">{{weekdays[day]}}</span></div>
 <div class="home-today-body"><div><h2>{{current.name}}</h2><p v-if="selectedWorkoutIsStrength">{{todayWorkout?.exercises.length || 0}} exercícios · no seu ritmo</p><p v-else>Hoje é dia de {{current.name==='Cardio'?'movimentar o corpo':'descansar e recuperar'}}</p></div></div>
 <button class="home-primary" v-if="selectedWorkoutIsStrength" @click="openToday">Iniciar treino <span aria-hidden="true">→</span></button>
 <button class="home-primary" v-else-if="current.cardio>0" @click="start('cardio')">Iniciar cardio <span aria-hidden="true">→</span></button>
 <button class="home-primary" v-else @click="view='list'">Ver meus treinos <span aria-hidden="true">→</span></button>
</section>
<div class="home-bottom-grid">
 <button class="home-cardio" @click="view='routine'"><span class="eyebrow">SEU CARDIO</span><strong>{{weeklyCardio}} <small>min</small></strong><span>Meta semanal: 150 min</span><span class="home-progress"><i :style="{width:Math.min(100,weeklyCardio/150*100)+'%'}"></i></span><img src="/caramelo-descanso.svg" alt="" aria-hidden="true"/></button>
 <button class="home-cycle" @click="view='cycle'"><span class="eyebrow">SEU CICLO</span><strong>{{cycle.enabled&&cycleDay?'Dia '+cycleDay:'Meu ciclo'}}</strong><span>{{cycle.enabled?'Seu acompanhamento':'Acompanhe como se sente'}}</span><span class="cycle-more">Ver ciclo ↗</span></button>
</div>
<div class="home-footer-note">O peso varia. A evolução continua.</div>
</template>
<template v-else-if="view==='routine'">
<div class="brazil-banner yellow"><div><span class="kicker"><AppIcon name="calendar" :size="17"/> SEU PLANEJAMENTO</span><h2>Uma semana<br/>do seu jeito!</h2><p>Treino forte, descanso também. <AppIcon name="heart" :size="17"/></p></div><img class="banner-dog" src="/caramelo-treino.svg" alt="" aria-hidden="true"/></div>
<div class="brazil-summary"><div><small><AppIcon name="run" :size="17"/> CARDIO PLANEJADO</small><strong>{{weeklyCardio}} <em>min / semana</em></strong><span class="progress-track"><i :style="{width:Math.min(100,weeklyCardio/150*100)+'%'}"></i></span></div><small>150 min moderados é uma referência, não um limite.</small></div>
<div class="brazil-row-title"><h3>Seus dias</h3><span>Toque para editar <AppIcon name="pencil" :size="17"/></span></div>
<div class="brazil-list">
<button v-for="(r,i) in state.routine" :key="i" class="brazil-list-row day-row" @click="edit(i)">
<span class="row-icon" :class="i%2?'pink-icon':'mint-icon'"><AppIcon :name="r.name==='Descanso'?'palm':r.name==='Cardio'?'run':'dumbbell'"/></span>
<span class="row-info"><strong>{{weekdays[i]}}</strong><small>{{r.name}} <span v-if="r.cardio">· <AppIcon name="run" :size="17"/> {{r.cardio}} min</span></small></span><span class="row-arrow">›</span>
</button></div>
<button class="outline brazil-outline" @click="view='list'"><AppIcon name="dumbbell" :size="17"/> Gerenciar minhas fichas</button></template>
<template v-else-if="view==='stats'">
<div class="brazil-banner pink-banner"><div><span class="kicker"><AppIcon name="chart" :size="17"/> O PESO VARIA...</span><h2>Sua evolução<br/>continua!</h2><p>Cada repetição conta. <AppIcon name="heart" :size="17"/></p></div><img class="banner-dog" src="/caramelo-treino.svg" alt="" aria-hidden="true"/></div>
<div class="stats-workout-filter">
<label class="brazil-label" for="filter-workout">Filtrar por treino</label>
<select id="filter-workout" class="brazil-select" v-model="selectedWorkoutStat" @change="onWorkoutStatChange">
<option value="all">Todos os treinos</option>
<option v-for="name in workoutStatNames" :key="name" :value="name">{{name}}</option>
</select>
<p>Os números abaixo consideram {{selectedWorkoutStat==='all'?'todos os treinos registrados':'somente o treino '+selectedWorkoutStat}}.</p>
</div>
<div class="brazil-stats"><div class="stat-tile yellow-tile"><span><AppIcon name="dumbbell" :size="17"/> VOLUME REGISTRADO</span><strong>{{totalVolume.toLocaleString('pt-BR')}}<small> kg</small></strong></div><div class="stat-tile mint-tile"><span><AppIcon name="trophy" :size="17"/> MAIOR CARGA</span><strong>{{maxLoad}}<small> kg</small></strong></div></div>
<section class="chart-card"><div class="brazil-row-title"><h3>Volume de treino</h3><span>Últimas 4 semanas</span></div><div class="chart-bars"><div v-for="w in chartWeeks" :key="w.label" class="chart-column"><strong>{{w.value>0?w.value.toLocaleString('pt-BR'):'–'}}</strong><div class="chart-rail"><div :style="{height:Math.max(3,w.value/chartMax*100)+'%'}"></div></div><small>{{w.label}}</small></div></div><p class="chart-footnote">Volume = peso × repetições das séries registradas.</p></section>
<div class="brazil-row-title"><h3>Seu histórico</h3><span>{{completedSessions}} sessões</span></div>
<label class="brazil-label" for="filter-exercise">Filtrar por exercício</label>
<select id="filter-exercise" class="brazil-select" v-model="selectedStat"><option value="all">Todos os exercícios</option><option v-for="e in allExercises" :key="e" :value="e">{{e}}</option></select>
<div v-if="!bestExercise.length" class="brazil-empty"><strong><AppIcon name="smile" :size="17"/> Começou agora?</strong><p>{{selectedWorkoutStat==='all'?'Registre suas séries e veja sua evolução crescer por aqui!':'Ainda não há séries registradas para este treino.'}}</p></div>
<div class="brazil-list"><div v-for="(s,i) in [...bestExercise].reverse().slice(0,20)" :key="i" class="brazil-list-row"><span class="row-icon pink-icon"><AppIcon name="dumbbell" :size="17"/></span><span class="row-info"><strong>{{s.name}}</strong><small>{{s.date}}</small></span><span class="row-value">{{s.kg}} kg × {{s.reps}}</span></div></div>
<div class="brazil-row-title"><h3>Treinos concluídos</h3></div><div v-if="!statsSessions.length" class="brazil-empty">Nenhuma sessão concluída neste filtro.</div><div class="brazil-list"><div v-for="(h,i) in [...statsSessions].reverse().slice(0,10)" :key="i" class="brazil-list-row"><span class="row-icon mint-icon"><AppIcon name="check" :size="17"/></span><span class="row-info"><strong>{{h.name}}</strong><small>{{h.date}}</small></span><span class="row-value">{{Math.round(h.seconds/60)}} min</span></div></div>
</template>
<template v-else-if="view==='cycle'">
<div class="brazil-banner cycle-banner"><div><span class="kicker"><AppIcon name="flower" :size="17"/> SEU CORPO, SEU RITMO</span><h2>Meu ciclo</h2><p>Seu bem-estar também faz parte do treino.</p></div><img class="banner-dog" src="/caramelo-treino.svg" alt="" aria-hidden="true"/></div>
<div class="cycle-toggle"><div><strong><AppIcon name="heart" :size="17"/> Acompanhar meu ciclo</strong><small>Opcional · salvo só neste navegador</small></div><label class="cycle-switch"><input type="checkbox" v-model="cycle.enabled"/><span></span></label></div>
<template v-if="cycle.enabled">
<section class="calendar-card"><div class="month-nav"><button aria-label="Mês anterior" @click="moveCycleMonth(-1)">‹</button><strong>{{calendarMonthName}}</strong><button aria-label="Próximo mês" @click="moveCycleMonth(1)">›</button></div><div class="calendar-grid"><span v-for="(day,i) in ['D','S','T','Q','Q','S','S']" :key="i" class="weekday">{{day}}</span><span v-for="d in cycleCalendarDays" :key="d.date" :class="['calendar-cell',d.phase,{outside:d.outside,today:d.today}]">{{d.number}}</span></div><div class="calendar-legend"><span><AppIcon name="heart" :size="17"/> Menstruação estimada</span><span><AppIcon name="leaf" :size="17"/> Janela fértil estimada</span></div></section>
<div class="cycle-info"><strong><AppIcon name="flower" :size="17"/> {{cycleDay?'Dia '+cycleDay+' do ciclo':'Vamos começar?'}}</strong><span>As fases são estimativas; não use para contracepção ou diagnóstico.</span></div>
<div class="brazil-row-title"><h3>Informações do ciclo</h3></div>
<div class="brazil-form-grid"><div><label class="brazil-label">Última menstruação</label><input type="date" v-model="cycle.start"/></div><div><label class="brazil-label">Ciclo médio (dias)</label><input type="number" min="15" max="60" v-model.number="cycle.length"/></div><div><label class="brazil-label">Duração (dias)</label><input type="number" min="1" max="15" v-model.number="cycle.period"/></div></div>
<div class="brazil-row-title"><h3>Como você se sente?</h3><span>Um dia de cada vez <AppIcon name="sparkles" :size="17"/></span></div>
<div class="brazil-form"><label class="brazil-label">Data</label><input type="date" v-model="noteDate"/><div class="two-fields"><div><label class="brazil-label">Energia <AppIcon name="zap" :size="17"/></label><select v-model="noteEnergy"><option value="baixa">Baixa</option><option value="normal">Normal</option><option value="alta">Alta</option></select></div><div><label class="brazil-label">Treino <AppIcon name="dumbbell" :size="17"/></label><select v-model="noteDifficulty"><option value="leve">Leve</option><option value="normal">Normal</option><option value="pesada">Pesada</option></select></div></div><label class="brazil-label">Sintomas e observações</label><textarea v-model="noteSymptoms" placeholder="Cólica, humor, disposição... (opcional)"></textarea><button class="brazil-primary" @click="addNote"><AppIcon name="plus" :size="17"/> Salvar meu registro</button></div>
<div class="brazil-list"><div v-for="(n,i) in cycle.notes" :key="i" class="brazil-list-row"><span class="row-icon pink-icon"><AppIcon name="heart" :size="17"/></span><span class="row-info"><strong>{{n.date}} · Energia {{n.energy}}</strong><small>{{n.symptoms||'Sem observações'}} · Treino {{n.difficulty}}</small></span></div></div>
</template>
<div v-else class="brazil-empty with-dog"><img src="/caramelo-descanso.svg" alt="Cachorro caramelo descansando na cadeira"/><strong>Seu ciclo, suas regras!</strong><p>Ative quando quiser registrar menstruação, energia e sintomas. Tudo é opcional.</p></div>
<p class="privacy-note"><AppIcon name="lock" :size="17"/> Dados apenas neste navegador. Evite preencher em dispositivos compartilhados.</p>
</template>
<template v-else-if="view==='edit'">
<button class="back" @click="view='routine'">← Voltar à semana</button>
<div class="brazil-banner yellow"><div><span class="kicker"><AppIcon name="pencil" :size="17"/> PERSONALIZE</span><h2>Treino do dia</h2><p>A rotina é sua — mude sem culpa! <AppIcon name="sun" :size="17"/></p></div><img class="banner-dog" src="/caramelo-treino.svg" alt="" aria-hidden="true"/></div>
<div class="brazil-form"><label class="brazil-label">Dia da semana</label><select v-model.number="editDay" @change="edit(editDay)"><option v-for="(d,i) in weekdays" :key="i" :value="i">{{d}}</option></select><label class="brazil-label">Treino de força</label><select v-model="editName"><option value="Descanso">Descanso</option><option v-for="w in state.workouts" :key="w.name" :value="w.name">{{w.name}}</option><option value="Cardio">Somente cardio</option></select><label class="brazil-label">Cardio planejado (minutos)</label><input v-model.number="editCardio" type="number" min="0" step="5"/><button class="brazil-primary" @click="saveRoutine"><AppIcon name="check" :size="17"/> Salvar alterações</button></div></template>
<template v-else-if="view==='list'">
<div class="brazil-banner workouts-banner"><div><span class="kicker"><AppIcon name="dumbbell" :size="17"/> SUAS FICHAS</span><h2>Treino de milhões!</h2><p>Um exercício de cada vez, gata. <AppIcon name="heart" :size="17"/></p></div><img class="banner-dog" src="/caramelo-treino.svg" alt="" aria-hidden="true"/></div>
<div class="brazil-tabs"><button :class="{active:workoutTab==='fichas'}" @click="workoutTab='fichas'">Minhas fichas</button><button :class="{active:workoutTab==='historico'}" @click="workoutTab='historico'">Histórico</button></div>
<template v-if="workoutTab==='fichas'"><div class="brazil-row-title"><h3>{{state.workouts.length}} fichas cadastradas</h3></div>
<div class="brazil-list"><button v-for="(w,i) in state.workouts" :key="w.name" class="brazil-list-row" @click="openWorkout(w.name)"><span class="row-icon" :class="i%2?'purple-icon':'pink-icon'"><AppIcon name="dumbbell"/></span><span class="row-info"><strong>{{w.name}}</strong><small>{{w.exercises.length}} exercícios</small></span><span class="row-arrow">›</span></button></div>
<button class="brazil-primary" @click="openCreateModal"><AppIcon name="plus" :size="17"/> Criar nova ficha</button><div class="dog-quote"><img src="/caramelo-descanso.svg" alt="Caramelo relaxando"/><p>“Descanso também é treino, viu?!” <AppIcon name="palm" :size="17"/></p></div></template>
<template v-else><div class="brazil-row-title"><h3>Treinos finalizados</h3><span>{{state.history.length}} registros</span></div><div v-if="!state.history.length" class="brazil-empty"><AppIcon name="smile" :size="17"/> Quando você concluir um treino, ele aparecerá aqui!</div><div class="brazil-list"><div v-for="(h,i) in [...state.history].reverse()" :key="i" class="brazil-list-row"><span class="row-icon mint-icon"><AppIcon name="check" :size="17"/></span><span class="row-info"><strong>{{h.name}}</strong><small>{{h.date}}</small></span><span class="row-value">{{Math.round(h.seconds/60)}} min</span></div></div></template>
</template>
<template v-else-if="view==='workout'">
<button class="back" @click="view='list'">← Minhas fichas</button>
<div class="brazil-banner workouts-banner"><div><span class="kicker"><AppIcon name="dumbbell" :size="17"/> SUA FICHA</span><h2>{{workoutName}}</h2><p>{{workout?.exercises.length||0}} exercícios preparados</p></div><img class="banner-dog" src="/caramelo-treino.svg" alt="" aria-hidden="true"/></div>
<div class="brazil-row-title"><h3>Exercícios</h3><span>Escolha sua ordem depois</span></div><div class="brazil-list"><div class="brazil-list-row" v-for="(e,i) in (workout?.exercises||[])" :key="e"><span class="row-icon" :class="i%2?'purple-icon':'pink-icon'"><AppIcon name="dumbbell" :size="17"/></span><span class="row-info"><strong>{{e}}</strong><small><AppIcon name="trophy" :size="17"/> Recorde {{maxFor(e)}} kg</small></span></div></div>
<div class="brazil-form"><label class="brazil-label">Adicionar exercício</label><div class="input-inline"><input v-model="newExercise" placeholder="Ex.: Agachamento livre" @keyup.enter="addExercise"/><button class="brazil-square-add" aria-label="Adicionar exercício" @click="addExercise"><AppIcon name="plus" :size="17"/></button></div></div>
<button class="brazil-primary" @click="start('forca')"><AppIcon name="arrow" :size="17"/> Iniciar treino</button></template>
<template v-else-if="view==='session'">
<div class="session-timer"><span><AppIcon name="timer" :size="17"/> TREINO EM ANDAMENTO</span><strong>{{time}}</strong><small>{{kind==='cardio'?'Bora movimentar!':'Você decide a ordem dos exercícios'}}</small></div>
<template v-if="kind==='cardio'"><div class="brazil-banner mint-banner"><div><span class="kicker"><AppIcon name="run" :size="17"/> CARDIO</span><h2>Vai no seu ritmo!</h2><p>O caramelo tá torcendo por você.</p></div><img class="banner-dog" src="/caramelo-treino.svg" alt="" aria-hidden="true"/></div></template>
<template v-else><div class="brazil-row-title"><h3>Seus exercícios</h3><span>{{completed.length}} / {{workout?.exercises.length||0}} concluídos</span></div>
<div class="brazil-list"><button v-for="(e,i) in (workout?.exercises||[])" :key="e" class="brazil-list-row" @click="choose(e)"><span class="row-icon" :class="completed.includes(e)?'mint-icon':i%2?'purple-icon':'pink-icon'"><AppIcon :name="completed.includes(e)?'check':'dumbbell'"/></span><span class="row-info"><strong>{{e}}</strong><small>{{(sets[e]||[]).length}} séries · Recorde {{maxFor(e)}} kg</small></span><span class="row-arrow">›</span></button></div></template>
<button class="brazil-complete" @click="finish"><AppIcon name="check" :size="17"/> Concluir treino</button></template>
<template v-else-if="view==='exercise'">
<button class="back" @click="view='session'">← Voltar aos exercícios</button>
<div class="session-timer compact"><span><AppIcon name="timer" :size="17"/> TEMPO DE TREINO</span><strong>{{time}}</strong></div>
<div class="brazil-banner workouts-banner"><div><span class="kicker"><AppIcon name="dumbbell" :size="17"/> BORA PRA CIMA</span><h2>{{exercise}}</h2><p>Capricha nessa série!</p></div><img class="banner-dog" src="/caramelo-treino.svg" alt="" aria-hidden="true"/></div>
<div class="brazil-stats"><div class="stat-tile yellow-tile"><span><AppIcon name="trophy" :size="17"/> SEU RECORDE</span><strong>{{maxFor(exercise)}}<small> kg</small></strong></div><div class="stat-tile mint-tile"><span>↗ ÚLTIMA CARGA</span><strong>{{lastFor(exercise)}}<small> kg</small></strong></div></div>
<div class="brazil-row-title"><h3>Séries de hoje</h3><span>{{(sets[exercise]||[]).length}} registradas</span></div>
<div class="brazil-list"><div class="brazil-list-row" v-for="(s,i) in (sets[exercise]||[])" :key="i"><span class="row-icon mint-icon"><AppIcon name="check" :size="17"/></span><span class="row-info"><strong>{{i+1}}ª série</strong><small>{{s.kg}} kg × {{s.reps}} repetições</small></span><button class="remove-set" :aria-label="'Excluir série '+(i+1)" @click="sets[exercise].splice(i,1)">✕</button></div></div>
<div class="brazil-form"><div class="two-fields"><div><label class="brazil-label">Peso (kg)</label><input type="number" min="0" v-model="kg" inputmode="decimal"/></div><div><label class="brazil-label">Repetições</label><input type="number" min="1" v-model="reps" inputmode="numeric"/></div></div><button class="brazil-primary" @click="addSet"><AppIcon name="plus" :size="17"/> Adicionar série</button></div>
<button class="brazil-outline" @click="completed.includes(exercise)?null:completed.push(exercise);view='session'"><AppIcon name="check" :size="17"/> Concluir exercício</button></template>
<template v-else-if="view==='done'"><div class="brazil-celebrate"><span class="trophy"><AppIcon name="trophy" :size="42"/></span><h2>Mandou muito,<br/>mulher!</h2><p>O caramelo tá orgulhoso de você!</p><img src="/caramelo-treino.svg" alt="Cachorro caramelo comemorando"/><strong>{{time}}</strong><small>{{Object.values(sets).reduce((sum,s)=>sum+s.length,0)}} séries registradas</small></div><button class="brazil-primary" @click="view='home'">Voltar ao início ↗</button></template>
<template v-else-if="view==='profile'"><div class="brazil-banner pink-banner"><div><span class="kicker"><AppIcon name="flower" :size="17"/> MINHA ÁREA</span><h2>Meu perfil</h2><p>Seu espaço, suas escolhas. <AppIcon name="heart" :size="17"/></p></div><img class="banner-dog" src="/caramelo-treino.svg" alt="" aria-hidden="true"/></div><div class="profile-card"><span class="profile-avatar"><AppIcon name="user" :size="34"/></span><div><strong>{{profile.nickname||'Mulher poderosa!'}}</strong><small>Pega Peso, Mulher! <AppIcon name="heart" :size="17"/></small></div></div><div class="brazil-form"><label class="brazil-label">Como quer ser chamada?</label><input v-model="profile.nickname" maxlength="40" placeholder="Seu apelido"/><label class="brazil-label">Seu objetivo</label><select v-model="profile.goal"><option>Ganhar força e massa muscular</option><option>Mais condicionamento</option><option>Manter a rotina</option><option>Saúde e bem-estar</option></select><small>As alterações ficam salvas neste navegador.</small></div><div class="brazil-list"><button class="brazil-list-row" @click="view='routine'"><span class="row-icon yellow-icon"><AppIcon name="calendar" :size="17"/></span><span class="row-info"><strong>Minha rotina</strong><small>Editar dias e treinos</small></span><span class="row-arrow">›</span></button><button class="brazil-list-row" @click="view='stats'"><span class="row-icon mint-icon"><AppIcon name="chart" :size="17"/></span><span class="row-info"><strong>Minha evolução</strong><small>Acompanhar os registros</small></span><span class="row-arrow">›</span></button></div><p class="privacy-note"><AppIcon name="lock" :size="17"/> Nesta versão, não há conta online. Os dados ficam somente neste dispositivo.</p></template>
</main><div v-if="createModal" class="modal-backdrop" @click.self="createModal=false"><div class="modal-sheet" role="dialog" aria-modal="true" aria-label="Criar novo treino"><div class="modal-head"><div><small>NOVO TREINO</small><h2>Criar treino <AppIcon name="dumbbell" :size="17"/></h2></div><button class="close-modal" aria-label="Fechar" @click="createModal=false">✕</button></div><p class="muted">Dê um nome ao seu treino. Depois você poderá adicionar os exercícios.</p><form @submit.prevent="addWorkout"><label for="new-workout-name">Nome do treino</label><input id="new-workout-name" v-model="newWorkout" placeholder="Ex.: Glúteos e posterior" maxlength="60" autofocus/><p v-if="createError" class="field-error">{{createError}}</p><div class="modal-actions"><button type="button" class="outline" @click="createModal=false">Cancelar</button><button type="submit">Criar treino</button></div></form></div></div><nav class="bottom-nav" aria-label="Navegação principal"><button v-for="tab in [{id:'home',icon:'home',label:'Início'},{id:'list',icon:'dumbbell',label:'Treinos'},{id:'routine',icon:'calendar',label:'Rotina'},{id:'stats',icon:'chart',label:'Evolução'},{id:'cycle',icon:'flower',label:'Ciclo'}]" :key="tab.id" :class="{active:view===tab.id}" @click="view=tab.id"><AppIcon :name="tab.icon" :size="21" :strokeWidth="view===tab.id?2.6:2"/><small>{{tab.label}}</small></button></nav><footer>Protótipo local · dados salvos apenas neste navegador · sem cadastro ou sincronização</footer></div>
</template>