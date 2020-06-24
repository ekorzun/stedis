import {
  merge, set, get, once, on, watch,
  
  __internal__for__debug__purpose__only__

} from '../src/stedis'


const {
  virtualTree
} = __internal__for__debug__purpose__only__

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
  
  expect(() => {
    merge(`/a`, undefined)
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


  expect(() => {
    merge(`/a/2`, undefined)
  }).toThrowError(/method/)

  set(`/a/2`, {a: 2})
  expect(get('/a/2')).toEqual({ a: 2 })
  expect(get('/a')).toEqual([{ a: 1 }, {a: 2}])
  
  merge('/a/2', { foo: 'bar' })
  expect(get('/a/2')).toEqual({ a: 2, foo: 'bar' })
  expect(get('/a')).toEqual([{ a: 1 }, {a: 2, foo: 'bar'}])

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


test('virtualTree', done => {
  setTimeout(() => {
    console.log(virtualTree)
    done()
  }, 500)
})


test('watchers', () => {
  let shouldBeenCalled = 0
  const handleChange = jest.fn()
  
})