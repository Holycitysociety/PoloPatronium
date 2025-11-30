// main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { PrivyProvider } from "@privy-io/react-auth";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <PrivyProvider
      appId="cmijg24lf00s4ju0cfg87p8nw"
      config={{
        loginMethods: ["email", "sms", "google"],
        appearance: {
          theme: "dark",
        },
      }}
    >
      <App />
    </PrivyProvider>
  </React.StrictMode>
);