import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { SHORT_DAYS, cleanDays, dateKey, pendingBefore, pendingIncludingToday, createWeekPlan, cardioMinutesThisWeek, previewAfterDay, LONG_DAYS, fromDateKey } from '../lib/planner.js'
import { readJson, writeJson, normalizeTrainingState } from '../lib/storage.js'
import { clockLabel, validSet, totalSetVolume, maximumWeight, lastWeight } from '../lib/trainingMath.js'

/** 
 * Estado e ações da aplicação.
 * Mantém os dados anteriores (localStorage) e centraliza as regras do MVP.
 * A matemática do calendário vive em lib/planner.js e tem testes de regressão.
 */
export function useAppState() {
  const key='pega-peso-mulher-mvp-v1'
  const initial={routine:[{name:'Descanso',cardio:0},{name:'Quadríceps',cardio:30},{name:'Superiores A',cardio:30},{name:'Descanso',cardio:0},{name:'Posterior e glúteos',cardio:30},{name:'Superiores B',cardio:30},{name:'Cardio',cardio:30}],workouts:[{name:'Quadríceps',exercises:['Agachamento livre','Leg press','Cadeira extensora']},{name:'Superiores A',exercises:['Puxada alta','Remada baixa']},{name:'Posterior e glúteos',exercises:['Stiff','Mesa flexora','Elevação pélvica']},{name:'Superiores B',exercises:['Supino máquina','Elevação lateral']}],history:[]}
  const state=ref(normalizeTrainingState(readJson(key,initial),initial))
  watch(state,v=>writeJson(key,v),{deep:true})
  // Migração: preserva fichas, histórico e preferências anteriores sem manter dias fixos.
  const workoutNames=()=>state.value.workouts.map(w=>w.name)
  if(!Array.isArray(state.value.rotation)){
    const existing=new Set(workoutNames())
    const legacyOrder=[1,2,3,4,5,6,0].map(i=>state.value.routine?.[i]?.name)
      .filter(n=>existing.has(n))
    state.value.rotation=[...new Set([...legacyOrder,...workoutNames()])]
    const last=[...state.value.history].reverse().find(h=>h.kind==='forca'&&state.value.rotation.includes(h.name))
    state.value.rotationIndex=last?(state.value.rotation.indexOf(last.name)+1)%state.value.rotation.length:0
  }
  if(!Number.isInteger(state.value.rotationIndex))state.value.rotationIndex=0
  if(!Number.isFinite(state.value.cardioGoal))state.value.cardioGoal=150
  if(!Number.isFinite(state.value.cardioSessionTarget))state.value.cardioSessionTarget=30
  
  // A agenda mostra dias fixos; a sequência das fichas só avança ao concluir.
  const weekNames=SHORT_DAYS
  const calendarNow=ref(new Date())
  let calendarRefresh=null
  onMounted(()=>{calendarRefresh=setInterval(()=>{calendarNow.value=new Date()},60_000)})
  onUnmounted(()=>{
    if(calendarRefresh)clearInterval(calendarRefresh)
    if(ticker)clearInterval(ticker)
  })
  const dateToday=computed(()=>dateKey(calendarNow.value))
  const legacyTrainingDays=(state.value.routine||[]).flatMap((slot,day)=>
    state.value.workouts.some(w=>w.name===slot?.name)?[day]:[])
  if(!Array.isArray(state.value.scheduledDays))
    state.value.scheduledDays=legacyTrainingDays.length?legacyTrainingDays:[1,2,3,4]
  if(!state.value.scheduleAnchor)state.value.scheduleAnchor=dateToday.value
  if(!Number.isInteger(state.value.scheduleCompleted))state.value.scheduleCompleted=0
  if(!Number.isInteger(state.value.scheduleCarry))state.value.scheduleCarry=0
  const scheduledDays=computed(()=>cleanDays(state.value.scheduledDays))
  const scheduledDayNames=computed(()=>scheduledDays.value.map(i=>weekNames[i]))
  const scheduleInputs=computed(()=>({
    anchor:state.value.scheduleAnchor,
    today:dateToday.value,
    days:scheduledDays.value,
    completed:state.value.scheduleCompleted,
    carry:state.value.scheduleCarry
  }))
  const overdueWorkouts=computed(()=>pendingBefore(scheduleInputs.value))
  const dueWorkouts=computed(()=>pendingIncludingToday(scheduleInputs.value))
  function toggleTrainingDay(day){
    const oldOverdue=overdueWorkouts.value
    const next=new Set(scheduledDays.value)
    next.has(day)?next.delete(day):next.add(day)
    state.value.scheduleCarry=oldOverdue
    state.value.scheduleCompleted=0
    state.value.scheduleAnchor=dateToday.value
    state.value.scheduledDays=cleanDays([...next])
  }
  const weekPlan=computed(()=>createWeekPlan({
    ...scheduleInputs.value,
    history:state.value.history,
    rotation:rotation.value,
    nextIndex:rotationIndex.value
  }))
  // Seleção apenas visual: nunca altera o histórico ou a posição da fila.
  const selectedWeekDate=ref(dateToday.value)
  const selectedWeekDay=computed(()=>weekPlan.value.find(d=>d.date===selectedWeekDate.value))
  const selectedWeekPreview=computed(()=>previewAfterDay({
    selected:selectedWeekDate.value,
    today:dateToday.value,
    days:scheduledDays.value,
    history:state.value.history,
    rotation:rotation.value,
    nextIndex:rotationIndex.value
  }))
  const predictedDayLabel=computed(()=>{
    const date=fromDateKey(selectedWeekPreview.value?.nextDate)
    return date?LONG_DAYS[date.getDay()]:''
  })
  function selectWeekDay(date){selectedWeekDate.value=date}

  
  const view=ref('home')
  const rotation=computed(()=>state.value.rotation.filter(name=>state.value.workouts.some(w=>w.name===name)))
  const rotationIndex=computed(()=>rotation.value.length?((state.value.rotationIndex%rotation.value.length)+rotation.value.length)%rotation.value.length:0)
  const nextWorkoutName=computed(()=>rotation.value[rotationIndex.value]||'')
  const nextWorkout=computed(()=>state.value.workouts.find(w=>w.name===nextWorkoutName.value))
  const addRotationName=ref('')
  const availableForRotation=computed(()=>state.value.workouts.filter(w=>!state.value.rotation.includes(w.name)))
  function preserveNextRotation(nextNames,preferred=nextWorkoutName.value){
    state.value.rotation=nextNames
    state.value.rotationIndex=Math.max(0,nextNames.indexOf(preferred))
  }
  function moveRotation(i,direction){
    const names=[...rotation.value],j=i+direction
    if(j<0||j>=names.length)return
    ;[names[i],names[j]]=[names[j],names[i]]
    preserveNextRotation(names)
  }
  function removeRotation(i){
    const names=[...rotation.value],removed=names.splice(i,1)[0]
    preserveNextRotation(names,removed===nextWorkoutName.value?names[i%Math.max(names.length,1)]:nextWorkoutName.value)
  }
  function addRotation(){
    const name=addRotationName.value
    if(!name||state.value.rotation.includes(name)||!state.value.workouts.some(w=>w.name===name))return
    const previous=nextWorkoutName.value
    state.value.rotation=[...rotation.value,name]
    state.value.rotationIndex=previous?state.value.rotation.indexOf(previous):0
    addRotationName.value=''
  }
  function advanceRotation(completedName){
    if(rotation.value.length&&completedName===nextWorkoutName.value){
      state.value.rotationIndex=(rotationIndex.value+1)%rotation.value.length
      state.value.scheduleCompleted++
    }
  }
  
  const workoutName=ref(''),newWorkout=ref(''),newExercise=ref('')
  const createModal=ref(false),createError=ref('')
  function openCreateModal(){newWorkout.value='';createError.value='';createModal.value=true}
  const workout=computed(()=>state.value.workouts.find(w=>w.name===workoutName.value))
  function openWorkout(name){workoutName.value=name;view.value='workout'}
  function addWorkout(){const n=newWorkout.value.trim();if(!n){createError.value='Digite o nome do treino.';return}if(state.value.workouts.some(w=>w.name.toLowerCase()===n.toLowerCase())){createError.value='Você já tem um treino com esse nome.';return}const previous=nextWorkoutName.value;state.value.workouts.push({name:n,exercises:[]});state.value.rotation=[...rotation.value,n];state.value.rotationIndex=previous?state.value.rotation.indexOf(previous):0;createModal.value=false;newWorkout.value='';createError.value='';openWorkout(n)}
  function addExercise(){let n=newExercise.value.trim();if(!n||!workout.value)return;workout.value.exercises.push(n);newExercise.value=''}
  const started=ref(null),finished=ref(null),kind=ref('forca'),exercise=ref(''),kg=ref(''),reps=ref('10'),sets=ref({}),completed=ref([])
  const cardioModal=ref(false)
  const cardioModalities=['Esteira','Bike','Crosstraining','Escadas','Hyrox','Corrida']
  const selectedCardioModality=ref('Esteira')
  const activeCardioModality=ref('')
  const cardioIllustrations={
    'Esteira':'esteira','Bike':'bike','Crosstraining':'crosstraining',
    'Escadas':'escadas','Hyrox':'hyrox','Corrida':'corrida'
  }
  const activeCardioArt=computed(()=>'/mary-cardio-'+(cardioIllustrations[activeCardioModality.value]||'corrida')+'.svg')
  function openCardioModal(){cardioModal.value=true}
  function confirmCardioStart(){activeCardioModality.value=selectedCardioModality.value;cardioModal.value=false;start('cardio')}
  const clock=ref(Date.now());let ticker=null
  const sessionWorkoutName=ref('')
  const sequenceAdvanced=ref(false)
  function start(k){
    kind.value=k;sessionWorkoutName.value=k==='forca'?workoutName.value:'';sequenceAdvanced.value=false
    started.value=Date.now();clock.value=Date.now();finished.value=null
    sets.value={};completed.value=[];view.value='session'
    if(ticker)clearInterval(ticker)
    ticker=setInterval(()=>clock.value=Date.now(),1000)
  }
  const elapsed=computed(()=>started.value?Math.max(0,Math.floor(((finished.value||clock.value)-started.value)/1000)):0)
  const time=computed(()=>clockLabel(elapsed.value))
  function maxFor(e){return maximumWeight(state.value.history,e,sets.value[e]||[])}
  function lastFor(e){return lastWeight(state.value.history,e)}
  function choose(e){exercise.value=e;kg.value=String(lastFor(e)||'');reps.value='10';view.value='exercise'}
  function addSet(){
    if(!validSet(kg.value,reps.value)||!exercise.value)return
    const entry={kg:Number(kg.value),reps:Number(reps.value)}
    sets.value={...sets.value,[exercise.value]:[...(sets.value[exercise.value]||[]),entry]}
  }
  function finish(){
    if(!started.value||finished.value!==null)return
    finished.value=Date.now()
    if(ticker){clearInterval(ticker);ticker=null}
    const completedName=kind.value==='cardio'?'Cardio':sessionWorkoutName.value
    state.value.history.push({
      date:new Date().toLocaleDateString('pt-BR'),name:completedName,kind:kind.value,
      modality:kind.value==='cardio'?activeCardioModality.value:null,
      seconds:elapsed.value,sets:JSON.parse(JSON.stringify(sets.value))
    })
    if(kind.value==='forca'){sequenceAdvanced.value=completedName===nextWorkoutName.value;advanceRotation(completedName)}
    calendarNow.value=new Date()
    view.value='done'
  }
  const workoutTab=ref('fichas')
  const cardioSessions=computed(()=>state.value.history.filter(h=>h.kind==='cardio'))
  const cardioTotalMinutes=computed(()=>Math.floor(cardioSessions.value.reduce((sum,h)=>sum+(Number(h.seconds)||0),0)/60))
  const cardioLastSession=computed(()=>cardioSessions.value.length?cardioSessions.value[cardioSessions.value.length-1]:null)
  const selectedStat=ref('all')
  const selectedWorkoutStat=ref('all')
  const workoutStatNames=computed(()=>[...new Set([...state.value.workouts.map(w=>w.name),...state.value.history.map(h=>h.name)].filter(Boolean))])
  const statsSessions=computed(()=>state.value.history.filter(h=>selectedWorkoutStat.value==='all'||h.name===selectedWorkoutStat.value))
  const allExercises=computed(()=>[...new Set(statsSessions.value.flatMap(h=>Object.keys(h.sets||{})).concat(selectedWorkoutStat.value==='all'?state.value.workouts.flatMap(w=>w.exercises):(state.value.workouts.find(w=>w.name===selectedWorkoutStat.value)?.exercises||[])))])
  const exerciseStats=computed(()=>statsSessions.value.flatMap(h=>Object.entries(h.sets||{}).flatMap(([name,ss])=>ss.map(s=>({name,kg:Number(s.kg)||0,reps:Number(s.reps)||0,date:h.date})))))
  const bestExercise=computed(()=>exerciseStats.value.filter(s=>selectedStat.value==='all'||s.name===selectedStat.value))
  const maxLoad=computed(()=>Math.max(0,...bestExercise.value.map(s=>s.kg)))
  const totalVolume=computed(()=>bestExercise.value.reduce((a,s)=>a+s.kg*s.reps,0))
  const completedSessions=computed(()=>statsSessions.value.length)
  function onWorkoutStatChange(){selectedStat.value='all'}
  const cycleKey='pega-peso-mulher-cycle-v1'
  const cycle=ref({
    enabled:false,start:'',length:28,period:5,notes:[],
    ...readJson(cycleKey,{})
  })
  if(!Array.isArray(cycle.value.notes))cycle.value.notes=[]
  watch(cycle,v=>writeJson(cycleKey,v),{deep:true})
  const noteDate=ref(dateKey(new Date())),noteEnergy=ref('normal'),noteSymptoms=ref(''),noteDifficulty=ref('normal')
  const cycleDay=computed(()=>{if(!cycle.value.start)return null;const diff=Math.floor((new Date().setHours(12,0,0,0)-new Date(cycle.value.start+'T12:00:00').getTime())/86400000);return ((diff%Math.max(1,cycle.value.length))+Math.max(1,cycle.value.length))%Math.max(1,cycle.value.length)+1})
  function addNote(){cycle.value.notes.unshift({date:noteDate.value,energy:noteEnergy.value,symptoms:noteSymptoms.value,difficulty:noteDifficulty.value});noteSymptoms.value=''}
  const weeklyCardio=computed(()=>cardioMinutesThisWeek(state.value.history,calendarNow.value))
  const cycleCalendarMonth=ref(new Date().getMonth())
  const cycleCalendarYear=ref(new Date().getFullYear())
  function moveCycleMonth(delta){const d=new Date(cycleCalendarYear.value,cycleCalendarMonth.value+delta,1);cycleCalendarMonth.value=d.getMonth();cycleCalendarYear.value=d.getFullYear()}
  const dateISO=dateKey
  const calendarMonthName=computed(()=>new Date(cycleCalendarYear.value,cycleCalendarMonth.value,1).toLocaleDateString('pt-BR',{month:'long',year:'numeric'}))
  const cycleCalendarDays=computed(()=>{const first=new Date(cycleCalendarYear.value,cycleCalendarMonth.value,1);const offset=first.getDay();return Array.from({length:42},(_,i)=>{const d=new Date(first.getFullYear(),first.getMonth(),1-offset+i);let phase='';if(cycle.value.start){const n=Math.max(1,Number(cycle.value.length)||28);const diff=Math.round((new Date(dateISO(d)+'T12:00:00').getTime()-new Date(cycle.value.start+'T12:00:00').getTime())/86400000);if(diff>=0){const step=diff%n;phase=step<Number(cycle.value.period||5)?'period':Math.abs(step-(n-14))<=2?'fertile':''}}return {date:dateISO(d),number:d.getDate(),outside:d.getMonth()!==cycleCalendarMonth.value,phase,today:dateISO(d)===dateISO(new Date())}})})
  const chartWeeks=computed(()=>{const now=new Date();return Array.from({length:4},(_,i)=>{const newest=3-i;const end=new Date(now.getFullYear(),now.getMonth(),now.getDate()-newest*7,23,59,59);const start=new Date(end.getFullYear(),end.getMonth(),end.getDate()-6);const value=statsSessions.value.reduce((total,h)=>{const parts=h.date?.split('/');if(!parts||parts.length!==3)return total;const d=new Date(Number(parts[2]),Number(parts[1])-1,Number(parts[0]));return d>=start&&d<=end?total+totalSetVolume(h.sets):total},0);return {label:'S'+(i+1),value}})})
  const chartMax=computed(()=>Math.max(1,...chartWeeks.value.map(x=>x.value)))
  const profileKey='pega-peso-mulher-profile-v1'
  const profile=ref({nickname:'',goal:'Ganhar força e massa muscular',...readJson(profileKey,{})})
  watch(profile,value=>writeJson(profileKey,value),{deep:true})
  
  const strengthThisMonth=computed(()=>{const prefix=new Date().toLocaleDateString('pt-BR').slice(3);return state.value.history.filter(h=>h.kind==='forca'&&h.date?.slice(3)===prefix).length})
  const personalRecords=computed(()=>new Set(state.value.history.flatMap(h=>Object.keys(h.sets||{}).filter(e=>(h.sets[e]||[]).length>0))).size)
  const homeGreeting=computed(()=>{const hour=new Date().getHours();return hour<12?'Bom dia':hour<18?'Boa tarde':'Boa noite'})
  function openToday(){if(nextWorkout.value)openWorkout(nextWorkout.value.name);else view.value='routine'}
  return {
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
    selectedWeekDate,
    selectedWeekDay,
    selectedWeekPreview,
    predictedDayLabel,
    selectWeekDay,
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
  }
}
