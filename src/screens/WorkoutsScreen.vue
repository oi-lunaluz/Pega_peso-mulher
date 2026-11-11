<script setup>
import { inject } from 'vue'
import AppIcon from '../AppIcon.vue'

const {
  state,
  openCreateModal,
  openWorkout,
  openCardioModal,
  start,
  workoutTab,
  cardioSessions,
  cardioTotalMinutes,
  cardioLastSession,
  weeklyCardio,
  kind,
} = inject('pegaPesoApp')
</script>

<template>
<div class="brazil-banner workouts-banner"><div><span class="kicker"><AppIcon name="dumbbell" :size="17"/> SUAS FICHAS</span><h2>Treino de milhões!</h2><p>Um exercício de cada vez, gata. <AppIcon name="heart" :size="17"/></p></div><img class="banner-dog" src="/caramelo-treino.svg" alt="" aria-hidden="true"/></div>
<div class="brazil-tabs cardio-tabs"><button :class="{active:workoutTab==='fichas'}" @click="workoutTab='fichas'">Musculação</button><button :class="{active:workoutTab==='cardio'}" @click="workoutTab='cardio'">Cardio</button><button :class="{active:workoutTab==='historico'}" @click="workoutTab='historico'">Histórico</button></div>
<template v-if="workoutTab==='fichas'"><div class="brazil-row-title"><h3>{{state.workouts.length}} fichas cadastradas</h3></div>
<div class="brazil-list"><button v-for="(w,i) in state.workouts" :key="w.name" class="brazil-list-row" @click="openWorkout(w.name)"><span class="row-icon" :class="i%2?'purple-icon':'pink-icon'"><AppIcon name="dumbbell"/></span><span class="row-info"><strong>{{w.name}}</strong><small>{{w.exercises.length}} exercícios</small></span><span class="row-arrow">›</span></button></div>
<button class="brazil-primary" @click="openCreateModal"><AppIcon name="plus" :size="17"/> Criar nova ficha</button><div class="dog-quote"><img src="/caramelo-descanso.svg" alt="CaraMary relaxando na cadeira"/><p>“Descanso também é treino, viu?!” — CaraMary <AppIcon name="palm" :size="17"/></p></div></template>
<template v-else-if="workoutTab==='cardio'">
<div class="cardio-training-panel">
<div class="cardio-panel-head"><span>SESSÃO DE CARDIO</span><h3>Seu cardio, seu ritmo</h3><p>Faça seu cardio quando quiser. A ordem da musculação não muda.</p></div>
<div class="cardio-session-goal"><div><small>Referência por sessão</small><strong>{{state.cardioSessionTarget}} min</strong></div><div><small>Realizado na semana</small><strong>{{weeklyCardio}} / {{state.cardioGoal}} min</strong></div></div>
<button class="brazil-primary cardio-panel-start" @click="openCardioModal"><AppIcon name="timer" :size="18"/> Iniciar sessão de cardio</button>
</div>
<div class="brazil-row-title"><h3>Suas sessões de cardio</h3><span>{{cardioSessions.length}} concluídas</span></div>
<div class="cardio-session-summary"><div><small>Tempo total registrado</small><strong>{{cardioTotalMinutes}} min</strong></div><div><small>Última sessão</small><strong>{{cardioLastSession?Math.round(cardioLastSession.seconds/60)+' min':'—'}}</strong></div></div>
<div v-if="!cardioSessions.length" class="brazil-empty">Seu histórico de cardio aparece aqui depois de finalizar a primeira sessão.</div>
<div v-else class="brazil-list"><div v-for="(h,i) in [...cardioSessions].reverse()" :key="i" class="brazil-list-row"><span class="row-icon mint-icon"><AppIcon name="timer" :size="19"/></span><span class="row-info"><strong>{{h.modality||'Cardio'}}</strong><small>{{h.date}}</small></span><span class="row-value">{{Math.round(h.seconds/60)}} min</span></div></div>
</template>
<template v-else><div class="brazil-row-title"><h3>Treinos finalizados</h3><span>{{state.history.length}} registros</span></div><div v-if="!state.history.length" class="brazil-empty"><AppIcon name="smile" :size="17"/> Quando você concluir um treino, ele aparecerá aqui!</div><div class="brazil-list"><div v-for="(h,i) in [...state.history].reverse()" :key="i" class="brazil-list-row"><span class="row-icon mint-icon"><AppIcon name="check" :size="17"/></span><span class="row-info"><strong>{{h.kind==='cardio'?(h.modality||'Cardio'):h.name}}</strong><small>{{h.date}}</small></span><span class="row-value">{{Math.round(h.seconds/60)}} min</span></div></div></template>
</template>
