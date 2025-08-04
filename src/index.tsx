import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useReactQueryOrm } from "./lib";
// you can change st in path on another filename for changing test example
import { useTest } from "./test/index";

function App() {
  useReactQueryOrm(queryClient);
  useTest();
  return <></>;
}

export const queryClient = new QueryClient();

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
);
