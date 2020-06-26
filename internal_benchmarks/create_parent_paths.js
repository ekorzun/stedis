const { Suite } = require('benchmark')
const suite = new Suite

// Fastest is createWithArrayReduceSizedAndReturnArray
// with no cache :)


const PATH = '/user/1/projects/3/todos/1/comments/2/authors/3/username'

function createWithArrayAndReturnArray(path) {
  const arr = []
  path = path.split('/')
  while(path.length > 1) {
    arr.push(path.join('/'))
    path.pop()
    arr.push(path.join('/') + '/*')
  }
  return arr
}

function createWithStringAndReturnArray(path) {
  const arr = []
  while (path) {
    arr.push(path, path.replace(/\w+$/, '*'))
    path = path.replace(/\/\w+$/, '')
  }
  return arr
}

function createWithArrayReduceAndReturnArray(path) {
  path = path.split('/')
  return path.reduce((acc, part, index) => {
    if(!index) {
      return acc
    }
    const p = path.slice(0, index - 1).join('/')
    acc.push(
      p + '/' + part,
      p + '/*',
    )
    return acc
  }, [])
}

function createWithArrayReduceSizedAndReturnArray(path) {
  path = path.split('/')
  const {length} = path
  const tlength = (length - 1) * 2
  const arr = (new Array(tlength)).fill("")
  return path.reduce((acc, part, index) => {
    if (!index) {
      return acc
    }
    const p = path.slice(0, index - 1).join('/')
    acc[index] = p + '/' + part
    acc[tlength - index] = p + '/*'
    return acc
  }, arr)
}

function createWithStringAndReturnMap(path) {
  path = path.split('/')
  return path.reduce((acc, part, index) => {
    if (!index) {
      return acc
    }
    const p = path.slice(0, index - 1).join('/')
    acc.set(p + '/' + part, 1)
    acc.set(p + '/*', 1)
    return acc
  }, new Map).keys()
}



console.log(createWithArrayAndReturnArray(PATH))
console.log(createWithStringAndReturnArray(PATH))
console.log(createWithArrayReduceAndReturnArray(PATH))
console.log(createWithArrayReduceSizedAndReturnArray(PATH))
console.log(createWithStringAndReturnMap(PATH))

suite
  .add('createWithArrayAndReturnArray', function () {
    createWithArrayAndReturnArray(PATH)
  })
  .add('createWithStringAndReturnArray', function () {
    createWithStringAndReturnArray(PATH)
  })
  .add('createWithArrayReduceAndReturnArray', function () {
    createWithArrayReduceAndReturnArray(PATH)
  })
  .add('createWithArrayReduceSizedAndReturnArray', function () {
    createWithArrayReduceSizedAndReturnArray(PATH)
  })
  .add('createWithStringAndReturnMap', function () {
    createWithStringAndReturnMap(PATH)
  })
  .add('createWithStringAndReturnMap', function () {
    createWithStringAndReturnMap(PATH)
  })


  .on('cycle', function (event) {
    console.log(String(event.target));
  })
  
  .on('complete', function () {
    console.log('Fastest is ' + this.filter('fastest').map('name'));
  })
  .run({ 'async': true });