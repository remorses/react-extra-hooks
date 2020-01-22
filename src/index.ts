export { usePromise, usePromiseOutput } from './usePromise'
export { useAsync, useAsyncOutput } from './useAsync'
export { useDebounce } from './useDebounce'
export { useLocalStorage } from './useLoaclStorage'

export const sleep = (t) => new Promise((res) => setTimeout(res, t))
