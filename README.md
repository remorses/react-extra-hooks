# react-extra-hooks

`yarn add react-extra-hooks`

# hooks

-   usePromise
-   useLazyPromise
-   useDebounce
-   useLocalStorage

## Examples

usePromise

```tsx
import { usePromise } from 'react-extra-hooks'
import React from 'react'

const sleep = (t) => new Promise((res) => setTimeout(res, t))

async function pp() {
    await sleep(400)
    return {
        x: 9,
    }
}

const App = () => {
    const { result, loading, error } = usePromise(pp)
    if (loading) {
        return <>loading</>
    }
    return <div>{result?.x}</div>
}
```

useLazyPromise

```tsx
import { useLazyPromise } from 'react-extra-hooks'
import React from 'react'

const sleep = (t) => new Promise((res) => setTimeout(res, t))

async function effect() {
    await sleep(400)
    alert('executed')
    return {
        x: 9,
    }
}

const UseLazyPromiseExample = () => {
    const [execute, { result, loading, error }] = useLazyPromise(pp)
    if (loading) {
        return <>loading</>
    }
    if (result) {
        return <div>{result?.x}</div>
    }
    return (
        <div>
            <button onClick={execute}>execute promise</button>
        </div>
    )
}
```

**useLazyPromise with in memory cache**, supports the options `{promiseId: string, cacheSize: numer, cacheExpirationSeconds: number}`.
Every useLazyPromise cached the result based on

-   the argument passed to the `execute` function
-   the `promiseId` option (defaults to the name of the promise)

The cache is invalidated when

-   the page is refreshed
-   the cacheExpirationSeconds (defaults to 120 secods) times out
-   the cache overflows his size (that defaults to 50 elements), the first cached value is discarded

```tsx
import { useLazyPromise } from 'react-extra-hooks'
import React from 'react'

const sleep = (t) => new Promise((res) => setTimeout(res, t))

async function effect(n: string) {
    await sleep(1000)
    // throw Error('xxx')
    alert('executed with n=' + n)
    return {
        x: n,
    }
}

const UseLazyPromiseExample = () => {
    const [arg, set] = useState('')
    const [execute, { result, loading, error }] = useLazyPromise(effect, {
        cache: true,
        cacheExpirationSeconds: 300,
    })
    if (loading) {
        return <>loading</>
    }
    if (error) {
        return <div>{error.message}</div>
    }

    return (
        <div>
            <input onChange={(e) => set(e.target.value)} value={arg} />
            <button onClick={() => execute(arg)}>execute promise</button>
            <code>
                <div>{result?.x}</div>
            </code>
        </div>
    )
}
```

## Usage with pagination

```tsx
import { useLazyPromise } from 'react-extra-hooks'
import React from 'react'

const sleep = (t) => new Promise((res) => setTimeout(res, t))

const PaginationExample = () => {
    const [page, setPage] = useState(0)

    async function loadData(page) {
        const items = await fetchSomething({ page })
        return [...result, ...items]
    }

    const { result = [], loading, error } = usePromise(loadData, {
        args: [page],
    })

    if (!result.length) {
        return <>loading</>
    }

    if (error) {
        return <div>{error.message}</div>
    }

    return (
        <div>
            <span>page: {page}</span>
            <code>
                <div>
                    {result.map((x) => (
                        <div>{x}</div>
                    ))}
                    <button
                        disabled={loading}
                        onClick={() => setPage((x) => x + 1)}
                    >
                        {loading ? 'loading' : 'more'}
                    </button>
                </div>
            </code>
        </div>
    )
}

async function fetchSomething({ page }) {
    await sleep(1000)
    return Array(10)
        .fill(page + 10)
        .map((x, i) => x + i)
        .map((x) => x.toString())
}
```
