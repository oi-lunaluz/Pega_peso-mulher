<script setup>
import { inject } from 'vue'
import AppIcon from '../AppIcon.vue'

const {
  start,
  cycle,
  noteDate,
  cycleDay,
  addNote,
  moveCycleMonth,
  calendarMonthName,
  cycleCalendarDays,
  noteEnergy,
  noteSymptoms,
  noteDifficulty,
} = inject('pegaPesoApp')
</script>

<template>
<div class="brazil-banner cycle-banner"><div><span class="kicker"><AppIcon name="flower" :size="17"/> SEU CORPO, SEU RITMO</span><h2>Meu ciclo</h2><p>Seu bem-estar também faz parte do treino.</p></div><img class="banner-dog" src="/caramelo-treino.svg" alt="" aria-hidden="true"/></div>
<div class="cycle-toggle"><div><strong><AppIcon name="heart" :size="17"/> Acompanhar meu ciclo</strong><small>Opcional · salvo só neste navegador</small></div><label class="cycle-switch"><input type="checkbox" v-model="cycle.enabled"/><span></span></label></div>
<template v-if="cycle.enabled">
<section class="calendar-card"><div class="month-nav"><button aria-label="Mês anterior" @click="moveCycleMonth(-1)">‹</button><strong>{{calendarMonthName}}</strong><button aria-label="Próximo mês" @click="moveCycleMonth(1)">›</button></div><div class="calendar-grid"><span v-for="(day,i) in ['D','S','T','Q','Q','S','S']" :key="i" class="weekday">{{day}}</span><span v-for="d in cycleCalendarDays" :key="d.date" :class="['calendar-cell',d.phase,{outside:d.outside,today:d.today}]">{{d.number}}</span></div><div class="calendar-legend"><span><AppIcon name="heart" :size="17"/> Menstruação estimada</span><span><AppIcon name="leaf" :size="17"/> Janela fértil estimada</span></div></section>
<div class="cycle-info"><strong><AppIcon name="flower" :size="17"/> {{cycleDay?'Dia '+cycleDay+' do ciclo':'Vamos começar?'}}</strong><span>As fases são estimativas; não use para contracepção ou diagnóstico.</span></div>
<div class="brazil-row-title"><h3>Informações do ciclo</h3></div>
<div class="brazil-form-grid"><div><label class="brazil-label">Última menstruação</label><input type="date" v-model="cycle.start"/></div><div><label class="brazil-label">Ciclo médio (dias)</label><input type="number" min="15" max="60" v-model.number="cycle.length"/></div><div><label class="brazil-label">Duração (dias)</label><input type="number" min="1" max="15" v-model.number="cycle.period"/></div></div>
<div class="brazil-row-title"><h3>Como você se sente?</h3><span>Um dia de cada vez <AppIcon name="sparkles" :size="17"/></span></div>
<div class="brazil-form"><label class="brazil-label">Data</label><input type="date" v-model="noteDate"/><div class="two-fields"><div><label class="brazil-label">Energia <AppIcon name="zap" :size="17"/></label><select v-model="noteEnergy"><option value="baixa">Baixa</option><option value="normal">Normal</option><option value="alta">Alta</option></select></div><div><label class="brazil-label">Treino <AppIcon name="dumbbell" :size="17"/></label><select v-model="noteDifficulty"><option value="leve">Leve</option><option value="normal">Normal</option><option value="pesada">Pesada</option></select></div></div><label class="brazil-label">Sintomas e observações</label><textarea v-model="noteSymptoms" placeholder="Cólica, humor, disposição... (opcional)"></textarea><button class="brazil-primary" @click="addNote"><AppIcon name="plus" :size="17"/> Salvar meu registro</button></div>
<div class="brazil-list"><div v-for="(n,i) in cycle.notes" :key="i" class="brazil-list-row"><span class="row-icon pink-icon"><AppIcon name="heart" :size="17"/></span><span class="row-info"><strong>{{n.date}} · Energia {{n.energy}}</strong><small>{{n.symptoms||'Sem observações'}} · Treino {{n.difficulty}}</small></span></div></div>
</template>
<div v-else class="brazil-empty with-dog"><img src="/caramelo-descanso.svg" alt="Mary, a caramela CaraMary, descansando na cadeira"/><strong>Seu ciclo, suas regras!</strong><p>Ative quando quiser registrar menstruação, energia e sintomas. Tudo é opcional.</p></div>
<p class="privacy-note"><AppIcon name="lock" :size="17"/> Dados apenas neste navegador. Evite preencher em dispositivos compartilhados.</p>
</template>
