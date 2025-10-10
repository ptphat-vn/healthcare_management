import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { Toaster } from "sonner";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { persistor, store } from "./stores/store.ts";

createRoot(document.getElementById("root")!).render(
  // <StrictMode>

  <Provider store={store}>
    <PersistGate persistor={persistor}>
      <App />
      <Toaster richColors />
    </PersistGate>
  </Provider>

  // </StrictMode>
);
