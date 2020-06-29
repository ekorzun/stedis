# Stedis proposals

## children event type

## retag
Reverse tag: Shortcut for tag / untag

## Context builder API
```typescript
context(`/tasks`)
  .tag({
    inbox: t => !t.board,
    progress: t => t.board === 'progress',
    done: t => t.board === 'done',
    my: t => t.user === 1
  })
  .set(`/1`, { id: 1, title: 'new', user: 2 })
  .on(`/*`, e => {})
```

## Schemas (Plugin?)
-
```typescript

validator('email', p => p.indexOf('@') > -1)
  .extends(`string`)

schema(`/user/*`, {
  name: 'required, string',
  email: 'required, email'
})

forceSchema(`/user`, `tree`)
set(`/user`, {name: 'John'})
get(`/user/name`) === `John`
```


## Transforms

### Get
```typescript
transformGet(`/user/*`, user => {
  ...user,
  user_id: user.id
})
```

### Set
```typescript
transformSet(`/user/*`, user => {
  ...user,
  password_confirmation: user.password
})
```

## Strict mode vs Soft/Magic mode
-

## Async setters (?)
-

## Shared Queue
-

## Aliases
```typescript
alias(`/user/1/tasks#my`, `/mytasks`)
get(`/mytasks`)
```

## Relation shortcut for tagged collections
```typescript
// bords/1
// tasks/2 = {board_id: 1}

relation(`/boards/*`)
  .hasMany(`/tasks/*`)
  .by(`board_id`)

get(`/boards/1/tasks`) === [{board_id: 1}]
```

## Silent setters
-

## Plugin system
-
```typescript
createPlugin(set, (path, value) => {

})
```

## Workers
Multiple web workers for concurrent event processing.
Need to make an experiment.


## History and transaction rollbacks (Plugin?)
-

## Persistance plugin
-

## Search / graph plugin
-
