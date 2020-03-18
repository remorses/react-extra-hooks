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
        setInterval(() => setNum((x) => x + 1), 3000)
    }, [])
    const { result, loading, error } = usePromise(gg, {
        cache: true,
        args: [num],
    })
    const { result: r2 } = usePromise((f) => gg(f), {
        cache: true,
        args: ['2'],
    })
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

function usePaginationData(fetchSomething) {
    const [page, setPage] = useState(0)

    async function loadData(page) {
        const items = await fetchSomething({ page })
        return [...result, ...items]
    }

    const { result = [], loading, error } = usePromise(loadData, {
        cache: true,
        cacheExpirationSeconds: 300,
        args: [page],
    })

    return { result, loading, error, setPage, page }
}

const PaginationExample = () => {
    const { result, error, loading, setPage, page } = usePaginationData(
        fetchSomething,
    )

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
                <div
                    style={{
                        padding: '20px',
                        margin: '20px',
                        border: '1px solid red',
                    }}
                >
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

const App = () => {
    return (
        <>
            {/* <UsePromiseExample /> */}
            {/* <UseLazyPromiseExample /> */}
            <div style={{ padding: '30px', border: '1px solid red' }}>
                <PaginationExample />
            </div>
        </>
    )
}

DOM.render(<App />, document.getElementById('root'))
