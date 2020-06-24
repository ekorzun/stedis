import {set, get, once, on, watch} from '../src/inbox'

test('vse', () => {


  expect(() => {
    set(`/a`, undefined)
  }).toThrowError(/method/)
  
  expect(() => {
    set(`/a/1/b`, undefined)
  }).toThrowError(/method/)
  
  expect(() => {
    set(`/a/1/b/2/c`, undefined)
  }).toThrowError(/method/)

  expect(get('/a/100')).toEqual(undefined)
  expect(get('/a/100/b/200')).toEqual(undefined)

  // 
  set('/a/1', {a: 1})
  expect(get('/a/1')).toEqual({a:1})
  
  set('/a/1/b/2', {b: 2})
  expect(get('/a/1/b/2')).toEqual({b:2})


  expect(get('/a')).toEqual([{a:1}])
  expect(get('/a/1/b')).toEqual([{b:2}])

})


test('events', () => {
  let shouldBeenCalled = 0
  const handleChange = jest.fn()
  const off = on('/a/1', handleChange)
  set('/a/1', {a: 1})
  expect(handleChange).toHaveBeenCalledTimes(++shouldBeenCalled)
  set('/a/1', { a: 1 })
  expect(handleChange).toHaveBeenCalledTimes(++shouldBeenCalled)
  off()
  set('/a/1', { a: 1 })
  expect(handleChange).toHaveBeenCalledTimes(shouldBeenCalled)
  
  
  once('/a/1', handleChange)
  set('/a/1', { a: 1 })
  expect(handleChange).toHaveBeenCalledTimes(++shouldBeenCalled)

  set('/a/1', { a: 1 })
  expect(handleChange).toHaveBeenCalledTimes(shouldBeenCalled)

  

})

test('watchers', () => {
  let shouldBeenCalled = 0
  const handleChange = jest.fn()
  
})