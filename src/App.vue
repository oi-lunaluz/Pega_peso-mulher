<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import AuthScreen from './screens/AuthScreen.vue'
import AppWorkspace from './AppWorkspace.vue'
import OnboardingScreen from './screens/OnboardingScreen.vue'
import { supabase } from './lib/supabase.js'
import { loadCloudSnapshot, saveCloudSnapshot, legacyDataForEmail, unscopedLegacyData } from './lib/cloudData.js'
import { isUnconfiguredSnapshot } from './lib/onboarding.js'

const account=ref(null)
const cloud=ref(null)
const revision=ref(0)
const candidate=ref(null)
const onboarding=ref(null)
const firstSetupFinished=ref(false)
const savingOnboarding=ref(false)
const onboardingError=ref('')
const loading=ref(true)
const loadError=ref('')
let listener=null
let requestVersion=0

async function openAccount(user){
  if(!user)return
  if(account.value?.id===user.id&&!candidate.value)return
  const currentRequest=++requestVersion
  loading.value=true
  loadError.value=''
  try{
    const latest=await loadCloudSnapshot(user.id)
    if(currentRequest!==requestVersion)return
    cloud.value=latest?.payload||null
    revision.value=latest?.revision||0
    const name=user.user_metadata?.display_name||user.email?.split('@')[0]||'Mulher'
    const basic={id:user.id,name,email:user.email||''}
    if(!latest || isUnconfiguredSnapshot(latest.payload)){
      // Old automatic demonstration fichas are NOT real user-created workouts.
      // A blank account opens the setup wizard instead of the legacy presets.
      if(!latest){
        const old=legacyDataForEmail(user.email)||unscopedLegacyData()
        if(old){
          candidate.value={account:basic,data:old}
          onboarding.value=null
          account.value=null
          return
        }
      }
      candidate.value=null
      onboarding.value=basic
      account.value=null
      return
    }
    candidate.value=null
    onboarding.value=null
    firstSetupFinished.value=false
    account.value=basic
  }catch(error){
    loadError.value=error.message||'Não foi possível carregar sua conta.'
    account.value=null
  }finally{
    if(currentRequest===requestVersion)loading.value=false
  }
}
function chooseImport(importLocal){
  if(!candidate.value)return
  const basic=candidate.value.account
  if(importLocal){
    cloud.value={
      onboardingCompleted:true,
      state:candidate.value.data.state,
      cycle:candidate.value.data.cycle,
      profile:candidate.value.data.profile
    }
    account.value=basic
  }else{
    cloud.value=null
    account.value=null
    onboarding.value=basic
  }
  candidate.value=null
}
async function finishOnboarding(payload){
  if(!onboarding.value||savingOnboarding.value)return
  savingOnboarding.value=true
  onboardingError.value=''
  try{
    const current=onboarding.value
    const nextRevision=await saveCloudSnapshot(payload,revision.value)
    cloud.value=payload
    revision.value=nextRevision
    onboarding.value=null
    firstSetupFinished.value=true
    account.value=current
  }catch(error){
    onboardingError.value=error.message||'Não foi possível salvar sua configuração.'
  }finally{
    savingOnboarding.value=false
  }
}
async function retryLoad(){
  loadError.value=''
  loading.value=true
  const {data,error}=await supabase.auth.getUser()
  if(error){loadError.value=error.message;loading.value=false;return}
  if(data.user)await openAccount(data.user)
  else loading.value=false
}
async function logout(){
  ++requestVersion
  const {error}=await supabase.auth.signOut()
  if(error){loadError.value='Não foi possível sair da conta: '+error.message;return}
  account.value=null
  candidate.value=null
  onboarding.value=null
  cloud.value=null
  revision.value=0
  loadError.value=''
}
async function start(){
  const {data,error}=await supabase.auth.getSession()
  if(error){loadError.value=error.message}
  if(data?.session?.user)await openAccount(data.session.user)
  else loading.value=false
  const {data:sub}=supabase.auth.onAuthStateChange((event,session)=>{
    // Run remote queries after the auth callback has finished to avoid deadlocks.
    if(event==='SIGNED_OUT'){
      ++requestVersion
      account.value=null
      candidate.value=null
      onboarding.value=null
      cloud.value=null
      revision.value=0
    }else if(event==='SIGNED_IN'&&session?.user){
      setTimeout(()=>openAccount(session.user),0)
    }
  })
  listener=sub.subscription
}
onMounted(start)
onUnmounted(()=>{++requestVersion;listener?.unsubscribe()})
</script>

<template>
  <div v-if="loading" class="auth-loading" role="status">Carregando seus treinos...</div>
  <div v-else-if="loadError" class="auth-loading">
    <strong>Não foi possível acessar os dados da nuvem.</strong>
    <p>{{loadError}}</p>
    <button @click="retryLoad">Tentar novamente</button>
    <button class="auth-link" @click="logout">Sair da conta</button>
  </div>
  <div v-else-if="candidate" class="auth-import">
    <img src="/caramelo-treino.svg" alt="CaraMary sorrindo"/>
    <h2>Encontramos treinos neste celular!</h2>
    <p>Você já tinha registros salvos aqui. Quer enviá-los para sua nova conta online?</p>
    <button @click="chooseImport(true)">Sim, importar meus registros</button>
    <button class="auth-link" @click="chooseImport(false)">Não, começar uma conta nova</button>
    <small>Os dados antigos continuam neste navegador; não serão apagados.</small>
  </div>
  <OnboardingScreen v-else-if="onboarding" :account-name="onboarding.name"
    :saving="savingOnboarding" :save-error="onboardingError"
    @finish="finishOnboarding" @logout="logout"/>
  <AppWorkspace v-else-if="account" :key="account.id"
    :account-id="account.id" :account-name="account.name"
    :initial-cloud="cloud" :cloud-revision="revision" :fresh-setup="firstSetupFinished" @logout="logout"/>
  <AuthScreen v-else @authenticated="openAccount"/>
</template>
