<script setup>
import {computed} from 'vue'
const props=defineProps({view:{type:String,required:true},name:{type:String,default:''}})
const themes={
 list:['CENTRAL DE MISSÕES','Escolha seu desafio','Cadastra, organiza e entra na sua próxima ficha.'],
 workout:['FICHA DA AVENTUREIRA','Prepare a missão','Edite os movimentos e acompanhe seus recordes.'],
 routine:['MAPA DA ROTINA','Seu plano de jogo','Ajuste a ordem das fichas, os dias e seu cardio.'],
 stats:['LIVRO DE CONQUISTAS','Sua evolução','Recordes, medalhas e passos da sua jornada.'],
 cycle:['JARDIM DO BEM-ESTAR','Seu ciclo, seu ritmo','Seus registros são opcionais. Respeite seu corpo.'],
 profile:['PERFIL DA JOGADORA','Sua personagem','Preferências, objetivos e conquistas.'],
 session:['MISSÃO EM ANDAMENTO','Hora de se mover','Os dois estão torcendo por você!'],
 exercise:['DESAFIO DO EXERCÍCIO','Cada série conta','Registre as cargas com calma e no seu ritmo.'],
 done:['MISSÃO CONCLUÍDA','Você conseguiu!','Mais uma etapa da sua jornada.']
}
const item=computed(()=>themes[props.view]||themes.workout)
</script>
<template>
<section class="pixel-scene-header" :class="'pixel-scene-'+view">
  <div class="pixel-scene-copy">
    <span>{{item[0]}}</span>
    <h2>{{view==='workout'&&name?name:item[1]}}</h2>
    <p>{{item[2]}}</p>
  </div>
  <div class="pixel-scene-characters" aria-label="A aventureira e CaraMary juntas">
    <img class="pixel-scene-girl" src="/pixel-hero-girl.svg" alt="Menina de cabelo castanho em pixel art"/>
    <img class="pixel-scene-mary" src="/pixel-caramary.svg" alt="CaraMary, a cachorrinha caramelo em pixel art"/>
  </div>
</section>
</template>