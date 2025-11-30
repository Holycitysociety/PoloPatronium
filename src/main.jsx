import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { PrivyProvider } from "@privy-io/react-auth";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Create QueryClient (add this)
const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>  // Add this wrapper
      <PrivyProvider
        appId="YOUR_REAL_PRIVY_APP_ID"  // Replace dummy
        config={{
          loginMethods: ["email", "sms", "google"],
          appearance: {
            theme: "dark",
          },
        }}
      >
        <App />
      </PrivyProvider>
    </QueryClientProvider>  // Close wrapper
  </React.StrictMode>
);