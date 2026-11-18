<script setup>
import {inject,ref} from 'vue'
import AppIcon from '../AppIcon.vue'
import {GOAL_OPTIONS} from '../lib/onboarding.js'

const {view,profile,logout,syncStatus}=inject('pegaPesoApp')
const photoBusy=ref(false)
const photoError=ref('')
const photoMessage=ref('')

// Ler a foto como arquivo local é mais compatível com a galeria Android e WebViews.
function readPhotoAsDataUrl(file){
 return new Promise((resolve,reject)=>{
  const reader=new FileReader()
  reader.onload=()=>typeof reader.result==='string'?resolve(reader.result):reject(new Error('Não foi possível ler a foto.'))
  reader.onerror=()=>reject(new Error('O celular não permitiu ler este arquivo.'))
  reader.readAsDataURL(file)
 })
}
function decodePhoto(source){
 return new Promise((resolve,reject)=>{
  const img=new Image()
  img.onload=()=>resolve(img)
  img.onerror=()=>reject(new Error('Não foi possível abrir esse formato. Tente uma foto JPG ou um print da galeria.'))
  img.src=source
 })
}
async function choosePhoto(event){
 const file=event.target.files?.[0]
 // Limpar após guardar o arquivo permite escolher a mesma imagem de novo.
 event.target.value=''
 if(!file){photoMessage.value='Nenhuma foto foi selecionada.';return}
 photoError.value=''
 photoMessage.value='Lendo foto da galeria...'
 if(file.size>20*1024*1024){photoError.value='A imagem precisa ter até 20 MB.';photoMessage.value='';return}
 if(file.type&&!file.type.startsWith('image/')&&!/\.(heic|heif|jpg|jpeg|png|webp)$/i.test(file.name)){
  photoError.value='Escolha uma imagem da galeria (JPG, PNG, WebP ou HEIC).';photoMessage.value='';return
 }
 photoBusy.value=true
 try{
  const source=await readPhotoAsDataUrl(file)
  photoMessage.value='Preparando sua foto...'
  const image=await decodePhoto(source)
  const canvas=document.createElement('canvas')
  canvas.width=192;canvas.height=192
  const ctx=canvas.getContext('2d')
  if(!ctx)throw new Error('O navegador não permitiu ajustar a foto.')
  const side=Math.min(image.naturalWidth,image.naturalHeight)
  if(!side)throw new Error('Essa imagem não tem dimensões válidas.')
  ctx.drawImage(image,(image.naturalWidth-side)/2,(image.naturalHeight-side)/2,side,side,0,0,192,192)
  const data=canvas.toDataURL('image/jpeg',0.7)
  if(!data.startsWith('data:image/jpeg,'))throw new Error('Não foi possível converter a imagem.')
  profile.value.photoDataUrl=data
  photoMessage.value='Foto selecionada! Salvando na sua conta...'
 }catch(error){
  photoError.value=error?.message||'Não foi possível usar essa foto.'
  photoMessage.value=''
 }finally{photoBusy.value=false}
}
function removePhoto(){photoError.value='';photoMessage.value='Foto removida.';profile.value.photoDataUrl=''}
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
      <span v-if="photoMessage" class="profile-photo-upload-status" role="status">{{photoMessage}}</span>
    </div>
    <div v-if="profile.photoDataUrl" class="profile-photo-actions">
      <button type="button" class="profile-remove-photo" @click="removePhoto">Remover foto</button>
    </div>
    <small v-if="photoError" class="profile-photo-error" role="alert">{{photoError}}</small>
    <small v-else class="profile-photo-hint">Escolha uma foto da galeria. Se não funcionar, uma captura de tela em JPG/PNG também serve.</small>
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
