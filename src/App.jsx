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
      options: ["email", "coinbase", "passkey"],
    },
  }),
];

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
  const [showUsdcHelp, setShowUsdcHelp] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);

  const account = useActiveAccount();
  const activeWallet = useActiveWallet();
  const { disconnect } = useDisconnect();

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

  const openWallet = () => {
    setIsWalletOpen(true);
    setShowCheckout(false);
  };

  const closeWallet = () => {
    setIsWalletOpen(false);
    setShowCheckout(false);
  };

  const handleBuyPatron = () => {
    // Main hero BUY button just opens the Patron Wallet modal
    openWallet();
  };

  // Disconnect the embedded wallet but keep the modal open
  const handleSignOut = () => {
    if (!activeWallet || !disconnect) return;
    try {
      disconnect(activeWallet);
      setShowCheckout(false);
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

  // Make sure Checkout always gets a sane positive string
  const normalizedAmount =
    usdAmount && Number(usdAmount) > 0 ? String(usdAmount) : "1";

  // Fired after successful Checkout payment
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
              maxWidth: "380px",
              width: "100%",
              boxShadow: "0 18px 60px rgba(0,0,0,0.7)",
              border: "1px solid #3a2b16",
              maxHeight: "90vh",
              overflowY: "auto",
              margin: "16px",
            }}
          >
            {/* Modal header with centered wordmark and close button */}
            <div
              style={{
                position: "relative",
                marginBottom: "16px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: "13px",
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

            {/* Wallet status / connect section */}
            {!account ? (
              <div style={{ marginBottom: "16px" }}>
                {/* Removed "Sign into Patron Wallet" label here per request */}
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
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: "10px",
                  }}
                >
                  <div
                    style={{
                      fontFamily: "monospace",
                      fontSize: "13px",
                    }}
                  >
                    {shortAddress}
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyAddress}
                    style={{
                      border: "none",
                      background: "transparent",
                      color: "#c7b08a",
                      cursor: "pointer",
                      fontSize: "14px",
                    }}
                    aria-label="Copy Patron Wallet address"
                  >
                    📋
                  </button>
                </div>

                {/* Gas + USDC balances side-by-side */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: "24px",
                    marginBottom: "10px",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: "10px",
                        letterSpacing: "0.16em",
                        textTransform: "uppercase",
                        color: "#9f8a64",
                        marginBottom: "2px",
                      }}
                    >
                      Gas Balance (Base)
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
                        letterSpacing: "0.16em",
                        textTransform: "uppercase",
                        color: "#9f8a64",
                        marginBottom: "2px",
                      }}
                    >
                      USDC Balance
                    </div>
                    <div style={{ fontSize: "13px" }}>
                      {usdcBalance?.displayValue || "0"}{" "}
                      {usdcBalance?.symbol || "USDC"}
                    </div>
                  </div>
                </div>

                {/* PATRON balance centered below */}
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
                  marginBottom: "4px",
                }}
              />

              {/* Mini help link for USDC users */}
              <button
                type="button"
                onClick={() => setShowUsdcHelp((v) => !v)}
                style={{
                  border: "none",
                  background: "transparent",
                  color: "#c7b08a",
                  fontSize: "11px",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  marginTop: "4px",
                  cursor: "pointer",
                }}
              >
                <span>ℹ️</span>
                <span>Have USDC on Base network?</span>
              </button>
              {showUsdcHelp && (
                <div
                  style={{
                    marginTop: "6px",
                    fontSize: "11px",
                    lineHeight: 1.4,
                    color: "#b29a74",
                  }}
                >
                  You can also send USDC on Base to this Patron Wallet address
                  first, then use the button below to complete your patronage
                  in USDC.
                </div>
              )}
            </div>

            {/* Button to reveal Checkout */}
            <div style={{ marginTop: "8px", marginBottom: "8px" }}>
              <button
                className="btn btn-primary"
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  fontSize: "12px",
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                }}
                onClick={() => {
                  if (!account) {
                    alert(
                      "Please connect your Patron Wallet above before continuing."
                    );
                    return;
                  }
                  setShowCheckout(true);
                }}
              >
                BUY PATRON
              </button>
            </div>

            {/* Checkout into the currently active wallet (hidden until button click) */}
            {showCheckout && (
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
                  onSuccess={handleCheckoutSuccess}
                  onError={(err) => {
                    console.error("Checkout error:", err);
                    alert(err?.message || String(err));
                  }}
                />
              </CheckoutBoundary>
            )}
          </div>
        </div>
      )}

      {/* Brand / roadmap + copy sections – unchanged */}
      <main>
        <section className="brand-row" id="brands">
          <h2 className="roadmap-title">INITIATIVE ROADMAP</h2>

          <div className="brand-grid">
            {/* UPDATED 777 WORDMARK BLOCK */}
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

        {/* Patronium framework copy section */}
        <section className="copy-section" id="patronium-framework">
          <div className="copy-section-title">THE PATRONIUM FRAMEWORK</div>

          <div className="copy-block">
            <h3>Patronium — Polo Patronage Perfected</h3>
            <p>
              Patronium is the living token of patronage within the United
              States Polo Patrons Association. It is the medium through which
              honourable support is recognised and shared — not through
              speculation, but through participation. Every token of Patronium
              represents a place within the fellowship of those who uphold the
              game, its horses, and its players.
            </p>
            <p>
              It serves as the bridge between patron and player: a clear record
              of contribution and belonging within a high-trust mission driven
              community. When a Chapter prospers, it offers tribute to those
              whose support made that prosperity possible. This is the essence
              of Patronium — recognition earned through genuine patronage and
              service to the field.
            </p>
          </div>

          <div className="copy-block">
            <h3>Charleston Polo — The USPPA Chapter Test Model</h3>
            <p>
              Each USPPA Chapter is a fully integrated polo programme operating
              under the Association&apos;s standards. A Chapter begins as a
              Polo Incubator — a local startup where horses are gathered,
              pasture secured, instruction established, and the public welcomed
              to learn and play.
            </p>
            <p>
              Once an Incubator achieves steady operations, sound horsemanship,
              and visible community benefit, it becomes a standing Chapter of
              the Association.
            </p>
          </div>

          <div className="copy-block">
            <h3>Founding, Operating, and USPPA Patrons</h3>
            <p>There are three forms of Patronium holder.</p>
            <p>
              Founding Patrons are the first to support the birth of a new
              Chapter. They provide the initial horses, pasture, and capital
              that make it possible for a Polo Incubator to begin. During this
              founding period, their Patronium receives the full measure of
              available tribute — a reflection of their patronage in helping to
              seed the future of Polo.
            </p>
            <p>
              Operating Patrons are the active stewards responsible for the
              management of each Chapter. They receive a base salary during the
              incubator period and an operating share of tribute once the
              incubator transitions to a full Chapter.
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
              patronage. From its net revenue (gross revenue less operational
              costs), a Chapter aims to follow this allocation:
            </p>
            <ul>
              <li>
                51%+ retained for reinvestment — horses, pasture, equipment, and
                operations.
              </li>
              <li>
                49% max. available to the Patronium Tribute Pool, from which
                holders are recognised for their continued patronage.
              </li>
            </ul>
            <p>
              During the Polo Incubator period, the Founding Patrons are
              whitelisted for direct proportional tribute from the Polo
              Incubators they support (49% of tribute). After the first year, or
              when the Incubator can support itself, it transitions to a full
              Chapter and the tribute returns to the standard USPPA Patron
              tribute.
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
                Become an Operating Patron — oversee the daily life of a Chapter
                and its players.
              </li>
              <li>
                Become a USPPA Patron — support the national network and share
                in ongoing tribute cycles.
              </li>
              <li>
                Provide Horses or Land — supply the physical foundation of Polo
                under insured, transparent, and fair agreements.
              </li>
            </ul>
          </div>

          <div className="copy-block">
            <h3>In Plain Terms</h3>
            <p>
              The Association seeks not to monetise polo, but to stabilise and
              decentralise it — to bring clarity, fairness, and longevity to the
              way it is taught, funded, and shared. Patronium and the Polo
              Incubator model together create a living, self-sustaining
              framework for the game&apos;s renewal across America.
            </p>
            <p>
              This is how the USPPA will grow the next American 10-Goal player.
            </p>
          </div>

          <div className="copy-block">
            <h3>An Invitation to Patrons and Partners</h3>
            <p>
              The Association welcomes discerning patrons, landholders, and
              professionals who wish to take part in the restoration of polo as
              a sustainable, American-bred enterprise. Each Chapter is a living
              investment in horses, land, and people — structured not for
              speculation, but for legacy.
            </p>
            <p>
              Patronium ensures every act of patronage — whether a horse
              consigned, a pasture opened, or a field sponsored — is recognised
              and recorded within a transparent, honourable system that rewards
              those who build American Polo. Your contribution does not vanish
              into expense; it lives on in horses trained, players formed, and
              fields maintained.
            </p>
            <p>
              Those who have carried the game through their own time know: it
              survives only by the strength of its patrons. The USPPA now offers
              a new way to hold that legacy — a means to see your support endure
              in the form of living tribute.
            </p>
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