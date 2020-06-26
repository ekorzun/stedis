import React, { useCallback, useState, useEffect } from 'react'
import { useGetValue, useValue } from './src/hooks'
import { set, on } from './src/stedis'

global.calls = 0

on(`/*`, e => {
  global.calls++
})

for (let i = 0; ++i < 1000;) {
  on(`/data`, e => {
    set(`/stats/${i}`, {
      value: ((
        get(`/stats/${i}`) || {}
      ).value || 0) + 1
    })
  })
}



set(`/data/ts`, {value: +new Date})
set(`/data/coords`, {x: 0, y: 0})

export default () => {
  const [id, setId] = useState(1)
  const v = useGetValue(`/raw/${id}`)
  const c = useGetValue(`/raw`)

  const [ts, setTs] = useValue(`/data/ts`)
  const [coords, setCoords] = useValue(`/data/coords`)

  useEffect(() => {
    const run = () => {
      // setTs({ value: +new Date })
      requestAnimationFrame(run)
    }
    run()
  }, [])

  // useEffect(() => {
  //   document.addEventListener('mousemove', e => {
  //     setCoords({x: e.clientX, y: e.clientY})
  //   })
  // }, [])

  const exec = useCallback(max => {
    console.time(max)
    for (let i = -1; ++i < max;) {
      setTimeout(() => set(`/data/${i}`, { i }))
    }
    console.timeEnd(max)
  }, [])

  return (
    <div>


      <input
        type='number'
        onChange={e => setId(e.target.value)}
        value={id}
      />

      <button onClick={e => { exec(100) }}>100</button>
      <button onClick={e => { exec(1000) }}>1000</button>
      <button onClick={e => { exec(5000) }}>5000</button>
      <button onClick={e => { exec(25000) }}>25000</button>
      <button onClick={e => { exec(100000) }}>100000</button>


      <h4>Current: /raw/{id}</h4>
      <pre>{JSON.stringify(v)}</pre>

      <h4>Collection: /raw</h4>
      <pre>{JSON.stringify(c)}</pre>

      <h6>ts: {ts.value}</h6>
      <h6>ts: {JSON.stringify(coords)}</h6>
    </div>
  )
}