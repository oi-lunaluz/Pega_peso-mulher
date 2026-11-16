<script setup>
import { inject, ref, watch } from 'vue'
import AppIcon from '../AppIcon.vue'

const {
  view, nextWorkoutName, workoutName, workout,
  addExercise, start, maxFor, newExercise,
  renameWorkout, renameExercise, removeExercise, deleteWorkout
} = inject('pegaPesoApp')

const editName=ref('')
const editingWorkout=ref(false)
const editingExercise=ref('')
const exerciseValue=ref('')
const confirmRemove=ref('')
const confirmDelete=ref(false)
const editError=ref('')
watch(workoutName,value=>{
  editName.value=value
  editingWorkout.value=false
  editingExercise.value=''
  confirmRemove.value=''
  confirmDelete.value=false
  editError.value=''
},{immediate:true})
function saveName(){
  try{renameWorkout(editName.value);editingWorkout.value=false;editError.value=''}
  catch(error){editError.value=error.message}
}
function beginExercise(name){editingExercise.value=name;exerciseValue.value=name;confirmRemove.value='';editError.value=''}
function saveExercise(name){
  try{renameExercise(name,exerciseValue.value);editingExercise.value='';editError.value=''}
  catch(error){editError.value=error.message}
}
function deleteExercise(name){
  try{removeExercise(name);confirmRemove.value='';editError.value=''}
  catch(error){editError.value=error.message}
}
function deleteEntireWorkout(){
  try{deleteWorkout();editError.value=''}
  catch(error){editError.value=error.message}
}
</script>

<template>
  <button class="back" type="button" @click="view='list'">← Minhas fichas</button>
  <div class="brazil-banner workouts-banner">
    <div><span class="kicker"><AppIcon name="dumbbell" :size="17"/> SUA FICHA</span>
      <h2>{{workoutName}}</h2><p>{{workout?.exercises.length||0}} exercícios preparados</p></div>
    <img class="banner-dog" src="/caramelo-treino.svg" alt="" aria-hidden="true"/>
  </div>

  <section class="workout-manage-panel">
    <div class="workout-manage-heading">
      <strong>Informações da ficha</strong>
      <button type="button" @click="editingWorkout=!editingWorkout;editName=workoutName;editError=''">
        <AppIcon name="pencil" :size="16"/> {{editingWorkout?'Cancelar':'Renomear'}}
      </button>
    </div>
    <form v-if="editingWorkout" class="workout-edit-row" @submit.prevent="saveName">
      <label for="workout-edit-name">Nome da ficha</label>
      <div><input id="workout-edit-name" v-model="editName" maxlength="60" required/>
        <button type="submit">Salvar</button></div>
    </form>
  </section>

  <div class="brazil-row-title"><h3>Exercícios</h3><span>Você pode editar depois</span></div>
  <div v-if="!workout?.exercises.length" class="brazil-empty">Adicione seu primeiro exercício logo abaixo.</div>
  <div v-else class="workout-exercise-list">
    <article v-for="(e,i) in workout.exercises" :key="e+'-'+i" class="workout-exercise-item">
      <div class="workout-exercise-overview">
        <span class="row-icon" :class="i%2?'purple-icon':'pink-icon'"><AppIcon name="dumbbell" :size="18"/></span>
        <span class="row-info"><strong>{{e}}</strong><small>Recorde: {{maxFor(e)}} kg</small></span>
        <button type="button" class="workout-inline-action" :aria-label="'Editar '+e" @click="beginExercise(e)">
          <AppIcon name="pencil" :size="17"/>
        </button>
      </div>
      <form v-if="editingExercise===e" class="workout-edit-row" @submit.prevent="saveExercise(e)">
        <label :for="'exercise-edit-'+i">Editar nome do exercício</label>
        <div><input :id="'exercise-edit-'+i" v-model="exerciseValue" maxlength="120" required/>
          <button type="submit">Salvar</button></div>
        <button type="button" class="workout-text-action" @click="editingExercise=''">Cancelar edição</button>
      </form>
      <div class="workout-remove-row">
        <template v-if="confirmRemove===e">
          <span>Remover da ficha? O histórico será preservado.</span>
          <button type="button" @click="deleteExercise(e)">Confirmar</button>
          <button type="button" @click="confirmRemove=''">Cancelar</button>
        </template>
        <button v-else type="button" class="workout-text-action" @click="confirmRemove=e;editingExercise=''">Remover exercício</button>
      </div>
    </article>
  </div>

  <p v-if="editError" class="field-error" role="alert">{{editError}}</p>
  <div class="brazil-form">
    <label class="brazil-label" for="new-exercise-name">Adicionar exercício</label>
    <div class="input-inline">
      <input id="new-exercise-name" v-model="newExercise" placeholder="Ex.: Agachamento livre" maxlength="120" @keyup.enter="addExercise"/>
      <button type="button" class="brazil-square-add" aria-label="Adicionar exercício" @click="addExercise"><AppIcon name="plus" :size="17"/></button>
    </div>
  </div>
  <p v-if="workoutName!==nextWorkoutName" class="rotation-outside-note">
    Esta ficha está fora da sequência atual. Você pode treiná-la sem alterar a ordem programada.
  </p>
  <button class="brazil-primary" @click="start('forca')"><AppIcon name="arrow" :size="17"/> Iniciar treino</button>

  <section class="workout-danger-zone">
    <button v-if="!confirmDelete" type="button" @click="confirmDelete=true">Excluir esta ficha</button>
    <template v-else>
      <p>Excluir <strong>{{workoutName}}</strong> da sua rotina? Os treinos registrados continuam no histórico.</p>
      <div><button type="button" class="danger-confirm" @click="deleteEntireWorkout">Sim, excluir ficha</button>
        <button type="button" @click="confirmDelete=false">Cancelar</button></div>
    </template>
  </section>
</template>
