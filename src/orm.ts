import { queryClient } from ".";
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
    (data) => ({ data })
  ),
  clusters: many(
    getClusters,
    (res) => res.data,
    (list) => ({ data: list })
  ),
  host: one(
    getHost,
    (res) => res.data,
    (data) => ({ data })
  ),
  // localStorages: many(
  //   getLocalStorages,
  //   (res) => res.data,
  //   (list) => ({ data: list })
  // ),
  vm: one(
    getVm,
    (res) => res.data,
    (data) => ({ data })
  ),
  // inner: one(
  //   getInner,
  //   (res) => res,
  //   (x) => x
  // ),
};

// create orm object directly in reactQueryOrm arguments to access autocompletion of ts
export const { q } = reactQueryOrm(config, {
  cluster: {
    host: "host",
    // vms: ["vm"],
    // deep: {
    //   host: "host",
    //   arr: ["inner"],
    // },
    // very: {
    //   deep: {
    //     host: "host",
    //     arr: ["inner"],
    //   },
    // },
  },
  host: {
    vm: "vm",
    // vms: ["vm"],
    // deep: {
    //   very: {
    //     inner: "inner",
    //   },
    // },
  },
  vm: {
    cluster: "cluster",
  },
  // vm: {
  //   cluster: "cluster",
  //   host: "host",
  // },
  clusters: ["cluster"],
});
