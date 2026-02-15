import { Config, OrmItem, inst, take } from "./typeNew";
import { ValidateOrm, ValidateNodes } from "./validateOrm";

interface Entities {
  cluster: {
    id: string;
    ec:
      | {
          id: string;
          fromE: true;
          j: {
            id: string;
            clusterDeepFromFn: true;
            ec:
              | {
                  id: string;
                  fromE: true;
                }
              | {
                  deep:
                    | { deep: { id: string; fromDeepDeep: true } }
                    | { id: string; fromDeep: true };
                };
          };
        }
      | {
          deep:
            | { deep: { id: string; fromDeepDeep: true } }
            | { id: string; fromDeep: true };
        };
  };
  host: {
    id: string;
    eh: {
      id: string;
      fromHost: true;
      j: { id: string; clusterDeepRecursive: true };
      hostDeepCluster: {
        id: string;
        ec:
          | { id: string; fromInnerCluster: true }
          | {
              deep:
                | { deep: { id: string; fromDeepDeepp: true } }
                | { id: string; fromDeepp: true };
            };
      };
    };
    j: {
      id: string;
      clusterShallow: true;
      ec:
        | { id: string; fromInnerCluster: true }
        | {
            deep:
              | { deep: { id: string; fromDeepDeepp: true } }
              | { id: string; fromDeepp: true };
          };
    };
  };
}

type Conf = {
  cluster: {
    one: () => Promise<Entities["cluster"]>;
    x: () => Entities["cluster"];
    toRes: (x: any) => any;
  };
  host: {
    one: () => Promise<Entities["host"]>;
    x: () => Entities["host"];
    toRes: (x: any) => any;
  };
};

const orm = createOrm<Conf>()({
  cluster: {
    ec: (item) =>
      "fromE" in item
        ? take(
            inst("host", {
              j: inst("cluster", {
                ec: (item) =>
                  "fromE" in item
                    ? take("host", item)
                    : take(
                        {
                          deep: (item) =>
                            "deep" in item
                              ? take({ deep: "host" }, item)
                              : take("host", item),
                        },
                        item,
                      ),
              }),
            }),
            item,
          )
        : take(
            {
              deep: (item) =>
                "deep" in item
                  ? take({ deep: "host" }, item)
                  : take("host", item),
            },
            item,
          ),
  },
  host: {
    eh: inst("host", {
      hostDeepCluster: inst("cluster", {
        ec: (item) =>
          "fromInnerCluster" in item
            ? take("host", item)
            : take(
                {
                  deep: (item) =>
                    "fromDeepp" in item
                      ? take({ deep: "host" }, item)
                      : take("host", item),
                },
                item,
              ),
      }),
    }),
    j: /*inst(*/ "cluster" /*, {
        ec: (item) =>
          "fromInnerCluster" in item
            ? take("host", item)
            : take(
                {
                  deep: (item) =>
                    "fromDeepp" in item
                      ? take({ deep: "host" }, item)
                      : take("host", item),
                },
                item,
              ),
    }),*/,
  },
});

type J = ValidateNodes<Entities, typeof orm>;

type V = ValidateOrm<Entities, typeof orm>;

export function createOrm<C extends Config>() {
  return function <T extends Orm<C> = Orm<C>>(orm: T): T {
    return orm;
  };
}

const extract = createExtract<Entities, typeof orm>();

extract("host", ([to, toKey], host) => {
  return protect<typeof to>(() => {
    if (toKey === "host") {
      return to;
    }
    if (toKey === "cluster") {
      return to;
    }
  });
});

extract("cluster", ([to, toKey], cluster) => {
  return protect<typeof to>(() => to);
});

const protect = <T>(cb: () => T | void) => cb();

function createExtract<Q, O>() {
  type Keys = keyof Q & keyof O & string;

  type EntityPair<K extends Keys> = EntityPairs<Q, O, K>;

  type CB<K extends Keys> = (
    from: EntityPair<K>,
    to: EntityPair<K>,
  ) => void | EntityPair<K>[0];

  function extract<K extends Keys>(key: K, cb: CB<K>): void {}

  return extract;
}

type Orm<C extends Config> = {
  [K in keyof C]: OrmItem<C, keyof C, K>;
};

type ExtractEntity<
  ORM,
  O,
  C,
  K extends keyof ORM,
  Acc = never,
> = C extends never
  ? Acc
  : IsUnionMember<C, Acc> extends true
    ? Acc
    : O extends K
      ? ExtractEntity<ORM, ORM[O], C, K, Acc | C>
      : O extends {
            __orm_inst_node: true;
            parent: infer P;
            childs: infer Ch;
          }
        ? ExtractEntity<ORM, Ch, C, K, Acc> | (P extends K ? C : never)
        : // | (P extends keyof ORM ? ExtractEntity<ORM, ORM[P], C, K, Acc> : never)
          O extends (...args: any[]) => infer R
          ? R extends [infer RO, infer RC]
            ? ExtractEntity<ORM, RO, RC, K, Acc>
            : never
          : O extends object
            ?
                | {
                    [OK in keyof O]: PickIfHasKey<C, OK> extends never
                      ? never
                      : ExtractEntity<ORM, O[OK], PickIfHasKey<C, OK>, K, Acc>;
                  }[keyof O]
                | Acc
            : O extends keyof ORM
              ? ExtractEntity<ORM, ORM[O], C, K, Acc>
              : Acc;

type IsEqual<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2
    ? true
    : false;
type IsMember<T, U> = U extends any
  ? IsEqual<T, U> extends true
    ? true
    : false
  : never;

type IsUnionMember<T, U> = true extends IsMember<T, U> ? true : false;

type PickIfHasKey<U, K extends PropertyKey> = U extends any
  ? K extends keyof U
    ? U[K]
    : never
  : never;

type EntityPairs<Q, O, K extends keyof O> =
  | {
      [OK in keyof O]: [
        ExtractEntity<O, O[OK], OK extends keyof Q ? Q[OK] : never, K>,
        OK,
      ];
    }[keyof O]
  | [K extends keyof Q ? Q[K] : never, K];
