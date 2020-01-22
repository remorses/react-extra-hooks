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

type useLazyPromiseOutput<Argument, ResultType> = [
    (arg?: Argument) => Promise<ResultType>,
    {
        result?: ResultType
        loading: boolean
        error?: Error
    }
]

export function useLazyPromise<Argument, ResultType = any>(
    promise: (x?: Argument) => Promise<ResultType>
): useLazyPromiseOutput<Argument, ResultType> {
    const [{ error, result, loading }, dispatch] = useReducer(reducer, {
        error: undefined,
        result: undefined,
        state: states.pending
    })
    let canceled = false
    const execute = useCallback(
        (arg) => {
            dispatch({ type: states.pending })
            return promise(arg)
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
        },
        [promise, dispatch, canceled]
    )

    return [execute, { result, error, loading }]
}
