import { useQuery } from "@tanstack/react-query";
import { q } from "../orm";
import { queryClient } from "..";

let invalidated = false;
export function useTest() {
  const a = useQuery(q.cluster(1));
  // const b = useQuery({
  //   ...q.host(1),
  //   // enabled: !!a.isSuccess,
  // });
  // const c = useQuery({
  //   ...q.vm(1),
  //   // enabled: !!b.isSuccess,
  // });
  // const d = useQuery({
  //   ...q.vm(2),
  //   enabled: !!c.isSuccess,
  // });
  const e = useQuery({
    ...q.clusters(),
  });
  // if (!invalidated && e.isSuccess) {
  //   setTimeout(
  //     () => queryClient.invalidateQueries({ queryKey: q.clusters().queryKey }),
  //     100
  //   );
  //   invalidated = true;
  // }
  console.log(a.data, e.data);
}
