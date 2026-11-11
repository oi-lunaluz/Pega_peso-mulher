import { readJson, writeJson } from './storage.js'

const ACCOUNTS_KEY='pega-peso-mulher-local-accounts-v1'
const SESSION_KEY='pega-peso-mulher-local-session-v1'
const ITERATIONS=210000

export const normalizeEmail=(email)=>String(email||'').trim().toLowerCase()
export const validEmail=(email)=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(email))
export const validPassword=(password)=>typeof password==='string'&&password.length>=8

function accounts(){const result=readJson(ACCOUNTS_KEY,{items:[]});return Array.isArray(result.items)?result.items:[]}
function bufferToBase64(buffer){return btoa(String.fromCharCode(...new Uint8Array(buffer)))}
function base64ToBytes(str){return Uint8Array.from(atob(str),char=>char.charCodeAt(0))}
async function deriveVerifier(password,salt,iterations=ITERATIONS){
  if(!globalThis.crypto?.subtle)throw new Error('Seu navegador não oferece o recurso de segurança necessário.')
  const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(password),'PBKDF2',false,['deriveBits'])
  return bufferToBase64(await crypto.subtle.deriveBits({
    name:'PBKDF2',hash:'SHA-256',salt:base64ToBytes(salt),iterations
  },key,256))
}
function safeSessionSave(record){
  try{sessionStorage.setItem(SESSION_KEY,JSON.stringify({id:record.id}))}
  catch{throw new Error('Não foi possível iniciar a sessão neste navegador.')}
}
export function activeLocalAccount(){
  try{
    const session=JSON.parse(sessionStorage.getItem(SESSION_KEY)||'null')
    const found=accounts().find(a=>a.id===session?.id)
    return found?{id:found.id,name:found.name,email:found.email,migrateLegacy:!!found.migrateLegacy}:null
  }catch{return null}
}
export async function registerLocalAccount({name,email,password}){
  const userName=String(name||'').trim().replace(/\s+/g,' ')
  const normalizedEmail=normalizeEmail(email)
  if(userName.length<2)throw new Error('Informe seu nome com pelo menos 2 caracteres.')
  if(!validEmail(normalizedEmail))throw new Error('Informe um e-mail válido.')
  if(!validPassword(password))throw new Error('A senha precisa ter pelo menos 8 caracteres.')
  const current=accounts()
  if(current.some(a=>a.email===normalizedEmail))throw new Error('Este e-mail já está cadastrado neste aparelho.')
  if(!globalThis.crypto?.getRandomValues)throw new Error('Este navegador não permite criar um cadastro local.')
  const salt=bufferToBase64(crypto.getRandomValues(new Uint8Array(16)))
  const record={
    id:bufferToBase64(crypto.getRandomValues(new Uint8Array(18))).replace(/[^a-zA-Z0-9]/g,''),
    name:userName,email:normalizedEmail,salt,iterations:ITERATIONS,
    verifier:await deriveVerifier(password,salt),migrateLegacy:current.length===0
  }
  if(!writeJson(ACCOUNTS_KEY,{items:[...current,record]}))
    throw new Error('Não foi possível salvar o cadastro neste navegador.')
  safeSessionSave(record)
  return {id:record.id,name:record.name,email:record.email,migrateLegacy:record.migrateLegacy}
}
export async function loginLocalAccount({email,password}){
  const account=accounts().find(a=>a.email===normalizeEmail(email))
  if(!account)throw new Error('E-mail ou senha incorretos.')
  const verifier=await deriveVerifier(password,account.salt,account.iterations||ITERATIONS)
  if(verifier!==account.verifier)throw new Error('E-mail ou senha incorretos.')
  safeSessionSave(account)
  return {id:account.id,name:account.name,email:account.email,migrateLegacy:!!account.migrateLegacy}
}
export function logoutLocalAccount(){
  try{sessionStorage.removeItem(SESSION_KEY)}catch{}
}
