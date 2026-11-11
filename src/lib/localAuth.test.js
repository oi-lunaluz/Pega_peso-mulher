import test from 'node:test'
import assert from 'node:assert/strict'
import { normalizeEmail,validEmail,validPassword,registerLocalAccount,loginLocalAccount,logoutLocalAccount,activeLocalAccount } from './localAuth.js'
test('normaliza e valida e-mail de cadastro',()=>{
 assert.equal(normalizeEmail('  TESTE@EXEMPLO.COM '),'teste@exemplo.com')
 assert.equal(validEmail('pessoa@exemplo.com'),true)
 assert.equal(validEmail('email-invalido'),false)
})
test('cadastro exige senha de pelo menos 8 caracteres',()=>{
 assert.equal(validPassword('1234567'),false)
 assert.equal(validPassword('12345678'),true)
})

test('cadastrar, sair e entrar preserva o cadastro local sem armazenar a senha',async()=>{
  const memory=new Map()
  const sessions=new Map()
  const store=map=>({
    getItem:key=>map.has(key)?map.get(key):null,
    setItem:(key,value)=>map.set(key,value),
    removeItem:key=>map.delete(key)
  })
  const oldLocal=Object.getOwnPropertyDescriptor(globalThis,'localStorage')
  const oldSession=Object.getOwnPropertyDescriptor(globalThis,'sessionStorage')
  Object.defineProperty(globalThis,'localStorage',{configurable:true,value:store(memory)})
  Object.defineProperty(globalThis,'sessionStorage',{configurable:true,value:store(sessions)})
  try{
    const first=await registerLocalAccount({name:'Cara Mary',email:' TESTE@EXEMPLO.COM ',password:'senha-local-unica-123'})
    assert.equal(first.migrateLegacy,true)
    assert.equal(first.email,'teste@exemplo.com')
    assert.equal(activeLocalAccount()?.id,first.id)
    assert.equal(memory.get('pega-peso-mulher-local-accounts-v1').includes('senha-local-unica-123'),false)
    logoutLocalAccount()
    assert.equal(activeLocalAccount(),null)
    await assert.rejects(loginLocalAccount({email:'teste@exemplo.com',password:'errada'}))
    const resumed=await loginLocalAccount({email:'teste@exemplo.com',password:'senha-local-unica-123'})
    assert.equal(resumed.id,first.id)
    const second=await registerLocalAccount({name:'Outra pessoa',email:'outra@exemplo.com',password:'nova-senha-local-123'})
    assert.equal(second.migrateLegacy,false)
    assert.notEqual(first.id,second.id)
  }finally{
    if(oldLocal)Object.defineProperty(globalThis,'localStorage',oldLocal)
    else delete globalThis.localStorage
    if(oldSession)Object.defineProperty(globalThis,'sessionStorage',oldSession)
    else delete globalThis.sessionStorage
  }
})
