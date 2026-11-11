import test from 'node:test'
import assert from 'node:assert/strict'
import { normalizeEmail,validEmail,validPassword } from './localAuth.js'
test('normaliza e valida e-mail de cadastro',()=>{
 assert.equal(normalizeEmail('  TESTE@EXEMPLO.COM '),'teste@exemplo.com')
 assert.equal(validEmail('pessoa@exemplo.com'),true)
 assert.equal(validEmail('email-invalido'),false)
})
test('cadastro exige senha de pelo menos 8 caracteres',()=>{
 assert.equal(validPassword('1234567'),false)
 assert.equal(validPassword('12345678'),true)
})
