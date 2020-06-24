import { useEffect, useState, useRef} from 'react'
import {get, on} from './inbox'

export const useValue = uri => {
  const [value, setValue] = useState(get(uri))
  const watcher = useRef()

  useEffect(() => {
    watcher.current && watcher.current()
    setValue(get(uri))
    watcher.current = on(uri, 'change', setValue)
  }, [uri])

  useEffect(() => {
    return watcher.current
  }, [])
  
  return value
}