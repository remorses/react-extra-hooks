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
    const [
        execute,
        { result = cacheHit, error, loading = !cacheHit },
        invalidate,
    ] = useLazyPromise(promise, options)

    const isPromiseNull = !promise
    const args = options?.args || []

    useEffect(() => {
        if (isPromiseNull) {
            return
        }
        execute(...args).catch(identity)
    }, [isPromiseNull, ...args])

    usePolling({
        enabled: options?.polling?.interval,
        args,
        execute: (args) => {
            invalidate()
            return execute(...args)
        },
        interval: options?.polling?.interval,
        isPromiseNull,
        result,
        then: options?.polling?.then,
    })

    return { result, error, loading }
}

function usePolling({
    execute,
    result,
    enabled,
    interval,
    args,
    then,
    isPromiseNull,
}) {
    const continuePolling = useRef(enabled)
    useEffect(() => {
        if (isPromiseNull) {
            return
        }
        if (!enabled) {
            return
        }
        const poll = (args) => {
            if (!continuePolling.current) {
                return
            }
            const previous = result
            execute(args)
                .then((result) => ({
                    result,
                    stop: () => {
                        clearInterval(id)
                        continuePolling.current = false
                    },
                    previous,
                }))
                .then((args) => then?.(args) || identity)
                .catch(identity)
        }
        let id = setInterval(poll, interval, args)
        return () => clearInterval(id)
    }, [isPromiseNull, result, ...args])
}

const identity = (x) => x
