const { Suite } = require('benchmark')
const suite = new Suite

// Fastest is new Object

suite
  .add('new Object', function () {
    return new Object
  })
  .add('Plain {}', function () {
    return {}
  })
  .add('new Function', function () {
    return new Function
  })
  .add('Object.create', function () {
    return Object.create(null)
  })

  .on('cycle', function (event) {
    console.log(String(event.target));
  })
  
  .on('complete', function () {
    console.log('Fastest is ' + this.filter('fastest').map('name'));
  })
  .run({ 'async': true });