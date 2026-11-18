<script setup>
import {inject,ref,computed} from 'vue'
import AppIcon from '../AppIcon.vue'

const {
  achievements,homeWeek,weeklyCardio,cardioWeeklyTarget,
  selectedStat,selectedWorkoutStat,workoutStatNames,
  statsSessions,allExercises,bestExercise,maxLoad,totalVolume,
  onWorkoutStatChange,chartWeeks,chartMax
}=inject('pegaPesoApp')

const medalRail=ref(null)
const selectedBadgeId=ref('')
const showDetails=ref(false)
const badges=computed(()=>achievements.value.items)
const currentBadge=computed(()=>badges.value.find(b=>b.id===selectedBadgeId.value)||null)
const recentSets=computed(()=>[...bestExercise.value].reverse().slice(0,12))
const recentSessions=computed(()=>[...statsSessions.value].filter(h=>h.kind==='forca').reverse().slice(0,8))
function moveMedals(direction){
 const rail=medalRail.value
 if(!rail)return
 const first=rail.querySelector('.evolution-medal')
 const amount=(first?.getBoundingClientRect().width||145)+10
 rail.scrollBy({left:direction*amount,behavior:'smooth'})
}
function selectBadge(item){selectedBadgeId.value=selectedBadgeId.value===item.id?'':item.id}
</script>

<template>
<div class="evolution-page">
  <div class="evolution-intro">
    <div>
      <span class="evolution-eyebrow">SUA EVOLUÇÃO</span>
      <h2>Olha o quanto você já fez!</h2>
      <p>Seu ritmo, seus recordes.</p>
    </div>
    <img src="/caramelo-treino.svg" alt="" aria-hidden="true"/>
  </div>

  <section class="evolution-overview" aria-label="Resumo da evolução">
    <div class="evolution-overview-item">
      <AppIcon name="check" :size="18"/>
      <strong>{{achievements.closed}}</strong><span>Semanas fechadas</span>
    </div>
    <div class="evolution-overview-item">
      <AppIcon name="flame" :size="18"/>
      <strong>{{achievements.bestStreak}}</strong><span>Melhor sequência</span>
    </div>
    <div class="evolution-overview-item">
      <AppIcon name="dumbbell" :size="18"/>
      <strong>{{achievements.maxWeight}} <small>kg</small></strong><span>Maior carga</span>
    </div>
  </section>

  <section class="evolution-achievements" aria-label="Suas medalhas">
    <div class="evolution-section-top">
      <div>
        <span class="evolution-eyebrow">CONQUISTAS</span>
        <h3>Suas medalhas <small>{{achievements.unlocked}}/{{achievements.total}}</small></h3>
      </div>
      <div class="evolution-arrows">
        <button type="button" aria-label="Ver medalhas anteriores" @click="moveMedals(-1)">
          <AppIcon name="chevron" :size="18" class="evolution-prev"/>
        </button>
        <button type="button" aria-label="Ver próximas medalhas" @click="moveMedals(1)">
          <AppIcon name="chevron" :size="18"/>
        </button>
      </div>
    </div>
    <p class="evolution-swipe-hint">Deslize para o lado e toque para saber como conquistar.</p>
    <div ref="medalRail" class="evolution-medal-rail" role="group" aria-label="Medalhas para deslizar">
      <button v-for="medal in badges" :key="medal.id" type="button"
        class="evolution-medal" :class="{earned:medal.unlocked,chosen:selectedBadgeId===medal.id}"
        :aria-pressed="selectedBadgeId===medal.id"
        @click="selectBadge(medal)">
        <span class="evolution-medal-emblem">
          <AppIcon :name="medal.icon" :size="26"/>
          <AppIcon v-if="!medal.unlocked" name="lock" :size="12" class="evolution-medal-lock"/>
        </span>
        <strong>{{medal.title}}</strong>
        <small>{{medal.unlocked?'Conquistada':'A conquistar'}}</small>
        <span class="evolution-medal-progress">
          <span :style="{width:(Math.min(100,medal.current/Math.max(1,medal.target)*100))+'%'}"></span>
        </span>
      </button>
    </div>
    <div v-if="currentBadge" class="evolution-badge-detail" role="status">
      <div class="evolution-badge-detail-title">
        <strong>{{currentBadge.title}}</strong>
        <span>{{currentBadge.unlocked?'Desbloqueada':'Bloqueada'}}</span>
      </div>
      <p>{{currentBadge.description}}</p>
      <small>{{currentBadge.unlocked?currentBadge.detail:'Progresso: '+Math.min(currentBadge.current,currentBadge.target)+' de '+currentBadge.target}}</small>
    </div>
    <p class="evolution-achievements-note">Medalhas liberadas automaticamente pelos seus registros. A medalha de superação usa apenas dias em que você informou dificuldade ou energia baixa.</p>
  </section>

  <section class="evolution-chart-block">
    <div class="evolution-section-top">
      <div><span class="evolution-eyebrow">SUA FORÇA</span><h3>Volume dos treinos</h3></div>
      <span class="evolution-top-note">4 semanas</span>
    </div>
    <div class="evolution-chart-filter">
      <label for="evolution-workout">Ver treino</label>
      <select id="evolution-workout" v-model="selectedWorkoutStat" @change="onWorkoutStatChange">
        <option value="all">Todos os treinos</option>
        <option v-for="name in workoutStatNames" :key="name" :value="name">{{name}}</option>
      </select>
    </div>
    <div class="evolution-chart-numbers">
      <span><strong>{{totalVolume.toLocaleString('pt-BR')}}</strong> kg de volume</span>
      <span><strong>{{maxLoad}}</strong> kg de maior carga</span>
    </div>
    <div class="evolution-chart-bars" role="img" aria-label="Volume de treino nas últimas quatro semanas">
      <div v-for="w in chartWeeks" :key="w.label" class="evolution-chart-column">
        <strong>{{w.value>0?w.value.toLocaleString('pt-BR'):'–'}}</strong>
        <div class="evolution-chart-rail"><div :style="{height:Math.max(w.value>0?4:0,w.value/chartMax*100)+'%'}"></div></div>
        <small>{{w.label}}</small>
      </div>
    </div>
    <p class="evolution-chart-note">Volume = carga × repetições registradas. Não representa peso corporal.</p>
  </section>

  <section class="evolution-records">
    <div class="evolution-section-top">
      <div><span class="evolution-eyebrow">HISTÓRICO</span><h3>Seus registros</h3></div>
    </div>
    <details class="evolution-records-details" :open="showDetails" @toggle="showDetails=$event.target.open">
      <summary>{{showDetails?'Ocultar registros':'Ver exercícios e sessões'}} <AppIcon name="chevron" :size="16"/></summary>
      <div class="evolution-records-inner">
        <label for="evolution-exercise">Exercício</label>
        <select id="evolution-exercise" v-model="selectedStat">
          <option value="all">Todos os exercícios</option>
          <option v-for="e in allExercises" :key="e" :value="e">{{e}}</option>
        </select>
        <p v-if="!recentSets.length" class="evolution-no-data">Finalize séries com carga para visualizar sua evolução.</p>
        <div v-else class="evolution-record-list">
          <div v-for="(entry,i) in recentSets" :key="i" class="evolution-record-row">
            <div><strong>{{entry.name}}</strong><small>{{entry.date}}</small></div>
            <span>{{entry.kg}} kg × {{entry.reps}}</span>
          </div>
        </div>
        <h4>Sessões concluídas</h4>
        <p v-if="!recentSessions.length" class="evolution-no-data">Nenhuma sessão encontrada.</p>
        <div v-else class="evolution-record-list">
          <div v-for="(entry,i) in recentSessions" :key="i" class="evolution-record-row">
            <div><strong>{{entry.name}}</strong><small>{{entry.date}}</small></div>
            <AppIcon name="check" :size="16"/>
          </div>
        </div>
      </div>
    </details>
  </section>
</div>
</template>
