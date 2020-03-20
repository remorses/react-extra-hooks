import { useEffect, useState } from 'react'
import { CacheaOptions, getFromCache } from './cache'
import { useLazyPromise } from './useLazyPromise'

export interface usePromiseOutput<ResultType> {
    result?: ResultType
    loading: boolean
    error?: Error
}

export interface UsePromiseOptions<ResultType> {
    args?: any[]
    polling?: {
        interval: number
        then?: (result: ResultType, stop?: () => void) => any
    }
}

export function usePromise<ResultType = any>(
    promise: (...args: any) => Promise<ResultType> | null | undefined,
    options: CacheaOptions & UsePromiseOptions<ResultType> = {},
): usePromiseOutput<ResultType> {
    const cacheHit = options.cache
        ? getFromCache({
              promiseId: options.promiseId ?? promise?.name,
              args: options.args,
          })
        : undefined
    const [continuePolling, setContinuePolling] = useState(
        !!options.polling?.interval,
    )
    const [
        execute,
        { result = cacheHit, error, loading = !cacheHit },
        invalidate,
    ] = useLazyPromise(promise, options)
    const isPromiseNull = !promise
    const deps = [isPromiseNull, ...(options?.args || [])] || [isPromiseNull]
    useEffect(() => {
        if (!promise) {
            return
        }
        const args = options.args || []
        if (!options?.polling?.interval) {
            execute(...args).catch(identity)
            return
        }
        let id = setInterval(
            (args) => {
                if (!continuePolling) {
                    return
                }
                invalidate()
                execute(...args)
                    .then((result) => [
                        result,
                        () => {
                            clearInterval(id)
                            setContinuePolling(false)
                        },
                    ])
                    .then(
                        (args: [ResultType, any]) =>
                            options?.polling?.then?.(...args) || identity,
                    )
                    .catch(identity)
            },
            options?.polling?.interval,
            args,
        )
        return () => clearInterval(id)
    }, deps)
    return { result, error, loading }
}

const identity = (x) => x
