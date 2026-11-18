import {dateKey,fromBrazilDate,fromDateKey} from './planner.js'
import {weekBounds} from './weeklyCards.js'
import {weekProgress,weeklyStreak} from './weeklyJourney.js'
export function achievementSummary(state,cycle,now=new Date()){
 const history=Array.isArray(state?.history)?state.history:[]
 const strength=history.filter(h=>h.kind==='forca'&&fromBrazilDate(h.date))
 const start=new Date(weekBounds(now).monday)
 const weekKeys=[]
 for(let i=155;i>=0;i--){
  const d=new Date(start);d.setDate(d.getDate()-i*7)
  if(weekProgress(state,d).complete)weekKeys.push(dateKey(d))
 }
 const closed=weekKeys.length,completed=new Set(weekKeys)
 let bestStreak=0,run=0
 for(let i=155;i>=0;i--){
  const d=new Date(start);d.setDate(d.getDate()-i*7)
  run=completed.has(dateKey(d))?run+1:0
  bestStreak=Math.max(bestStreak,run)
 }
 const sets=[]
 for(const h of strength){
  const d=dateKey(fromBrazilDate(h.date))
  for(const [name,entries] of Object.entries(h.sets||{}))
   for(const entry of entries||[]){
    const kg=Number(entry.kg)
    if(name&&Number.isFinite(kg)&&kg>0)sets.push({name,kg,date:d})
   }
 }
 const maxWeight=Math.max(0,...sets.map(s=>s.kg))
 const hit=threshold=>sets.find(s=>s.kg>=threshold)
 const cardioWeek=new Map()
 for(const h of history.filter(h=>h.kind==='cardio')){
  const date=fromBrazilDate(h.date);if(!date)continue
  const start=weekBounds(date).start
  cardioWeek.set(start,(cardioWeek.get(start)||0)+Math.max(0,Number(h.seconds)||0))
 }
 const bestCardioMinutes=Math.floor(Math.max(0,...cardioWeek.values())/60)
 const noted=new Set((cycle?.enabled?cycle?.notes||[]:[]).filter(n=>n.energy==='baixa'||n.difficulty==='pesada').map(n=>{
  const d=fromDateKey(n.date)||fromBrazilDate(n.date)
  return d?dateKey(d):''
 }).filter(Boolean))
 let superacao=null
 const earlier=new Map()
 for(const s of [...sets].sort((a,b)=>a.date.localeCompare(b.date))){
  const best=earlier.get(s.name)||0
  if(best>0&&s.kg>best&&noted.has(s.date)&&!superacao)superacao=s
  earlier.set(s.name,Math.max(best,s.kg))
 }
 const make=(id,icon,title,description,current,target,detail)=>{
  return {id,icon,title,description,current,target,unlocked:current>=target,detail}
 }
 const first50=hit(50),first100=hit(100)
 const items=[
  make('first','dumbbell','Primeiro passo','Registre seu primeiro treino de força.',strength.length,1,'Cada começo conta.'),
  make('week','check','Semana 100%','Feche todos os treinos de uma semana.',closed,1,'Semana completa!'),
  make('week4','calendarCheck','Quatro semanas','Feche quatro semanas no total.',closed,4,'Sua constância está crescendo.'),
  make('week12','medal','Constância de ouro','Feche doze semanas no total.',closed,12,'Mais semanas, mais conquistas.'),
  make('streak2','flame','Fogo aceso','Complete duas semanas consecutivas.',bestStreak,2,'Melhor sequência: '+bestStreak+' semanas.'),
  make('streak4','flame','Imparável','Complete quatro semanas consecutivas.',bestStreak,4,'Melhor sequência: '+bestStreak+' semanas.'),
  make('50kg','trophy','Força de 50 kg','Registre 50 kg em um exercício.',maxWeight,50,first50?first50.name+' · '+first50.kg+' kg':'Seu maior peso: '+maxWeight+' kg'),
  make('100kg','trophy','Marca dos 100 kg','Registre 100 kg em um exercício.',maxWeight,100,first100?first100.name+' · '+first100.kg+' kg':'Seu maior peso: '+maxWeight+' kg'),
  make('cardio150','timer','Cardio em dia','Faça 150 minutos de cardio na mesma semana.',bestCardioMinutes,150,'Melhor semana: '+bestCardioMinutes+' minutos.'),
  make('cycle-pr','flower','Superação pessoal','Bata seu recorde de carga num dia em que registrou energia baixa ou treino pesado.',superacao?1:0,1,superacao?superacao.name+' · '+superacao.kg+' kg':'Registre seus sintomas na aba Ciclo e seus pesos nos treinos.')
 ]
 return {items,unlocked:items.filter(x=>x.unlocked).length,total:items.length,closed,bestStreak,streak:weeklyStreak(state,now),maxWeight}
}
