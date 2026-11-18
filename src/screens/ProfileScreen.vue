<script setup>
import {inject,ref} from 'vue'
import AppIcon from '../AppIcon.vue'
import {GOAL_OPTIONS} from '../lib/onboarding.js'

const {view,profile,logout,syncStatus}=inject('pegaPesoApp')
const photoBusy=ref(false)
const photoError=ref('')

function readImage(file){
 return new Promise((resolve,reject)=>{
  const image=new Image()
  const url=URL.createObjectURL(file)
  image.onload=()=>{URL.revokeObjectURL(url);resolve(image)}
  image.onerror=()=>{URL.revokeObjectURL(url);reject(new Error('Não consegui abrir essa imagem. Experimente JPG ou PNG.'))}
  image.src=url
 })
}
async function choosePhoto(event){
 const file=event.target.files?.[0]
 event.target.value=''
 if(!file)return
 photoError.value=''
 if(file.type&&!file.type.startsWith('image/')){
  photoError.value='Selecione uma imagem da galeria ou da câmera.'
  return
 }
 if(file.size>20*1024*1024){
  photoError.value='A foto deve ter até 20 MB.'
  return
 }
 photoBusy.value=true
 try{
  const image=await readImage(file)
  const square=192
  const canvas=document.createElement('canvas')
  canvas.width=square;canvas.height=square
  const ctx=canvas.getContext('2d')
  if(!ctx)throw new Error('Não foi possível preparar sua foto.')
  const side=Math.min(image.naturalWidth,image.naturalHeight)
  const x=(image.naturalWidth-side)/2,y=(image.naturalHeight-side)/2
  ctx.fillStyle='#fff'
  ctx.fillRect(0,0,square,square)
  ctx.drawImage(image,x,y,side,side,0,0,square,square)
  const encoded=canvas.toDataURL('image/jpeg',0.68)
  if(!encoded.startsWith('data:image/jpeg,'))throw new Error('Não foi possível converter sua foto.')
  profile.value.photoDataUrl=encoded
 }catch(error){photoError.value=error.message||'Não foi possível carregar sua foto.'}
 finally{photoBusy.value=false}
}
function removePhoto(){photoError.value='';profile.value.photoDataUrl=''}
</script>

<template>
<div class="profile-screen">
  <div class="profile-heading">
    <div><span class="profile-eyebrow">MEU ESPAÇO</span><h2>Meu perfil</h2><p>Deixe esse cantinho com a sua cara. 💗</p></div>
    <img src="/caramelo-treino.svg" alt="" aria-hidden="true"/>
  </div>

  <section class="profile-identity">
    <div class="profile-photo-control">
      <div class="profile-photo-preview" aria-label="Sua foto de perfil">
        <img v-if="profile.photoDataUrl" :src="profile.photoDataUrl" alt="Foto de perfil cadastrada"/>
        <AppIcon v-else name="user" :size="37"/>
      </div>

    </div>
    <strong>{{profile.nickname||'Mulher poderosa!'}}</strong>
    <p>Foto e nome aparecem na sua conta.</p>
    <div class="profile-photo-upload">
      <label for="profile-photo-input">Escolher foto da galeria</label>
      <input id="profile-photo-input" type="file" accept="image/*" :disabled="photoBusy"
        aria-label="Selecionar foto da galeria do celular" @change="choosePhoto"/>
      <span v-if="photoBusy" class="profile-photo-upload-status" role="status">Preparando sua foto...</span>
    </div>
    <div v-if="profile.photoDataUrl" class="profile-photo-actions">
      <button type="button" class="profile-remove-photo" @click="removePhoto">Remover foto</button>
    </div>
    <small v-if="photoError" class="profile-photo-error" role="alert">{{photoError}}</small>
    <small v-else class="profile-photo-hint">Selecione uma foto normal da galeria (JPG, PNG ou WebP). Ela será ajustada para o perfil.</small>
  </section>

  <section class="profile-settings">
    <h3>Minhas informações</h3>
    <label class="brazil-label" for="profile-nickname">Como quer ser chamada?</label>
    <input id="profile-nickname" v-model.trim="profile.nickname" maxlength="40" placeholder="Seu nome ou apelido" autocomplete="nickname"/>
    <label class="brazil-label" for="profile-goal">Seu objetivo</label>
    <select id="profile-goal" v-model="profile.goal">
      <option v-for="goal in GOAL_OPTIONS" :key="goal">{{goal}}</option>
      <option v-if="profile.goal&&!GOAL_OPTIONS.includes(profile.goal)">{{profile.goal}}</option>
    </select>
    <div class="profile-initial-data">
      <label class="brazil-label" for="profile-weight-kg">Peso atual (kg) · opcional</label>
      <input id="profile-weight-kg" type="number" min="0.1" max="650" step="0.1" inputmode="decimal" :value="profile.bodyWeightKg??''" @change="profile.bodyWeightKg=$event.target.value===''?null:Number($event.target.value)"/>

    </div>
    <p class="profile-save-hint"><AppIcon name="check" :size="14"/> {{syncStatus==='saving'?'Salvando alterações...':syncStatus==='error'?'Falha ao sincronizar: confira o aviso no topo.':'Alterações salvas automaticamente na sua conta.'}}</p>
  </section>

  <section class="profile-shortcuts">
    <button type="button" class="brazil-list-row" @click="view='list'">
      <span class="row-icon yellow-icon"><AppIcon name="calendar" :size="17"/></span>
      <span class="row-info"><strong>Meus treinos</strong><small>Fichas, cardio e ajustes</small></span>
      <AppIcon name="chevron" :size="17"/>
    </button>
    <button type="button" class="brazil-list-row" @click="view='stats'">
      <span class="row-icon mint-icon"><AppIcon name="chart" :size="17"/></span>
      <span class="row-info"><strong>Minha evolução</strong><small>Seus registros e medalhas</small></span>
      <AppIcon name="chevron" :size="17"/>
    </button>
  </section>

  <section class="profile-account">
    <h3>Conta e acesso</h3>
    <p>Quer testar o cadastro de outra pessoa? Saia da conta atual para criar uma conta nova e começar do zero, sem apagar seus treinos.</p>
    <button type="button" class="profile-new-account" @click="logout('signup')"><AppIcon name="plus" :size="17"/> Sair e criar nova conta</button>
    <button type="button" class="profile-signout" @click="logout('login')"><AppIcon name="lock" :size="17"/> Sair da minha conta</button>
    <small>Os dados de cada conta ficam separados. Ao sair, você poderá fazer login novamente.</small>
  </section>
</div>
</template>
