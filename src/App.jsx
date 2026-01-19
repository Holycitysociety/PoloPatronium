// ---------------------------------------------
// Mini cross-site header (file-tab style)
// ---------------------------------------------
function GlobalHeaderNav() {
  const [activeKey, setActiveKey] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const host = window.location.hostname.toLowerCase();

    if (host.includes("uspolopatrons")) setActiveKey("usppa");
    else if (host.includes("polopatronium")) setActiveKey("patronium");
    else if (host.includes("cowboypolo")) setActiveKey("cowboy");
    else if (host.includes("thepoloway")) setActiveKey("poloway");
    else if (host.includes("charlestonpolo")) setActiveKey("charleston");
  }, []);

  const shellStyle = {
    position: "sticky",
    top: 0,
    zIndex: 1000,
    background: "transparent", // no bar background
    borderBottom: "1px solid rgba(58,43,22,0.7)",
  };

  const navStyle = {
    display: "flex",
    gap: "10px",
    padding: "6px 14px",
    overflowX: "auto",
    alignItems: "flex-end",
  };

  const linkBase = {
    fontFamily:
      '"Cinzel", "EB Garamond", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", serif',
    fontSize: "10px",
    letterSpacing: "0.18em",
    textTransform: "uppercase",
    textDecoration: "none",
    whiteSpace: "nowrap",
    color: "#9f8a64",
    padding: "6px 10px 5px",
    borderRadius: "10px 10px 0 0",
    borderTop: "1px solid rgba(199,176,138,0.5)",
    borderLeft: "1px solid rgba(199,176,138,0.5)",
    borderRight: "1px solid rgba(199,176,138,0.5)",
    borderBottom: "none",
    background: "transparent", // transparent tab fill
    marginBottom: "-1px",
    transition:
      "color 140ms ease, border-color 140ms ease, transform 140ms ease",
  };

  const activeLink = {
    color: "#f5eedc",
    borderTop: "1px solid #e3bf72",
    borderLeft: "1px solid #e3bf72",
    borderRight: "1px solid #e3bf72",
    transform: "translateY(1px)",
  };

  const hoverStyle = {
    color: "#f5eedc",
    borderTop: "1px solid rgba(227,191,114,0.9)",
    borderLeft: "1px solid rgba(227,191,114,0.9)",
    borderRight: "1px solid rgba(227,191,114,0.9)",
  };

  const makeLinkProps = (key) => {
    const isActive = activeKey === key;
    const baseStyle = {
      ...linkBase,
      ...(isActive ? activeLink : null),
    };

    return {
      style: baseStyle,
      onMouseEnter: (e) => {
        if (isActive) return;
        Object.assign(e.currentTarget.style, baseStyle, hoverStyle);
      },
      onMouseLeave: (e) => {
        Object.assign(e.currentTarget.style, baseStyle);
      },
    };
  };

  return (
    <div style={shellStyle}>
      <nav style={navStyle}>
        <a href="https://uspolopatrons.org" {...makeLinkProps("usppa")}>
          U.S. POLO&nbsp;PATRONS
        </a>
        <a
          href="https://polopatronium.com"
          {...makeLinkProps("patronium")}
        >
          POLO&nbsp;PATRONIUM
        </a>
        <a href="https://cowboypolo.com" {...makeLinkProps("cowboy")}>
          COWBOY&nbsp;POLO&nbsp;CIRCUIT
        </a>
        <a href="https://thepoloway.com" {...makeLinkProps("poloway")}>
          THE&nbsp;POLO&nbsp;WAY
        </a>
        <a
          href="https://charlestonpolo.com"
          {...makeLinkProps("charleston")}
        >
          CHARLESTON&nbsp;POLO
        </a>
      </nav>
    </div>
  );
}