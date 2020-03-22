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

export const clearMemoryCache = ({ promiseId }) => {
    const hash = hashArg({ promiseId })
    delete memoryCache[hash]
    delete win[reactExtraHooksCacheKey][hash]
}

export function getFromCache({ promiseId, args }) {
    const hash = hashArg({ promiseId })
    const secondHash = hashArg({ args })
    const hit = memoryCache[hash]?.[secondHash]
    // console.log(
    //     `getting from cache ${hit} from promiseId '${promiseId}' and args '${args}'`,
    // )
    return hit
}

export function hashArg(arg) {
    return JSON.stringify(sortObject(arg))
}

export interface CacheaOptions {
    cache?: boolean
    promiseId?: string // defaults to the name of the function passed tp useLazyPromise
    cacheExpirationSeconds?: number
    cacheSize?: number
    shallow?: boolean
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
    const hash = hashArg({ promiseId })
    memoryCache[hash] = memoryCache[hash] || {}
    const secondHash = hashArg({ args })
    memoryCache[hash][secondHash] = result
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
