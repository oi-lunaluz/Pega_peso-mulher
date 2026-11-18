<script setup>
import { inject } from 'vue'
import AppIcon from '../AppIcon.vue'
defineProps({showManageLink:{type:Boolean,default:true}})
const {
  state,view,weeklyStrengthCards,currentWeekLabel,currentDayLabel,
  cardioPlacement,cardioForWorkout,toggleStrengthCard,
  quickFeedback,openWorkout,openCreateModal,openCardioModal,
  weeklyCardio
}=inject('pegaPesoApp')
</script>
<template>
  <section class="week-cards-shell" aria-label="Seus treinos da semana">
    <div class="week-today-tile">
      <span class="week-today-icon"><AppIcon name="calendar" :size="20"/></span>
      <div><small>HOJE</small><strong>{{currentDayLabel}}</strong><span>Semana de {{currentWeekLabel}} · segunda a domingo</span></div>
    </div>
    <div class="week-cards-heading">
      <div><span class="eyebrow">SEU PLANO DE FORÇA</span><h3>{{weeklyStrengthCards.filter(w=>w.completed).length}} de {{weeklyStrengthCards.length}} treinos feitos</h3></div>
      <button v-if="showManageLink" type="button" class="week-edit-fichas" @click="view='list'">Ver treinos</button>
    </div>
    
    <div v-if="weeklyStrengthCards.length" class="week-card-stack">
      <article v-for="card in weeklyStrengthCards" :key="card.name" class="week-strength-card" :class="{completed:card.completed}">
        <div class="week-card-main">
          <span class="week-card-count">{{card.number}}</span>
          <div class="week-card-title">
            <small>TREINO {{card.number}}</small>
            <strong>{{card.name}}</strong>
            <span>{{card.exercises}} {{card.exercises===1?'exercício':'exercícios'}} · {{card.completed?'Feito nesta semana':'A fazer'}}</span>
          </div>
          <span v-if="card.completed" class="week-card-done"><AppIcon name="check" :size="19"/></span>
        </div>
        <div v-if="cardioPlacement==='junto'&&cardioForWorkout(card.name)>0" class="week-card-attached">
          <AppIcon name="timer" :size="17"/>
          <span>Cardio junto · {{cardioForWorkout(card.name)}} min previstos</span>
          <button type="button" @click="openCardioModal">Iniciar</button>
        </div>
        <div class="week-card-controls">
          <button type="button" class="week-card-open" @click="openWorkout(card.name)">Ver exercícios</button>
          <button v-if="!card.detailed" type="button" class="week-card-mark" :class="{marked:card.completed}"
            :aria-pressed="card.completed" :aria-label="card.completed?'Desfazer check de '+card.name:'Marcar '+card.name+' como feito'"
            @click="toggleStrengthCard(card.name)">
            <AppIcon name="check" :size="17"/>
            {{card.completed?'Desfazer check':'Já fiz'}}
          </button>
          <span v-else class="week-card-detail-tag">Sessão registrada</span>
        </div>
      </article>
    </div>
    <div v-else class="week-card-empty">
      <AppIcon name="dumbbell" :size="27"/>
      <strong>Ainda não há fichas de força</strong>
      <p>Crie Treino 1, Treino 2 e quantos mais quiser.</p>
      <button type="button" @click="openCreateModal">Criar primeira ficha</button>
    </div>
    <p v-if="quickFeedback" class="quick-workout-feedback" role="status">{{quickFeedback}}</p>
    <section v-if="cardioPlacement==='separado'&&Number(state.cardioGoal)>0" class="week-cardio-separate">
      <div class="week-cardio-head">
        <AppIcon name="timer" :size="21"/>
        <div><span>CARDIO SEPARADO</span><strong>Treino de cardio</strong><small>Para fazer em outro horário ou em outro dia</small></div>
      </div>
      <p>{{weeklyCardio}} de {{state.cardioGoal}} minutos realizados nesta semana</p>
      <button type="button" @click="openCardioModal">Iniciar cardio</button>
    </section>
  </section>
</template>
