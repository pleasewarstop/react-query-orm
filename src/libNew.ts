import { useEffect } from "react";
import { g } from "./lib/g";
import { listen } from "./lib/listen";
import { qkArgString } from "./lib/qk";
import { AwaitedReturn, Config, OrmItem, QItem } from "./typeNew";

export function reactQueryOrm<C extends Config, K extends keyof C = keyof C>(
  config: C,
  orm: {
    [P in K]: OrmItem<C, K, P>;
  },
) {
  g.config = config;
  g.orm = orm;
  const q: {
    [P in K]: QItem<C, P>;
  } = {} as any;
  for (let key in config) {
    const item = config[key];
    const isOne = "one" in item;
    const queryFn = isOne ? item.one : item.many;
    (q as any)[key] = (param: any) => {
      const qkArgSt = qkArgString(param);
      const qk = [key, qkArgSt];
      return {
        queryKey: qk,
        queryFn: () => queryFn(param),
      };
    };
  }
  return { q };
}

export function useReactQueryOrm(queryClient: any) {
  useEffect(() => listen(queryClient), [queryClient]);
}

export function one<
  One extends (a: any) => any,
  X extends (x: AwaitedReturn<One>) => any,
  ToRes extends (x: Partial<ReturnType<X>>) => any,
  Id extends (x: ReturnType<X>) => any,
>(one: One, x: X, toRes: ToRes, id?: Id) {
  return { one, x, toRes, id: id || ((x: any) => x.id as Id) };
}

export function many<
  Many extends (...args: any[]) => any,
  List extends (res: AwaitedReturn<Many>) => any,
  ToRes extends (list: ReturnType<List>, res: ReturnType<Many>) => any,
>(many: Many, list: List, toRes: ToRes) {
  return { many, list, toRes };
}
