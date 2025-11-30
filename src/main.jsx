// main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { PrivyProvider } from "@privy-io/react-auth";
import { ThirdwebProvider } from "thirdweb/react";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {/* ThirdwebProvider sets up QueryClient + context for CheckoutWidget */}
    <ThirdwebProvider clientId="f58c0bfc6e6a2c00092cc3c35db1eed8">
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