import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { PrivyProvider } from "@privy-io/react-auth";

// ✅ NEW: React Query imports
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// ✅ NEW: create a single QueryClient instance
const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {/* ✅ Wrap everything with QueryClientProvider so Thirdweb can use it */}
    <QueryClientProvider client={queryClient}>
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
    </QueryClientProvider>
  </React.StrictMode>
);