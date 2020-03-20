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
    await sleep(600)
    return {
        x: f,
    }
}
const makeAsyncIdentity = (t) => async (f) => {
    console.log(f)
    await sleep(t)
    return f
}

const UsePromiseExample = () => {
    const [num, setNum] = useState(0)
    useEffect(() => {
        const id = setInterval(() => setNum((x) => x + 1), 2000)
        return () => clearInterval(id)
    }, [])
    const { result: r2, loading: r2loading, error } = usePromise(gg, {
        cache: true,
        args: [num],
    })
    return (
        <div>
            <h1>{r2loading ? 'loading' : r2?.x}</h1>
        </div>
    )
}

const UseDelayedExample = () => {
    const query = useDelayedResource()
    const { result: r2, loading: r2loading, error } = usePromise(
        query ? makeAsyncIdentity(3000) : null,
        {
            cache: true,
            args: [query],
        },
    )
    return (
        <div>
            <h4>{r2loading ? 'loading' : r2}</h4>
        </div>
    )
}

async function effect(n: string) {
    await sleep(1000)
    // throw Error('xxx')
    console.log('executed with n=' + n)
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

const PollingExample = () => {
    const { result, loading, error } = usePromise(
        async () => {
            await sleep(1000)
            return 'polled'
        },
        {
            cache: true,
            polling: {
                interval: 2000,
                then: console.log,
            },
        },
    )
    if (loading) {
        return <>loading</>
    }
    if (error) {
        return <div>{error.message}</div>
    }

    return (
        <div>
            <code>
                <div>{result}</div>
            </code>
        </div>
    )
}

function useDelayedResource() {
    const [res, setRes] = useState(null)
    useEffect(() => {
        setTimeout(() => {
            setRes('ready🥳')
        }, 700)
    }, [])
    return res
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
                        <div key={x}>{x}</div>
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
            <Cornice>
                <UsePromiseExample />
            </Cornice>
            <Cornice>
                <UseLazyPromiseExample />
            </Cornice>
            <Cornice>
                <PaginationExample />
            </Cornice>
            <Cornice>
                <PollingExample />
            </Cornice>
            <Cornice>
                <UseDelayedExample />
            </Cornice>
        </>
    )
}

const Cornice = (props) => {
    return (
        <div style={{ padding: '30px', border: '1px solid red' }} {...props} />
    )
}

DOM.render(<App />, document.getElementById('root'))
