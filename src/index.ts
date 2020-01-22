export { usePromise, usePromiseOutput } from './usePromise'
export { useLazyPromise, useLazyPromiseOutput } from './useLazyPromise'
export { useDebounce } from './useDebounce'
export { useLocalStorage } from './useLoaclStorage'

export const sleep = (t) => new Promise((res) => setTimeout(res, t))
