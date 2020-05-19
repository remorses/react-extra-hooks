import { useEffect, useState, useRef } from 'react'
import { useLazyObservable, UseObservableOutput } from './useLazyObservable'
import { useRenderNumber, useDeepEffect } from '.'
import { hashArg } from './cache'
import { ObservableCreator } from './useLazyObservable'

export interface UseObservableOptions<ResultType> {
    args?: any[]
    handler?: (x: ResultType) => ResultType
}

export function useObservable<ResultType = any>(
    observableCreator: ObservableCreator<any, ResultType>,
    options: UseObservableOptions<ResultType> = {},
): UseObservableOutput<ResultType> {
    // options defaults
    options.args = options?.args || []

    const [
        execute,
        { result, error, loading = true, complete },
    ] = useLazyObservable(observableCreator, options)

    // if the passed obs is null do nothing
    const isObservableNull = !observableCreator
    const argsDeps = [hashArg(options.args)]

    useEffect(() => {
        if (isObservableNull) {
            return
        }
        return execute(...options.args).unsubscribe
    }, [isObservableNull, ...argsDeps])

    return { result, error, loading, complete }
}

