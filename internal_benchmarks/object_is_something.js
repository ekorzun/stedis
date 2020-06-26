const { Suite } = require('benchmark')
const suite = new Suite


const MAX = 1000
const newObj = (i) => new Object({ i })

const arr = []

const isEvenWeakSet = new WeakSet
const isEvenWeakMap = new WeakMap
const isEvenMap = new Map
const isEvenSet = new Set
const isEvenObj = {}


for (let i = 0; i < MAX; i++) {
  arr.push(newObj(i))
}

for (let i = 0; i < MAX; i++) {
  i % 2 && isEvenWeakSet.add(arr[i])
  i % 2 && isEvenWeakMap.set(arr[i], true)
  i % 2 && isEvenMap.set(arr[i], true)
  i % 2 && isEvenSet.add(arr[i])
  i % 2 && (isEvenObj[i] = arr[i])
}


suite

  .add('array.filter using weakSet#has', function () {
    arr.filter((o, i) => isEvenWeakSet.has(o))
  })
  .add('array.filter using weakMap#has', function () {
    arr.filter((o, i) => isEvenWeakMap.has(o))
  })
  .add('array.filter using  Set#has', function () {
    arr.filter((o, i) => isEvenSet.has(o))
  })
  .add('array.filter using  Object[index]', function () {
    arr.filter((o, i) => isEvenObj[i])
  })
  

  .add('Set#values', function () {
    isEvenSet.values()
  })
  .add('Set#array', function () {
    [...isEvenSet]
  })
  .add('Set#arrayValues', function () {
    [...isEvenSet.values()]
  })
  .add('Map#keys', function () {
    isEvenMap.keys()
  })
  .add('Object#values', function () {
    Object.values(isEvenObj)
  })
  
  



  // add listeners
  .on('cycle', function (event) {
    console.log(String(event.target));
  })
  .on('complete', function () {
    console.log('Fastest is ' + this.filter('fastest').map('name'));
  })
  // run async
  .run({ 'async': true });