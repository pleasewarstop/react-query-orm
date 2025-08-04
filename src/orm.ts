import {
  getCluster,
  getClusters,
  getHost,
  getInner,
  getLocalStorages,
  getVm,
} from "./api";
import { one, many, reactQueryOrm } from "./lib";

const config = {
  cluster: one(
    getCluster,
    (res) => res.data,
    // destructuring to support partial changes
    // (new incomplete information arrives)
    (x, res) => ({ data: { ...res.data, ...x } }),
    (x) => ({ data: x })
  ),
  clusters: many(
    getClusters,
    (res) => res.data,
    (list) => ({ data: list })
  ),
  host: one(
    getHost,
    (res) => res.data,
    (x, res) => ({ data: { ...res.data, ...x } }),
    (x) => ({ data: x })
  ),
  localStorages: many(
    getLocalStorages,
    (res) => res.data,
    (list) => ({ data: list })
  ),
  vm: one(
    getVm,
    (res) => res.data,
    (x, res) => ({ data: { ...res.data, ...x } }),
    (x) => ({ data: x })
  ),
  inner: one(
    getInner,
    (res) => res,
    (x) => x,
    (x) => x
  ),
};

// create orm object directly in reactQueryOrm arguments
// to access autocompletion of ts
export const { q } = reactQueryOrm(config, {
  cluster: {
    host: "host",
    vms: (x) => ["vm", x.id],
    deep: {
      host: "host",
      arr: (x) => ["inner", x.id],
    },
    very: {
      deep: {
        host: "host",
        arr: (x) => ["inner", x.id],
      },
    },
  },
  host: {
    cluster: "cluster",
    vm: "vm",
    vms: (x) => ["vm", x.id],
    deep: {
      very: {
        inner: "inner",
      },
    },
  },
  vm: {
    cluster: "cluster",
    host: "host",
  },
  clusters: (x) => ["cluster", x.id],
});
