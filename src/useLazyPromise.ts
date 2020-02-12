import { useEffect, useReducer, useCallback } from 'react'

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

let memoryCache = { lastHash: '' }

function updateCache({ hash, result, cacheSize, cacheExpirationSeconds }) {
    memoryCache[hash] = result
    if (
        memoryCache.lastHash &&
        Object.keys(memoryCache).length + 1 > cacheSize
    ) {
        delete memoryCache[memoryCache.lastHash]
    }
    memoryCache.lastHash = hash
    setTimeout(
        (hash) => {
            delete memoryCache[hash]
        },
        cacheExpirationSeconds * 1000,
        hash
    )
}

export function useLazyPromise<Argument, ResultType = any>(
    promise: (x?: Argument) => Promise<ResultType>,
    {
        cache = false,
        promiseId = null,
        cacheExpirationSeconds = 60,
        cacheSize = 10,
    } = {}
): useLazyPromiseOutput<Argument, ResultType> {
    const [{ error, result, loading }, dispatch] = useReducer(reducer, {
        error: undefined,
        result: undefined,
        state: states.pending,
    })
    const execute = useCallback(
        (arg) => {
            const hash = JSON.stringify({ promiseId, arg })
            if (cache) {
                let hit = memoryCache[hash]
                if (hit) {
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
