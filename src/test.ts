const deepSymbol: unique symbol = Symbol('deepSymbol');

type IsDeep<T> =
  T extends object
    ? typeof deepSymbol extends keyof T
      ? true
      : false;
