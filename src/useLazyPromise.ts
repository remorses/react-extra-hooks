import { useCallback, useReducer, useEffect, useMemo } from 'react'
import {
    updateCache,
    CacheOptions,
    clearMemoryCache,
    getFromCache,
} from './cache'

const states = {
    pending: 'pending',
    rejected: 'rejected',
    resolved: 'resolved',
}

const DEFAULT_CACHE_EXPIRATION = 300
const DEFAULT_CACHE_SIZE = 500

function reducer(state, action) {
    switch (action.type) {
        case states.pending:
            return {
                error: undefined,
                result: state.result,
                loading: true,
            }

        case states.resolved:
            return {
                error: undefined,
                result: action.payload,
                loading: false,
            }

        case states.rejected:
            return {
                error: action.payload,
                result: undefined,
                loading: false,
            }

        /* istanbul ignore next */
        default:
            return state
    }
}

export type useLazyPromiseOutput<Arguments extends any[], ResultType> = [
    (...args: Arguments) => MaybeCachedPromise<ResultType>,
    {
        result?: ResultType
        loading: boolean
        error?: Error
    },
    () => void,
]

interface MaybeCachedPromise<T = any> extends Promise<T> {
    cached?: boolean
}

function setCacheDefaults(cacheOptions: CacheOptions, defaultPromiseId) {
    cacheOptions.promiseId = cacheOptions.promiseId || defaultPromiseId
    cacheOptions.cacheExpirationSeconds =
        cacheOptions.cacheExpirationSeconds || DEFAULT_CACHE_EXPIRATION
    cacheOptions.cacheSize = cacheOptions.cacheSize || DEFAULT_CACHE_SIZE
    return cacheOptions
}

export function useLazyPromise<Arguments extends any[], ResultType = any>(
    promise: (...x: Arguments) => Promise<ResultType> | null | undefined,
    cacheOptions = {} as CacheOptions,
): useLazyPromiseOutput<Arguments, ResultType> {
    cacheOptions = setCacheDefaults(cacheOptions, promise?.name)
    const [{ error, result, loading }, dispatch] = useReducer(reducer, {
        error: undefined,
        result: undefined,
        state: states.pending,
    })
    useEffect(() => {
        if (promise && cacheOptions.cache && !cacheOptions.promiseId) {
            console.error(
                'ERROR react-extra-hooks useLazyPromise should receive either a promiseId or a name function!\ncache will not be hashed correctly',
            )
            console.log('for function ' + promise.toString())
        }
    }, [cacheOptions.promiseId, cacheOptions.cache])
    const execute = useMemo(
        () => makeExecute({ cacheOptions, promise, dispatch }),
        [!promise, dispatch, result],
    )
    const invalidate = () =>
        clearMemoryCache({
            promiseId: cacheOptions.promiseId,
        })
    return [execute, { result, error, loading }, invalidate]
}

function makeExecute({
    promise,
    cacheOptions,
    dispatch,
}: {
    promise: Function
    cacheOptions: CacheOptions
    dispatch: Function
}) {
    return (...args) => {
        if (!promise) {
            throw new Error(
                `promise is null or undefined, cannot execute with args '${args}'`,
            )
        }

        if (cacheOptions.cache) {
            let hit = getFromCache({ promiseId: cacheOptions.promiseId, args })
            if (hit) {
                // console.log('cache hit for ' + JSON.stringify(hit))
                dispatch({
                    payload: hit,
                    type: states.resolved,
                })
                const p: MaybeCachedPromise = Promise.resolve(hit)
                p.cached = true
                return p
            }
        }
        dispatch({ type: states.pending })
        return promise(...args)
            .then((result) => {
                if (cacheOptions.cache) {
                    updateCache({
                        promiseId: cacheOptions.promiseId,
                        args,
                        cacheExpirationSeconds:
                            cacheOptions.cacheExpirationSeconds,
                        cacheSize: cacheOptions.cacheSize,
                        result,
                    })
                }
                dispatch({
                    payload: result,
                    type: states.resolved,
                })
                return result
            })
            .catch((error) => {
                dispatch({
                    payload: error,
                    type: states.rejected,
                })
                throw error
            })
    }
}
