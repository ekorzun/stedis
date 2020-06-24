import React, { useState } from 'react'
import { useValue } from './src/hooks'



export default () => {
  const [id, setId] = useState(1)
  const v = useValue(`/raw/${id}`)
  const c = useValue(`/raw`)
  console.log('render', v)
  return (
    <div>
      <input type='number' onChange={e => setId(e.target.value)} value={id} />

      <h4>Current: /raw/{id}</h4>
      <pre>{JSON.stringify(v)}</pre>

      <h4>Collection: /raw</h4>
      <pre>{JSON.stringify(c)}</pre>
    </div>
  )
}