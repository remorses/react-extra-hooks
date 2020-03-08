import { useEffect, useReducer } from 'react'
import { useLazyPromise, useLazyPromiseOutput } from './useLazyPromise'
import { CacheaOptions } from './cache'

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
    promise: Promise<ResultType> | ((...args: any) => Promise<ResultType>),
    options: CacheaOptions & { args?: any[] } = {},
): usePromiseOutput<ResultType> {
    const [execute, { result, error, loading=true }] = useLazyPromise(
        makeCallback(promise),
        options,
    )
    useEffect(() => {
        execute(...(options.args || []))
    }, options.args || [])
    return { result, error, loading: loading ?? true }
}
