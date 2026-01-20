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
import "./App.css";

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
// Themed checkout / wallet (same spec as Patronium)
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
  const year = 2026;

  const [walletOpen, setWalletOpen] = useState(false);
  const [usdAmount, setUsdAmount] = useState("1");

  const account = useActiveAccount();
  const activeWallet = useActiveWallet();
  const { disconnect } = useDisconnect();
  const isConnected = !!account;

  const walletScrollRef = useRef(null);

  // Gate section ref (Patronium — Polo Patronage Perfected)
  const gateRef = useRef(null);
  const hasTriggeredGateRef = useRef(false);

  // Shared site tab state
  const [activeSite, setActiveSite] = useState("");

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

  // PATRON on Base
  const { data: patronBalance } = useWalletBalance({
    address: account?.address,
    chain: BASE,
    client,
    tokenAddress: "0xD766a771887fFB6c528434d5710B406313CAe03A",
  });

  const openWallet = () => setWalletOpen(true);
  const closeWallet = () => setWalletOpen(false);

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

  // Normalised amount (both number + string forms)
  const normalizedAmountNumber =
    usdAmount && Number(usdAmount) > 0 ? Number(usdAmount) : 1;
  const normalizedAmount = String(normalizedAmountNumber);

  /**
   * IMPORTANT:
   * Do NOT call any mint/transfer function from the client.
   * Fulfillment is done server-side from thirdweb webhook data.
   */
  const handleCheckoutSuccess = async (result) => {
    console.log("Checkout success:", result);

    alert(
      "Payment received.\n\n" +
        "PATRON will be credited automatically (usually within moments).\n" +
        "If you do not see it shortly, contact support with your wallet address."
    );
  };

  // Scroll lock while wallet modal is open (mobile-safe)
  useEffect(() => {
    if (!walletOpen) return;

    const scrollY = window.scrollY;
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";

    requestAnimationFrame(() => {
      if (walletScrollRef.current) walletScrollRef.current.scrollTop = 0;
    });

    return () => {
      const top = document.body.style.top;
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.width = "";
      const y = top ? Math.abs(parseInt(top, 10)) : 0;
      window.scrollTo(0, y);
    };
  }, [walletOpen]);

  // Escape key closes wallet
  useEffect(() => {
    if (!walletOpen) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") closeWallet();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [walletOpen]);

  // Reset scroll-gate state when they connect / disconnect
  useEffect(() => {
    hasTriggeredGateRef.current = false;
  }, [isConnected]);

  // Auto-open wallet once when the Patronium section scrolls into view (if NOT connected)
  useEffect(() => {
    if (isConnected) return;

    const onScroll = () => {
      if (hasTriggeredGateRef.current) return;
      const el = gateRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const triggerY = 120; // px from top of viewport

      if (rect.top <= triggerY && rect.bottom > 0) {
        hasTriggeredGateRef.current = true;
        setWalletOpen(true);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => window.removeEventListener("scroll", onScroll);
  }, [isConnected]);

  // Determine active tab from hostname
  useEffect(() => {
    if (typeof window === "undefined") return;
    const host = window.location.hostname.toLowerCase();
    if (host.includes("uspolopatrons")) setActiveSite("usppa");
    else if (host.includes("polopatronium")) setActiveSite("patronium");
    else if (host.includes("cowboypolo")) setActiveSite("cowboy");
    else if (host.includes("thepoloway")) setActiveSite("poloway");
    else if (host.includes("charlestonpolo")) setActiveSite("charleston");
  }, []);

  const navTabs = [
    { id: "usppa", label: "USPPA", href: "https://uspolopatrons.org" },
    { id: "patronium", label: "Polo Patronium", href: "https://polopatronium.com" },
    { id: "cowboy", label: "Cowboy Polo Circuit", href: "https://cowboypolo.com" },
    { id: "poloway", label: "The Polo Way", href: "https://thepoloway.com" },
    { id: "charleston", label: "Charleston Polo", href: "https://charlestonpolo.com" },
  ];

  return (
    <div className="page">
      {/* SHARED TAB HEADER */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 9000,
          padding: "6px 10px 0",
          background: "transparent",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
        }}
      >
        <nav
          aria-label="USPPA family sites"
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 4,
            flexWrap: "wrap",
            maxWidth: 680,
            margin: "0 auto",
          }}
        >
          {navTabs.map((tab) => {
            const isActive = tab.id === activeSite;
            return (
              <a
                key={tab.id}
                href={tab.href}
                style={{
                  textDecoration: "none",
                  fontSize: 10,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  padding: "6px 12px 4px",
                  borderTopLeftRadius: 10,
                  borderTopRightRadius: 10,
                  borderLeft: "1px solid #3a2b16",
                  borderRight: "1px solid #3a2b16",
                  borderTop: "1px solid #3a2b16",
                  borderBottom: isActive ? "1px solid transparent" : "1px solid #3a2b16",
                  color: isActive ? "#f5eedc" : "#c7b08a",
                  background: "transparent",
                  whiteSpace: "nowrap",
                }}
              >
                {tab.label}
              </a>
            );
          })}
        </nav>
      </div>

      {/* Header / hero */}
      <header id="top" className="site-header">
        <div className="header-actions">
          <button className="btn btn-primary" type="button" onClick={openWallet}>
            Patron Wallet
          </button>
        </div>

        <h1 className="masthead-title">
          <span className="masthead-line">United States Polo</span>
          <span className="masthead-line">Patrons Association</span>
        </h1>

        <p className="est">
          FOUNDING<span className="dot">·</span>AD MMXXVI · 2026
        </p>
      </header>

      {/* Main content */}
      <main className="container">
        <hr className="rule" />

        <h2 className="sc">Announcement</h2>
        <p>
          It is with honour that we record the foundation of the United States
          Polo Patrons Association. This fellowship of patrons and players is
          inaugurated with <i>Polo Patronium</i>, a living token of support and
          tradition. Our purpose is simple: to safeguard the heritage of polo,
          encourage its growth, and open a new chapter in the life of the game.
        </p>

        <hr className="rule rule-spaced" />

        {/* Initiative Roadmap */}
        <section className="roadmap" aria-label="Initiative Roadmap">
          <div className="roadmap-head">
            <div className="roadmap-kicker">Initiative</div>
            <div className="roadmap-title">Roadmap</div>
          </div>

          {/* POLO PATRONIUM */}
          <div className="initiative">
            <div className="wm wm-patronium" aria-label="Polo Patronium wordmark">
              <div className="wm-top">Official Token</div>
              <div className="wm-main">POLO&nbsp;PATRONIUM</div>
              <div className="wm-rule" />
              <div className="wm-sub">Symbol “PATRON” · Built on Base</div>
            </div>

            <p className="initiative-text">
              A token and membership initiative uniting patrons, players, and
              clubs in a shared economy of sport.
            </p>

            <div className="cta-row">
              <a
                className="btn btn-outline"
                href="https://polopatronium.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                Polopatronium.com
              </a>
            </div>

            <div className="divider" />
          </div>

          {/* COWBOY POLO CIRCUIT */}
          <div className="initiative">
            <div className="wm wm-cowboy" aria-label="Cowboy Polo Circuit wordmark">
              <div className="wm-main">COWBOY&nbsp;POLO</div>
              <div className="wm-mid">
                <span className="wm-dot">·</span>CIRCUIT<span className="wm-dot">·</span>
              </div>
              <div className="wm-sub">American Development Pipeline</div>
            </div>

            <p className="initiative-text">
              A national endeavour to broaden the sport’s reach, nurture
              emerging talent, and encourage the next generation of American
              players.
            </p>

            <div className="cta-row">
              <a
                className="btn btn-outline"
                href="https://cowboypolo.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                Cowboypolo.com
              </a>
            </div>

            <div className="divider" />
          </div>

          {/* THREE SEVENS REMUDA */}
          <div className="initiative">
            <div className="wm wm-three-sevens" aria-label="Three Sevens Remuda wordmark">
              <div className="wm-top">Remuda</div>
              <div className="three-sevens-mark">
                <div className="three-sevens-numeral">7̶7̶7̶</div>
                <div className="three-sevens-text">THREE SEVENS</div>
              </div>
            </div>

            <p className="initiative-text">
              The managed herd of USPPA horses — consigned or owned by the
              Association, assigned to operating patrons, trainers and local
              players, and developed for play, exhibition and training across
              our programmes.
            </p>

            <div className="divider" />
          </div>

          {/* THE POLO WAY */}
          <div className="initiative">
            <div className="wm wm-simple" aria-label="The Polo Way wordmark">
              <div className="wm-top">Media</div>
              <div className="wm-main">THE&nbsp;POLO&nbsp;WAY</div>
              <div className="wm-sub">Stories · Horses · Players · Chapters</div>
            </div>

            <p className="initiative-text">
              A platform dedicated to presenting the elegance and traditions of
              polo to new audiences in the digital age.
            </p>

            <div className="cta-row">
              <a
                className="btn btn-outline"
                href="https://thepoloway.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                Thepoloway.com
              </a>
            </div>

            <div className="divider" />
          </div>

          {/* CHARLESTON POLO */}
          <div className="initiative">
            <div className="wm wm-simple" aria-label="Charleston Polo wordmark">
              <div className="wm-top">Flagship Chapter</div>
              <div className="wm-main">CHARLESTON&nbsp;POLO</div>
              <div className="wm-sub">USPPA Chapter Test Model</div>
            </div>

            <p className="initiative-text">
              The renewal of Charleston, South Carolina’s polo tradition — our
              flagship Chapter and living test model for the USPPA incubator
              framework.
            </p>

            <div className="cta-row">
              <a
                className="btn btn-outline"
                href="https://charlestonpolo.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                Charlestonpolo.com
              </a>
            </div>
          </div>

          <p className="roadmap-footnote">
            All initiatives are coordinated and supported through Polo
            Patronium — the living token of patronage within the United States
            Polo Patrons Association.
          </p>
        </section>

        <hr className="rule rule-spaced" />

        {/* GATED ZONE */}
        <div className="gate-zone" id="patronium-polo-patronage" ref={gateRef}>
          {!isConnected && (
            <div
              className="gate-overlay"
              onClick={openWallet}
              role="button"
              aria-label="Sign in required"
            >
              <div className="gate-card">
                <div className="gate-kicker">Patron Wallet Required</div>
                <div className="gate-title">Sign in to continue</div>
                <div className="gate-copy">
                  This section and everything below is reserved for signed-in
                  patrons. Tap here or scroll into this section to open the
                  USPPA Patron Wallet.
                </div>
                <div style={{ marginTop: 14 }}>
                  <button className="btn btn-outline" type="button" onClick={openWallet}>
                    Open Patron Wallet
                  </button>
                </div>
              </div>
            </div>
          )}

          <h2 className="sc">Patronium — Polo Patronage Perfected</h2>
          <p>
            Patronium is the living token of patronage within the United States
            Polo Patrons Association. It is the medium through which honourable
            support is recognised and shared — not through speculation, but
            through participation.
          </p>

          <blockquote className="motto">“In honour, in sport, in fellowship.”</blockquote>
        </div>

        <footer className="site-footer">
          <p className="fineprint">© {year} USPoloPatrons.org</p>
        </footer>
      </main>

      {/* Patron Wallet modal */}
      {walletOpen && (
        <div
          className="wallet-backdrop"
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
          <div style={{ width: "100%", maxWidth: 380 }}>
            <div
              ref={walletScrollRef}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: "100%",
                maxHeight: "90vh",
                overflowY: "auto",
                border: "1px solid #3a2b16",
                borderRadius: 14,
                padding: "16px",
                paddingTop: "26px",
                background: "#050505",
                boxShadow: "0 18px 60px rgba(0,0,0,0.85)",
                fontFamily:
                  '"Cinzel", "EB Garamond", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", serif',
                color: "#f5eedc",
                fontSize: 13,
                position: "relative",
              }}
            >
              {/* Header */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 10,
                  position: "relative",
                  paddingTop: 4,
                  textAlign: "center",
                  flexDirection: "column",
                  gap: 2,
                }}
              >
                <div
                  style={{
                    fontSize: 10,
                    letterSpacing: "0.24em",
                    textTransform: "uppercase",
                    color: "#9f8a64",
                  }}
                >
                  U&nbsp;S&nbsp;P&nbsp;P&nbsp;A
                </div>
                <div
                  style={{
                    fontSize: 16,
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    color: "#c7b08a",
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
                    width: 56,
                    height: 56,
                    border: "none",
                    background: "transparent",
                    color: "#e3bf72",
                    fontSize: 38,
                    lineHeight: 1,
                    cursor: "pointer",
                    padding: 0,
                    WebkitTapHighlightColor: "transparent",
                  }}
                >
                  ×
                </button>
              </div>

              <p
                style={{
                  fontSize: 13,
                  textAlign: "center",
                  marginBottom: 14,
                  color: "#f5eedc",
                  fontFamily: '"EB Garamond", serif',
                }}
              >
                Sign in or create your Patron Wallet using email. This is the
                same wallet used on Polo Patronium and Cowboy Polo.
              </p>

              {/* Connect / Account */}
              {!account ? (
                <div style={{ marginBottom: 14 }}>
                  <ConnectEmbed
                    client={client}
                    wallets={wallets}
                    chain={BASE}
                    theme={patronCheckoutTheme}
                  />
                </div>
              ) : (
                <div style={{ marginBottom: 14, textAlign: "center" }}>
                  {/* Address + copy */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      gap: 8,
                      marginBottom: 10,
                      marginTop: 2,
                    }}
                  >
                    <div style={{ fontFamily: "monospace", fontSize: 13 }}>
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
                        fontSize: 14,
                      }}
                      aria-label="Copy Patron Wallet address"
                    >
                      📋
                    </button>
                  </div>

                  {/* Gas + USDC */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      gap: 28,
                      marginBottom: 10,
                      flexWrap: "wrap",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: 10,
                          letterSpacing: "0.14em",
                          textTransform: "uppercase",
                          color: "#9f8a64",
                          marginBottom: 2,
                        }}
                      >
                        Gas
                      </div>
                      <div style={{ color: "#f5eedc", fontSize: 13 }}>
                        {baseBalance?.displayValue || "0"}{" "}
                        {baseBalance?.symbol || "ETH"}
                      </div>
                    </div>

                    <div>
                      <div
                        style={{
                          fontSize: 10,
                          letterSpacing: "0.14em",
                          textTransform: "uppercase",
                          color: "#9f8a64",
                          marginBottom: 2,
                        }}
                      >
                        USDC
                      </div>
                      <div style={{ color: "#f5eedc", fontSize: 13 }}>
                        {usdcBalance?.displayValue || "0"}{" "}
                        {usdcBalance?.symbol || "USDC"}
                      </div>
                    </div>
                  </div>

                  {/* Patron balance */}
                  <div style={{ marginBottom: 12 }}>
                    <div
                      style={{
                        fontSize: 10,
                        letterSpacing: "0.18em",
                        textTransform: "uppercase",
                        color: "#c7b08a",
                        marginBottom: 4,
                      }}
                    >
                      Patronium Balance
                    </div>
                    <div
                      style={{
                        fontSize: 18,
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
                      fontSize: 11,
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
                    aria-label="Connect wallet first"
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: "rgba(0,0,0,0.68)",
                      zIndex: 10,
                      borderRadius: 12,
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
                  <div style={{ marginBottom: 12 }}>
                    <label
                      style={{
                        display: "block",
                        fontSize: 10,
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                        color: "#c7b08a",
                        marginBottom: 6,
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
                        borderRadius: 10,
                        border: "1px solid #3a2b16",
                        background: "#050505",
                        color: "#f5eedc",
                        fontSize: 16,
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
                      amount={normalizedAmount}
                      tokenAddress={
                        "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"
                      } // USDC on Base
                      seller={
                        "0xfee3c75691e8c10ed4246b10635b19bfff06ce16"
                      } // must match SELLER_ADDRESS
                      buttonLabel={"BUY PATRON (USDC on Base)"}
                      theme={patronCheckoutTheme}
                      // critical: send buyer wallet for onramp webhooks
                      purchaseData={
                        account?.address
                          ? { walletAddress: account.address }
                          : undefined
                      }
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
    </div>
  );
}