<script setup>
import { computed, reactive, ref, nextTick } from 'vue'
import AppIcon from '../AppIcon.vue'
import { createOnboardingPayload, TRAINING_DAY_OPTIONS, GOAL_OPTIONS } from '../lib/onboarding.js'

const props=defineProps({
  accountName:{type:String,default:''},
  saving:{type:Boolean,default:false},
  saveError:{type:String,default:''}
})
const emit=defineEmits(['finish','logout'])
const step=ref(1)
const scrollArea=ref(null)
const validationError=ref('')
const form=reactive({
  nickname:props.accountName,
  days:[],
  workoutNames:{},
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
          <div v-if="selectedDays.length" class="onboard-workout-names">
            <strong>Que treino você costuma fazer em cada dia?</strong>
            <small>Opcional: dê um nome às fichas. Os exercícios ficarão vazios para você cadastrar depois. Dias com o mesmo nome compartilham a mesma ficha.</small>
            <div v-for="d in selectedDays" :key="d.day" class="onboard-day-name">
              <label :for="'onb-workout-'+d.day">{{d.label}}</label>
              <input :id="'onb-workout-'+d.day" v-model.trim="form.workoutNames[d.day]"
                maxlength="60" placeholder="Ex.: Inferiores, Superiores..."/>
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
            <span>{{Object.values(form.workoutNames).filter(n=>String(n).trim()).length}} nomes de treinos preenchidos</span>
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
