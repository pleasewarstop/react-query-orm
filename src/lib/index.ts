import { useEffect } from "react";
import { g } from "./g";
import { listen } from "./listen";
import { qkArgString, qkString } from "./qk";
import { AwaitedReturn, Config, OneOrMany, QItem } from "./type";
import { getPath } from "./path";

export function reactQueryOrm<C extends Config, K extends keyof C = keyof C>(
  config: C,
  orm: {
    [P in K]: OneOrMany<C, K, P>;
  }
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
        placeholderData: isOne ? getOnePlaceholder(qk) : undefined,
      };
    };
  }
  return { q };
}

function getOnePlaceholder(qk: string[]) {
  if (!g.queryClient) return undefined;
  const oneCache = g.queryClient.getQueryData(qk);
  if (oneCache) return oneCache;
  const placeholder = {} as any;
  const parents = g.parents[qkString(qk)] || [];
  // двойная вложенность, topFieldsParent вместо всех полей
  for (let parent in parents) {
    const parentQK = g.stQK[parent];
    const parentCache = g.queryClient.getQueryData(parentQK);
    if (!parentCache) {
      // подставляем данные из родителей родителя рекурсивно
      continue;
    }
    const parentItem = (g.config[parentQK[0]].x || g.config[parentQK[0]].list)(
      parentCache
    );
    for (let path of parents[parent]) {
      const item = getPath(parentItem, path);
      for (let key in item) {
        placeholder[key] = item[key];
      }
    }
  }
  return (g.config[qk[0]] as any).toRes?.(placeholder);
}

export function useReactQueryOrm(queryClient: any) {
  useEffect(() => listen(queryClient), [queryClient]);
}

export function one<
  One extends (a: any) => any,
  X extends (x: AwaitedReturn<One>) => any,
  ToRes extends (x: Partial<ReturnType<X>>) => any,
  Id extends (x: ReturnType<X>) => any
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
