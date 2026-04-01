// App.jsx
import React, { useEffect, useRef, useState } from "react";

// ---------------------------------------------
// Main App
// ---------------------------------------------
export default function App() {
  const year = new Date().getFullYear();

  // Roadmap section ref kept in place in case you want future scroll logic again
  const roadmapGateRef = useRef(null);

  // Shared site tab state
  const [activeSite, setActiveSite] = useState("");

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

  return (
    <div className="page">
      {/* SHARED TAB HEADER (global nav) */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 9000,
          padding: "6px 10px 0",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          marginBottom: 6,
        }}
      >
        <nav
          aria-label="USPPA family sites"
          style={{
            display: "flex",
            gap: 4,
            maxWidth: 680,
            margin: "0 auto",
            paddingBottom: 4,
            overflowX: "auto",
            whiteSpace: "nowrap",
            WebkitOverflowScrolling: "touch",
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
                  borderBottom: isActive
                    ? "1px solid transparent"
                    : "1px solid #3a2b16",
                  color: isActive ? "#f5eedc" : "#c7b08a",
                  background: "transparent",
                  whiteSpace: "nowrap",
                  flex: "0 0 auto",
                }}
              >
                {tab.label}
              </a>
            );
          })}
        </nav>
      </div>

      {/* Top-right Patron Wallet button */}
      <header
        style={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          padding: "8px 0",
        }}
      >
        <a
          className="btn btn-outline"
          style={{ minWidth: "auto", padding: "6px 16px" }}
          href="https://cowboypolo.com/#/wallet"
        >
          PATRON WALLET
        </a>
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
        <h1 className="hero-title">PATRONIUM</h1>

        <div className="hero-symbol">
          <div className="hero-symbol-main">
            ERC-20 TOKEN SYMBOL &quot;PATRON&quot;
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
          <a
            className="btn btn-primary"
            href="https://cowboypolo.com/#/wallet"
            target="_blank"
            rel="noopener noreferrer"
          >
            BUY PATRON
          </a>

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

      {/* Brand / roadmap + copy sections */}
      <main>
        {/* Roadmap */}
        <section className="brand-row" id="brands" ref={roadmapGateRef}>
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
            {/* COWBOY POLO CIRCUIT */}
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
                the horses of the 7̶7̶7̶ ( Three Sevens) Remuda.
              </p>
            </div>

            {/* THREE SEVENS REMUDA */}
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

            {/* THE POLO WAY */}
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

            {/* CHARLESTON POLO */}
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
                The renewal of Charleston, South Carolina&apos;s polo tradition
                — our flagship USPPA Chapter and living test model for the Polo
                Incubator system. Horses are gathered, pasture secured,
                instruction established, and the public welcomed to learn and
                play. Once an Incubator achieves steady operations, sound
                horsemanship, and visible community benefit, it is received as a
                standing Chapter of the Association.
                <br />
                <br />
                Each USPPA Chapter is a fully integrated programme operating
                under the Association&apos;s standards. Charleston Polo, as the
                flagship Chapter, serves as the organisational hub for the
                Cowboy Polo Circuit — coordinating local Cowboy Polo clinics,
                sanctioned chukkers at member barns and arenas, and the first
                pool of Chapter horses.
                <br />
                <br />
                In its early life, a Chapter begins as a Polo Incubator: a local
                startup where the “bring your own horse” model allows riders and
                stables to join the Circuit quickly, while a shared remuda is
                trained for exhibitions, league play, and new riders. Once an
                Incubator demonstrates steady operations, sound horsemanship,
                and visible benefit to the community, it is recognised as a
                standing Chapter of the USPPA.
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

        {/* Patronium Framework */}
        <section className="copy-section" id="patronium-framework">
          <div className="copy-section-title">THE PATRONIUM FRAMEWORK</div>

          <div
            style={{
              position: "relative",
              marginTop: "8px",
            }}
          >
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
                It serves as the bridge between patron and player: a clear
                record of contribution and belonging within a high-trust mission
                driven community. When a Chapter prospers, it offers tribute to
                those whose support made that prosperity possible. This is the
                essence of Patronium — recognition earned through genuine
                patronage and service to the field.
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
                that make it possible for a Polo Incubator to begin. During this
                founding period, their Patronium receives the full measure of
                available tribute — a reflection of their patronage in helping
                to seed the future of Polo.
              </p>
              <p>
                Operating Patrons are the active stewards responsible for the
                management of each Chapter. They receive a base salary during
                the incubator period and an operating share of tribute once the
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
                Incubators they support (49% of tribute). After the first year,
                or when the Incubator can support itself, it transitions to a
                full Chapter and the tribute returns to the standard USPPA
                Patron tribute.
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
                  Become a USPPA Patron — support the national network and share
                  in ongoing tribute cycles.
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
                The Association seeks not to monetise polo, but to stabilise and
                decentralise it — to bring clarity, fairness, and longevity to
                the way it is taught, funded, and shared. Patronium and the Polo
                Incubator model together create a living, self-sustaining
                framework for the game&apos;s renewal across America.
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
                recognised and recorded within a transparent, honourable system
                that rewards those who build American Polo. Your contribution
                does not vanish into expense; it lives on in horses trained,
                players formed, and fields maintained.
              </p>
              <p>
                Those who have carried the game through their own time know: it
                survives only by the strength of its patrons. The USPPA now
                offers a new way to hold that legacy — a means to see your
                support endure in the form of living tribute.
              </p>
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