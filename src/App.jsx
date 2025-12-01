// App.jsx
import React, { useState } from "react";
import {
  CheckoutWidget,
  ConnectEmbed,
  useActiveWallet,
  useDisconnect,
} from "thirdweb/react";
import { createThirdwebClient, defineChain } from "thirdweb";
import { inAppWallet } from "thirdweb/wallets";

// Thirdweb client for Checkout + wallets
const client = createThirdwebClient({
  clientId: "f58c0bfc6e6a2c00092cc3c35db1eed8",
});

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
  const [showCheckoutInModal, setShowCheckoutInModal] = useState(false);

  // Thirdweb wallet state
  const activeWallet = useActiveWallet();
  const { disconnect } = useDisconnect();

  const account = activeWallet?.getAccount();
  const address = account?.address;
  const shortAddress = address
    ? `${address.slice(0, 6)}…${address.slice(-4)}`
    : null;

  const openWallet = () => {
    setIsWalletOpen(true);
    setShowCheckoutInModal(false); // start with just wallet info
  };

  const closeWallet = () => setIsWalletOpen(false);

  // Main hero BUY button – just opens the Patron Wallet
  const handleHeroBuyPatron = () => {
    openWallet();
  };

  // Inside-modal BUY PATRON button – reveal/hide Checkout
  const toggleModalCheckout = () => {
    setShowCheckoutInModal((prev) => !prev);
  };

  const handleSignOut = async () => {
    try {
      if (activeWallet) {
        await disconnect(activeWallet);
      }
    } catch (err) {
      console.error("Error disconnecting wallet:", err);
    }
  };

  return (
    <div className="page">
      {/* Top header: wallet status */}
      <header
        style={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          padding: "8px 0",
          gap: "8px",
        }}
      >
        {address && (
          <span
            style={{
              fontSize: "11px",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              opacity: 0.85,
            }}
          >
            {shortAddress}
          </span>
        )}

        {address ? (
          <>
            <button
              className="btn btn-outline"
              style={{ minWidth: "auto", padding: "4px 12px" }}
              onClick={openWallet}
            >
              PATRON WALLET
            </button>
            <button
              className="btn btn-outline"
              style={{
                minWidth: "auto",
                padding: "4px 10px",
                fontSize: "11px",
              }}
              onClick={handleSignOut}
            >
              Sign out
            </button>
          </>
        ) : (
          <button
            className="btn btn-outline"
            style={{ minWidth: "auto", padding: "6px 16px" }}
            onClick={openWallet}
          >
            PATRON WALLET
          </button>
        )}
      </header>

      {/* Masthead */}
      <div className="masthead">
        <div className="masthead-inner">
          <div className="masthead-line-1">
            <span>UNITED STATES POLO</span>
            <span>PATRONS ASSOCIATION</span>
          </div>
          <div className="masthead-rule"></div>
          <div className="masthead-line-2 masthead-presents">PRESENTS THE</div>
          <div className="masthead-line-2 masthead-stewardship">
            OFFICIAL POLO PATRONAGE TOKEN
          </div>
        </div>
      </div>

      {/* Hero */}
      <header>
        <h1 className="hero-title">POLO PATRONIUM</h1>

        <div className="hero-symbol">
          <div className="hero-symbol-main">
            ERC-777 &middot; TOKEN SYMBOL &quot;PATRON&quot;
          </div>
          <div className="hero-network">ON BASE NETWORK BY COINBASE</div>
          <div className="hero-contract">
            <span className="hero-contract-label">CA:</span>
            <span className="hero-contract-value">
              0x128445CAAB304A9203CCb87D06dD888823749FbE
            </span>
          </div>
        </div>

        <div className="hero-actions">
          {/* Main-page BUY PATRON just opens the wallet modal */}
          <button className="btn btn-primary" onClick={handleHeroBuyPatron}>
            BUY PATRON
          </button>

          <a className="btn btn-outline" href="#founding-patrons">
            FOUNDING PATRON INQUIRIES
          </a>
        </div>
      </header>

      {/* Patron Wallet modal – ConnectEmbed + (optional) Checkout */}
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
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 18px 60px rgba(0,0,0,0.7)",
              border: "1px solid #3a2b16",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "12px",
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

            {/* Embedded in-app wallet (sign in, address, balances, logout, etc.) */}
            <ConnectEmbed
              client={client}
              wallets={wallets}
              chain={defineChain(8453)}
              theme="dark"
            />

            {/* Modal-level BUY PATRON button to reveal Checkout */}
            <div style={{ marginTop: "16px" }}>
              <button
                className="btn btn-primary"
                style={{ width: "100%" }}
                onClick={toggleModalCheckout}
              >
                {showCheckoutInModal
                  ? "Hide Purchase Options"
                  : "BUY PATRON (USDC on Base)"}
              </button>
            </div>

            {/* Only show Checkout after the in-modal BUY is clicked */}
            {showCheckoutInModal && (
              <div style={{ marginTop: "12px" }}>
                <CheckoutBoundary>
                  <CheckoutWidget
                    client={client}
                    description={
                      "USPPA, COWBOY POLO CIRCUIT, CHARLESTON POLO's PATRONAGE UTILITY TOKEN"
                    }
                    name={"POLO PATRONIUM"}
                    currency={"USD"}
                    chain={defineChain(8453)}
                    amount={"1"}
                    tokenAddress={
                      "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"
                    } // USDC on Base
                    seller={
                      "0xfee3c75691e8c10ed4246b10635b19bfff06ce16"
                    } // your treasury
                    buttonLabel={"Confirm Purchase"}
                    onError={(err) => {
                      console.error("Checkout error:", err);
                      alert(err?.message || String(err));
                    }}
                  />
                </CheckoutBoundary>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Brand / roadmap and the rest of the page stays as you had it */}
      <main>
        {/* ... your existing sections unchanged ... */}
        {/* I’m not repeating them here, but keep everything below exactly as you had it. */}
      </main>

      <footer>
        <div>
          © {year} US POLO PATRONS ASSOCIATION — POLO PATRONIUM
        </div>
        <div>BUILT ON BASE BY COINBASE</div>
      </footer>
    </div>
  );
}