/**
 * Persistência tolerante a dados antigos/corrompidos e modo privado do navegador.
 * Mantemos as chaves existentes para que as usuárias não percam o histórico.
 */
export function readJson(key, fallback, storage = globalThis.localStorage) {
  try {
    const raw=storage?.getItem(key)
    if(!raw)return fallback
    const parsed=JSON.parse(raw)
    return parsed && typeof parsed==='object' && !Array.isArray(parsed)?parsed:fallback
  } catch {
    return fallback
  }
}
export function writeJson(key, value, storage = globalThis.localStorage) {
  try {
    storage?.setItem(key,JSON.stringify(value))
    return true
  } catch {
    return false
  }
}
export function normalizeTrainingState(raw, defaults) {
  if (!raw || !Array.isArray(raw.workouts) || !Array.isArray(raw.history)) return structuredClone(defaults)
  const state={...structuredClone(defaults),...raw}
  state.workouts=raw.workouts
    .filter(w=>w&&typeof w.name==='string'&&w.name.trim())
    .map(w=>({...w,exercises:Array.isArray(w.exercises)?w.exercises.filter(e=>typeof e==='string'):[]}))
  state.history=raw.history.filter(h=>h&&typeof h==='object')
    .map(h=>({...h,sets:h.sets&&typeof h.sets==='object'?h.sets:{}}))
  state.routine=Array.isArray(raw.routine)?raw.routine:defaults.routine
  return state
}
