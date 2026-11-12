<script setup>
import { inject } from 'vue'
import AppIcon from '../AppIcon.vue'

const {
  state,
  scheduledDays,
  overdueWorkouts,
  toggleTrainingDay,
  weekPlan,
  view,
  rotation,
  rotationIndex,
  nextWorkoutName,
  addRotationName,
  availableForRotation,
  moveRotation,
  removeRotation,
  addRotation,
  openCardioModal,
  weeklyCardio,
} = inject('pegaPesoApp')
</script>

<template>
<div class="brazil-banner yellow"><div><span class="kicker">SEU PLANEJAMENTO</span><h2>Semana flexível!</h2><p>Os dias continuam. Os treinos se reorganizam.</p></div><img class="banner-dog" src="/caramelo-treino.svg" alt="" aria-hidden="true"/></div>
<div v-if="overdueWorkouts" class="schedule-overdue" role="status"><strong>{{overdueWorkouts}} {{overdueWorkouts===1?'treino pendente':'treinos pendentes'}}</strong><p>Você perdeu um dia planejado. Vamos fazer {{nextWorkoutName}} no próximo dia de treino, sem pular sua sequência.</p></div>
<div class="rotation-intro"><strong>Como funciona</strong><p>Escolha os dias em que costuma treinar. Se faltar, o treino não é perdido: ele passa para o próximo dia disponível e os demais seguem a ordem.</p></div>
<div class="brazil-row-title"><h3>Meus dias de treino</h3><span>Toque para marcar ou desmarcar</span></div>
<div class="schedule-day-picker">
<button v-for="d in [{day:1,label:'Seg'},{day:2,label:'Ter'},{day:3,label:'Qua'},{day:4,label:'Qui'},{day:5,label:'Sex'},{day:6,label:'Sáb'},{day:0,label:'Dom'}]"
:key="d.day" :aria-pressed="scheduledDays.includes(d.day)" :class="{selected:scheduledDays.includes(d.day)}" @click="toggleTrainingDay(d.day)">{{d.label}}</button>
</div>
<div class="brazil-row-title"><h3>Esta semana</h3><span>Reorganizada automaticamente</span></div>
<div class="brazil-list">
  <div v-for="d in weekPlan" :key="d.date" class="brazil-list-row schedule-day-row" :class="{isToday:d.isToday,isLate:d.status==='pendente'}">
    <span class="schedule-date">{{d.short}}</span>
    <span class="row-info"><strong>{{d.scheduled?(d.name|| (d.past?'Treino programado':nextWorkoutName)):'Descanso / cardio livre'}}</strong><small>{{d.full}} · {{d.status==='pendente'?'Faltou — treino mantido na sequência':d.status==='concluído'?'Treino registrado':d.status==='reorganizado'?'Treino já reorganizado':d.status==='hoje'?'Treino previsto para hoje':d.status==='previsto'?'Próximo na ordem':'Dia livre'}}</small></span>
    <AppIcon v-if="d.status==='concluído'" name="check" :size="19"/>
    <span v-else-if="d.status==='pendente'" class="schedule-late-tag">Pendente</span>
  </div>
</div>
<div class="brazil-row-title"><h3>Ordem das fichas</h3><span>Arraste usando as setas</span></div>
<div class="brazil-list">
  <div v-for="(name,i) in rotation" :key="name" class="brazil-list-row rotation-list-row" :class="{'is-next':i===rotationIndex}">
    <span class="rotation-order-number">{{i+1}}</span>
    <span class="row-info"><strong>{{name}}</strong><small>{{i===rotationIndex?'Próximo a fazer':'Treino '+(i+1)}}</small></span>
    <div class="rotation-row-controls">
      <button :disabled="i===0" :aria-label="'Mover '+name+' para cima'" @click="moveRotation(i,-1)">↑</button>
      <button :disabled="i===rotation.length-1" :aria-label="'Mover '+name+' para baixo'" @click="moveRotation(i,1)">↓</button>
      <button class="rotation-remove" :aria-label="'Retirar '+name+' da sequência'" @click="removeRotation(i)">×</button>
    </div>
  </div>
</div>
<div v-if="!rotation.length" class="brazil-empty">Sua sequência está vazia. Adicione uma ficha abaixo.</div>
<div class="rotation-add"><label for="rotation-add-select">Adicionar treino à sequência</label><div><select id="rotation-add-select" v-model="addRotationName"><option value="">Selecione uma ficha</option><option v-for="w in availableForRotation" :value="w.name" :key="w.name">{{w.name}}</option></select><button :disabled="!addRotationName" @click="addRotation"><AppIcon name="plus" :size="17"/></button></div></div>
<button class="outline brazil-outline" @click="view='list'">Gerenciar minhas fichas</button>
<div class="cardio-goal-panel"><h3>Cardio independente</h3><p>Você pode fazer cardio em qualquer dia; isso não muda a ordem dos treinos de força.</p>
  <div class="cardio-goal-fields"><div><label for="cardio-week-goal">Meta semanal (min)</label><input id="cardio-week-goal" type="number" min="0" v-model.number="state.cardioGoal"/></div>
  <div><label for="cardio-session-goal">Referência por sessão (min)</label><input id="cardio-session-goal" type="number" min="0" v-model.number="state.cardioSessionTarget"/></div></div>
  <div class="rotation-cardio-progress"><span>{{weeklyCardio}} de {{state.cardioGoal}} min realizados nesta semana</span><span class="progress-track"><i :style="{width:Math.min(100,weeklyCardio/Math.max(1,state.cardioGoal)*100)+'%'}"></i></span></div>
  <button class="brazil-primary" @click="openCardioModal">Iniciar cardio</button>
</div>
</template>
