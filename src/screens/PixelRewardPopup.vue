<script setup>
import AppIcon from '../AppIcon.vue'
defineProps({reward:{type:Object,required:true},preview:{type:Boolean,default:false}})
defineEmits(['close'])
</script>
<template>
 <div class="pixel-reward-backdrop" @click.self="$emit('close')">
  <section class="pixel-reward-popup" role="dialog" aria-modal="true" aria-labelledby="reward-title">
    <div class="pixel-reward-popup-label">{{preview?'PRÉVIA ILUSTRATIVA':'CONQUISTA DESBLOQUEADA!'}}</div>
    <div class="pixel-reward-popup-characters">
      <img src="/pixel-hero-girl.svg" alt="Aventureira de cabelo castanho"/>
      <div class="pixel-popup-medal"><AppIcon name="trophy" :size="40"/></div>
      <img src="/pixel-caramary.svg" alt="CaraMary celebrando em quatro patas"/>
    </div>
    <h2 id="reward-title">{{reward.title}}</h2>
    <strong>{{reward.tier}} · {{reward.threshold}} treinos</strong>
    <p>{{reward.description}}</p>
    <p class="pixel-popup-quote">A CaraMary tá orgulhosa de você!</p>
    <button type="button" @click="$emit('close')">Continuar aventura</button>
  </section>
 </div>
</template>