<script setup>
import {inject,ref} from 'vue'
import AppIcon from '../AppIcon.vue'
import WeeklyWorkoutCards from './WeeklyWorkoutCards.vue'
import RoutineScreen from './RoutineScreen.vue'
const {state,openCreateModal,cardioSessions,weeklyCardio}=inject('pegaPesoApp')
const showSettings=ref(false)
const showHistory=ref(false)
</script>

<template>
  <div class="merged-trainings">
    <WeeklyWorkoutCards/>
    <button type="button" class="merged-add-training" @click="openCreateModal">
      <AppIcon name="plus" :size="17"/> Nova ficha de treino
    </button>

    <section class="merged-extra">
      <button type="button" class="merged-extra-toggle" :aria-expanded="showSettings" @click="showSettings=!showSettings">
        <AppIcon name="pencil" :size="17"/> Ajustar minha rotina
        <AppIcon name="chevron" :size="16"/>
      </button>
      <div v-if="showSettings" class="merged-extra-body"><RoutineScreen/></div>
    </section>

    <section class="merged-extra">
      <button type="button" class="merged-extra-toggle" :aria-expanded="showHistory" @click="showHistory=!showHistory">
        <AppIcon name="calendarCheck" :size="17"/> Histórico
        <span class="merged-extra-count">{{state.history.length}}</span>
        <AppIcon name="chevron" :size="16"/>
      </button>
      <div v-if="showHistory" class="merged-extra-body">
        <p v-if="!state.history.length" class="merged-empty">Seus treinos concluídos vão aparecer aqui.</p>
        <div v-else class="merged-history">
          <div v-for="(h,i) in [...state.history].reverse()" :key="i" class="merged-history-row">
            <AppIcon :name="h.kind==='cardio'?'timer':'check'" :size="17"/>
            <div><strong>{{h.kind==='cardio'?(h.modality||'Cardio'):h.name}}</strong><small>{{h.date}} · {{h.kind==='cardio'?Math.round((h.seconds||0)/60)+' min':h.quick?'Marcado como feito':'Treino detalhado'}}</small></div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
