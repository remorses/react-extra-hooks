import { strict as assert } from 'assert'
import DOM from 'react-dom'
import { usePromise } from '../src'
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

DOM.render(<App />, document.getElementById('root'))
