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

const c = {
  cluster: one(getCluster),
  clusters: many(
    getClusters,
    (res) => res.data,
    (list) => ({ data: list }),
  ),
  host: one(
    getHost,
    (res) => res.data,
    (data) => ({ data }),
  ),
  // localStorages: many(
  //   getLocalStorages,
  //   (res) => res.data,
  //   (list) => ({ data: list })
  // ),
  vm: one(
    getVm,
    (res) => res.data,
    (data) => ({ data }),
  ),
  // inner: one(
  //   getInner,
  //   (res) => res,
  //   (x) => x
  // ),
};

const clusterA = inner(
  c.cluster,
  (x) => x.a,
  (xA) => xA.a,
);

const clusterEOr = or(c.cluster, (x) => x.e, {
  clusterEA: [(e) => "a" in e, clusterA],
  clusterHost: [(e) => "vm" in e, c.host],
});

export const { q } = reactQueryOrm(c, {
  cluster: {
    host: "host", //c.host,
    // a: clusterA.with({
    //   host: c.host
    // }),
    // e: clusterEOr
  },
  // host: {
  // vm: "vm",
  // vms: ["vm"],
  // deep: {
  //   very: {
  //     inner: "inner",
  //   },
  // },
  // },
  // clusters: [
  // проверяем добавленный тип чтоб было поле oki и т.д.
  // c.cluster.with({
  //   oki: clusterA
  // }),
  // ],
});

// pick, omit, add, replace
// слушать merge можно только для one или inner
merge(c.cluster, ([prev, to], next) => {});
