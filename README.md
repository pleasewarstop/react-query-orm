generating `q` arguments for `useQuery(q.arg(param))` usage with convenient typed interface for synchronizing entity state between multiple useQuery hooks

concept

1. Entity is the main abstraction of the library. It is unit defined by id or combination of fields, present in different `useQuery` hooks
2. There are two hooks types: `one` for getting single entities and `many` for getting lists
3. One entities can contain others
4. New data received through a hook updates the same data in other hooks
5. Partially obtained entities can be used as placeholders in `one` hooks to improve ux

guide

1. Define entities in `config` using `one` and `many` functions

```js
import { one, many } from "./lib";

const config = {
  // one - for hook of cluster receiving
  cluster: one(
    // api function that will be passed to useQuery (see src/api.ts for an example)
    getCluster,
    // function that extracts entity from response
    (res) => res.data,
    // function for react-query data refresh from another queries
    (x, res) => ({ data: { ...res.data, ...x } }),
    // function for creating placeholder from instance
    (x) => ({ data: x }),
    // function that extracts id from instance
    (x) => x.id
  ),
  // many - for hook of clusters receiving
  clusters: many(
    // api function that will be passed to useQuery
    getClusters,
    // function that extracts entity from response
    (res) => res.data,
    // function that extracts id from instance
    (list) => ({ data: list })
  ),
  // one for host
  host: one(
    getHost,
    (res) => res.data,
    (x, res) => ({ data: { ...res.data, ...x } }),
    (x) => ({ data: x }),
    (x) => x.id
  ),
};
```

2. Bind entities of `one` specified in `config` to another queries. Using reactQueryOrm we create an object q with argFn: functions that return an argument for useQuery

```js
import { reactQueryOrm } from "./lib";

export const { q } = reactQueryOrm(config, {
  cluster: {
    // "host" field of cluster contains instance of host
    // cluster type is taken from structure getCluster
    host: "host",
  },
  // iterating the list, we determine which entity the elements belong to
  // and extract their id
  clusters: (x) => ["cluster", x.id], // autocompletion is present
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

cumulative updates affect 3 levels of nesting of relationships between entities

todo:

- tests upgrade
- instances removing
- useInfiniteQuery
- ?DeepPartial for x
