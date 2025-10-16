import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { Toaster } from "sonner";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { persistor, store } from "./stores/store.ts";
// const clientId = import.meta.env.VITE_GG_CLIENT_ID;
// import { GoogleOAuthProvider } from "@react-oauth/google";
createRoot(document.getElementById("root")!).render(
  // <StrictMode>

  <Provider store={store}>
    <PersistGate persistor={persistor}>
      {/* <GoogleOAuthProvider clientId={clientId}> */}
      <App />
      <Toaster richColors position="top-right" />
      {/* </GoogleOAuthProvider> */}
    </PersistGate>
  </Provider>

  // </StrictMode>
);
