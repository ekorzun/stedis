const isDev = process.env.NODE_ENV !== 'production'

const PATH_SEPARATOR = '/'

const

  ERROR_ONLY_OBJECT_METHOD = isDev ? `

  ` : 'ERROR_ONLY_OBJECT_METHOD',

  ERROR_ONLY_COLLECTION_METHOD = isDev ? `

  ` : 'ERROR_ONLY_COLLECTION_METHOD =',

  ERROR_MERGE_BEFORE_SET = isDev ? `
    
  ` : 'ERROR_MERGE_BEFORE_SET'

// Tree-like structure
// Map {
//  [root_id] : Map {
//    [child_id1] : Map {
//      [child_id2] : ....
//    }
//  }
// }
// 
const virtualTree = new Map

// Paths to internal ids mapping
// Map {
//   '/': 1,
//   '/user': 2,
//   '/user/1': 3,
//   '/user/2': 4
// }
const pathToIdsMap = new Map

// Flat internal ids to object values mapping
// Map {
//   2: [3, 4],
//   3: {username: 'user'}
// }
const objectValues = new Map
const objectPrimitiveValues = new WeakMap

// Flat object to internal ids mapping
// Reversed objectValues
// WeakMap {
//   [ objectRef2 ]: 2,
//   [ objectRef3 ]: 3,
// }
const objectToIdsMap = new WeakMap

// Objects meta data
// @todo: Perf test WeakMap(ref) vs Map(id)
// WeakMap {
//   [object reference]: {}
// }
const objectMetaData = new WeakMap

// 
const objectParentLink = new WeakMap

// Object is primitive
// Because all values are objects inside Stedis
const objectIsPrimitive = new Map

// Object is collection
// @todo: Perf test WeakSet(ref) vs WeakMap(ref) vs Map(id)
// WeakSet [ ObjRef1, ObjRef2 ]
const objectIsCollection = new WeakSet

// Object is computed from other objects
// @todo: Perf test WeakSet(ref) vs WeakMap(ref) vs Map(id)
// WeakSet [ ObjRef1, ObjRef2 ]
const objectIsComputed = new WeakSet

// Object never was used
// It is possible that object was automatically created by Stedis.
// 
// For example: set(`/user/1/todo/2`, {})
// set() will create:
//    - /user/1/todo as collection
//    - /user/1 as object
//    - /user as collection
// But actually they all must have an undefined value.
// So after creation they all should be marked as never used before.
// 
// @todo: Perf test WeakSet(ref) vs WeakMap(ref) vs Map(id)
// WeakMap [ ObjRef1, ObjRef2 ]
const objectNeverWasUsed = new WeakSet

// 
const collections = new Map



// 
const invalidPaths = new WeakMap

// 
const objectEventsMap = new WeakMap

// 
// Map {
//   [level = 1] : Map {
//     [/user]: Map {
//       [type] : Set [
//         cb1, cb2
//       ]
//     }
//   }
//   [level = 2] : Map {
//     [/user/1]: Map {
//      [change]: Set []
//     }
//   }
// }
// 
// 
// set('/user/1/todo/1', {}) Will emit:
// - emit('/user/1/todo/1')       === lvl 4 @ change
// - emit('/user/1/todo/*')       === lvl 4 @ change
// - emit('/user/1/todo', 'add')  === lvl 3 @ add
// - emit('/user/1/todo')         === lvl 3 @ change
// - emit('/user/1/*')            === lvl 3 @ change
// - emit('/user/1')              === lvl 2 @ change
// - emit('/user/*')              === lvl 2 @ change
// - emit('/user')                === lvl 1 @ change
// - emit('/*')                   === lvl 1 @ change
// - emit('/')                    === lvl 0 @ change
// 
// 
// Assume we have subscriber on('/user/1/*')
// So the handler will be placed in:
// ES[ level = 3 ][ /user/1/* ][ [isMatch]: handle ]
// 
// emit('/user/1/todo/1')
// ES[ level = 4 ] is empty
// emit('/user/1/todo/*')
// ES[ level = 4 ] is empty
// emit('/user/1/todo')
// ES[ level = 3 ] is not empty
//    ES[ level = 3 ][/user/1/todo] is empty
//    ES[ level = 3 ][/user/1/*] is not empty
//      ES[ level = 3 ][/user/1/*][0][isMatch](/user/1/todo)(event)
// 
// 
// Another option:
// Assume we have subscriber on('/user/1/*')
// So the handler will be placed in:
// ES[ /user/1/* ][change][handle]
// 
// @todo: Think about handler id against uri
// 
const globalEventsMap = new Map

// Set of callbacks should be emitted before any object
// will be unset (like unsubscribe for computed 
// or rebuild virtual tree)
const unsetEventsMap = new Map

// 
// 
// 
const isPrimitiveMap = new Map([
  ['string', true],
  ['number', true],
  ['symbol', true],
  ['boolean', true],
  ['undefined', true],
  ['null', true],
])



// 
// 
const uniqID = new function () {
  let id = isDev ? 0 : +new Date
  // Map.get( string ) works faster
  return () => (++id).toString()
}

// Map contains source uri path as key
// and the parent
// 
const emittersShouldBeFiredOnPath = new Map

function getParentEventNames(path) {
  return emittersShouldBeFiredOnPath.get(path) || createParentEventNames(path)
}

function createParentEventNames(path) {
  const arr = []
  while (path) {
    arr.push(path, path.replace(/\w+$/, '*'))
    path = path.replace(/\/\w+$/, '')
  }
  emittersShouldBeFiredOnPath.set(path, arr)
  return arr
}

function emitAll(path, type = 'change', payload = undefined) {
  const allPaths = getParentEventNames(path)
  allPaths.forEach(path => {
    emit(path, type, payload)
  })
}

function emit(path, type, payload) {
  // console.log(`[emit2]: ${path}`)
  const ns = globalEventsMap.get(path)
  if (!ns) { return }
  const callbacks = ns.get(type)
  // console.log('callbacks', type, ns, callbacks)
  if (!callbacks) { return }
  for (const callback of callbacks.keys()) {
    // console.log('callback', callback)
    if (callback(payload) === false) {
      return
    }
  }
}

export function on(path, type, handler) {
  if (typeof type === 'function') {
    handler = type
    type = 'change'
  }
  let ns = globalEventsMap.get(path)
  if (!ns) {
    ns = new Map
    ns.set(type, new Map)
    globalEventsMap.set(path, ns)
  }
  ns.get(type).set(handler, true)
  return () => {
    globalEventsMap
      .get(path)
      .get(type)
      .delete(handler)
  }
}


export function once(path, type, callback) {
  if (typeof type === 'function') {
    callback = type
    type = 'change'
  }
  const off = on(path, type, (e) => {
    callback(e)
    off()
  })
}


export function computed(path, from, toValue) {
  const unsubscribe = []
  const setValue = () => {
    set(path, toValue(from.map(f => get(f))))
  }
  from.forEach((path) => {
    unsubscribe.push(on(path, setValue))
  })
  
  try {
    setValue()
  } catch (e) {}

  return () => unsubscribe.forEach(u => u())
}




// 
// 
// 
function getListeners(path) {
  const selector = getOrCreateSelectorById(getOrCreateIdByPath(path))
  // console.log(objectToIdsMap)
  // console.log('selector', selector, objectEventsMap.has(selector), objectEventsMap)
  return objectEventsMap.get(selector)
}


// 
// 
// 
function iteratePath(path, callback) {
  path = parsePath(path)

}

// 
// 
// 
const pathsToAdd = new Set
const pathsToRemove = []
!(function updateVirtualTree(path, parentPath = null, context = virtualTree) {
  
  // console.log(pathsToAdd.size)
  let added = path
  if(!added) {
    added = pathsToAdd.size ? [...pathsToAdd][0] : null
    if (added) {
      pathsToAdd.delete(added)
    }
  }

  if (added) {

    added = added.split(PATH_SEPARATOR)
    const { length } = added
    // console.log(`[update vTree]: pp=${parentPath},  p=${added} (${length})`)
    const [first] = added
    const id = getOrCreateIdByPath(
      parentPath ? [...parentPath, first] : first
    )

    if (!context.has(id)) {
      context.set(id, new Map)
    }

    if (length > 1) {
      return updateVirtualTree(
        added.filter((x, i) => i).join(PATH_SEPARATOR),
        parentPath ? [...parentPath, first] : [first],
        context.get(id)
      )
    }
  }
  setTimeout(updateVirtualTree)
})();




// 
// 
// 
function setOrUpdateCollection(path, selector) {
  const objId = objectToIdsMap.get(selector)
  path.pop()
  const internalCollectionId = getOrCreateIdByPath(path.join('/'))
  let collection = collections.get(internalCollectionId)

  if (!collection) {
    collection = new Set
    // collection = new Map
    collections.set(internalCollectionId, collection)
  }

  collection.add(objId)
  // collections.set(objId, true)
  // return collection.keys()
  return collection
}



// 
// 
// 
function getOrCreateIdByPath(path) {
  path = path.toString()
  // console.log(`getOrCreateId: ${path}`)
  let id = pathToIdsMap.get(path)
  if (id) {
    return id
  }
  id = uniqID()
  pathToIdsMap.set(path, id)
  return id
}



// 
// 
// 
function getOrCreateSelectorById(id) {
  if (objectValues.has(id)) {
    return objectValues.get(id)
  }
  const selector = new Object
  objectValues.set(id, selector)
  objectToIdsMap.set(selector, id)
  objectNeverWasUsed.add(selector)
  return selector
}



// 
// 
// 
function getSelector(path) {
  const internalId = getOrCreateIdByPath(path)
  return getOrCreateSelectorById(internalId)
}





// 
// 
// 
export function set(_path, value) {
  const path = parsePath(_path)

  if (path.length % 2 === 0) {
    throw new Error(`set() method allowed only on objects, not collections. Check your path`)
  }

  pathsToAdd.add(_path)

  const id = getOrCreateIdByPath(_path)
  const selector = getOrCreateSelectorById(id)

  objectNeverWasUsed.delete(selector)

  if (isPrimitiveMap.get(typeof value) || value === null) {
    
    objectIsPrimitive.set(id, true)
    objectPrimitiveValues.set(selector, value)
    // objectValues.set(id, value)

  } else {
    objectIsPrimitive.delete(id)
    assign(selector, value)
  }

  setOrUpdateCollection(_path.split('/'), selector)
  emitAll(_path, 'change', value)
  return value
}


// 
// 
// 
export function merge(_path, value) {
  const path = _path.split('/')

  if (path.length % 2 === 0) {
    throw new Error(`merge() method allowed only on objects, not collections. Check your path: ${_path}`)
  }

  const id = getOrCreateIdByPath(_path)
  const selector = getOrCreateSelectorById(id)

  if (objectNeverWasUsed.has(selector)) {
    throw new Error(`merge() method allowed only on objects, not collections. Check your path`)
  }

  assign(selector, value)

  emitAll(_path, 'change', value)
  return value
}

// 
// 
// 
export function meta(path, value = undefined) {
  const id = getOrCreateIdByPath(path)
  const selector = getOrCreateSelectorById(id)
  if( value === undefined ) {
    return objectMetaData.get(selector)
  }
  objectMetaData.set(selector, value)
  return value
}

// 
// 
// 
function getById(id) {
  const result = objectValues.get(id)
  
  // console.log(id, objectIsPrimitive, objectValues )


  if(objectIsPrimitive.get(id)) {
    return objectPrimitiveValues.get(result)
  }

  // 
  // 
  if (objectNeverWasUsed.has(result)) {
    return undefined
  }
  if (isDev) {
    return result ? freeze(clone(result)) : result
  }
  return result
}




// 
// 
// 
export function get(_path, attributes, nested) {

  if (attributes === true) {
    attributes = null
    nested = true
  }

  const id = getOrCreateIdByPath(_path)
  const path = parsePath(_path)
  // objectValues.get(getOrCreateIdByPath(parsePath(path)))

  if (nested) {
    // @todo:
    // Navigate through virtual tree
  }

  // console.log(path, path.length)
  if (path.length % 2 === 1) {
    const objectValue = getById(id)

    if (!objectValue) {
      return objectValue
    }

    if (attributes) {
      return attributes.reduce((result, attr) => {
        result[attr] = objectValue[attr]
        return result
      }, {})
    }
    return objectValue
  } else {
    return getExpandedCollection(id, attributes, nested)
  }
}


// 
// 
// 
function getExpandedCollection(id, attributes) {
  const probableCollection = collections.get(id)

  if (probableCollection) {
    if (attributes) {
      return [...probableCollection].map(id => {
        const objectValue = getById(id)
        const compiledObject = attributes.reduce((result, attr) => {
          result[attr] = objectValue[attr]
          return result
        }, {})
        return isDev ? freeze(compiledObject) : compiledObject
      })
    }
    return [...probableCollection].map(getById)
  }
  return undefined
}

// 
// 
// 
export function getNested(path, attributes) {
  return get(path, attributes, true)
}



// 
// 
// 
function parsePath(path) {
  if (typeof path === 'string') {
    return path.split(PATH_SEPARATOR)
  }
  return path
}


function clone(o) {
  return JSON.parse(JSON.stringify(o))
}

function assign(source, value) {
  Object.assign(source, value)
}

function freeze(o) {
  return Object.freeze(o)
}

function objectMethod(...args) {
  const [path] = args
  path = parsePath(path)
  if (path.length % 2 === 0) {
    throw new Error
  }
  return
}


export function subState(_path) {
  const wrap = (method) => (path, ...args) => method.apply(null, [`${_path}${path}`, ...args])
  return [
    get, set, merge, on
  ].reduce((acc, fn) => {
    acc[fn.name] = wrap(fn)
    return acc
  }, {})
}


export {
  emitAll as emit
}

export const __internal__for__debug__purpose__only__ = isDev ? {
  pathToIdsMap,
  virtualTree,
  objectEventsMap,
  objectToIdsMap,
  globalEventsMap,
} : {}

global.set = set
global.get = get
global.emit = emit
global.on = on