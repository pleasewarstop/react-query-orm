export type Path = (string | number)[];

export const getPath = (inst: any, path: Path) =>
  path.reduce((x, key) => x && x[key], inst);

export const hasPath = (paths: Path[], path: Path) =>
  paths.some((p) => isSamePath(p, path));

export const isSamePath = (x: Path, y: Path) =>
  x.length === y.length && x.every((x, i) => x === y[i]);
