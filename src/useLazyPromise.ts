import { useCallback, useReducer } from 'react'
import { hashArg, memoryCache, updateCache, CacheaOptions } from './cache'

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
]

export function useLazyPromise<Arguments extends any[], ResultType = any>(
    promise: (...x: Arguments) => Promise<ResultType>,
    {
        cache = false,
        promiseId,
        cacheExpirationSeconds = 120,
        cacheSize = 50,
    } = {} as CacheaOptions,
): useLazyPromiseOutput<Arguments, ResultType> {
    promiseId = promiseId ?? promise.name
    const [{ error, result, loading }, dispatch] = useReducer(reducer, {
        error: undefined,
        result: undefined,
        state: states.pending,
    })
    const execute = useCallback(
        (...args: Arguments) => {
            const hash = hashArg({ promiseId, args })
            if (cache) {
                let hit = memoryCache[hash]
                if (hit) {
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
                    if (cache) {
                        updateCache({
                            hash,
                            cacheExpirationSeconds,
                            cacheSize,
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
                    // throw error
                })
        },
        [promise, dispatch],
    )

    return [execute, { result, error, loading }]
}
