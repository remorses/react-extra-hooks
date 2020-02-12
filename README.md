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

_useLazyPromise with in memory cache_, supports the options `{promiseId: string, cacheSize: numer, cacheExpirationSeconds: number}`, use promiseId in case you have multiple calls of usePromise that get the same input argument.
The cache is invalidated as soon as you refresh the page.

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
