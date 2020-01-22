export { usePromise } from './usePromise'
export { useDebounce } from './useDebounce'
export { useLocalStorage } from './useLoaclStorage'

export const sleep = (t) => new Promise((res) => setTimeout(res, t))
