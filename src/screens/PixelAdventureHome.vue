<script setup>
import { computed, inject, ref, watch } from 'vue'
import AppIcon from '../AppIcon.vue'
import PixelQuestMap from './PixelQuestMap.vue'
import { questPhase, questChapter, questWindow } from '../lib/pixelQuest.js'
import { strengthNames } from '../lib/weeklyCards.js'

const {
  state, view, profile, demoMode, openWorkout, openCreateModal, openCardioModal,
  weeklyStrengthCards, toggleStrengthCard, quickFeedback,
  strengthThisMonth, personalRecords, weeklyCardio, cycle, cycleDay
} = inject('pegaPesoApp')

const workoutNames = computed(()=>strengthNames(state.value))
const completedSessions = computed(()=>(state.value.history||[]).filter(h=>h.kind==='forca').length)
// Only an in-memory visual overlay. Never counts as a recorded workout.
const simulatedWins=ref(0)
const currentStage=computed(()=>questPhase(completedSessions.value,simulatedWins.value))
const currentArea=computed(()=>questChapter(currentStage.value))
const chapter=ref(0)
const selectedStage=ref(1)
const slots=[
  {x:46,y:83},{x:66,y:68},{x:35,y:53},
  {x:63,y:37},{x:44,y:21}
]
const stages=computed(()=>questWindow(chapter.value,workoutNames.value,
  completedSessions.value,simulatedWins.value).map((s,i)=>({...s,...slots[i]})))
const selected=computed(()=>stages.value.find(s=>s.number===selectedStage.value)||stages.value.find(s=>s.current)||stages.value[0])
const currentWeekCard=computed(()=>weeklyStrengthCards.value.find(w=>w.name===selected.value?.name))
const canQuickMark=computed(()=>selected.value?.current&&workoutNames.value.length>0&&!currentWeekCard.value?.completed)
const selectedExercises=computed(()=>
  state.value.workouts.find(w=>w.name===selected.value?.name)?.exercises?.length||0
)
const lastCompletion=computed(()=>completedSessions.value)
watch(currentStage,phase=>{
  chapter.value=questChapter(phase)
  selectedStage.value=phase
},{immediate:true})
watch(lastCompletion,(next,previous)=>{
  // An actual recorded session replaces any temporary simulated victories.
  if(next!==previous&&simulatedWins.value)simulatedWins.value=0
})
function chooseStage(phase){selectedStage.value=phase}
function changeArea(delta){
  chapter.value=Math.max(0,chapter.value+delta)
  selectedStage.value=chapter.value*5+1
}
function openSelected(){
  if(workoutNames.value.includes(selected.value?.name))openWorkout(selected.value.name)
  else { view.value='list'; openCreateModal() }
}
function markAsDone(){
  if(!canQuickMark.value)return
  toggleStrengthCard(selected.value.name)
}
function resetSimulation(){simulatedWins.value=0;chapter.value=currentArea.value;selectedStage.value=currentStage.value}
function simulateVictory(){if(!demoMode||!workoutNames.value.length)return;simulatedWins.value++}
</script>

<template>
  <div class="pixel-home">
    <section class="pixel-title">
      <div class="pixel-title-top">
        <span class="pixel-kicker">PEGA PESO, MULHER! · MODO AVENTURA</span>
        <span class="pixel-chip">{{demoMode?'DEMONSTRAÇÃO':'SUA JORNADA'}}</span>
      </div>
      <h1>A trilha <em>da força</em></h1>
      <p>Olá, {{profile.nickname||'aventureira'}}! Seus treinos são missões. Evolua no seu ritmo.</p>
      <div class="pixel-status">
        <span>FASE <strong>{{currentStage}}</strong></span>
        <span>{{workoutNames.length}} {{workoutNames.length===1?'ficha':'fichas'}} na ordem</span>
        <span>{{completedSessions}} {{completedSessions===1?'missão registrada':'missões registradas'}}</span>
      </div>
    </section>

    <PixelQuestMap :stages="stages" :chapter="chapter" :selected-number="selectedStage"
      @select="chooseStage"/>

    <section class="pixel-mission" aria-live="polite">
      <div class="pixel-mission-label">
        <span>MISSÃO SELECIONADA</span><span>FASE {{selected?.number}}</span>
      </div>
      <h2>{{selected?.name||'Crie sua primeira ficha'}}</h2>
      <p v-if="!workoutNames.length">A aventura começa quando você cadastrar uma ficha de treino.</p>
      <p v-else-if="selected?.current">Sua próxima missão! {{selectedExercises}} {{selectedExercises===1?'exercício cadastrado':'exercícios cadastrados'}}.</p>
      <p v-else-if="selected?.completed">Missão já superada. Você pode consultar ou editar a ficha.</p>
      <p v-else>Missão futura na sequência. Você pode consultar a ficha sem alterar seu progresso.</p>
      <div class="pixel-mission-actions">
        <button class="pixel-action-primary" type="button" @click="openSelected">
          <AppIcon name="dumbbell" :size="17"/> {{workoutNames.length?'Ver / editar ficha':'Criar treino'}}
        </button>
        <button v-if="canQuickMark" class="pixel-action-secondary" type="button" @click="markAsDone">
          <AppIcon name="check" :size="17"/> Já fiz
        </button>
        <button v-else-if="selected?.current&&currentWeekCard?.completed" class="pixel-action-secondary"
          type="button" disabled>Feito nesta semana</button>
      </div>
      <p v-if="quickFeedback" class="pixel-demo-note" role="status">{{quickFeedback}}</p>
      <p class="pixel-demo-note">
        {{demoMode?'As alterações aqui são fictícias e desaparecem ao atualizar.':
          'Conclua uma sessão real ou use Já fiz para registrar a missão. O mapa acompanha seu histórico.'}}
      </p>
    </section>

    <section class="pixel-nav-chapters" aria-label="Navegar entre áreas da aventura">
      <button type="button" :disabled="chapter===0" @click="changeArea(-1)">◀ Anterior</button>
      <span>Área {{chapter+1}} · fases {{chapter*5+1}}–{{chapter*5+5}}</span>
      <button type="button" @click="changeArea(1)">Próxima ▶</button>
    </section>

    <section class="pixel-hub" aria-label="Atalhos para outras telas">
      <div class="pixel-hub-heading">
        <strong>Seu cantinho da aventura</strong>
        <span>Mesmos recursos, novo caminho</span>
      </div>
      <div class="pixel-hub-grid">
        <button type="button" @click="view='list'"><AppIcon name="dumbbell" :size="20"/><strong>Treinos</strong><small>Criar e editar fichas</small></button>
        <button type="button" @click="view='routine'"><AppIcon name="calendar" :size="20"/><strong>Rotina</strong><small>Ordem e cardio</small></button>
        <button type="button" @click="view='stats'"><AppIcon name="chart" :size="20"/><strong>Evolução</strong><small>{{strengthThisMonth}} treinos no mês</small></button>
        <button type="button" @click="view='cycle'"><AppIcon name="flower" :size="20"/><strong>Ciclo</strong><small>{{cycle.enabled&&cycleDay?'Dia '+cycleDay:'Opcional'}}</small></button>
      </div>
      <div class="pixel-hub-cardio">
        <div><AppIcon name="timer" :size="19"/><span>Cardio · {{weeklyCardio}}/{{state.cardioGoal||0}} min na semana</span></div>
        <button type="button" @click="openCardioModal">Iniciar cardio</button>
      </div>
      <p class="pixel-hub-hint">Você continua podendo alterar fichas, exercícios, dias, cargas e metas nas outras telas, como antes.</p>
    </section>

    <div class="pixel-footer-actions">
      <button type="button" @click="profile.homeMode='classic'">Ver painel clássico</button>
      <button v-if="demoMode" type="button" @click="simulateVictory">Simular próxima fase</button>
      <button v-else type="button" @click="view='profile'">Meu perfil</button>
      <button v-if="simulatedWins" type="button" @click="resetSimulation">Reiniciar simulação</button>
    </div>
  </div>
</template>
