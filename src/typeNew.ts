import type { QueryFunctionContext } from "@tanstack/react-query";

export type Config = Record<
  string,
  | {
      one: (...args: any[]) => any;
      x: (arg: any) => any;
      toRes: (x: any) => any;
    }
  | { many: (...args: any[]) => any }
>;

export type OrmItem<
  C extends Config,
  AllKeys extends keyof C,
  K extends AllKeys,
> = C[K] extends { one: (...args: any[]) => any; x: (arg: any) => any }
  ? OrmNode<C, X<C[K]>>
  : any; //OrmManyItem<C, K>;

type FirstArg<F extends (...args: any) => any> =
  Parameters<F> extends [] ? undefined : Parameters<F>[0];

type IsOptionalArg<F extends (...args: any) => any> =
  Parameters<F> extends [] ? true : false;

export type QItem<C extends Config, K extends keyof C> = C[K] extends {
  one: infer OneFn extends (...args: any) => any;
}
  ? IsOptionalArg<OneFn> extends true
    ? (arg?: FirstArg<OneFn>) => {
        queryKey: [K, FirstArg<OneFn>];
        queryFn: (
          ctx: QueryFunctionContext<[K, FirstArg<OneFn>]>,
        ) => AwaitedReturn<OneFn>;
        placeholderData?: AwaitedReturn<OneFn>;
      }
    : (arg: FirstArg<OneFn>) => {
        queryKey: [K, FirstArg<OneFn>];
        queryFn: (
          ctx: QueryFunctionContext<[K, FirstArg<OneFn>]>,
        ) => AwaitedReturn<OneFn>;
        placeholderData?: AwaitedReturn<OneFn>;
      }
  : C[K] extends { many: infer ManyFn extends (...args: any) => any }
    ? IsOptionalArg<ManyFn> extends true
      ? (arg?: FirstArg<ManyFn>) => {
          queryKey: [K, FirstArg<ManyFn>];
          queryFn: (
            ctx: QueryFunctionContext<[K, FirstArg<ManyFn>]>,
          ) => AwaitedReturn<ManyFn>;
          placeholderData?: AwaitedReturn<ManyFn>;
        }
      : (arg: FirstArg<ManyFn>) => {
          queryKey: [K, FirstArg<ManyFn>];
          queryFn: (
            ctx: QueryFunctionContext<[K, FirstArg<ManyFn>]>,
          ) => AwaitedReturn<ManyFn>;
          placeholderData?: AwaitedReturn<ManyFn>;
        }
    : never;

export type AwaitedReturn<T> = T extends (...args: any[]) => Promise<infer R>
  ? R
  : T extends (...args: any[]) => infer R
    ? R
    : never;

export type X<T> = T extends { x: (arg: any) => any }
  ? ReturnType<T["x"]>
  : never;

type Child<T> = T extends (infer U)[] ? U : never;

type OrmListItem<C extends Config, T> = [keyof C | OrmListFn<C, T>];

type OrmListFn<C extends Config, T> = (arg: Child<T>) => keyof C;

export function inst<P extends string, Ch extends object>(
  parent: P,
  childs: Ch,
): { parent: P; childs: Ch; __orm_inst_node: true } {
  return { parent, childs, __orm_inst_node: true };
}

export function take<O, I>(
  orm: O,
  typedItem: (IsUnion<I> extends true
    ? { __err: "Type must not be union" }
    : unknown) &
    I,
): [O, I] {
  return [orm, typedItem];
}

type IsUnion<T, U extends T = T> = (
  T extends any ? (U extends T ? false : true) : never
) extends false
  ? false
  : true;

type UnionFn<C extends Config, T, R extends T = T> = (
  item: T,
) => [OrmNode<C, R>, R];

type DeepChilds<C extends Config, T> = PartialNode<C, T>;

type DeepNode<
  C extends Config,
  T,
  P extends keyof C,
  Ch extends DeepChilds<C, T> = DeepChilds<C, T>,
> = {
  parent: P;
  childs: Ch;
  __orm_inst_node: true;
};

type OrmNode<C extends Config, T> =
  | keyof C
  | UnionFn<C, T>
  | DeepNode<C, T, keyof C, PartialNode<C, T>>
  | OrmListItem<C, T>
  | (T extends object ? PartialNode<C, T> : never);

type PartialNode<C extends Config, T> = {
  [K in keyof T]?: OrmNode<C, T[K]>;
};
