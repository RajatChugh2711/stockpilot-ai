const navigation = [
  ['◫', 'Overview'],
  ['⌕', 'Explore stocks'],
  ['✳', 'AI research'],
  ['⌁', 'Forecasts'],
  ['↗', 'IPO intelligence'],
  ['▤', 'My portfolio'],
  ['☆', 'Watchlists'],
  ['▧', 'News & filings'],
  ['▤', 'Reports'],
];

const research = [
  [
    '01',
    'Market overview',
    'Exchange data will populate this space after a licensed provider is configured.',
  ],
  [
    '02',
    'Company research',
    'Fundamentals, valuation and technical indicators built on validated source data.',
  ],
  [
    '03',
    'Forecast scenarios',
    'Probabilistic research stays disabled until out-of-sample validation is complete.',
  ],
];

export default function HomePage() {
  return (
    <main className="shell">
      <aside className="sidebar">
        <a className="brand" href="/">
          <b>S</b>
          <span>
            stockpilot<span className="green">.ai</span>
          </span>
        </a>
        <p className="side-label">WORKSPACE</p>
        <nav aria-label="Primary navigation">
          {navigation.map(([icon, label], index) => (
            <a className={index === 0 ? 'nav active' : 'nav'} href="#" key={label}>
              <span>{icon}</span>
              {label}
              {label === 'IPO intelligence' && <small>SOON</small>}
            </a>
          ))}
        </nav>
        <div className="side-bottom">
          <div className="provider-status">
            <i /> Data provider not connected
          </div>
          <div className="user">
            <b>SP</b>
            <span>
              <strong>Research workspace</strong>
              <small>Local development</small>
            </span>
          </div>
        </div>
      </aside>
      <section className="main">
        <header className="topbar">
          <span>
            Workspace <em>/</em> Overview
          </span>
          <span className="market-status">
            <i /> Market data unavailable
          </span>
        </header>
        <div className="content">
          <div className="intro">
            <div>
              <p className="eyebrow">STOCKPILOT AI · DEVELOPMENT WORKSPACE</p>
              <h1>
                Your market research,
                <br />
                <span>in one place.</span>
              </h1>
              <p className="sub">
                A clearer view of Indian companies, market history and investment risk.
              </p>
            </div>
            <button disabled>＋ Explore a company</button>
          </div>
          <div className="notice">
            <b>i</b>
            <div>
              <strong>Foundation environment</strong>
              <p>
                No market-data provider is connected yet. Figures are intentionally not fabricated.
                Company search and market analytics will arrive after provider licensing and Phase 1
                integration.
              </p>
            </div>
            <small>PHASE 0</small>
          </div>
          <div className="section-head">
            <div>
              <h2>Market snapshot</h2>
              <p>Exchange data will populate this view when configured.</p>
            </div>
            <small>AS OF —</small>
          </div>
          <div className="metrics">
            {['NIFTY 50', 'SENSEX', 'NIFTY BANK', 'NIFTY IT'].map((name) => (
              <article key={name}>
                <small>{name}</small>
                <strong>—</strong>
                <p>Awaiting licensed data</p>
              </article>
            ))}
          </div>
          <div className="columns">
            <article className="panel chart">
              <div className="panel-head">
                <div>
                  <h2>Market performance</h2>
                  <p>Benchmark movement and market breadth</p>
                </div>
                <span>···</span>
              </div>
              <div className="empty-chart">
                <b>⌁</b>
                <strong>Chart data will appear here</strong>
                <p>Historical price ingestion is part of Phase 1.</p>
              </div>
              <div className="periods">
                <span>1D</span>
                <span>1W</span>
                <span>1M</span>
                <span>6M</span>
                <b>1Y</b>
                <span>ALL</span>
              </div>
            </article>
            <article className="panel watch">
              <div className="panel-head">
                <div>
                  <h2>Watchlist</h2>
                  <p>Your tracked companies</p>
                </div>
                <span>View all</span>
              </div>
              <div className="empty-watch">
                <b>☆</b>
                <strong>No companies added</strong>
                <p>Add listed companies to follow their price and research updates.</p>
              </div>
            </article>
          </div>
          <div className="section-head">
            <div>
              <h2>Research workspace</h2>
              <p>Core capabilities being assembled for the first release.</p>
            </div>
          </div>
          <div className="research">
            {research.map(([number, title, detail]) => (
              <article key={number}>
                <small>{number}</small>
                <h3>{title}</h3>
                <p>{detail}</p>
                <b>IN DEVELOPMENT</b>
              </article>
            ))}
          </div>
          <footer>
            StockPilot AI · Research, not speculation.
            <span>Market data unavailable · Foundation build</span>
          </footer>
        </div>
      </section>
    </main>
  );
}
