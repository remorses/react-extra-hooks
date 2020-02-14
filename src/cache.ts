import sortObject from 'sort-keys-recursive'

export const reactExtraHooksCacheKey = 'reactExtraHooksCache'

window[reactExtraHooksCacheKey] = window[reactExtraHooksCacheKey] || {}
export let memoryCache = window[reactExtraHooksCacheKey]

export function hashArg(arg) {
    return JSON.stringify(sortObject(arg))
}

export function updateCache({
    hash,
    result,
    cacheSize,
    cacheExpirationSeconds,
}) {
    if (!result) {
        return
    }
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
        hash
    )
}
