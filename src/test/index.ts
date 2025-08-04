import { useQuery } from "@tanstack/react-query";
import { q } from "../orm";

export function useTest() {
  const a = useQuery(q.cluster(1));
  const b = useQuery({
    ...q.host(1),
    enabled: !!a.data,
  });
  const c = useQuery({
    ...q.vm(1),
    enabled: !!b.data,
  });
  useQuery({
    ...q.clusters(),
    enabled: !!b.data,
  });
  console.log(a.data, b.data, c.data);
}
