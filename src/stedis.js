// @define process = {}
import emitterAPI from './emitter'


const isDev = process.env.NODE_ENV !== 'production'

const PATH_SEPARATOR = '/'
const TAG_SEPARATOR = '#'
const EVENT_TYPE_SEPARATOR = ':'

const EVENT_TYPE_UPDATE = 'update'

const EVENT_TYPE_OBJECT_ADDED = 'added'
const EVENT_TYPE_OBJECT_REMOVED = 'removed'

const EVENT_TYPE_COLLECTION_ADD = 'add'
const EVENT_TYPE_COLLECTION_REMOVE = 'remove'
const EVENT_TYPE_COLLECTION_CHANGE = 'change'

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

// [ /user/1 ]
// docs [ uri ]
// collections [uri]
// tags [uri#tag]
// es [ uri:type ]: [id1, id2]
// hc [ uri:type:id ]
// hs [ uri:type:id ]
// ces [uri:type] : () => es[uri:type]()
// 
// 
// [ uri:type ]
// [ uri:type:id ]
// [ uri:type:id ]
// 
// 

// 
// 
const uniqID = new function () {
  let id = isDev ? 0 : +new Date
  // Map.get( string ) works faster
  return () => `id_${++id}`
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

exports[`on`] = on
function on(path, type, handler) {
  if(!type) {
    type = EVENT_TYPE_UPDATE
  }
  if (typeof type === 'object') {
    for (const k in type) {
      on(path, k, type[k], handler)
    }
    return
  }
  if (typeof type === 'function') {
    handler = type
    type = EVENT_TYPE_UPDATE
  }
  path = path.split('#')[0]
  const ekey = makeEventKey(path, type)
  emitterAPI.on(ekey, handler)
  return () => {
    emitterAPI.off(ekey, handler)
  }
}

exports[`once`] = once
function once(path, type, handler) {
  if (typeof type === 'function') {
    handler = type
    type = EVENT_TYPE_UPDATE
  }
  const ekey = makeEventKey(path, type)
  emitterAPI.once(ekey, handler)
}

exports[`off`] = off
function off(path, type = EVENT_TYPE_UPDATE, handler ) {
  const ekey = makeEventKey(path, type)
  emitterAPI.off(ekey, handler)
}

exports[`emit`] = emit
function emit(path, type, payload) {
  emitterAPI.emit(makeEventKey(path, type), payload)
}

function EventObject(path, type, payload, initiator) {
  this.path = path
  this.type = type
  this.initiator = initiator
  this.payload = payload
}

function makeEventKey(path, type) {
  return `${path}${EVENT_TYPE_SEPARATOR}${type}`
}


exports[`notify`] = notify
function notify(
  path, 
  type = EVENT_TYPE_UPDATE, 
  payload = undefined
) {
  const allPaths = getParentEventNames(path)
  for (let i = -1, t = allPaths.length, p; ++i < t; p = allPaths[i]){
    emit(p, type, new EventObject(
        p,
        type,
        payload,
        path,
      )
    )
  }
}

exports[`computed`] = computed
function computed(path, from, toValue) {
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



  const internalCollectionId = getOrCreateIdByPath(path.join(PATH_SEPARATOR))
  let collection = collections.get(internalCollectionId)

  if (!collection) {
    collection = new Set
    // collection = new Map
    collections.set(internalCollectionId, collection)
  }

  const selectorExists = collection.has(selector)
  if (selectorExists) {
    return selectorExists
  }

  collection.add(objId)
  // collections.set(objId, true)
  // return collection.keys()

  return false
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
exports[`add`] = add
function add(path, value, nextId) {
  nextId = nextId || uniqID()
  set(`${path}/${nextId}`, value)
  return nextId
}


// 
// 
// 
exports[`set`] = set
function set(_path, value) {
  const path = parsePath(_path)

  if (path.length % 2 === 0) {
    throw new Error(`set() method allowed only on objects, not collections. Check your path`)
  }

  pathsToAdd.add(_path)

  const id = getOrCreateIdByPath(_path)
  const selector = getOrCreateSelectorById(id)

  objectNeverWasUsed.delete(selector)

  const isPrimitive = isPrimitiveMap.get(typeof value) || value === null

  if (isPrimitive) {
    
    objectIsPrimitive.set(id, true)
    objectPrimitiveValues.set(selector, value)
    // objectValues.set(id, value)

  } else {
    objectIsPrimitive.delete(id)
    assign(selector, value)
  }

  // Already exists
  if (setOrUpdateCollection(_path.split(PATH_SEPARATOR), selector)) {

  } else {
    // added
    emit(_path, 'added', isPrimitive ? value : selector)
    emit(_path.replace(/\/w+$/, '/*'), 'added', isPrimitive ? value : selector)
    emit(_path.replace(/\/w+$/, ''), 'add', isPrimitive ? value : selector)
  }
  
  if(isPrimitive) {
    notify(_path, 'update', value)
  } else {
    notify(_path, 'update', selector)
  }
  return value
}

// 
// 
// 
exports[`next`] = next
function next( path ) {
  
}

// 
// 
// 
exports[`merge`] = merge
function merge(_path, value) {
  const path = _path.split(PATH_SEPARATOR)

  if (path.length % 2 === 0) {
    throw new Error(`merge() method allowed only on objects, not collections. Check your path: ${_path}`)
  }

  const id = getOrCreateIdByPath(_path)
  const selector = getOrCreateSelectorById(id)

  if (objectNeverWasUsed.has(selector)) {
    throw new Error(`merge() method allowed only on objects, not collections. Check your path`)
  }

  assign(selector, value)

  notify(_path, 'update', selector)
  return value
}

// 
// 
// 
exports[`meta`] = meta
function meta(path, value = undefined) {
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
const taggedCollectionsMap = new Map

exports[`tag`] = tag
function tag(path, tagName, comparator) {

  if (typeof tagName === 'object') {
    for(const k in tagName) {
      tag(path, k, tagName[k])
    }
    return
  }

  const key = `${path}#${tagName}`
  let tg = taggedCollectionsMap.get(key)
  if(!tg) {
    tg = new Set
    taggedCollectionsMap.set(key, tg)
  }

  on(path, 'update', ({payload: value}) => {
    if (comparator(value) === true){
      tg.add(value)
    } else {
      tg.delete(value)
    }
  })

  // /tasks#my,done
  // #a|b #a,b
  // [...new Set([...tagA, ...tagB])
  // #a&b 
  // [...tagA].filter(x => tagB.has(x));

}
exports[`untag`] = untag
function untag(path, tagName) {
  const key = `${path}#${tagName}`
  return taggedCollectionsMap.delete(key)
}


function getTag(path, tag){
  // console.log(path, tag)
  if(tag.indexOf(',') > -1) {
    return [...new Set(
      tag
        .split(',')
        .map(t => taggedCollectionsMap.get(`${path}#${t}`))
        .flat()
    )]
  }
  if(tag.indexOf('&') > -1) {
    const tags = tag.split('&')
    const t = tags.pop()
    const filter = (item) => {
      for(let i = tags.length; --i > -1;) {
        const key = `${path}#${tags[i]}`
        // try {
          if (!taggedCollectionsMap.get(key).has(item)) {
            return false
          }
        // } catch(e) {
        //   return false
        // }
      }
      return true
    }
    
    return [...taggedCollectionsMap.get(`${path}#${t}`)].filter(filter)
  }
  return [...taggedCollectionsMap.get(`${path}#${tag}`)]
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
exports[`get`] = get
function get(_path, attributes, nested) {

  if (attributes === true) {
    attributes = null
    nested = true
  }

  let [path, tag] = _path.split('#')

  const id = getOrCreateIdByPath(path)
  const pathParts = parsePath(path)

  // objectValues.get(getOrCreateIdByPath(parsePath(path)))

  if (nested) {
    // @todo:
    // Navigate through virtual tree
  }



  // console.log(path, path.length)
  if (pathParts.length % 2 === 1) {
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
    return getExpandedCollection(path, id, attributes, tag, nested)
  }
}


// 
// 
// 
function getExpandedCollection(_path, id, attributes, tag, nested) {
  let probableCollection = collections.get(id)
  // console.log(_path, tag)
  if (probableCollection) {


    if (tag) {
      return getTag(_path, tag)
    }
    
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
function getNested(path, attributes) {
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



const wrapWithPath = (method, _path, ctx = null) => 
  (path, ...args) => {
    const result = method.apply(null, [`${_path}${path}`, ...args])
    return ctx || result
  }

const wrapWithoutPath = (method, _path) =>
  (...args) => method.apply(null, [_path, ...args])


function Context(path) {
  this.path = path
  ;
  [set, merge, on, off, emit, notify, add, tag, untag, once].forEach(fn => {
    this[fn.name] = wrapWithPath(fn, path, this).bind(this)
  })
  ;
  [get].forEach(fn => {
    this[fn.name] = wrapWithPath(fn, path).bind(this)
  })
}


exports[`context`] = context
function context(path) {
  return new Context(path)
}


// {
//   notify as emit
// }




exports[`__internal__for__debug__purpose__only__`] = isDev ? {
  'pathToIdsMap':pathToIdsMap,
  'virtualTree':virtualTree,
  'objectEventsMap':objectEventsMap,
  'objectToIdsMap':objectToIdsMap,
  'globalEventsMap':globalEventsMap,
} : {}
 



// global.set = set
// global.get = get
// global.emit = notify
// global.on = on