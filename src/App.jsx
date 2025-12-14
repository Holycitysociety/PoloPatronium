import React, { useEffect, useRef, useState } from "react";
import {
  CheckoutWidget,
  ConnectEmbed,
  useActiveAccount,
  useActiveWallet,
  useDisconnect,
  useWalletBalance,
  darkTheme,
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

// Embedded user wallets (EMAIL ONLY)
const wallets = [
  inAppWallet({
    auth: {
      options: ["email"],
    },
  }),
];

// ---------------------------------------------
// Themed checkout to match main page
// ---------------------------------------------
const patronCheckoutTheme = darkTheme({
  fontFamily:
    '"Cinzel", "EB Garamond", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", serif',
  colors: {
    modalBg: "#050505",
    modalOverlayBg: "rgba(0,0,0,0.85)",
    borderColor: "#3a2b16",
    separatorLine: "#3a2b16",
    mutedBg: "#050505",
    skeletonBg: "#111111",

    primaryText: "#f5eedc",
    secondaryText: "#c7b08a",
    selectedTextColor: "#111111",
    selectedTextBg: "#f5eedc",

    primaryButtonBg: "#e3bf72",
    primaryButtonText: "#181210",
    secondaryButtonBg: "#050505",
    secondaryButtonText: "#f5eedc",
    secondaryButtonHoverBg: "#111111",
    accentButtonBg: "#e3bf72",
    accentButtonText: "#181210",
    connectedButtonBg: "#050505",
    connectedButtonHoverBg: "#111111",

    secondaryIconColor: "#c7b08a",
    secondaryIconHoverColor: "#f5eedc",
    secondaryIconHoverBg: "#111111",
    danger: "#f97373",
    success: "#4ade80",
    tooltipBg: "#050505",
    tooltipText: "#f5eedc",
    inputAutofillBg: "#050505",
    scrollbarBg: "#050505",
  },
});

// ---------------------------------------------
// Simple error boundary for CheckoutWidget (plain JS)
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
  const [usdAmount, setUsdAmount] = useState("1");

  const account = useActiveAccount();
  const activeWallet = useActiveWallet();
  const { disconnect } = useDisconnect();
  const isConnected = !!account;

  const walletScrollRef = useRef(null);

  // Native ETH on Base (gas)
  const { data: baseBalance } = useWalletBalance({
    address: account?.address,
    chain: BASE,
    client,
  });

  // USDC on Base
  const { data: usdcBalance } = useWalletBalance({
    address: account?.address,
    chain: BASE,
    client,
    tokenAddress: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  });

  // PATRON
  const { data: patronBalance } = useWalletBalance({
    address: account?.address,
    chain: BASE,
    client,
    tokenAddress: "0xD766a771887fFB6c528434d5710B406313CAe03A",
  });

  const openWallet = () => setIsWalletOpen(true);
  const closeWallet = () => setIsWalletOpen(false);

  const handleBuyPatron = () => openWallet();

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

  const handleCopyAddress = async () => {
    if (!account?.address) return;
    try {
      await navigator.clipboard.writeText(account.address);
      alert("Patron Wallet address copied.");
    } catch (err) {
      console.error("Clipboard error:", err);
    }
  };

  const normalizedAmount =
    usdAmount && Number(usdAmount) > 0 ? String(usdAmount) : "1";

  const handleCheckoutSuccess = async (result) => {
    try {
      if (!account?.address) return;

      const resp = await fetch("/.netlify/functions/mint-patron", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address: account.address,
          usdAmount: normalizedAmount,
          checkout: {
            id: result?.id,
            amountPaid: result?.amountPaid ?? normalizedAmount,
            currency: result?.currency ?? "USD",
          },
        }),
      });

      if (!resp.ok) {
        const text = await resp.text();
        console.error("mint-patron error:", text);
        alert(
          "Payment succeeded, but we could not mint PATRON automatically.\n" +
            "We’ll review your transaction and credit you manually if needed."
        );
        return;
      }

      await resp.json();
      alert(
        "Thank you — your patronage payment was received.\n\n" +
          "PATRON is being credited to your wallet."
      );
    } catch (err) {
      console.error("Error in handleCheckoutSuccess:", err);
      alert(
        "Payment completed, but there was an error minting PATRON.\n" +
          "We’ll review and fix this on our side."
      );
    }
  };

  // Lock background scroll when modal open
  useEffect(() => {
    if (isWalletOpen) {
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";

      requestAnimationFrame(() => {
        if (walletScrollRef.current) walletScrollRef.current.scrollTop = 0;
      });

      return () => {
        document.documentElement.style.overflow = "";
        document.body.style.overflow = "";
      };
    }
    document.documentElement.style.overflow = "";
    document.body.style.overflow = "";
  }, [isWalletOpen]);

  // Escape closes modal
  useEffect(() => {
    if (!isWalletOpen) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") closeWallet();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isWalletOpen]);

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
              0xD766a771887fFB6c528434d5710B406313CAe03A
            </span>
          </div>
        </div>

        <div className="hero-actions">
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
          onClick={closeWallet}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.86)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
            padding: "14px",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ width: "100%", maxWidth: "380px" }}
          >
            <div
              ref={walletScrollRef}
              style={{
                width: "100%",
                maxHeight: "90vh",
                overflowY: "auto",
                border: "1px solid #3a2b16",
                borderRadius: "14px",
                padding: "16px",
                paddingTop: "26px",
                background: "#050505",
                boxShadow: "0 18px 60px rgba(0,0,0,0.85)",
                fontFamily:
                  '"Cinzel", "EB Garamond", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", serif',
                color: "#f5eedc",
                fontSize: "13px",
                position: "relative",
              }}
            >
              {/* Header */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "10px",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    fontSize: "18px",
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    color: "#c7b08a",
                    lineHeight: 1.1,
                  }}
                >
                  PATRON WALLET
                </div>

                <button
                  onClick={closeWallet}
                  aria-label="Close wallet"
                  title="Close"
                  style={{
                    position: "absolute",
                    right: 0,
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: "52px",
                    height: "52px",
                    border: "none",
                    background: "transparent",
                    color: "#e3bf72",
                    fontSize: "34px",
                    lineHeight: 1,
                    cursor: "pointer",
                    padding: 0,
                    WebkitTapHighlightColor: "transparent",
                  }}
                >
                  ×
                </button>
              </div>

              {/* Connect / Account */}
              {!account ? (
                <div style={{ marginBottom: "14px" }}>
                  <ConnectEmbed
                    client={client}
                    wallets={wallets}
                    chain={BASE}
                    theme={patronCheckoutTheme}
                  />
                </div>
              ) : (
                <div style={{ marginBottom: "14px", textAlign: "center" }}>
                  {/* ✅ Removed "CONNECTED" label */}

                  {/* Address + copy */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      gap: 8,
                      marginBottom: "10px",
                      marginTop: "2px",
                    }}
                  >
                    <div style={{ fontFamily: "monospace", fontSize: "13px" }}>
                      {shortAddress}
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyAddress}
                      style={{
                        border: "none",
                        background: "transparent",
                        color: "#e3bf72",
                        cursor: "pointer",
                        fontSize: "14px",
                      }}
                      aria-label="Copy Patron Wallet address"
                    >
                      📋
                    </button>
                  </div>

                  {/* ✅ Gas + USDC (smaller) */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      gap: "28px",
                      marginBottom: "10px",
                      flexWrap: "wrap",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: "10px",
                          letterSpacing: "0.14em",
                          textTransform: "uppercase",
                          color: "#9f8a64",
                          marginBottom: "2px",
                        }}
                      >
                        Gas
                      </div>
                      <div style={{ color: "#f5eedc", fontSize: "13px" }}>
                        {baseBalance?.displayValue || "0"}{" "}
                        {baseBalance?.symbol || "ETH"}
                      </div>
                    </div>

                    <div>
                      <div
                        style={{
                          fontSize: "10px",
                          letterSpacing: "0.14em",
                          textTransform: "uppercase",
                          color: "#9f8a64",
                          marginBottom: "2px",
                        }}
                      >
                        USDC
                      </div>
                      <div style={{ color: "#f5eedc", fontSize: "13px" }}>
                        {usdcBalance?.displayValue || "0"}{" "}
                        {usdcBalance?.symbol || "USDC"}
                      </div>
                    </div>
                  </div>

                  {/* ✅ PATRON on its own line, larger */}
                  <div style={{ marginBottom: "12px" }}>
                    <div
                      style={{
                        fontSize: "10px",
                        letterSpacing: "0.18em",
                        textTransform: "uppercase",
                        color: "#c7b08a",
                        marginBottom: "4px",
                      }}
                    >
                      Patron Balance
                    </div>
                    <div
                      style={{
                        fontSize: "18px",
                        letterSpacing: "0.02em",
                        color: "#f5eedc",
                      }}
                    >
                      {patronBalance?.displayValue || "0"}{" "}
                      {patronBalance?.symbol || "PATRON"}
                    </div>
                  </div>

                  <button
                    className="btn btn-outline"
                    style={{
                      minWidth: "auto",
                      padding: "6px 18px",
                      fontSize: "11px",
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                    }}
                    onClick={handleSignOut}
                  >
                    Sign Out
                  </button>
                </div>
              )}

              {/* Amount + Checkout */}
              <div style={{ position: "relative" }}>
                {!isConnected && (
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: "rgba(0,0,0,0.68)",
                      zIndex: 10,
                      borderRadius: "12px",
                      pointerEvents: "auto",
                    }}
                  />
                )}

                <div
                  style={{
                    opacity: !isConnected ? 0.75 : 1,
                    pointerEvents: isConnected ? "auto" : "none",
                    transition: "opacity 160ms ease",
                  }}
                >
                  <div style={{ marginBottom: "12px" }}>
                    <label
                      style={{
                        display: "block",
                        fontSize: "10px",
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                        color: "#c7b08a",
                        marginBottom: "6px",
                      }}
                    >
                      Choose Your Patronage (USD)
                    </label>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={usdAmount}
                      onChange={(e) => setUsdAmount(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        borderRadius: "10px",
                        border: "1px solid #3a2b16",
                        background: "#050505",
                        color: "#f5eedc",
                        fontSize: "16px",
                        outline: "none",
                        boxShadow: "0 10px 30px rgba(0,0,0,0.55)",
                      }}
                    />
                  </div>

                  <CheckoutBoundary>
                    <CheckoutWidget
                      client={client}
                      name={"POLO PATRONIUM"}
                      description={
                        "USPPA PATRONAGE UTILITY TOKEN · THREE SEVENS 777 REMUDA · COWBOY POLO CIRCUIT · THE POLO LIFE · CHARLESTON POLO CLUB"
                      }
                      currency={"USD"}
                      chain={BASE}
                      amount={normalizedAmount}
                      tokenAddress={
                        "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"
                      }
                      seller={"0xfee3c75691e8c10ed4246b10635b19bfff06ce16"}
                      buttonLabel={"BUY PATRON (USDC on Base)"}
                      theme={patronCheckoutTheme}
                      onSuccess={handleCheckoutSuccess}
                      onError={(err) => {
                        console.error("Checkout error:", err);
                        alert(err?.message || String(err));
                      }}
                    />
                  </CheckoutBoundary>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Brand / roadmap + copy sections */}
      <main>
        <section className="brand-row" id="brands">
          <h2 className="roadmap-title">INITIATIVE ROADMAP</h2>

          <div className="brand-grid">
            <div className="logo-block">
              <div className="logo-usp-string-remuda">
                <div className="usp-top">USPPA</div>
                <div className="rule" />
                <div
                  className="string-middle"
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    justifyContent: "center",
                    gap: "0.5em",
                  }}
                >
                  <span className="string-side">THREE</span>
                  <span className="sevens">7̶7̶7̶</span>
                  <span className="string-side">SEVENS</span>
                </div>
                <div className="remuda-bottom">REMUDA</div>
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

        <section className="copy-section" id="patronium-framework">
          <div className="copy-section-title">THE PATRONIUM FRAMEWORK</div>

          {/* ... rest of your Patronium framework section unchanged ... */}
        </section>
      </main>

      <footer>
        <div>© {year} US POLO PATRONS ASSOCIATION — POLO PATRONIUM</div>
        <div>BUILT ON BASE BY COINBASE</div>
      </footer>
    </div>
  );
}