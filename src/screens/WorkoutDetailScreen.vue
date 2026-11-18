<script setup>
import { inject, ref } from 'vue'
import AppIcon from '../AppIcon.vue'

const {
  view, nextWorkoutName, workoutName, workout,
  addExercise, deleteExercise, deleteWorkout,
  start, maxFor, newExercise,
} = inject('pegaPesoApp')
const pendingDelete=ref(null)

function askDeleteExercise(index,name){
  pendingDelete.value={type:'exercise',index,name}
}
function askDeleteWorkout(){
  pendingDelete.value={type:'workout',name:workoutName.value}
}
function confirmDelete(){
  if(!pendingDelete.value)return
  const choice=pendingDelete.value
  if(choice.type==='workout')deleteWorkout()
  else deleteExercise(choice.index)
  pendingDelete.value=null
}
</script>

<template>
  <button class="back" @click="view='list'">← Meus treinos</button>
  <div class="brazil-banner workouts-banner">
    <div><span class="kicker"><AppIcon name="dumbbell" :size="17"/> SUA FICHA</span>
      <h2>{{workoutName}}</h2><p>{{workout?.exercises.length||0}} exercícios</p>
    </div>
    <img class="banner-dog" src="/caramelo-treino.svg" alt="" aria-hidden="true"/>
  </div>

  <div class="workout-exercise-heading">
    <h3>Exercícios</h3>
    <button class="workout-delete-link" type="button" @click="askDeleteWorkout">
      <AppIcon name="trash" :size="16"/> Excluir treino
    </button>
  </div>
  <div class="brazil-list">
    <div v-for="(e,i) in (workout?.exercises||[])" :key="i" class="brazil-list-row workout-exercise-row">
      <span class="row-icon" :class="i%2?'purple-icon':'pink-icon'"><AppIcon name="dumbbell" :size="17"/></span>
      <span class="row-info"><strong>{{e}}</strong>
        <small><AppIcon name="trophy" :size="15"/> Recorde {{maxFor(e)}} kg</small>
      </span>
      <button type="button" class="workout-exercise-trash"
        :aria-label="'Excluir exercício '+e" :title="'Excluir '+e"
        @click="askDeleteExercise(i,e)">
        <AppIcon name="trash" :size="18"/>
      </button>
    </div>
  </div>
  <div class="brazil-form">
    <label class="brazil-label" for="workout-exercise-input">Adicionar exercício</label>
    <div class="input-inline">
      <input id="workout-exercise-input" v-model="newExercise" placeholder="Ex.: Agachamento livre" @keyup.enter="addExercise"/>
      <button class="brazil-square-add" aria-label="Adicionar exercício" @click="addExercise"><AppIcon name="plus" :size="17"/></button>
    </div>
  </div>
  <p v-if="workoutName!==nextWorkoutName" class="rotation-outside-note">
    Esta ficha não é a próxima da sequência. Você ainda pode treiná-la.
  </p>
  <button class="brazil-primary" @click="start('forca')"><AppIcon name="arrow" :size="17"/> Iniciar treino</button>

  <div v-if="pendingDelete" class="modal-backdrop" @click.self="pendingDelete=null">
    <div class="modal-sheet workout-delete-confirm" role="alertdialog" aria-modal="true"
      aria-labelledby="delete-workout-title" aria-describedby="delete-workout-description">
      <div class="workout-delete-confirm-icon"><AppIcon name="trash" :size="24"/></div>
      <h2 id="delete-workout-title">{{pendingDelete.type==='workout'?'Excluir este treino?':'Excluir exercício?'}}</h2>
      <p id="delete-workout-description">
        {{pendingDelete.type==='workout'
          ? 'A ficha “'+pendingDelete.name+'” e seus exercícios serão removidos da lista.'
          : '“'+pendingDelete.name+'” será removido desta ficha.'}}
        O histórico de treinos já realizados será mantido.
      </p>
      <div class="workout-delete-confirm-actions">
        <button type="button" class="outline" @click="pendingDelete=null">Cancelar</button>
        <button type="button" class="workout-delete-danger" @click="confirmDelete">
          <AppIcon name="trash" :size="16"/> Excluir
        </button>
      </div>
    </div>
  </div>
</template>
