import { useCallback, useReducer } from 'react'
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
            if (!promise) {
                throw new Error(
                    `promise is null or undefined, cannot execute with args '${args}'`,
                )
            }

            if (cache) {
                let hit = getFromCache({ promiseId, args })
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
                    if (cache) {
                        updateCache({
                            promiseId,
                            args,
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
        [!promise, dispatch],
    )
    const invalidate = clearMemoryCache // TODO clear cache only for this promise id
    return [execute, { result, error, loading }, invalidate]
}
