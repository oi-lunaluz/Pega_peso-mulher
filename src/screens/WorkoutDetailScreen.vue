<script setup>
import { inject } from 'vue'
import AppIcon from '../AppIcon.vue'

const {
  view,
  rotation,
  nextWorkoutName,
  workoutName,
  workout,
  addExercise,
  start,
  maxFor,
  newExercise,
  kg,
} = inject('pegaPesoApp')
</script>

<template>
<button class="back" @click="view='list'">← Minhas fichas</button>
<div class="brazil-banner workouts-banner"><div><span class="kicker"><AppIcon name="dumbbell" :size="17"/> SUA FICHA</span><h2>{{workoutName}}</h2><p>{{workout?.exercises.length||0}} exercícios preparados</p></div><img class="banner-dog" src="/caramelo-treino.svg" alt="" aria-hidden="true"/></div>
<div class="brazil-row-title"><h3>Exercícios</h3><span>Escolha sua ordem depois</span></div><div class="brazil-list"><div class="brazil-list-row" v-for="(e,i) in (workout?.exercises||[])" :key="e"><span class="row-icon" :class="i%2?'purple-icon':'pink-icon'"><AppIcon name="dumbbell" :size="17"/></span><span class="row-info"><strong>{{e}}</strong><small><AppIcon name="trophy" :size="17"/> Recorde {{maxFor(e)}} kg</small></span></div></div>
<div class="brazil-form"><label class="brazil-label">Adicionar exercício</label><div class="input-inline"><input v-model="newExercise" placeholder="Ex.: Agachamento livre" @keyup.enter="addExercise"/><button class="brazil-square-add" aria-label="Adicionar exercício" @click="addExercise"><AppIcon name="plus" :size="17"/></button></div></div>
<p v-if="workoutName!==nextWorkoutName" class="rotation-outside-note">Esta ficha está fora da sequência atual. Você pode treiná-la, mas ela não avança a ordem programada.</p><button class="brazil-primary" @click="start('forca')"><AppIcon name="arrow" :size="17"/> Iniciar treino</button>
</template>
