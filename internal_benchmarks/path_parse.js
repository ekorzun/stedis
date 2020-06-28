const { Suite } = require('benchmark')
const suite = new Suite

function p1(path) {
  const [p, t] = path.split('#')
  return [p.split('/'), t]
}

function p2(path) {
  const [p, t] = path.split('#')
  return {p: p.split('/'), t}
}

const RE1 = /^([\w\/]+)(?:\#(\w+))$/
function p3(path) {
  const { $1, $2 } = RE1.test(path) && RegExp
  return {p: $1.split('/'), t: $2}
}


const PATH = `/users/1/todos#done`

suite
  .add('p1', () => p1(PATH))
  .add('p2', () => p2(PATH))
  .add('p3', () => p3(PATH))
  // .add('p4', () => p4(PATH))
  
  .on('cycle', function (event) {
    console.log(String(event.target));
  })
  
  .on('complete', function () {
    console.log('Fastest is ' + this.filter('fastest').map('name'));
  })
  .run({ 'async': true });