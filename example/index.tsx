import { strict as assert } from 'assert'
import DOM from 'react-dom'
import { usePromise, useLazyPromise } from '../src'
import React, { useState, useEffect } from 'react'

const sleep = (t) => new Promise((res) => setTimeout(res, t))

async function pp() {
    await sleep(400)
    return {
        x: 6,
    }
}
async function gg(f) {
    console.log(f)
    await sleep(100)
    return {
        x: f,
    }
}


const UsePromiseExample = () => {
    const [num, setNum] = useState(0)
    useEffect(() => {
        setInterval(() => setNum(x => x+1), 3000)
    }, [])
    const { result, loading, error } = usePromise(gg, {
        cache: true,
        args: [num],
    })
    const { result: r2 } = usePromise((f) => gg(f), { cache: true, args: ['2'] })
    if (loading) {
        return <>loading</>
    }
    return (
        <div>
            <h1>{r2?.x}</h1>
            <h1>{result?.x}</h1>
        </div>
    )
}

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

const App = () => {
    return (
        <>
            <UsePromiseExample />
            <UseLazyPromiseExample />
        </>
    )
}

DOM.render(<App />, document.getElementById('root'))
