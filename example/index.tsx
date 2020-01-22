import { strict as assert } from 'assert'
import DOM from 'react-dom'
import { usePromise, useAsync } from '../src'
import React from 'react'

const sleep = (t) => new Promise((res) => setTimeout(res, t))

async function pp() {
    await sleep(400)
    return {
        x: 6
    }
}

const UsePromiseExample = () => {
    const { result, loading, error } = usePromise(pp)
    if (loading) {
        return <>loading</>
    }
    return <div>{result?.x}</div>
}

async function effect() {
    await sleep(400)
    // throw Error('xxx')
    alert('executed')
    return {
        x: 9
    }
}

const UseAsyncExample = () => {
    const { execute, result, loading, error } = useAsync(effect)
    if (loading) {
        return <>loading</>
    }
    if (result) {
        return <div>{result?.x}</div>
    }
    if (error) {
        return <div>{error.message}</div>
    }
    return (
        <div>
            <button onClick={execute}>execute promise</button>
        </div>
    )
}

const App = () => {
    return (
        <>
            <UsePromiseExample />
            <UseAsyncExample />
        </>
    )
}

DOM.render(<App />, document.getElementById('root'))
