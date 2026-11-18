<script setup>
import { inject, ref, computed } from 'vue'
import { PHASES } from '../lib/cyclePhase.js'
import AppIcon from '../AppIcon.vue'

const {
  start,
  cycle,
  noteDate,
  cycleDay,
  cycleEditing,
  cycleEditFeedback,
  cycleRecordedCount,
  toggleCycleEditing,
  toggleCycleCalendarDate,
  addNote,
  moveCycleMonth,
  calendarMonthName,
  cycleCalendarDays,
  noteEnergy,
  noteSymptoms,
  noteDifficulty,
 } = inject('pegaPesoApp')
const phasePopup=ref(null)
const phasePopupInfo=computed(()=>phasePopup.value?PHASES[phasePopup.value.key]:null)
const phaseLegend=[
  {key:'menstrual',name:'Menstrual',summary:'Dias de sangramento; pode haver cólicas ou cansaço.'},
  {key:'follicular',name:'Folicular',summary:'Depois da menstruação; a disposição pode variar.'},
  {key:'ovulatory',name:'Ovulatória',summary:'Próxima da ovulação estimada; sinais variam.'},
  {key:'luteal',name:'Lútea',summary:'Antes da menstruação; podem ocorrer sintomas pré-menstruais.'}
]
function onCalendarDay(day){
  if(cycleEditing.value){toggleCycleCalendarDate(day.date);return}
  if(day.phaseKey)phasePopup.value={key:day.phaseKey,date:day.date,actual:day.actual,predicted:day.predicted}
}
function openPhase(key){
  phasePopup.value={key,date:'',actual:false,predicted:false}
}
</script>

<template>
<div class="brazil-banner cycle-banner"><div><span class="kicker"><AppIcon name="flower" :size="17"/> SEU CORPO, SEU RITMO</span><h2>Meu ciclo</h2><p>Seu bem-estar também faz parte do treino.</p></div><img class="banner-dog" src="/caramelo-treino.svg" alt="" aria-hidden="true"/></div>
<div class="cycle-toggle"><div><strong><AppIcon name="heart" :size="17"/> Acompanhar meu ciclo</strong><small>Opcional · seus registros são sincronizados com sua conta</small></div><label class="cycle-switch"><input type="checkbox" v-model="cycle.enabled"/><span></span></label></div>
<template v-if="cycle.enabled">
<section class="calendar-card cycle-calendar-card" :class="{'is-editing':cycleEditing}">
  <div class="month-nav cycle-month-nav">
    <button type="button" aria-label="Mês anterior" @click="moveCycleMonth(-1)">‹</button>
    <strong>{{calendarMonthName}}</strong>
    <button type="button" aria-label="Próximo mês" @click="moveCycleMonth(1)">›</button>
    <button type="button" class="cycle-calendar-edit" :class="{active:cycleEditing}"
      :aria-label="cycleEditing?'Concluir edição da menstruação':'Editar menstruação no calendário'"
      :aria-pressed="cycleEditing" @click="toggleCycleEditing">
      <AppIcon :name="cycleEditing?'check':'pencil'" :size="18"/>
    </button>
  </div>
  <p v-if="cycleEditing" class="cycle-edit-hint">Toque nos dias em que menstruou para marcar ou desmarcar. Depois toque no ✓ acima.</p>
  <div class="calendar-grid cycle-calendar-grid">
    <span v-for="(day,i) in ['D','S','T','Q','Q','S','S']" :key="'week-'+i" class="weekday">{{day}}</span>
    <button v-for="d in cycleCalendarDays" :key="d.date" type="button"
      class="calendar-cell cycle-calendar-day"
      :class="[d.phase,{outside:d.outside,today:d.today,editing:cycleEditing,recorded:d.actual,disabled:cycleEditing&&d.future}]"
      :disabled="cycleEditing&&d.future"
      :aria-pressed="cycleEditing?d.actual:undefined"
      :aria-label="d.date+(d.phaseKey?' · Fase '+PHASES[d.phaseKey].name:'')+(d.actual?' · Menstruação registrada':d.predicted?' · Menstruação prevista':'')"
      @click="onCalendarDay(d)">{{d.number}}</button>
  </div>
  <div class="cycle-phase-legend" aria-label="Cores das fases do ciclo">
    <button v-for="phase in phaseLegend" :key="phase.key" type="button"
      class="cycle-phase-legend-item"
      @click="openPhase(phase.key)">
      <i :class="'cycle-phase-dot phase-'+phase.key" aria-hidden="true"></i>
      <span><strong>{{phase.name}}</strong><small>{{phase.summary}}</small></span>
      <AppIcon name="chevron" :size="15"/>
    </button>
  </div>
  <div class="calendar-legend cycle-calendar-legend">
    <span><i class="cycle-legend-actual"></i> Menstruação registrada</span>
    <span><i class="cycle-legend-estimated"></i> Menstruação prevista</span>
  </div>
  <p v-if="cycleEditing&&cycleEditFeedback" class="cycle-edit-feedback" role="status">{{cycleEditFeedback}}</p>
  <p v-else-if="cycleEditing" class="cycle-edit-count">{{cycleRecordedCount}} dias registrados no calendário</p>
</section>
<div v-if="phasePopup&&phasePopupInfo" class="modal-backdrop" @click.self="phasePopup=null">
  <div class="modal-sheet cycle-phase-popup" role="dialog" aria-modal="true"
    aria-labelledby="cycle-phase-popup-heading" aria-describedby="cycle-phase-popup-description">
    <div class="cycle-phase-popup-head">
      <span :class="'cycle-phase-popup-dot phase-'+phasePopup.key"><AppIcon name="flower" :size="20"/></span>
      <button type="button" aria-label="Fechar informações" @click="phasePopup=null">
        <AppIcon name="close" :size="19"/>
      </button>
    </div>
    <h2 id="cycle-phase-popup-heading">Fase {{phasePopupInfo.name.toLowerCase()}}</h2>
    <p v-if="phasePopup.date" class="cycle-phase-popup-date">{{new Date(phasePopup.date+'T12:00:00').toLocaleDateString('pt-BR',{day:'2-digit',month:'long',year:'numeric'})}} · {{phasePopup.actual?'Menstruação registrada':'Fase estimada'}}</p>
    <p id="cycle-phase-popup-description">{{phasePopupInfo.description}}</p>
    <div class="cycle-phase-popup-training">
      <AppIcon name="dumbbell" :size="18"/>
      <div><strong>Nos treinos</strong><p>{{phasePopupInfo.training}}</p></div>
    </div>
    <p class="cycle-phase-popup-disclaimer">As fases são previsões baseadas nos dados informados. Não servem para confirmar ovulação, prever dias férteis com segurança ou fazer diagnóstico.</p>
    <button type="button" class="cycle-phase-popup-close" @click="phasePopup=null">Entendi</button>
  </div>
</div>
<div class="cycle-info"><strong><AppIcon name="flower" :size="17"/> {{cycleDay?'Dia '+cycleDay+' do ciclo':'Vamos começar?'}}</strong><span>As fases são estimativas; não use para contracepção ou diagnóstico.</span></div>
<div class="brazil-row-title"><h3>Informações do ciclo</h3></div>
<p class="cycle-settings-note">Esses números são suas médias. Marcar dias no calendário não altera a duração média cadastrada.</p>
<div class="brazil-form-grid"><div><label class="brazil-label">Início da última menstruação</label><input type="date" v-model="cycle.start"/></div><div><label class="brazil-label">Ciclo médio (dias)</label><input type="number" min="15" max="60" v-model.number="cycle.length"/></div><div><label class="brazil-label">Duração média (dias)</label><input type="number" min="1" max="15" v-model.number="cycle.period"/></div></div>
<div class="brazil-row-title"><h3>Como você se sente?</h3><span>Um dia de cada vez <AppIcon name="sparkles" :size="17"/></span></div>
<div class="brazil-form"><label class="brazil-label">Data</label><input type="date" v-model="noteDate"/><div class="two-fields"><div><label class="brazil-label">Energia <AppIcon name="zap" :size="17"/></label><select v-model="noteEnergy"><option value="baixa">Baixa</option><option value="normal">Normal</option><option value="alta">Alta</option></select></div><div><label class="brazil-label">Treino <AppIcon name="dumbbell" :size="17"/></label><select v-model="noteDifficulty"><option value="leve">Leve</option><option value="normal">Normal</option><option value="pesada">Pesada</option></select></div></div><label class="brazil-label">Sintomas e observações</label><textarea v-model="noteSymptoms" placeholder="Cólica, humor, disposição... (opcional)"></textarea><button class="brazil-primary" @click="addNote"><AppIcon name="plus" :size="17"/> Salvar meu registro</button></div>
<div class="brazil-list"><div v-for="(n,i) in cycle.notes" :key="i" class="brazil-list-row"><span class="row-icon pink-icon"><AppIcon name="heart" :size="17"/></span><span class="row-info"><strong>{{n.date}} · Energia {{n.energy}}</strong><small>{{n.symptoms||'Sem observações'}} · Treino {{n.difficulty}}</small></span></div></div>
</template>
<div v-else class="brazil-empty with-dog"><img src="/caramelo-descanso.svg" alt="Mary, a caramela CaraMary, descansando na cadeira"/><strong>Seu ciclo, suas regras!</strong><p>Ative quando quiser registrar menstruação, energia e sintomas. Tudo é opcional.</p></div>
<p class="privacy-note"><AppIcon name="lock" :size="17"/> Os registros são mantidos no dispositivo e sincronizados com sua conta. Evite usar dispositivos compartilhados.</p>
</template>
