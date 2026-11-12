<script setup>
import { inject } from 'vue'
import AppIcon from '../AppIcon.vue'

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
<div class="home-rotation">
  <div class="home-section-title"><strong>Sua semana</strong><button class="home-text-link" @click="view='list'">Ver treinos <span aria-hidden="true">›</span></button></div>
  <div class="home-week-days">
    <button v-for="d in weekPlan" :key="d.date" :class="{active:d.date===selectedWeekDate,hasWorkout:d.scheduled,missed:d.status==='pendente'}"
      :aria-label="d.full+': '+(d.scheduled?d.status:'Descanso ou cardio livre')+'. Ver previsão'" :aria-pressed="d.date===selectedWeekDate" @click="selectWeekDay(d.date)">
      <span>{{d.short}}</span>
      <AppIcon v-if="d.scheduled" :name="d.status==='concluído'?'check':'dumbbell'" :size="15" :strokeWidth="2.5"/>
      <span v-else class="week-rest-mark">–</span>
    </button>
  </div>
  <p v-if="overdueWorkouts>0" class="home-overdue" role="status"><AppIcon name="calendar" :size="15"/> {{overdueWorkouts}} {{overdueWorkouts===1?'treino pendente':'treinos pendentes'}}. A ordem foi ajustada para você não pular nenhum.</p>
  <p v-else class="rotation-help">{{scheduledDayNames.join(', ')||'Nenhum dia marcado'}} · siga no seu ritmo.</p>
</div>
<div class="home-metrics">
 <button class="home-metric mint" @click="view='stats'"><small>Treinos no mês</small><strong>{{strengthThisMonth}}</strong><span class="metric-caption">Você tá construindo!</span></button>
 <button class="home-metric peach" @click="view='stats'"><small>Exercícios registrados</small><strong>{{personalRecords}}</strong><span class="metric-caption">Sua evolução conta!</span></button>
</div>
<section class="home-today">
  <div class="home-today-header"><span class="eyebrow">{{selectedWeekDate===weekPlan.find(d=>d.isToday)?.date?'PRÓXIMO TREINO':'PREVISÃO DA SEMANA'}}</span><span class="today-pill">{{selectedWeekDay?.full||'Sua semana'}}</span></div>
  <div v-if="selectedWeekPreview" class="home-today-body"><div>
    <p class="home-selected-label">{{selectedWeekDay?.scheduled?'Treino do dia selecionado':'Dia livre selecionado'}}</p>
    <h2>{{selectedWeekDay?.recorded?selectedWeekDay.name:selectedWeekPreview.selectedName||'Descanso / cardio livre'}}</h2>
    <p v-if="selectedWeekDay?.recorded">Treino concluído e registrado neste dia.</p>
    <p v-else-if="selectedWeekDay?.scheduled">Planejado · {{selectedWeekDay?.status==='pendente'?'treino pendente':'sem registrar como concluído'}}</p>
    <p v-else>Sem musculação programada nesse dia.</p>
  </div></div>
  <div v-if="selectedWeekPreview?.nextDate" class="home-next-forecast">
    <span>PRÓXIMO DIA DE TREINO · {{predictedDayLabel}}</span>
    <strong>{{selectedWeekPreview.nextName||'Configure sua sequência'}}</strong>
    <small>{{selectedWeekPreview.simulated?'Previsão se os treinos planejados forem concluídos':'Previsão com base nos treinos registrados'}}</small>
  </div>
  <div v-if="canQuickCheck(selectedWeekDay)" class="quick-workout-actions">
    <button type="button" class="quick-workout-button" @click="toggleDayDone(selectedWeekDate)">
      <AppIcon :name="selectedWeekDay.recorded?'check':'calendarCheck'" :size="18"/>
      {{selectedWeekDay.recorded?'Desfazer check deste dia':'Já fiz esse treino ✓'}}
    </button>
    <p>Sem precisar acompanhar séries, cargas ou cronômetro. O check atualiza a ordem dos próximos treinos.</p>
  </div>
  <p v-else-if="selectedWeekDay?.recorded" class="home-forecast-disclaimer">Este treino já está registrado com acompanhamento detalhado.</p>
  <p v-else class="home-forecast-disclaimer">Toque em um dia de treino de hoje ou anterior para marcá-lo como feito, ou inicie uma sessão com acompanhamento detalhado.</p>
  <p v-if="quickFeedback" class="quick-workout-feedback" role="status">{{quickFeedback}}</p>
  <button class="home-primary" @click="openToday">{{nextWorkout?'Iniciar treino pendente / atual':'Organizar treinos'}} <span aria-hidden="true">→</span></button>
</section>
<div class="home-bottom-grid">
 <div class="home-cardio"><span class="eyebrow">SEU CARDIO</span><strong>{{weeklyCardio}} <small>min na semana</small></strong><span>Meta: {{state.cardioGoal}} min na semana</span><span class="home-progress"><i :style="{width:Math.min(100,weeklyCardio/Math.max(1,state.cardioGoal)*100)+'%'}"></i></span><img src="/caramelo-descanso.svg" alt="" aria-hidden="true"/><button class="home-cardio-start" @click="openCardioModal">Iniciar cardio <AppIcon name="arrow" :size="15"/></button></div>
 <button class="home-cycle" @click="view='cycle'"><span class="eyebrow">SEU CICLO</span><strong>{{cycle.enabled&&cycleDay?'Dia '+cycleDay:'Meu ciclo'}}</strong><span>{{cycle.enabled?'Seu acompanhamento':'Acompanhe como se sente'}}</span><span class="cycle-more">Ver ciclo ↗</span></button>
</div>
<div class="home-footer-note">O peso varia. A evolução continua.</div>
</template>
