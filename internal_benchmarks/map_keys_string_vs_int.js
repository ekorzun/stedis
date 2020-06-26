const { Suite } = require('benchmark')
const suite = new Suite


// 
// The fastest way to get prop is Map.get( String )
// 

const MAX = 1000
const newObj = (i) => new Object({ i })
const ts = +new Date 

const IntArr = []

const StrMap = new Map
const IntMap = new Map
const StrObj = {}
const IntObj = {}

const intKeys = []
const strKeys = []

for (let i = 0; i < MAX; i++) {
  const keyInt = ts+i
  const keyStr = `s${keyInt}`
  intKeys.push(keyInt)
  strKeys.push(keyStr)

  const o = newObj(i)
  StrMap.set(keyStr, o)
  IntMap.set(keyInt, o)
  IntObj[keyInt] = o
  StrObj[keyStr] = o
  IntArr.push(o)
}

suite
  .add('int map', function () {
    for (let i = 0; i < MAX; i++) {
      IntMap.get(intKeys[i])
    }
  })
  .add('str map', function () {
    for (let i = 0; i < MAX; i++) {
      StrMap.get(strKeys[i])
    }
  })
  .add('int object', function () {
    for (let i = 0; i < MAX; i++) {
      IntObj[intKeys[i]]
    }
  })
  .add('str object', function () {
    for (let i = 0; i < MAX; i++) {
      StrObj[strKeys[i]]
    }
  })
  
  .add('Theoretical maximum', function () {
    for (let i = 0; i < MAX; i++) {
      IntArr[i]
    }
  })

  .on('cycle', function (event) {
    console.log(String(event.target));
  })
  
  .on('complete', function () {
    console.log('Fastest is ' + this.filter('fastest').map('name'));
  })
  .run({ 'async': true });