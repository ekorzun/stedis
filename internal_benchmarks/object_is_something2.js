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

  .add('weakSet#has', function () {
    isEvenWeakSet.has(arr[Math.floor(Math.random() * MAX)])
  })
  .add('weakMap#has', function () {
    isEvenWeakMap.has(arr[Math.floor(Math.random() * MAX)])
  })
  .add('Set#has', function () {
    isEvenSet.has(arr[Math.floor(Math.random() * MAX)])
  })
  .add('Map#has', function () {
    isEvenMap.has(arr[Math.floor(Math.random() * MAX)])
  })
  .add('weakMap#get', function () {
    isEvenWeakMap.get(arr[Math.floor(Math.random() * MAX)])
  })
  .add('Map#get', function () {
    // In most cases Map.get works faster then Map.has
    isEvenMap.get(arr[Math.floor(Math.random() * MAX)])
  })
  .add('Theoretical maximum', function () {
    arr[Math.floor(Math.random() * MAX)].i % 2 === 1
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