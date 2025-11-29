import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { PrivyProvider } from "@privy-io/react-auth";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <PrivyProvider
      appId="YOUR_PRIVY_APP_ID_HERE"   // paste your actual Privy appId string
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