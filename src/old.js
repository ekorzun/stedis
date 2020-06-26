


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
    // console.log('IS MATCHE', currentPath)
    // console.log(checkersArray[0])
    checkers.forEach((isMatch, index) => {
      // console.log('IS MATCHE', currentPath, isMatch(currentPath))
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
export function on(path, type = 'change', callback) {
  if (typeof type === 'function') {
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



// 
// 
// 
export function watch(pattern, type = 'change', callback) {
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



// Compiled patterns storage
// 
// Map {
//   `/user/*` : path => /\/user/.+/.test(path)
// }
const patternsCacheMap = new Map

// 
// 
// 
function getOrCreatePathPattern(pattern) {
  if (patternsCacheMap.has(pattern)) {
    return patternsCacheMap.get(pattern)
  }

  const regex = new RegExp(`^${
    pattern.split(
      PATH_SEPARATOR
    ).map(x => x.replace('*', '[a-zA-Z0-9\-_@]*')).join(`\/`)
    }$`)
  const isMatch = (path) => regex.test(path)
  patternsCacheMap.set(pattern, isMatch)
  return isMatch
}





// 
// 
// 
export function emit(path, type = 'change', payload, emitAllParents) {
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
const nextPatches = []

//
function addPatch(path, type, item) {
  nextPatches.push(
    createPatch(path, type, item)
  )
}

function createPatch(path, type, item) {
  createRollback(path, type, item)
  return REDO[HISTORY_COUNTER % MAX_CHANGES] = function () {

    // createRollback(path, type, item)

    if (type === 'push') {
      const arr = treeByPath(path)
      arr.push(createObj(item, path + PATH_SEPARATOR + arr.length))
      emitChanges(path, 'push', item)
    }

    // REDO[HISTORY_COUNTER % MAX_CHANGES] = {path, type, item}
  }
}


function createRollback(path, type, item) {
  UNDO[++HISTORY_COUNTER % MAX_CHANGES] = function () {
    if (type === 'push') {
      const arr = treeByPath(path)
      arr.pop()
      // emitChanges(path, 'pop', item)
    }
  }
}

// @todo
// perf test .shift vs iterator + .length = 0
// perf test setTimeout vs reqanimframe?
function applyPatches(recursive) {
  for (let patch; patch = nextPatches.shift(); patch());
  recursive && setTimeout(applyPatches)
}


function emitChanges(path, type, item) {
  path = parsePath(path)
  while (path.length) {
    selectByPath(path.join(PATH_SEPARATOR)).emit(type, item)
    path.pop()
  }

}

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

function parsePath(path) {
  if (typeof path === 'string') {
    return path.split(PATH_SEPARATOR) // parsedPathsCache[path] || (parsedPathsCache[path] = path.split(PATH_SEPARATOR))
  }
  return path
}


// @todo
// path function
function treeByPath(path) {
  path = parsePath(path)
  let result = tree
  path.forEach(p => {
    result = result[p]
    // typeof p !== 'function'
    // 	? result = result[p]
    // 	: result = result[p]
  })
  console.info(path, result);
  return result
}

function selectByPath(_path) {
  if (indexCursorsByPath[_path]) {
    return indexCursorsByPath[_path]
  }

  const path = parsePath(_path)
  let result = tree

  path.forEach(p => {
    typeof p !== 'function'
      ? result = result[p]
      : result = result[p]
  })

  return indexCursorsByPath[_path] = makeCursor(result, _path)
}

function makeCursor(obj, path) {
  const type = typeof obj
  if (obj === null) { return null }
  if (type === 'boolean') { return obj }
  if (type === 'string') { return obj }
  if (type === 'number') { return obj }
  if (type === 'undefined') { return obj }
  if (Array.isArray(obj)) {
    return new BrevnoArray(obj, path)
  }
  if (obj && typeof obj === 'object') {
    return new BrevnoObject(obj, path)
  }
}


function clone(obj) {
  return JSON.parse(JSON.stringify(obj))
}

function cloneInitial(obj) {
  return JSON.parse(JSON.stringify(obj))
}


BrevnoArray.prototype = new Event
function BrevnoArray(arr, path) {
  this._e = uniqID()
  this._path = path
  this.push = function (item) {
    addPatch(path, 'push', item)
    return this
  }
}


BrevnoObject.prototype = new Event
function BrevnoObject(arr, path) {
  this._e = uniqID()
  this._path = path
}



Brevno.prototype = new Event
function Brevno() {
  applyPatches(true)

  this.init = function (obj) {
    tree = createObj(cloneInitial(obj))
  }

  this.get = function () {
    return clone(tree)
  }

  this.select = function (path) {
    return selectByPath(path)
  }

  this.commit = applyPatches

  this.computed = function (paths, get) {
    let computedState = {}
    paths.forEach(p => {
      selectByPath(p).on('update', function () {
        computedState[p] = selectByPath(p).get()
      })
    })
  }

  this.undo = function () {
    UNDO[(HISTORY_COUNTER--) % MAX_CHANGES]()
  }

  this.redo = function () {
    REDO[++HISTORY_COUNTER % MAX_CHANGES]()
  }

}



// const log = console.log


// const state = new Brevno
// const initial = {
//   appID: 123,
//   user: ({
//     user_id: 1,
//     is_admin: true,
//     badges: [{ type: 1, label: 'best' }]
//   }),

//   items: [[1]]
// }

// state.init(initial)

// // Events test
// state.select('user/badges').on('push', function (i) { log("from user.badges:", i) })
// state.select('user').on('push', function (i) { log("from user:", i) })
// state.select('user/badges').push({ type: 2, label: 'yeah!' })
// state.select('items/0').push(42)
// state.commit()

// // Off events
// state.select('user/badges').off('push')
// state.select('user').off('push')

// log(state.get())