const { inspect } = require('util')
const {watch, on, get, set, emit} = require('./inbox')
const { pathToIdsMap, virtualTree} = require('./inbox')


// watch(`/user/*`, () => {
//   console.log(`*****************************************************************`)
//   console.log(`[watch]: fired`)
// })

// set(`/user/1/api/1`, {foo: 'bar'})
// console.log(get(`/user/1/api/1`))


// set(`/user/1/api/2`, { foo: 'buzz' })
// set(`/user/vasya/todos/16`, { foo: 'buzz' })


// const off = on(`/a/b`, `fire`, e => {
//   console.log("FIRE!!!!!")
// })



// emit('/a/b', 'fire')
// off()
// emit('/a/b', 'fire')

// console.log(get(`/user/1/api`) )


// console.log(get(`/user/1`))
// console.log(get(`/user`))


// setTimeout(function(){
//   console.log(inspect(virtualTree, false, null, true))
//   console.log(pathToIdsMap)

//   console.log(get(`/user/1`))
// }, 1000)

// console.log(objectValues)

