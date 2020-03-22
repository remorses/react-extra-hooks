import { useLazyPromise, sleep, usePromise } from '../src'
import { renderHook, act } from '@testing-library/react-hooks'
import { expect } from 'chai'

const RESULT = { xxx: true }

describe('usePromise', () => {
    it('should resolve with data after first render', async () => {
        const { result, rerender, waitForNextUpdate } = renderHook(({}) => {
            return usePromise(
                async () => {
                    await sleep(10)
                    return RESULT
                },
                {
                    promiseId: '3',
                },
            )
        })
        rerender()
        expect(result.current.loading).to.be.eq(true)
        expect(result.current.error).to.be.eq(undefined)
        expect(result.current.result).to.be.eq(undefined)
        await waitForNextUpdate()
        expect(result.current.loading).to.be.eq(false)
        expect(result.current.error).to.be.eq(undefined)
        expect(result.current.result).to.be.eq(RESULT)  
    })
    it('should cache the result', async () => {
        const { result, rerender, waitForNextUpdate } = renderHook(({}) => {
            return usePromise(
                async () => {
                    await sleep(10)
                    return RESULT
                },
                {
                    cache: true,
                    promiseId: '3',
                },
            )
        })
        rerender()
        expect(result.current.loading).to.be.eq(true)
        expect(result.current.error).to.be.eq(undefined)
        expect(result.current.result).to.be.eq(undefined)
        await waitForNextUpdate()
        expect(result.current.loading).to.be.eq(false)
        expect(result.current.error).to.be.eq(undefined)
        expect(result.current.result).to.be.eq(RESULT) 
        rerender()
        expect(result.current.loading).to.be.eq(false)
        expect(result.current.error).to.be.eq(undefined)
        expect(result.current.result).to.be.eq(RESULT) 
    })
    
})
