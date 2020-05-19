import { strict as assert } from 'assert'
import DOM from 'react-dom'
import {
    usePromise,
    useLazyPromise,
    useObservable,
    useLazyObservable,
} from '../src'
import React, { useState, useEffect } from 'react'
import { interval } from 'rxjs'
import { map } from 'rxjs/operators'

const sleep = (t) => new Promise((res) => setTimeout(res, t))

async function pp() {
    await sleep(400)
    return {
        x: 6,
    }
}
async function gg(f) {
    await sleep(600)
    return {
        x: f,
    }
}
const makeAsyncIdentity = (t) => async (f) => {
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

const UseObservableExample = () => {
    const { result, loading, error } = useObservable(() =>
        interval(1000).pipe(
            map((i) => {
                if (i == 2) {
                    throw new Error("oh my god didn't expect 2")
                }
                return i
            }),
        ),
    )
    return (
        <div>
            <h1>{loading ? 'loading' : JSON.stringify(result)}</h1>
            {error && <h1>{error.message}</h1>}
        </div>
    )
}

const UseLazyObservableExample = () => {
    const [execute, { result, loading, error }] = useLazyObservable(
        () => interval(1000).pipe(map((i) => i + 1)),
        {
            reducer: (acc = [], x) => [...acc, x],
        },
    )
    return (
        <div>
            <button onClick={() => execute()}>start</button>
            <h1>{loading ? 'loading' : JSON.stringify(result)}</h1>
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

let count = 0

const PollingExample = () => {
    const poller = async (x) => {
        // await sleep(1000)
        if (!x) {
            alert('x is null')
        }
        count += 1
        return 'polled ' + count
    }
    const x = useDelayedResource()
    const { result, loading, error } = usePromise(x && poller, {
        cache: true,
        args: [x],
        polling: {
            interval: 2000,
            then: ({ result, stop, previous }) => {
                console.log({ result, previous })
                if (count === 3) {
                    stop()
                }
            },
        },
    })
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
        cacheExpirationSeconds: 3000000,
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
        .fill(page * 10)
        .map((x, i) => x + i)
        .map((x) => x.toString())
}

const App = () => {
    return (
        <>
            <Cornice name='useObservable'>
                <UseObservableExample />
            </Cornice>
            <Cornice name='useLazyObservable'>
                <UseLazyObservableExample />
            </Cornice>
            <Cornice name='usePromise'>
                <UsePromiseExample />
            </Cornice>
            <Cornice name='useLazyPromise'>
                <UseLazyPromiseExample />
            </Cornice>
            <Cornice name='use polling'>
                <PollingExample />
            </Cornice>
            <Cornice name='using null as promise at first'>
                <UseDelayedExample />
            </Cornice>
            <Cornice name='pagination'>
                <PaginationExample />
            </Cornice>
        </>
    )
}

const Cornice = ({ name, children }) => {
    return (
        <div style={{ padding: '30px', border: '1px solid red' }}>
            <h4>{name}</h4>
            {children}
        </div>
    )
}

DOM.render(<App />, document.getElementById('root'))
