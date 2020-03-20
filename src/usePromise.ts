import { useEffect } from 'react'
import { CacheaOptions, hashArg, memoryCache } from './cache'
import { useLazyPromise } from './useLazyPromise'

export interface usePromiseOutput<ResultType> {
    result?: ResultType
    loading: boolean
    error?: Error
}

export function usePromise<ResultType = any>(
    promise: (...args: any) => Promise<ResultType> | null | undefined,
    options: CacheaOptions & { args?: any[] } = {},
): usePromiseOutput<ResultType> {
    const cacheHit = options.cache
        ? memoryCache[
              hashArg({
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
        if (!promise) {
            return
        }
        execute(...(options.args || []))
    }, [execute, ...options.args] || [execute])
    return { result, error, loading }
}
