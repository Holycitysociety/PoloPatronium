// App.jsx
import React, { useEffect, useRef, useState } from "react";
import {
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
// Themed wallet to match main page
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
// Main App
// ---------------------------------------------
export default function App() {
  const year = new Date().getFullYear();

  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [activeSite, setActiveSite] = useState("");

  const account = useActiveAccount();
  const activeWallet = useActiveWallet();
  const { disconnect } = useDisconnect();
  const isConnected = !!account;

  const walletScrollRef = useRef(null);
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
      const triggerY = 96;

      if (rect.bottom <= triggerY) {
        setHasTriggeredGate(true);
        setIsWalletOpen(true);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isConnected, hasTriggeredGate]);

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
    {
      id: "patronium",
      label: "Polo Patronium",
      href: "https://polopatronium.com",
    },
    {
      id: "cowboy",
      label: "Cowboy Polo Circuit",
      href: "https://cowboypolo.com",
    },
    { id: "poloway", label: "The Polo Way", href: "https://thepoloway.com" },
    {
      id: "charleston",
      label: "Charleston Polo",
      href: "https://charlestonpolo.com",
    },
  ];

  // Base styles for the layout so the page still looks correct without external CSS
  const pageStyle = {
    minHeight: "100vh",
    background: "#050505",
    color: "#f5eedc",
    fontFamily: '"EB Garamond", serif',
    fontSize: 17,
    lineHeight: 1.7,
    WebkitFontSmoothing: "antialiased",
  };

  const heroTitleStyle = {
    fontFamily: '"Cinzel", serif',
    margin: "0 0 0.6em",
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: "0.24em",
    fontSize: "1.7rem",
  };

  const heroHeaderStyle = {
    padding: "0 22px 2.5rem",
    maxWidth: 760,
    margin: "0 auto",
  };

  const heroSymbolStyle = {
    border: "1px solid #3a2b16",
    borderRadius: 18,
    padding: "14px 16px",
    margin: "0 auto 16px",
    maxWidth: 480,
    textAlign: "center",
    background:
      "radial-gradient(circle at top, rgba(255,255,255,0.08), rgba(5,5,5,0.9))",
    boxShadow: "0 18px 55px rgba(0,0,0,0.85)",
  };

  const heroSymbolMainStyle = {
    fontFamily: '"Cinzel", serif',
    fontSize: 12,
    letterSpacing: "0.18em",
    textTransform: "uppercase",
    marginBottom: 8,
    color: "#e3bf72",
  };

  const heroNetworkStyle = {
    fontSize: 11,
    letterSpacing: "0.2em",
    textTransform: "uppercase",
    color: "#c7b08a",
    marginBottom: 6,
  };

  const heroContractStyle = {
    fontSize: 11,
    fontFamily: "monospace",
    color: "#f5eedc",
    wordBreak: "break-all",
  };

  const heroActionsRowStyle = {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 12,
    marginTop: 12,
  };

  const btnBaseStyle = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "8px 22px",
    borderRadius: 999,
    fontFamily: '"Cinzel", serif',
    fontSize: 12,
    letterSpacing: "0.16em",
    textTransform: "uppercase",
    border: "1px solid #e3bf72",
    cursor: "pointer",
    textDecoration: "none",
    whiteSpace: "nowrap",
  };

  const btnPrimaryStyle = {
    ...btnBaseStyle,
    background: "#e3bf72",
    color: "#181210",
    boxShadow: "0 10px 35px rgba(0,0,0,0.7)",
  };

  const btnOutlineStyle = {
    ...btnBaseStyle,
    background: "transparent",
    color: "#f5eedc",
    boxShadow: "0 8px 26px rgba(0,0,0,0.65)",
  };

  const topHeaderShellStyle = {
    textAlign: "center",
    padding: "4.5rem 1.5rem 3rem",
    background:
      "radial-gradient(circle at top center, rgba(255,255,255,0.26) 0, rgba(255,255,255,0.16) 18%, rgba(255,255,255,0.04) 38%, rgba(0,0,0,0) 68%), #050505",
  };

  const mastheadTitleStyle = {
    margin: 0,
    textTransform: "uppercase",
    letterSpacing: "0.14em",
    fontWeight: 600,
    lineHeight: 1.28,
    fontSize: "min(6vw, 2.3rem)",
  };

  const mastheadLineStyle = {
    display: "block",
    maxWidth: "100%",
    margin: "0 auto",
    whiteSpace: "nowrap",
  };

  const estStyle = {
    fontFamily: '"Cinzel", serif',
    fontSize: "0.9rem",
    letterSpacing: "0.22em",
    textTransform: "uppercase",
    marginTop: "1.2rem",
    color: "#c7b08a",
  };

  const containerStyle = {
    maxWidth: 760,
    padding: "0 22px 4rem",
    margin: "0 auto",
  };

  const ruleStyle = {
    border: "none",
    borderTop: "1px solid #2b2419",
    margin: "2.4rem 0",
  };

  const ruleSpacedStyle = {
    ...ruleStyle,
    margin: "3.1rem 0 2.7rem",
  };

  const scHeadingStyle = {
    fontFamily: '"Cinzel", serif',
    fontVariant: "small-caps",
    letterSpacing: "0.18em",
    textTransform: "lowercase",
    fontSize: "0.95rem",
    margin: "0 0 0.6em",
  };

  const roadmapHeadStyle = {
    marginBottom: "2.1rem",
    textAlign: "center",
  };

  const roadmapKickerStyle = {
    fontFamily: '"Cinzel", serif',
    fontSize: "0.75rem",
    letterSpacing: "0.24em",
    textTransform: "uppercase",
    color: "#b89f78",
    marginBottom: "0.45rem",
  };

  const roadmapTitleStyle = {
    fontFamily: '"Cinzel", serif',
    letterSpacing: "0.22em",
    textTransform: "uppercase",
    fontSize: "1rem",
  };

  const initiativeStyle = {
    marginBottom: "2.9rem",
    textAlign: "center",
  };

  const wmBaseStyle = {
    textTransform: "uppercase",
    letterSpacing: "0.2em",
    marginBottom: "1.2rem",
  };

  const wmTopStyle = {
    fontSize: "0.68rem",
    color: "#b89f78",
    marginBottom: "0.35rem",
  };

  const wmMainStyle = {
    fontFamily: '"Cinzel", serif',
    fontSize: "1.05rem",
    letterSpacing: "0.26em",
  };

  const wmSubStyle = {
    marginTop: "0.35rem",
    fontSize: "0.72rem",
    letterSpacing: "0.18em",
    color: "#a89a80",
  };

  const wmRuleStyle = {
    height: 1,
    width: "70%",
    margin: "0.55rem auto 0.4rem",
    background: "linear-gradient(to right, transparent, #3a2b16, transparent)",
  };

  const initiativeTextStyle = {
    maxWidth: "32rem",
    margin: "0 auto 1.3rem",
    fontSize: "0.96rem",
    color: "#e4dcc3",
  };

  const ctaRowStyle = {
    display: "flex",
    justifyContent: "center",
    marginBottom: "1.6rem",
  };

  const dividerStyle = {
    height: 1,
    width: "64%",
    margin: "0 auto",
    background: "linear-gradient(to right, transparent, #262018, transparent)",
  };

  const roadmapFootnoteStyle = {
    margin: "1.7rem auto 0",
    maxWidth: "32rem",
    fontSize: "0.88rem",
    color: "#b7aa8b",
    textAlign: "center",
  };

  const gateZoneStyle = {
    position: "relative",
    marginTop: "3.4rem",
  };

  const gateOverlayStyle = {
    position: "absolute",
    inset: 0,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: "1.6rem",
    pointerEvents: "auto",
    background:
      "linear-gradient(to bottom, rgba(5,5,5,0.02) 0%, rgba(5,5,5,0.13) 40%, rgba(5,5,5,0.28) 100%)",
    backdropFilter: "blur(3px)",
    WebkitBackdropFilter: "blur(3px)",
  };

  const gateCardStyle = {
    maxWidth: 540,
    width: "90%",
    borderRadius: 22,
    border: "1px solid #3a2b16",
    padding: "1.7rem 1.4rem 1.5rem",
    background:
      "radial-gradient(circle at top center, rgba(255,255,255,0.06) 0, transparent 55%), rgba(5,5,5,0.94)",
    boxShadow: "0 18px 60px rgba(0,0,0,0.9)",
    textAlign: "center",
  };

  const gateKickerStyle = {
    fontFamily: '"Cinzel", serif',
    fontSize: "0.7rem",
    letterSpacing: "0.22em",
    textTransform: "uppercase",
    color: "#b89f78",
    marginBottom: "0.45rem",
  };

  const gateTitleStyle = {
    fontFamily: '"Cinzel", serif',
    fontSize: "1.2rem",
    letterSpacing: "0.22em",
    textTransform: "uppercase",
    marginBottom: "0.8rem",
  };

  const gateCopyStyle = {
    fontSize: "0.95rem",
    marginBottom: "0.9rem",
    color: "#e5ddc4",
  };

  const mottoStyle = {
    textAlign: "center",
    fontStyle: "italic",
    margin: "3rem auto 2rem",
    fontSize: "1.1rem",
    maxWidth: "34rem",
    color: "#e4dcc3",
  };

  const footerStyle = {
    textAlign: "center",
    fontSize: "0.78rem",
    color: "#7c705a",
    padding: "2.5rem 1.5rem 2.1rem",
    borderTop: "1px solid #221a12",
    marginTop: "3rem",
  };

  // Global tab strip styles (inline version)
  const tabStripContainerStyle = {
    position: "sticky",
    top: 0,
    zIndex: 9000,
    padding: "6px 10px 0",
    background: "transparent",
    backdropFilter: "blur(8px)",
    WebkitBackdropFilter: "blur(8px)",
  };

  const tabStripStyle = {
    display: "flex",
    gap: 4,
    maxWidth: 680,
    margin: "0 auto",
    padding: "0 10px 4px",
    overflowX: "auto",
    whiteSpace: "nowrap",
    WebkitOverflowScrolling: "touch",
    scrollbarWidth: "none", // Firefox
    msOverflowStyle: "none", // IE/Edge
  };

  const baseTabStyle = {
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
    background: "transparent",
    whiteSpace: "nowrap",
    flexShrink: 0,
  };

  const footerLineStyle = {
    fontSize: "0.78rem",
    marginBottom: 4,
  };

  const copySectionTitleStyle = {
    fontFamily: '"Cinzel", serif',
    fontSize: "0.9rem",
    letterSpacing: "0.28em",
    textTransform: "uppercase",
    marginTop: "3rem",
    textAlign: "center",
  };

  const copyBlockStyle = {
    marginTop: "1.8rem",
    fontSize: "0.96rem",
  };

  const copyBlockHeadingStyle = {
    fontFamily: '"Cinzel", serif',
    fontSize: "1.05rem",
    margin: "0 0 0.6rem",
  };

  const copyBlockListStyle = {
    marginTop: "0.4rem",
    paddingLeft: "1.2rem",
  };

  return (
    <div style={pageStyle}>
      {/* SHARED TAB HEADER (global nav) */}
      <div style={tabStripContainerStyle}>
        <div
          style={tabStripStyle}
          aria-label="USPPA family sites"
        >
          {navTabs.map((tab) => {
            const isActive = tab.id === activeSite;
            const activeStyle = isActive
              ? {
                  color: "#f5eedc",
                  borderBottom: "1px solid transparent",
                }
              : {
                  color: "#c7b08a",
                  borderBottom: "1px solid #3a2b16",
                };
            return (
              <a
                key={tab.id}
                href={tab.href}
                style={{
                  ...baseTabStyle,
                  ...activeStyle,
                }}
              >
                {tab.label}
              </a>
            );
          })}
        </div>
      </div>

      {/* Top header + PATRON WALLET button */}
      <header style={topHeaderShellStyle}>
        <div
          style={{
            marginBottom: "2.1rem",
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <button
            style={{ ...btnOutlineStyle, minWidth: "auto", padding: "6px 16px" }}
            onClick={openWallet}
          >
            PATRON WALLET
          </button>
        </div>

        <h1 style={mastheadTitleStyle}>
          <span style={mastheadLineStyle}>United States Polo</span>
          <span style={mastheadLineStyle}>Patrons Association</span>
        </h1>

        <p style={estStyle}>
          FOUNDING<span style={{ padding: "0 0.4em" }}>·</span>AD MMXXVI · 2026
        </p>
      </header>

      {/* Hero */}
      <header style={heroHeaderStyle}>
        <h1 style={heroTitleStyle}>POLO PATRONIUM</h1>

        <div style={heroSymbolStyle}>
          <div style={heroSymbolMainStyle}>
            ERC-777 V0 → ERC-20 V1
            <br />
            TOKEN SYMBOL &quot;PATRON&quot;
          </div>

          <div style={heroNetworkStyle}>ON BASE NETWORK BY COINBASE</div>
          <div style={heroContractStyle}>
            <span style={{ opacity: 0.7, marginRight: 4 }}>CA:</span>
            <span>
              0xD766a771887fFB6c528434d5710B406313CAe03A
            </span>
          </div>
        </div>

        <div style={heroActionsRowStyle}>
          {/* BUY PATRON → direct link to CowboyPolo.com */}
          <a
            href="https://cowboypolo.com"
            target="_blank"
            rel="noopener noreferrer"
            style={btnPrimaryStyle}
          >
            BUY PATRON
          </a>

          {/* Patron inquiries via mailto */}
          <a
            style={btnOutlineStyle}
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

      {/* Brand / roadmap + copy sections */}
      <main>
        {/* Roadmap (scroll trigger) */}
        <section
          id="brands"
          ref={roadmapGateRef}
          style={containerStyle}
        >
          <div style={roadmapHeadStyle}>
            <div style={roadmapKickerStyle}>INITIATIVE</div>
            <div style={roadmapTitleStyle}>ROADMAP</div>
            <div
              style={{
                marginTop: 10,
                height: 1,
                width: 80,
                marginLeft: "auto",
                marginRight: "auto",
                background: "#3a2b16",
                opacity: 0.9,
              }}
            />
          </div>

          {/* COWBOY POLO CIRCUIT */}
          <div style={initiativeStyle}>
            <div style={wmBaseStyle}>
              <div style={wmTopStyle}>American Development Pipeline</div>
              <div style={{ ...wmMainStyle, fontSize: "1.09rem" }}>
                COWBOY&nbsp;POLO&nbsp;CIRCUIT
              </div>
            </div>
            <p style={initiativeTextStyle}>
              An American endeavour to broaden Polo&apos;s reach, nurture
              emerging talent, and encourage the next generation of American
              players — where riders not only learn to play, but learn to make
              the horses of the 7̶7̶7̶ (String Three Sevens) Remuda.
            </p>
          </div>

          {/* THREE SEVENS REMUDA */}
          <div style={initiativeStyle}>
            <div style={wmBaseStyle}>
              <div style={{ ...wmTopStyle, marginBottom: "0.5rem" }}>Remuda</div>
              <div
                style={{
                  display: "inline-flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                <div
                  style={{
                    fontFamily: '"Cinzel", serif',
                    fontSize: "1.15rem",
                    letterSpacing: "0.3em",
                    textTransform: "uppercase",
                  }}
                >
                  7̶7̶7̶
                </div>
                <div
                  style={{
                    fontFamily: '"Cinzel", serif',
                    fontSize: "0.7rem",
                    letterSpacing: "0.26em",
                    textTransform: "uppercase",
                    color: "#b89f78",
                  }}
                >
                  THREE SEVENS
                </div>
              </div>
            </div>
            <p style={initiativeTextStyle}>
              Our managed herd of USPPA horses — consigned or owned by the
              Association, assigned to operating patrons, trainers and local
              players, and developed for play, exhibition and training across
              our programmes.
            </p>
          </div>

          {/* THE POLO WAY */}
          <div style={initiativeStyle}>
            <div style={wmBaseStyle}>
              <div style={wmTopStyle}>Media</div>
              <div
                style={{
                  ...wmMainStyle,
                  fontSize: "1rem",
                  display: "inline-flex",
                  gap: 6,
                  alignItems: "baseline",
                }}
              >
                <span style={{ color: "#c7b08a" }}>THE</span>
                <span>POLO WAY</span>
              </div>
              <div style={wmSubStyle}>
                Stories · Horses · Players · Chapters
              </div>
            </div>
            <p style={initiativeTextStyle}>
              A platform dedicated to presenting the elegance and traditions of
              polo to new audiences in the digital age — following our horses,
              patrons, and players across the Cowboy Polo Circuit.
            </p>
          </div>

          {/* CHARLESTON POLO */}
          <div style={initiativeStyle}>
            <div style={wmBaseStyle}>
              <div style={wmTopStyle}>Flagship Chapter</div>
              <div
                style={{
                  ...wmMainStyle,
                  fontSize: "1rem",
                  borderTop: "1px solid #c7b08a",
                  borderBottom: "1px solid #c7b08a",
                  padding: "4px 10px",
                  display: "inline-block",
                }}
              >
                CHARLESTON&nbsp;P&nbsp;O&nbsp;L&nbsp;O
              </div>
              <div style={wmSubStyle}>USPPA Chapter Test Model</div>
            </div>
            <p style={initiativeTextStyle}>
              The renewal of Charleston, South Carolina&apos;s polo tradition —
              our flagship USPPA Chapter and living test model for the Polo
              Incubator system. Horses are gathered, pasture secured,
              instruction established, and the public welcomed to learn and
              play. Once an Incubator achieves steady operations, sound
              horsemanship, and visible community benefit, it is received as a
              standing Chapter of the Association.
              <br />
              <br />
              Each USPPA Chapter is a fully integrated programme operating
              under the Association&apos;s standards. Charleston Polo, as the
              flagship Chapter, serves as the organisational hub for the Cowboy
              Polo Circuit — coordinating local Cowboy Polo clinics, sanctioned
              chukkers at member barns and arenas, and the first pool of Chapter
              horses.
              <br />
              <br />
              In its early life, a Chapter begins as a Polo Incubator: a local
              startup where the “bring your own horse” model allows riders and
              stables to join the Circuit quickly, while a shared remuda is
              trained for exhibitions, league play, and new riders. Once an
              Incubator demonstrates steady operations, sound horsemanship, and
              visible benefit to the community, it is recognised as a standing
              Chapter of the USPPA.
            </p>
          </div>

          <p style={roadmapFootnoteStyle}>
            All of these initiatives are coordinated and supported through Polo
            Patronium, the living token of patronage within the United States
            Polo Patrons Association, uniting patrons, players, and clubs in a
            shared Polo ecosystem.
          </p>

          <hr style={ruleSpacedStyle} />

          {/* GATED ZONE */}
          <div
            id="patronium-polo-patronage"
            ref={roadmapGateRef}
            style={gateZoneStyle}
          >
            {!isConnected && (
              <div
                style={gateOverlayStyle}
                onClick={openWallet}
                role="button"
                aria-label="Sign in required"
              >
                <div style={gateCardStyle}>
                  <div style={gateKickerStyle}>Patron Wallet Required</div>
                  <div style={gateTitleStyle}>Sign in to continue</div>
                  <div style={gateCopyStyle}>
                    This section and everything below is reserved for signed-in
                    patrons. Tap here or scroll into this section to open the
                    USPPA Patron Wallet.
                  </div>
                  <div style={{ marginTop: 14 }}>
                    <button
                      type="button"
                      onClick={openWallet}
                      style={btnOutlineStyle}
                    >
                      Open Patron Wallet
                    </button>
                  </div>
                </div>
              </div>
            )}

            <h2 style={scHeadingStyle}>Patronium — Polo Patronage Perfected</h2>
            <p>
              Patronium is the living token of patronage within the United
              States Polo Patrons Association. It is the medium through which
              honourable support is recognised and shared — not through
              speculation, but through participation.
            </p>

            <blockquote style={mottoStyle}>
              “In honour, in sport, in fellowship.”
            </blockquote>
          </div>
        </section>

        {/* Patronium Framework (tokenomics) – blurred overlay until connected */}
        <section
          id="patronium-framework"
          style={containerStyle}
        >
          <div style={copySectionTitleStyle}>THE PATRONIUM FRAMEWORK</div>

          <div style={{ position: "relative", marginTop: 8 }}>
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
                  padding: 22,
                  textAlign: "center",
                }}
                aria-label="Sign in required to view Patronium Framework"
                role="button"
              >
                <div>
                  <div
                    style={{
                      fontSize: 11,
                      letterSpacing: "0.22em",
                      textTransform: "uppercase",
                      color: "#c7b08a",
                      marginBottom: 8,
                    }}
                  >
                    PATRONIUM FRAMEWORK
                  </div>
                  <div
                    style={{
                      fontSize: 13,
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

            <div aria-hidden={!isConnected && true}>
              <div style={copyBlockStyle}>
                <h3 style={copyBlockHeadingStyle}>
                  Patronium — Polo Patronage Perfected
                </h3>
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
                  record of contribution and belonging within a high-trust,
                  mission-driven community. When a Chapter prospers, it offers
                  tribute to those whose support made that prosperity possible.
                  This is the essence of Patronium — recognition earned through
                  genuine patronage and service to the field.
                </p>
              </div>

              <div style={copyBlockStyle}>
                <h3 style={copyBlockHeadingStyle}>
                  Charleston Polo — The USPPA Chapter Test Model
                </h3>
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

              <div style={copyBlockStyle}>
                <h3 style={copyBlockHeadingStyle}>
                  Founding, Operating, and USPPA Patrons
                </h3>
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

              <div style={copyBlockStyle}>
                <h3 style={copyBlockHeadingStyle}>The Tribute Framework</h3>
                <p>
                  Each Chapter follows a principle of balanced and transparent
                  patronage. From its net revenue (gross revenue less
                  operational costs), a Chapter aims to follow this allocation:
                </p>
                <ul style={copyBlockListStyle}>
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

              <div style={copyBlockStyle}>
                <h3 style={copyBlockHeadingStyle}>Participation</h3>
                <ul style={copyBlockListStyle}>
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

              <div style={copyBlockStyle}>
                <h3 style={copyBlockHeadingStyle}>In Plain Terms</h3>
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

              <div style={copyBlockStyle}>
                <h3 style={copyBlockHeadingStyle}>
                  An Invitation to Patrons and Partners
                </h3>
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

      {/* Footer */}
      <footer style={footerStyle}>
        <div style={footerLineStyle}>
          © {year} US POLO PATRONS ASSOCIATION — POLO PATRONIUM
        </div>
        <div>BUILT ON BASE BY COINBASE</div>
      </footer>

      {/* Patron Wallet modal */}
      {isWalletOpen && (
        <div
          onClick={closeWallet}
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
                  '"Cinzel", "EB Garamond", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", serif',
                color: "#f5eedc",
                fontSize: 13,
                position: "relative",
              }}
            >
              {/* Wallet header */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 12,
                  position: "relative",
                  paddingTop: 4,
                  textAlign: "center",
                  flexDirection: "column",
                  gap: 3,
                }}
              >
                <div
                  style={{
                    fontSize: 10,
                    letterSpacing: "0.24em",
                    textTransform: "uppercase",
                    color: "#9f8a64",
                    lineHeight: 1.1,
                  }}
                >
                  U&nbsp;S&nbsp;P&nbsp;P&nbsp;A
                </div>
                <div
                  style={{
                    fontSize: 15,
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    color: "#c7b08a",
                    lineHeight: 1.1,
                  }}
                >
                  Polo Patronium
                </div>
                <div
                  style={{
                    fontSize: 12,
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

              {!account ? (
                <>
                  <p
                    style={{
                      fontSize: 13,
                      textAlign: "center",
                      marginBottom: 14,
                      color: "#f5eedc",
                      fontFamily: '"EB Garamond", serif',
                    }}
                  >
                    Sign in or create your Patron Wallet using email. This is
                    the same wallet used on Polo Patronium and Cowboy Polo.
                  </p>
                  <div style={{ marginBottom: 14 }}>
                    <ConnectEmbed
                      client={client}
                      wallets={wallets}
                      chain={BASE}
                      theme={patronCheckoutTheme}
                    />
                  </div>
                </>
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

                  {/* Buy PATRON + Sign Out actions */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 8,
                      marginBottom: 10,
                    }}
                  >
                    <a
                      href="https://cowboypolo.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        ...btnPrimaryStyle,
                        width: "100%",
                        justifyContent: "center",
                      }}
                    >
                      Buy PATRON at CowboyPolo.com
                    </a>

                    <button
                      style={{
                        ...btnOutlineStyle,
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
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}