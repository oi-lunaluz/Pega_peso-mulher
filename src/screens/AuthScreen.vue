<script setup>
import { ref } from 'vue'
import AppIcon from '../AppIcon.vue'
import { registerLocalAccount, loginLocalAccount } from '../lib/localAuth.js'

const emit=defineEmits(['authenticated'])
const mode=ref('login')
const name=ref('')
const email=ref('')
const password=ref('')
const confirm=ref('')
const revealPassword=ref(false)
const busy=ref(false)
const error=ref('')
function switchMode(next){
  mode.value=next
  error.value=''
  password.value=''
  confirm.value=''
}
async function submit(){
  if(busy.value)return
  error.value=''
  if(mode.value==='signup'&&password.value!==confirm.value){
    error.value='As senhas não coincidem.'
    return
  }
  busy.value=true
  try{
    const account=mode.value==='signup'
      ?await registerLocalAccount({name:name.value,email:email.value,password:password.value})
      :await loginLocalAccount({email:email.value,password:password.value})
    password.value=''
    confirm.value=''
    emit('authenticated',account)
  }catch(err){
    error.value=err instanceof Error?err.message:'Não foi possível continuar.'
  }finally{busy.value=false}
}
</script>

<template>
<div class="auth-page">
  <header class="auth-header"><span class="auth-brand"><AppIcon name="dumbbell" :size="19"/> PEGA PESO, MULHER!</span></header>
  <main class="auth-content">
    <section class="auth-hero">
      <div class="auth-hero-copy">
        <span class="auth-eyebrow">SEU ESPAÇO, SEU RITMO</span>
        <h1>O seu treino começa aqui!</h1>
        <p>Treinos no seu tempo, progresso do seu jeito. A CaraMary te acompanha!</p>
      </div>
      <img src="/caramelo-treino.svg" alt="CaraMary, a cachorrinha caramelo, pronta para treinar"/>
    </section>

    <section class="auth-form-card" aria-label="Acesso ao aplicativo">
      <button v-if="mode==='signup'" class="auth-back" type="button" @click="switchMode('login')"><AppIcon name="chevron" :size="16"/> Voltar para login</button>
      <div class="auth-form-heading">
        <h2>{{mode==='signup'?'Crie seu cadastro':'Bem-vinda de volta!'}}</h2>
        <p>{{mode==='signup'?'Preencha seus dados para começar.':'Entre com seu usuário e senha para continuar.'}}</p>
      </div>
      <form class="auth-form" @submit.prevent="submit">
        <div v-if="mode==='signup'" class="auth-field">
          <label for="auth-name">Como podemos te chamar?</label>
          <input id="auth-name" v-model.trim="name" autocomplete="name" placeholder="Seu nome ou apelido" maxlength="60" required minlength="2"/>
        </div>
        <div class="auth-field">
          <label for="auth-email">{{mode==='login'?'Usuário (e-mail)':'E-mail'}}</label>
          <input id="auth-email" v-model.trim="email" type="email" autocomplete="email" placeholder="voce@exemplo.com" required/>
        </div>
        <div class="auth-field">
          <label for="auth-password">Senha</label>
          <div class="auth-password-field">
            <input id="auth-password" v-model="password" :type="revealPassword?'text':'password'" :autocomplete="mode==='signup'?'new-password':'current-password'"  :placeholder="mode==='signup'?'Mínimo de 8 caracteres':'Sua senha'" minlength="8" required/>
            <button type="button" :aria-label="revealPassword?'Ocultar senha':'Mostrar senha'" @click="revealPassword=!revealPassword"><AppIcon :name="revealPassword?'lock':'user'" :size="18"/></button>
          </div>
        </div>
        <div v-if="mode==='signup'" class="auth-field">
          <label for="auth-confirm">Confirmar senha</label>
          <input id="auth-confirm" v-model="confirm" type="password" autocomplete="new-password" placeholder="Repita a sua senha" minlength="8" required/>
        </div>
        <p v-if="error" class="auth-error" role="alert">{{error}}</p>
        <button class="auth-submit" type="submit" :disabled="busy">
          {{busy?'Verificando...':mode==='signup'?'Criar cadastro':'Entrar'}}
          <AppIcon v-if="!busy" name="arrow" :size="18"/>
        </button>
      </form>
      <div class="auth-switch">
        <template v-if="mode==='login'">
          <span>Ainda não tem cadastro?</span>
          <button type="button" @click="switchMode('signup')">Me cadastrar</button>
        </template>
        <template v-else>
          <span>Já possui cadastro?</span>
          <button type="button" @click="switchMode('login')">Fazer login</button>
        </template>
      </div>
      <p class="auth-privacy"><AppIcon name="lock" :size="16"/> Protótipo de acesso local: cadastro e treinos ficam somente neste navegador. Não há sincronização, recuperação de senha nem conta online. Use uma senha exclusiva de teste.</p>
    </section>
  </main>
</div>
</template>
