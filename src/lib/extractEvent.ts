import { g } from "./g";
import { qkArgString, qkString } from "./qk";
import { addRelation, getChildOnPath, removeRelation } from "./relations";

export function extractEvent(event: any) {
  const { queryKey, state } = event.query;
  const st = qkString(queryKey);
  const configItem = g.config[queryKey[0]];
  const diff = (configItem.x || configItem.list)(state.data);
  const deps = g.orm[queryKey[0]];

  g.event = { diffs: {}, updatedQueries: {} };
  g.stQK[st] = queryKey;
  g.queries[st] = true;
  g.event.diffs[st] = diff;

  if (configItem.one) {
    addUpdatedQueries(qkString(queryKey));
    if (deps) applyDeps(queryKey, deps, diff);
  } else applyArray(queryKey, diff, deps, []);

  delete g.event.updatedQueries[st];
}

function applyDeps(qk: any, deps: any, diff: any, path: any[] = []) {
  for (let key in deps) {
    if (["string"].includes(typeof deps[key]) || Array.isArray(deps[key])) {
      applyDep(qk, key, deps[key], diff, [key]);
    } else {
      if (diff) applyDeps(qk, deps[key], diff[key], [...path, key]);
    }
  }
}

function applyDep(
  qk: any,
  depKey: any,
  dep: any,
  parentDiff: any,
  path: any[]
) {
  if (!parentDiff?.hasOwnProperty(depKey)) return;
  const diff = parentDiff?.[depKey];
  if (!diff) return;

  if (typeof dep === "string") {
    const childArgString = qkArgString(g.config[dep].id(diff));
    const childQK = [dep, childArgString];
    applyChild(qk, childQK, diff, path);
  } else if (Array.isArray(dep)) {
    applyArray(qk, diff, dep, path);
  }
}

function applyChild(qk: any, childQK: any, childDiff: any, path: any[]) {
  const st = qkString(qk);
  const childSt = qkString(childQK);
  const prevSt = getChildOnPath(st, path);
  addRelation(st, childSt, path);
  if (childSt !== prevSt) removeRelation(st, prevSt, path);
  addUpdatedQueries(childSt);

  g.stQK[childSt] = childQK;
  g.event.diffs[childSt] = g.event.diffs[childSt]
    ? {
        ...g.event.diffs[childSt],
        ...childDiff,
      }
    : childDiff;

  const deps = g.orm[childQK[0]];
  if (deps) applyDeps(childQK, deps, childDiff, path);
}

function applyArray(qk: any, childDiff: any, dep: any, path: any[]) {
  const itemOrm = dep[0];
  const len = childDiff.length;
  for (let i = 0; i < len; i++) {
    const id = g.config[itemOrm].id(childDiff[i]);
    const itemQK = [itemOrm, qkArgString(id)];
    applyChild(qk, itemQK, childDiff[i], [...path, i]);
  }
  const st = qkString(qk);
  for (let child in g.childs[st]) {
    for (let childPath of g.childs[st][child]) {
      if (childPath[childPath.length - 1] >= len)
        removeRelation(st, child, childPath);
    }
  }
}

function addUpdatedQueries(st: string, added: any = {}) {
  added[st] = true;
  if (g.queries[st]) g.event.updatedQueries[st] = true;
  for (let parent in g.parents[st] || {}) {
    if (!added[parent]) addUpdatedQueries(parent, added);
  }
}
