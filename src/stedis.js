const isDev = process.env.NODE_ENV !== "production"

const PATH_SEPARATOR = '/'

const 
  
  ERROR_ONLY_OBJECT_METHOD = isDev ? `

  ` : 'ERROR_ONLY_OBJECT_METHOD',
  
  ERROR_ONLY_COLLECTION_METHOD = isDev ? `

  ` : 'ERROR_ONLY_COLLECTION_METHOD =',

  ERROR_MERGE_BEFORE_SET = isDev ? `
    
  ` : 'ERROR_MERGE_BEFORE_SET'



// 
const virtualTree = new Map

// 
const pathToIdsMap = new Map

// 
const objectValues = new Map

// 
const objectMetaData = new WeakMap

// 
const objectParentLink = new WeakMap

// 
const collections = new Map

// 
const objectToIdsMap = new WeakMap

// 
const objectNeverWasUsed = new WeakSet

// 
const invalidPaths = new WeakMap

// 
const objectEventsMap = new WeakMap

// 
const globalEventsMap = new Map


// 
// 
// 
const patternsCacheMap = new Map


const uniqID = new function () {
  let id = 1 // +new Date
  return () => id++
}


function getOrCreatePathPattern(pattern) {
  if (patternsCacheMap.has(pattern)) {
    return patternsCacheMap.get(pattern)
  }
  
  const regex = new RegExp(`^${
    pattern.split(
      PATH_SEPARATOR
    ).map(x => x.replace('*', '.*')).join(`\/`)
  }$`)

  const isMatch = (path) => regex.test(path)
  patternsCacheMap.set(pattern, isMatch)
  return isMatch
}


// 
// 
// 
function watch(pattern, type = 'change', callback) {
  pattern = getOrCreatePathPattern(pattern)
  if (typeof type === 'function') {
    callback = type
    type = 'change'
  }

  if (!globalEventsMap.has(type)) {
    globalEventsMap.set(type, new Map)
  }
  const globalEventsTypeMap = globalEventsMap.get(type)
  if (!globalEventsTypeMap.has(pattern)) {
    globalEventsTypeMap.set(pattern, new Set)
  }
  globalEventsTypeMap.get(pattern).add(callback)


  return () => {
    globalEventsMap.get(type).get(pattern).delete(callback)
  }
}



// 
// 
// 
function on(path, type = 'change', callback) {
  if(typeof type === 'function') {
    callback = type
    type = 'change'
  }
  path = parsePath(path)
  const id = getOrCreateIdByPath(path)
  const selector = getOrCreateSelectorById(id)
  if (!objectEventsMap.has(selector)) {
    objectEventsMap.set(selector, new Map)
  }
  const events = objectEventsMap.get(selector)
  if (!events.has(type)) {
    events.set(type, new Set)
  }
  const eventsByType = events.get(type)
  eventsByType.add(callback)

  return () => {
    eventsByType.delete(callback)
  }
}

function once(path, type, callback) {
  if (typeof type === 'function') {
    callback = type
    type = 'change'
  }
  const off = on(path, type, (e) => {
    callback(e)
    off()
  })
}


// 
// 
// 
function emit(path, type = 'change', payload, emitAllParents) {
  path = parsePath(path)
  const id = getOrCreateIdByPath(path)
  const selector = getOrCreateSelectorById(id)
  if (objectEventsMap.has(selector)) {
    const events = objectEventsMap.get(selector)
    if (events && events.has(type)) {
      // console.log(events.get(type))
      [...events.get(type)].forEach(callback => {
        callback(payload)
      })
    }
  }
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
function emitGlobalPathEvents(path, type, payload) {

  if (!globalEventsMap.has(type)) {
    return
  }
  const typeCallbacks = globalEventsMap.get(type)

  if (!typeCallbacks) {
    return
  }

  // console.log(globalEventsMap)
  const checkers = [...typeCallbacks.keys()]
  const callbacks = [...typeCallbacks.values()]

  // console.log(type, '------------------------------------------------------------------------------------')
  // console.log(checkers)
  // console.log(callbacks)

  while (path.length) {
    const currentPath = path.join(PATH_SEPARATOR)
    // console.log("IS MATCHE", currentPath)
    // console.log(checkersArray[0])
    checkers.forEach((isMatch, index) => {
      // console.log("IS MATCHE", currentPath, isMatch(currentPath))
      if (isMatch(currentPath)) {
        [...callbacks[index]].forEach((callback) => {
          callback(payload)
        })
      }
    })

    path.pop()
  }
}


// 
// 
// 
const pathsToAdd = []
const pathsToRemove = []
!(function updateVirtualTree(path, parentPath = null, context = virtualTree) {
  let added = path || pathsToAdd.shift()
  if (added) {

    const { length } = added
    // console.log(`[update vTree]: pp=${parentPath},  p=${added} (${length})`)
    const [first] = added
    const id = getOrCreateIdByPath(parentPath ? [...parentPath, first] : first)

    if (!context.has(id)) {
      context.set(id, new Map)
    }

    if (length > 1) {
      return updateVirtualTree(
        added.filter((x, i) => i),
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
  const internalCollectionId = getOrCreateIdByPath(path)
  let collection
  if (collections.has(internalCollectionId)) {
    collection = collections.get(internalCollectionId)
  } else {
    collection = new Set
    collections.set(internalCollectionId, collection)
  }

  collection.add(objId)

  emit([...path], 'change', get(path))

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
  const selector = createObj({})
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
function set(path, value) {
  path = parsePath(path)

  if (path.length % 2 === 0) {
    throw new Error(`set() method allowed only on objects, not collections. Check your path`)
  }

  pathsToAdd.push([...path])

  const selector = getSelector([...path])

  objectNeverWasUsed.delete(selector)
  assign(selector, value)

  setOrUpdateCollection([...path], selector)
  
  emit([...path], 'change', value)
  emitGlobalPathEvents([...path], 'change', value)
}


// 
// 
// 
function merge(path, value) {
  path = parsePath(path)
  if (path.length % 2 === 0) {
    throw new Error(`merge() method allowed only on objects, not collections. Check your path`)
  }

  const selector = getSelector([...path])
  
  if (objectNeverWasUsed.has(selector)) {
    throw new Error(`merge() method allowed only on objects, not collections. Check your path`)
  }

  assign(selector, value)
  
  emit([...path], 'change', value)
  emitGlobalPathEvents([...path], 'change', value)

}

// 
// 
// 
function getById(id) {
  const result = objectValues.get(id)
  // 
  // 
  if (objectNeverWasUsed.has(result)) {
    return undefined
  }
  if (isDev) {
    return result ? Object.freeze(clone(result)) : result
  }
  return result
}



// 
// 
// 
function get(path, attributes, nested) {

  if (attributes === true) {
    attributes = null
    nested = true
  }

  path = parsePath(path)
  // objectValues.get(getOrCreateIdByPath(parsePath(path)))
  const id = getOrCreateIdByPath(path)

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
  }

  const probableCollection = collections.get(id)

  if (probableCollection) {
    if (attributes) {
      return [...probableCollection].map(id => {
        const objectValue = getById(id)
        const compiledObject = attributes.reduce((result, attr) => {
          result[attr] = objectValue[attr]
          return result
        }, {})
        return isDev ? Object.freeze(compiledObject) : compiledObject
      })
    }
    return [...probableCollection].map(getById)
  }
  return undefined
}

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





// 
// 
// 
function createObj(obj, path) {
  const type = typeof obj
  if (type === 'string') { return obj }
  if (type === 'number') { return obj }
  if (type === 'undefined') { return obj }
  if (Array.isArray(obj)) { return obj }
  if (obj && typeof obj === 'object') {
    // obj._id = uniqID()
    // path && (obj._path = path)
    // @todo
    // keys storage
    Object.keys(obj).forEach(key => {
      obj[key] = createObj(obj[key], path ? (path + PATH_SEPARATOR + key) : key)
    })
    // indexByID[obj._id] = obj
  }
  return obj
}


function clone(o) {
  return JSON.parse(JSON.stringify(o))
}

function assign(source, value) {
  Object.assign(source, value)
}

function objectMethod(...args) {
  const [path] = args
  path = parsePath(path)
  if (path.length % 2 === 0) {
    throw new Error
  }
  return
}


const __internal__for__debug__purpose__only__ = { 
  pathToIdsMap, 
  virtualTree 
}

export {
  set, merge, 
  get, 
  on, once, emit, watch,
  getNested,

  __internal__for__debug__purpose__only__
}


global.set = set