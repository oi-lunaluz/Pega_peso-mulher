<script setup>
import {inject} from 'vue'
import AppIcon from '../AppIcon.vue'
const {
  view,homeGreeting,homeWeek,homeStreak,currentWeekLabel,
  quickFeedback,toggleHomeSlot,openHomeSlot,
  cycle,cycleDay
}=inject('pegaPesoApp')
</script>

<template>
  <div class="minimal-home">
    <header class="minimal-home-header">
      <div>
        <span class="minimal-home-hello">{{homeGreeting}}!</span>
        <h2>Seu ritmo, sua semana.</h2>
      </div>
      <span class="minimal-home-date">{{currentWeekLabel}}</span>
    </header>

    <section class="minimal-home-progress">
      <div class="minimal-home-progress-head">
        <div>
          <span class="minimal-home-eyebrow">META DA SEMANA</span>
          <h3 v-if="homeWeek.goal">{{homeWeek.done}} <small>de {{homeWeek.goal}} treinos</small></h3>
          <h3 v-else>Seu plano</h3>
          <p v-if="homeWeek.goal">{{homeWeek.goal}} {{homeWeek.goal===1?'dia de treino':'dias de treino'}} · {{homeWeek.rest}} {{homeWeek.rest===1?'de descanso':'de descanso'}}</p>
          <p v-else>Crie suas fichas para começar.</p>
        </div>
        <div class="minimal-home-streak" :class="{on:homeStreak>0}" :aria-label="'Ofensiva de '+homeStreak+' semanas fechadas'">
          <AppIcon name="flame" :size="21"/>
          <strong>{{homeStreak}}</strong>
          <small>{{homeStreak===1?'semana':'semanas'}}</small>
        </div>
      </div>
      <div v-if="homeWeek.goal" class="minimal-home-progress-track" role="progressbar"
        :aria-valuenow="homeWeek.done" :aria-valuemin="0" :aria-valuemax="homeWeek.goal"
        :aria-label="'Progresso semanal: '+homeWeek.done+' de '+homeWeek.goal+' treinos'">
        <span :style="{width:(homeWeek.done/homeWeek.goal*100)+'%'}"></span>
      </div>
      <p v-if="homeWeek.complete" class="minimal-home-success"><AppIcon name="check" :size="15"/> Semana fechada! Ofensiva mantida.</p>
      <p v-else-if="homeWeek.goal" class="minimal-home-helper">
        {{homeWeek.goal-homeWeek.done}} {{homeWeek.goal-homeWeek.done===1?'treino':'treinos'}} para fechar a semana.
      </p>
      <p v-if="homeStreak===0&&homeWeek.goal" class="minimal-home-helper">Complete a meta para iniciar sua ofensiva de semanas.</p>
    </section>

    <section class="minimal-home-sequence">
      <div class="minimal-home-row-heading">
        <h3>Sequência da semana</h3>
        <button type="button" @click="view='list'">Ver fichas <AppIcon name="arrow" :size="14"/></button>
      </div>

      <div v-if="homeWeek.goal" class="minimal-home-rail"
        :aria-label="'Sequência de '+homeWeek.goal+' treinos e '+homeWeek.rest+' descansos'">
        <span v-for="slot in homeWeek.slots" :key="slot.number"
          class="minimal-home-rail-cell" :class="{done:slot.done}">
          <AppIcon v-if="slot.done" name="check" :size="14"/>
          <template v-else>{{slot.number}}</template>
        </span>
        <span v-for="i in homeWeek.rest" :key="'rest-'+i" class="minimal-home-rail-cell rest" aria-label="Descanso">–</span>
      </div>

      <div v-if="homeWeek.goal" class="minimal-home-rows">
        <div v-for="slot in homeWeek.slots" :key="slot.number"
          class="minimal-home-workout" :class="{done:slot.done}">
          <span class="minimal-home-number">{{slot.number}}</span>
          <button type="button" class="minimal-home-workout-name" @click="openHomeSlot(slot.name)">
            <strong>Treino {{slot.number}}</strong>
            <small>{{slot.name||'Definir ficha'}}</small>
          </button>
          <button v-if="!slot.detailed" type="button" class="minimal-home-check"
            :class="{done:slot.done}" :aria-pressed="slot.done"
            :aria-label="slot.done?'Desfazer treino '+slot.number:'Marcar treino '+slot.number+' como feito'"
            @click="toggleHomeSlot(slot.number)">
            <AppIcon name="check" :size="17"/>
          </button>
          <span v-else class="minimal-home-check done" aria-label="Treino detalhado concluído"><AppIcon name="check" :size="17"/></span>
        </div>
      </div>

      <div v-else class="minimal-home-empty">
        <p>Seus treinos vão aparecer aqui, em sequência.</p>
        <button type="button" @click="view='list'">Cadastrar meus treinos</button>
      </div>

      <div v-if="homeWeek.rest" class="minimal-home-rest">
        <AppIcon name="moon" :size="16"/>
        <span>{{homeWeek.rest}} {{homeWeek.rest===1?'descanso':'descansos'}} na semana</span>
      </div>
      <p v-if="quickFeedback" class="quick-workout-feedback" role="status">{{quickFeedback}}</p>
    </section>

    <button class="minimal-home-cycle" type="button" @click="view='cycle'">
      <AppIcon name="flower" :size="18"/>
      <span>{{cycle.enabled&&cycleDay?'Ciclo · dia '+cycleDay:'Meu ciclo'}}</span>
      <AppIcon name="chevron" :size="16"/>
    </button>
  </div>
</template>
