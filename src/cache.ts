export let memoryCache = { lastHash: '' }

export function updateCache({
    hash,
    result,
    cacheSize,
    cacheExpirationSeconds,
}) {
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
