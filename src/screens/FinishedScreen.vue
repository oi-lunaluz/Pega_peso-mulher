<script setup>
import { inject } from 'vue'
import AppIcon from '../AppIcon.vue'

const {
  view,
  nextWorkoutName,
  activeCardioModality,
  sequenceAdvanced,
  time,
  finished,
  kind,
  sets,
} = inject('pegaPesoApp')
</script>

<template>
<div class="brazil-celebrate"><span v-if="kind==='cardio'" class="cardio-finished-type">{{activeCardioModality}}</span><span class="trophy"><AppIcon name="trophy" :size="42"/></span><h2>Mandou muito,<br/>mulher!</h2><p>A CaraMary tá orgulhosa de você!</p><img src="/caramelo-treino.svg" alt="Mary, a caramela CaraMary, comemorando"/><strong>{{time}}</strong><small v-if="kind==='forca'">{{Object.values(sets).reduce((sum,s)=>sum+s.length,0)}} séries registradas · {{sequenceAdvanced?'Próximo: '+(nextWorkoutName||'nenhum'):'Registro salvo, sequência mantida'}}</small><small v-else>Cardio registrado sem mudar sua sequência de musculação.</small></div><button class="brazil-primary" @click="view='home'">Voltar ao início ↗</button>
</template>
