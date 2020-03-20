import { useEffect, useState, useRef } from 'react'

export { usePromise, usePromiseOutput } from './usePromise'
export { useLazyPromise, useLazyPromiseOutput } from './useLazyPromise'
export { useDebounce } from './useDebounce'
export { useLocalStorage } from './useLoaclStorage'

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
    return ref.current
}
