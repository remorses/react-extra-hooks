import { useEffect, useState, useRef } from 'react'
import { CacheaOptions, getFromCache } from './cache'
import { useLazyPromise } from './useLazyPromise'
import { useRenderNumber } from '.'

export interface usePromiseOutput<ResultType> {
    result?: ResultType
    loading: boolean
    error?: Error
}

export interface UsePromiseOptions<ResultType> {
    args?: any[]
    polling?: {
        interval: number
        then?: (arg: {
            result: ResultType
            stop: () => void
            previous: ResultType
        }) => any
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
    const continuePolling = useRef(!!options.polling?.interval)
    const [
        execute,
        { result = cacheHit, error, loading = !cacheHit },
        invalidate,
    ] = useLazyPromise(promise, options)
    const renderNumber = useRenderNumber()
    const isPromiseNull = !promise
    const defaultDeps = [isPromiseNull, result]
    const args = options?.args || []
    useEffect(() => {
        if (!promise) {
            return
        }
        const args = options.args || []
        if (!options?.polling?.interval) {
            execute(...args).catch(identity)
            return
        }
        const poll = (args) => {
            if (!continuePolling.current) {
                return
            }
            const previous = result
            invalidate()
            execute(...args)
                .then((result) => ({
                    result,
                    stop: () => {
                        clearInterval(id)
                        continuePolling.current = false
                    },
                    previous,
                }))
                .then((args) => options?.polling?.then?.(args) || identity)
                .catch(identity)
        }
        let id = setInterval(poll, options?.polling?.interval, args)
        if (renderNumber === 0) {
            poll(args)
        }
        return () => clearInterval(id)
    }, [...defaultDeps, ...args])
    return { result, error, loading }
}

const identity = (x) => x
