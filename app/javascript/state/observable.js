import meta from '../meta'
import { dispatch, stateEvents as events } from '../events'

let head

function observable(object, parent = null) {
  if (!object || typeof object !== 'object') return object

  const proxy = new Proxy(object, {
    deleteProperty(target, key) {
      delete target[key]
      dispatch(events.stateChange, meta.element, { detail: { state: head } })
      return true
    },

    set(target, key, value, receiver) {
      target[key] = observable(value, this)
      dispatch(events.stateChange, meta.element, { detail: { state: head } })
      return true
    }
  })

  if (Array.isArray(object)) {
    object.forEach((value, index) => (object[index] = observable(value, proxy)))
  } else if (typeof object === 'object') {
    for (const [key, value] of Object.entries(object)) object[key] = observable(value, proxy)
  }

  if (!parent) head = proxy
  return proxy
}

export default observable
