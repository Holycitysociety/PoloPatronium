// App.jsx
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
  const [usdAmount, setUsdAmount] = useState("1");

  const account = useActiveAccount();
  const activeWallet = useActiveWallet();
  const { disconnect } = useDisconnect();
  const isConnected = !!account;

  const walletScrollRef = useRef(null);

  // Roadmap section – used as scroll trigger
  const roadmapGateRef = useRef(null);
  const [hasTriggeredGate, setHasTriggeredGate] = useState(false);

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

  // ✅ CheckoutWidget amount expects a NUMBER (not a string)
  const normalizedAmountNumber =
    usdAmount && Number(usdAmount) > 0 ? Number(usdAmount) : 1;

  const handleCheckoutSuccess = async (result) => {
    try {
      if (!account?.address) return;

      const resp = await fetch("/.netlify/functions/mint-patron", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address: account.address,
          usdAmount: String(normalizedAmountNumber),
          checkout: {
            id: result?.id,
            amountPaid: result?.amountPaid ?? String(normalizedAmountNumber),
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

  // Scroll trigger: when bottom of roadmap approaches top, pop wallet (once)
  useEffect(() => {
    if (isConnected) {
      setHasTriggeredGate(false);
      return;
    }

    const handleScroll = () => {
      if (hasTriggeredGate) return;
      const el = roadmapGateRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const triggerY = 96; // px from top of viewport

      if (rect.bottom <= triggerY) {
        setHasTriggeredGate(true);
        setIsWalletOpen(true);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isConnected, hasTriggeredGate]);

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
            ERC777→ERC20 &middot; TOKEN SYMBOL &quot;PATRON&quot;
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

          {/* ✅ Opens email draft */}
          <a
            className="btn btn-outline"
            href={
              "mailto:CharlestonPoloinfo@gmail.com" +
              "?subject=" +
              encodeURIComponent("Founding Patron Inquiry") +
              "&body=" +
              encodeURIComponent(
                "Hello Charleston Polo,\n\n" +
                  "I’m interested in becoming a Founding Patron.\n\n" +
                  "Name:\n" +
                  "Phone:\n" +
                  "City/State:\n" +
                  "Interest (capital / horses / land / facilities):\n" +
                  "Notes:\n\n" +
                  "Thank you,\n"
              )
            }
          >
            PATRON INQUIRIES
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
          <div style={{ width: "100%", maxWidth: "380px" }}>
            <div
              ref={walletScrollRef}
              onClick={(e) => e.stopPropagation()}
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
                  marginBottom: "12px",
                  position: "relative",
                  paddingTop: "4px",
                  textAlign: "center",
                  flexDirection: "column",
                  gap: 3,
                }}
              >
                {/* Line 1: USPPA (wide spaced) */}
                <div
                  style={{
                    fontSize: "10px",
                    letterSpacing: "0.24em",
                    textTransform: "uppercase",
                    color: "#9f8a64",
                    lineHeight: 1.1,
                  }}
                >
                  U&nbsp;S&nbsp;P&nbsp;P&nbsp;A
                </div>

                {/* Line 2: Polo Patronium */}
                <div
                  style={{
                    fontSize: "15px",
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    color: "#c7b08a",
                    lineHeight: 1.1,
                  }}
                >
                  Polo Patronium
                </div>

                {/* Line 3: Patron Wallet */}
                <div
                  style={{
                    fontSize: "12px",
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    color: "#f5eedc",
                    lineHeight: 1.1,
                  }}
                >
                  Patron Wallet
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
                    width: "56px",
                    height: "56px",
                    border: "none",
                    background: "transparent",
                    color: "#e3bf72",
                    fontSize: "38px",
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

                  {/* Gas + USDC (smaller) */}
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

                  {/* Patron balance (bigger, own line) */}
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
                      Patronium Balance
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
                  <button
                    type="button"
                    onClick={closeWallet}
                    aria-label="Close Patron Wallet"
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: "rgba(0,0,0,0.68)",
                      zIndex: 10,
                      borderRadius: "12px",
                      border: "none",
                      padding: 0,
                      cursor: "pointer",
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
                        "USPPA PATRONAGE UTILITY TOKEN · THREE SEVENS 7̶7̶7̶ REMUDA · COWBOY POLO CIRCUIT · THE POLO WAY · CHARLESTON POLO"
                      }
                      currency={"USD"}
                      chain={BASE}
                      amount={normalizedAmountNumber}
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
        {/* Roadmap (scroll trigger) */}
        <section className="brand-row" id="brands" ref={roadmapGateRef}>
          {/* INITIATIVE ROADMAP as a proper wordmark */}
          <div
            className="roadmap-title"
            style={{
              textAlign: "center",
              marginBottom: "34px",
            }}
          >
            <div
              style={{
                fontSize: "11px",
                letterSpacing: "0.28em",
                textTransform: "uppercase",
                color: "#9f8a64",
                marginBottom: "4px",
              }}
            >
              INITIATIVE
            </div>
            <div
              style={{
                fontSize: "20px",
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "#f5eedc",
              }}
            >
              ROADMAP
            </div>

            {/* subtle spacer / rule under the wordmark */}
            <div
              style={{
                marginTop: "10px",
                height: "1px",
                width: "80px",
                marginLeft: "auto",
                marginRight: "auto",
                background: "#3a2b16",
                opacity: 0.9,
              }}
            />
          </div>

          <div className="brand-grid">
            {/* ✅ SWAPPED ORDER: COWBOY POLO CIRCUIT FIRST */}
            <div className="logo-block">
              <div
                className="logo-cowboy-polo-circuit"
                style={{
                  borderColor: "#c7b08a",
                  color: "#f5eedc",
                }}
              >
                <span>COWBOY&nbsp;POLO&nbsp;CIRCUIT</span>
              </div>
              <p className="initiative-text">
                An American endeavour to broaden Polo&apos;s reach, nurture
                emerging talent, and encourage the next generation of American
                players — where riders not only learn to play, but learn to make
                the horses of the 7̶7̶7̶ (String Three Sevens) Remuda.
              </p>
            </div>

            {/* ✅ SWAPPED ORDER: 777 WORDMARK SECOND */}
            <div className="logo-block">
              <div className="logo-usp-string-remuda">
                {/* Central bar: THREE · 7̶7̶7̶ · SEVENS */}
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5em",
                    padding: "8px 16px 6px",
                    borderTop: "1px solid #c7b08a",
                    borderBottom: "1px solid #c7b08a",
                  }}
                >
                  <span
                    style={{
                      fontSize: "10px",
                      letterSpacing: "0.22em",
                      textTransform: "uppercase",
                      color: "#c7b08a",
                    }}
                  >
                    THREE
                  </span>
                  <span
                    style={{
                      fontSize: "12px",
                      color: "#c7b08a",
                    }}
                  >
                    ·
                  </span>
                  <span
                    style={{
                      fontSize: "32px",
                      letterSpacing: "0.22em",
                      color: "#f5eedc",
                      lineHeight: 1,
                    }}
                  >
                    7̶7̶7̶
                  </span>
                  <span
                    style={{
                      fontSize: "12px",
                      color: "#c7b08a",
                    }}
                  >
                    ·
                  </span>
                  <span
                    style={{
                      fontSize: "10px",
                      letterSpacing: "0.22em",
                      textTransform: "uppercase",
                      color: "#c7b08a",
                    }}
                  >
                    SEVENS
                  </span>
                </div>

                {/* Base caption: STRING REMUDA */}
                <div
                  style={{
                    marginTop: "6px",
                    fontSize: "9px",
                    letterSpacing: "0.32em",
                    textTransform: "uppercase",
                    color: "#9f8a64",
                  }}
                >
                  REMUDA
                </div>
              </div>

              <p className="initiative-text">
                Our managed herd of USPPA horses — consigned or owned by the
                Association, assigned to operating patrons, trainers and local
                players, and developed for play, exhibition and training across
                our programmes.
              </p>
            </div>

            {/* THE POLO WAY with gold "THE" */}
            <div className="logo-block">
              <div className="logo-the-polo-way">
                <span
                  className="top"
                  style={{
                    color: "#c7b08a",
                  }}
                >
                  THE
                </span>
                <span className="main">POLO WAY</span>
              </div>
              <p className="initiative-text">
                A platform dedicated to presenting the elegance and traditions
                of polo to new audiences in the digital age — following our
                horses, patrons, and players across the Cowboy Polo Circuit.
              </p>
            </div>

            {/* CHARLESTON POLO with gold "CHARLESTON" + line */}
            <div className="logo-block">
              <div
                className="logo-charleston-polo"
                style={{
                  borderColor: "#c7b08a",
                }}
              >
                <span
                  className="top"
                  style={{
                    color: "#c7b08a",
                  }}
                >
                  CHARLESTON
                </span>
                <span className="main">P  O  L  O</span>
              </div>
              <p className="initiative-text">
              
              The renewal of Charleston, South Carolina&apos;s polo tradition — our flagship USPPA Chapter and living test model for the Polo Incubator system. Horses are gathered, pasture secured, instruction established, and the public welcomed to learn and play. Once an Incubator achieves steady operations, sound horsemanship, and visible community benefit, it is received as a standing Chapter of the Association.
              Each USPPA Chapter is a fully integrated programme operating under the Association&apos;s standards. Charleston Polo, as the flagship Chapter, serves as the organisational hub for the Cowboy Polo Circuit — coordinating local Cowboy Polo clinics, sanctioned chukkers at member barns and arenas, and the first pool of Chapter horses.

In its early life, a Chapter begins as a Polo Incubator: a local startup where the “bring your own horse” model allows riders and stables to join the Circuit quickly, while a shared remuda is trained for exhibitions, league play, and new riders. Once an Incubator demonstrates steady operations, sound horsemanship, and visible benefit to the community, it is recognised as a standing Chapter of the USPPA.
              </p>
            </div>
          </div>

          <p className="roadmap-footnote">
            All of these initiatives are coordinated and supported through Polo
            Patronium, the living token of patronage within the United States
            Polo Patrons Association, uniting patrons, players, and clubs in a
            shared Polo ecosystem.
          </p>
        </section>

        {/* Patronium Framework (tokenomics) – blurred overlay until connected */}
        <section className="copy-section" id="patronium-framework">
          <div className="copy-section-title">THE PATRONIUM FRAMEWORK</div>

          <div
            style={{
              position: "relative",
              marginTop: "8px",
            }}
          >
            {!isConnected && (
              <div
                onClick={openWallet}
                style={{
                  position: "absolute",
                  inset: 0,
                  zIndex: 50,
                  background: "rgba(0,0,0,0.25)",
                  backdropFilter: "blur(8px)",
                  WebkitBackdropFilter: "blur(8px)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "22px",
                  textAlign: "center",
                }}
                aria-label="Sign in required to view Patronium Framework"
                role="button"
              >
                <div>
                  <div
                    style={{
                      fontSize: "11px",
                      letterSpacing: "0.22em",
                      textTransform: "uppercase",
                      color: "#c7b08a",
                      marginBottom: "8px",
                    }}
                  >
                    PATRONIUM FRAMEWORK
                  </div>
                  <div
                    style={{
                      fontSize: "13px",
                      lineHeight: 1.6,
                      color: "#f5eedc",
                    }}
                  >
                    Sign into your Patron Wallet to view the full Patronium
                    framework and tribute structure.
                  </div>
                </div>
              </div>
            )}

            {/* Actual content (visible only when connected, but always rendered) */}
            <div aria-hidden={!isConnected && true}>
              <div className="copy-block">
                <h3>Patronium — Polo Patronage Perfected</h3>
                <p>
                  Patronium is the living token of patronage within the United
                  States Polo Patrons Association. It is the medium through
                  which honourable support is recognised and shared — not
                  through speculation, but through participation. Every token of
                  Patronium represents a place within the fellowship of those
                  who uphold the game, its horses, and its players.
                </p>
                <p>
                  It serves as the bridge between patron and player: a clear
                  record of contribution and belonging within a high-trust
                  mission driven community. When a Chapter prospers, it offers
                  tribute to those whose support made that prosperity possible.
                  This is the essence of Patronium — recognition earned through
                  genuine patronage and service to the field.
                </p>
              </div>

              <div className="copy-block">
                <h3>Charleston Polo — The USPPA Chapter Test Model</h3>
                <p>
                  Each USPPA Chapter is a fully integrated polo programme
                  operating under the Association&apos;s standards. A Chapter
                  begins as a Polo Incubator — a local startup where horses are
                  gathered, pasture secured, instruction established, and the
                  public welcomed to learn and play.
                </p>
                <p>
                  Once an Incubator achieves steady operations, sound
                  horsemanship, and visible community benefit, it becomes a
                  standing Chapter of the Association.
                </p>
              </div>

              <div className="copy-block">
                <h3>Founding, Operating, and USPPA Patrons</h3>
                <p>There are three forms of Patronium holder.</p>
                <p>
                  Founding Patrons are the first to support the birth of a new
                  Chapter. They provide the initial horses, pasture, and capital
                  that make it possible for a Polo Incubator to begin. During
                  this founding period, their Patronium receives the full
                  measure of available tribute — a reflection of their patronage
                  in helping to seed the future of Polo.
                </p>
                <p>
                  Operating Patrons are the active stewards responsible for the
                  management of each Chapter. They receive a base salary during
                  the incubator period and an operating share of tribute once
                  the incubator transitions to a full Chapter.
                </p>
                <p>
                  USPPA Patrons are the ongoing supporters who sustain and
                  strengthen a Chapter once it is established.
                </p>
              </div>

              <div className="copy-block">
                <h3> The Tribute Framework</h3>
                <p>
                  Each Chapter follows a principle of balanced and transparent
                  patronage. From its net revenue (gross revenue less
                  operational costs), a Chapter aims to follow this allocation:
                </p>
                <ul>
                  <li>
                    51%+ retained for reinvestment — horses, pasture, equipment,
                    and operations.
                  </li>
                  <li>
                    49% max. available to the Patronium Tribute Pool, from which
                    holders are recognised for their continued patronage.
                  </li>
                </ul>
                <p>
                  During the Polo Incubator period, the Founding Patrons are
                  whitelisted for direct proportional tribute from the Polo
                  Incubators they support (49% of tribute). After the first
                  year, or when the Incubator can support itself, it transitions
                  to a full Chapter and the tribute returns to the standard
                  USPPA Patron tribute.
                </p>
              </div>

              <div className="copy-block">
                <h3>Participation</h3>
                <ul>
                  <li>
                    Become a Founding Patron — assist in launching a new Chapter
                    through contribution of capital, horses, or facilities.
                  </li>
                  <li>
                    Become an Operating Patron — oversee the daily life of a
                    Chapter and its players.
                  </li>
                  <li>
                    Become a USPPA Patron — support the national network and
                    share in ongoing tribute cycles.
                  </li>
                  <li>
                    Provide Horses or Land — supply the physical foundation of
                    Polo under insured, transparent, and fair agreements.
                  </li>
                </ul>
              </div>

              <div className="copy-block">
                <h3>In Plain Terms</h3>
                <p>
                  The Association seeks not to monetise polo, but to stabilise
                  and decentralise it — to bring clarity, fairness, and
                  longevity to the way it is taught, funded, and shared.
                  Patronium and the Polo Incubator model together create a
                  living, self-sustaining framework for the game&apos;s renewal
                  across America.
                </p>
                <p>
                  This is how the USPPA will grow the next American 10-Goal
                  player.
                </p>
              </div>

              <div className="copy-block">
                <h3>An Invitation to Patrons and Partners</h3>
                <p>
                  The Association welcomes discerning patrons, landholders, and
                  professionals who wish to take part in the restoration of polo
                  as a sustainable, American-bred enterprise. Each Chapter is a
                  living investment in horses, land, and people — structured not
                  for speculation, but for legacy.
                </p>
                <p>
                  Patronium ensures every act of patronage — whether a horse
                  consigned, a pasture opened, or a field sponsored — is
                  recognised and recorded within a transparent, honourable
                  system that rewards those who build American Polo. Your
                  contribution does not vanish into expense; it lives on in
                  horses trained, players formed, and fields maintained.
                </p>
                <p>
                  Those who have carried the game through their own time know:
                  it survives only by the strength of its patrons. The USPPA now
                  offers a new way to hold that legacy — a means to see your
                  support endure in the form of living tribute.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer>
        <div>© {year} US POLO PATRONS ASSOCIATION — POLO PATRONIUM</div>
        <div>BUILT ON BASE BY COINBASE</div>
      </footer>
    </div>
  );
}