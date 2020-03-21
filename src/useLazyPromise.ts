import { useCallback, useReducer, useEffect } from 'react'
import {
    updateCache,
    CacheaOptions,
    clearMemoryCache,
    getFromCache,
} from './cache'

const states = {
    pending: 'pending',
    rejected: 'rejected',
    resolved: 'resolved',
}

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
    (...args: Arguments) => Promise<ResultType>,
    {
        result?: ResultType
        loading: boolean
        error?: Error
    },
    () => void,
]

export function useLazyPromise<Arguments extends any[], ResultType = any>(
    promise: (...x: Arguments) => Promise<ResultType> | null | undefined,
    cacheOptions = {} as CacheaOptions,
): useLazyPromiseOutput<Arguments, ResultType> {
    cacheOptions.promiseId = cacheOptions.promiseId || promise?.name
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
    const execute = useCallback(
        makeExecute({ cacheOptions, promise, dispatch }),
        [!promise, dispatch, result],
    )
    const invalidate = () =>
        clearMemoryCache({
            promiseId: cacheOptions.promiseId,
        })
    return [execute, { result, error, loading }, invalidate]
}

function makeExecute({ promise, cacheOptions, dispatch }) {
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
                return Promise.resolve(hit)
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
                        cacheSize: cacheOptions.cacheExpirationSeconds,
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
