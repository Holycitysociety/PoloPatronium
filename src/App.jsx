import React, { useState } from "react";
import {
  CheckoutWidget,
  ConnectEmbed,
  useActiveAccount,
  useActiveWallet,
  useDisconnect,
} from "thirdweb/react";
import { createThirdwebClient, defineChain } from "thirdweb";
import { inAppWallet } from "thirdweb/wallets";

// Thirdweb client for Checkout + wallets
const client = createThirdwebClient({
  clientId: "f58c0bfc6e6a2c00092cc3c35db1eed8",
});

const BASE = defineChain(8453);

// Embedded user wallets (email login, etc.)
const wallets = [
  inAppWallet({
    auth: {
      options: [
        "email",
        "coinbase",
        "passkey",
        // later: "apple", "facebook", "x", "discord", "guest", etc.
      ],
    },
  }),
];

// Simple error boundary so CheckoutWidget can't nuke the whole app
class CheckoutBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("CheckoutWidget crashed:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <p style={{ color: "#e3bf72", marginTop: "12px" }}>
          Checkout temporarily unavailable. Please try again later.
        </p>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const year = new Date().getFullYear();
  const [isWalletOpen, setIsWalletOpen] = useState(false);

  // Account data for display
  const account = useActiveAccount();
  // Actual wallet object for connect/disconnect
  const activeWallet = useActiveWallet();
  const disconnectValue = useDisconnect();

  const openWallet = () => setIsWalletOpen(true);
  const closeWallet = () => setIsWalletOpen(false);

  const handleBuyPatron = () => {
    // Main-page BUY button just opens the Patron Wallet modal
    openWallet();
  };

  const handleSignOut = async () => {
    try {
      if (!activeWallet || !disconnectValue) return;

      // handle both possible hook shapes
      if (typeof disconnectValue === "function") {
        await disconnectValue(activeWallet);
      } else if (typeof disconnectValue.disconnect === "function") {
        await disconnectValue.disconnect(activeWallet);
      } else if (typeof disconnectValue.mutate === "function") {
        await disconnectValue.mutate(activeWallet);
      }
    } catch (err) {
      console.error("Error disconnecting wallet:", err);
    }
    // DO NOT close the modal – it should fall back to the sign-in view
  };

  const shortAddress = account?.address
    ? `${account.address.slice(0, 6)}…${account.address.slice(-4)}`
    : "";

  return (
    <div className="page">
      {/* Top-right Patron Wallet button */}
      <header
        style={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          padding: "8px 0",
        }}
      >
        <button
          className="btn btn-outline"
          style={{ minWidth: "auto", padding: "6px 16px" }}
          onClick={openWallet}
        >
          PATRON WALLET
        </button>
      </header>

      {/* Masthead */}
      {/* ...unchanged masthead / hero intro markup... */}

      {/* Hero */}
      {/* keep your hero markup, but make sure the BUY PATRON button calls handleBuyPatron */}

      {/* Patron Wallet modal */}
      {isWalletOpen && (
        <div
          className="wallet-modal-backdrop"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.65)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
          }}
        >
          <div
            className="wallet-modal"
            style={{
              background: "#111",
              borderRadius: "12px",
              padding: "20px",
              maxWidth: "420px",
              width: "100%",
              boxShadow: "0 18px 60px rgba(0,0,0,0.7)",
              border: "1px solid #3a2b16",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px",
              }}
            >
              <h2
                style={{
                  fontSize: "18px",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                Patron Wallet
              </h2>
              <button
                onClick={closeWallet}
                style={{
                  border: "none",
                  background: "transparent",
                  color: "#e3bf72",
                  fontSize: "20px",
                  cursor: "pointer",
                  lineHeight: 1,
                }}
                aria-label="Close wallet"
              >
                ×
              </button>
            </div>

            {/* Wallet status section */}
            {!account ? (
              <div style={{ marginBottom: "16px" }}>
                <ConnectEmbed
                  client={client}
                  wallets={wallets}
                  chain={BASE}
                  theme="dark"
                />
              </div>
            ) : (
              <div
                style={{
                  borderRadius: "10px",
                  border: "1px solid #3a2b16",
                  padding: "14px 16px 18px",
                  marginBottom: "20px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontSize: "11px",
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    color: "#c7b08a",
                    marginBottom: "4px",
                  }}
                >
                  Connected as
                </div>
                <div
                  style={{
                    fontFamily: "monospace",
                    fontSize: "13px",
                    marginBottom: "10px",
                  }}
                >
                  {shortAddress}
                </div>
                <button
                  className="btn btn-outline"
                  style={{
                    minWidth: "auto",
                    padding: "6px 18px",
                    fontSize: "11px",
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                  }}
                  onClick={handleSignOut}
                >
                  Sign Out
                </button>
              </div>
            )}

            {/* Checkout into the currently active wallet */}
            <CheckoutBoundary>
              <CheckoutWidget
                client={client}
                description={
                  "USPPA, COWBOY POLO CIRCUIT, CHARLESTON POLO's PATRONAGE UTILITY TOKEN"
                }
                name={"POLO PATRONIUM"}
                currency={"USD"}
                chain={BASE}
                amount={"1"}
                tokenAddress={
                  "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"
                } // USDC on Base
                seller={"0xfee3c75691e8c10ed4246b10635b19bfff06ce16"} // your treasury
                buttonLabel={"BUY PATRON (USDC on Base)"}
                onError={(err) => {
                  console.error("Checkout error:", err);
                  alert(err?.message || String(err));
                }}
              />
            </CheckoutBoundary>
          </div>
        </div>
      )}

      {/* Brand / roadmap + copy sections */}
      {/* keep everything you already have here unchanged */}

      <footer>
        <div>© {year} US POLO PATRONS ASSOCIATION — POLO PATRONIUM</div>
        <div>BUILT ON BASE BY COINBASE</div>
      </footer>
    </div>
  );
}