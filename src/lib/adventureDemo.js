import { emptyTrainingState } from './onboarding.js'

/** Dados fictícios usados somente no modo preview da branch. Nunca usam conta real. */
export function createAdventureDemoSnapshot(){
  const workouts=[
    {name:'Quadríceps',exercises:['Agachamento livre','Leg press 45°','Cadeira extensora'],cardioMinutes:20},
    {name:'Superiores A',exercises:['Puxada alta','Remada baixa','Elevação lateral'],cardioMinutes:20},
    {name:'Posterior e glúteos',exercises:['Stiff','Mesa flexora','Elevação pélvica'],cardioMinutes:25},
    {name:'Superiores B',exercises:['Supino máquina','Remada unilateral','Rosca direta'],cardioMinutes:15},
    {name:'Full body',exercises:['Agachamento','Puxada alta','Prancha'],cardioMinutes:20}
  ]
  return {
    onboardingCompleted:true,
    state:{
      ...emptyTrainingState(),
      workouts,
      rotation:workouts.map(w=>w.name),
      rotationIndex:0,
      cardioPlacement:'junto',
      cardioGoal:150,
      cardioSessionTarget:20,
      scheduledDays:[1,2,3,4,5]
    },
    profile:{nickname:'Aventureira',goal:'Ganhar força',homeMode:'pixel',bodyWeightKg:null,usualLoadKg:null},
    cycle:{enabled:false,start:'',length:28,period:5,notes:[]}
  }
}
