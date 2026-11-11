<script setup>
import { ref } from 'vue'
import AuthScreen from './screens/AuthScreen.vue'
import AppWorkspace from './AppWorkspace.vue'
import { activeLocalAccount,logoutLocalAccount } from './lib/localAuth.js'

const account=ref(activeLocalAccount())
function onAuthenticated(value){account.value=value}
function logout(){logoutLocalAccount();account.value=null}
</script>

<template>
  <AppWorkspace v-if="account" :key="account.id"
    :account-id="account.id" :account-name="account.name"
    :migrate-legacy="account.migrateLegacy" @logout="logout"/>
  <AuthScreen v-else @authenticated="onAuthenticated"/>
</template>
