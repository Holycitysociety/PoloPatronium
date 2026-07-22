// App.jsx
import React, { useRef } from "react";

// ---------------------------------------------
// Main App
// ---------------------------------------------
export default function App() {
  const year = new Date().getFullYear();

  // Roadmap section ref kept in place for possible future scroll logic
  const roadmapGateRef = useRef(null);

  return (
    <div className="page">
      {/* Patron Wallet button */}
      <header className="wallet-header">
        <a
          className="btn btn-primary wallet-button"
          href="https://cowboypolo.com/#/wallet"
        >
          PATRON WALLET
        </a>
      </header>

      {/* Masthead / Patrons Society wordmark */}
      <div className="masthead">
        <div className="masthead-inner">
          <div className="institutional-latin">
            SOCIETATIS CIVITATIS SANCTAE PATRONI
          </div>

          <div className="masthead-line-2 masthead-presents">
            PRESENT
          </div>

          <div
            className="patrons-wordmark"
            aria-label="The Patrons Society"
          >
            <span className="patrons-title">
              THE PATRONS SOCIETY
            </span>
          </div>

          <div className="masthead-rule" />

          <div className="masthead-line-2 masthead-introducing">
            INTRODUCING THE
          </div>

          <div className="masthead-line-2 masthead-stewardship">
            OFFICIAL SOCIETY PATRONAGE TOKEN
          </div>
        </div>
      </div>

      {/* Hero */}
      <header className="hero-header">
        <h1 className="hero-title">PATRONIUM</h1>

        <div className="hero-symbol">
          <div className="hero-symbol-main">
            ERC-20 TOKEN SYMBOL &quot;PATRON&quot;
          </div>

          <div className="hero-network">
            ON BASE NETWORK BY COINBASE
          </div>

          <div className="hero-contract">
            <span className="hero-contract-label">
              CA:
            </span>

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
                "Hello Patrons Society,\n\n" +
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
        <section
          className="brand-row"
          id="brands"
          ref={roadmapGateRef}
        >
          <div className="roadmap-heading">
            <div className="roadmap-kicker">
              INITIATIVE
            </div>

            <div className="roadmap-main-title">
              ROADMAP
            </div>

            <div className="roadmap-heading-rule" />
          </div>

          <div className="brand-grid">
            {/* POLOBRED REGISTRY & STRINGPOOL */}
            <div className="logo-block">
              <div
                className="logo-usp-string-remuda"
                aria-label="The PoloBred Registry and Stringpool wordmark"
              >
                <div className="stringpool-wordmark-inner">
                  <div className="stringpool-rule" />

                  <div className="stringpool-prefix">
                    the PoloBred Registry &amp;
                  </div>

                  <div className="stringpool-rule stringpool-rule-lower" />

                  <div className="stringpool-name">
                    PPA Stringpool
                  </div>
                </div>
              </div>

              <p className="initiative-text">
                Our managed pool of PPA horses — consigned or owned by the
                Association, assigned to operating patrons, trainers and local
                players, and developed for play, exhibition and training across
                our programmes.
              </p>
            </div>

            {/* COWBOY POLO CIRCUIT */}
            <div className="logo-block">
              <div className="logo-cowboy-polo-circuit">
                <span>COWBOY&nbsp;POLO&nbsp;CIRCUIT</span>
              </div>

              <p className="initiative-text">
                An American endeavour to broaden Polo&apos;s reach, nurture
                emerging talent, and encourage the next generation of American
                players — where riders not only learn to play, but learn to make
                the horses of the PoloBred Registry &amp; Stringpool.
              </p>
            </div>

            {/* THE POLO WAY */}
            <div className="logo-block">
              <div className="logo-the-polo-way">
                <span className="top">THE</span>
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
              <div className="logo-charleston-polo">
                <span className="top">
                  CHARLESTON
                </span>

                <span className="main">
                  P O L O
                </span>
              </div>

              <p className="initiative-text">
                The renewal of Charleston, South Carolina&apos;s polo tradition
                — our flagship PPA Chapter and living test model for the Polo
                Incubator system. Horses are gathered, pasture secured,
                instruction established, and the public welcomed to learn and
                play.
                <br />
                <br />
                Charleston Polo serves as the first chapter test model for the
                broader PPA framework. In the early stage, a chapter may operate
                through multiple partner locations rather than a single
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
            All of these polo initiatives are coordinated and supported through
            Patrons Society using Patronium, the Society&apos;s patronage token,
            uniting patrons, players, horses, and clubs in a shared polo
            ecosystem.
          </p>
        </section>

        {/* Patronium Framework */}
        <section
          className="copy-section"
          id="patronium-framework"
        >
          <div className="copy-section-title">
            THE PATRONIUM FRAMEWORK
          </div>

          <div className="copy-section-inner">
            <div className="copy-block">
              <h3>
                Patronium — The Patron Token of Patrons Society
              </h3>

              <p>
                Patronium is the patronage token of Patrons Society.
              </p>

              <p>
                It gives patrons a clear way to enter the ecosystem, participate
                in real initiatives, and direct support where it is needed most
                — especially horses, teams, events, and long-term polo
                infrastructure.
              </p>

              <p>
                Patronium is the utility layer of Patrons Society. Patrons
                acquire PATRON, then use that position to engage with
                initiatives, access opportunities, and designate support within
                the Society.
              </p>

              <p>
                Patron support may be acknowledged through discretionary patron
                recognition determined in light of the needs of Patrons Society.
                Any patron-facing benefits, tribute, or related recognitions
                remain discretionary and are determined in light of operational
                needs, long-term stewardship, and the good of the mission.
              </p>
            </div>

            <div className="copy-block">
              <h3>
                Horse Syndicates and the PoloBred Registry &amp; Stringpool
              </h3>

              <p>
                One of the most important uses of the system is the creation of
                a managed PoloBred Registry &amp; Stringpool.
              </p>

              {/* Simplified branded horse card */}
              <div className="horse-card-wrap">
                <div className="horse-card">
                  <div className="horse-card-heading">
                    PoloBred Registry &amp; Stringpool
                  </div>

                  <div className="horse-card-display">
                    <div className="horse-card-display-inner">
                      <div className="horse-card-kicker">
                        Association Horse
                      </div>

                      <div className="horse-card-name">
                        Horse ID
                      </div>

                      <div className="horse-card-record">
                        PoloBred Registry Record
                      </div>
                    </div>
                  </div>

                  <div className="horse-card-footer">
                    <div>
                      <div className="horse-card-standard-label">
                        Standard
                      </div>

                      <div className="horse-card-standard">
                        ERC-1155
                      </div>
                    </div>

                    <div className="horse-card-badge">
                      Horse Card
                    </div>
                  </div>
                </div>
              </div>

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
                Each horse has its own ERC-1155 token ID, so support can be
                recorded and tracked horse by horse over the course of that
                horse&apos;s career. This makes it possible to organize
                horse-specific support, preserve the history of who helped bring
                a horse along, and reserve funds for old age, turnout, and
                retirement care.
              </p>

              <p>
                The goal is not to treat horses as disposable expenses or
                one-time transactions, but to create a more stable and enduring
                relationship between horses, patrons, players, and the
                Association itself.
              </p>
            </div>

            <div className="copy-block">
              <h3>How Patronium Works</h3>

              <p>
                Patronium begins at the Patrons Society level, then flows toward
                specific initiatives.
              </p>

              <p>
                A patron may use PATRON to support a horse syndicate, a team, an
                event, a chapter, a training property, a clubhouse initiative,
                or another approved project within Patrons Society.
              </p>

              <p>
                This allows support to be directed toward a defined purpose and
                tracked over time.
              </p>

              <p>
                Direct allocation is a utility action within the ecosystem,
                similar to governance or designation, not a claim on proceeds.
              </p>
            </div>

            <div className="copy-block">
              <h3>
                An Invitation to Patrons and Partners
              </h3>

              <p>
                Patrons Society welcomes patrons, horsemen, landholders, hosts,
                and professionals who want to help build a more stable American
                polo future.
              </p>

              <p>
                Whether that means helping support a horse, back a team, host an
                event, or build a permanent node for the sport, the aim is the
                same: to restore a stronger and more durable framework for
                American polo.
              </p>

              <p>
                In a sense, this is the cause before the cause: building the
                underlying horses, teams, and patron structure through which
                polo can later become a meaningful fundraising platform for many
                other worthy causes.
              </p>

              <p>
                Patronium is the tool that helps make that possible.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer>
        <div>
          © {year} PATRONS SOCIETY — PATRONIUM
        </div>

        <div>
          BUILT ON BASE
        </div>
      </footer>
    </div>
  );
}