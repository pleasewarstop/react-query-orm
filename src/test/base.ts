import { useQuery } from "@tanstack/react-query";
import { one, reactQueryOrm } from "../lib";

export function useTest() {
  const cluster = useQuery(q.cluster(1));
  useQuery({
    ...q.host(1),
    enabled: !!cluster.data,
  });
}

const config = {
  cluster: one(
    getCluster,
    (res) => res.data,
    (data) => ({ data })
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
  inner: one(
    getInner,
    (res) => res.data,
    (data) => ({ data })
  ),
};

const { q } = reactQueryOrm(config, {
  cluster: {
    host: "host",
    vms: ["vm"],
    deep: {
      host: "host",
      arr: ["inner"],
    },
    very: {
      deep: {
        host: "host",
        arr: ["inner"],
      },
    },
  },
  host: {
    vm: "vm",
    vms: ["vm"],
    cluster: "cluster",
  },
  vm: {},
  inner: {},
});

async function getCluster(id: number) {
  await delay(0);
  return {
    data: {
      id,
      e: "cluster",
      host: {
        id: 1,
        e: "host",
        vm: { id: 1, e: "vm" },
        vms: [{ id: 2, e: "vm2" }],
      },
      vms: [
        { id: 1, e: "vm" },
        { id: 2, e: "vm2" },
      ],
      deep: {
        e: "deep",
        host: { id: 2, e: "host2" },
        arr: [
          { id: 1, e: "inner" },
          { id: 2, e: "inner2" },
          { id: 3, e: "inner3" },
        ],
      },
      very: {
        deep: {
          host: { id: 1, e: "host" },
          arr: [
            { id: 3, e: "inner3" },
            { id: 2, e: "inner2" },
            { id: 1, e: "inner" },
          ],
        },
      },
    },
  };
}

async function getHost(id: number) {
  await delay(200);
  return {
    data: {
      id,
      host: "host",
      e: "host_2",
      vm: {
        id: 1,
        e: "vm_2",
        vm: "vm",
      },
      vms: [{ id: 2, e: "vm2_2" }],
      cluster: {
        id: 1,
        e: "cluster_2",
        cluster: "cluster",
        vms: [
          { id: 2, e: "vm2_2", vm: "vm" },
          { id: 1, e: "vm_2", vm: "vm" },
        ],
        deep: {
          e: "deep_2",
          arr: [
            { id: 3, e: "inner3_2" },
            { id: 1, e: "inner_2" },
          ],
        },
        very: {
          deep: {
            arr: [],
          },
        },
      },
    },
  };
}

async function getVm(id: number) {
  await delay(400);
  return {
    data: {
      id,
      e: "vm",
      vm: "vm",
    },
  };
}

async function getInner(id: number) {
  await delay(600);
  return {
    data: { id, e: "inner" },
  };
}

function delay(ms = 200) {
  return new Promise((res) => setTimeout(res, ms));
}
