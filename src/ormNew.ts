import { one, reactQueryOrm } from "./libNew";
import { Deep } from "./typeNew";

const c = {
  cluster: one(
    getCluster,
    (res) => res.data,
    (data) => ({ data }),
  ),
  supercluster: one(
    getSupercluster,
    (res) => res.data,
    (data) => ({ data }),
  ),
  host: one(
    getHost,
    (res) => res.data,
    (data) => ({ data }),
  ),
  oki: one(
    getOki,
    (res) => res.data,
    (data) => ({ data }),
  ),
};

function deep<P extends any, C extends any>(parent: P, child: C) {
  return new Deep(parent, child);
}

export const { q } = reactQueryOrm(c, {
  cluster: {
    host: deep("host", {
      oki: "oki" as const,
    }),
    inner: {
      host: "host",
    },
  },
  supercluster: {
    superhost: "host",
  },
  host: {},
});

async function getCluster(id: number) {
  return {
    data: {
      id,
      host: {
        id: 1,
        oki: { id: 1 },
      },
      inner: {
        host: {
          id: 1,
          e: "e",
        },
      },
    },
  };
}

async function getSupercluster(id: number) {
  return {
    data: {
      id,
      superhost: { id: 1, oki: "oki" },
    },
  };
}

async function getHost(id: number) {
  return {
    data: {
      id,
      e: "e",
    },
  };
}

async function getOki(id: number) {
  return {
    data: {
      id,
      e: "e",
    },
  };
}
