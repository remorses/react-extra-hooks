# react-extra-hooks

`yarn add react-extra-hooks`

# hooks

-   usePromise
-   useDebounce
-   useLocalStorage

## Examples

usePromise

```tsx
import { strict as assert } from 'assert'
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
