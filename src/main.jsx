import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { PrivyProvider } from "@privy-io/react-auth";

// 👇 NEW: thirdweb imports
import { ThirdwebProvider } from "thirdweb/react";
import { createThirdwebClient, defineChain } from "thirdweb";

// 👇 NEW: thirdweb client + chain
const client = createThirdwebClient({
  clientId: "f58c0bfc6e6a2c00092cc3c35db1eed8",
});

const base = defineChain(8453); // Base chain

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThirdwebProvider client={client} chain={base}>
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
    </ThirdwebProvider>
  </React.StrictMode>
);