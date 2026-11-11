<script setup>
import AppIcon from './AppIcon.vue'
import { provide } from 'vue'
import HomeScreen from './screens/HomeScreen.vue'
import RoutineScreen from './screens/RoutineScreen.vue'
import ProgressScreen from './screens/ProgressScreen.vue'
import CycleScreen from './screens/CycleScreen.vue'
import WorkoutsScreen from './screens/WorkoutsScreen.vue'
import WorkoutDetailScreen from './screens/WorkoutDetailScreen.vue'
import SessionScreen from './screens/SessionScreen.vue'
import ExerciseScreen from './screens/ExerciseScreen.vue'
import FinishedScreen from './screens/FinishedScreen.vue'
import ProfileScreen from './screens/ProfileScreen.vue'
import { useAppState } from './composables/useAppState.js'

const {
  state,
  weekNames,
  calendarNow,
  dateToday,
  scheduledDays,
  scheduledDayNames,
  scheduleInputs,
  overdueWorkouts,
  dueWorkouts,
  toggleTrainingDay,
  weekPlan,
  view,
  rotation,
  rotationIndex,
  nextWorkoutName,
  nextWorkout,
  addRotationName,
  availableForRotation,
  preserveNextRotation,
  moveRotation,
  removeRotation,
  addRotation,
  advanceRotation,
  workoutName,
  createModal,
  openCreateModal,
  workout,
  openWorkout,
  addWorkout,
  addExercise,
  started,
  cardioModal,
  cardioModalities,
  selectedCardioModality,
  activeCardioModality,
  activeCardioArt,
  openCardioModal,
  confirmCardioStart,
  clock,
  sessionWorkoutName,
  sequenceAdvanced,
  start,
  elapsed,
  time,
  maxFor,
  lastFor,
  choose,
  addSet,
  finish,
  workoutTab,
  cardioSessions,
  cardioTotalMinutes,
  cardioLastSession,
  selectedStat,
  selectedWorkoutStat,
  workoutStatNames,
  statsSessions,
  allExercises,
  exerciseStats,
  bestExercise,
  maxLoad,
  totalVolume,
  completedSessions,
  onWorkoutStatChange,
  cycle,
  noteDate,
  cycleDay,
  addNote,
  weeklyCardio,
  cycleCalendarMonth,
  cycleCalendarYear,
  moveCycleMonth,
  calendarMonthName,
  cycleCalendarDays,
  chartWeeks,
  chartMax,
  profile,
  strengthThisMonth,
  personalRecords,
  homeGreeting,
  openToday,
  newWorkout,
  newExercise,
  createError,
  finished,
  kind,
  exercise,
  kg,
  reps,
  sets,
  completed,
  noteEnergy,
  noteSymptoms,
  noteDifficulty,
} = useAppState()

provide('pegaPesoApp', {
  state,
  weekNames,
  calendarNow,
  dateToday,
  scheduledDays,
  scheduledDayNames,
  scheduleInputs,
  overdueWorkouts,
  dueWorkouts,
  toggleTrainingDay,
  weekPlan,
  view,
  rotation,
  rotationIndex,
  nextWorkoutName,
  nextWorkout,
  addRotationName,
  availableForRotation,
  preserveNextRotation,
  moveRotation,
  removeRotation,
  addRotation,
  advanceRotation,
  workoutName,
  createModal,
  openCreateModal,
  workout,
  openWorkout,
  addWorkout,
  addExercise,
  started,
  cardioModal,
  cardioModalities,
  selectedCardioModality,
  activeCardioModality,
  activeCardioArt,
  openCardioModal,
  confirmCardioStart,
  clock,
  sessionWorkoutName,
  sequenceAdvanced,
  start,
  elapsed,
  time,
  maxFor,
  lastFor,
  choose,
  addSet,
  finish,
  workoutTab,
  cardioSessions,
  cardioTotalMinutes,
  cardioLastSession,
  selectedStat,
  selectedWorkoutStat,
  workoutStatNames,
  statsSessions,
  allExercises,
  exerciseStats,
  bestExercise,
  maxLoad,
  totalVolume,
  completedSessions,
  onWorkoutStatChange,
  cycle,
  noteDate,
  cycleDay,
  addNote,
  weeklyCardio,
  cycleCalendarMonth,
  cycleCalendarYear,
  moveCycleMonth,
  calendarMonthName,
  cycleCalendarDays,
  chartWeeks,
  chartMax,
  profile,
  strengthThisMonth,
  personalRecords,
  homeGreeting,
  openToday,
  newWorkout,
  newExercise,
  createError,
  finished,
  kind,
  exercise,
  kg,
  reps,
  sets,
  completed,
  noteEnergy,
  noteSymptoms,
  noteDifficulty,
})
</script>
<template>
<div class="app" :class="{'on-home':view==='home','brazil-app':view!=='home'}">
<header :class="{'home-header':view==='home','brazil-header':view!=='home'}">
<div><small class="brand-wordmark"><span class="brand-mark"><AppIcon name="dumbbell" :size="17"/></span> PEGA PESO, MULHER!</small><h1 v-if="view!=='home'">{{view==='edit'?'Minha sequência':view==='list'?'Meus treinos':view==='stats'?'Minha evolução':view==='cycle'?'Meu ciclo':view==='routine'?'Ordem dos treinos':view==='profile'?'Meu perfil':view==='done'?'Missão cumprida!':view==='session'?'Treino em ação':view==='exercise'?exercise:workoutName||'Seu treino'}}</h1></div>
<button v-if="view!=='profile'" class="header-profile" title="Meu perfil" aria-label="Abrir meu perfil" @click="view='profile'"><AppIcon name="user" :size="21"/></button>
<button v-else class="header-profile" aria-label="Voltar ao início" @click="view='home'"><AppIcon name="close" :size="20"/></button>
</header>
<main>
<HomeScreen v-if="view==='home'"/>
<RoutineScreen v-else-if="view==='routine'"/>
<ProgressScreen v-else-if="view==='stats'"/>
<CycleScreen v-else-if="view==='cycle'"/>
<WorkoutsScreen v-else-if="view==='list'"/>
<WorkoutDetailScreen v-else-if="view==='workout'"/>
<SessionScreen v-else-if="view==='session'"/>
<ExerciseScreen v-else-if="view==='exercise'"/>
<FinishedScreen v-else-if="view==='done'"/>
<ProfileScreen v-else-if="view==='profile'"/>
</main><div v-if="cardioModal" class="modal-backdrop" @click.self="cardioModal=false">
<div class="modal-sheet cardio-modal" role="dialog" aria-modal="true" aria-labelledby="cardio-modal-title">
<div class="modal-head"><div><small>SESSÃO DE CARDIO</small><h2 id="cardio-modal-title">Qual modalidade?</h2></div><button class="close-modal" type="button" aria-label="Fechar" @click="cardioModal=false"><AppIcon name="close" :size="19"/></button></div>
<p class="muted">Escolha o tipo de cardio antes de iniciar o cronômetro.</p>
<div class="cardio-modality-options" role="radiogroup" aria-label="Modalidade de cardio">
<label v-for="modality in cardioModalities" :key="modality" class="cardio-modality-option" :class="{selected:selectedCardioModality===modality}">
<input type="radio" name="cardio-modality" :value="modality" v-model="selectedCardioModality"/>
<span>{{modality}}</span><AppIcon v-if="selectedCardioModality===modality" name="check" :size="18"/>
</label>
</div>
<button class="brazil-primary cardio-modal-start" @click="confirmCardioStart"><AppIcon name="timer" :size="18"/> Iniciar {{selectedCardioModality}}</button>
</div></div><div v-if="createModal" class="modal-backdrop" @click.self="createModal=false"><div class="modal-sheet" role="dialog" aria-modal="true" aria-label="Criar novo treino"><div class="modal-head"><div><small>NOVO TREINO</small><h2>Criar treino <AppIcon name="dumbbell" :size="17"/></h2></div><button class="close-modal" aria-label="Fechar" @click="createModal=false">✕</button></div><p class="muted">Dê um nome ao seu treino. Depois você poderá adicionar os exercícios.</p><form @submit.prevent="addWorkout"><label for="new-workout-name">Nome do treino</label><input id="new-workout-name" v-model="newWorkout" placeholder="Ex.: Glúteos e posterior" maxlength="60" autofocus/><p v-if="createError" class="field-error">{{createError}}</p><div class="modal-actions"><button type="button" class="outline" @click="createModal=false">Cancelar</button><button type="submit">Criar treino</button></div></form></div></div><nav class="bottom-nav" aria-label="Navegação principal"><button v-for="tab in [{id:'home',icon:'home',label:'Início'},{id:'list',icon:'dumbbell',label:'Treinos'},{id:'routine',icon:'calendar',label:'Rotina'},{id:'stats',icon:'chart',label:'Evolução'},{id:'cycle',icon:'flower',label:'Ciclo'}]" :key="tab.id" :class="{active:view===tab.id}" @click="view=tab.id"><AppIcon :name="tab.icon" :size="21" :strokeWidth="view===tab.id?2.6:2"/><small>{{tab.label}}</small></button></nav><footer>Protótipo local · dados salvos apenas neste navegador · sem cadastro ou sincronização</footer></div>
</template>