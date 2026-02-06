import { Config, OrmItem } from "./typeNew";

interface Queries {
  cluster: {
    id: string;
    e:
      | { id: string; fromE: true }
      | {
          deep:
            | { deep: { id: string; fromDeepDeep: true } }
            | { id: string; fromDeep: true };
        };
  };
  host: {
    id: string;
    e: { id: string; fromHost: true };
  };
}

type Conf = {
  cluster: {
    one: () => Promise<Queries["cluster"]>;
    x: () => Queries["cluster"];
    toRes: (x: any) => any;
  };
  host: {
    one: () => Promise<Queries["host"]>;
    x: () => Queries["host"];
    toRes: (x: any) => any;
  };
};

const orm = createOrm<Conf>()({
  cluster: {
    e: (item) =>
      "fromE" in item
        ? "host"
        : {
            deep: (item) => ("deep" in item ? { deep: "host" } : "host"),
          },
  },
  host: {},
});

function createOrm<C extends Config>() {
  return function <T extends Orm<C> = Orm<C>>(orm: T): T {
    return orm;
  };
}
type Orm<C extends Config> = {
  [K in keyof C]: OrmItem<C, keyof C, K>;
};

type ExtractEntity<ORM, O, C, K extends string, Acc = never> = O extends K
  ? Acc | C
  : O extends (...args: any[]) => infer R
    ? ExtractEntity<ORM, R, C, K, Acc>
    : O extends object
      ? {
          [OK in keyof O]: ExtractEntity<
            ORM,
            O[OK],
            PickIfHasKey<C, OK>,
            K,
            Acc | PickIfHasKey<C, OK>
          >;
        }[keyof O]
      : Acc;

type PickIfHasKey<U, K extends PropertyKey> = U extends any
  ? K extends keyof U
    ? U[K]
    : never
  : never;

export type OKEntityPair<Q, O, K extends string, OK extends keyof O> = [
  ExtractEntity<O, O[OK], OK extends keyof Q ? Q[OK] : never, K>,
  OK,
];

type EntityPairs<Q, O, K extends string> =
  | {
      [OK in keyof O]: OKEntityPair<Q, O, K, OK>;
    }[keyof O]
  | [K extends keyof Q ? Q[K] : never, K];

function createExtract<Q, O>() {
  type Keys = keyof Q & string;

  type EntityPair<K extends Keys> = EntityPairs<Q, O, K>;

  type CB<K extends Keys> = (
    from: EntityPair<K>,
    to: EntityPair<K>,
  ) => void | EntityPair<K>[0];

  function extract<K extends Keys>(key: K, cb: CB<K>): void {
    // runtime-реализация не важна
  }

  return extract;
}

const extract = createExtract<Queries, typeof orm>();

extract("host", (from, [to, toKey]) => {
  if ("deep" in to) throw new Error("never");

  return protect<typeof to>(() => {
    if (toKey === "host") {
      return to;
    }
    if (toKey === "cluster") {
      return to;
    }
  });
});

const protect = <T>(cb: () => T | void) => cb();
