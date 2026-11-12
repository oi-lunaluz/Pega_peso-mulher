import { supabase } from './supabase.js'
import { readJson } from './storage.js'

/** Database copy is versioned and protected by Supabase RLS + compare-and-swap. */
export async function loadCloudSnapshot(userId) {
  const {data,error}=await supabase.from('app_snapshots')
    .select('payload,revision').eq('user_id',userId).maybeSingle()
  if(error)throw new Error('Não foi possível carregar os dados da nuvem: '+error.message)
  return data?{payload:data.payload,revision:Number(data.revision)}:null
}
export async function saveCloudSnapshot(payload,revision) {
  const {data,error}=await supabase.rpc('save_app_snapshot',{
    new_payload:payload,expected_revision:revision
  })
  if(error)throw new Error(error.message.includes('CONFLICT')
    ?'Os dados foram atualizados em outro dispositivo. Reentre na conta para atualizar sem sobrescrever suas alterações.'
    :'Falha ao salvar na nuvem: '+error.message)
  return Number(data)
}
const KEYS={
  state:'pega-peso-mulher-mvp-v1',
  cycle:'pega-peso-mulher-cycle-v1',
  profile:'pega-peso-mulher-profile-v1'
}
const profileDefaults={nickname:'',goal:'Ganhar força e massa muscular'}
/** Looks for data produced by the former local-only login using the SAME email. */
export function legacyDataForEmail(email){
  const normalized=String(email||'').trim().toLowerCase()
  const records=readJson('pega-peso-mulher-local-accounts-v1',{items:[]}).items||[]
  const matched=records.find(a=>a.email===normalized)
  if(matched?.id){
    const state=readJson(KEYS.state+'-'+matched.id,null)
    const cycle=readJson(KEYS.cycle+'-'+matched.id,null)
    const profile=readJson(KEYS.profile+'-'+matched.id,null)
    if(state||cycle||profile)return {state,cycle,profile:{...profileDefaults,...profile},source:'account'}
  }
  return null
}
/** Older pre-login installation (never auto-claim: user must opt in). */
export function unscopedLegacyData(){
  const state=readJson(KEYS.state,null)
  const cycle=readJson(KEYS.cycle,null)
  const profile=readJson(KEYS.profile,null)
  if(state||cycle||profile)return {state,cycle,profile:{...profileDefaults,...profile},source:'legacy'}
  return null
}
