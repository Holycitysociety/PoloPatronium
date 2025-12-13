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
    // General surfaces - black dark mode
    modalBg: "#050505",
    modalOverlayBg: "rgba(0,0,0,0.85)",
    borderColor: "#3a2b16",
    separatorLine: "#3a2b16",
    mutedBg: "#050505",
    skeletonBg: "#111111",

    // Text
    primaryText: "#f5eedc",
    secondaryText: "#c7b08a",
    selectedTextColor: "#111111",
    selectedTextBg: "#f5eedc",

    // Buttons – gold accents
    primaryButtonBg: "#e3bf72",
    primaryButtonText: "#181210",
    secondaryButtonBg: "#050505",
    secondaryButtonText: "#f5eedc",
    secondaryButtonHoverBg: "#111111",
    accentButtonBg: "#e3bf72",
    accentButtonText: "#181210",
    connectedButtonBg: "#050505",
    connectedButtonHoverBg: "#111111",

    // Icons / misc
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
  const [usdAmount, setUsdAmount] = useState("1"); // controls Checkout amount in USD

  const account = useActiveAccount();
  const activeWallet = useActiveWallet();
  const { disconnect } = useDisconnect();

  const isConnected = !!account;

  // Gate behavior:
  // - before sign-in: allow scrolling initiatives
  // - DO NOT allow "Patronium Framework" to appear in viewport at all
  const gateArmed = !isConnected;

  const modalRef = useRef(null);

  // Native ETH on Base (gas)
  const { data: baseBalance } = useWalletBalance({
    address: account?.address,
    chain: BASE,
    client,
  });

  // USDC on Base (fiat on-ramp target)
  const { data: usdcBalance } = useWalletBalance({
    address: account?.address,
    chain: BASE,
    client,
    tokenAddress: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  });

  // PATRON ERC-20 (real contract)
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
      if (!account?.address) {
        console.warn("Checkout success but no active wallet");
        return;
      }

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

      const data = await resp.json();
      console.log("Mint-patron response:", data);

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

  // ---------------------------------------------
  // Modal open = lock background scroll (good UX on mobile)
  // ---------------------------------------------
  useEffect(() => {
    if (isWalletOpen) {
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
      return () => {
        document.documentElement.style.overflow = "";
        document.body.style.overflow = "";
      };
    }
    document.documentElement.style.overflow = "";
    document.body.style.overflow = "";
  }, [isWalletOpen]);

  // ---------------------------------------------
  // GATE: allow initiatives; prevent Patronium Framework from entering viewport.
  // We clamp based on bottom-of-viewport so you can scroll right up to the line above it,
  // but never reveal the section until connected.
  // ---------------------------------------------
  useEffect(() => {
    if (!gateArmed) return;

    const clampBeforeTokenomics = () => {
      const tokenomicsEl = document.getElementById("patronium-framework");
      if (!tokenomicsEl) return;

      const rect = tokenomicsEl.getBoundingClientRect();
      const tokenTopAbs = window.scrollY + rect.top;

      // padding keeps a tiny "breathing gap" so the framework doesn't peek in
      const padding = 8;

      // IMPORTANT:
      // Framework becomes visible when (scrollY + viewportHeight) > tokenTopAbs.
      // So max scroll is tokenTopAbs - viewportHeight - padding.
      const maxScroll = Math.max(0, tokenTopAbs - window.innerHeight - padding);

      if (window.scrollY > maxScroll) {
        window.scrollTo({ top: maxScroll, behavior: "auto" });
        if (!isWalletOpen) setIsWalletOpen(true);
      }
    };

    const onScroll = () => clampBeforeTokenomics();
    const onResize = () => clampBeforeTokenomics();

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);

    // If they land deep-linked, clamp immediately
    clampBeforeTokenomics();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, [gateArmed, isWalletOpen]);

  // Prevent anchor jumps into tokenomics when gated
  const blockTokenomicsJump = (e) => {
    if (!gateArmed) return;
    e.preventDefault();
    openWallet();
  };

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

          <a
            className="btn btn-outline"
            href="#founding-patrons"
            onClick={(e) => {
              if (gateArmed) {
                e.preventDefault();
                openWallet();
              }
            }}
          >
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
            background: "rgba(0, 0, 0, 0.82)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
            padding: "16px",
          }}
        >
          <div
            ref={modalRef}
            className="wallet-modal"
            style={{
              background: "#050505",
              borderRadius: "12px",
              padding: "18px",
              maxWidth: "380px",
              width: "100%",
              boxShadow: "0 18px 60px rgba(0,0,0,0.9)",
              border: "1px solid #3a2b16",
              maxHeight: "calc(100vh - 32px)",
              overflowY: "auto",
              fontFamily:
                '"Cinzel", "EB Garamond", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", serif',
              color: "#f5eedc",
              fontSize: "13px",
            }}
          >
            {/* Modal header */}
            <div
              style={{
                position: "relative",
                marginBottom: "14px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: "12px",
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                }}
              >
                PATRON WALLET
              </div>
              <button
                onClick={closeWallet}
                style={{
                  position: "absolute",
                  right: 0,
                  top: "50%",
                  transform: "translateY(-50%)",
                  border: "none",
                  background: "transparent",
                  color: "#e3bf72",
                  fontSize: "20px",
                  cursor: "pointer",
                  lineHeight: 1,
                  padding: 0,
                }}
                aria-label="Close wallet"
              >
                ×
              </button>
            </div>

            {/* Connect section */}
            {!account ? (
              <div
                style={{
                  border: "1px solid #3a2b16",
                  borderRadius: "12px",
                  padding: "14px",
                  boxShadow: "0 0 0 1px rgba(227,191,114,0.10)",
                  marginBottom: "14px",
                }}
              >
                <ConnectEmbed
                  client={client}
                  wallets={wallets}
                  chain={BASE}
                  theme={patronCheckoutTheme}
                />
              </div>
            ) : (
              <div
                style={{
                  borderRadius: "10px",
                  border: "1px solid #3a2b16",
                  padding: "12px 14px 14px",
                  marginBottom: "14px",
                  textAlign: "center",
                  background: "#050505",
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
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: "8px",
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

                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: "24px",
                    marginBottom: "8px",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: "10px",
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                        color: "#9f8a64",
                        marginBottom: "2px",
                      }}
                    >
                      Gas (Base)
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
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                        color: "#9f8a64",
                        marginBottom: "2px",
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

                <div
                  style={{
                    fontSize: "10px",
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "#9f8a64",
                    marginBottom: "2px",
                  }}
                >
                  PATRON
                </div>
                <div style={{ fontSize: "13px", marginBottom: "8px" }}>
                  {patronBalance?.displayValue || "0"}{" "}
                  {patronBalance?.symbol || "PATRON"}
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

            {/* LOCKED SECTION (no blur) */}
            <div style={{ position: "relative" }}>
              {!isConnected && (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "rgba(0,0,0,0.55)",
                    borderRadius: "10px",
                    zIndex: 20,
                    pointerEvents: "auto",
                  }}
                />
              )}

              <div
                style={{
                  border: "1px solid #3a2b16",
                  borderRadius: "10px",
                  padding: "12px",
                  opacity: !isConnected ? 0.75 : 1,
                  filter: !isConnected
                    ? "saturate(0.85) brightness(0.9)"
                    : "none",
                  transition: "opacity 160ms ease, filter 160ms ease",
                  pointerEvents: isConnected ? "auto" : "none",
                }}
              >
                <div style={{ marginBottom: "10px" }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: "10px",
                      letterSpacing: "0.12em",
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
                      padding: "9px 10px",
                      borderRadius: "8px",
                      border: "1px solid #3a2b16",
                      background: "#050505",
                      color: "#f5eedc",
                      fontSize: "14px",
                      outline: "none",
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

        {/* Tokenomics / framework section (gated) */}
        <section className="copy-section" id="patronium-framework" onClick={blockTokenomicsJump}>
          <div className="copy-section-title">THE PATRONIUM FRAMEWORK</div>
          {/* ...keep your existing framework content here... */}
        </section>
      </main>

      <footer>
        <div>© {year} US POLO PATRONS ASSOCIATION — POLO PATRONIUM</div>
        <div>BUILT ON BASE BY COINBASE</div>
      </footer>
    </div>
  );
}