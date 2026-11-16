<script setup>
import {inject,computed} from 'vue'
import AppIcon from '../AppIcon.vue'
const props=defineProps({compact:{type:Boolean,default:false}})
const {gamification,view,demoMode,previewReward}=inject('pegaPesoApp')
const g=computed(()=>gamification.value)
const rewards=computed(()=>g.value?.unlocked||[])
const upcoming=computed(()=>g.value?.next||null)
</script>
<template>
  <section class="pixel-rewards" aria-label="Suas conquistas e medalhas">
    <div class="pixel-rewards-head">
      <div><span>CONQUISTAS DA JORNADA</span><h3>Medalhas & insígnias</h3></div>
      <div class="pixel-streak-chip"><AppIcon name="trophy" :size="18"/><strong>{{g.current}}</strong><small>em sequência</small></div>
    </div>
    <div class="pixel-reward-stats">
      <div><strong>{{g.best}}</strong><small>Melhor sequência</small></div>
      <div><strong>{{g.total}}</strong><small>Treinos registrados</small></div>
      <div><strong>{{rewards.length}}</strong><small>Prêmios conquistados</small></div>
    </div>
    <div v-if="upcoming" class="pixel-next-reward">
      <span>PRÓXIMA CONQUISTA</span>
      <strong>{{upcoming.title}}</strong>
      <small>Meta de {{upcoming.threshold}} treinos planejados em sequência · faltam {{g.remaining}}</small>
      <div class="pixel-reward-track" role="progressbar" :aria-valuenow="Math.min(g.current,upcoming.threshold)" :aria-valuemax="upcoming.threshold" aria-valuemin="0" :aria-label="'Progresso para '+upcoming.title">
        <i :style="{width:Math.min(100,g.current/upcoming.threshold*100)+'%'}"></i>
      </div>
    </div>
    <p v-else class="pixel-rewards-complete">Você desbloqueou todos os marcos desta aventura!</p>
    <div class="pixel-medal-grid">
      <button v-for="r in (compact?gamification.unlocked.slice(-3):gamification.unlocked)" :key="r.id"
        type="button" class="pixel-medal-card" @click="previewReward(r)">
        <span class="pixel-medal-art" :class="'pixel-medal-'+r.threshold"><AppIcon name="trophy" :size="26"/></span>
        <strong>{{r.title}}</strong><small>{{r.threshold}} treinos</small>
      </button>
      <div v-if="!rewards.length" class="pixel-no-medals">
        Suas medalhas vão aparecer aqui conforme você realizar os treinos planejados.
      </div>
    </div>
    <p class="pixel-reward-rule">Valem os treinos de força feitos nos dias que você planejou. Descansos não quebram a sequência. Faltar num dia planejado quebra; cardio e vitórias simuladas não contam. A agenda atual é aplicada ao histórico anterior nesta versão de teste.</p>
    <button v-if="compact" type="button" class="pixel-reward-more" @click="view='stats'">Ver minha vitrine completa</button>
    <div v-if="demoMode" class="pixel-reward-demo">
      <small>TESTAR VISUAL DOS PRÊMIOS</small>
      <div>
        <button v-for="r in [5,15,30]" :key="r" type="button"
          @click="previewReward(r)">Prévia {{r}}</button>
      </div>
    </div>
  </section>
</template>