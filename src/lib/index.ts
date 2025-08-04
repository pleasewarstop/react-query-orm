import { useEffect } from "react";
import { g } from "./g";
import { listen } from "./listen";
import { qkArgString, qkString } from "./qk";
import { AwaitedReturn, Config, OneOrMany, QObj } from "./t";

export function reactQueryOrm<C extends Config, K extends keyof C = keyof C>(
  config: C,
  orm: {
    [P in K]: OneOrMany<C, K, P>;
  }
) {
  g.config = config;
  g.orm = orm;
  const q: {
    [P in K]: QObj<C, P>;
  } = {} as any;
  for (let key in config) {
    const item = config[key];
    const queryFn = "one" in item ? item.one : item.many;
    // @ts-expect-error
    q[key] = (param: any) => {
      const qkArgSt = qkArgString(param);
      const qk = [key, qkArgSt];
      const x = g.cache[qkString(qk)];
      return {
        queryKey: qk,
        queryFn: () => queryFn(param),
        placeholderData: x && (config[key] as any).toRes?.(x),
      };
    };
  }
  return { q };
}

export function useReactQueryOrm(queryClient: any) {
  useEffect(() => listen(queryClient), [queryClient]);
}

// DeepPartial for x
export function one<
  One extends (a: any) => any,
  X extends (x: AwaitedReturn<One>) => any,
  Id extends (x: ReturnType<X>) => any,
  ToRes = (x: Partial<ReturnType<X>>) => any
>(one: One, x: X, toRes: ToRes, id?: Id) {
  return { one, x, toRes, id: id || ((x: any) => x.id as Id) };
}

export function many<
  Many extends (...args: any[]) => any,
  List extends (res: AwaitedReturn<Many>) => any,
  ToRes extends (list: ReturnType<List>, res: ReturnType<Many>) => any
>(many: Many, list: List, toRes: ToRes) {
  return { many, list, toRes };
}
