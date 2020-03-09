import { useEffect, useReducer } from 'react'
import {
    useLazyPromise,
    makeHash,
    useLazyPromiseOutput,
} from './useLazyPromise'
import { CacheaOptions, memoryCache, hashArg } from './cache'

function makeCallback(promise) {
    if (promise.then) {
        return () => promise
    }
    return promise
}

export interface usePromiseOutput<ResultType> {
    result?: ResultType
    loading: boolean
    error?: Error
}

export function usePromise<ResultType = any>(
    promise: (...args: any) => Promise<ResultType>,
    options: CacheaOptions & { args?: any[] } = {},
): usePromiseOutput<ResultType> {
    const cacheHit = options.cache
        ? memoryCache[
              makeHash({
                  promiseId: options.promiseId ?? promise.name,
                  args: options.args,
              })
          ]
        : undefined
    const [
        execute,
        { result = cacheHit, error, loading = !cacheHit },
    ] = useLazyPromise(promise, options)
    useEffect(() => {
        execute(...(options.args || []))
    }, options.args || [])
    return { result, error, loading }
}
