// main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { PrivyProvider } from "@privy-io/react-auth";

// ✅ React Query imports
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// ✅ Create a single QueryClient instance for the app
const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {/* ✅ Wrap EVERYTHING in QueryClientProvider */}
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