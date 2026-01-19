// App.jsx — Polo Patronium (FULL FILE)
// Updated for new Thirdweb CheckoutWidget + purchaseData
// Canonical addresses (USDC, PATRON, seller) and cross-site header tabs included

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

// ------------------------------------------------------------
// THIRDWEB CLIENT + BASE CHAIN
// ------------------------------------------------------------
const client = createThirdwebClient({
  clientId: "f58c0bfc6e6a2c00092cc3c35db1eed8",
});

const BASE = defineChain(8453);

// Embedded wallet (EMAIL ONLY)
const wallets = [
  inAppWallet({
    auth: { options: ["email"] },
  }),
];

// ------------------------------------------------------------
// THEME FOR CHECKOUT
// ------------------------------------------------------------
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

// ------------------------------------------------------------
// ERROR BOUNDARY FOR CHECKOUT
// ------------------------------------------------------------
class CheckoutBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(err, info) {
    console.error("CheckoutWidget crashed:", err, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <p style={{ color: "#e3bf72", marginTop: "12px" }}>
          Checkout unavailable — try again later.
        </p>
      );
    }
    return this.props.children;
  }
}

// ------------------------------------------------------------
// CROSS-SITE HEADER TABS (TRANSPARENT TABS)
// ------------------------------------------------------------
function GlobalHeaderNav() {
  const [activeKey, setActiveKey] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const host = window.location.hostname.toLowerCase();
    if (host.includes("uspolopatrons")) setActiveKey("usppa");
    else if (host.includes("polopatronium")) setActiveKey("patronium");
    else if (host.includes("cowboypolo")) setActiveKey("cowboy");
    else if (host.includes("thepoloway")) setActiveKey("poloway");
    else if (host.includes("charlestonpolo")) setActiveKey("charleston");
  }, []);

  const shellStyle = {
    position: "sticky",
    top: 0,
    zIndex: 1000,
    background: "transparent",
    borderBottom: "1px solid rgba(58,43,22,0.7)",
    marginBottom: 14,
  };

  const navStyle = {
    display: "flex",
    gap: "10px",
    padding: "6px 14px 0",
    alignItems: "flex-end",
    overflowX: "auto",
  };

  const baseTab = {
    fontFamily:
      '"Cinzel", "EB Garamond", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", serif',
    fontSize: "10px",
    letterSpacing: "0.18em",
    textTransform: "uppercase",
    textDecoration: "none",
    whiteSpace: "nowrap",
    color: "#9f8a64",
    padding: "6px 10px 5px",
    borderRadius: "10px 10px 0 0",
    borderTop: "1px solid rgba(199,176,138,0.5)",
    borderLeft: "1px solid rgba(199,176,138,0.5)",
    borderRight: "1px solid rgba(199,176,138,0.5)",
    borderBottom: "none",
    background: "transparent",
    marginBottom: "-1px",
    transition:
      "color 140ms ease, border-color 140ms ease, transform 140ms ease",
  };

  const activeTab = {
    color: "#f5eedc",
    borderTop: "1px solid #e3bf72",
    borderLeft: "1px solid #e3bf72",
    borderRight: "1px solid #e3bf72",
    transform: "translateY(1px)",
  };

  const hoverTab = {
    color: "#f5eedc",
    borderTop: "1px solid rgba(227,191,114,0.9)",
    borderLeft: "1px solid rgba(227,191,114,0.9)",
    borderRight: "1px solid rgba(227,191,114,0.9)",
  };

  const makeLinkProps = (key) => {
    const isActive = activeKey === key;
    const baseStyle = { ...baseTab, ...(isActive ? activeTab : null) };
    return {
      style: baseStyle,
      onMouseEnter: (e) => {
        if (isActive) return;
        Object.assign(e.currentTarget.style, baseStyle, hoverTab);
      },
      onMouseLeave: (e) => {
        Object.assign(e.currentTarget.style, baseStyle);
      },
    };
  };

  return (
    <div style={shellStyle}>
      <nav style={navStyle}>
        <a href="https://uspolopatrons.org" {...makeLinkProps("usppa")}>
          U.S. POLO&nbsp;PATRONS
        </a>
        <a href="https://polopatronium.com" {...makeLinkProps("patronium")}>
          POLO&nbsp;PATRONIUM
        </a>
        <a href="https://cowboypolo.com" {...makeLinkProps("cowboy")}>
          COWBOY&nbsp;POLO&nbsp;CIRCUIT
        </a>
        <a href="https://thepoloway.com" {...makeLinkProps("poloway")}>
          THE&nbsp;POLO&nbsp;WAY
        </a>
        <a href="https://charlestonpolo.com" {...makeLinkProps("charleston")}>
          CHARLESTON&nbsp;POLO
        </a>
      </nav>
    </div>
  );
}

// ------------------------------------------------------------
// MAIN APP (FULL)
// ------------------------------------------------------------
export default function App() {
  const year = new Date().getFullYear();
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [usdAmount, setUsdAmount] = useState("1");

  const account = useActiveAccount();
  const activeWallet = useActiveWallet();
  const { disconnect } = useDisconnect();

  const isConnected = !!account;
  const walletScrollRef = useRef(null);
  const roadmapGateRef = useRef(null);
  const [hasTriggeredGate, setHasTriggeredGate] = useState(false);

  // ---------------------------
  // Wallet balances
  // ---------------------------
  const { data: baseBalance } = useWalletBalance({
    address: account?.address,
    chain: BASE,
    client,
  });

  const { data: usdcBalance } = useWalletBalance({
    address: account?.address,
    chain: BASE,
    client,
    tokenAddress: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  });

  const { data: patronBalance } = useWalletBalance({
    address: account?.address,
    chain: BASE,
    client,
    tokenAddress: "0xD766a771887fFB6c528434d5710B406313CAe03A",
  });

  // ---------------------------
  // Modal control
  // ---------------------------
  const openWallet = () => setIsWalletOpen(true);
  const closeWallet = () => setIsWalletOpen(false);

  // ---------------------------
  // Clipboard
  // ---------------------------
  const shortAddress =
    account?.address
      ? `${account.address.slice(0, 6)}…${account.address.slice(-4)}`
      : "";

  const handleCopyAddress = async () => {
    if (!account?.address) return;
    await navigator.clipboard.writeText(account.address);
    alert("Patron Wallet address copied.");
  };

  // ---------------------------
  // Clean amount
  // ---------------------------
  const normalizedAmount =
    usdAmount && Number(usdAmount) > 0 ? String(Number(usdAmount)) : "1";

  // ---------------------------
  // Checkout Success → call mint-patron
  // ---------------------------
  const handleCheckoutSuccess = async (result) => {
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

    const data = await resp.json().catch(() => null);

    if (!resp.ok) {
      alert(
        "Mint failed:\n" +
          (data?.error ||
            data?.message ||
            resp.statusText ||
            "Unknown error")
      );
      return;
    }

    alert(
      "Thank you — your patronage payment was received.\n\n" +
        "PATRON is being credited to your wallet.\n\n" +
        (data?.txHash ? `Tx: ${data.txHash}` : "")
    );
  };

  // ---------------------------
  // Scroll lock when modal open
  // ---------------------------
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

  // Escape to close modal
  useEffect(() => {
    if (!isWalletOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") closeWallet();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isWalletOpen]);

  // ---------------------------
  // Scroll trigger for auto-open
  // ---------------------------
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
      if (rect.bottom <= 96) {
        setHasTriggeredGate(true);
        setIsWalletOpen(true);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isConnected, hasTriggeredGate]);

  // ------------------------------------------------------------
  // RENDER
  // ------------------------------------------------------------
  return (
    <div className="page">
      {/* Cross-site tabs */}
      <GlobalHeaderNav />

      {/* Top-right wallet button */}
      <header
        style={{
          display: "flex",
          justifyContent: "flex-end",
          padding: "12px 0",
        }}
      >
        <button
          className="btn btn-outline"
          style={{ padding: "6px 16px" }}
          onClick={openWallet}
        >
          PATRON WALLET
        </button>
      </header>

      {/* ------------------------------------------------------------
         MASTHEAD
      ------------------------------------------------------------ */}
      <div className="masthead">
        <div className="masthead-inner">
          <div className="masthead-line-1">
            <span>UNITED STATES POLO</span>
            <span>PATRONS ASSOCIATION</span>
          </div>
          <div className="masthead-rule" />
          <div className="masthead-line-2 masthead-presents">PRESENTS THE</div>
          <div className="masthead-line-2 masthead-stewardship">
            OFFICIAL POLO PATRONAGE TOKEN
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------
         HERO
      ------------------------------------------------------------ */}
      <header>
        <h1 className="hero-title">POLO PATRONIUM</h1>

        <div className="hero-symbol">
          <div className="hero-symbol-main">
            ERC-777 V0 → ERC-20 V1
            <br />
            TOKEN SYMBOL “PATRON”
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
          <button className="btn btn-primary" onClick={openWallet}>
            BUY PATRON
          </button>

          <a
            className="btn btn-outline"
            href={
              "mailto:CharlestonPoloinfo@gmail.com" +
              "?subject=" +
              encodeURIComponent("Founding Patron Inquiry") +
              "&body=" +
              encodeURIComponent(
                "Hello Charleston Polo,\n\n" +
                  "I am interested in becoming a Founding Patron.\n\n" +
                  "Name:\nPhone:\nCity/State:\nInterest (capital / horses / land / facilities):\nNotes:\n\nThank you,\n"
              )
            }
          >
            PATRON INQUIRIES
          </a>
        </div>
      </header>

      {/* ------------------------------------------------------------
         WALLET MODAL
      ------------------------------------------------------------ */}
      {isWalletOpen && (
        <div
          className="wallet-modal-backdrop"
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
          onClick={closeWallet}
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
                color: "#f5eedc",
                fontFamily:
                  '"Cinzel", "EB Garamond", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", serif',
                boxShadow: "0 18px 60px rgba(0,0,0,0.85)",
                fontSize: "13px",
                position: "relative",
              }}
            >
              {/* HEADER INSIDE MODAL */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 3,
                  alignItems: "center",
                  marginBottom: "12px",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    fontSize: "10px",
                    letterSpacing: "0.24em",
                    textTransform: "uppercase",
                    color: "#9f8a64",
                  }}
                >
                  U&nbsp;S&nbsp;P&nbsp;P&nbsp;A
                </div>

                <div
                  style={{
                    fontSize: "15px",
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    color: "#c7b08a",
                  }}
                >
                  Polo Patronium
                </div>

                <div
                  style={{
                    fontSize: "12px",
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    color: "#f5eedc",
                  }}
                >
                  Patron Wallet
                </div>

                <button
                  onClick={closeWallet}
                  style={{
                    position: "absolute",
                    right: 0,
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: "56px",
                    height: "56px",
                    background: "transparent",
                    border: "none",
                    color: "#e3bf72",
                    fontSize: "38px",
                    cursor: "pointer",
                  }}
                >
                  ×
                </button>
              </div>

              {/* CONNECT / ACCOUNT */}
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
                  {/* Address */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      gap: 8,
                      marginBottom: "10px",
                    }}
                  >
                    <div style={{ fontFamily: "monospace", fontSize: "13px" }}>
                      {shortAddress}
                    </div>
                    <button
                      onClick={handleCopyAddress}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "#e3bf72",
                        cursor: "pointer",
                      }}
                    >
                      📋
                    </button>
                  </div>

                  {/* Gas + USDC */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      gap: "28px",
                      marginBottom: "10px",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: "10px",
                          letterSpacing: "0.14em",
                          color: "#9f8a64",
                        }}
                      >
                        Gas
                      </div>
                      <div style={{ fontSize: "13px" }}>
                        {baseBalance?.displayValue || "0"}{" "}
                        {baseBalance?.symbol || "ETH"}
                      </div>
                    </div>

                    <div>
                      <div
                        style={{
                          fontSize: "10px",
                          letterSpacing: "0.14em",
                          color: "#9f8a64",
                        }}
                      >
                        USDC
                      </div>
                      <div style={{ fontSize: "13px" }}>
                        {usdcBalance?.displayValue || "0"}{" "}
                        {usdcBalance?.symbol || "USDC"}
                      </div>
                    </div>
                  </div>

                  {/* Patron Balance */}
                  <div style={{ marginBottom: "12px" }}>
                    <div
                      style={{
                        fontSize: "10px",
                        letterSpacing: "0.18em",
                        textTransform: "uppercase",
                        color: "#c7b08a",
                      }}
                    >
                      Patronium Balance
                    </div>
                    <div style={{ fontSize: "18px" }}>
                      {patronBalance?.displayValue || "0"}{" "}
                      {patronBalance?.symbol || "PATRON"}
                    </div>
                  </div>

                  <button
                    className="btn btn-outline"
                    style={{
                      padding: "6px 18px",
                      fontSize: "11px",
                      letterSpacing: "0.12em",
                    }}
                    onClick={() => disconnect(activeWallet)}
                  >
                    Sign Out
                  </button>
                </div>
              )}

              {/* CHECKOUT SECTION */}
              <div style={{ position: "relative" }}>
                {!isConnected && (
                  <button
                    onClick={closeWallet}
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: "rgba(0,0,0,0.68)",
                      zIndex: 10,
                      borderRadius: "12px",
                      border: "none",
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
                        fontSize: "10px",
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                        color: "#c7b08a",
                      }}
                    >
                      Choose Your Patronage (USD)
                    </label>
                    <input
                      type="number"
                      min="1"
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
                      }}
                    />
                  </div>

                  <CheckoutBoundary>
                    <CheckoutWidget
                      client={client}
                      chain={BASE}
                      theme={patronCheckoutTheme}
                      tokenAddress="0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"
                      amount={normalizedAmount}
                      currency="USD"
                      seller="0xfee3c75691e8c10ed4246b10635b19bfff06ce16"
                      name="POLO PATRONIUM"
                      description="USPPA PATRONAGE UTILITY TOKEN · STRING 7̶7̶7̶ REMUDA · COWBOY POLO CIRCUIT · THE POLO WAY · CHARLESTON POLO"

                      // CRITICAL: ensures thirdweb-webhook.js knows the buyer
                      purchaseData={{
                        walletAddress: account?.address || "",
                      }}

                      onSuccess={handleCheckoutSuccess}
                      onError={(err) => {
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

      {/* ------------------------------------------------------------
         MAIN COPY / ROADMAP
      ------------------------------------------------------------ */}
      <main>
        <section className="brand-row" id="brands" ref={roadmapGateRef}>
          {/* INITIATIVE ROADMAP TITLE */}
          <div
            className="roadmap-title"
            style={{ textAlign: "center", marginBottom: "34px" }}
          >
            <div
              style={{
                fontSize: "11px",
                letterSpacing: "0.28em",
                textTransform: "uppercase",
                color: "#9f8a64",
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
            <div
              style={{
                marginTop: "10px",
                height: "1px",
                width: "80px",
                background: "#3a2b16",
                opacity: 0.9,
                marginLeft: "auto",
                marginRight: "auto",
              }}
            />
          </div>

          {/* BRAND BLOCKS */}
          <div className="brand-grid">
            {/* COWBOY POLO CIRCUIT */}
            <div className="logo-block">
              <div
                className="logo-cowboy-polo-circuit"
                style={{ borderColor: "#c7b08a", color: "#f5eedc" }}
              >
                <span>COWBOY&nbsp;POLO&nbsp;CIRCUIT</span>
              </div>
              <p className="initiative-text">
                An American endeavour to broaden Polo&apos;s reach, nurture
                emerging talent, and encourage the next generation of American
                players — where riders not only learn to play, but learn to make
                the horses of the String 7̶7̶7̶ Remuda.
              </p>
            </div>

            {/* 7̶7̶7̶ STRING REMUDA */}
            <div className="logo-block">
              <div className="logo-usp-string-remuda">
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
                  <span style={{ fontSize: "12px", color: "#c7b08a" }}>·</span>
                  <span
                    style={{
                      fontSize: "32px",
                      letterSpacing: "0.22em",
                      color: "#f5eedc",
                    }}
                  >
                    7̶7̶7̶
                  </span>
                  <span style={{ fontSize: "12px", color: "#c7b08a" }}>·</span>
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
                Association, assigned to patrons, trainers and players, and
                developed for play and instruction.
              </p>
            </div>

            {/* THE POLO WAY */}
            <div className="logo-block">
              <div className="logo-the-polo-way">
                <span className="top" style={{ color: "#c7b08a" }}>
                  THE
                </span>
                <span className="main">POLO WAY</span>
              </div>
              <p className="initiative-text">
                A platform dedicated to presenting the traditions of polo to new
                audiences — following our horses, patrons, and players across
                the Cowboy Polo Circuit.
              </p>
            </div>

            {/* CHARLESTON POLO */}
            <div className="logo-block">
              <div
                className="logo-charleston-polo"
                style={{ borderColor: "#c7b08a" }}
              >
                <span className="top" style={{ color: "#c7b08a" }}>
                  CHARLESTON
                </span>
                <span className="main">P  O  L  O</span>
              </div>

              <p className="initiative-text">
                The renewal of Charleston&apos;s polo tradition — our flagship
                USPPA Chapter and the operational hub for the Cowboy Polo
                Circuit. Horses are gathered, instruction established, and the
                public welcomed to learn and play.
                <br />
                <br />
                A Chapter begins as a Polo Incubator: a startup where riders
                bring their own horses while the shared remuda is trained for
                league play and exhibitions. Once stable, it becomes a standing
                USPPA Chapter.
              </p>
            </div>
          </div>

          <p className="roadmap-footnote">
            All initiatives are coordinated through Polo Patronium, uniting
            patrons, players, and clubs in a living ecosystem.
          </p>
        </section>

        {/* ------------------------------------------------------------
           PATRONIUM FRAMEWORK (CONNECTED-ONLY VISUAL)
        ------------------------------------------------------------ */}
        <section className="copy-section" id="patronium-framework">
          <div className="copy-section-title">THE PATRONIUM FRAMEWORK</div>

          <div style={{ position: "relative", marginTop: "8px" }}>
            {!isConnected && (
              <div
                onClick={openWallet}
                style={{
                  position: "absolute",
                  inset: 0,
                  zIndex: 50,
                  background: "rgba(0,0,0,0.25)",
                  backdropFilter: "blur(8px)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "22px",
                }}
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
                    Sign into your Patron Wallet to view the full framework and
                    tribute structure.
                  </div>
                </div>
              </div>
            )}

            <div aria-hidden={!isConnected}>
              {/* PART 1 */}
              <div className="copy-block">
                <h3>Patronium — Polo Patronage Perfected</h3>
                <p>
                  Patronium is the living token of patronage within the United
                  States Polo Patrons Association — recording contribution,
                  stewardship, and belonging within a high-trust community.
                </p>
                <p>
                  When a Chapter prospers, it offers tribute to those whose
                  support made that prosperity possible.
                </p>
              </div>

              {/* PART 2 */}
              <div className="copy-block">
                <h3>Charleston Polo — The Chapter Test Model</h3>
                <p>
                  A Chapter begins as a Polo Incubator: horses gathered,
                  instruction established, and riders welcomed. Once stable, it
                  becomes a standing USPPA Chapter.
                </p>
              </div>

              {/* PART 3 */}
              <div className="copy-block">
                <h3>Founding, Operating, and USPPA Patrons</h3>
                <p>
                  Founding Patrons seed new Chapters. Operating Patrons manage
                  them. USPPA Patrons sustain them.
                </p>
              </div>

              {/* PART 4 */}
              <div className="copy-block">
                <h3>The Tribute Framework</h3>
                <p>
                  Chapters follow a balanced allocation:
                </p>
                <ul>
                  <li>51%+ reinvested into horses, land, people</li>
                  <li>49% max to Patronium Tribute Pool</li>
                </ul>
              </div>

              {/* PART 5 */}
              <div className="copy-block">
                <h3>Participation</h3>
                <ul>
                  <li>Become a Founding Patron</li>
                  <li>Become an Operating Patron</li>
                  <li>Become a USPPA Patron</li>
                  <li>Provide Horses or Land</li>
                </ul>
              </div>

              {/* PART 6 */}
              <div className="copy-block">
                <h3>In Plain Terms</h3>
                <p>
                  Patronium stabilises and decentralises Polo — creating a
                  living, self-sustaining framework for the game’s renewal.
                </p>
              </div>

              {/* PART 7 */}
              <div className="copy-block">
                <h3>An Invitation</h3>
                <p>
                  The Association welcomes discerning patrons, landholders, and
                  professionals committed to stewarding American Polo for the
                  next century.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ------------------------------------------------------------
         FOOTER
      ------------------------------------------------------------ */}
      <footer>
        <div>© {year} US POLO PATRONS ASSOCIATION — POLO PATRONIUM</div>
        <div>BUILT ON BASE BY COINBASE</div>
      </footer>
    </div>
  );
}