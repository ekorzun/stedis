import { useEffect, useState, useRef, useCallback, useMemo} from 'react'
import {get, on} from './stedis'

export const useGetValue = uri => {
  const [, setValue] = useState(1)
  const watcher = useRef()

  useEffect(() => {
    watcher.current && watcher.current()
    setValue(p => ++p)
    watcher.current = on(uri, 'change', setValue)
  }, [uri])

  useEffect(() => {
    return watcher.current
  }, [])
  
  return get(uri)
}


export const useSetValue = uri => {
  const setValue = useMemo(v => {
    return set(uri, v)
  }, [uri])
  return setValue
}

export const useValue = uri => {
  const value = useGetValue(uri)
  const setValue = useCallback(v => {
    return set(uri, v)
  }, [uri])
  return [value, setValue]
}