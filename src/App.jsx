// App.jsx
import React, { useState } from "react";
import {
  CheckoutWidget,
  ConnectEmbed,
  useActiveAccount,
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
        // add more later if you want:
        // "apple", "facebook", "x", "discord", "guest", etc.
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

  // wallet + modal state
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);

  // thirdweb hooks for current account + logout
  const account = useActiveAccount();
  const { disconnect } = useDisconnect();

  const openWallet = () => {
    setIsWalletOpen(true);
    setShowCheckout(false); // start at "wallet view", not checkout
  };

  const closeWallet = () => {
    setIsWalletOpen(false);
    setShowCheckout(false);
  };

  const handleBuyPatron = () => {
    // Hero button just opens the Patron Wallet modal
    openWallet();
  };

  const shortAddress = account?.address
    ? `${account.address.slice(0, 6)}…${account.address.slice(-4)}`
    : "";

  return (
    <div className="page">
      {/* Top-right Patron Wallet button ONLY (no address / logout here) */}
      <header
        style={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          padding: "8px 0",
          gap: "8px",
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
          {/* Hero BUY PATRON opens the Patron Wallet modal */}
          <button className="btn btn-primary" onClick={handleBuyPatron}>
            BUY PATRON
          </button>

          <a className="btn btn-outline" href="#founding-patrons">
            FOUNDING PATRON INQUIRIES
          </a>
        </div>
      </header>

      {/* Patron Wallet modal (Connect / address / logout + optional Checkout) */}
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
            {/* Modal header */}
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

            {/* If not connected: show ConnectEmbed */}
            {!account && (
              <div style={{ marginBottom: "16px" }}>
                <ConnectEmbed
                  client={client}
                  wallets={wallets}
                  chain={defineChain(8453)}
                  theme="dark"
                />
              </div>
            )}

            {/* If connected: show address + Sign out INSIDE the modal */}
            {account && (
              <div
                style={{
                  marginBottom: "16px",
                  padding: "10px 12px",
                  borderRadius: "8px",
                  border: "1px solid #3a2b16",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "13px",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                <div style={{ opacity: 0.8 }}>Connected as</div>
                <div style={{ fontFamily: "monospace" }}>{shortAddress}</div>
                <button
                  className="btn btn-outline"
                  style={{
                    minWidth: "auto",
                    padding: "4px 14px",
                    fontSize: "11px",
                  }}
                  onClick={() => {
                    disconnect();
                    setShowCheckout(false);
                  }}
                >
                  SIGN OUT
                </button>
              </div>
            )}

            {/* Step 2: Checkout, only after clicking the gold button */}
            {!showCheckout && (
              <button
                className="btn btn-primary"
                style={{ width: "100%", marginTop: account ? 4 : 0 }}
                onClick={() => setShowCheckout(true)}
                disabled={!account}
              >
                BUY PATRON (USDC on Base)
              </button>
            )}

            {showCheckout && (
              <div style={{ marginTop: "16px" }}>
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
                    seller={"0xfee3c75691e8c10ed4246b10635b19bfff06ce16"} // your treasury
                    buttonLabel={"Complete purchase"}
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

      {/* Brand / roadmap */}
      <main>
        {/* ... everything from your roadmap / copy sections unchanged ... */}
        {/* I’m leaving all that as-is since it doesn’t affect the wallet flow */}
        {/* --- BEGIN existing sections --- */}

        <section className="brand-row" id="brands">
          <h2 className="roadmap-title">INITIATIVE ROADMAP</h2>

          <div className="brand-grid">
            <div className="logo-block">
              <div className="logo-usp-string-remuda">
                <span className="usp">USPPA</span>
                <div className="rule"></div>
                <span className="string-line">
                  <span className="string-word">STRING THREE</span>
                  <span className="sevens">7̶7̶7̶</span>
                  <span className="string-word">SEVENS REMUDA</span>
                </span>
              </div>
              <p className="initiative-text">
                Our managed herd of USPPA horses — consigned or owned by the
                Association, assigned to operating patrons, trainers and local
                players, and developed for play, exhibition and training across
                our programmes.
              </p>
            </div>

            <div className="logo-block">
              <div className="logo-cowboy-polo-circuit">
                <span>COWBOY&nbsp;POLO&nbsp;CIRCUIT</span>
              </div>
              <p className="initiative-text">
                An American endeavour to broaden Polo&apos;s reach, nurture
                emerging talent, and encourage the next generation of American
                players — where riders not only learn to play, but learn to make
                the horses of the 7̶7̶7̶ (String Three Sevens) Remuda.
              </p>
            </div>

            <div className="logo-block">
              <div className="logo-the-polo-life">
                <span className="top">THE</span>
                <span className="main">POLO LIFE</span>
              </div>
              <p className="initiative-text">
                A platform dedicated to presenting the elegance and traditions
                of polo to new audiences in the digital age — following our
                horses, patrons, and players across the Cowboy Polo Circuit.
              </p>
            </div>

            <div className="logo-block">
              <div className="logo-charleston-polo">
                <span className="top">CHARLESTON</span>
                <span className="main">POLO CLUB</span>
              </div>
              <p className="initiative-text">
                The renewal of Charleston, South Carolina&apos;s polo tradition
                — our flagship Chapter and living test model for the USPPA Polo
                Incubator, where horses are gathered, pasture secured,
                instruction established, and the public welcomed to learn and
                play. Once an Incubator achieves steady operations, sound
                horsemanship, and visible community benefit, it becomes a
                standing Chapter of the Association.
              </p>
            </div>
          </div>

          <p className="roadmap-footnote">
            All of these initiatives are coordinated and supported through Polo
            Patronium, the living token of patronage within the United States
            Polo Patrons Association, uniting patrons, players, and clubs in a
            shared Polo Life ecosystem.
          </p>
        </section>

        {/* (rest of copy sections unchanged) */}
        {/* ... */}
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