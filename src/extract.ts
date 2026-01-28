interface Queries {
  cluster: {
    id: string;
    a: string;
    x: {
      x: {
        id: string;
        e: { id: string };
      };
    };
    z: { id: string };
  };
  host: { id: string; e: string };
  x: { id: string };
}

const orm = {
  cluster: {
    x: {
      x: deep("x", {
        e: "host",
      }),
    },
    z: "host",
  },
} as const;

type EntityKeys<O> = O extends object
  ? {
      [K in keyof O]: O[K] extends string ? O[K] : EntityKeys<O[K]>;
    }[keyof O]
  : never;

type ExtractEntity<T, O, E extends string> = O extends E
  ? T
  : O extends object
    ? {
        [K in keyof O]: ExtractEntity<
          K extends keyof T ? T[K] : never,
          O[K],
          E
        >;
      }[keyof O]
    : never;

type EntityPairs<Q, O, E extends string> = {
  [K in keyof O]: [ExtractEntity<K extends keyof Q ? Q[K] : never, O[K], E>, K];
}[keyof O];

function createExtract<Q, O>(orm: O) {
  type Keys = EntityKeys<O>;

  type CB<K extends Keys> = (
    arg: EntityPairs<Q, O, K>,
  ) => EntityPairs<Q, O, K>[0];

  function extract<K extends Keys>(key: K, cb: CB<K>): void {
    // runtime-реализация не важна для типизации
  }

  return extract;
}

const extract = createExtract<Queries, typeof orm>(orm);

// extract<HostTypes> - задание пользователем типов возвращаемого значения
extract("host", ([entity, key]) => {
  if (key === "cluster") {
    console.log(entity);
    return entity;
  }
  // if (key === "oke") {
  //   console.log(entity);
  //   return { id: "", e: "" };
  // }
  console.log(entity, key);
  return { id: "" };
});

extract("x", ([entity, key]) => {
  if (key === "cluster") {
    return entity;
  }
  return entity;
});
