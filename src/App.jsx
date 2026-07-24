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
      <section
        className="masthead"
        aria-label="Patrons Society masthead"
      >
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
            OFFICIAL SOCIETY PATRONAGE SYNDICATE &amp; REGISTER
          </div>
        </div>
      </section>

      {/* Patronium hero */}
      <header className="hero-header">
        <h1 className="hero-title">
          PATRONIUM
        </h1>

        <p className="hero-definition">
          Patronium is the official Society patronage syndicate and register
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
              <div className