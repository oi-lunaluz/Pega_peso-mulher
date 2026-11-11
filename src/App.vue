<script setup>
import AppIcon from './AppIcon.vue'
import { useAppState } from './composables/useAppState.js'

const {
  state,
  weekNames,
  calendarNow,
  dateToday,
  scheduledDays,
  scheduledDayNames,
  scheduleInputs,
  overdueWorkouts,
  dueWorkouts,
  toggleTrainingDay,
  weekPlan,
  view,
  rotation,
  rotationIndex,
  nextWorkoutName,
  nextWorkout,
  addRotationName,
  availableForRotation,
  preserveNextRotation,
  moveRotation,
  removeRotation,
  addRotation,
  advanceRotation,
  workoutName,
  createModal,
  openCreateModal,
  workout,
  openWorkout,
  addWorkout,
  addExercise,
  started,
  cardioModal,
  cardioModalities,
  selectedCardioModality,
  activeCardioModality,
  activeCardioArt,
  openCardioModal,
  confirmCardioStart,
  clock,
  sessionWorkoutName,
  sequenceAdvanced,
  start,
  elapsed,
  time,
  maxFor,
  lastFor,
  choose,
  addSet,
  finish,
  workoutTab,
  cardioSessions,
  cardioTotalMinutes,
  cardioLastSession,
  selectedStat,
  selectedWorkoutStat,
  workoutStatNames,
  statsSessions,
  allExercises,
  exerciseStats,
  bestExercise,
  maxLoad,
  totalVolume,
  completedSessions,
  onWorkoutStatChange,
  cycle,
  noteDate,
  cycleDay,
  addNote,
  weeklyCardio,
  cycleCalendarMonth,
  cycleCalendarYear,
  moveCycleMonth,
  calendarMonthName,
  cycleCalendarDays,
  chartWeeks,
  chartMax,
  profile,
  strengthThisMonth,
  personalRecords,
  homeGreeting,
  openToday,
  newWorkout,
  newExercise,
  createError,
  finished,
  kind,
  exercise,
  kg,
  reps,
  sets,
  completed,
  noteEnergy,
  noteSymptoms,
  noteDifficulty,
} = useAppState()
</script>
<template>
<div class="app" :class="{'on-home':view==='home','brazil-app':view!=='home'}">
<header :class="{'home-header':view==='home','brazil-header':view!=='home'}">
<div><small class="brand-wordmark"><span class="brand-mark"><AppIcon name="dumbbell" :size="17"/></span> PEGA PESO, MULHER!</small><h1 v-if="view!=='home'">{{view==='edit'?'Minha sequência':view==='list'?'Meus treinos':view==='stats'?'Minha evolução':view==='cycle'?'Meu ciclo':view==='routine'?'Ordem dos treinos':view==='profile'?'Meu perfil':view==='done'?'Missão cumprida!':view==='session'?'Treino em ação':view==='exercise'?exercise:workoutName||'Seu treino'}}</h1></div>
<button v-if="view!=='profile'" class="header-profile" title="Meu perfil" aria-label="Abrir meu perfil" @click="view='profile'"><AppIcon name="user" :size="21"/></button>
<button v-else class="header-profile" aria-label="Voltar ao início" @click="view='home'"><AppIcon name="close" :size="20"/></button>
</header>
<main>
<template v-if="view==='home'">
<div class="home-greeting">
 <div class="greeting-copy"><span class="eyebrow">BORA PRA CIMA!</span><h2>{{homeGreeting}},<br/><em>mulher!</em></h2><p>A CaraMary tá de olho na sua evolução!</p></div>
 <img class="home-dog" src="/caramelo-treino.svg" alt="Mary, a caramela apelidada CaraMary, de óculos e bandana rosa, sorrindo"/><span class="mary-label">Mary, a CaraMary</span>
</div>
<div class="home-rotation">
  <div class="home-section-title"><strong>Sua semana</strong><button class="home-text-link" @click="view='routine'">Editar <span aria-hidden="true">›</span></button></div>
  <div class="home-week-days">
    <button v-for="d in weekPlan" :key="d.date" :class="{active:d.isToday,hasWorkout:d.scheduled,missed:d.status==='pendente'}"
      :aria-label="d.full+': '+(d.scheduled?d.status:'Descanso ou cardio livre')" @click="view='routine'">
      <span>{{d.short}}</span>
      <AppIcon v-if="d.scheduled" :name="d.status==='concluído'?'check':'dumbbell'" :size="15" :strokeWidth="2.5"/>
      <span v-else class="week-rest-mark">–</span>
    </button>
  </div>
  <p v-if="overdueWorkouts>0" class="home-overdue" role="status"><AppIcon name="calendar" :size="15"/> {{overdueWorkouts}} {{overdueWorkouts===1?'treino pendente':'treinos pendentes'}}. A ordem foi ajustada para você não pular nenhum.</p>
  <p v-else class="rotation-help">{{scheduledDayNames.join(', ')||'Nenhum dia marcado'}} · siga no seu ritmo.</p>
</div>
<div class="home-metrics">
 <button class="home-metric mint" @click="view='stats'"><small>Treinos no mês</small><strong>{{strengthThisMonth}}</strong><span class="metric-caption">Você tá construindo!</span></button>
 <button class="home-metric peach" @click="view='stats'"><small>Exercícios registrados</small><strong>{{personalRecords}}</strong><span class="metric-caption">Sua evolução conta!</span></button>
</div>
<section class="home-today">
  <div class="home-today-header"><span class="eyebrow">{{overdueWorkouts?'TREINO PENDENTE':'PRÓXIMO TREINO'}}</span><span class="today-pill">{{rotation.length?'Treino '+(rotationIndex+1)+' de '+rotation.length:'Monte sua sequência'}}</span></div>
  <div class="home-today-body"><div><h2>{{nextWorkoutName||'Defina sua ordem'}}</h2><p v-if="nextWorkout">{{nextWorkout.exercises.length}} exercícios · {{overdueWorkouts?'recuperando treino atrasado':'avança ao concluir'}}</p><p v-else>Adicione suas fichas à sequência de treinos.</p></div></div>
  <button class="home-primary" @click="openToday">{{nextWorkout?'Iniciar treino':'Organizar treinos'}} <span aria-hidden="true">→</span></button>
</section>
<div class="home-bottom-grid">
 <div class="home-cardio"><span class="eyebrow">SEU CARDIO</span><strong>{{weeklyCardio}} <small>min na semana</small></strong><span>Meta: {{state.cardioGoal}} min na semana</span><span class="home-progress"><i :style="{width:Math.min(100,weeklyCardio/Math.max(1,state.cardioGoal)*100)+'%'}"></i></span><img src="/caramelo-descanso.svg" alt="" aria-hidden="true"/><button class="home-cardio-start" @click="openCardioModal">Iniciar cardio <AppIcon name="arrow" :size="15"/></button></div>
 <button class="home-cycle" @click="view='cycle'"><span class="eyebrow">SEU CICLO</span><strong>{{cycle.enabled&&cycleDay?'Dia '+cycleDay:'Meu ciclo'}}</strong><span>{{cycle.enabled?'Seu acompanhamento':'Acompanhe como se sente'}}</span><span class="cycle-more">Ver ciclo ↗</span></button>
</div>
<div class="home-footer-note">O peso varia. A evolução continua.</div>
</template>
<template v-else-if="view==='routine'">
<div class="brazil-banner yellow"><div><span class="kicker">SEU PLANEJAMENTO</span><h2>Semana flexível!</h2><p>Os dias continuam. Os treinos se reorganizam.</p></div><img class="banner-dog" src="/caramelo-treino.svg" alt="" aria-hidden="true"/></div>
<div v-if="overdueWorkouts" class="schedule-overdue" role="status"><strong>{{overdueWorkouts}} {{overdueWorkouts===1?'treino pendente':'treinos pendentes'}}</strong><p>Você perdeu um dia planejado. Vamos fazer {{nextWorkoutName}} no próximo dia de treino, sem pular sua sequência.</p></div>
<div class="rotation-intro"><strong>Como funciona</strong><p>Escolha os dias em que costuma treinar. Se faltar, o treino não é perdido: ele passa para o próximo dia disponível e os demais seguem a ordem.</p></div>
<div class="brazil-row-title"><h3>Meus dias de treino</h3><span>Toque para marcar ou desmarcar</span></div>
<div class="schedule-day-picker">
<button v-for="d in [{day:1,label:'Seg'},{day:2,label:'Ter'},{day:3,label:'Qua'},{day:4,label:'Qui'},{day:5,label:'Sex'},{day:6,label:'Sáb'},{day:0,label:'Dom'}]"
:key="d.day" :aria-pressed="scheduledDays.includes(d.day)" :class="{selected:scheduledDays.includes(d.day)}" @click="toggleTrainingDay(d.day)">{{d.label}}</button>
</div>
<div class="brazil-row-title"><h3>Esta semana</h3><span>Reorganizada automaticamente</span></div>
<div class="brazil-list">
  <div v-for="d in weekPlan" :key="d.date" class="brazil-list-row schedule-day-row" :class="{isToday:d.isToday,isLate:d.status==='pendente'}">
    <span class="schedule-date">{{d.short}}</span>
    <span class="row-info"><strong>{{d.scheduled?(d.name|| (d.past?'Treino programado':nextWorkoutName)):'Descanso / cardio livre'}}</strong><small>{{d.full}} · {{d.status==='pendente'?'Faltou — treino mantido na sequência':d.status==='concluído'?'Treino registrado':d.status==='reorganizado'?'Treino já reorganizado':d.status==='hoje'?'Treino previsto para hoje':d.status==='previsto'?'Próximo na ordem':'Dia livre'}}</small></span>
    <AppIcon v-if="d.status==='concluído'" name="check" :size="19"/>
    <span v-else-if="d.status==='pendente'" class="schedule-late-tag">Pendente</span>
  </div>
</div>
<div class="brazil-row-title"><h3>Ordem das fichas</h3><span>Arraste usando as setas</span></div>
<div class="brazil-list">
  <div v-for="(name,i) in rotation" :key="name" class="brazil-list-row rotation-list-row" :class="{'is-next':i===rotationIndex}">
    <span class="rotation-order-number">{{i+1}}</span>
    <span class="row-info"><strong>{{name}}</strong><small>{{i===rotationIndex?'Próximo a fazer':'Treino '+(i+1)}}</small></span>
    <div class="rotation-row-controls">
      <button :disabled="i===0" :aria-label="'Mover '+name+' para cima'" @click="moveRotation(i,-1)">↑</button>
      <button :disabled="i===rotation.length-1" :aria-label="'Mover '+name+' para baixo'" @click="moveRotation(i,1)">↓</button>
      <button class="rotation-remove" :aria-label="'Retirar '+name+' da sequência'" @click="removeRotation(i)">×</button>
    </div>
  </div>
</div>
<div v-if="!rotation.length" class="brazil-empty">Sua sequência está vazia. Adicione uma ficha abaixo.</div>
<div class="rotation-add"><label for="rotation-add-select">Adicionar treino à sequência</label><div><select id="rotation-add-select" v-model="addRotationName"><option value="">Selecione uma ficha</option><option v-for="w in availableForRotation" :value="w.name" :key="w.name">{{w.name}}</option></select><button :disabled="!addRotationName" @click="addRotation"><AppIcon name="plus" :size="17"/></button></div></div>
<button class="outline brazil-outline" @click="view='list'">Gerenciar minhas fichas</button>
<div class="cardio-goal-panel"><h3>Cardio independente</h3><p>Você pode fazer cardio em qualquer dia; isso não muda a ordem dos treinos de força.</p>
  <div class="cardio-goal-fields"><div><label for="cardio-week-goal">Meta semanal (min)</label><input id="cardio-week-goal" type="number" min="1" v-model.number="state.cardioGoal"/></div>
  <div><label for="cardio-session-goal">Referência por sessão (min)</label><input id="cardio-session-goal" type="number" min="1" v-model.number="state.cardioSessionTarget"/></div></div>
  <div class="rotation-cardio-progress"><span>{{weeklyCardio}} de {{state.cardioGoal}} min realizados nesta semana</span><span class="progress-track"><i :style="{width:Math.min(100,weeklyCardio/Math.max(1,state.cardioGoal)*100)+'%'}"></i></span></div>
  <button class="brazil-primary" @click="openCardioModal">Iniciar cardio</button>
</div>
</template>
<template v-else-if="view==='stats'">
<div class="brazil-banner pink-banner"><div><span class="kicker"><AppIcon name="chart" :size="17"/> O PESO VARIA...</span><h2>Sua evolução<br/>continua!</h2><p>Cada repetição conta. <AppIcon name="heart" :size="17"/></p></div><img class="banner-dog" src="/caramelo-treino.svg" alt="" aria-hidden="true"/></div>
<div class="stats-workout-filter">
<label class="brazil-label" for="filter-workout">Filtrar por treino</label>
<select id="filter-workout" class="brazil-select" v-model="selectedWorkoutStat" @change="onWorkoutStatChange">
<option value="all">Todos os treinos</option>
<option v-for="name in workoutStatNames" :key="name" :value="name">{{name}}</option>
</select>
<p>Os números abaixo consideram {{selectedWorkoutStat==='all'?'todos os treinos registrados':'somente o treino '+selectedWorkoutStat}}.</p>
</div>
<div class="brazil-stats"><div class="stat-tile yellow-tile"><span><AppIcon name="dumbbell" :size="17"/> VOLUME REGISTRADO</span><strong>{{totalVolume.toLocaleString('pt-BR')}}<small> kg</small></strong></div><div class="stat-tile mint-tile"><span><AppIcon name="trophy" :size="17"/> MAIOR CARGA</span><strong>{{maxLoad}}<small> kg</small></strong></div></div>
<section class="chart-card"><div class="brazil-row-title"><h3>Volume de treino</h3><span>Últimas 4 semanas</span></div><div class="chart-bars"><div v-for="w in chartWeeks" :key="w.label" class="chart-column"><strong>{{w.value>0?w.value.toLocaleString('pt-BR'):'–'}}</strong><div class="chart-rail"><div :style="{height:Math.max(3,w.value/chartMax*100)+'%'}"></div></div><small>{{w.label}}</small></div></div><p class="chart-footnote">Volume = peso × repetições das séries registradas.</p></section>
<div class="brazil-row-title"><h3>Seu histórico</h3><span>{{completedSessions}} sessões</span></div>
<label class="brazil-label" for="filter-exercise">Filtrar por exercício</label>
<select id="filter-exercise" class="brazil-select" v-model="selectedStat"><option value="all">Todos os exercícios</option><option v-for="e in allExercises" :key="e" :value="e">{{e}}</option></select>
<div v-if="!bestExercise.length" class="brazil-empty"><strong><AppIcon name="smile" :size="17"/> Começou agora?</strong><p>{{selectedWorkoutStat==='all'?'Registre suas séries e veja sua evolução crescer por aqui!':'Ainda não há séries registradas para este treino.'}}</p></div>
<div class="brazil-list"><div v-for="(s,i) in [...bestExercise].reverse().slice(0,20)" :key="i" class="brazil-list-row"><span class="row-icon pink-icon"><AppIcon name="dumbbell" :size="17"/></span><span class="row-info"><strong>{{s.name}}</strong><small>{{s.date}}</small></span><span class="row-value">{{s.kg}} kg × {{s.reps}}</span></div></div>
<div class="brazil-row-title"><h3>Treinos concluídos</h3></div><div v-if="!statsSessions.length" class="brazil-empty">Nenhuma sessão concluída neste filtro.</div><div class="brazil-list"><div v-for="(h,i) in [...statsSessions].reverse().slice(0,10)" :key="i" class="brazil-list-row"><span class="row-icon mint-icon"><AppIcon name="check" :size="17"/></span><span class="row-info"><strong>{{h.kind==='cardio'?(h.modality||'Cardio'):h.name}}</strong><small>{{h.date}}</small></span><span class="row-value">{{Math.round(h.seconds/60)}} min</span></div></div>
</template>
<template v-else-if="view==='cycle'">
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
<template v-else-if="view==='list'">
<div class="brazil-banner workouts-banner"><div><span class="kicker"><AppIcon name="dumbbell" :size="17"/> SUAS FICHAS</span><h2>Treino de milhões!</h2><p>Um exercício de cada vez, gata. <AppIcon name="heart" :size="17"/></p></div><img class="banner-dog" src="/caramelo-treino.svg" alt="" aria-hidden="true"/></div>
<div class="brazil-tabs cardio-tabs"><button :class="{active:workoutTab==='fichas'}" @click="workoutTab='fichas'">Musculação</button><button :class="{active:workoutTab==='cardio'}" @click="workoutTab='cardio'">Cardio</button><button :class="{active:workoutTab==='historico'}" @click="workoutTab='historico'">Histórico</button></div>
<template v-if="workoutTab==='fichas'"><div class="brazil-row-title"><h3>{{state.workouts.length}} fichas cadastradas</h3></div>
<div class="brazil-list"><button v-for="(w,i) in state.workouts" :key="w.name" class="brazil-list-row" @click="openWorkout(w.name)"><span class="row-icon" :class="i%2?'purple-icon':'pink-icon'"><AppIcon name="dumbbell"/></span><span class="row-info"><strong>{{w.name}}</strong><small>{{w.exercises.length}} exercícios</small></span><span class="row-arrow">›</span></button></div>
<button class="brazil-primary" @click="openCreateModal"><AppIcon name="plus" :size="17"/> Criar nova ficha</button><div class="dog-quote"><img src="/caramelo-descanso.svg" alt="CaraMary relaxando na cadeira"/><p>“Descanso também é treino, viu?!” — CaraMary <AppIcon name="palm" :size="17"/></p></div></template>
<template v-else-if="workoutTab==='cardio'">
<div class="cardio-training-panel">
<div class="cardio-panel-head"><span>SESSÃO DE CARDIO</span><h3>Seu cardio, seu ritmo</h3><p>Faça seu cardio quando quiser. A ordem da musculação não muda.</p></div>
<div class="cardio-session-goal"><div><small>Referência por sessão</small><strong>{{state.cardioSessionTarget}} min</strong></div><div><small>Realizado na semana</small><strong>{{weeklyCardio}} / {{state.cardioGoal}} min</strong></div></div>
<button class="brazil-primary cardio-panel-start" @click="openCardioModal"><AppIcon name="timer" :size="18"/> Iniciar sessão de cardio</button>
</div>
<div class="brazil-row-title"><h3>Suas sessões de cardio</h3><span>{{cardioSessions.length}} concluídas</span></div>
<div class="cardio-session-summary"><div><small>Tempo total registrado</small><strong>{{cardioTotalMinutes}} min</strong></div><div><small>Última sessão</small><strong>{{cardioLastSession?Math.round(cardioLastSession.seconds/60)+' min':'—'}}</strong></div></div>
<div v-if="!cardioSessions.length" class="brazil-empty">Seu histórico de cardio aparece aqui depois de finalizar a primeira sessão.</div>
<div v-else class="brazil-list"><div v-for="(h,i) in [...cardioSessions].reverse()" :key="i" class="brazil-list-row"><span class="row-icon mint-icon"><AppIcon name="timer" :size="19"/></span><span class="row-info"><strong>{{h.modality||'Cardio'}}</strong><small>{{h.date}}</small></span><span class="row-value">{{Math.round(h.seconds/60)}} min</span></div></div>
</template>
<template v-else><div class="brazil-row-title"><h3>Treinos finalizados</h3><span>{{state.history.length}} registros</span></div><div v-if="!state.history.length" class="brazil-empty"><AppIcon name="smile" :size="17"/> Quando você concluir um treino, ele aparecerá aqui!</div><div class="brazil-list"><div v-for="(h,i) in [...state.history].reverse()" :key="i" class="brazil-list-row"><span class="row-icon mint-icon"><AppIcon name="check" :size="17"/></span><span class="row-info"><strong>{{h.kind==='cardio'?(h.modality||'Cardio'):h.name}}</strong><small>{{h.date}}</small></span><span class="row-value">{{Math.round(h.seconds/60)}} min</span></div></div></template>
</template>
<template v-else-if="view==='workout'">
<button class="back" @click="view='list'">← Minhas fichas</button>
<div class="brazil-banner workouts-banner"><div><span class="kicker"><AppIcon name="dumbbell" :size="17"/> SUA FICHA</span><h2>{{workoutName}}</h2><p>{{workout?.exercises.length||0}} exercícios preparados</p></div><img class="banner-dog" src="/caramelo-treino.svg" alt="" aria-hidden="true"/></div>
<div class="brazil-row-title"><h3>Exercícios</h3><span>Escolha sua ordem depois</span></div><div class="brazil-list"><div class="brazil-list-row" v-for="(e,i) in (workout?.exercises||[])" :key="e"><span class="row-icon" :class="i%2?'purple-icon':'pink-icon'"><AppIcon name="dumbbell" :size="17"/></span><span class="row-info"><strong>{{e}}</strong><small><AppIcon name="trophy" :size="17"/> Recorde {{maxFor(e)}} kg</small></span></div></div>
<div class="brazil-form"><label class="brazil-label">Adicionar exercício</label><div class="input-inline"><input v-model="newExercise" placeholder="Ex.: Agachamento livre" @keyup.enter="addExercise"/><button class="brazil-square-add" aria-label="Adicionar exercício" @click="addExercise"><AppIcon name="plus" :size="17"/></button></div></div>
<p v-if="workoutName!==nextWorkoutName" class="rotation-outside-note">Esta ficha está fora da sequência atual. Você pode treiná-la, mas ela não avança a ordem programada.</p><button class="brazil-primary" @click="start('forca')"><AppIcon name="arrow" :size="17"/> Iniciar treino</button></template>
<template v-else-if="view==='session'">
<div class="session-timer"><span><AppIcon name="timer" :size="17"/> {{kind==='cardio'?'CARDIO EM ANDAMENTO':'TREINO EM ANDAMENTO'}}</span><strong>{{time}}</strong><small>{{kind==='cardio'?'Bora movimentar!':'Você decide a ordem dos exercícios'}}</small></div>
<template v-if="kind==='cardio'">
<section class="cardio-mary-stage" aria-label="CaraMary fazendo o exercício escolhido">
<div class="cardio-mary-copy"><span class="cardio-mary-kicker">VOCÊ E A CARAMARY EM MOVIMENTO</span><h2>{{activeCardioModality||'Cardio'}}</h2><p>A Mary entrou no ritmo com você!</p></div>
<img class="cardio-mary-art" :src="activeCardioArt" :alt="'CaraMary praticando '+(activeCardioModality||'cardio')+' em quatro patas'"/>
</section>
</template>
<template v-else><div class="brazil-row-title"><h3>Seus exercícios</h3><span>{{completed.length}} / {{workout?.exercises.length||0}} concluídos</span></div>
<div class="brazil-list"><button v-for="(e,i) in (workout?.exercises||[])" :key="e" class="brazil-list-row" @click="choose(e)"><span class="row-icon" :class="completed.includes(e)?'mint-icon':i%2?'purple-icon':'pink-icon'"><AppIcon :name="completed.includes(e)?'check':'dumbbell'"/></span><span class="row-info"><strong>{{e}}</strong><small>{{(sets[e]||[]).length}} séries · Recorde {{maxFor(e)}} kg</small></span><span class="row-arrow">›</span></button></div></template>
<button class="brazil-complete" @click="finish"><AppIcon name="check" :size="17"/> Concluir treino</button></template>
<template v-else-if="view==='exercise'">
<button class="back" @click="view='session'">← Voltar aos exercícios</button>
<div class="session-timer compact"><span><AppIcon name="timer" :size="17"/> TEMPO DE TREINO</span><strong>{{time}}</strong></div>
<div class="brazil-banner workouts-banner"><div><span class="kicker"><AppIcon name="dumbbell" :size="17"/> BORA PRA CIMA</span><h2>{{exercise}}</h2><p>Capricha nessa série!</p></div><img class="banner-dog" src="/caramelo-treino.svg" alt="" aria-hidden="true"/></div>
<div class="brazil-stats"><div class="stat-tile yellow-tile"><span><AppIcon name="trophy" :size="17"/> SEU RECORDE</span><strong>{{maxFor(exercise)}}<small> kg</small></strong></div><div class="stat-tile mint-tile"><span>↗ ÚLTIMA CARGA</span><strong>{{lastFor(exercise)}}<small> kg</small></strong></div></div>
<div class="brazil-row-title"><h3>Séries de hoje</h3><span>{{(sets[exercise]||[]).length}} registradas</span></div>
<div class="brazil-list"><div class="brazil-list-row" v-for="(s,i) in (sets[exercise]||[])" :key="i"><span class="row-icon mint-icon"><AppIcon name="check" :size="17"/></span><span class="row-info"><strong>{{i+1}}ª série</strong><small>{{s.kg}} kg × {{s.reps}} repetições</small></span><button class="remove-set" :aria-label="'Excluir série '+(i+1)" @click="sets[exercise].splice(i,1)">✕</button></div></div>
<div class="brazil-form"><div class="two-fields"><div><label class="brazil-label">Peso (kg)</label><input type="number" min="0" v-model="kg" inputmode="decimal"/></div><div><label class="brazil-label">Repetições</label><input type="number" min="1" v-model="reps" inputmode="numeric"/></div></div><button class="brazil-primary" @click="addSet"><AppIcon name="plus" :size="17"/> Adicionar série</button></div>
<button class="brazil-outline" @click="completed.includes(exercise)?null:completed.push(exercise);view='session'"><AppIcon name="check" :size="17"/> Concluir exercício</button></template>
<template v-else-if="view==='done'"><div class="brazil-celebrate"><span v-if="kind==='cardio'" class="cardio-finished-type">{{activeCardioModality}}</span><span class="trophy"><AppIcon name="trophy" :size="42"/></span><h2>Mandou muito,<br/>mulher!</h2><p>A CaraMary tá orgulhosa de você!</p><img src="/caramelo-treino.svg" alt="Mary, a caramela CaraMary, comemorando"/><strong>{{time}}</strong><small v-if="kind==='forca'">{{Object.values(sets).reduce((sum,s)=>sum+s.length,0)}} séries registradas · {{sequenceAdvanced?'Próximo: '+(nextWorkoutName||'nenhum'):'Registro salvo, sequência mantida'}}</small><small v-else>Cardio registrado sem mudar sua sequência de musculação.</small></div><button class="brazil-primary" @click="view='home'">Voltar ao início ↗</button></template>
<template v-else-if="view==='profile'"><div class="brazil-banner pink-banner"><div><span class="kicker"><AppIcon name="flower" :size="17"/> MINHA ÁREA</span><h2>Meu perfil</h2><p>Seu espaço, suas escolhas. <AppIcon name="heart" :size="17"/></p></div><img class="banner-dog" src="/caramelo-treino.svg" alt="" aria-hidden="true"/></div><div class="profile-card"><span class="profile-avatar"><AppIcon name="user" :size="34"/></span><div><strong>{{profile.nickname||'Mulher poderosa!'}}</strong><small>Pega Peso, Mulher! <AppIcon name="heart" :size="17"/></small></div></div><div class="brazil-form"><label class="brazil-label">Como quer ser chamada?</label><input v-model="profile.nickname" maxlength="40" placeholder="Seu apelido"/><label class="brazil-label">Seu objetivo</label><select v-model="profile.goal"><option>Ganhar força e massa muscular</option><option>Mais condicionamento</option><option>Manter a rotina</option><option>Saúde e bem-estar</option></select><small>As alterações ficam salvas neste navegador.</small></div><div class="brazil-list"><button class="brazil-list-row" @click="view='routine'"><span class="row-icon yellow-icon"><AppIcon name="calendar" :size="17"/></span><span class="row-info"><strong>Minha rotina</strong><small>Editar dias e treinos</small></span><span class="row-arrow">›</span></button><button class="brazil-list-row" @click="view='stats'"><span class="row-icon mint-icon"><AppIcon name="chart" :size="17"/></span><span class="row-info"><strong>Minha evolução</strong><small>Acompanhar os registros</small></span><span class="row-arrow">›</span></button></div><p class="privacy-note"><AppIcon name="lock" :size="17"/> Nesta versão, não há conta online. Os dados ficam somente neste dispositivo.</p></template>
</main><div v-if="cardioModal" class="modal-backdrop" @click.self="cardioModal=false">
<div class="modal-sheet cardio-modal" role="dialog" aria-modal="true" aria-labelledby="cardio-modal-title">
<div class="modal-head"><div><small>SESSÃO DE CARDIO</small><h2 id="cardio-modal-title">Qual modalidade?</h2></div><button class="close-modal" type="button" aria-label="Fechar" @click="cardioModal=false"><AppIcon name="close" :size="19"/></button></div>
<p class="muted">Escolha o tipo de cardio antes de iniciar o cronômetro.</p>
<div class="cardio-modality-options" role="radiogroup" aria-label="Modalidade de cardio">
<label v-for="modality in cardioModalities" :key="modality" class="cardio-modality-option" :class="{selected:selectedCardioModality===modality}">
<input type="radio" name="cardio-modality" :value="modality" v-model="selectedCardioModality"/>
<span>{{modality}}</span><AppIcon v-if="selectedCardioModality===modality" name="check" :size="18"/>
</label>
</div>
<button class="brazil-primary cardio-modal-start" @click="confirmCardioStart"><AppIcon name="timer" :size="18"/> Iniciar {{selectedCardioModality}}</button>
</div></div><div v-if="createModal" class="modal-backdrop" @click.self="createModal=false"><div class="modal-sheet" role="dialog" aria-modal="true" aria-label="Criar novo treino"><div class="modal-head"><div><small>NOVO TREINO</small><h2>Criar treino <AppIcon name="dumbbell" :size="17"/></h2></div><button class="close-modal" aria-label="Fechar" @click="createModal=false">✕</button></div><p class="muted">Dê um nome ao seu treino. Depois você poderá adicionar os exercícios.</p><form @submit.prevent="addWorkout"><label for="new-workout-name">Nome do treino</label><input id="new-workout-name" v-model="newWorkout" placeholder="Ex.: Glúteos e posterior" maxlength="60" autofocus/><p v-if="createError" class="field-error">{{createError}}</p><div class="modal-actions"><button type="button" class="outline" @click="createModal=false">Cancelar</button><button type="submit">Criar treino</button></div></form></div></div><nav class="bottom-nav" aria-label="Navegação principal"><button v-for="tab in [{id:'home',icon:'home',label:'Início'},{id:'list',icon:'dumbbell',label:'Treinos'},{id:'routine',icon:'calendar',label:'Rotina'},{id:'stats',icon:'chart',label:'Evolução'},{id:'cycle',icon:'flower',label:'Ciclo'}]" :key="tab.id" :class="{active:view===tab.id}" @click="view=tab.id"><AppIcon :name="tab.icon" :size="21" :strokeWidth="view===tab.id?2.6:2"/><small>{{tab.label}}</small></button></nav><footer>Protótipo local · dados salvos apenas neste navegador · sem cadastro ou sincronização</footer></div>
</template>