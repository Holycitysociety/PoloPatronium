import { CheckoutWidget } from "thirdweb/react";
import { createThirdwebClient, defineChain } from "thirdweb";
import { usePrivy } from "@privy-io/react-auth";

const client = createThirdwebClient({
  clientId: "f58c0bfc6e6a2c00092cc3c35db1eed8",
});

export default function App() {
  const { ready, authenticated, login, logout, user } = usePrivy();

  if (!ready) {
    return <div className="page">Loading…</div>;
  }

  const year = new Date().getFullYear();

  const handleBuyPatron = () => {
    // Placeholder for future direct buy logic
    console.log("BUY PATRON clicked");
  };

  const authLabel =
    user?.email?.address ||
    user?.phone?.number ||
    (authenticated ? "Wallet connected" : "Sign in");

  return (
    <div className="page">
      {/* Simple top-right auth button */}
      <header
        style={{
          display: "flex",
          justifyContent: "flex-end",
          padding: "8px 0",
        }}
      >
        {authenticated ? (
          <button
            className="btn btn-outline"
            style={{ minWidth: "auto", padding: "6px 16px" }}
            onClick={logout}
          >
            {authLabel} · Logout
          </button>
        ) : (
          <button
            className="btn btn-outline"
            style={{ minWidth: "auto", padding: "6px 16px" }}
            onClick={login}
          >
            Sign in / Create wallet
          </button>
        )}
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
            ERC-777 &middot;TOKEN SYMBOL &quot;PATRON&quot;
          </div>
          <div className="hero-network">ON BASE NETWORK BY COINBASE</div>
          <div className="hero-contract">
            <span className="hero-contract-label">CA:</span>
            <span className="hero-contract-value">
              0x128445CAAB304A9203CCb87D06dD888823749FbE
            </span>
          </div>
        </div>

        <div className="hero-actions">
          {/* Your original button (can later trigger something else) */}
          <button className="btn btn-primary" onClick={handleBuyPatron}>
            BUY PATRON
          </button>

          {/* Thirdweb Checkout visible on the page */}
          <CheckoutWidget
            client={client}
            description={
              "USPPA, COWBOY POLO CIRCUIT, CHARLESTON POLO's PATRONAGE UTILITY TOKEN"
            }
            name={"POLO PATRONIUM"}
            currency={"USD"}
            chain={defineChain(8453)} // Base
            amount={"1"}
            tokenAddress={"0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"} // USDC on Base
            seller={"0xfee3c75691e8c10ed4246b10635b19bfff06ce16"} // your wallet
            buttonLabel={"ADD USD TO YOUR PATRON WALLET"}
          />

          <a className="btn btn-outline" href="#founding-patrons">
            FOUNDING PATRON INQUIRIES
          </a>
        </div>
      </header>

      {/* Brand / roadmap */}
      <main>
        <section className="brand-row" id="brands">
          <h2 className="roadmap-title">INITIATIVE ROADMAP</h2>

          <div className="brand-grid">
            <div className="logo-block">
              <div className="logo-usp-string-remuda">
                <span className="usp">USPPA</span>
                <div className="rule"></div>
                <span className="string-line">
                  <span className="string-word">STRING THREE</span>
                  <span className="sevens">7̶7̶7̶</span>
                  <span className="string-word">SEVENS REMUDA</span>
                </span>
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
            <h3>The Tribute Framework</h3>
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
        <div>
          © {year} US POLO PATRONS ASSOCIATION — POLO PATRONIUM
        </div>
        <div>BUILT ON BASE BY COINBASE</div>
      </footer>
    </div>
  );
}