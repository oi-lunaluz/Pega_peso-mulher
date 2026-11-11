<script setup>
import { inject } from 'vue'
import AppIcon from '../AppIcon.vue'

const {
  view,
  time,
  maxFor,
  lastFor,
  addSet,
  exercise,
  kg,
  reps,
  sets,
  completed,
} = inject('pegaPesoApp')
</script>

<template>
<button class="back" @click="view='session'">← Voltar aos exercícios</button>
<div class="session-timer compact"><span><AppIcon name="timer" :size="17"/> TEMPO DE TREINO</span><strong>{{time}}</strong></div>
<div class="brazil-banner workouts-banner"><div><span class="kicker"><AppIcon name="dumbbell" :size="17"/> BORA PRA CIMA</span><h2>{{exercise}}</h2><p>Capricha nessa série!</p></div><img class="banner-dog" src="/caramelo-treino.svg" alt="" aria-hidden="true"/></div>
<div class="brazil-stats"><div class="stat-tile yellow-tile"><span><AppIcon name="trophy" :size="17"/> SEU RECORDE</span><strong>{{maxFor(exercise)}}<small> kg</small></strong></div><div class="stat-tile mint-tile"><span>↗ ÚLTIMA CARGA</span><strong>{{lastFor(exercise)}}<small> kg</small></strong></div></div>
<div class="brazil-row-title"><h3>Séries de hoje</h3><span>{{(sets[exercise]||[]).length}} registradas</span></div>
<div class="brazil-list"><div class="brazil-list-row" v-for="(s,i) in (sets[exercise]||[])" :key="i"><span class="row-icon mint-icon"><AppIcon name="check" :size="17"/></span><span class="row-info"><strong>{{i+1}}ª série</strong><small>{{s.kg}} kg × {{s.reps}} repetições</small></span><button class="remove-set" :aria-label="'Excluir série '+(i+1)" @click="sets[exercise].splice(i,1)">✕</button></div></div>
<div class="brazil-form"><div class="two-fields"><div><label class="brazil-label">Peso (kg)</label><input type="number" min="0" v-model="kg" inputmode="decimal"/></div><div><label class="brazil-label">Repetições</label><input type="number" min="1" v-model="reps" inputmode="numeric"/></div></div><button class="brazil-primary" @click="addSet"><AppIcon name="plus" :size="17"/> Adicionar série</button></div>
<button class="brazil-outline" @click="completed.includes(exercise)?null:completed.push(exercise);view='session'"><AppIcon name="check" :size="17"/> Concluir exercício</button>
</template>
