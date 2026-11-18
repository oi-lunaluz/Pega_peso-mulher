<script setup>
import { inject } from 'vue'
import AppIcon from '../AppIcon.vue'

const {
 state,cardioPlacement,scheduledDays,toggleTrainingDay,rotation,
 moveRotation,removeRotation,addRotationName,availableForRotation,
 addRotation,setWorkoutCardio,weeklyCardio
}=inject('pegaPesoApp')
</script>

<template>
<div class="merged-config">
  <div class="merged-config-title">Cardio</div>
  <div class="merged-cardio-choice">
    <label :class="{selected:cardioPlacement==='junto'}">
      <input v-model="cardioPlacement" type="radio" name="merged-cardio-placement" value="junto"/>
      Junto com força
    </label>
    <label :class="{selected:cardioPlacement==='separado'}">
      <input v-model="cardioPlacement" type="radio" name="merged-cardio-placement" value="separado"/>
      Separado
    </label>
  </div>
  <div class="merged-goal-line">
    <label for="merged-cardio-week">Meta semanal (min)</label>
    <input id="merged-cardio-week" type="number" min="0" max="10080" v-model.number="state.cardioGoal"/>
  </div>
  <div class="merged-goal-line">
    <label for="merged-cardio-session">Por sessão (min)</label>
    <input id="merged-cardio-session" type="number" min="0" max="1440" v-model.number="state.cardioSessionTarget"/>
  </div>
  <template v-if="cardioPlacement==='junto'">
    <div v-for="w in state.workouts" :key="w.name" class="merged-goal-line">
      <label :for="'merged-min-'+w.name">{{w.name}}</label>
      <input :id="'merged-min-'+w.name" type="number" inputmode="numeric" min="0" max="1440"
        :value="w.cardioMinutes??state.cardioSessionTarget"
        @change="setWorkoutCardio(w.name,$event.target.value)"/>
    </div>
  </template>
  <p class="merged-settings-note">{{weeklyCardio}} min de cardio registrados nesta semana.</p>

  <details class="merged-advanced">
    <summary>Dias preferidos</summary>
    <div class="schedule-day-picker">
      <button v-for="d in [{day:1,label:'Seg'},{day:2,label:'Ter'},{day:3,label:'Qua'},{day:4,label:'Qui'},{day:5,label:'Sex'},{day:6,label:'Sáb'},{day:0,label:'Dom'}]"
        :key="d.day" type="button" :aria-pressed="scheduledDays.includes(d.day)"
        :class="{selected:scheduledDays.includes(d.day)}" @click="toggleTrainingDay(d.day)">{{d.label}}</button>
    </div>
  </details>

  <details class="merged-advanced">
    <summary>Ordem das fichas</summary>
    <div class="merged-order-list">
      <div v-for="(name,i) in rotation" :key="name" class="merged-order-row">
        <span>{{i+1}}. {{name}}</span>
        <button type="button" :disabled="i===0" :aria-label="'Mover '+name+' para cima'" @click="moveRotation(i,-1)">↑</button>
        <button type="button" :disabled="i===rotation.length-1" :aria-label="'Mover '+name+' para baixo'" @click="moveRotation(i,1)">↓</button>
        <button type="button" class="merged-remove" :aria-label="'Remover '+name+' da sequência'" @click="removeRotation(i)">×</button>
      </div>
      <div class="merged-add-order">
        <select aria-label="Ficha para adicionar à sequência" v-model="addRotationName">
          <option value="">Adicionar à sequência</option>
          <option v-for="w in availableForRotation" :key="w.name" :value="w.name">{{w.name}}</option>
        </select>
        <button type="button" :disabled="!addRotationName" @click="addRotation"><AppIcon name="plus" :size="17"/></button>
      </div>
    </div>
  </details>
</div>
</template>