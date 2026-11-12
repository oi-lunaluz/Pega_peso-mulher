<script setup>
import { computed } from 'vue'
import { House, Dumbbell, CalendarDays, ChartNoAxesCombined, Flower2, UserRound, Trophy, Heart, Sparkles, Sun, CalendarCheck, Activity, Medal, Footprints, ShieldCheck, Pencil, Palmtree, Timer, Flame, Zap, ClipboardList, Check, ChevronRight, ArrowRight, Plus, X, LockKeyhole, Leaf, Moon, Target, TrendingUp, Smile, Waves, CircleCheck, ChartColumnIncreasing, CircleHelp, Search } from 'lucide-vue-next'
const props=defineProps({name:{type:String,default:'sparkles'},size:{type:Number,default:19},strokeWidth:{type:Number,default:2.2}})
const icons={home:House,dumbbell:Dumbbell,calendar:CalendarDays,chart:ChartNoAxesCombined,flower:Flower2,user:UserRound,trophy:Trophy,heart:Heart,sparkles:Sparkles,sun:Sun,calendarCheck:CalendarCheck,activity:Activity,medal:Medal,run:Footprints,shield:ShieldCheck,pencil:Pencil,palm:Palmtree,timer:Timer,flame:Flame,zap:Zap,clipboard:ClipboardList,search:Search,check:Check,chevron:ChevronRight,arrow:ArrowRight,plus:Plus,close:X,lock:LockKeyhole,leaf:Leaf,moon:Moon,target:Target,trend:TrendingUp,smile:Smile,waves:Waves,done:CircleCheck,bars:ChartColumnIncreasing,help:CircleHelp}
const component=computed(()=>icons[props.name]||Sparkles)
</script>
<template><component :is="component" :size="size" :stroke-width="strokeWidth" aria-hidden="true" class="app-icon"/></template>
