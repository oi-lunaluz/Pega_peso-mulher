<script setup>
import { inject } from 'vue'
import AppIcon from '../AppIcon.vue'
import WeeklyWorkoutCards from './WeeklyWorkoutCards.vue'

const {
  state,
  scheduledDayNames,
  overdueWorkouts,
  weekPlan,
  selectedWeekDate,
  selectedWeekDay,
  selectedWeekPreview,
  predictedDayLabel,
  selectWeekDay,
  quickFeedback,
  toggleDayDone,
  canQuickCheck,
  view,
  rotation,
  rotationIndex,
  nextWorkoutName,
  nextWorkout,
  openCardioModal,
  start,
  cycle,
  cycleDay,
  weeklyCardio,
  strengthThisMonth,
  personalRecords,
  homeGreeting,
  openToday,
} = inject('pegaPesoApp')
</script>

<template>
<div class="home-greeting">
 <div class="greeting-copy"><span class="eyebrow">BORA PRA CIMA!</span><h2>{{homeGreeting}},<br/><em>mulher!</em></h2><p>A CaraMary tá de olho na sua evolução!</p></div>
 <img class="home-dog" src="/caramelo-treino.svg" alt="Mary, a caramela apelidada CaraMary, de óculos e bandana rosa, sorrindo"/><span class="mary-label">Mary, a CaraMary</span>
</div>
<WeeklyWorkoutCards/>
<div class="home-metrics">
 <button class="home-metric mint" @click="view='stats'"><small>Treinos no mês</small><strong>{{strengthThisMonth}}</strong><span class="metric-caption">Você tá construindo!</span></button>
 <button class="home-metric peach" @click="view='stats'"><small>Exercícios registrados</small><strong>{{personalRecords}}</strong><span class="metric-caption">Sua evolução conta!</span></button>
</div>
<div class="home-bottom-grid">
 <div class="home-cardio"><span class="eyebrow">SEU CARDIO</span><strong>{{weeklyCardio}} <small>min na semana</small></strong><span>Meta: {{state.cardioGoal}} min na semana</span><span class="home-progress"><i :style="{width:Math.min(100,weeklyCardio/Math.max(1,state.cardioGoal)*100)+'%'}"></i></span><img src="/caramelo-descanso.svg" alt="" aria-hidden="true"/><button class="home-cardio-start" @click="openCardioModal">Iniciar cardio <AppIcon name="arrow" :size="15"/></button></div>
 <button class="home-cycle" @click="view='cycle'"><span class="eyebrow">SEU CICLO</span><strong>{{cycle.enabled&&cycleDay?'Dia '+cycleDay:'Meu ciclo'}}</strong><span>{{cycle.enabled?'Seu acompanhamento':'Acompanhe como se sente'}}</span><span class="cycle-more">Ver ciclo ↗</span></button>
</div>
<div class="home-footer-note">O peso varia. A evolução continua.</div>
</template>
