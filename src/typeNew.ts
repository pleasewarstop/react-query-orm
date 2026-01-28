import type { QueryFunctionContext } from "@tanstack/react-query";

export type Config = Record<RecordKey, ConfigItem>;

export type OrmItem<
  C extends Config,
  AllKeys extends keyof C,
  K extends AllKeys,
> = C[K] extends { one: (...args: any[]) => any; x: (arg: any) => any }
  ? PartialWithKeysReplacing<OneXResult<C[K]>, C>
  : OrmManyItem<C, K>;

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

type RecordKey = string | number | symbol;

type ConfigItem =
  | {
      one: (...args: any[]) => any;
      x: (arg: any) => any;
      toRes: (x: any) => any;
    }
  | { many: (...args: any[]) => any };

export type OneXResult<T> = T extends { x: (arg: any) => any }
  ? ReturnType<T["x"]>
  : never;

type ListItem<T> = T extends { list: (arg: any) => any }
  ? ReturnType<T["list"]>
  : never;

type Child<T> = T extends (infer U)[] ? U : never;

type OrmManyItem<C extends Config, K extends keyof C> = [
  keyof C | OrmManyFn<C, K>,
];

type OrmManyFn<C extends Config, K extends keyof C> = (
  item: Child<ListItem<C[K]>>,
) => keyof C;

type OrmListItem<C extends Config, T> = [keyof C | OrmListFn<C, T>];

type OrmListFn<C extends Config, T> = (arg: Child<T>) => keyof C;

export class Deep<P, T> {
  parent: P;
  childs: T;
  constructor(parent: P, childs: T) {
    this.parent = parent;
    this.childs = childs;
  }
}

type ReplaceWithKey<T, C extends Config> =
  T extends Deep<any, any>
    ? Deep<keyof C, T>
    : T extends object
      ? keyof C | OrmListItem<C, T> | PartialWithKeysReplacing<T, C>
      : keyof C | OrmListItem<C, T>;

export type PartialWithKeysReplacing<T, C extends Config> = {
  [K in keyof T]?: ReplaceWithKey<T[K], C>;
};
