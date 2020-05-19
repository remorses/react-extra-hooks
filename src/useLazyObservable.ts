import { useCallback, useReducer, useEffect, useMemo } from 'react'

export interface Observer<T> {
    next?: (value: T) => void
    error?: (error: Error) => void
    complete?: () => void
}

export interface Observable<T> {
    subscribe(
        observer: Observer<T>,
    ): {
        unsubscribe: () => void
    }
}

const states = {
    pending: 'pending',
    rejected: 'rejected',
    completed: 'completed',
    next: 'next',
}

const DEFAULT_CACHE_EXPIRATION = 300
const DEFAULT_CACHE_SIZE = 500

const makeReducer = (reducer) => (state, action) => {
    reducer = reducer || ((_, x) => x)
    switch (action.type) {
        case states.pending:
            return {
                error: undefined,
                result: state.result,
                complete: false,
                loading: true,
            }

        case states.completed:
            return {
                error: undefined,
                complete: true,
                loading: false,
            }
        case states.next:
            return {
                error: undefined,
                result: reducer(state.result, action.payload),
                loading: false,
            }

        case states.rejected:
            return {
                error: action.payload,
                result: undefined,
                complete: true,
                loading: false,
            }

        /* istanbul ignore next */
        default:
            return state
    }
}

export type useLazyObservableOutput<Arguments extends any[], ReducedType> = [
    (
        ...args: Arguments
    ) => {
        unsubscribe: () => void
    },
    UseObservableOutput<ReducedType>,
]

export interface UseObservableOutput<ResultType> {
    result?: ResultType
    loading: boolean
    complete: boolean
    error?: Error
}

export type ObservableCreator<Arguments extends any[], ResultType> = (
    ...x: Arguments
) => Observable<ResultType> | null | undefined

interface UseLazyObservableOptions<ResultType, ReducedType> {
    reducer?: (ReducedType, x: ResultType) => ReducedType
}

export function useLazyObservable<
    Arguments extends any[],
    ResultType = any,
    ReducedType = any
>(
    observableCreator: ObservableCreator<Arguments, ResultType>,
    options: UseLazyObservableOptions<ResultType, ReducedType> = {},
): useLazyObservableOutput<Arguments, ResultType> {
    const reducer = useMemo(() => makeReducer(options.reducer), [])
    const [{ error, result, loading, complete }, dispatch] = useReducer(
        reducer,
        {
            error: undefined,
            result: undefined,
            complete: false,
            state: states.pending,
        },
    )

    const execute = useMemo(
        () => makeExecute({ observableCreator, dispatch }),
        [!observableCreator, dispatch, result],
    )
    return [execute, { result, error, loading, complete }]
}

function makeExecute({
    observableCreator,
    dispatch,
}: {
    observableCreator: ObservableCreator<any, any>
    dispatch: Function
}) {
    return (...args) => {
        if (!observableCreator) {
            throw new Error(
                `observable is null or undefined, cannot execute with args '${args}'`,
            )
        }

        dispatch({ type: states.pending })
        return observableCreator(...args).subscribe({
            next: (result) => {
                dispatch({
                    payload: result,
                    type: states.next,
                })
                return result
            },
            error: (error) => {
                dispatch({
                    payload: error,
                    type: states.rejected,
                })
            },
            complete: () => {
                dispatch({
                    type: states.completed,
                })
            },
        })
    }
}
