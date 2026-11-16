<script setup>
import { inject } from 'vue'
import ClassicHome from './ClassicHome.vue'
import PixelAdventureHome from './PixelAdventureHome.vue'
const { profile }=inject('pegaPesoApp')
</script>
<template>
  <div v-if="profile.homeMode==='classic'" class="home-mode-classic">
    <button class="home-mode-return" type="button" @click="profile.homeMode='pixel'">Voltar para a aventura em pixel art</button>
    <ClassicHome/>
  </div>
  <PixelAdventureHome v-else/>
</template>
