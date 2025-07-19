export type Path = (string | number)[];

export const getPath = (inst: any, path: Path) =>
  path.reduce((x, key) => x && x[key], inst);

export function putToPath(parent: any, child: any, path: any): any {
  const key = path[0];
  const parentChildItem =
    path.length === 1 ? child : putToPath(parent[key], child, path.slice(1));
  return Array.isArray(parent)
    ? parent.map((x, i) => (i === +key ? parentChildItem : x))
    : {
        ...parent,
        [key]: parentChildItem,
      };
}

export function clonePath(parent: any, path: any) {
  const inst = path.reduce((current: any, key: any) => current[key], parent);
  return Array.isArray(inst) ? [...inst] : { ...inst };
}

export const hasPath = (paths: Path[], path: Path) =>
  paths.some((p) => isSamePath(p, path));

export const isSamePath = (x: Path, y: Path) =>
  x.length === y.length && x.every((x, i) => x === y[i]);
