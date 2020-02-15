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
                result: undefined,
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

export type useLazyPromiseOutput<Argument, ResultType> = [
    (arg?: Argument) => Promise<ResultType>,
    {
        result?: ResultType
        loading: boolean
        error?: Error
    }
]

export function useLazyPromise<Argument, ResultType = any>(
    promise: (x?: Argument) => Promise<ResultType>,
    {
        cache = false,
        promiseId,
        cacheExpirationSeconds = 120,
        cacheSize = 50,
    } = {} as CacheaOptions
): useLazyPromiseOutput<Argument, ResultType> {
    const [{ error, result, loading }, dispatch] = useReducer(reducer, {
        error: undefined,
        result: undefined,
        state: states.pending,
    })
    promiseId = promiseId ?? promise.name
    const execute = useCallback(
        (arg) => {
            const hash = hashArg({ promiseId, arg })
            if (cache) {
                let hit = memoryCache[hash]
                if (hit) {
                    dispatch({
                        payload: hit,
                        type: states.resolved,
                    })
                    return hit
                }
            }
            dispatch({ type: states.pending })
            return promise(arg)
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
                    throw error
                })
        },
        [promise, dispatch]
    )

    return [execute, { result, error, loading }]
}
