<script setup>
import { computed, reactive, ref, nextTick } from 'vue'
import AppIcon from '../AppIcon.vue'
import { createOnboardingPayload, TRAINING_DAY_OPTIONS, GOAL_OPTIONS } from '../lib/onboarding.js'
import { parsePastedWorkout } from '../lib/workoutPaste.js'

const props=defineProps({
  accountName:{type:String,default:''},
  saving:{type:Boolean,default:false},
  saveError:{type:String,default:''}
})
const emit=defineEmits(['finish','logout'])
const step=ref(1)
const scrollArea=ref(null)
const validationError=ref('')
const pastedText=ref('')
const parsedSections=ref([])
const pasteWarnings=ref([])
const pasteError=ref('')
const pasteSuccess=ref('')
const showPaste=ref(false)
function analysePaste(){
  pasteError.value=''
  pasteSuccess.value=''
  const result=parsePastedWorkout(pastedText.value)
  parsedSections.value=result.sections.map(sec=>({...sec,day:sec.day===null?'':String(sec.day)}))
  pasteWarnings.value=result.warnings
  if(!result.sections.length)pasteError.value='Não reconheci os treinos. Separe por dia (ex.: Segunda: Inferiores) ou por ficha (ex.: Treino A).'
}
function applyPaste(){
  pasteError.value=''
  pasteSuccess.value=''
  if(!parsedSections.value.length)return
  if(parsedSections.value.some(sec=>sec.day==='')){
    pasteError.value='Escolha o dia correspondente a cada ficha antes de aplicar.'
    return
  }
  const planned={}
  for(const sec of parsedSections.value){
    const day=Number(sec.day)
    const dayName=TRAINING_DAY_OPTIONS.find(x=>x.day===day)?.label||'Treino'
    const title=sec.name.trim().slice(0,60)||form.workoutNames[day]||'Treino de '+dayName
    if(planned[day]&&planned[day].name!==title){
      pasteError.value='Existem duas fichas diferentes para '+dayName+'. Confira os dias na prévia.'
      return
    }
    if(!planned[day])planned[day]={name:title,exercises:[]}
    for(const name of sec.exercises){
      if(!planned[day].exercises.some(x=>x.toLocaleLowerCase('pt-BR')===name.toLocaleLowerCase('pt-BR')))
        planned[day].exercises.push(name)
    }
  }
  for(const [day,data] of Object.entries(planned)){
    const number=Number(day)
    if(!form.days.includes(number))form.days=[...form.days,number]
    form.workoutNames[number]=data.name
    form.workoutExercises[number]=[...new Set([...(form.workoutExercises[number]||[]),...data.exercises])]
  }
  pasteSuccess.value=parsedSections.value.length+' '+(parsedSections.value.length===1?'ficha organizada':'fichas organizadas')+'! Confira os dias e nomes abaixo antes de continuar.'
  parsedSections.value=[]
  pastedText.value=''
  validationError.value=''
  showPaste.value=false
}

const form=reactive({
  nickname:props.accountName,
  days:[],
  workoutNames:{},
  workoutExercises:{},
  bodyWeightKg:'',
  usualLoadKg:'',
  cardioMinutes:0,
  goal:'',
  trackCycle:false,
  lastPeriod:'',
  cycleLength:28,
  periodLength:5
})
const selectedDays=computed(()=>TRAINING_DAY_OPTIONS.filter(d=>form.days.includes(d.day)))
const today=new Date()
const todayKey=[today.getFullYear(),String(today.getMonth()+1).padStart(2,'0'),String(today.getDate()).padStart(2,'0')].join('-')
function toggleDay(day){
  if(form.days.includes(day))form.days=form.days.filter(d=>d!==day)
  else form.days=[...form.days,day]
  validationError.value=''
}
async function goTo(value){
  validationError.value=''
  step.value=value
  await nextTick()
  scrollArea.value?.scrollTo({top:0,behavior:'instant'})
}
function next(){
  if(step.value===1&&!form.days.length){
    validationError.value='Escolha pelo menos um dia em que pretende treinar.'
    return
  }
  if(step.value===2&&!form.goal){
    validationError.value='Escolha seu objetivo para continuar.'
    return
  }
  if(step.value===3){
    try{emit('finish',createOnboardingPayload(form))}
    catch(error){validationError.value=error.message||'Revise os campos antes de continuar.'}
    return
  }
  goTo(step.value+1)
}
</script>

<template>
  <div class="onboard-shell">
    <header class="onboard-header">
      <span class="auth-brand"><AppIcon name="dumbbell" :size="18"/> PEGA PESO, MULHER!</span>
      <button type="button" class="onboard-exit" @click="emit('logout')">Sair</button>
    </header>
    <main ref="scrollArea" class="onboard-scroll">
      <div class="onboard-intro">
        <div>
          <span class="auth-eyebrow">CONFIGURAÇÃO INICIAL · PASSO {{step}} DE 3</span>
          <h1>{{step===1?'Vamos montar sua rotina?':step===2?'Me conta sobre suas metas!':'Seu corpo, suas escolhas'}}</h1>
          <p>{{step===1?'Tudo começa vazio: você escolhe os dias e dá nome às suas próprias fichas.':
            step===2?'Essas informações ajudam a acompanhar seu progresso, sem criar treinos fictícios.':
            'O acompanhamento menstrual é opcional e você pode alterar tudo depois.'}}</p>
        </div>
        <img src="/caramelo-treino.svg" alt="CaraMary, mascote do aplicativo" />
      </div>
      <div class="onboard-progress" aria-label="Progresso do cadastro">
        <span v-for="n in 3" :key="n" :class="{current:n<=step}"></span>
      </div>
      <form class="onboard-card" @submit.prevent="next">
        <template v-if="step===1">
          <div class="onboard-field">
            <label for="onb-name">Como prefere ser chamada?</label>
            <input id="onb-name" v-model.trim="form.nickname" type="text" maxlength="60" placeholder="Seu nome ou apelido"/>
          </div>
          <fieldset class="onboard-fieldset">
            <legend>Quais dias você pretende treinar?</legend>
            <small>Selecione os dias. Você poderá mudar depois sem perder a sequência.</small>
            <div class="onboard-days">
              <button v-for="d in TRAINING_DAY_OPTIONS" :key="d.day" type="button"
                :class="{selected:form.days.includes(d.day)}"
                :aria-pressed="form.days.includes(d.day)" @click="toggleDay(d.day)">
                {{d.label.substring(0,3)}}
              </button>
            </div>
          </fieldset>
          <section class="onboard-paste">
            <div class="onboard-paste-heading">
              <div>
                <strong><AppIcon name="clipboard" :size="17"/> Colar treino do personal</strong>
                <small>Recebeu pelo WhatsApp ou bloco de notas? Cole tudo e organize rapidinho.</small>
              </div>
              <button type="button" class="onboard-paste-toggle" @click="showPaste=!showPaste">
                {{showPaste?'Fechar':'Copiar e colar'}}
              </button>
            </div>
            <template v-if="showPaste">
              <label for="onb-paste-text">Cole seu treino aqui</label>
              <textarea id="onb-paste-text" v-model="pastedText" rows="8"
                placeholder="Segunda - Inferiores&#10;Agachamento 4x12&#10;Leg press 3x10&#10;&#10;Terça - Superiores&#10;Puxada alta 3x12&#10;Remada baixa 3x10"
                maxlength="20000"></textarea>
              <button type="button" class="onboard-paste-analyze" :disabled="!pastedText.trim()" @click="analysePaste">
                <AppIcon name="search" :size="16"/> Analisar e separar os treinos
              </button>
              <p class="onboard-hint">A análise funciona no próprio navegador. Ela importa nomes de exercícios; séries, repetições e cargas do texto devem ser conferidas e registradas durante o treino.</p>
              <div v-if="parsedSections.length" class="onboard-paste-preview">
                <strong>Prévia — confira antes de importar</strong>
                <p>Escolha o dia de cada ficha, corrija os nomes e só então confirme. Dias que ainda não marcou serão adicionados à sua semana.</p>
                <div v-for="sec in parsedSections" :key="sec.id" class="onboard-paste-card">
                  <div class="onboard-paste-fields">
                    <div class="onboard-field">
                      <label :for="'onb-parsed-day-'+sec.id">Dia da semana</label>
                      <select :id="'onb-parsed-day-'+sec.id" v-model="sec.day">
                        <option value="">Escolher dia</option>
                        <option v-for="d in TRAINING_DAY_OPTIONS" :key="d.day" :value="String(d.day)">{{d.label}}</option>
                      </select>
                    </div>
                    <div class="onboard-field">
                      <label :for="'onb-parsed-title-'+sec.id">Nome da ficha</label>
                      <input :id="'onb-parsed-title-'+sec.id" v-model="sec.name" maxlength="60" placeholder="Ex.: Treino A, Inferiores"/>
                    </div>
                  </div>
                  <ul v-if="sec.exercises.length">
                    <li v-for="(exercise,i) in sec.exercises" :key="i">{{exercise}}</li>
                  </ul>
                  <small v-else>Nenhum exercício identificado nesta ficha; você poderá adicionar depois.</small>
                </div>
                <p v-for="(warning,index) in pasteWarnings" :key="index" class="onboard-paste-warning">{{warning}}</p>
                <button type="button" class="onboard-paste-apply" @click="applyPaste">
                  <AppIcon name="check" :size="16"/> Confirmar e preencher meus dias
                </button>
              </div>
            </template>
            <p v-if="pasteError" class="auth-error" role="alert">{{pasteError}}</p>
            <p v-if="pasteSuccess" class="onboard-paste-success" role="status">{{pasteSuccess}}</p>
          </section>
          <div v-if="selectedDays.length" class="onboard-workout-names">
            <strong>Que treino você costuma fazer em cada dia?</strong>
            <small>Digite manualmente ou use o campo de colar acima. Dias com o mesmo nome compartilham a ficha.</small>
            <div v-for="d in selectedDays" :key="d.day" class="onboard-day-name">
              <label :for="'onb-workout-'+d.day">{{d.label}}</label>
              <input :id="'onb-workout-'+d.day" v-model.trim="form.workoutNames[d.day]"
                maxlength="60" placeholder="Ex.: Inferiores, Superiores..."/>
              <small v-if="form.workoutExercises[d.day]?.length">{{form.workoutExercises[d.day].length}} exercícios importados para este dia</small>
            </div>
          </div>
        </template>

        <template v-else-if="step===2">
          <fieldset class="onboard-fieldset">
            <legend>Qual é seu objetivo principal?</legend>
            <div class="onboard-goals">
              <label v-for="goal in GOAL_OPTIONS" :key="goal" :class="{selected:form.goal===goal}">
                <input type="radio" name="onb-goal" :value="goal" v-model="form.goal"/>
                <span>{{goal}}</span>
                <AppIcon v-if="form.goal===goal" name="check" :size="17"/>
              </label>
            </div>
          </fieldset>
          <div class="onboard-two">
            <div class="onboard-field">
              <label for="onb-body">Seu peso atual (kg)</label>
              <input id="onb-body" v-model="form.bodyWeightKg" type="number" inputmode="decimal"
                step="0.1" min="0.1" max="650" placeholder="Opcional"/>
            </div>
            <div class="onboard-field">
              <label for="onb-load">Carga que costuma usar (kg)</label>
              <input id="onb-load" v-model="form.usualLoadKg" type="number" inputmode="decimal"
                step="0.5" min="0" max="1000" placeholder="Opcional"/>
            </div>
          </div>
          <p class="onboard-hint">A carga é apenas uma referência inicial. Cada exercício terá suas próprias séries e pesos quando você começar a registrar.</p>
          <div class="onboard-field">
            <label for="onb-cardio">Quantos minutos de cardio pretende fazer por semana, no total?</label>
            <input id="onb-cardio" v-model.number="form.cardioMinutes" type="number"
              min="0" max="10080" step="1" inputmode="numeric" required/>
            <small>Some o cardio de todos os dias. Se não pretende fazer, coloque 0.</small>
          </div>
        </template>

        <template v-else>
          <fieldset class="onboard-fieldset">
            <legend>Deseja acompanhar seu ciclo menstrual?</legend>
            <small>Você pode deixar desativado. Esses dados são pessoais e seu uso é opcional.</small>
            <div class="onboard-cycle-toggle">
              <label :class="{selected:form.trackCycle===true}">
                <input type="radio" name="onb-cycle" :value="true" v-model="form.trackCycle"/>
                Sim, quero acompanhar
              </label>
              <label :class="{selected:form.trackCycle===false}">
                <input type="radio" name="onb-cycle" :value="false" v-model="form.trackCycle"/>
                Não, por enquanto
              </label>
            </div>
          </fieldset>
          <template v-if="form.trackCycle">
            <div class="onboard-field">
              <label for="onb-last">Quando começou sua última menstruação?</label>
              <input id="onb-last" v-model="form.lastPeriod" type="date" :max="todayKey"/>
              <small>Opcional. Você pode preencher depois.</small>
            </div>
            <div class="onboard-two">
              <div class="onboard-field">
                <label for="onb-length">Duração média do ciclo (dias)</label>
                <input id="onb-length" v-model.number="form.cycleLength" type="number" min="15" max="60"/>
              </div>
              <div class="onboard-field">
                <label for="onb-period">Duração da menstruação (dias)</label>
                <input id="onb-period" v-model.number="form.periodLength" type="number" min="1" max="15"/>
              </div>
            </div>
            <p class="onboard-hint">As fases exibidas pelo aplicativo são estimativas, não servem para contracepção ou diagnóstico.</p>
          </template>
          <div class="onboard-recap">
            <strong>Seu começo está preparado!</strong>
            <span>{{form.days.length}} {{form.days.length===1?'dia':'dias'}} de treino por semana</span>
            <span>{{Object.values(form.workoutNames).filter(n=>String(n).trim()).length}} dias com nomes de treino</span>
            <span>{{Object.values(form.workoutExercises).reduce((sum,items)=>sum+(items?.length||0),0)}} exercícios importados do texto</span>
            <span>{{form.cardioMinutes||0}} minutos de cardio planejados por semana</span>
            <span>Nenhuma série ou treino registrado ainda</span>
          </div>
        </template>
        <p v-if="validationError||saveError" class="auth-error" role="alert">{{validationError||saveError}}</p>
        <div class="onboard-actions">
          <button v-if="step>1" type="button" class="onboard-back" :disabled="saving" @click="goTo(step-1)">Voltar</button>
          <button type="submit" class="auth-submit" :disabled="saving">
            {{saving?'Salvando na nuvem...':step===3?'Concluir e começar':'Continuar'}}
            <AppIcon v-if="!saving" name="arrow" :size="17"/>
          </button>
        </div>
      </form>
      <p class="onboard-bottom">Você poderá editar tudo depois. Nenhum treino é marcado como realizado automaticamente.</p>
    </main>
  </div>
</template>
