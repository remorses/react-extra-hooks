import { useEffect, useReducer } from 'react'

function resolvePromise(promise): Promise<any> {
    if (typeof promise === 'function') {
        return promise()
    }

    return promise
}

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

export interface usePromiseOutput<ResultType> {
    result?: ResultType
    loading: boolean
    error?: Error
}

export function usePromise<ResultType=any>(
    promise: Promise<ResultType> | (() => Promise<ResultType>),
    inputs: any[] = []
): usePromiseOutput<ResultType> {
    const [{ error, result, loading }, dispatch] = useReducer(reducer, {
        error: undefined,
        result: undefined,
        state: states.pending
    })

    useEffect(() => {
        promise = resolvePromise(promise)

        if (!promise) {
            return
        }

        let canceled = false

        dispatch({ type: states.pending })

        promise.then(
            (result) =>
                !canceled &&
                dispatch({
                    payload: result,
                    type: states.resolved
                }),
            (error) =>
                !canceled &&
                dispatch({
                    payload: error,
                    type: states.rejected
                })
        )

        return () => {
            canceled = true
        }
    }, inputs)

    return { result, error, loading }
}



