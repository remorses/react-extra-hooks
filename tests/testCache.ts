import { getFromCache, updateCache, clearMemoryCache } from '../src/cache'
import { expect } from 'chai'
const cacheExpirationSeconds = 99
const cacheSize = 99
const RESULT = 'zzz'

describe('cache', () => {
    it('updateCache works', () => {
        const promiseId = 'xxx'
        const args = ['x']
        var res = getFromCache({
            args,
            promiseId,
        })
        expect(res).to.be.eq(undefined)
        updateCache({
            promiseId,
            result: RESULT,
            args,
            cacheExpirationSeconds,
            cacheSize,
        })
        var res = getFromCache({
            args,
            promiseId,
        })
        expect(res).to.be.eq(RESULT)
    })
    it('clearMemoryCache works', () => {
        const promiseId = 'zzz'
        const args = ['x']
        var res = getFromCache({
            args,
            promiseId,
        })
        expect(res).to.be.eq(undefined)
        updateCache({
            promiseId,
            result: RESULT,
            args,
            cacheExpirationSeconds,
            cacheSize,
        })
        clearMemoryCache({
            promiseId,
        })
        var res = getFromCache({
            args,
            promiseId,
        })
        expect(res).to.be.eq(undefined)
    })
    it('cache remains intact after clearMemoryCache', () => {
        const promiseId = 'zzz'
        const args = ['x']
        const promiseId2 = 'kkk'
        var res = getFromCache({
            args,
            promiseId,
        })
        expect(res).to.be.eq(undefined)
        updateCache({
            promiseId,
            result: RESULT,
            args,
            cacheExpirationSeconds,
            cacheSize,
        })
        updateCache({
            promiseId: promiseId2,
            result: RESULT,
            args,
            cacheExpirationSeconds,
            cacheSize,
        })
        clearMemoryCache({
            promiseId,
        })
        var res = getFromCache({
            args,
            promiseId: promiseId2,
        })
        expect(res).to.be.eq(RESULT)
    })
})
