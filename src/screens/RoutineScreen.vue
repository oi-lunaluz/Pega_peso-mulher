<script setup>
import {inject,ref} from 'vue'
import AppIcon from '../AppIcon.vue'

const {state,cardioPlacement,scheduledDays,toggleTrainingDay,rotation,
  rotationIndex,moveRotation,removeRotation,addRotationName,
  availableForRotation,addRotation,view,weeklyCardio,setWorkoutCardio}=inject('pegaPesoApp')
const showSettings=ref(false)
const showOrder=ref(false)
</script>

<template>
  <section class="week-settings">
    <button type="button" class="week-settings-toggle" :aria-expanded="showSettings" @click="showSettings=!showSettings">
      <AppIcon name="pencil" :size="18"/>
      <span>Cardio e dias</span>
      <AppIcon name="chevron" :size="18"/>
    </button>
    <div v-if="showSettings" class="week-settings-inner">
      <h3>Como prefere fazer o cardio?</h3>
      <div class="week-cardio-options">
        <label :class="{active:cardioPlacement==='junto'}">
          <input v-model="cardioPlacement" type="radio" value="junto" name="cardio-placement"/>
          <strong>Junto da musculação</strong>
          <small>Mostra o cardio dentro de cada ficha de força.</small>
        </label>
        <label :class="{active:cardioPlacement==='separado'}">
          <input v-model="cardioPlacement" type="radio" value="separado" name="cardio-placement"/>
          <strong>Separado</strong>
          <small>O treino de cardio fica embaixo das fichas, para outro horário.</small>
        </label>
      </div>
      <template v-if="cardioPlacement==='junto'">
        <h3>Cardio em cada ficha</h3>
        <div v-for="w in state.workouts" :key="w.name" class="week-cardio-per-workout">
          <label :for="'cardio-for-'+w.name">{{w.name}}</label>
          <input :id="'cardio-for-'+w.name" type="number" inputmode="numeric" min="0" max="10080"
            :value="w.cardioMinutes??state.cardioSessionTarget"
            @change="setWorkoutCardio(w.name,$event.target.value)"/>
          <small>min</small>
        </div>
      </template>
      <div class="cardio-goal-panel">
        <h3>Meta semanal de cardio</h3>
        <p>É a soma total de todas as sessões. Cardio e musculação têm registros independentes.</p>
        <div class="cardio-goal-fields">
          <div><label for="cardio-week-goal">Total por semana (min)</label>
            <input id="cardio-week-goal" type="number" min="0" max="10080" v-model.number="state.cardioGoal"/></div>
          <div><label for="cardio-session-goal">Referência por sessão (min)</label>
            <input id="cardio-session-goal" type="number" min="0" max="1440" v-model.number="state.cardioSessionTarget"/></div>
        </div>
        <div class="rotation-cardio-progress">
          <span>{{weeklyCardio}} de {{state.cardioGoal}} min realizados nesta semana</span>
          <span class="progress-track"><i :style="{width:Math.min(100,weeklyCardio/Math.max(1,state.cardioGoal)*100)+'%'}"></i></span>
        </div>
      </div>
      <details class="week-legacy-days">
        <summary>Dias em que pretendo treinar</summary>
        <p>Esses dias são preferências de agenda. Não são botões de concluir exercícios.</p>
        <div class="schedule-day-picker">
          <button v-for="d in [{day:1,label:'Seg'},{day:2,label:'Ter'},{day:3,label:'Qua'},{day:4,label:'Qui'},{day:5,label:'Sex'},{day:6,label:'Sáb'},{day:0,label:'Dom'}]"
            :key="d.day" type="button" :aria-pressed="scheduledDays.includes(d.day)"
            :class="{selected:scheduledDays.includes(d.day)}" @click="toggleTrainingDay(d.day)">{{d.label}}</button>
        </div>
      </details>
    </div>
  </section>
  <section class="week-settings">
    <button type="button" class="week-settings-toggle" :aria-expanded="showOrder" @click="showOrder=!showOrder">
      <AppIcon name="dumbbell" :size="18"/>
      <span>Ordem das fichas</span>
      <AppIcon name="chevron" :size="18"/>
    </button>
    <div v-if="showOrder" class="week-settings-inner">

      <div class="brazil-list">
        <div v-for="(name,i) in rotation" :key="name" class="brazil-list-row rotation-list-row" :class="{'is-next':i===rotationIndex}">
          <span class="rotation-order-number">{{i+1}}</span>
          <span class="row-info"><strong>{{name}}</strong></span>
          <div class="rotation-row-controls">
            <button type="button" :disabled="i===0" :aria-label="'Mover '+name+' para cima'" @click="moveRotation(i,-1)">↑</button>
            <button type="button" :disabled="i===rotation.length-1" :aria-label="'Mover '+name+' para baixo'" @click="moveRotation(i,1)">↓</button>
            <button type="button" class="rotation-remove" :aria-label="'Tirar '+name+' da sequência'" @click="removeRotation(i)">×</button>
          </div>
        </div>
      </div>
      <div class="rotation-add"><label for="rotation-add-select">Adicionar ficha à sequência</label>
        <div><select id="rotation-add-select" v-model="addRotationName">
          <option value="">Selecione uma ficha</option>
          <option v-for="w in availableForRotation" :key="w.name" :value="w.name">{{w.name}}</option>
        </select><button type="button" :disabled="!addRotationName" @click="addRotation"><AppIcon name="plus" :size="17"/></button></div>
      </div>

    </div>
  </section>
</template>
