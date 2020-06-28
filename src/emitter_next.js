
const shouldFireTimes = {}
const handlerIds = {}
const handlerKeys = {}

const compiledEmits = {}

export function emit(path, type = 'change', payload) {

  const key = `${path}:${type}`
    // console.log(key)
    ;
  (compiledEmits[key] || (
    compiledEmits[key] = (function (key) {
      const cbs = handlerKeys[key]
      const arr = []
      if (cbs) {
        for (let x = -1, l = cbs.length; x < l; x++) {
          const id = cbs[x]
          const cb = handlerIds[id]
          for (let i = -1, t = shouldFireTimes[id]; ++i < t;) {
            arr.push(cb)
          }
        }
      }
      return payload => {
        let i = arr.length
        while (i--) {
          arr[i](payload)
        }
      }
    })(key)
  ))(payload)
}

export function on(path, type, handler) {
  if (typeof type === 'function') {
    handler = type
    type = 'change'
  }
  let ns = globalEventsMap.get(path)
  if (!ns) {
    ns = new Map
    // ns.set(type, [])
    ns.set(type, new Map)
    globalEventsMap.set(path, ns)
    ns = ns.get(type)
  }
  // ns.get(type).set(handler, (ns.get(type).get(handler) || 0) + 1)
  const key = `${path}:${type}`

  let id = ns.get(handler)

  if (!id) {
    id = uniqID()
    ns.set(handler, id)
    handlerIds[id] = handler;


    if (!handlerKeys[key]) {
      handlerKeys[key] = []
    }

    handlerKeys[key].push(id)

  }

  shouldFireTimes[id] = (shouldFireTimes[id] || 0) + 1


  return () => {

    if (shouldFireTimes[id] === 1) {
      delete shouldFireTimes[id]
    } else {
      if (shouldFireTimes[id] > 1) {
        shouldFireTimes[id]--
      }
    }

    console.log("OFF", key, id, handlerKeys[key])

    handlerKeys[key] = handlerKeys[key].filter(x => x !== id)

    if (handlerKeys[key].length === 0) {
      delete handlerKeys[key]
    }

    ns.delete(handler)
    delete compiledEmits[key]

    // globalEventsMap
    //   .get(path)
    //   .get(type)
    //   .delete(handler)
  }
}


export function once(path, type, callback) {
  if (typeof type === 'function') {
    callback = type
    type = 'change'
  }
  console.log("ONCE")
  const off = on(path, type, (e) => {
    console.log("OOFFOFOFOFOFO")
    callback(e)
    off()
  })
}
