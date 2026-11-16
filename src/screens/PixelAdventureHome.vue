<script setup>
import { computed, inject, ref, watch } from 'vue'
import AppIcon from '../AppIcon.vue'

const { state, view, openWorkout, profile } = inject('pegaPesoApp')
const simulatedWins = ref(0)
const selectedStage = ref(null)
const chapter = ref(0)

// The registered order remains the source of stage types, but stage numbers
// never reset: 1, 2, 3 ... 6, 7, 8 ... regardless of how many fichas exist.
const workoutNames = computed(() => {
  const known = (state.value.workouts || []).map(w => w.name)
  return [...new Set([...(state.value.rotation || []).filter(n => known.includes(n)), ...known])]
})
const completedInHistory = computed(() => (state.value.history || []).filter(h => h.kind === 'forca').length)
const currentStage = computed(() => completedInHistory.value + simulatedWins.value + 1)
const chapterOfCurrent = computed(() => Math.floor((currentStage.value - 1) / 7))
const slots = [
  { x: 46, y: 86 }, { x: 66, y: 73 }, { x: 36, y: 61 },
  { x: 63, y: 49 }, { x: 39, y: 37 }, { x: 59, y: 25 }, { x: 47, y: 13 }
]
const stages = computed(() => slots.map((point, i) => {
  const number = chapter.value * slots.length + i + 1
  const name = workoutNames.value.length ? workoutNames.value[(number - 1) % workoutNames.value.length] : 'Crie uma ficha'
  return { ...point, number, name, completed: number < currentStage.value, current: number === currentStage.value, locked: number > currentStage.value }
}))
const activeNode = computed(() => stages.value.find(s => s.current))
const selected = computed(() => stages.value.find(s => s.number === selectedStage.value) || activeNode.value || stages.value[0])
const percent = computed(() => workoutNames.value.length ? (completedInHistory.value + simulatedWins.value) % workoutNames.value.length : 0)
watch(currentStage, () => {
  chapter.value = chapterOfCurrent.value
  selectedStage.value = currentStage.value
}, { immediate: true })
function choose(stage) { selectedStage.value = stage.number }
function win() {
  if (!workoutNames.value.length) return
  simulatedWins.value++
}
function resetDemo() { simulatedWins.value = 0; chapter.value = chapterOfCurrent.value; selectedStage.value = currentStage.value }
function openSelected() {
  if (selected.value?.name && workoutNames.value.includes(selected.value.name)) openWorkout(selected.value.name)
  else view.value = 'list'
}
</script>

<template>
  <div class="pixel-home">
    <section class="pixel-title">
      <div class="pixel-title-top"><span class="pixel-kicker">PEGA PESO, MULHER! · MODO AVENTURA</span><span class="pixel-chip">DEMO</span></div>
      <h1>A trilha <em>da força</em></h1>
      <p>Uma floresta, muitos desafios. Você é a protagonista da sua evolução.</p>
      <div class="pixel-status">
        <span>✦ FASE <strong>{{ currentStage }}</strong></span>
        <span>◆ {{ workoutNames.length }} {{ workoutNames.length === 1 ? 'ficha cadastrada' : 'fichas cadastradas' }}</span>
      </div>
    </section>

    <div class="pixel-map-frame">
      <div class="pixel-map" role="group" aria-label="Mapa de fases dos treinos">
        <div class="pixel-map-art" aria-hidden="true"></div>
        <div class="pixel-chapter-banner">CAPÍTULO {{ chapter + 1 }} · BOSQUE DO MOVIMENTO</div>
        <button v-for="s in stages" :key="s.number" type="button"
          class="pixel-stage" :class="{ 'is-cleared':s.completed, 'is-active':s.current, 'is-locked':s.locked, 'is-selected':selected?.number===s.number }"
          :style="{ left:s.x+'%', top:s.y+'%' }" :aria-label="'Fase '+s.number+': '+s.name+(s.completed?' concluída':s.current?' atual':' futura')"
          @click="choose(s)">
          <span class="pixel-stage-circle">{{s.completed?'✓':s.number}}</span>
          <span class="pixel-stage-name">{{s.name}}</span>
        </button>
        <div v-if="activeNode" class="pixel-avatar" :style="{ left:activeNode.x+'%', top:activeNode.y+'%' }">
          <img src="/pixel-hero-girl.svg" alt="Menina de cabelo castanho, protagonista da aventura"/>
        </div>
        <span class="pixel-ghost-one" aria-hidden="true">✧</span>
        <span class="pixel-ghost-two" aria-hidden="true">✧</span>
        <span class="pixel-map-bottom">✦ O PESO VARIA. A EVOLUÇÃO CONTINUA. ✦</span>
      </div>
    </div>

    <section class="pixel-mission" aria-live="polite">
      <div class="pixel-mission-label"><span>MISSÃO SELECIONADA</span><span>FASE {{selected?.number}}</span></div>
      <h2>{{selected?.name || 'Crie sua primeira ficha'}}</h2>
      <p v-if="selected?.current">Seu próximo desafio está pronto! Escolha acompanhar o treino ou simular uma vitória.</p>
      <p v-else-if="selected?.completed">Missão concluída. A sua trilha continua!</p>
      <p v-else>Uma fase futura da sua sequência. Continue avançando para chegar até ela.</p>
      <div class="pixel-mission-actions">
        <button class="pixel-action-primary" type="button" @click="openSelected">
          <AppIcon name="dumbbell" :size="17"/> {{workoutNames.length?'Ver ficha':'Criar treino'}}
        </button>
        <button class="pixel-action-secondary" type="button" :disabled="!workoutNames.length" @click="win">
          <AppIcon name="check" :size="17"/> Simular vitória
        </button>
      </div>
      <p class="pixel-demo-note">A simulação é só visual: não registra peso, treino ou conclusão no Supabase.</p>
    </section>

    <section class="pixel-nav-chapters">
      <button type="button" :disabled="chapter===0" @click="chapter--; selectedStage=null">◀ Área anterior</button>
      <span>Área {{chapter + 1}}</span>
      <button type="button" @click="chapter++; selectedStage=null">Próxima área ▶</button>
    </section>
    <div class="pixel-footer-actions">
      <span>Olá, {{profile.nickname || 'aventureira'}}!</span>
      <button type="button" @click="resetDemo">Reiniciar simulação</button>
    </div>
  </div>
</template>
