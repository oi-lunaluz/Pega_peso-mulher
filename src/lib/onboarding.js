import { dateKey, cleanDays } from './planner.js'

export const TRAINING_DAY_OPTIONS=[
  {day:1,label:'Segunda'}, {day:2,label:'Terça'}, {day:3,label:'Quarta'},
  {day:4,label:'Quinta'}, {day:5,label:'Sexta'}, {day:6,label:'Sábado'}, {day:0,label:'Domingo'}
]
export const GOAL_OPTIONS=[
  'Ganhar massa muscular','Emagrecer','Manter o peso',
  'Ganhar força','Melhorar condicionamento','Saúde e bem-estar'
]

export function emptyTrainingState(now=new Date()){
  return {
    routine:Array.from({length:7},()=>({name:'Descanso',cardio:0})),
    workouts:[],rotation:[],rotationIndex:0,history:[],
    scheduledDays:[],scheduleAnchor:dateKey(now),
    scheduleCompleted:0,scheduleCarry:0,
    cardioGoal:0,cardioSessionTarget:0
  }
}

export function isUnconfiguredSnapshot(payload){
  if(!payload||payload.onboardingCompleted===true)return false
  const state=payload.state
  if(!state)return true
  // Never replace personal or health records when only training fichas are absent.
  if(payload.cycle?.enabled||payload.cycle?.start||(payload.cycle?.notes||[]).length)return false
  if(payload.profile?.goal&&payload.profile.goal!=='Ganhar força e massa muscular')return false
  if(payload.profile?.bodyWeightKg!=null||payload.profile?.usualLoadKg!=null)return false
  if(state.cardioGoal!=null&&state.cardioGoal!==150)return false
  const planned=Array.isArray(state.scheduledDays)?[...state.scheduledDays].sort((a,b)=>a-b).join(','):''
  if(planned&&!['1,2,3,4','2,3,5,6'].includes(planned))return false
  if((state.history||[]).length>0)return false
  if(!Array.isArray(state.workouts)||state.workouts.length===0)return true
  // Early app releases automatically created these four example workouts.
  // Only detect the exact examples; never erase customized or recorded workouts.
  const examples=[
    ['Quadríceps',['Agachamento livre','Leg press','Cadeira extensora']],
    ['Superiores A',['Puxada alta','Remada baixa']],
    ['Posterior e glúteos',['Stiff','Mesa flexora','Elevação pélvica']],
    ['Superiores B',['Supino máquina','Elevação lateral']]
  ]
  return state.workouts.length===examples.length&&state.workouts.every((w,index)=>
    w.name===examples[index][0]&&JSON.stringify(w.exercises)===JSON.stringify(examples[index][1])
  )
}

export function createOnboardingPayload(values,now=new Date()){
  const chosen=cleanDays(values.days)
  const selected=TRAINING_DAY_OPTIONS.map(option=>option.day).filter(day=>chosen.includes(day))
  if(!selected.length)throw new Error('Escolha pelo menos um dia de treino.')
  const goal=String(values.goal||'').trim()
  if(!GOAL_OPTIONS.includes(goal))throw new Error('Escolha seu objetivo.')
  const cardio=Number(values.cardioMinutes)
  if(!Number.isInteger(cardio)||cardio<0||cardio>10080)
    throw new Error('Informe uma meta semanal de cardio entre 0 e 10.080 minutos.')
  const sessionTarget=cardio?Math.max(1,Math.round(cardio/selected.length)):0
  const kg=values.bodyWeightKg===''?null:Number(values.bodyWeightKg)
  const usual=values.usualLoadKg===''?null:Number(values.usualLoadKg)
  if(kg!==null&&(!Number.isFinite(kg)||kg<=0||kg>650))
    throw new Error('Confira seu peso corporal em kg.')
  if(usual!==null&&(!Number.isFinite(usual)||usual<0||usual>1000))
    throw new Error('Confira a carga habitual em kg.')
  const cycleEnabled=values.trackCycle===true
  const last=String(values.lastPeriod||'')
  if(cycleEnabled&&last&&(!/^\d{4}-\d{2}-\d{2}$/.test(last)||last>dateKey(now)))
    throw new Error('A data da última menstruação não pode estar no futuro.')
  const length=Number(values.cycleLength)||28
  const period=Number(values.periodLength)||5
  if(cycleEnabled&&(length<15||length>60||period<1||period>15))
    throw new Error('Confira a duração informada para o ciclo.')
  const rawNames=selected.map(day=>String(values.workoutNames?.[day]||'').trim().slice(0,60))
  const unique=[...new Set(rawNames.filter(Boolean))]
  const workouts=unique.map(name=>({name,exercises:[]}))
  const routine=Array.from({length:7},()=>({name:'Descanso',cardio:0}))
  for(let i=0;i<selected.length;i++){
    routine[selected[i]]={name:rawNames[i]||'A definir',cardio:0}
  }
  return {
    onboardingCompleted:true,
    state:{
      ...emptyTrainingState(now),
      routine,workouts,rotation:unique,scheduledDays:selected,
      cardioGoal:cardio,cardioSessionTarget:sessionTarget
    },
    profile:{
      nickname:String(values.nickname||'').trim().slice(0,60),
      goal,bodyWeightKg:kg,usualLoadKg:usual
    },
    cycle:{
      enabled:cycleEnabled,start:cycleEnabled?last:'',
      length:cycleEnabled?length:28,period:cycleEnabled?period:5,notes:[]
    }
  }
}
