<script setup>
import {inject, ref} from 'vue'
import AppIcon from '../AppIcon.vue'
const {
  view,homeGreeting,homeWeek,homeStreak,currentWeekLabel,
  quickFeedback,toggleHomeSlot,openHomeSlot,
  cycle,cycleDay,cyclePhase,
  weeklyCardio,cardioWeeklyTarget,openCardioModal
}=inject('pegaPesoApp')
const showPhaseInfo=ref(false)
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
      <div class="minimal-home-cardio-goal">
        <div class="minimal-home-cardio-goal-heading">
          <span><AppIcon name="timer" :size="16"/> Cardio</span>
          <strong>{{weeklyCardio}} <small>/ {{cardioWeeklyTarget}} min</small></strong>
        </div>
        <div class="minimal-cardio-progress" role="progressbar"
          :aria-label="'Cardio da semana: '+weeklyCardio+' de '+cardioWeeklyTarget+' minutos'"
          :aria-valuenow="Math.min(weeklyCardio,cardioWeeklyTarget)"
          :aria-valuemin="0" :aria-valuemax="cardioWeeklyTarget">
          <span :style="{width:Math.min(100,weeklyCardio/cardioWeeklyTarget*100)+'%'}"></span>
        </div>
        <p>{{weeklyCardio>=cardioWeeklyTarget?'Meta de cardio atingida!':(cardioWeeklyTarget-weeklyCardio)+' min restantes'}}</p>
      </div>
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

    <div class="minimal-home-wellness" aria-label="Ciclo e cardio da semana">
      <section class="minimal-cardio-feature minimal-cardio-launch" aria-label="Iniciar treino de cardio">
        <div class="minimal-cardio-kicker"><AppIcon name="timer" :size="17"/> CARDIO</div>
        <div class="minimal-cardio-mary">
          <img src="/mary-cardio-corrida.svg" alt="CaraMary correndo e chamando para o cardio" loading="lazy"/>
          <span class="minimal-cardio-mary-call">Vem pro cardio!</span>
        </div>
        <button type="button" class="minimal-cardio-start" @click="openCardioModal">
          <AppIcon name="arrow" :size="15"/> Iniciar cardio
        </button>
      </section>

    <section class="minimal-cycle-feature" aria-label="Resumo do ciclo menstrual">
      <div class="minimal-cycle-feature-head">
        <span class="minimal-cycle-kicker"><AppIcon name="flower" :size="17"/> SEU CICLO</span>
        <button v-if="cyclePhase" class="minimal-cycle-info-button" type="button"
          aria-label="O que posso sentir nessa fase do ciclo?"
          @click="showPhaseInfo=true">
          <AppIcon name="help" :size="19"/>
        </button>
      </div>
      <template v-if="cyclePhase">
        <div class="minimal-cycle-phase-row">
          <div>
            <h3>Fase {{cyclePhase.name.toLowerCase()}}</h3>
            <p>Dia {{cyclePhase.day}} do ciclo <span aria-hidden="true">·</span> {{cyclePhase.subtitle}}</p>
          </div>
          <span class="minimal-cycle-phase-icon"><AppIcon name="flower" :size="27"/></span>
        </div>
        <p class="minimal-cycle-phase-reminder">Uma estimativa com base nas datas cadastradas.</p>
      </template>
      <template v-else>
        <h3>Seu ciclo, seu ritmo</h3>
        <p class="minimal-cycle-empty-hint">{{cycle.enabled?'Informe a última menstruação para estimar sua fase.':'Ative o acompanhamento para ver sua fase aqui.'}}</p>
      </template>
      <button type="button" class="minimal-cycle-open" @click="view='cycle'">
        {{cyclePhase?'Ver calendário e registros':'Configurar meu ciclo'}}
        <AppIcon name="arrow" :size="15"/>
      </button>
    </section>

    </div>

    <div v-if="showPhaseInfo&&cyclePhase" class="modal-backdrop" @click.self="showPhaseInfo=false">
      <div class="modal-sheet minimal-cycle-info-sheet" role="dialog" aria-modal="true"
        aria-labelledby="cycle-phase-info-title" aria-describedby="cycle-phase-info-description">
        <div class="minimal-cycle-info-head">
          <span><AppIcon name="flower" :size="19"/> SOBRE SEU CICLO</span>
          <button type="button" aria-label="Fechar informações da fase" @click="showPhaseInfo=false">
            <AppIcon name="close" :size="19"/>
          </button>
        </div>
        <h2 id="cycle-phase-info-title">Fase {{cyclePhase.name.toLowerCase()}}</h2>
        <p id="cycle-phase-info-description">{{cyclePhase.description}}</p>
        <div class="minimal-cycle-training-tip">
          <AppIcon name="dumbbell" :size="20"/>
          <div><strong>E os treinos?</strong><p>{{cyclePhase.training}}</p></div>
        </div>
        <p class="minimal-cycle-disclaimer">As fases e possíveis sintomas são estimativas. Seu corpo pode reagir de maneira diferente a cada ciclo. Não use esta previsão para contracepção ou diagnóstico.</p>
        <button class="minimal-cycle-info-close" type="button" @click="showPhaseInfo=false">Entendi</button>
      </div>
    </div>
  </div>
</template>
