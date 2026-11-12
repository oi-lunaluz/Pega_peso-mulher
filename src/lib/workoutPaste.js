/**
 * Leitor offline de fichas copiadas de WhatsApp / bloco de notas.
 * Não inventa conteúdo nem decide dias quando o texto não os especifica.
 * Os resultados precisam ser conferidos e confirmados na interface.
 */
const WEEKDAYS=[
  {day:1,re:/^segunda(?:-feira)?\b/i},
  {day:2,re:/^ter[cç]a(?:-feira)?\b/i},
  {day:3,re:/^quarta(?:-feira)?\b/i},
  {day:4,re:/^quinta(?:-feira)?\b/i},
  {day:5,re:/^sexta(?:-feira)?\b/i},
  {day:6,re:/^s[aá]bado\b/i},
  {day:0,re:/^domingo\b/i}
]
const normalize=line=>line.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()
const isNoise=s=>/^(?:observa[cç][aã]o|obs\.?|descanso|aquecimento geral|alongamento|dica|aten[cç][aã]o|intervalo|nota):/i.test(s)
const resemblesPrescription=s=>/^(?:(?:\d+\s*[x×]\s*\d+)|(?:\d+\s*(?:s[eé]ries?|reps?|repeti[cç][oõ]es|kg)))(?:\s|$)/i.test(s)
const removePrefix=s=>s.replace(/^(?:[-•*▪▫◦☐✅✔️]\s*|\d{1,2}[.)]\s+)/u,'').trim()
const cleanExercise=s=>{
  let x=removePrefix(s).replace(/\s+/g,' ').trim()
  if(!x||x.length>130)return null
  // Numeric prescription follows the exercise; the exercise name is retained.
  x=x.replace(/\s+(?:[-–—:|]\s*)?(?:\d+\s*[x×]\s*\d+(?:\s*[-–]\s*\d+)?|\d+\s*(?:s[eé]ries?|reps?|repeti[cç][oõ]es|kg)\b).*$/i,'').trim()
  x=x.replace(/[;,.:\-–—]\s*$/,'').trim()
  if(x.length<3||resemblesPrescription(x)||isNoise(x))return null
  if(/^(?:treino|ficha|dia|exerc[ií]cios?|s[eé]rie|s[eé]ries|superset|bi[- ]?set|tri[- ]?set|total|tempo|pausa|descanso|cardio|repeti[cç][oõ]es|aquecimento)$/i.test(x))return null
  if(/^\d+(?:\s*[-x×]\s*\d+)*$/.test(x))return null
  return x.slice(0,120)
}
function matchDay(line){
  for(const d of WEEKDAYS){
    const m=line.match(d.re)
    if(m&&/^\s*(?:[:\-–—|]\s*|\(\s*)/.test(line.slice(m[0].length))||m&&line.trim().length===m[0].length){
      const name=line.slice(m[0].length).replace(/^\s*[:\-–—|(\s]+\s*/,'').replace(/[)]$/,'').trim()
      return {day:d.day,name}
    }
  }
  return null
}
function heading(line){
  const day=matchDay(line)
  if(day)return {day:day.day,name:day.name||'',explicit:true}
  const named=line.match(/^(?:treino|ficha)\s+([a-z0-9][\w\sÀ-ÿ()\-]{0,48}?)(?:\s*[:\-–—]\s*(.*))?$/i)
  if(named){
    const code=named[1].trim()
    const desc=(named[2]||'').trim()
    if(code.length<=32)return {day:null,name:'Treino '+code+(desc?' - '+desc:''),explicit:true}
  }
  return null
}
export function parsePastedWorkout(text){
  const source=String(text||'').trim().slice(0,20000)
  if(!source)return {sections:[],warnings:[]}
  const lines=source.replace(/\r/g,'').split('\n')
  const sections=[]
  const warnings=[]
  let current=null
  function open(h){
    current={id:sections.length,day:h.day,name:h.name,exercises:[],explicit:h.explicit}
    sections.push(current)
  }
  for(let index=0;index<lines.length;index++){
    const raw=lines[index].trim().replace(/^\*+|\*+$/g,'').trim()
    if(!raw)continue
    const h=heading(raw)
    if(h){
      if(current&&!current.exercises.length){
        // A common personal template uses "Segunda" followed by "Treino A"
        // on the next line. Those are labels of the SAME training session.
        if(current.day!==null&&h.day===null){
          current.name=h.name||current.name
          continue
        }
        if(current.day===null&&h.day!==null){
          current.day=h.day
          if(h.name)current.name=h.name
          continue
        }
      }
      open(h)
      continue
    }
    if(!current){open({day:null,name:'',explicit:false})}
    if(/^(?:cardio|esteira|bicicleta|bike)\s*[:\-]\s*\d+\s*(?:min|m\b|minutes|minutos)/i.test(raw)){
      warnings.push('Cardio em texto livre não foi somado automaticamente à meta semanal.')
      continue
    }
    if(/^\s*(?:observa[cç][aã]o|obs\.?|nota|pausa|descanso|intervalo)\s*:/i.test(raw))continue
    if(resemblesPrescription(raw))continue
    // Ignore non-exercise prose rather than accidentally register it as a movement.
    if(/^(?:fa[cç]a|realize|execute|repetir|come[cç]ar|finalizar|bom treino|instru[cç][oõ]es)\b/i.test(normalize(raw)))continue
    const exercise=cleanExercise(raw)
    if(exercise&&!current.exercises.some(e=>normalize(e)===normalize(exercise))){
      current.exercises.push(exercise)
    }
  }
  // A plain list with no headings can still be assigned manually.
  const cleaned=sections.filter(s=>s.exercises.length||s.explicit)
  if(!cleaned.length)return {sections:[],warnings:['Não encontrei uma ficha reconhecível. Revise os títulos e exercícios.']}
  if(cleaned.some(s=>s.day==null))warnings.push('Confira os dias das fichas sem dia explícito antes de aplicar.')
  if(cleaned.some(s=>!s.exercises.length))warnings.push('Algumas fichas não têm exercícios identificados.')
  return {sections:cleaned,warnings:[...new Set(warnings)]}
}
