import { g } from "./g";
import { extractEvent } from "./extractEvent";
import { qkArgString, qkString } from "./qk";

export function listen(queryClient: any) {
  g.queryClient = queryClient;
  let update = {} as any;

  return queryClient.getQueryCache().subscribe((event: any) => {
    if (event.type !== "updated" || event.query.state.status !== "success")
      return;
    const { queryKey, state } = event.query;
    const evtSt = qkString(queryKey);
    if (g.dataUpdatedAt[evtSt] === state.dataUpdatedAt) return;
    g.dataUpdatedAt[evtSt] = state.dataUpdatedAt;

    if (update[evtSt]) return delete update[evtSt];
    try {
      update = {};
      extractEvent(event);

      const configItem = g.config[queryKey[0]];
      const evtX = configItem.x
        ? configItem.x(state.data)
        : configItem.list(state.data);

      for (let st in g.event.updatedQueries) {
        const qk = g.stQK[st];
        const cache = queryClient.getQueryData(qk);
        const x = (g.config[qk[0]].x || g.config[qk[0]].list)(cache);

        update[st] = true;
        queryClient.setQueryData(
          qk,
          g.config[qk[0]].toRes(
            withUpdates(evtSt, evtX, st, x, g.orm[qk[0]]),
            cache
          )
        );
      }
    } catch (e) {
      console.log(e);
    }
  });
}

function withUpdates(evtSt: any, evtX: any, qkSt: any, obj: any, deps: any) {
  const diff = qkSt in g.event.diffs ? g.event.diffs[qkSt] : obj;
  return withInnerUpdates(evtSt, evtX, qkSt, obj, diff, deps);
}
function withInnerUpdates(
  evtSt: any,
  evtX: any,
  qkSt: any,
  obj: any,
  diff: any,
  deps: any
) {
  if (!diff) return diff;
  const updated = (Array.isArray(diff) ? [] : {}) as any;
  for (let key in obj) {
    if (Array.isArray(obj[key])) {
      const keyDeps = deps?.[key];
      const isDep = Array.isArray(keyDeps);
      if (isDep) {
        // updated[key] = key in diff ? diff[key].map(keyDiff => )
      }
    } else if (isPlainObject(obj[key])) {
      const keyDeps = deps?.[key];
      const isDep = typeof keyDeps === "string";
      if (isDep) {
        // случай удаления
        const id = (g.config as any)[keyDeps].id(diff?.[key] || obj[key]);
        updated[key] = withUpdates(
          evtSt,
          evtX,
          qkString([keyDeps, qkArgString(id)]),
          obj[key],
          g.orm[keyDeps]
        );
      } else {
        updated[key] =
          key in diff
            ? withInnerUpdates(evtSt, evtX, qkSt, obj[key], diff[key], keyDeps)
            : obj[key];
      }
    } else updated[key] = key in diff ? diff[key] : obj[key];
  }
  return updated;
}

function isPlainObject(x: any) {
  return x?.__proto__ === ({} as any).__proto__;
}
