import { useEffect, useReducer, useCallback } from 'react'

const states = {
    pending: 'pending',
    rejected: 'rejected',
    resolved: 'resolved'
}

function reducer(state, action) {
    switch (action.type) {
        case states.pending:
            return {
                error: undefined,
                result: undefined,
                loading: true
            }

        case states.resolved:
            return {
                error: undefined,
                result: action.payload,
                loading: false
            }

        case states.rejected:
            return {
                error: action.payload,
                result: undefined,
                loading: false
            }

        /* istanbul ignore next */
        default:
            return state
    }
}

export interface useAsyncOutput<ResultType> {
    execute: () => Promise<ResultType>
    result?: ResultType
    loading: boolean
    error?: Error
}

export function useAsync<ResultType = any>(
    promise: () => Promise<ResultType>
): useAsyncOutput<ResultType> {
    const [{ error, result, loading }, dispatch] = useReducer(reducer, {
        error: undefined,
        result: undefined,
        state: states.pending
    })

    let canceled = false

    dispatch({ type: states.pending })
    const execute = useCallback<() => Promise<ResultType>>(() => {
        return promise()
            .then((result) => {
                if (!canceled) {
                    dispatch({
                        payload: result,
                        type: states.resolved
                    })
                }
                return result
            })
            .catch((error) => {
                if (!canceled) {
                    dispatch({
                        payload: error,
                        type: states.rejected
                    })
                }
                throw error
            })
    }, [promise])

    return { result, error, loading, execute }
}
