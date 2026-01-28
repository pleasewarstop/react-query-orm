1. Типизация merge-функции (чтобы в prev/to попадали типы которые есть в ключах)
2. Запретить примитивы в orm

# Conclusion after the research

Because in some cases a nested structure must be fully replaced, while in other cases it is logically correct to update only the changed fields, it is not possible to implement a universal type-safe merge strategy. An ORM with such an interface can lead to incorrect updates and subtle bugs. From an architectural perspective, writing each update explicitly is a more correct and reliable approach.

## goals

Generating `q` arguments for `useQuery(q.arg(param))` usage with convenient typed interface for synchronizing entity state between multiple useQuery hooks

`npm i && npm start` for start test

## concept

1. Entity is the main abstraction of the library. It is unit defined by id or combination of fields, present in different `useQuery` hooks
2. There are two hooks types: `one` for getting single entities and `many` for getting lists
3. One entities can contain others
4. New data received through a hook updates the same data in other hooks
5. Partially obtained entities can be used as placeholders in `one` hooks to improve ux

## guide

1. Define entities and lists in `config` using `one` and `many` functions

```js
import { one, many } from "./lib";

const config = {
  // one - for hook of cluster receiving
  cluster: one(
    // api function that will be passed to useQuery (see src/api.ts for an example)
    getCluster,
    // extracts entity from response
    (res) => res.data,
    // create response from instance
    (x) => ({ data: x }),
    // extracts id from instance
    (x) => x.id,
  ),
  // many - for hook of clusters receiving
  clusters: many(
    // api will be passed to useQuery
    getClusters,
    // extracts entity from response
    (res) => res.data,
    // create response from instance
    (list) => ({ data: list }),
  ),
  host: one(
    getHost,
    (res) => res.data,
    (x) => ({ data: x }),
    // you can miss id function if id field is "id"
  ),
};
```

2. Bind entities of `one` specified in `config` to another queries. Using reactQueryOrm we create an object `q` with argFn: functions that return an argument for useQuery

```js
import { reactQueryOrm } from "./lib";

export const { q } = reactQueryOrm(config, {
  cluster: {
    // "host" field of cluster query contains instance of host
    // cluster type is taken from getCluster structure
    host: "host",
  },
  // in clusters query we get list of clusters
  clusters: ["cluster"],
});
```

3. Listen updates through the useReactQueryOrm

```js
import { useReactQueryOrm } from "./lib";

export function App() {
  useReactQueryOrm(queryClient);
  // ...
}
```

4. Use `q.api(arg)` results in useQuery

```js
function Component() {
  const { data: cluster } = useQuery(q.cluster(1));
  const { data: host, placeholder: hostP } = useQuery({
    ...q.host(1),
    enabled: !!cluster,
  });
}
```
