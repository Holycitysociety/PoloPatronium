import React, { useState } from "react";
import {
  CheckoutWidget,
  ConnectEmbed,
  useActiveAccount,
  useActiveWallet,
  useDisconnect,
  useWalletBalance,
} from "thirdweb/react";
import { createThirdwebClient, defineChain } from "thirdweb";
import { inAppWallet } from "thirdweb/wallets";

// ---------------------------------------------
// Thirdweb client + chain
// ---------------------------------------------
const client = createThirdwebClient({
  clientId: "f58c0bfc6e6a2c00092cc3c35db1eed8",
});

const BASE = defineChain(8453);

// Embedded user wallets (email / social / passkey)
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

// ---------------------------------------------
// Simple error boundary for CheckoutWidget
// ---------------------------------------------
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

// ---------------------------------------------
// Main App
// ---------------------------------------------
export default function App() {
  const year = new Date().getFullYear();
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [usdAmount, setUsdAmount] = useState("1"); // controls Checkout amount in USD

  const account = useActiveAccount();
  const activeWallet = useActiveWallet();
  const { disconnect } = useDisconnect();

  // Native ETH on Base
  const { data: baseBalance } = useWalletBalance({
    address: account?.address,
    chain: BASE,
    client,
  });

  // PATRON ERC-20
  const { data: patronBalance } = useWalletBalance({
    address: account?.address,
    chain: BASE,
    client,
    tokenAddress: "0x128445CAAB304A9203CCb87D06dD888823749FbE",
  });

  const openWallet = () => setIsWalletOpen(true);
  const closeWallet = () => setIsWalletOpen(false);

  const handleBuyPatron = () => {
    // Main BUY button just opens the Patron Wallet modal
    openWallet();
  };

  // Disconnect the embedded wallet but keep the modal open
  const handleSignOut = () => {
    if (!activeWallet || !disconnect) return;
    try {
      disconnect(activeWallet);
    } catch (err) {
      console.error("Error disconnecting wallet:", err);
    }
  };

  const shortAddress = account?.address
    ? `${account.address.slice(0, 6)}…${account.address.slice(-4)}`
    : "";

  // Make sure Checkout always gets a sane positive string
  const normalizedAmount =
    usdAmount && Number(usdAmount) > 0 ? String(usdAmount) : "1";

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
          {/* Main BUY button -> opens Patron Wallet modal */}
          <button className="btn btn-primary" onClick={handleBuyPatron}>
            BUY PATRON
          </button>

          <a className="btn btn-outline" href="#founding-patrons">
            FOUNDING PATRON INQUIRIES
          </a>
        </div>
      </header>

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
              border: "1px solid #3a2b16", // <-- fixed
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

                {/* Native gas balance */}
                <div
                  style={{
                    fontSize: "10px",
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    color: "#9f8a64",
                    marginBottom: "2px",
                  }}
                >
                  Base Balance
                </div>
                <div style={{ fontSize: "13px", marginBottom: "8px" }}>
                  {baseBalance?.displayValue || "0"}{" "}
                  {baseBalance?.symbol || "ETH"}
                </div>

                {/* PATRON token balance */}
                <div
                  style={{
                    fontSize: "10px",
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    color: "#9f8a64",
                    marginBottom: "2px",
                  }}
                >
                  PATRON Balance
                </div>
                <div style={{ fontSize: "13px", marginBottom: "10px" }}>
                  {patronBalance?.displayValue || "0"}{" "}
                  {patronBalance?.symbol || "PATRON"}
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

            {/* Amount selector for Checkout */}
            <div style={{ marginBottom: "12px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "10px",
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: "#c7b08a",
                  marginBottom: "4px",
                }}
              >
                Patronage Amount (USD)
              </label>
              <input
                type="number"
                min="1"
                step="1"
                value={usdAmount}
                onChange={(e) => setUsdAmount(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 10px",
                  borderRadius: "6px",
                  border: "1px solid #3a2b16",
                  background: "#181210",
                  color: "#f5eedc",
                  fontSize: "14px",
                }}
              />
            </div>

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
                amount={normalizedAmount}
                tokenAddress={
                  "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"
                } // USDC on Base
                seller={"0xfee3c75691e8c10ed4246b10635b19bfff06ce16"}
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

      {/* Brand / roadmap + copy sections (unchanged) */}
      <main>
        {/* ...your existing roadmap + copy blocks exactly as before... */}
      </main>

      <footer>
        <div>© {year} US POLO PATRONS ASSOCIATION — POLO PATRONIUM</div>
        <div>BUILT ON BASE BY COINBASE</div>
      </footer>
    </div>
  );
}