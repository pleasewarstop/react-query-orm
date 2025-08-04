import { useQuery } from "@tanstack/react-query";
import { one, reactQueryOrm } from "../lib";

export function useTest() {
  const a = useQuery(q.a(1));
  const b = useQuery({
    ...q.b(1),
    enabled: !!a.data,
  });
  const c = useQuery({
    ...q.c(1),
    enabled: !!b.data,
  });
  useQuery({
    ...q.d(1),
    enabled: !!c.data,
  });
}

const config = {
  a: one(
    getA,
    (res) => res.data,
    (x, res) => ({ data: { ...res.data, ...x } }),
    (x) => ({ data: x })
  ),
  b: one(
    getB,
    (res) => res.data,
    (x, res) => ({ data: { ...res.data, ...x } }),
    (x) => ({ data: x })
  ),
  c: one(
    getC,
    (res) => res.data,
    (x, res) => ({ data: { ...res.data, ...x } }),
    (x) => ({ data: x })
  ),
  d: one(
    getD,
    (res) => res.data,
    (x, res) => ({ data: { ...res.data, ...x } }),
    (x) => ({ data: x })
  ),
};

const { q } = reactQueryOrm(config, {
  a: {
    b: "b",
  },
  b: {
    c: "c",
  },
  c: {
    d: "d",
  },
  d: {},
});

async function getA(id: number) {
  await delay(0);
  return {
    data: {
      id,
      b: {
        id: 1,
      },
    },
  };
}

async function getB(id: number) {
  await delay(200);
  return {
    data: {
      id,
      c: {
        id: 1,
      },
    },
  };
}

async function getC(id: number) {
  await delay(400);
  return {
    data: {
      id,
      e: "new prop",
      d: {
        id: 1,
      },
    },
  };
}

async function getD(id: number) {
  await delay(600);
  return {
    data: {
      id,
      e: "new prop D",
    },
  };
}

function delay(ms = 200) {
  return new Promise((res) => setTimeout(res, ms));
}
