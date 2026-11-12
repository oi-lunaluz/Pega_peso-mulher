<script setup>
import { inject } from 'vue'
import AppIcon from '../AppIcon.vue'
import { GOAL_OPTIONS } from '../lib/onboarding.js'

const {
  view,
  profile,
  logout,
} = inject('pegaPesoApp')
</script>

<template>
<div class="brazil-banner pink-banner"><div><span class="kicker"><AppIcon name="flower" :size="17"/> MINHA ÁREA</span><h2>Meu perfil</h2><p>Seu espaço, suas escolhas. <AppIcon name="heart" :size="17"/></p></div><img class="banner-dog" src="/caramelo-treino.svg" alt="" aria-hidden="true"/></div><div class="profile-card"><span class="profile-avatar"><AppIcon name="user" :size="34"/></span><div><strong>{{profile.nickname||'Mulher poderosa!'}}</strong><small>Pega Peso, Mulher! <AppIcon name="heart" :size="17"/></small></div></div><div class="brazil-form"><label class="brazil-label">Como quer ser chamada?</label><input v-model="profile.nickname" maxlength="40" placeholder="Seu apelido"/><label class="brazil-label">Seu objetivo</label><select v-model="profile.goal"><option v-for="goal in GOAL_OPTIONS" :key="goal">{{goal}}</option><option v-if="profile.goal&&!GOAL_OPTIONS.includes(profile.goal)">{{profile.goal}}</option></select><small>As alterações são sincronizadas com sua conta Supabase.</small></div><div class="brazil-list"><button class="brazil-list-row" @click="view='routine'"><span class="row-icon yellow-icon"><AppIcon name="calendar" :size="17"/></span><span class="row-info"><strong>Minha rotina</strong><small>Editar dias e treinos</small></span><span class="row-arrow">›</span></button><button class="brazil-list-row" @click="view='stats'"><span class="row-icon mint-icon"><AppIcon name="chart" :size="17"/></span><span class="row-info"><strong>Minha evolução</strong><small>Acompanhar os registros</small></span><span class="row-arrow">›</span></button></div><button class="profile-signout" type="button" @click="logout"><AppIcon name="lock" :size="17"/> Sair do cadastro</button><p class="privacy-note"><AppIcon name="lock" :size="17"/> Sua conta usa Supabase Auth. Os registros são sincronizados na nuvem quando há conexão; uma cópia local é mantida no navegador.</p>
</template>
