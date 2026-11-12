<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import AuthScreen from './screens/AuthScreen.vue'
import AppWorkspace from './AppWorkspace.vue'
import { supabase } from './lib/supabase.js'
import { loadCloudSnapshot, legacyDataForEmail, unscopedLegacyData } from './lib/cloudData.js'

const account=ref(null)
const cloud=ref(null)
const revision=ref(0)
const candidate=ref(null)
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
    if(!latest){
      // Import only after the user explicitly chooses this local backup.
      const old=legacyDataForEmail(user.email)||unscopedLegacyData()
      if(old){
        candidate.value={account:basic,data:old}
        account.value=null
        return
      }
    }
    candidate.value=null
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
  cloud.value=importLocal?{
    state:candidate.value.data.state,
    cycle:candidate.value.data.cycle,
    profile:candidate.value.data.profile
  }:null
  account.value=candidate.value.account
  candidate.value=null
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
  <AppWorkspace v-else-if="account" :key="account.id"
    :account-id="account.id" :account-name="account.name"
    :initial-cloud="cloud" :cloud-revision="revision" @logout="logout"/>
  <AuthScreen v-else @authenticated="openAccount"/>
</template>
