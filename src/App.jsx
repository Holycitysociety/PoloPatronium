// App.jsx
import React, { useRef } from "react";

export default function App() {
  const year = new Date().getFullYear();
  const roadmapGateRef = useRef(null);

  return (
    <div className="page">
      {/* Utility control */}
      <header className="wallet-header">
        <a
          className="btn btn-primary wallet-button"
          href="https://cowboypolo.com/#/wallet"
        >
          PATRON WALLET
        </a>
      </header>

      {/* Society masthead */}
      <section className="masthead" aria-label="Patrons Society masthead">
        <div className="masthead-inner">
          <div className="institutional-latin">
            SOCIETATIS CIVITATIS SANCTAE PATRONI
          </div>

          <div className="masthead-presents">
            PRESENT
          </div>

          <div className="patrons-wordmark">
            <span className="patrons-title">
              THE PATRONS SOCIETY
            </span>
          </div>

          <div className="masthead-rule" />

          <div className="masthead-introducing">
            INTRODUCING THE
          </div>

          <div className="masthead-token-line">
            OFFICIAL SOCIETY PATRONAGE TOKEN & REGISTER
          </div>
        </div>
      </section>

      {/* Patronium hero */}
      <header className="hero-header">
        <h1 className="hero-title">
          PATRONIUM
        </h1>

        <p className="hero-definition">
          Patronium is the official Society patronage token and utility layer
          of the Patrons Society.
        </p>

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

      <main>
        {/* Initiative roadmap */}
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
            {/* PoloBred Registry and Stringpool */}
            <article className="logo-block">
              <div
                className="logo-usp-string-remuda"
                aria-label="The PoloBred Registry and Stringpool"
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
                Association, assigned to operating patrons, trainers, and local
                players, and developed for play, exhibition, and training
                across our programmes.
              </p>
            </article>

            {/* Cowboy Polo Circuit */}
            <article className="logo-block">
              <div className="logo-cowboy-polo-circuit">
                <span>
                  COWBOY&nbsp;POLO&nbsp;CIRCUIT
                </span>
              </div>

              <p className="initiative-text">
                An American endeavour to broaden polo&apos;s reach, nurture
                emerging talent, and encourage the next generation of American
                players — where riders not only learn to play, but learn to
                make the horses of the PoloBred Registry &amp; Stringpool.
              </p>
            </article>

            {/* The Polo Way */}
            <article className="logo-block">
              <div className="logo-the-polo-way">
                <span className="top">
                  THE
                </span>

                <span className="main">
                  POLO WAY
                </span>
              </div>

              <p className="initiative-text">
                A platform dedicated to presenting the elegance and traditions
                of polo to new audiences in the digital age — following our
                horses, patrons, and players across the Cowboy Polo Circuit.
              </p>
            </article>

            {/* Charleston Polo */}
            <article className="logo-block">
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
                broader PPA framework. In the early stage, a chapter may
                operate through multiple partner locations rather than a single
                permanent club. Over time, as horse supply, patronage, and
                event structure become stable, that chapter can grow into a
                more permanent and fully integrated node of the Association.
                <br />
                <br />
                The goal is not simply to stage occasional polo activity, but
                to build a repeatable local structure where players, ponies,
                patrons, and hosts are tied together in a practical framework.
              </p>
            </article>
          </div>

          <p className="roadmap-footnote">
            These polo initiatives are coordinated and supported through the
            Patrons Society using Patronium, the Society&apos;s patronage token,
            uniting patrons, players, horses, and clubs through a shared
            patronage framework.
          </p>
        </section>

        {/* Patronium framework */}
        <section
          className="copy-section"
          id="patronium-framework"
        >
          <div className="copy-section-title">
            THE PATRONIUM FRAMEWORK
          </div>

          <div className="copy-section-inner">
            <article className="copy-block">
              <h2>
                Patronium — The Patron Token of the Patrons Society
              </h2>

              <p className="copy-lead">
              
              </p>

              <p>
                It gives patrons a clear way to enter the Society&apos;s
                patronage framework, participate in real initiatives, and
                direct support where it is needed most — especially toward
                horses, teams, events, chapters, and long-term polo
                infrastructure.
              </p>

              <p>
                Patrons acquire PATRON and may then use that position to engage
                with Society initiatives, access designated opportunities, and
                direct support within the Patrons Society.
              </p>

              <p>
                Patron support may be acknowledged through discretionary patron
                recognition determined in light of the needs of the Patrons
                Society. Any patron-facing benefits, tribute, or related
                recognition remain discretionary and are determined according
                to operational needs, long-term stewardship, and the good of
                the mission.
              </p>
            </article>

            <article className="copy-block">
              <h2>
                Horse Syndicates and the PoloBred Registry &amp; Stringpool
              </h2>

              <p>
                One of the most important uses of the framework is the creation
                of a managed PoloBred Registry &amp; Stringpool.
              </p>

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
                arrangements, the Association can build and manage its own
                horse structure through dedicated syndicates and
                association-backed mounts.
              </p>

              <p>
                This creates a cleaner and more trustworthy entry into the
                sport, with sound horses, clearer financial pathways, and a
                less painful early experience for new players.
              </p>

              <p>
                It also allows the Association to support the full ladder of
                the game. At the entry level, it helps provide reliable horses
                for lessons, practices, and early development. At the higher
                end, it supports stronger strings for exhibitions, featured
                events, and tournament play.
              </p>

              <p>
                Each horse has its own ERC-1155 token ID, so support can be
                recorded and tracked horse by horse throughout that
                horse&apos;s career. This makes it possible to organize
                horse-specific support, preserve the history of who helped
                bring a horse along, and reserve funds for old age, turnout,
                and retirement care.
              </p>

              <p>
                The goal is not to treat horses as disposable expenses or
                one-time transactions, but to create a more stable and enduring
                relationship among horses, patrons, players, and the
                Association itself.
              </p>
            </article>

            <article className="copy-block">
              <h2>
                How Patronium Works
              </h2>

              <p>
                Patronium begins at the Patrons Society level and then flows
                toward specific initiatives.
              </p>

              <p>
                A patron may use PATRON to support a horse syndicate, team,
                event, chapter, training property, clubhouse initiative, or
                another approved project within the Patrons Society.
              </p>

              <p>
                This allows support to be directed toward a defined purpose and
                tracked over time.
              </p>

              <p>
                Direct allocation is a utility action within the Society&apos;s
                patronage framework, similar to designation or governance, and
                does not constitute a claim on proceeds.
              </p>
            </article>

            <article className="copy-block">
              <h2>
                An Invitation to Patrons and Partners
              </h2>

              <p>
                The Patrons Society welcomes patrons, horsemen, landholders,
                hosts, and professionals who want to help build a more stable
                American polo future.
              </p>

              <p>
                Whether that means helping support a horse, backing a team,
                hosting an event, or building a permanent node for the sport,
                the aim is the same: to restore a stronger and more durable
                framework for American polo.
              </p>

              <p>
                In a sense, this is the cause before the cause: building the
                underlying horses, teams, and patron structure through which
                polo can later become a meaningful fundraising platform for
                many other worthy causes.
              </p>

              <p>
                Patronium is the tool that helps make that possible.
              </p>
            </article>
          </div>
        </section>
      </main>

      <footer>
        <nav
          className="footer-links"
          aria-label="Related Patrons Society sites"
        >
          <a href="https://patronssociety.org">
            PATRONS SOCIETY
          </a>

          <span className="footer-divider" aria-hidden="true">
            ·
          </span>

          <a href="https://uspolopatrons.org">
            US POLO PATRONS ASSOCIATION
          </a>

          <span className="footer-divider" aria-hidden="true">
            ·
          </span>

          <a href="https://charlestonpolo.com">
            CHARLESTON POLO
          </a>

          <span className="footer-divider" aria-hidden="true">
            ·
          </span>

          <a href="https://cowboypolo.com">
            COWBOY POLO
          </a>
        </nav>

        <div className="footer-identity">
          © {year} PATRONS SOCIETY — PATRONIUM
        </div>

        <div className="footer-network">
          BUILT ON BASE
        </div>
      </footer>
    </div>
  );
}