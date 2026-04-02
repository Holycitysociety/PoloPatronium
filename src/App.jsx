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
      href: "https://charlestonpoloclub.com",
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
                play.
                <br />
                <br />
                Charleston Polo serves as the first chapter test model for the
                broader USPPA framework. In the early stage, a chapter may
                operate through multiple partner locations rather than a single
                permanent club. Over time, as horse supply, patronage, and event
                structure become stable, that chapter can grow into a more
                permanent and fully integrated node of the Association.
                <br />
                <br />
                The goal is not simply to stage occasional polo activity, but to
                build a repeatable local structure where players, ponies,
                patrons, and hosts are tied together in a practical ecosystem.
              </p>
            </div>
          </div>

          <p className="roadmap-footnote">
            All of these initiatives are coordinated and supported through Polo
            Patronium, the patronage token of the United States Polo Patrons
            Association, uniting patrons, players, and clubs in a shared Polo
            ecosystem.
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
              <h3>Patronium — The Patron Token of the USPPA</h3>
              <p>
                Patronium is the patronage token of the United States Polo
                Patrons Association.
              </p>
              <p>
                It is not built around speculation. It is built to give patrons
                a clear way to enter the ecosystem, participate in real
                initiatives, and direct support where it is needed most —
                horses, teams, chapters, events, and long-term infrastructure.
              </p>
              <p>
                Patronium is the utility layer of the Association. Patrons
                acquire PATRON, then use that position to engage with the life
                of the sport: supporting initiatives, accessing opportunities,
                and helping build the next American polo pipeline.
              </p>
              <p>
                Patron recognition, tribute, and other benefits remain
                discretionary and are determined in light of the needs of the
                Association, the strength of a given initiative, and the
                long-term good of the mission.
              </p>
              <p>
                In plain terms, Patronium is the medium through which patronage
                becomes organized, visible, and durable.
              </p>
            </div>

            <div className="copy-block">
              <h3>Charleston Polo — The Chapter Test Model</h3>
              <p>
                Charleston Polo serves as the first chapter test model for the
                broader USPPA framework.
              </p>
              <p>
                A chapter begins by organizing the real foundations of polo in
                one place: horses, host properties, instruction, patrons, and
                public-facing events.
              </p>
              <p>
                In the early stage, a chapter may operate through multiple
                partner locations rather than a single permanent club. Over
                time, as horse supply, patronage, and event structure become
                stable, that chapter can grow into a more permanent and fully
                integrated node of the Association.
              </p>
              <p>
                The goal is not simply to stage occasional polo activity, but to
                build a repeatable local structure where players, ponies,
                patrons, and hosts are tied together in a practical ecosystem.
              </p>
            </div>

            <div className="copy-block">
              <h3>How Patronium Works</h3>
              <p>
                Patronium begins at the association level, then flows toward
                specific initiatives.
              </p>
              <p>
                A patron may use PATRON to support:
              </p>
              <ul>
                <li>a chapter,</li>
                <li>a team,</li>
                <li>a horse syndicate,</li>
                <li>an event,</li>
                <li>a training property,</li>
                <li>a clubhouse initiative,</li>
                <li>or another approved project within the Association.</li>
              </ul>
              <p>
                This creates a cleaner model than one-time donations or vague
                sponsorships. Support can be directed toward a real purpose,
                tracked over time, and connected to the people, horses, and
                infrastructure it helps bring into being.
              </p>
            </div>

            <div className="copy-block">
              <h3>Horse Syndicates and the Association Remuda</h3>
              <p>
                One of the most important uses of the system is the creation of
                dedicated association horses and a managed remuda.
              </p>
              <p>
                Rather than leaving new players to navigate the sport through
                overpriced horse sales, fragmented advice, or one-off
                arrangements, the Association can build and manage its own horse
                structure through dedicated syndicates and association-backed
                mounts. That creates a cleaner and more trustworthy entry into
                the sport, with sound horses, clearer financial pathways, and a
                less painful early experience for new players.
              </p>
              <p>
                This allows the Association to support the full ladder of the
                game. At the entry level, it helps provide reliable horses for
                lessons, practices, and early development. At the higher end, it
                supports the maintenance of stronger strings for exhibitions,
                featured events, and tournament play.
              </p>
              <p>
                Each horse may have its own digital record and participation
                structure, allowing support to remain tied to that horse over
                the course of its career. This makes it possible to:
              </p>
              <ul>
                <li>organize horse-specific support,</li>
                <li>preserve the history of who helped bring a horse along,</li>
                <li>direct any later horse-related tribute or recognition,</li>
                <li>
                  and reserve funds for old age, turnout, and retirement care.
                </li>
              </ul>
              <p>
                The goal is not to treat horses as disposable expenses or
                one-time transactions, but to create a more stable and enduring
                relationship between horses, patrons, players, and the
                Association itself.
              </p>
            </div>

            <div className="copy-block">
              <h3>Forms of Participation</h3>
              <p>There are several ways to participate in the system.</p>
              <ul>
                <li>
                  <strong>Founding Patron</strong> — supports the early
                  formation of a chapter, horse syndicate, team, or major
                  initiative.
                </li>
                <li>
                  <strong>Operating Patron</strong> — helps sustain the ongoing
                  life of the Association through recurring support,
                  organization, hosting, or stewardship.
                </li>
                <li>
                  <strong>Horse or Land Partner</strong> — provides horses,
                  pasture, arenas, or facilities under clear and fair
                  agreements.
                </li>
                <li>
                  <strong>Team or Event Patron</strong> — supports a development
                  team, social chukker series, luncheon, launch, or other
                  chapter-facing event.
                </li>
                <li>
                  <strong>National Patron</strong> — supports the broader USPPA
                  network and its long-term growth.
                </li>
              </ul>
              <p>
                These are not separate token classes. They are different ways
                patronage can take shape inside the same ecosystem.
              </p>
            </div>

            <div className="copy-block">
              <h3>The Patronage Model</h3>
              <p>
                Resources are directed first toward the real needs of the
                mission:
              </p>
              <ul>
                <li>horses,</li>
                <li>land,</li>
                <li>equipment,</li>
                <li>instruction,</li>
                <li>operations,</li>
                <li>chapter development,</li>
                <li>and long-term infrastructure.</li>
              </ul>
              <p>
                Any patron-facing tribute, recognition, or programmatic benefit
                is discretionary. It is determined by the Association according
                to actual need, actual contribution, and responsible
                stewardship.
              </p>
              <p>
                This allows the system to remain flexible, mission-aligned, and
                operationally honest.
              </p>
            </div>

            <div className="copy-block">
              <h3>In Plain Terms</h3>
              <p>
                The purpose of Patronium is not to financialize polo.
              </p>
              <p>
                The purpose is to organize patronage in a cleaner, more durable
                way.
              </p>
              <p>
                Patronium makes it possible to:
              </p>
              <ul>
                <li>bring people into the sport through a single utility layer,</li>
                <li>direct support toward real initiatives,</li>
                <li>build dedicated horses and teams,</li>
                <li>develop local chapters,</li>
                <li>
                  and eventually create the larger infrastructure polo needs in
                  order to grow.
                </li>
              </ul>
              <p>
                This includes not only lessons and horses, but also social
                hosting, patron events, team launches, clubhouses, training
                properties, and the wider ecosystem that allows polo to function
                as both a sport and a philanthropic platform.
              </p>
              <p>
                In that sense, the system is designed not just to support
                individual causes, but to build the underlying structure through
                which many future causes can be supported.
              </p>
            </div>

            <div className="copy-block">
              <h3>An Invitation to Patrons and Partners</h3>
              <p>
                The USPPA welcomes patrons, horsemen, landholders, hosts, and
                professionals who want to help build a more stable American polo
                future.
              </p>
              <p>
                Support may take the form of:
              </p>
              <ul>
                <li>patronage,</li>
                <li>horses,</li>
                <li>host properties,</li>
                <li>team backing,</li>
                <li>event sponsorship,</li>
                <li>chapter partnership,</li>
                <li>or strategic infrastructure support.</li>
              </ul>
              <p>
                Every act of patronage should be visible, intelligible, and
                connected to something real. Whether that means helping launch a
                chapter, support a horse, back a team, or create a permanent
                social node for the sport, the aim is the same: to restore a
                stronger and more durable framework for American polo.
              </p>
              <p>Patronium is the tool that helps make that possible.</p>
            </div>
          </div>
        </section>
      </main>

      <footer>
        <div>© {year} US POLO PATRONS ASSOCIATION — POLO PATRONIUM</div>
        <div>BUILT ON BASE</div>
      </footer>
    </div>
  );
}