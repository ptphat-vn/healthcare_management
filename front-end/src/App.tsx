import { RouterProvider } from "react-router-dom";

import { router } from "@/routes/index";
import StringeeProvider from "@/providers/StringeeProvider";

function App() {
  return (
    <StringeeProvider>
      <RouterProvider router={router} />
    </StringeeProvider>
  );
}

export default App;
