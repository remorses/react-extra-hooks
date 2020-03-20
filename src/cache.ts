import sortObject from 'sort-keys-recursive'

export const reactExtraHooksCacheKey = 'reactExtraHooksCache'

function getWindow() {
    if (typeof window === 'undefined') {
        return {}
    }
    return window
}

const win = getWindow()
win[reactExtraHooksCacheKey] = win[reactExtraHooksCacheKey] || {}
let memoryCache = win[reactExtraHooksCacheKey]

export const clearMemoryCache = () => {
    memoryCache = {}
    win[reactExtraHooksCacheKey] = {}
}

export function getFromCache({ promiseId, args }) {
    return memoryCache[
        hashArg({
            promiseId: promiseId,
            args: args,
        })
    ]
}

function hashArg(arg) {
    return JSON.stringify(sortObject(arg))
}

export interface CacheaOptions {
    cache?: boolean
    promiseId?: string // defaults to the name of the function passed tp useLazyPromise
    cacheExpirationSeconds?: number
    cacheSize?: number
}

export function updateCache({
    promiseId,
    args,
    result,
    cacheSize,
    cacheExpirationSeconds,
}) {
    if (!result) {
        return
    }
    const hash = hashArg({ promiseId, args })
    memoryCache[hash] = result
    if (
        memoryCache.lastHash &&
        Object.keys(memoryCache).length + 1 > cacheSize
    ) {
        delete memoryCache[memoryCache.lastHash]
    }
    memoryCache.lastHash = hash
    setTimeout(
        (hash) => {
            delete memoryCache[hash]
        },
        cacheExpirationSeconds * 1000,
        hash,
    )
}
