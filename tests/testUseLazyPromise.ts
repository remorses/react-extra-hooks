import { useLazyPromise, sleep } from '../src'
import { renderHook, act } from '@testing-library/react-hooks'
import { expect } from 'chai'

const RESULT = { xxx: true }

describe('useLazyPromise', () => {
    it('should resolve after execute', async () => {
        const { result, rerender, waitForNextUpdate } = renderHook(({}) => {
            return useLazyPromise(
                async () => {
                    await sleep(10)
                    return RESULT
                },
                {
                    promiseId: '1',
                },
            )
        })
        var [execute, res] = result.current
        expect(res.result).to.be.eq(undefined)
        expect(res.loading).to.be.eq(undefined)
        expect(res.error).to.be.eq(undefined)
        var p = execute()
        expect(p.cached).to.be.eq(undefined)
        await waitForNextUpdate()
        var [execute, res] = result.current
        expect(res.result).to.be.eq(RESULT)
        expect(res.loading).to.be.eq(false)
        expect(res.error).to.be.eq(undefined)
    })
    it('should cache the result', async () => {
        const { result, rerender, waitForNextUpdate, waitForValueToChange } = renderHook(({}) => {
            return useLazyPromise(
                async () => {
                    await sleep(10)
                    return RESULT
                },
                {
                    cache: true,
                    promiseId: '2',
                },
            )
        })
        var [execute, res] = result.current
        act(() => {
            var p = execute()
            expect(p.cached).to.be.eq(undefined)
        })
        await waitForNextUpdate()
        var [execute, res] = result.current
        expect(res.result).to.be.eq(RESULT)
        for (let x of [1, 2, 3, 4]) {
            var [execute, res] = result.current
            var p = execute()
            expect(p.cached).to.be.eq(true)
            // await waitForNextUpdate()
            expect(res.result).to.be.eq(RESULT)
        }
    })
})
