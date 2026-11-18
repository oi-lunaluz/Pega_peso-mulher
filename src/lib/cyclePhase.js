import {fromDateKey,dateKey} from './planner.js'
import {isActualPeriodDate,periodMonthEdited} from './periodCalendar.js'

// Approximation for a regular cycle. Not a hormonal measurement, diagnosis,
// or way to infer pregnancy/fertility or recommend contraceptive timing.
export const PHASES={
 menstrual:{
  name:'Menstrual',subtitle:'Durante a menstruação',
  description:'Nessa fase, algumas pessoas sentem cólicas, cansaço, dor de cabeça ou menor disposição. Outras treinam normalmente.',
  training:'Se houver desconforto, vale reduzir a intensidade, descansar ou adaptar o treino. Respeite o que seu corpo sinaliza.'
 },
 follicular:{
  name:'Folicular',subtitle:'Depois da menstruação',
  description:'Com o avanço da fase folicular, algumas pessoas percebem mais disposição ou ânimo. Isso não acontece da mesma forma para todas.',
  training:'Você pode manter seus treinos habituais e ajustar a carga conforme sua energia, sem precisar forçar um desempenho maior.'
 },
 ovulatory:{
  name:'Ovulatória',subtitle:'Período estimado próximo à ovulação',
  description:'Algumas pessoas notam mudanças na disposição, no muco cervical ou leve desconforto abdominal. O dia da ovulação pode variar bastante.',
  training:'Treine conforme sua disposição. A previsão da fase não determina força, capacidade física nem dias férteis com segurança.'
 },
 luteal:{
  name:'Lútea',subtitle:'Antes da próxima menstruação',
  description:'Algumas pessoas sentem inchaço, sensibilidade nas mamas, alterações de humor, sono ou energia, especialmente perto da menstruação.',
  training:'Se os sintomas estiverem atrapalhando, diminua o ritmo ou priorize recuperação. Não é necessário mudar o treino só por causa da fase.'
 }
}

export function estimatedCyclePhase(cycle,now=new Date()){
 if(!cycle?.enabled)return null
 const start=fromDateKey(cycle.start)
 const length=Number(cycle.length),period=Number(cycle.period)
 if(!start||!Number.isInteger(length)||length<15||length>60||
    !Number.isInteger(period)||period<1||period>15||period>=length)return null
 const reference=new Date(now.getFullYear(),now.getMonth(),now.getDate())
 const startLocal=new Date(start.getFullYear(),start.getMonth(),start.getDate())
 const elapsed=Math.round((Date.UTC(reference.getFullYear(),reference.getMonth(),reference.getDate())-
   Date.UTC(startLocal.getFullYear(),startLocal.getMonth(),startLocal.getDate()))/86400000)
 if(elapsed<0)return null
 const day=(elapsed%length)+1
 const approxOvulation=length-14
 // Real calendar entries override an average-length menstrual estimate.
 const date=dateKey(reference)
 const actual=isActualPeriodDate(cycle,date)
 const edited=periodMonthEdited(cycle,date)
 const menstrual=actual||(!edited&&day<=period)
 const phase=menstrual?'menstrual':
   Math.abs(day-approxOvulation)<=2?'ovulatory':
   day<approxOvulation?'follicular':'luteal'
 return {key:phase,day,length,...PHASES[phase]}
}
