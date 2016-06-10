let tree = {}

let indexByID = {}
let indexByPath = {}
let indexCursorsByPath = {}
let indexCloneConstructors = {}
let parsedPathsCache = {}

const MAX_CHANGES = 1000
const REDO = {}
const UNDO = {}
let HISTORY_COUNTER = 0

// @todo a..zA..Z..0..99
// const alph = 'abcde'.split('')
const uniqID = new function() {
	let id = +new Date
	return () => id++
}

//
let eventStore = {}
function Event(){}

Event.prototype	= {

	e(){
		const e = this._e;
		return eventStore[e] || (eventStore[e] = {})
	},

	on(event, callback){
		let events = this.e();
		(events[event] || (events[event] = [])).push(callback)
	},


	off(event, callback){
		let events = this.e();
		events[event] && (
			callback
				? events[event].splice(events[event].indexOf(callback), 1)
				: (events[event].length = 0)
		)
	},


	emit(event /* , args... */){
		let events = this.e();
		if(events[event]) {
			for(var i = 0; i < events[event].length; i++){
				events[event][i].apply(this, Array.prototype.slice.call(arguments, 1));
			}
		}
	},

	get(){
		applyPatches()
		return clone(treeByPath(this._path))
	}
}


//
const nextPatches = []

//
function addPatch(path, type, item) {
	nextPatches.push(createPatch(path, type, item))
}

function createPatch(path, type, item) {
	createRollback(path, type, item)
	return REDO[HISTORY_COUNTER % MAX_CHANGES] = function(){

		// createRollback(path, type, item)

		if( type === 'push' ) {
			const arr = treeByPath(path)
			arr.push(createObj(item, path + '.' + arr.length))
			emitChanges(path, 'push', item)
		}

		// REDO[HISTORY_COUNTER % MAX_CHANGES] = {path, type, item}
	}
}


function createRollback(path, type, item) {
	UNDO[++HISTORY_COUNTER % MAX_CHANGES] = function(){
		if( type === 'push' ) {
			const arr = treeByPath(path)
			arr.pop()
			// emitChanges(path, 'pop', item)
		}
	}
}

// @todo
// perf test .shift vs iterator + .length = 0
// perf test setTimeout vs reqanimframe?
function applyPatches( recursive ){
	for(let patch; patch = nextPatches.shift(); patch());
	recursive && setTimeout(applyPatches, 1)
}


function emitChanges(path, type, item){
	path = parsePath(path)
	while(path.length) {
		selectByPath(path.join('.')).emit(type, item)
		path.pop()
	}

}

function createObj( obj, path ) {
	const type = typeof obj
	if(type === 'string') {return obj}
	if(type === 'number') {return obj}
	if(type === 'undefined') {return obj}
	if(Array.isArray(obj)) {return obj}
	if( obj && typeof obj === 'object') {
		obj._id = uniqID()
		path && (obj._path = path)
		// @todo
		// keys storage
		Object.keys(obj).forEach(key => {
			obj[key] = createObj(obj[key], path ? (path + '.' + key) : key)
		})
		indexByID[obj._id] = obj
	}
	return obj
}

function parsePath( path ) {
	if( typeof path === 'string' ) {
		return path.split('.') // parsedPathsCache[path] || (parsedPathsCache[path] = path.split('.'))
	}
	return path
}


// @todo
// path function
function treeByPath( path ) {
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

function selectByPath( _path ) {
	if( indexCursorsByPath[_path] ) {
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

function makeCursor( obj, path ){
	const type = typeof obj
	if(type === 'string') {return obj}
	if(type === 'number') {return obj}
	if(type === 'undefined') {return obj}
	if(Array.isArray(obj)) {
		return new BrevnoArray(obj, path)
	}
	if(obj && typeof obj === 'object') {
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
	this.push = function(item){
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
function Brevno(){
	applyPatches(true)

	this.init = function(obj){
		tree = createObj(cloneInitial(obj))
	}

	this.get = function(){
		return clone(tree)
	}

	this.select = function( path ){
		return selectByPath(path)
	}

	this.commit = applyPatches

	this.computed = function(paths, get){
		let computedState = {}
		paths.forEach(p => {
			selectByPath(p).on('update', function(){
				computedState[p] = selectByPath(p).get()
			})
		})
	}

	this.undo = function(){
		UNDO[(HISTORY_COUNTER--) % MAX_CHANGES]()
	}

	this.redo = function(){
		REDO[++HISTORY_COUNTER % MAX_CHANGES]()
	}

}






const state = new Brevno
const initial = {
	appID : 123,
	user : ({
		user_id : 1,
		is_admin: true,
		badges : [{type: 1, label: 'best'}]
	}),

	items : [[1]]
}

state.init(initial)

// Events test
state.select('user.badges').on('push', function(i){log("from user.badges:", i)})
state.select('user').on('push', function(i){log("from user:", i)})
state.select('user.badges').push({type:2, label:'yeah!'})
state.commit()

// Off events
state.select('user.badges').off('push')
state.select('user').off('push')
