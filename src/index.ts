import { useEffect, useState, useRef } from 'react'
import isEqual from 'react-fast-compare'
export { usePromise, usePromiseOutput } from './usePromise'
export { useLazyPromise, useLazyPromiseOutput } from './useLazyPromise'
export { useObservable } from './useObservable'
export { useLazyObservable } from './useLazyObservable'
export { useDebounce } from './useDebounce'

export const sleep = (t) => new Promise((res) => setTimeout(res, t))

export function useRunWhenDepsReady({
    func,
    deps = [],
    undefinedIs = undefined,
}) {
    useEffect(() => {
        const falsy = deps.filter((x) => x === undefinedIs)
        if (falsy.length) {
            console.log(
                `${func?.name} still waiting for ${falsy.length} dependencies, ${falsy}`,
            )
            return
        }
        func(...deps)
    }, deps)
}

export function useInterval({ time = 3000, func, args = [] as any[] }) {
    useEffect(() => {
        let id = setInterval(
            (args) => {
                func(...args)
            },
            time,
            args,
        )
        return () => clearInterval(id)
    }, args)
}

export function useRenderNumber() {
    const ref = useRef(0)
    useEffect(() => {
        ref.current += 1
    })
    return ref
}

export const usePrevious = (value) => {
    const ref = useRef()
    useEffect(() => {
        ref.current = value
    })
    return ref.current
}

export function useDeepEffect(func, deps) {
    const myPreviousState = usePrevious(deps)
    useEffect(() => {
        if (!myPreviousState) {
            func()
        }
        if (!isEqual(myPreviousState, deps)) {
            func()
        }
    }, deps)
}
