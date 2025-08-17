import { useQuery } from "@tanstack/react-query";
import { many, one, reactQueryOrm } from "../lib";

export function useTest() {
  const asc = useQuery(q.clusters({ sort: "asc" }));
  const desc = useQuery({
    ...q.clusters({ sort: "desc" }),
    enabled: !!asc.data,
  });
  useQuery({
    ...q.host(1),
    enabled: !!desc.data,
  });
}

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
  vm: one(
    getVm,
    (res) => res.data,
    (data) => ({ data })
  ),
};

const { q } = reactQueryOrm(config, {
  cluster: {
    host: "host",
    vms: ["vm"],
  },
  clusters: ["cluster"],
  host: {
    vm: "vm",
    vms: ["vm"],
  },
  vm: {},
});

function getClusters(arg: { sort: "asc" | "desc" }) {
  return arg.sort === "asc" ? getClustersAsc() : getClustersDesc();
}

async function getClustersAsc() {
  await delay(0);
  return {
    data: (
      await Promise.all([
        getCluster(1),
        getCluster(2),
        getCluster(3),
        getCluster(4),
      ])
    ).map((x) => x.data),
  };
}

async function getClustersDesc() {
  await delay(200);
  return {
    data: (
      await Promise.all([getCluster(3), getCluster(2), getCluster(5)])
    ).map((x) => x.data),
  };
}

async function getCluster(id: number) {
  await delay(400);
  return {
    data: {
      e: "cluster" + id,
      id,
      vms: [
        { id: 1, e: "vm" },
        { id: 2, e: "vm2" },
      ],
      host: {
        id: 1,
        e: "host",
        vm: { id: 1, e: "vm" },
        vms: [
          { id: 1, e: "vm" },
          { id: 2, e: "vm2" },
        ],
      },
    },
  };
}

async function getHost(id: number) {
  await delay(600);
  return {
    data: {
      id,
      e: "host_2",
      vm: { id: 1, e: "vm_2" },
      vms: [
        { id: 3, e: "vm3_2" },
        { id: 2, e: "vm2_2" },
      ],
    },
  };
}

async function getVm(id: number) {
  await delay(800);
  return { data: { id: 1, e: "vm" } };
}

function delay(ms = 200) {
  return new Promise((res) => setTimeout(res, ms));
}
