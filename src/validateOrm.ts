import { createOrm } from "./extract";
import { inst, take } from "./typeNew";

interface Entitiess {
  cluster: {
    id: string;
    ec:
      | {
          id: string;
          fromE: true;
          c: { id: string; clusterDeepFromFn: true };
        }
      | {
          deep: { id: string; fromDeep: true };
        };
  };
  host: {
    id: string;
    j: {
      id: string;
      clusterShallow: true;
      ec:
        | { id: string; fromE: true; fromInnerCluster: true }
        | {
            deep: { id: string; fromDeepp: true };
          };
    };
  };
}

type Conff = {
  cluster: {
    one: () => Promise<Entitiess["cluster"]>;
    x: () => Entitiess["cluster"];
    toRes: (x: any) => any;
  };
  host: {
    one: () => Promise<Entitiess["host"]>;
    x: () => Entitiess["host"];
    toRes: (x: any) => any;
  };
};

const ormm = createOrm<Conff>()({
  host: {
    j: inst("cluster", {
      ec: (item) =>
        "fromE" in item ? take("host", item) : take({ deep: "host" }, item),
    }),
  },
  cluster: {
    ec: (item) =>
      "fromE" in item ? take("host", item) : take({ deep: "host" }, item),
  },
});

type AnyFn = (...args: any[]) => any;

export type ValidateOrm<C, ORM> =
  HasInvalid<ValidateNodes<C, ORM>> extends true ? false : true;

export type ValidateNodes<C, ORM> = {
  [K in keyof ORM]: ValidateNode<
    ORM,
    K,
    ORM[K],
    K extends keyof C ? C[K] : never,
    null,
    false
  >;
};

// если O extends K ошибка

// если в orm[x] есть union-функция
// то orm[y]....x должен быть inst с union-функцией
type ValidateNode<
  ORM,
  Key,
  O,
  C,
  InstC,
  Entered extends boolean,
> = C extends never
  ? O
  : O extends {
        __orm_inst_node: true;
        parent: infer P;
        childs: infer Ch;
      }
    ? P extends keyof ORM
      ? ValidateNode<ORM, Key, ORM[P], C, Ch, true>
      : never
    : O extends (...args: infer A) => infer R
      ? R extends [infer RO, infer RC]
        ? (...args: A) => [ValidateNode<ORM, Key, RO, C, InstC, Entered>, RC]
        : never
      : O extends keyof ORM
        ? ValidateNode<ORM, Key, ORM[O], C, InstC, true>
        : O extends object
          ? {
              [K in keyof O]: K extends keyof C
                ? O[K] extends AnyFn
                  ? Entered extends true
                    ? K extends keyof InstC
                      ? InstC[K] extends AnyFn
                        ? ValidateNode<ORM, Key, O[K], C[K], InstC[K], Entered>
                        : Invalid
                      : InstC extends {
                            __orm_inst_node: true;
                            childs: infer Ch;
                          }
                        ? K extends keyof Ch
                          ? ValidateNode<ORM, Key, O[K], C[K], Ch[K], Entered>
                          : never
                        : InstC extends (...args: infer A) => infer R
                          ? R extends [any, infer RC]
                            ? K extends keyof RC
                              ? (
                                  ...args: A
                                ) => [
                                  ValidateNode<
                                    ORM,
                                    Key,
                                    O[K],
                                    C[K],
                                    RC[K],
                                    Entered
                                  >,
                                  RC,
                                ]
                              : never
                            : never
                          : Invalid
                    : ValidateNode<
                        ORM,
                        Key,
                        O[K],
                        C[K],
                        InstC extends null
                          ? null
                          : K extends keyof InstC
                            ? InstC[K]
                            : null,
                        Entered
                      >
                  : ValidateNode<
                      ORM,
                      Key,
                      O[K],
                      C[K],
                      InstC extends null
                        ? null
                        : K extends keyof InstC
                          ? InstC[K]
                          : null,
                      Entered
                    >
                : O[K];
            }
          : O;

const invalid: unique symbol = Symbol("invalid");
type Invalid = typeof invalid;
type v = ValidateOrm<Entitiess, typeof ormm>;
type q = HasInvalid<v>;
type e = HasInvalid<{
  j: Invalid;
  e: true;
  ec: (item: true) => { e: true };
}>;

export type HasInvalid<T> = T extends Invalid
  ? true
  : T extends (...args: infer A) => infer R
    ? HasInvalid<A> extends true
      ? true
      : HasInvalid<R>
    : T extends readonly (infer U)[]
      ? HasInvalid<U>
      : T extends object
        ? OrObject<{ [K in keyof T]: HasInvalid<T[K]> }>
        : false;

export type IfValid<C, T> =
  HasInvalid<ValidateOrm<C, T>> extends true
    ? {
        __err: "Invalid ORM";
        __: ValidateOrm<C, T>;
      }
    : T;

type OrObject<U> = U[keyof U] extends true
  ? true
  : U[keyof U] extends false
    ? false
    : true;
