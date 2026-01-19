// App.jsx — FINAL VERSION (Webhook-Only Fulfillment)
// ------------------------------------------------------------------------------------------------
// All fulfillment is done by thirdweb-webhook.js on Netlify.
//
// Frontend NEVER mints. It NEVER calls a backend token function.
// MetaMask purchases & Coinbase onramps BOTH trigger the webhook,
// and the webhook transfers PATRON from treasury → buyer.
// ------------------------------------------------------------------------------------------------

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
// Thirdweb client + Base chain
// ---------------------------------------------
const client = createThirdwebClient({
  clientId: "f58c0bfc6e6a2c00092cc3c35db1eed8",
});

const BASE = defineChain(8453);

// Email-based wallets included, MetaMask is supported automatically
const wallets = [
  inAppWallet({
    auth: { options: ["email"] },
  }),
];

// ---------------------------------------------
// Patronium Theme
// ---------------------------------------------
const patronCheckoutTheme = darkTheme({
  fontFamily:
    '"Cinzel","EB Garamond",system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",serif',
  colors: {
    modalBg: "#050505",
    modalOverlayBg: "rgba(0,0,0,0.85)",
    borderColor: "#3a2b16",
    separatorLine: "#3a2b16",
    mutedBg: "#050505",
    skeletonBg: "#111",

    primaryText: "#f5eedc",
    secondaryText: "#c7b08a",

    selectedTextColor: "#111",
    selectedTextBg: "#f5eedc",

    primaryButtonBg: "#e3bf72",
    primaryButtonText: "#181210",

    secondaryButtonBg: "#050505",
    secondaryButtonText: "#f5eedc",

    accentButtonBg: "#e3bf72",
    accentButtonText: "#181210",

    danger: "#f97373",
    success: "#4ade80",
  },
});

// ---------------------------------------------
// Error boundary for CheckoutWidget
// ---------------------------------------------
class CheckoutBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(e, i) {
    console.error("CheckoutWidget crashed:", e, i);
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
// Transparent Header Tab Navigation (Cross-Site)
// ---------------------------------------------
function GlobalHeaderNav() {
  const [activeKey, setActiveKey] = useState("");

  useEffect(() => {
    const host = window.location.hostname.toLowerCase();

    if (host.includes("uspolopatrons")) setActiveKey("usppa");
    else if (host.includes("polopatronium")) setActiveKey("patronium");
    else if (host.includes("cowboypolo")) setActiveKey("cowboy");
    else if (host.includes("thepoloway")) setActiveKey("poloway");
    else if (host.includes("charlestonpolo")) setActiveKey("charleston");
  }, []);

  const shell = {
    position: "sticky",
    top: 0,
    zIndex: 1000,
    background: "transparent",
    borderBottom: "1px solid rgba(58,43,22,0.7)",
    marginBottom: 12,
  };

  const nav = {
    display: "flex",
    gap: 10,
    padding: "6px 14px 0",
    alignItems: "flex-end",
    overflowX: "auto",
  };

  const base = {
    fontFamily:
      '"Cinzel","EB Garamond",system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",serif',
    fontSize: 10,
    letterSpacing: "0.18em",
    textTransform: "uppercase",
    textDecoration: "none",
    whiteSpace: "nowrap",
    padding: "6px 10px 5px",
    borderRadius: "10px 10px 0 0",
    borderTop: "1px solid rgba(199,176,138,0.5)",
    borderLeft: "1px solid rgba(199,176,138,0.5)",
    borderRight: "1px solid rgba(199,176,138,0.5)",
    borderBottom: "none",
    background: "transparent",
    color: "#9f8a64",
    marginBottom: -1,
    transition: "all 140ms ease",
  };

  const active = {
    color: "#f5eedc",
    borderTop: "1px solid #e3bf72",
    borderLeft: "1px solid #e3bf72",
    borderRight: "1px solid #e3bf72",
    transform: "translateY(1px)",
  };

  const hover = {
    color: "#f5eedc",
    borderTop: "1px solid rgba(227,191,114,0.9)",
    borderLeft: "1px solid rgba(227,191,114,0.9)",
    borderRight: "1px solid rgba(227,191,114,0.9)",
  };

  const make = (key) => {
    const isActive = activeKey === key;
    const baseStyle = { ...base, ...(isActive ? active : {}) };

    return {
      style: baseStyle,
      onMouseEnter: (e) =>
        !isActive && Object.assign(e.currentTarget.style, baseStyle, hover),
      onMouseLeave: (e) => Object.assign(e.currentTarget.style, baseStyle),
    };
  };

  return (
    <div style={shell}>
      <nav style={nav}>
        <a href="https://uspolopatrons.org" {...make("usppa")}>
          U.S. POLO&nbsp;PATRONS
        </a>
        <a href="https://polopatronium.com" {...make("patronium")}>
          POLO&nbsp;PATRONIUM
        </a>
        <a href="https://cowboypolo.com" {...make("cowboy")}>
          COWBOY&nbsp;POLO&nbsp;CIRCUIT
        </a>
        <a href="https://thepoloway.com" {...make("poloway")}>
          THE&nbsp;POLO&nbsp;WAY
        </a>
        <a href="https://charlestonpolo.com" {...make("charleston")}>
          CHARLESTON&nbsp;POLO
        </a>
      </nav>
    </div>
  );
}

// ---------------------------------------------
// MAIN APP — PAYMENT → WEBHOOK → TOKEN TRANSFER
// ---------------------------------------------
export default function App() {
  const year = new Date().getFullYear();

  const [usdAmount, setUsdAmount] = useState("1");
  const [isWalletOpen, setIsWalletOpen] = useState(false);

  const account = useActiveAccount();
  const activeWallet = useActiveWallet();
  const { disconnect } = useDisconnect();
  const isConnected = !!account;

  const walletScrollRef = useRef(null);

  // Balances
  const { data: baseBalance } = useWalletBalance({
    client,
    address: account?.address,
    chain: BASE,
  });

  const { data: usdcBalance } = useWalletBalance({
    client,
    address: account?.address,
    chain: BASE,
    tokenAddress: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  });

  const { data: patronBalance } = useWalletBalance({
    client,
    address: account?.address,
    chain: BASE,
    tokenAddress: "0xD766a771887fFB6c528434d5710B406313CAe03A",
  });

  // Clean numeric amount
  const normalizedAmount =
    usdAmount && Number(usdAmount) > 0 ? String(Number(usdAmount)) : "1";

  // --------------------------------------------------------------------------
  // SUCCESS HANDLER — No minting. No backend calls.
  // Payment confirmed → webhook handles fulfillment.
  // --------------------------------------------------------------------------
  const handleCheckoutSuccess = () => {
    alert(
      "Thank you — your payment was submitted.\n\n" +
        "Once the USDC transfer is confirmed (on-chain or via Coinbase), " +
        "Polo Patronium will be sent automatically to your wallet."
    );
  };

  // Clipboard
  const shortAddress = account?.address
    ? `${account.address.slice(0, 6)}…${account.address.slice(-4)}`
    : "";

  const copyAddr = async () => {
    if (account?.address) {
      await navigator.clipboard.writeText(account.address);
      alert("Patron Wallet address copied.");
    }
  };

  return (
    <div className="page">
      <GlobalHeaderNav />

      <header style={{ display: "flex", justifyContent: "flex-end" }}>
        <button className="btn btn-outline" onClick={() => setIsWalletOpen(true)}>
          PATRON WALLET
        </button>
      </header>

      {/* Masthead / Branding */}
      <div className="masthead">
        <div className="masthead-inner">
          <div className="masthead-line-1">
            <span>UNITED STATES POLO</span>
            <span>PATRONS ASSOCIATION</span>
          </div>
          <div className="masthead-rule"></div>
          <div className="masthead-line-2">PRESENTS THE</div>
          <div className="masthead-line-2">OFFICIAL POLO PATRONAGE TOKEN</div>
        </div>
      </div>

      {/* Hero */}
      <header>
        <h1 className="hero-title">POLO PATRONIUM</h1>

        <div className="hero-symbol">
          <div>ERC-777 V0 → ERC-20 V1<br />TOKEN SYMBOL “PATRON”</div>
          <div className="hero-network">ON BASE NETWORK BY COINBASE</div>

          <div className="hero-contract">
            <span className="hero-contract-label">CA:</span>
            <span className="hero-contract-value">
              0xD766a771887fFB6c528434d5710B406313CAe03A
            </span>
          </div>
        </div>

        <div className="hero-actions">
          <button className="btn btn-primary" onClick={() => setIsWalletOpen(true)}>
            BUY PATRON
          </button>

          <a
            className="btn btn-outline"
            href="mailto:CharlestonPoloinfo@gmail.com?subject=Founding Patron Inquiry"
          >
            PATRON INQUIRIES
          </a>
        </div>
      </header>

      {/* Wallet Modal */}
      {isWalletOpen && (
        <div
          className="wallet-modal-backdrop"
          onClick={() => setIsWalletOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.86)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
            padding: 14,
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
                padding: 16,
                paddingTop: 26,
                background: "#050505",
                boxShadow: "0 18px 60px rgba(0,0,0,0.85)",
                fontFamily:
                  '"Cinzel","EB Garamond",system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",serif',
                color: "#f5eedc",
                fontSize: 13,
                position: "relative",
              }}
            >
              {/* Header */}
              <div
                style={{
                  textAlign: "center",
                  marginBottom: 12,
                  position: "relative",
                  display: "flex",
                  flexDirection: "column",
                  gap: 3,
                  alignItems: "center",
                }}
              >
                <div style={{ fontSize: 10, letterSpacing: "0.24em", color: "#9f8a64" }}>
                  U&nbsp;S&nbsp;P&nbsp;P&nbsp;A
                </div>
                <div style={{ fontSize: 15, letterSpacing: "0.18em", color: "#c7b08a" }}>
                  Polo Patronium
                </div>
                <div style={{ fontSize: 12, letterSpacing: "0.16em", color: "#f5eedc" }}>
                  Patron Wallet
                </div>

                <button
                  onClick={() => setIsWalletOpen(false)}
                  style={{
                    position: "absolute",
                    right: 0,
                    top: "50%",
                    transform: "translateY(-50%)",
                    fontSize: 38,
                    background: "transparent",
                    color: "#e3bf72",
                    border: "none",
                  }}
                >
                  ×
                </button>
              </div>

              {/* Wallet connect or balances */}
              {!account ? (
                <ConnectEmbed
                  client={client}
                  wallets={wallets}
                  chain={BASE}
                  theme={patronCheckoutTheme}
                />
              ) : (
                <div style={{ textAlign: "center", marginBottom: 14 }}>
                  <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
                    <span style={{ fontFamily: "monospace" }}>{shortAddress}</span>
                    <button onClick={copyAddr} style={{ background: "transparent", border: "none", color: "#e3bf72" }}>
                      📋
                    </button>
                  </div>

                  {/* Balances */}
                  <div style={{ display: "flex", justifyContent: "center", gap: 28, marginTop: 10 }}>
                    <div>
                      <div style={{ fontSize: 10, color: "#9f8a64" }}>Gas</div>
                      <div>{baseBalance?.displayValue || "0"} {baseBalance?.symbol || "ETH"}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 10, color: "#9f8a64" }}>USDC</div>
                      <div>{usdcBalance?.displayValue || "0"} USDC</div>
                    </div>
                  </div>

                  <div style={{ marginTop: 12 }}>
                    <div style={{ fontSize: 10, color: "#c7b08a", marginBottom: 4 }}>Patronium Balance</div>
                    <div style={{ fontSize: 18 }}>
                      {patronBalance?.displayValue || "0"} PATRON
                    </div>
                  </div>

                  <button
                    onClick={() => disconnect(activeWallet)}
                    className="btn btn-outline"
                    style={{ marginTop: 12 }}
                  >
                    Sign Out
                  </button>
                </div>
              )}

              {/* Patron Checkout */}
              <div style={{ marginTop: 20 }}>
                {!isConnected ? (
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: "rgba(0,0,0,0.55)",
                      backdropFilter: "blur(6px)",
                      borderRadius: 12,
                    }}
                    onClick={() => setIsWalletOpen(false)}
                  />
                ) : null}

                <label
                  style={{
                    color: "#c7b08a",
                    fontSize: 10,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
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
                    marginTop: 6,
                    marginBottom: 16,
                    fontSize: 16,
                  }}
                />

                <CheckoutBoundary>
                  <CheckoutWidget
                    client={client}
                    name="POLO PATRONIUM"
                    description="USPPA Patronage Utility Token"
                    currency="USD"
                    chain={BASE}
                    amount={normalizedAmount}
                    tokenAddress={"0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"}
                    seller={"0xfee3c75691e8c10ed4246b10635b19bfff06ce16"}
                    buttonLabel={"BUY PATRON (USDC on Base)"}
                    theme={patronCheckoutTheme}
                    onSuccess={handleCheckoutSuccess}
                    onError={(err) => alert(err?.message || String(err))}
                  />
                </CheckoutBoundary>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer style={{ marginTop: 60, textAlign: "center", color: "#c7b08a" }}>
        <div>© {year} US POLO PATRONS ASSOCIATION — POLO PATRONIUM</div>
        <div>BUILT ON BASE BY COINBASE</div>
      </footer>
    </div>
  );
}