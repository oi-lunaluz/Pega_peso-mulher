<script setup>
import { inject } from 'vue'
import AppIcon from '../AppIcon.vue'

const {
  workout,
  selectedStat,
  selectedWorkoutStat,
  workoutStatNames,
  statsSessions,
  allExercises,
  bestExercise,
  maxLoad,
  totalVolume,
  completedSessions,
  onWorkoutStatChange,
  chartWeeks,
  chartMax,
  kind,
  exercise,
  kg,
  reps,
} = inject('pegaPesoApp')
</script>

<template>
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
<div class="brazil-row-title"><h3>Treinos concluídos</h3></div><div v-if="!statsSessions.length" class="brazil-empty">Nenhuma sessão concluída neste filtro.</div><div class="brazil-list"><div v-for="(h,i) in [...statsSessions].reverse().slice(0,10)" :key="i" class="brazil-list-row"><span class="row-icon mint-icon"><AppIcon name="check" :size="17"/></span><span class="row-info"><strong>{{h.kind==='cardio'?(h.modality||'Cardio'):h.name}}</strong><small>{{h.date}}</small></span><span class="row-value">{{Math.round(h.seconds/60)}} min</span></div></div>
</template>
