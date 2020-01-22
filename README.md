# react-extra-hooks

`yarn add react-extra-hooks`

# hooks

-   usePromise
-   useAsync
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
        x: 9
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

useAsync

```tsx
import { useAsync } from 'react-extra-hooks'
import React from 'react'

const sleep = (t) => new Promise((res) => setTimeout(res, t))

async function effect() {
    await sleep(400)
    alert('executed')
    return {
        x: 9
    }
}

const UseAsyncExample = () => {
    const { execute, result, loading, error } = usePromise(pp)
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
