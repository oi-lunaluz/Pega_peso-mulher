<script setup>
import { computed } from 'vue'

const props=defineProps({
  stages:{type:Array,required:true},
  selectedNumber:{type:Number,required:true},
  chapter:{type:Number,required:true}
})
const emit=defineEmits(['select'])
const activeNode=computed(()=>props.stages.find(s=>s.current)||null)
</script>
<template>
  <div class="pixel-map-frame">
    <div class="pixel-map" role="group" :aria-label="'Mapa da área '+(chapter+1)+' com cinco fases'">
      <div class="pixel-map-art" aria-hidden="true"></div>
      <div class="pixel-chapter-banner">ÁREA {{chapter+1}} · BOSQUE DO MOVIMENTO</div>
      <button v-for="stage in stages" :key="stage.number" type="button"
        class="pixel-stage" :class="{
          'is-cleared':stage.completed,
          'is-active':stage.current,
          'is-locked':stage.locked,
          'is-selected':stage.number===selectedNumber
        }"
        :style="{left:stage.x+'%',top:stage.y+'%'}"
        :aria-label="'Fase '+stage.number+', '+stage.name+(stage.completed?', concluída':stage.current?', próxima missão':', futura')"
        :aria-pressed="stage.number===selectedNumber"
        @click="emit('select',stage.number)">
        <span class="pixel-stage-circle">{{stage.completed?'✓':stage.number}}</span>
        <span class="pixel-stage-name">{{stage.name}}</span>
      </button>
      <div v-if="activeNode" class="pixel-avatar"
        :style="{left:activeNode.x+'%',top:activeNode.y+'%'}">
        <img src="/pixel-hero-girl.svg" alt="Menina de cabelo castanho no caminho da aventura"/>
      </div>
      <span class="pixel-ghost-one" aria-hidden="true">✧</span>
      <span class="pixel-ghost-two" aria-hidden="true">✧</span>
      <span class="pixel-map-bottom">O PESO VARIA. A EVOLUÇÃO CONTINUA.</span>
    </div>
  </div>
</template>
