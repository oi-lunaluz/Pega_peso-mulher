<script setup>
import { inject } from 'vue'
import AppIcon from '../AppIcon.vue'

const {
  workout,
  activeCardioModality,
  activeCardioArt,
  time,
  maxFor,
  choose,
  finish,
  kind,
  kg,
  sets,
  completed,
} = inject('pegaPesoApp')
</script>

<template>
<div class="session-timer"><span><AppIcon name="timer" :size="17"/> {{kind==='cardio'?'CARDIO EM ANDAMENTO':'TREINO EM ANDAMENTO'}}</span><strong>{{time}}</strong><small>{{kind==='cardio'?'Bora movimentar!':'Você decide a ordem dos exercícios'}}</small></div>
<template v-if="kind==='cardio'">
<section class="cardio-mary-stage" aria-label="CaraMary fazendo o exercício escolhido">
<div class="cardio-mary-copy"><span class="cardio-mary-kicker">VOCÊ E A CARAMARY EM MOVIMENTO</span><h2>{{activeCardioModality||'Cardio'}}</h2><p>A Mary entrou no ritmo com você!</p></div>
<img class="cardio-mary-art" :src="activeCardioArt" :alt="'CaraMary praticando '+(activeCardioModality||'cardio')+' em quatro patas'"/>
</section>
</template>
<template v-else><div class="brazil-row-title"><h3>Seus exercícios</h3><span>{{completed.length}} / {{workout?.exercises.length||0}} concluídos</span></div>
<div class="brazil-list"><button v-for="(e,i) in (workout?.exercises||[])" :key="e" class="brazil-list-row" @click="choose(e)"><span class="row-icon" :class="completed.includes(e)?'mint-icon':i%2?'purple-icon':'pink-icon'"><AppIcon :name="completed.includes(e)?'check':'dumbbell'"/></span><span class="row-info"><strong>{{e}}</strong><small>{{(sets[e]||[]).length}} séries · Recorde {{maxFor(e)}} kg</small></span><span class="row-arrow">›</span></button></div></template>
<button class="brazil-complete" @click="finish"><AppIcon name="check" :size="17"/> Concluir treino</button>
</template>
