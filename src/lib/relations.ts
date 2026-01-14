import { g } from "./g";
import { hasPath, isSamePath, Path } from "./path";

export function addRelation(parent: string, child: string, path: Path) {
  if (hasPath(g.childs[parent]?.[child] || [], path)) return;
  if (!g.childs[parent]) {
    g.childs[parent] = { [child]: [path] };
  } else if (!g.childs[parent][child]) {
    g.childs[parent][child] = [path];
  } else g.childs[parent][child].push(path);
  if (!g.parents[child]) g.parents[child] = {};
  if (!g.parents[child][parent]) g.parents[child][parent] = [path];
  else g.parents[child][parent].push(path);
}

export function removeRelation(parent: string, child: string, path: Path) {
  if (!g.childs[parent]?.[child]) return;
  if (g.childs[parent][child].length === 1) {
    if (Object.keys(g.childs[parent]).length === 1) delete g.childs[parent];
    else delete g.childs[parent][child];
    if (Object.keys(g.parents[child]).length === 1) delete g.parents[child];
    else delete g.parents[child][parent];
  } else {
    g.parents[child][parent] = g.parents[child][parent].filter(
      (p: any) => !isSamePath(p, path)
    );
    g.childs[parent][child] = g.childs[parent][child].filter(
      (p: any) => !isSamePath(p, path)
    );
  }
}

export function getChildOnPath(parent: string, path: string[]) {
  const childs = g.childs[parent];
  if (childs) {
    for (let child in childs) {
      const paths = childs[child];
      for (let p of paths) {
        if (arraysEqual(path, p)) return child;
      }
    }
  }
  // ?исключить рекурсию
  const parentParents = g.parents[parent];
  if (parentParents) {
    for (let pp in parentParents) {
      const child = getChildOnPath(pp, [
        ...parentParents[pp][0],
        ...path,
      ]) as any;
      if (child !== undefined) return child;
    }
  }
}

function arraysEqual(a: any[], b: any[]) {
  return a.length === b.length && a.every((value, index) => value === b[index]);
}
