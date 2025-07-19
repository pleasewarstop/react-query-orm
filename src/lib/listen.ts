import { g } from "./g";
import { extractEvent } from "./extractEvent";
import { putToPath } from "./path";
import { qkString } from "./qk";
import { applyRelations } from "./relations";

export function listen(queryClient: any) {
  let update = {} as any;
  const updateSt = (st: string) => {
    if (update[st]) return;
    update[st] = true;
    const parents = g.parents[st];
    if (parents) {
      for (let parent in parents) {
        for (let path of parents[parent]) {
          g.cache[parent] = putToPath(g.cache[parent], g.cache[st], path);
        }
        updateSt(parent);
      }
    }
  };
  return queryClient.getQueryCache().subscribe((event: any) => {
    if (event.type !== "updated" || event.query.state.status !== "success")
      return;
    const evtSt = qkString(event.query.queryKey);
    if (update[evtSt]) return (update[evtSt] = false);
    try {
      extractEvent(event);
      applyRelations();
      update = {};
      for (let st in g.event.diff) {
        g.cache[st] = {
          ...g.cache[st],
          ...g.event.diff[st],
        };
      }
      for (let st in g.event.diff) {
        updateSt(st);
      }
      for (let updSt in update) {
        const updQK = g.stQK[updSt];
        if (queryClient.getQueryData(updQK))
          queryClient.setQueryData(
            updQK,
            g.config[updQK[0]].toRes(
              g.cache[updSt],
              queryClient.getQueryData(updQK)
            )
          );
        else delete update[updSt];
      }
    } catch (e) {
      console.log(e);
    }
  });
}
