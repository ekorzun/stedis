import {
  merge, 
  set, 
  get, 
  once, 
  on,
  tag, 
  off,
  emit,
  notify,
  context,
  meta,
  add,
  computed,
  __internal__for__debug__purpose__only__
} from '../src/stedis'


const {
  virtualTree,
  globalEventsMap,
  objectEventsMap
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
  set('/a/1', { a: 1 })
  expect(get('/a/1')).toEqual({ a: 1 })

  set('/a/1/b/2', { b: 2 })
  expect(get('/a/1/b/2')).toEqual({ b: 2 })


  expect(get('/a')).toEqual([{ a: 1 }])
  expect(get('/a/1/b')).toEqual([{ b: 2 }])


  expect(() => {
    merge(`/a/2`, undefined)
  }).toThrowError(/method/)

  set(`/a/2`, { a: 2 })
  expect(get('/a/2')).toEqual({ a: 2 })
  expect(get('/a')).toEqual([{ a: 1 }, { a: 2 }])

  merge('/a/2', { foo: 'bar' })
  expect(get('/a/2')).toEqual({ a: 2, foo: 'bar' })
  expect(get('/a')).toEqual([{ a: 1 }, { a: 2, foo: 'bar' }])

  add(`/a`, {baz: 'fuzz'})
  expect(get('/a')).toEqual([{ a: 1 }, { a: 2, foo: 'bar' }, { baz: 'fuzz' }])

})


test('primitives', () => {
  set('/primitives/1', '1')
  expect(get('/primitives/1')).toStrictEqual('1')
  set('/primitives/1', 1)
  expect(get('/primitives/1')).toStrictEqual(1)
  set('/primitives/2', 2)
  expect(get('/primitives/2')).toStrictEqual(2)
  set('/primitives/true', true)
  expect(get('/primitives/true')).toStrictEqual(true)
  set('/primitives/false', false)
  expect(get('/primitives/false')).toStrictEqual(false)
  const symbol = Symbol('symbol')
  set('/primitives/symbol', symbol)
  expect(get('/primitives/symbol')).toStrictEqual(symbol)
  set('/primitives/nan', NaN)
  expect(get('/primitives/nan')).toStrictEqual(NaN)
  set('/primitives/undefined', undefined)
  expect(get('/primitives/undefined')).toStrictEqual(undefined)
  set('/primitives/null', null)
  expect(get('/primitives/null')).toStrictEqual(null)
})


const handleChange = jest.fn()

test('events: basic', () => {
  let shouldHaveBeenCalled = 0
  const off1 = on('/a/1', handleChange)

  set('/a/1', { a: 1 })
  expect(handleChange).toHaveBeenCalledTimes(++shouldHaveBeenCalled)

  set('/a/1', { a: 1 })
  expect(handleChange).toHaveBeenCalledTimes(++shouldHaveBeenCalled)


  off1()
  set('/a/1', { a: 1 })
  expect(handleChange).toHaveBeenCalledTimes(shouldHaveBeenCalled)


  once('/a/1', handleChange)
  set('/a/1', { a: 1 })
  expect(handleChange).toHaveBeenCalledTimes(++shouldHaveBeenCalled)
  set('/a/1', { a: 1 })
  expect(handleChange).toHaveBeenCalledTimes(shouldHaveBeenCalled)

  set('/a/1', { a: 1 })
  set('/a/1', { a: 1 })
  expect(handleChange).toHaveBeenCalledTimes(shouldHaveBeenCalled)

  on('/a/1', 'update', handleChange)
  set('/a/1', { a: 1 })
  expect(handleChange).toHaveBeenCalledTimes(++shouldHaveBeenCalled)
  off(`/a/1`)
  set('/a/1', { a: 1 })
  expect(handleChange).toHaveBeenCalledTimes(shouldHaveBeenCalled)

  once('/a/1', 'update', handleChange)
  set('/a/1', { a: 1 })
  expect(handleChange).toHaveBeenCalledTimes(++shouldHaveBeenCalled)
  set('/a/1', { a: 1 })
  expect(handleChange).toHaveBeenCalledTimes(shouldHaveBeenCalled)

  once('/a/1', 'custom', handleChange)
  set('/a/1', { a: 1 })
  expect(handleChange).toHaveBeenCalledTimes(shouldHaveBeenCalled)
  emit('/a/1', 'custom')
  expect(handleChange).toHaveBeenCalledTimes(++shouldHaveBeenCalled)
  set('/a/1', { a: 1 })
  emit('/a/1', 'custom')
  expect(handleChange).toHaveBeenCalledTimes(shouldHaveBeenCalled)


  once('/a/1', 'custom', handleChange)
  emit('/a/1/b/2/c/3', 'custom')
  expect(handleChange).toHaveBeenCalledTimes(shouldHaveBeenCalled)
  emit('/a/1', 'custom')
  expect(handleChange).toHaveBeenCalledTimes(++shouldHaveBeenCalled)

  
  once('/a/1', 'custom', handleChange)
  emit('/a/1/b/2/c/3', 'custom')
  emit('/a/1/b/2/c/3', 'custom', 1)
  emit('/a/1/b/2/c/3', 'custom', 2)
  notify('/a/1/b/2/c/3', 'custom', 3)
  notify('/a/1/b/2/c/3', 'custom',  4)
  expect(handleChange).toHaveBeenCalledTimes(++shouldHaveBeenCalled)
  emit('/a/1', 'custom')
  expect(handleChange).toHaveBeenCalledTimes(shouldHaveBeenCalled)

})


test('events: parents', () => {
  const handleChangeRoot = jest.fn()
  const handleChangeSubRoot = jest.fn()
  const handleChangeUser = jest.fn()
  const handleChangeAnyUser = jest.fn()


  const offRoot = on('/', handleChangeRoot)
  const offSubRoot = on('/user', handleChangeSubRoot)
  const offUser = on('/user/1', handleChangeUser)

  set(`/user/1/todo/2`)

})


test('computed: basic', () => {
  computed(
    `/computed/sum`, 
    [`/numbers`], 
    ([n]) => n.reduce((s, n) => s + n, 0)
  )

  set('/numbers/1', 100)
  
  set('/numbers/2', 200)
  expect(get('/computed/sum')).toStrictEqual(300)

  set('/numbers/1', 5)
  expect(get('/computed/sum')).toStrictEqual(205)

  set('/numbers/1000', 5)
  expect(get('/computed/sum')).toStrictEqual(210)

  
  computed(
    `/computed/wtf`,
    [`/computed/sum`, '/primitives/2'],
    ([sum, p]) => sum * p
  )
  expect(get('/computed/wtf')).toStrictEqual(420)

})


test('tagged', () => {
  tag(`/tasks`, 'my', task => task.user === 'me')
  
  set('/tasks/1', {id: 1, user: 'me'})
  set('/tasks/2', {id: 2, user: 'notme'})

  expect(get('/tasks#my')).toEqual([{ id: 1, user: 'me' }])
})


test('meta', () => {
  meta(`/a/1`, {isLoading: true})
  expect(meta('/a/1')).toEqual({ isLoading: true })
  meta(`/a/1`, null)
  expect(meta('/a/1')).toEqual( null )

  meta(`/a/1/2/3/4`, {isLoading: true})
  expect(meta('/a/1/2/3/4')).toEqual({ isLoading: true })
  meta(`/a/1/2/3/4`, null)
  expect(meta('/a/1/2/3/4')).toEqual( null )
})


test('context', () => {
  const { get, set, merge, add, on, off, once, emit, notify } = context('/ctx/new')
  set(`/user/1`, {user: 1})
  expect(get('/user/1')).toEqual({ user: 1 })
  expect(get('/a/100')).toEqual(undefined)
  expect(get('/a/100/b/200')).toEqual(undefined)
  set('/a/1', { a: 1 })
  expect(get('/a/1')).toEqual({ a: 1 })
  set('/a/1/b/2', { b: 2 })
  expect(get('/a/1/b/2')).toEqual({ b: 2 })
  expect(get('/a')).toEqual([{ a: 1 }])
  expect(get('/a/1/b')).toEqual([{ b: 2 }])
  set(`/a/2`, { a: 2 })
  expect(get('/a/2')).toEqual({ a: 2 })
  expect(get('/a')).toEqual([{ a: 1 }, { a: 2 }])
  merge('/a/2', { foo: 'bar' })
  expect(get('/a/2')).toEqual({ a: 2, foo: 'bar' })
  expect(get('/a')).toEqual([{ a: 1 }, { a: 2, foo: 'bar' }])
  add(`/a`, { baz: 'fuzz' })
  expect(get('/a')).toEqual([{ a: 1 }, { a: 2, foo: 'bar' }, { baz: 'fuzz' }])
  let shouldHaveBeenCalled = 0
  const handleChange = jest.fn()
  on('/a/1', handleChange)
  set('/a/1', { a: 1 })
  expect(handleChange).toHaveBeenCalledTimes(++shouldHaveBeenCalled)
  set('/a/1', { a: 1 })
  expect(handleChange).toHaveBeenCalledTimes(++shouldHaveBeenCalled)
  off(`/a/1`)
  set('/a/1', { a: 1 })
  expect(handleChange).toHaveBeenCalledTimes(shouldHaveBeenCalled)
  once('/a/1', handleChange)
  set('/a/1', { a: 1 })
  expect(handleChange).toHaveBeenCalledTimes(++shouldHaveBeenCalled)
  set('/a/1', { a: 1 })
  expect(handleChange).toHaveBeenCalledTimes(shouldHaveBeenCalled)
  set('/a/1', { a: 1 })
  set('/a/1', { a: 1 })
  expect(handleChange).toHaveBeenCalledTimes(shouldHaveBeenCalled)
  on('/a/1', 'update', handleChange)
  set('/a/1', { a: 1 })
  expect(handleChange).toHaveBeenCalledTimes(++shouldHaveBeenCalled)
  off(`/a/1`)
  set('/a/1', { a: 1 })
  expect(handleChange).toHaveBeenCalledTimes(shouldHaveBeenCalled)
  once('/a/1', 'update', handleChange)
  set('/a/1', { a: 1 })
  expect(handleChange).toHaveBeenCalledTimes(++shouldHaveBeenCalled)
  set('/a/1', { a: 1 })
  expect(handleChange).toHaveBeenCalledTimes(shouldHaveBeenCalled)
  once('/a/1', 'custom', handleChange)
  set('/a/1', { a: 1 })
  expect(handleChange).toHaveBeenCalledTimes(shouldHaveBeenCalled)
  emit('/a/1', 'custom')
  expect(handleChange).toHaveBeenCalledTimes(++shouldHaveBeenCalled)
  set('/a/1', { a: 1 })
  emit('/a/1', 'custom')
  expect(handleChange).toHaveBeenCalledTimes(shouldHaveBeenCalled)
  once('/a/1', 'custom', handleChange)
  emit('/a/1/b/2/c/3', 'custom')
  expect(handleChange).toHaveBeenCalledTimes(shouldHaveBeenCalled)
  emit('/a/1', 'custom')
  expect(handleChange).toHaveBeenCalledTimes(++shouldHaveBeenCalled)
  once('/a/1', 'custom', handleChange)
  emit('/a/1/b/2/c/3', 'custom')
  emit('/a/1/b/2/c/3', 'custom', 1)
  emit('/a/1/b/2/c/3', 'custom', 2)
  notify('/a/1/b/2/c/3', 'custom', 3)
  notify('/a/1/b/2/c/3', 'custom', 4)
  expect(handleChange).toHaveBeenCalledTimes(++shouldHaveBeenCalled)
  emit('/a/1', 'custom')
  expect(handleChange).toHaveBeenCalledTimes(shouldHaveBeenCalled)
})



// // test('virtualTree', done => {
// //   const handleChange = jest.fn()
// //   set('/c/3', {foo: 'bar'})
// //   const off = on('/c/3', handleChange)

// //   setTimeout(() => {
// //     console.log(getListeners(`/c/3`))
// //     console.log(virtualTree)
// //     done()
// //   }, 500)
// // })



// // transformGet(`/user/*`, user => {
// //   return {
// //     ...user,
// //     user_id: user.id,
// //     full_name: `${user.name} ${user.last_name}`
// //   }
// // })