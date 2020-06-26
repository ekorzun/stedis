# Stedis


## Recipes

Stedis works as fast as possible using virtual trees.
However if you need maximum performance y'd better use normalized data structures. 

`/user/1/todos/2`
`/todos#user_1`

```typescript

describe(`/users/1`)
  .as('document')
  .withProps(
    'id', 'string, number, unique',
    'name', 'string, required, min 2'
  )

describe(`/users/1/todos/1`)
  .as('document')
  
describe(`/users`)
  .as('collection')
  .of(`/user/1`)
```