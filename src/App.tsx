import { useMemo, useState } from "react";
import { activities, finance, history, holdings, ledger, members, money, reports } from "./data";

type IconName =
  | "grid"
  | "wallet"
  | "trend"
  | "pie"
  | "shield"
  | "users"
  | "book"
  | "file"
  | "check"
  | "settings"
  | "bell"
  | "search"
  | "sun"
  | "moon"
  | "chevron"
  | "plus"
  | "arrow"
  | "download"
  | "filter"
  | "more"
  | "spark"
  | "doc"
  | "lock"
  | "close"
  | "calendar"
  | "upload"
  | "eye"
  | "home"
  | "menu"
  | "info"
  | "clock";

const paths: Record<IconName, React.ReactNode> = {
  grid: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="2" />
      <rect x="14" y="3" width="7" height="7" rx="2" />
      <rect x="3" y="14" width="7" height="7" rx="2" />
      <rect x="14" y="14" width="7" height="7" rx="2" />
    </>
  ),
  wallet: (
    <>
      <path d="M4 7h15a2 2 0 0 1 2 2v10H5a2 2 0 0 1-2-2V6a3 3 0 0 1 3-3h12" />
      <path d="M16 12h5v4h-5a2 2 0 0 1 0-4Z" />
    </>
  ),
  trend: (
    <>
      <path d="m3 17 6-6 4 4 8-9" />
      <path d="M15 6h6v6" />
    </>
  ),
  pie: (
    <>
      <path d="M21 12a9 9 0 1 1-9-9v9Z" />
      <path d="M15 3.5A9 9 0 0 1 20.5 9H15Z" />
    </>
  ),
  shield: (
    <>
      <path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z" />
      <path d="m9 12 2 2 4-5" />
    </>
  ),
  users: (
    <>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </>
  ),
  book: (
    <>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5Z" />
      <path d="M4 5.5v14A2.5 2.5 0 0 0 6.5 22H20" />
    </>
  ),
  file: (
    <>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
      <path d="M14 2v6h6M8 13h8M8 17h6" />
    </>
  ),
  check: (
    <>
      <path d="m20 6-11 11-5-5" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.4 1.1V21H9.6v-.1A1.7 1.7 0 0 0 8.5 19.4a1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.5-1H3v-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.83-2.83.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.5V3h4v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.88-.34l.06-.06 2.83 2.83-.06.06A1.7 1.7 0 0 0 19.4 9a1.7 1.7 0 0 0 1.5 1h.1v4h-.1a1.7 1.7 0 0 0-1.5 1Z" />
    </>
  ),
  bell: (
    <>
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </>
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.66 6.34l1.41-1.41" />
    </>
  ),
  moon: <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />,
  chevron: <path d="m9 18 6-6-6-6" />,
  plus: <path d="M12 5v14M5 12h14" />,
  arrow: (
    <>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </>
  ),
  download: (
    <>
      <path d="M12 3v12M7 10l5 5 5-5" />
      <path d="M5 21h14" />
    </>
  ),
  filter: <path d="M3 5h18M6 12h12M10 19h4" />,
  more: (
    <>
      <circle cx="5" cy="12" r="1" />
      <circle cx="12" cy="12" r="1" />
      <circle cx="19" cy="12" r="1" />
    </>
  ),
  spark: <path d="m12 3 1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5Z" />,
  doc: (
    <>
      <path d="M14 2H6a2 2 0 0 0-2 2v16h16V8Z" />
      <path d="M14 2v6h6M8 13h8M8 17h5" />
    </>
  ),
  lock: (
    <>
      <rect x="4" y="10" width="16" height="11" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </>
  ),
  close: <path d="m6 6 12 12M18 6 6 18" />,
  calendar: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M16 3v4M8 3v4M3 10h18" />
    </>
  ),
  upload: (
    <>
      <path d="M12 16V4M7 9l5-5 5 5" />
      <path d="M4 20h16" />
    </>
  ),
  eye: (
    <>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  home: (
    <>
      <path d="m3 11 9-8 9 8" />
      <path d="M5 10v11h14V10M9 21v-7h6v7" />
    </>
  ),
  menu: <path d="M4 6h16M4 12h16M4 18h16" />,
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5M12 8h.01" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
};
function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {paths[name]}
    </svg>
  );
}

const primaryNav = [
  ["Overview", "grid"],
  ["Contributions", "wallet"],
  ["Investments", "pie"],
  ["Members", "users"],
] as [string, IconName][];

function Logo({ small = false }: { small?: boolean }) {
  return (
    <div className="logo">
      <span className="logo-mark">
        <span>P</span>
      </span>
      {!small && (
        <div>
          <b>POVERTY DIE</b>
          <small>WEALTH COLLECTIVE</small>
        </div>
      )}
    </div>
  );
}
function Badge({ children, tone = "neutral" }: { children: React.ReactNode; tone?: string }) {
  return <span className={`badge ${tone}`}>{children}</span>;
}
function Button({
  children,
  kind = "primary",
  icon,
  onClick,
  type = "button",
}: {
  children: React.ReactNode;
  kind?: string;
  icon?: IconName;
  onClick?: () => void;
  type?: "button" | "submit";
}) {
  return (
    <button type={type} className={`btn ${kind}`} onClick={onClick}>
      {icon && <Icon name={icon} />} {children}
    </button>
  );
}
function Avatar({ name, size = "md" }: { name: string; size?: string }) {
  return (
    <span className={`avatar ${size}`}>
      {name
        .split(" ")
        .map((x) => x[0])
        .slice(0, 2)
        .join("")}
    </span>
  );
}
function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <header className="page-header">
      <div>
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {actions && <div className="header-actions">{actions}</div>}
    </header>
  );
}
function Metric({
  label,
  value,
  change,
  detail,
  icon,
  tone = "default",
}: {
  label: string;
  value: string;
  change?: string;
  detail?: string;
  icon?: IconName;
  tone?: string;
}) {
  return (
    <div className={`metric card ${tone}`}>
      <div className="metric-top">
        <span>{label}</span>
        {icon && (
          <span className="icon-box">
            <Icon name={icon} />
          </span>
        )}
      </div>
      <strong>{value}</strong>
      {(change || detail) && (
        <div className="metric-foot">
          {change && <span className={change.startsWith("+") ? "positive" : ""}>{change}</span>}{" "}
          {detail && <span>{detail}</span>}
        </div>
      )}
    </div>
  );
}

function LineChart({ personal = false }: { personal?: boolean }) {
  const values = personal
    ? [104, 112, 119, 121, 128, 126, 139, 145, 151, 159, 166, 173]
    : history.map((x) => x.value);
  const min = Math.min(...values),
    max = Math.max(...values);
  const points = values
    .map((v, i) => `${(i / (values.length - 1)) * 100},${92 - ((v - min) / (max - min)) * 68}`)
    .join(" ");
  return (
    <div className="chart-wrap">
      <svg
        className="line-chart"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        role="img"
        aria-label={
          personal
            ? "Your attributed investment value increased over the period"
            : "Fund NAV rose from ₦4.72m to ₦6.8m"
        }
      >
        <defs>
          <linearGradient id={personal ? "area2" : "area"} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#16a385" stopOpacity=".24" />
            <stop offset="1" stopColor="#16a385" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[24, 47, 70, 93].map((y) => (
          <line key={y} x1="0" y1={y} x2="100" y2={y} className="gridline" />
        ))}
        <polygon points={`0,100 ${points} 100,100`} fill={`url(#${personal ? "area2" : "area"})`} />
        <polyline points={points} className="chartline" />
      </svg>
      <div className="chart-axis">
        {(personal ? ["Feb", "Apr", "Jun", "Aug", "Oct", "Jan"] : history.map((x) => x.month)).map(
          (x) => (
            <span key={x}>{x}</span>
          ),
        )}
      </div>
    </div>
  );
}

function Donut() {
  return (
    <div className="donut-row">
      <div
        className="donut"
        aria-label="Portfolio allocation: ETFs 44%, stocks 20%, physical assets 15%, businesses 13%, and crypto 9%"
      >
        <div>
          <strong>₦6.2m</strong>
          <span>invested</span>
        </div>
      </div>
      <div className="legend">
        {[
          ["ETFs", "43.5%"],
          ["Stocks", "20.2%"],
          ["Physical", "14.5%"],
          ["Businesses", "12.9%"],
          ["Crypto", "8.9%"],
        ].map((x, i) => (
          <div key={x[0]}>
            <i className={`dot d${i}`} />
            <span>{x[0]}</span>
            <b>{x[1]}</b>
          </div>
        ))}
      </div>
    </div>
  );
}

function Overview({ go, paymentApproved }: { go: (x: string) => void; paymentApproved: boolean }) {
  const membersPaid =
    members.filter((member) => member.paid === 25_000).length + (paymentApproved ? 1 : 0);
  const groupProfit = finance.nav - finance.capitalContributed;
  const memberPreview = members.slice(0, 5);
  const verifiedThisMonth = finance.verifiedMonthly + (paymentApproved ? 25_000 : 0);
  const outstandingThisMonth = finance.outstandingMonthly - (paymentApproved ? 25_000 : 0);
  const collectedPercent = (verifiedThisMonth / finance.expectedMonthly) * 100;
  return (
    <div>
      <PageHeader
        eyebrow="FRIDAY, 7 FEBRUARY 2025"
        title="Poverty Die"
        description="Our money, growing together."
        actions={
          <>
            <Button icon="plus" onClick={() => go("Submit Payment")}>
              Record my payment
            </Button>
          </>
        }
      />
      <section className="club-hero">
        <div className="club-value">
          <div className="club-hero-top">
            <span>OUR GROUP'S TOTAL VALUE</span>
            <Badge tone="dark">
              <Icon name="shield" /> Approved 31 Jan
            </Badge>
          </div>
          <strong>{money(finance.nav)}</strong>
          <p>
            <b>+{money(groupProfit)}</b> total investment profit after contributions
          </p>
          <div className="club-value-breakdown">
            <div>
              <span>Money invested</span>
              <b>{money(finance.investmentValue)}</b>
            </div>
            <div>
              <span>Cash available</span>
              <b>{money(finance.availableCash)}</b>
            </div>
            <div>
              <span>Value of one unit</span>
              <b>{money(finance.unitPrice)}</b>
            </div>
          </div>
        </div>
        <div className="club-status">
          <div className="status-heading">
            <span>THIS MONTH</span>
            <b>January contributions</b>
          </div>
          <div
            className="payment-ring"
            style={{ "--paid": `${collectedPercent}%` } as React.CSSProperties}
          >
            <div>
              <strong>{collectedPercent.toFixed(1)}%</strong>
              <span>collected</span>
            </div>
          </div>
          <div className="status-copy">
            <strong>{membersPaid} of 24 friends paid in full</strong>
            <span>{money(outstandingThisMonth)} is still outstanding</span>
          </div>
          <button className="simple-link" onClick={() => go("Contributions")}>
            See who has paid <Icon name="arrow" />
          </button>
        </div>
      </section>
      <section className="your-share">
        <div>
          <Avatar name="Amara Okafor" />
          <div>
            <span>YOUR SHARE</span>
            <b>{money(finance.member.value)}</b>
            <small>Estimated value of your {finance.member.units.toFixed(4)} units</small>
          </div>
        </div>
        <div className="your-share-stats">
          <span>
            <small>You contributed</small>
            <b>{money(finance.member.contributions)}</b>
          </span>
          <span>
            <small>Your investment gain</small>
            <b className="positive">+{money(finance.member.gain)}</b>
          </span>
          <span>
            <small>Your share of the group</small>
            <b>{finance.member.ownership}%</b>
          </span>
        </div>
        <p>
          <Icon name="info" /> This is your attributed ownership value, not cash available to
          withdraw.
        </p>
      </section>
      <div className="question-grid">
        <section className="card chart-card group-growth">
          <div className="section-head">
            <div>
              <span className="kicker">HOW ARE WE DOING?</span>
              <h2>Our value and profit</h2>
            </div>
            <div className="segmented">
              <button>6M</button>
              <button className="active">1Y</button>
              <button>All</button>
            </div>
          </div>
          <div className="chart-summary">
            <strong>₦6.80m</strong>
            <span className="positive">+₦800,000 profit</span>
          </div>
          <LineChart />
          <div className="chart-keys">
            <span>
              <i className="key emerald" />
              Portfolio value
            </span>
            <span>
              <i className="key dashed" />
              Capital contributed
            </span>
          </div>
          <button className="simple-link" onClick={() => go("Investments")}>
            See the full performance story <Icon name="arrow" />
          </button>
        </section>
        <section className="card home-list">
          <div className="section-head">
            <div>
              <span className="kicker">WHAT DO WE OWN?</span>
              <h2>Our biggest investments</h2>
            </div>
          </div>
          <div className="home-holdings">
            {holdings.slice(0, 4).map((holding) => (
              <button key={holding.name} onClick={() => go(`Asset: ${holding.name}`)}>
                <span className="asset-letter">{holding.name.slice(0, 1)}</span>
                <div>
                  <b>{holding.name}</b>
                  <span>{holding.type}</span>
                </div>
                <strong>{money(holding.value, true)}</strong>
                <small>+{holding.change}%</small>
              </button>
            ))}
          </div>
          <button className="simple-link" onClick={() => go("Investments")}>
            See all investments <Icon name="arrow" />
          </button>
        </section>
        <section className="card home-list member-money">
          <div className="section-head">
            <div>
              <span className="kicker">WHAT DOES EVERYONE OWN?</span>
              <h2>Member value</h2>
            </div>
            <span className="list-caption">All 24 members</span>
          </div>
          <div className="home-members">
            {memberPreview.map((member) => (
              <button key={member.id} onClick={() => go(`Member: ${member.name}`)}>
                <Avatar name={member.name} size="sm" />
                <div>
                  <b>{member.name}</b>
                  <span>{member.units.toLocaleString()} units</span>
                </div>
                <strong>{money(member.attributedValue, true)}</strong>
                <small className="positive">+{money(member.gain, true)}</small>
              </button>
            ))}
          </div>
          <button className="simple-link" onClick={() => go("Members")}>
            See everyone's contributions & earnings <Icon name="arrow" />
          </button>
        </section>
        <section className="card home-accountability">
          <div className="section-head">
            <div>
              <span className="kicker">WHO HAS THE MONEY?</span>
              <h2>Current custodian</h2>
            </div>
            <Badge tone="success">Reconciled</Badge>
          </div>
          <div className="custodian-simple">
            <Avatar name="Zainab Bello" size="lg" />
            <div>
              <b>Zainab Bello</b>
              <span>Responsible until 28 February</span>
              <strong>{money(finance.availableCash)} verified cash</strong>
            </div>
          </div>
          <div className="next-custodian">
            <span>NEXT</span>
            <Avatar name="Femi Adeyemi" size="sm" />
            <b>Femi Adeyemi · March</b>
          </div>
          <button className="simple-link" onClick={() => go("Custody")}>
            View custody records <Icon name="arrow" />
          </button>
        </section>
      </div>
      <section className="card latest-update">
        <div>
          <span className="activity-icon">
            <Icon name="check" />
          </span>
          <div>
            <span className="kicker">LATEST VERIFIED UPDATE</span>
            <b>January investments gained ₦110,000</b>
            <small>Mariam Yusuf reported steady ETF growth · Approved 31 Jan 2025</small>
          </div>
        </div>
        <button className="simple-link" onClick={() => go("Investments")}>
          Read the full update <Icon name="arrow" />
        </button>
      </section>
      <section className="card home-activity">
        <div className="section-head">
          <div>
            <span className="kicker">RECENT ACTIVITY</span>
            <h2>What's happened lately</h2>
          </div>
          <button className="simple-link" onClick={() => go("Ledger")}>
            View all activity <Icon name="arrow" />
          </button>
        </div>
        <ActivityList />
      </section>
    </div>
  );
}

function ActivityList() {
  return (
    <div className="activity-list">
      {activities.map((a, i) => (
        <div className="activity" key={a.title}>
          <span className={`activity-icon a${i}`}>
            <Icon name={a.icon as IconName} />
          </span>
          <div>
            <b>{a.title}</b>
            <span>{a.detail}</span>
          </div>
          <time>{a.time}</time>
        </div>
      ))}
    </div>
  );
}

function Contributions({
  go,
  paymentApproved,
}: {
  go: (x: string) => void;
  paymentApproved: boolean;
}) {
  const [query, setQuery] = useState("");
  const filtered = members.filter((m) => m.name.toLowerCase().includes(query.toLowerCase()));
  return (
    <>
      <PageHeader
        eyebrow="CONTRIBUTIONS"
        title="Contributions"
        description="One shared register showing who has paid, who paid part, and what is still due."
        actions={
          <>
            <Button kind="secondary" icon="calendar">
              January 2025
            </Button>
            <Button icon="plus" onClick={() => go("Submit Payment")}>
              Submit payment
            </Button>
          </>
        }
      />
      <div className="flow-strip">
        <div className="active">
          <b>1</b>
          <span>Payment submitted</span>
        </div>
        <i />
        <div className="active">
          <b>2</b>
          <span>Receipt verified</span>
        </div>
        <i />
        <div>
          <b>3</b>
          <span>Awaiting pricing</span>
        </div>
        <i />
        <div>
          <b>4</b>
          <span>Units issued</span>
        </div>
      </div>
      <section className="metrics four">
        <Metric label="Expected" value="₦600,000" detail="24 friends × ₦25,000" />
        <Metric
          label="Verified"
          value={money(finance.verifiedMonthly + (paymentApproved ? 25_000 : 0))}
          change={paymentApproved ? "85.8%" : "81.7%"}
          detail="collected"
        />
        <Metric
          label="Outstanding"
          value={money(finance.outstandingMonthly - (paymentApproved ? 25_000 : 0))}
          detail={paymentApproved ? "5 members affected" : "6 members affected"}
        />
        <Metric
          label="Awaiting confirmation"
          value={paymentApproved ? "₦0" : "₦25,000"}
          detail={paymentApproved ? "No pending claims" : "1 payment claim"}
        />
      </section>
      {paymentApproved ? (
        <div className="notice verified">
          <Icon name="check" />
          <div>
            <b>Ngozi Udo's payment was confirmed</b>
            <span>Shared totals and her contribution status have been updated.</span>
          </div>
        </div>
      ) : (
        <div className="context-action">
          <div>
            <Icon name="check" />
            <span>
              <b>1 payment needs confirmation</b>
              <small>Visible only because you are an authorized verifier.</small>
            </span>
          </div>
          <Button kind="secondary" onClick={() => go("Payment Verification")}>
            Review payment
          </Button>
        </div>
      )}
      <section className="card table-card">
        <div className="table-tools">
          <div>
            <h2>Member contributions</h2>
            <p>
              {paymentApproved ? "19 paid · 4 part-paid · 1 due" : "18 paid · 4 part-paid · 2 due"}
            </p>
          </div>
          <div className="tools">
            <label className="search">
              <Icon name="search" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search members"
              />
            </label>
            <Button kind="secondary" icon="filter">
              Filter
            </Button>
            <Button kind="ghost" icon="download">
              Export
            </Button>
          </div>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Member</th>
                <th>Status</th>
                <th>Expected</th>
                <th>Verified</th>
                <th>Outstanding</th>
                <th>Last update</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((m, i) => {
                const confirmedNow = paymentApproved && m.id === 24;
                const rowStatus = confirmedNow ? "Paid" : m.status;
                const rowPaid = confirmedNow ? 25_000 : m.paid;
                const rowDue = confirmedNow ? 0 : m.due;
                return (
                  <tr key={m.id}>
                    <td>
                      <div className="person">
                        <Avatar name={m.name} size="sm" />
                        <div>
                          <b>{m.name}</b>
                          <span>{m.role}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <Badge
                        tone={
                          rowStatus === "Paid"
                            ? "success"
                            : rowStatus === "Part-paid"
                              ? "warning"
                              : "danger"
                        }
                      >
                        {rowStatus}
                      </Badge>
                    </td>
                    <td>₦25,000</td>
                    <td>{money(rowPaid)}</td>
                    <td className={rowDue ? "negative" : ""}>{money(rowDue)}</td>
                    <td>{m.paid ? `${24 - (i % 8)} Jan 2025` : "No payment"}</td>
                    <td>
                      <button className="icon-btn" aria-label={`View ${m.name}`}>
                        <Icon name="chevron" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

function Earnings() {
  return (
    <>
      <PageHeader
        eyebrow="PERSONAL OWNERSHIP"
        title="My earnings"
        description="Your share of the fund, calculated from verified contributions and when your units were issued."
        actions={
          <Button kind="secondary" icon="download">
            Statement
          </Button>
        }
      />
      <section className="earnings-hero">
        <div>
          <span>YOUR INVESTMENT VALUE</span>
          <strong>₦355,208</strong>
          <p>
            <b>+₦30,208</b> investment growth since your first unit issuance
          </p>
          <small>
            <Icon name="info" /> This is the attributed value of your units, not cash available to
            withdraw.
          </small>
        </div>
        <div className="ring">
          <span>0.3374%</span>
          <small>of the fund</small>
        </div>
      </section>
      <div className="metrics three">
        <Metric label="Your contributions" value="₦350,000" detail="₦25,000 awaiting units" />
        <Metric label="Your units" value="284.1667" detail="at ₦1,250 per unit" />
        <Metric label="Your growth" value="+₦30,208" detail="+9.29% on unitized capital" />
      </div>
      <div className="two-col">
        <section className="card chart-card">
          <div className="section-head">
            <div>
              <span className="kicker">ATTRIBUTED VALUE</span>
              <h2>Your investment journey</h2>
            </div>
            <div className="segmented">
              <button>6M</button>
              <button className="active">1Y</button>
              <button>All</button>
            </div>
          </div>
          <LineChart personal />
          <div className="chart-keys">
            <span>
              <i className="key emerald" />
              Your investment value
            </span>
            <span>
              <i className="key dashed" />
              Capital subscribed
            </span>
          </div>
        </section>
        <section className="card breakdown">
          <span className="kicker">CLEARLY ACCOUNTED</span>
          <h2>What makes up your position</h2>
          {[
            ["Capital converted into units", "₦325,000"],
            ["Unrealized investment return", "+₦25,708"],
            ["Approved distributions received", "+₦4,500"],
            ["Pending unallocated contributions", "₦25,000"],
          ].map((x, i) => (
            <div key={x[0]}>
              <span>
                {x[0]}
                {i === 3 && <Badge tone="warning">Not unitized</Badge>}
              </span>
              <b className={i === 1 ? "positive" : ""}>{x[1]}</b>
            </div>
          ))}
        </section>
      </div>
      <section className="card explain">
        <div className="explain-title">
          <span className="icon-box">
            <Icon name="spark" />
          </span>
          <div>
            <h2>How your earnings are calculated</h2>
            <p>
              You own units in one shared investment pool. The price of those units changes with the
              fund’s approved net asset value.
            </p>
          </div>
        </div>
        <div className="formula">
          <div>
            <span>Your units</span>
            <b>284.1667</b>
          </div>
          <i>×</i>
          <div>
            <span>Current unit price</span>
            <b>₦1,250</b>
          </div>
          <i>=</i>
          <div className="result">
            <span>Your attributed value</span>
            <b>₦355,208</b>
          </div>
        </div>
        <p className="note">
          <Icon name="info" /> Contributions receive units only after receipt verification and an
          approved pricing event. This is why timing matters.
        </p>
      </section>
      <section className="card table-card">
        <div className="table-tools">
          <div>
            <span className="kicker">OWNERSHIP HISTORY</span>
            <h2>Contribution & unit timeline</h2>
          </div>
        </div>
        <div className="timeline">
          {[
            ["31 Jan 2025", "Unit issuance", "₦25,000 at ₦1,250", "20.0000 units"],
            [
              "20 Jan 2025",
              "Verified subscription",
              "January contribution received",
              "₦25,000 pending",
            ],
            ["31 Dec 2024", "Unit issuance", "₦25,000 at ₦1,232", "20.2922 units"],
            [
              "18 Dec 2024",
              "Cash distribution",
              "Approved dividend distribution",
              "₦4,500 received",
            ],
          ].map((x, i) => (
            <div className="timeline-row" key={x[0] + i}>
              <i />
              <time>{x[0]}</time>
              <div>
                <b>{x[1]}</b>
                <span>{x[2]}</span>
              </div>
              <strong>{x[3]}</strong>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

function Investments({ go }: { go: (x: string) => void }) {
  return (
    <>
      <PageHeader
        eyebrow="INVESTMENT POOL"
        title="Investments"
        description="What the group owns, how it is performing, and the latest approved monthly update."
        actions={
          <>
            <Button kind="secondary" icon="calendar">
              31 Jan 2025
            </Button>
            <Button icon="plus" onClick={() => go("Report Editor")}>
              Post monthly update
            </Button>
          </>
        }
      />
      <div className="metrics four">
        <Metric
          label="Investment value"
          value="₦6.20m"
          change="+₦550,000"
          detail="total asset gain"
        />
        <Metric label="Cost basis" value="₦5.65m" detail="approved acquisition cost" />
        <Metric label="Income received" value="₦125,000" detail="since inception" />
        <Metric label="Latest valuation" value="31 Jan 2025" detail="approved & published" />
      </div>
      <div className="investment-overview">
        <section className="card performance-chart">
          <div className="section-head">
            <div>
              <span className="kicker">ACTUAL PERFORMANCE</span>
              <h2>Investment value vs. contributed capital</h2>
            </div>
            <div className="segmented">
              <button>6M</button>
              <button className="active">1Y</button>
              <button>All</button>
            </div>
          </div>
          <div className="chart-summary">
            <strong>₦6.80m NAV</strong>
            <span className="positive">+₦800,000 investment gain</span>
          </div>
          <LineChart />
          <div className="chart-keys">
            <span>
              <i className="key emerald" />
              Group value
            </span>
            <span>
              <i className="key dashed" />
              Contributed capital
            </span>
          </div>
        </section>
        <section className="card monthly-update">
          <div className="section-head">
            <div>
              <span className="kicker">JANUARY UPDATE</span>
              <h2>Latest approved report</h2>
            </div>
            <Badge tone="success">Approved</Badge>
          </div>
          <div className="report-profit">
            <span>Investment gain this month</span>
            <strong>+₦110,000</strong>
            <small>+1.79% after expenses</small>
          </div>
          <p>ETFs and Dangote Cement led growth. The private business valuation was unchanged.</p>
          <div className="report-person">
            <Avatar name="Mariam Yusuf" size="sm" />
            <span>
              <b>Mariam Yusuf</b>
              <small>Investment manager · Approved 31 Jan</small>
            </span>
          </div>
          <button className="simple-link" onClick={() => go("Report Review")}>
            View full monthly update <Icon name="arrow" />
          </button>
        </section>
      </div>
      <div className="portfolio-top">
        <section className="card allocation">
          <div className="section-head">
            <div>
              <span className="kicker">ASSET MIX</span>
              <h2>Portfolio allocation</h2>
            </div>
          </div>
          <Donut />
        </section>
        <section className="card insight">
          <span className="kicker">VALUATION QUALITY</span>
          <h2>All figures have a source</h2>
          <div className="quality">
            <b>6</b>
            <span>holdings valued this period</span>
          </div>
          <div className="quality-bar">
            <i style={{ width: "92%" }} />
          </div>
          <p>
            92% of portfolio value was updated within the last 7 days. Private assets use approved
            manual valuations.
          </p>
        </section>
      </div>
      <section className="card table-card">
        <div className="table-tools">
          <div>
            <h2>Holdings</h2>
            <p>Latest approved valuations in NGN equivalent</p>
          </div>
          <div className="tabs">
            <button className="active">All</button>
            <button>Stocks</button>
            <button>ETFs</button>
            <button>Crypto</button>
            <button>Other</button>
          </div>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Investment</th>
                <th>Type</th>
                <th>Cost basis</th>
                <th>Current value</th>
                <th>Return</th>
                <th>Allocation</th>
                <th>Valued</th>
              </tr>
            </thead>
            <tbody>
              {holdings.map((h) => (
                <tr key={h.name} className="clickable" onClick={() => go(`Asset: ${h.name}`)}>
                  <td>
                    <div className="asset">
                      <span>{h.symbol.slice(0, 2)}</span>
                      <div>
                        <b>{h.name}</b>
                        <small>{h.symbol}</small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <Badge>{h.type}</Badge>
                  </td>
                  <td>{money(h.cost)}</td>
                  <td>
                    <b>{money(h.value)}</b>
                  </td>
                  <td className="positive">+{h.change}%</td>
                  <td>{h.allocation}%</td>
                  <td>{h.updated}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section className="card investment-reports">
        <div className="section-head">
          <div>
            <span className="kicker">MONTHLY UPDATES</span>
            <h2>Approved investment reports</h2>
          </div>
          <span className="waiting-update">
            <Icon name="clock" /> February update is awaiting verification
          </span>
        </div>
        <div>
          {reports.map((report) => (
            <button key={report.period} onClick={() => go("Report Review")}>
              <span className="activity-icon">
                <Icon name="doc" />
              </span>
              <span>
                <b>{report.period}</b>
                <small>
                  {report.manager} · Approved {report.date}
                </small>
              </span>
              <strong>{report.value}</strong>
              <em>{report.change}</em>
              <Icon name="chevron" />
            </button>
          ))}
        </div>
      </section>
    </>
  );
}

function Performance() {
  return (
    <>
      <PageHeader
        eyebrow="OFFICIAL PERFORMANCE"
        title="Investment performance"
        description="Returns calculated from approved unit prices, separate from new member contributions."
        actions={
          <Button kind="secondary" icon="download">
            Export report
          </Button>
        }
      />
      <div className="metrics four">
        <Metric label="Current NAV" value="₦6.80m" change="+1.79%" detail="this month" />
        <Metric label="Monthly return" value="+1.79%" detail="investment return" />
        <Metric label="Year to date" value="+1.79%" detail="after costs" />
        <Metric label="Since inception" value="+13.64%" detail="unit price return" />
      </div>
      <section className="card performance-chart">
        <div className="section-head">
          <div>
            <span className="kicker">UNIT PRICE HISTORY</span>
            <h2>Growth without contribution distortion</h2>
          </div>
          <div className="segmented">
            <button>1M</button>
            <button>3M</button>
            <button>6M</button>
            <button className="active">1Y</button>
            <button>All</button>
          </div>
        </div>
        <div className="chart-summary">
          <strong>₦1,250</strong>
          <span className="positive">+₦68 in 3 months</span>
        </div>
        <LineChart />
        <div className="chart-keys">
          <span>
            <i className="key emerald" />
            Official unit price
          </span>
        </div>
      </section>
      <div className="metrics three">
        <Metric label="Realized gains" value="₦125,000" detail="completed disposals" />
        <Metric label="Unrealized gains" value="₦550,000" detail="not yet cash earned" />
        <Metric label="Investment income" value="₦125,000" detail="dividends & distributions" />
      </div>
    </>
  );
}

function Custody({ go }: { go: (x: string) => void }) {
  return (
    <>
      <PageHeader
        eyebrow="FUND RESPONSIBILITY"
        title="Custody"
        description="See who holds group funds, how balances reconcile, and when responsibility changes."
        actions={
          <Button icon="arrow" onClick={() => go("Custody Handover")}>
            Open handover
          </Button>
        }
      />
      <section className="custody-hero">
        <div className="custodian-person">
          <Avatar name="Zainab Bello" size="lg" />
          <div>
            <span>CURRENT CUSTODIAN</span>
            <h2>Zainab Bello</h2>
            <p>1 January – 28 February 2025</p>
          </div>
        </div>
        <Badge tone="success">
          <Icon name="shield" /> Reconciled
        </Badge>
        <div className="custody-main-balance">
          <span>Verified closing position</span>
          <strong>₦600,000</strong>
          <small>Last reconciled 5 Feb 2025 at 16:42</small>
        </div>
        <div className="custody-flow">
          <div>
            <span>Opening cash</span>
            <b>₦420,000</b>
          </div>
          <i>+</i>
          <div>
            <span>Verified inflows</span>
            <b>₦490,000</b>
          </div>
          <i>−</i>
          <div>
            <span>Approved outflows</span>
            <b>₦310,000</b>
          </div>
          <i>=</i>
          <div>
            <span>Expected balance</span>
            <b>₦600,000</b>
          </div>
        </div>
      </section>
      <div className="two-col">
        <section className="card">
          <div className="section-head">
            <div>
              <span className="kicker">ROTATION</span>
              <h2>Upcoming custodians</h2>
            </div>
          </div>
          {[
            ["Zainab Bello", "Active · Jan–Feb"],
            ["Femi Adeyemi", "Next · Mar"],
            ["Ifeoma Nwosu", "April"],
            ["Ade Balogun", "May"],
          ].map((x, i) => (
            <div className="rotation" key={x[0]}>
              <div className="rotation-line">
                <i className={i === 0 ? "active" : ""} />
                {i < 3 && <em />}
              </div>
              <Avatar name={x[0]} size="sm" />
              <div>
                <b>{x[0]}</b>
                <span>{x[1]}</span>
              </div>
              {i === 0 && <Badge tone="success">Current</Badge>}
            </div>
          ))}
        </section>
        <section className="card">
          <div className="section-head">
            <div>
              <span className="kicker">RECONCILIATION</span>
              <h2>Current period controls</h2>
            </div>
          </div>
          {[
            ["Bank statement uploaded", "Verified"],
            ["All inflows matched", "Verified"],
            ["Outflows independently approved", "Verified"],
            ["Incoming custodian confirmation", "Pending"],
          ].map((x) => (
            <div className="control-row" key={x[0]}>
              <span className={x[1] === "Verified" ? "check-circle" : "pending-circle"}>
                <Icon name={x[1] === "Verified" ? "check" : "clock"} />
              </span>
              <b>{x[0]}</b>
              <Badge tone={x[1] === "Verified" ? "success" : "warning"}>{x[1]}</Badge>
            </div>
          ))}
        </section>
      </div>
    </>
  );
}

function Members({ go, paymentApproved }: { go: (x: string) => void; paymentApproved: boolean }) {
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<"value" | "name">("name");
  const visibleMembers = members
    .filter((member) => member.name.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) =>
      sort === "value" ? b.attributedValue - a.attributedValue : a.name.localeCompare(b.name),
    );
  return (
    <>
      <PageHeader
        eyebrow="OUR GROUP"
        title="Members & Earnings"
        description="Every member can see what everyone contributed, the units they own, and what their share is worth."
        actions={
          <Button kind="secondary" icon="download">
            Member statements
          </Button>
        }
      />
      <section className="member-summary">
        <div>
          <span>24</span>
          <p>
            <b>active friends</b>
            <small>in one shared investment pool</small>
          </p>
        </div>
        <div>
          <span>{money(finance.capitalContributed, true)}</span>
          <p>
            <b>capital contributed</b>
            <small>across all active members</small>
          </p>
        </div>
        <div>
          <span>{finance.totalUnits.toLocaleString()}</span>
          <p>
            <b>total units</b>
            <small>at {money(finance.unitPrice)} each</small>
          </p>
        </div>
      </section>
      <section className="card table-card">
        <div className="table-tools">
          <div>
            <h2>Member contributions & earnings</h2>
            <p>Based on the latest approved unit price from 31 January 2025</p>
          </div>
          <div className="member-tools">
            <label className="search">
              <Icon name="search" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Find a friend" />
            </label>
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value as "value" | "name")}
            >
              <option value="name">Name A–Z</option>
              <option value="value">Highest value</option>
            </select>
          </div>
        </div>
        <div className="member-money-head">
          <span>Member</span>
          <span>Total contributed</span>
          <span>Units</span>
          <span>Current value</span>
          <span>Gain / loss</span>
          <span>Ownership</span>
          <span>This month</span>
        </div>
        <div className="member-money-list">
          {visibleMembers.map((member) => (
            <button key={member.id} onClick={() => go(`Member: ${member.name}`)}>
              <div className="member-identity">
                <Avatar name={member.name} />
                <div>
                  <b>{member.name}</b>
                  <span>{member.role}</span>
                </div>
              </div>
              <div data-label="Contributed">
                <b>
                  {money(
                    member.totalContributed + (paymentApproved && member.id === 24 ? 25_000 : 0),
                  )}
                </b>
              </div>
              <div data-label="Units">
                <b>{member.units.toLocaleString()}</b>
              </div>
              <div data-label="Current value">
                <b>{money(member.attributedValue)}</b>
              </div>
              <div data-label="Gain / loss">
                <b className="positive">+{money(member.gain)}</b>
              </div>
              <div data-label="Ownership">
                <b>{member.ownership.toFixed(3)}%</b>
              </div>
              <div data-label="This month">
                <Badge
                  tone={
                    paymentApproved && member.id === 24
                      ? "success"
                      : member.status === "Paid"
                        ? "success"
                        : member.status === "Part-paid"
                          ? "warning"
                          : "danger"
                  }
                >
                  {paymentApproved && member.id === 24 ? "Paid" : member.status}
                </Badge>
                <Icon name="chevron" />
              </div>
            </button>
          ))}
        </div>
      </section>
      <div className="plain-language-note">
        <Icon name="info" />
        <p>
          <b>How member value works</b>
          Everyone's value is their units multiplied by the latest approved unit price. Units depend
          on how much was contributed and when it entered the investment pool.
        </p>
      </div>
    </>
  );
}

function Ledger({ audit = false }: { audit?: boolean }) {
  return (
    <>
      <PageHeader
        eyebrow="IMMUTABLE FINANCIAL RECORD"
        title={audit ? "Audit history" : "Transaction ledger"}
        description={
          audit
            ? "Who changed what, when, and why — across every sensitive financial action."
            : "Posted entries cannot be edited or deleted. Corrections use linked reversals."
        }
        actions={
          <>
            <Button kind="secondary" icon="filter">
              Filters
            </Button>
            <Button kind="secondary" icon="download">
              Export
            </Button>
          </>
        }
      />
      <section className="card table-card">
        <div className="table-tools">
          <label className="search">
            <Icon name="search" />
            <input
              placeholder={`Search ${audit ? "audit events" : "reference, account or actor"}`}
            />
          </label>
          <div className="tabs">
            <button className="active">All activity</button>
            <button>Contributions</button>
            <button>Investments</button>
            <button>Units</button>
          </div>
        </div>
        {audit ? (
          <div className="audit-list">
            {[...activities, ...activities].map((a, i) => (
              <div className="audit-event" key={i}>
                <span className="activity-icon">
                  <Icon name={a.icon as IconName} />
                </span>
                <div>
                  <b>
                    {i < 4
                      ? a.title
                      : [
                          "Role assignment updated",
                          "Valuation correction approved",
                          "Contribution claim rejected",
                          "Custody confirmation",
                        ][i - 4]}
                  </b>
                  <p>
                    {a.detail} ·{" "}
                    <strong>
                      {["Aisha Ibrahim", "System", "Mariam Yusuf", "Zainab Bello"][i % 4]}
                    </strong>
                  </p>
                  <small>
                    Reason:{" "}
                    {i % 2 ? "Scheduled monthly process" : "Reviewed against supporting evidence"}
                  </small>
                </div>
                <time>{i < 4 ? a.time : `${28 - i} Jan, 12:0${i}`}</time>
              </div>
            ))}
          </div>
        ) : (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Event</th>
                  <th>Reference</th>
                  <th>Member / account</th>
                  <th>Debit</th>
                  <th>Credit</th>
                  <th>Status</th>
                  <th>Actor</th>
                </tr>
              </thead>
              <tbody>
                {ledger.map((x) => (
                  <tr key={x.ref}>
                    <td>{x.date}</td>
                    <td>
                      <Badge>{x.type}</Badge>
                    </td>
                    <td className="mono">{x.ref}</td>
                    <td>
                      <b>{x.account}</b>
                    </td>
                    <td>{x.debit}</td>
                    <td>{x.credit}</td>
                    <td>
                      <Badge tone="success">{x.status}</Badge>
                    </td>
                    <td>{x.actor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}

function Reports({ go }: { go: (x: string) => void }) {
  return (
    <>
      <PageHeader
        eyebrow="FINANCIAL REPORTING"
        title="Reports"
        description="Approved statements, performance reports, reconciliations, and member records."
        actions={
          <Button kind="secondary" icon="download">
            Export center
          </Button>
        }
      />
      <div className="report-grid">
        {[
          ["Monthly financial statement", "Complete fund position and cash movements", "file"],
          ["Investment performance", "Returns separated from capital contributions", "trend"],
          ["Contribution report", "Obligations, receipts and outstanding amounts", "wallet"],
          ["Custody reconciliation", "Cash responsibility and handover records", "shield"],
          ["Individual earnings statement", "Personal units, value and investment growth", "users"],
          ["Annual financial review", "2024 review and reinvestment planning", "book"],
        ].map((x) => (
          <button className="card report-card" key={x[0]} onClick={() => go(x[0])}>
            <span className="icon-box">
              <Icon name={x[2] as IconName} />
            </span>
            <div>
              <h3>{x[0]}</h3>
              <p>{x[1]}</p>
              <small>
                View latest report <Icon name="arrow" />
              </small>
            </div>
          </button>
        ))}
      </div>
      <section className="card table-card">
        <div className="table-tools">
          <div>
            <span className="kicker">MONTH-END</span>
            <h2>Published investment reports</h2>
          </div>
          <Button icon="plus" onClick={() => go("Report Editor")}>
            New monthly report
          </Button>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Reporting period</th>
                <th>Status</th>
                <th>Manager</th>
                <th>Closing value</th>
                <th>Monthly change</th>
                <th>Published</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r) => (
                <tr key={r.period}>
                  <td>
                    <b>{r.period}</b>
                  </td>
                  <td>
                    <Badge tone="success">{r.status}</Badge>
                  </td>
                  <td>{r.manager}</td>
                  <td>{r.value}</td>
                  <td className="positive">{r.change}</td>
                  <td>{r.date}</td>
                  <td>
                    <button className="icon-btn" onClick={() => go("Report Review")}>
                      <Icon name="chevron" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

function Approvals({ go }: { go: (x: string) => void }) {
  const [done, setDone] = useState<number[]>([]);
  const items = [
    ["Payment claim", "Chidi Eze", "₦25,000 · GTB-842910", "payment"],
    ["Monthly investment report", "Mariam Yusuf", "January 2025 · 6 holdings", "report"],
    ["Investment transaction", "Tobi Adebayo", "VOO purchase · ₦120,000", "transaction"],
    ["Custody handover", "Zainab Bello", "Closing balance · ₦600,000", "handover"],
  ];
  return (
    <>
      <PageHeader
        eyebrow="INDEPENDENT REVIEW"
        title="Approvals"
        description="Sensitive financial submissions require an authorized reviewer who is not the submitter."
      />
      <div className="notice">
        <Icon name="lock" />
        <div>
          <b>Self-approval is blocked</b>
          <span>Your own submissions are automatically routed to another authorized reviewer.</span>
        </div>
      </div>
      <section className="card approval-list">
        <div className="section-head">
          <div>
            <h2>Awaiting your review</h2>
            <p>{items.length - done.length} items require attention</p>
          </div>
        </div>
        {items
          .filter((_, i) => !done.includes(i))
          .map((x, i) => (
            <div className="approval-row" key={x[0]}>
              <span className="activity-icon">
                <Icon name={i === 0 ? "wallet" : i === 1 ? "doc" : i === 2 ? "pie" : "shield"} />
              </span>
              <div>
                <Badge tone="warning">Awaiting review</Badge>
                <h3>{x[0]}</h3>
                <p>
                  Submitted by {x[1]} · {x[2]}
                </p>
                <small>
                  Submitted {i + 1} day{i ? "s" : ""} ago
                </small>
              </div>
              <div className="approval-actions">
                <Button
                  kind="secondary"
                  onClick={() => go(x[3] === "report" ? "Report Review" : "Payment Verification")}
                >
                  Review details
                </Button>
                <Button onClick={() => setDone((d) => [...d, i])}>Approve</Button>
              </div>
            </div>
          ))}
        {done.length === items.length && (
          <Empty
            title="You’re all caught up"
            text="There are no submissions waiting for your review."
          />
        )}
      </section>
    </>
  );
}

function Settings({ go }: { go: (x: string) => void }) {
  const sections = [
    ["Group profile", "Poverty Die · Nigeria", "users"],
    ["Contribution policy", "₦25,000 due on the 20th", "wallet"],
    ["Members & invitations", "24 active · 2 invitations pending", "users"],
    ["Roles & permissions", "5 governance assignments", "lock"],
    ["Custody rotation", "Monthly rotation · 12 months scheduled", "shield"],
    ["Valuation policy", "Monthly close · last business day", "trend"],
    ["Unit issuance schedule", "Monthly after approved pricing", "spark"],
    ["Notifications", "Email and in-app preferences", "bell"],
  ];
  return (
    <>
      <PageHeader
        eyebrow="ADMINISTRATION"
        title="Group settings"
        description="Policy changes apply prospectively and never rewrite approved financial history."
      />
      <div className="notice warning">
        <Icon name="info" />
        <div>
          <b>Sensitive changes require confirmation</b>
          <span>
            Contribution, valuation, approval, and unit policies create an audit event and take
            effect in a future period.
          </span>
        </div>
      </div>
      <div className="settings-layout">
        <nav className="settings-nav">
          {sections.map((x, i) => (
            <button className={i === 0 ? "active" : ""} key={x[0]}>
              <Icon name={x[2] as IconName} />
              {x[0]}
            </button>
          ))}
        </nav>
        <section className="card settings-panel">
          <span className="kicker">GROUP PROFILE</span>
          <h2>About this investment group</h2>
          <div className="form-grid">
            <label>
              <span>Group name</span>
              <input defaultValue="Poverty Die" />
            </label>
            <label>
              <span>Primary currency</span>
              <select defaultValue="NGN">
                <option>NGN — Nigerian naira</option>
              </select>
            </label>
            <label className="full">
              <span>Group description</span>
              <textarea defaultValue="A private investment collective building long-term wealth through disciplined monthly contributions." />
            </label>
            <label>
              <span>Established</span>
              <input defaultValue="12 March 2022" />
            </label>
            <label>
              <span>Active members</span>
              <input defaultValue="24" disabled />
            </label>
          </div>
          <div className="panel-footer">
            <span>Last changed by Amara Okafor · 4 Nov 2024</span>
            <Button>Save changes</Button>
          </div>
        </section>
      </div>
      <button className="text-link onboarding-link" onClick={() => go("Onboarding")}>
        Preview new member onboarding <Icon name="arrow" />
      </button>
    </>
  );
}

function DetailPage({ page, go }: { page: string; go: (x: string) => void }) {
  if (page.startsWith("Asset:")) {
    const h = holdings.find((x) => page.includes(x.name)) || holdings[0];
    return (
      <>
        <button className="back" onClick={() => go("Investments")}>
          ← Back to portfolio
        </button>
        <PageHeader
          eyebrow={h.type.toUpperCase()}
          title={h.name}
          description={`${h.symbol} · Latest approved valuation ${h.updated}`}
          actions={
            <Button kind="secondary" icon="file">
              Documents
            </Button>
          }
        />
        <div className="metrics four">
          <Metric label="Current value" value={money(h.value)} />
          <Metric label="Cost basis" value={money(h.cost)} />
          <Metric
            label="Total return"
            value={`+${money(h.value - h.cost)}`}
            change={`+${h.change}%`}
          />
          <Metric label="Allocation" value={`${h.allocation}%`} detail="of investment value" />
        </div>
        <div className="two-col">
          <section className="card chart-card">
            <div className="section-head">
              <div>
                <span className="kicker">APPROVED VALUATIONS</span>
                <h2>Value history</h2>
              </div>
            </div>
            <LineChart />
          </section>
          <section className="card breakdown">
            <span className="kicker">YOUR ECONOMIC SHARE</span>
            <h2>Attributed exposure</h2>
            <strong className="exposure">
              {money((h.value * finance.member.ownership) / 100)}
            </strong>
            <p>Based on your 0.3374% ownership of the shared pool.</p>
            <div className="notice compact">
              <Icon name="info" />
              <span>
                This is proportional economic exposure, not direct legal ownership of this asset.
              </span>
            </div>
          </section>
        </div>
        <section className="card explain">
          <h2>Valuation evidence</h2>
          <p>
            Approved by Aisha Ibrahim · Source:{" "}
            {h.type === "Physical" ? "Independent valuation report" : "Brokerage closing statement"}{" "}
            · 31 Jan 2025
          </p>
        </section>
      </>
    );
  }
  if (page.startsWith("Member:")) {
    const m = members.find((x) => page.includes(x.name)) || members[0];
    return (
      <>
        <button className="back" onClick={() => go("Members")}>
          ← Back to members
        </button>
        <PageHeader
          eyebrow="MEMBER FINANCIAL PROFILE"
          title={m.name}
          description={`${m.role} · Member since ${m.joined}`}
          actions={
            <Button kind="secondary" icon="download">
              Statement
            </Button>
          }
        />
        <div className="profile-head card">
          <Avatar name={m.name} size="lg" />
          <div>
            <h2>{m.name}</h2>
            <p>{m.role}</p>
          </div>
          <Badge tone="success">Active</Badge>
        </div>
        <div className="metrics four">
          <Metric label="Total contributed" value={money(m.totalContributed)} />
          <Metric label="Ownership units" value={m.units.toLocaleString()} />
          <Metric label="Current share value" value={money(m.attributedValue)} />
          <Metric
            label="Investment gain"
            value={`+${money(m.gain)}`}
            detail={`${m.ownership.toFixed(3)}% of group`}
          />
          <Metric label="January status" value={m.status} detail={`${money(m.due)} outstanding`} />
        </div>
        <section className="card">
          <div className="section-head">
            <h2>Unit issuance history</h2>
          </div>
          <div className="timeline">
            {["31 Jan 2025", "31 Dec 2024", "30 Nov 2024", "31 Oct 2024"].map((d, i) => (
              <div className="timeline-row" key={d}>
                <i />
                <time>{d}</time>
                <div>
                  <b>Monthly unit issuance</b>
                  <span>Approved contribution at official unit price</span>
                </div>
                <strong>{(20.1 + i * 0.4).toFixed(4)} units</strong>
              </div>
            ))}
          </div>
        </section>
      </>
    );
  }
  if (page === "Custody Handover") return <Handover />;
  if (page === "Report Editor") return <ReportEditor go={go} />;
  if (page === "Report Review") return <ReportReview />;
  if (page === "Record Transaction") return <RecordTransaction />;
  if (page === "Audit History") return <Ledger audit />;
  return <GenericReport title={page} />;
}

function Handover() {
  const [confirmed, setConfirmed] = useState(false);
  return (
    <>
      <PageHeader
        eyebrow="GUIDED RECONCILIATION"
        title="February custody handover"
        description="Both custodians must independently confirm the reconciled cash position."
      />
      <div className="handover-people">
        <div>
          <Avatar name="Zainab Bello" />
          <span>OUTGOING</span>
          <b>Zainab Bello</b>
          <Badge tone="success">Confirmed</Badge>
        </div>
        <Icon name="arrow" size={26} />
        <div>
          <Avatar name="Femi Adeyemi" />
          <span>INCOMING</span>
          <b>Femi Adeyemi</b>
          <Badge tone={confirmed ? "success" : "warning"}>
            {confirmed ? "Confirmed" : "Awaiting review"}
          </Badge>
        </div>
      </div>
      <div className="metrics three">
        <Metric label="Expected balance" value="₦600,000" />
        <Metric label="Actual verified balance" value="₦600,000" />
        <Metric label="Reconciliation difference" value="₦0" detail="Fully reconciled" />
      </div>
      <section className="card form-card">
        <h2>Incoming custodian review</h2>
        <div className="checklist">
          {[
            "Closing bank statement reviewed",
            "All pending transfers disclosed",
            "Supporting documents accessible",
            "Balance independently confirmed",
          ].map((x) => (
            <label key={x}>
              <input type="checkbox" defaultChecked={x !== "Balance independently confirmed"} />
              <span>{x}</span>
            </label>
          ))}
        </div>
        <label>
          <span>Handover note</span>
          <textarea placeholder="Add an optional note for the audit record" />
        </label>
        <div className="panel-footer">
          <Button kind="danger">Dispute balance</Button>
          <Button onClick={() => setConfirmed(true)}>
            {confirmed ? "Handover confirmed" : "Confirm receipt & balance"}
          </Button>
        </div>
      </section>
    </>
  );
}

function ReportEditor({ go }: { go: (x: string) => void }) {
  const [saved, setSaved] = useState(false);
  return (
    <>
      <PageHeader
        eyebrow="INVESTMENT MANAGER WORKSPACE"
        title="January monthly report"
        description="Draft · Values do not affect official performance until independently approved."
        actions={
          <>
            <Button kind="secondary" onClick={() => setSaved(true)}>
              {saved ? "Draft saved" : "Save draft"}
            </Button>
            <Button onClick={() => go("Report Review")}>Submit for review</Button>
          </>
        }
      />
      <div className="flow-strip report-steps">
        <div className="active">
          <b>1</b>
          <span>Month & assets</span>
        </div>
        <i />
        <div className="active">
          <b>2</b>
          <span>Values & evidence</span>
        </div>
        <i />
        <div>
          <b>3</b>
          <span>Review & submit</span>
        </div>
      </div>
      <div className="notice warning">
        <Icon name="info" />
        <div>
          <b>2 checks need attention</b>
          <span>
            VOO FX source is missing and Bitcoin closing quantity differs from custody evidence.
          </span>
        </div>
      </div>
      <section className="card form-card">
        <div className="section-head">
          <div>
            <span className="kicker">REPORTING PERIOD</span>
            <h2>Investment activity</h2>
          </div>
          <Badge tone="neutral">Manager: Mariam Yusuf</Badge>
        </div>
        <div className="form-grid">
          <label>
            <span>Opening investment value</span>
            <input defaultValue="₦6,090,000" />
          </label>
          <label>
            <span>Closing investment value</span>
            <input defaultValue="₦6,200,000" />
          </label>
          <label>
            <span>Purchases during month</span>
            <input defaultValue="₦120,000" />
          </label>
          <label>
            <span>Sales during month</span>
            <input defaultValue="₦50,000" />
          </label>
          <label>
            <span>Income received</span>
            <input defaultValue="₦25,000" />
          </label>
          <label>
            <span>Fees & expenses</span>
            <input defaultValue="₦10,000" />
          </label>
          <label>
            <span>Realized gains / losses</span>
            <input defaultValue="₦15,000" />
          </label>
          <label>
            <span>Unrealized gains / losses</span>
            <input defaultValue="₦95,000" />
          </label>
          <label className="full">
            <span>Explanation of major changes</span>
            <textarea defaultValue="Public equities increased during January. VOO purchases were funded from approved available cash; Dangote Cement paid a dividend." />
          </label>
        </div>
        <div className="upload">
          <Icon name="upload" />
          <b>Upload supporting documents</b>
          <span>PDF, PNG, JPG or CSV · Up to 10 MB each</span>
        </div>
      </section>
    </>
  );
}

function ReportReview() {
  const [status, setStatus] = useState("Under review");
  return (
    <>
      <PageHeader
        eyebrow="INDEPENDENT REVIEW"
        title="January 2025 investment report"
        description="Submitted by Mariam Yusuf on 31 Jan 2025 at 14:28."
        actions={<Badge tone={status === "Approved" ? "success" : "warning"}>{status}</Badge>}
      />
      <div className="review-comparison">
        <div>
          <span>PREVIOUS APPROVED</span>
          <b>₦6,090,000</b>
          <small>31 Dec 2024</small>
        </div>
        <Icon name="arrow" />
        <div>
          <span>SUBMITTED CLOSING VALUE</span>
          <b>₦6,200,000</b>
          <small className="positive">+₦110,000 · +1.81%</small>
        </div>
      </div>
      <section className="card">
        <div className="section-head">
          <h2>Report reconciliation</h2>
          <Badge tone="success">Totals reconcile</Badge>
        </div>
        <div className="reconcile-grid">
          {[
            ["Opening value", "₦6,090,000"],
            ["Net purchases", "+₦50,000"],
            ["Investment income", "+₦25,000"],
            ["Net gains", "+₦45,000"],
            ["Fees & expenses", "−₦10,000"],
            ["Closing value", "₦6,200,000"],
          ].map((x) => (
            <div key={x[0]}>
              <span>{x[0]}</span>
              <b>{x[1]}</b>
            </div>
          ))}
        </div>
      </section>
      <div className="notice">
        <Icon name="spark" />
        <div>
          <b>What happens after approval?</b>
          <span>
            Approved valuations feed the month-end NAV. After reconciliation, the official unit
            price is calculated and eligible subscriptions receive units.
          </span>
        </div>
      </div>
      <div className="sticky-actions">
        <Button kind="danger" onClick={() => setStatus("Disputed")}>
          Dispute
        </Button>
        <Button kind="secondary" onClick={() => setStatus("Clarification requested")}>
          Request clarification
        </Button>
        <Button onClick={() => setStatus("Approved")}>Approve report</Button>
      </div>
    </>
  );
}

function PaymentVerification({ onApprove }: { onApprove: () => void }) {
  const [status, setStatus] = useState("Awaiting review");
  return (
    <>
      <PageHeader
        eyebrow="PAYMENT VERIFICATION"
        title="Review contribution claim"
        description="Compare the member’s evidence with the receiving account before approval."
        actions={<Badge tone={status === "Approved" ? "success" : "warning"}>{status}</Badge>}
      />
      <div className="two-col">
        <section className="card form-card">
          <div className="profile-head">
            <Avatar name="Ngozi Udo" />
            <div>
              <h2>Ngozi Udo</h2>
              <p>January 2025 contribution</p>
            </div>
          </div>
          <div className="detail-grid">
            {[
              ["Amount", "₦25,000"],
              ["Payment date", "30 Jan 2025"],
              ["Reference", "GTB-842910"],
              ["Receiving account", "Group custody · GTBank"],
              ["Submitted", "30 Jan, 18:24"],
              ["Expected contribution", "₦25,000"],
            ].map((x) => (
              <div key={x[0]}>
                <span>{x[0]}</span>
                <b>{x[1]}</b>
              </div>
            ))}
          </div>
        </section>
        <section className="card evidence">
          <span className="kicker">SUPPORTING EVIDENCE</span>
          <div className="receipt">
            <Icon name="file" size={32} />
            <b>GTB-transfer-receipt.pdf</b>
            <span>218 KB · Uploaded by Chidi Eze</span>
            <Button kind="secondary" icon="eye">
              Preview evidence
            </Button>
          </div>
        </section>
      </div>
      <div className="notice">
        <Icon name="info" />
        <div>
          <b>Approval records a verified receipt</b>
          <span>
            The amount then awaits the next approved unit-pricing event. Approval does not issue
            units immediately.
          </span>
        </div>
      </div>
      <div className="sticky-actions">
        <Button kind="danger" onClick={() => setStatus("Rejected")}>
          Reject
        </Button>
        <Button kind="secondary" onClick={() => setStatus("Clarification requested")}>
          Request clarification
        </Button>
        <Button
          onClick={() => {
            setStatus("Approved");
            onApprove();
          }}
        >
          Approve receipt
        </Button>
      </div>
    </>
  );
}

function RecordTransaction() {
  const [type, setType] = useState("Purchase");
  return (
    <>
      <PageHeader
        eyebrow="INVESTMENT OPERATIONS"
        title="Record investment transaction"
        description="New transactions remain pending until the required independent approval is complete."
      />
      <section className="card form-card">
        <div className="type-picker">
          {["Purchase", "Sale", "Dividend", "Expense", "Valuation", "Adjustment"].map((x) => (
            <button className={type === x ? "active" : ""} onClick={() => setType(x)} key={x}>
              {x}
            </button>
          ))}
        </div>
        <div className="form-grid">
          <label>
            <span>Investment</span>
            <select>
              <option>US Equity Index (VOO)</option>
              <option>Dangote Cement</option>
            </select>
          </label>
          <label>
            <span>Transaction date</span>
            <input type="date" defaultValue="2025-02-07" />
          </label>
          <label>
            <span>{type === "Sale" ? "Sale proceeds" : "Transaction amount"}</span>
            <input placeholder="₦0.00" />
          </label>
          <label>
            <span>Quantity</span>
            <input placeholder="0.000000" />
          </label>
          <label>
            <span>Fees</span>
            <input placeholder="₦0.00" />
          </label>
          <label>
            <span>Custody / brokerage account</span>
            <select>
              <option>Stanbic IBTC Brokerage</option>
            </select>
          </label>
          <label className="full">
            <span>Notes</span>
            <textarea placeholder="Explain the purpose and any relevant context" />
          </label>
        </div>
        <div className="upload">
          <Icon name="upload" />
          <b>Add transaction evidence</b>
          <span>Broker confirmation, receipt, statement, or valuation document</span>
        </div>
        <div className="panel-footer">
          <span>This will create a pending approval item.</span>
          <Button>Submit transaction</Button>
        </div>
      </section>
    </>
  );
}

function GenericReport({ title }: { title: string }) {
  return (
    <>
      <PageHeader
        eyebrow="APPROVED FINANCIAL RECORD"
        title={title}
        description="Reporting period: Year ended 31 December 2024"
        actions={
          <>
            <Button kind="secondary" icon="download">
              CSV
            </Button>
            <Button icon="download">PDF</Button>
          </>
        }
      />
      <div className="metrics four">
        <Metric label="Capital contributions" value="₦6.0m" />
        <Metric label="Portfolio returns" value="+₦800,000" />
        <Metric label="Realized profit" value="₦125,000" />
        <Metric label="Unrealized gains" value="₦550,000" />
      </div>
      <section className="card performance-chart">
        <div className="section-head">
          <div>
            <span className="kicker">ANNUAL REVIEW</span>
            <h2>Capital and investment value</h2>
          </div>
        </div>
        <LineChart />
      </section>
      <section className="card explain">
        <h2>Reinvestment planning</h2>
        <p>
          Members can review approved performance and discuss the next year’s allocation. This
          prototype does not execute investments or transfer funds.
        </p>
      </section>
    </>
  );
}

function SubmitPayment({ close }: { close: () => void }) {
  const [step, setStep] = useState(1);
  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && close()}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="payment-title">
        <div className="modal-head">
          <div>
            <span className="kicker">MEMBER PAYMENT</span>
            <h2 id="payment-title">
              {step === 3 ? "Payment submitted" : "Submit contribution payment"}
            </h2>
          </div>
          <button className="icon-btn" onClick={close} aria-label="Close">
            <Icon name="close" />
          </button>
        </div>
        {step === 1 && (
          <>
            <div className="form-grid">
              <label>
                <span>Contribution month</span>
                <select>
                  <option>January 2025</option>
                  <option>February 2025</option>
                </select>
              </label>
              <label>
                <span>Amount</span>
                <input defaultValue="₦25,000" />
              </label>
              <label>
                <span>Payment date</span>
                <input type="date" defaultValue="2025-02-07" />
              </label>
              <label>
                <span>Receiving account</span>
                <select>
                  <option>Group custody · GTBank · 0482</option>
                </select>
              </label>
              <label className="full">
                <span>Payment reference</span>
                <input placeholder="e.g. GTB-938201" />
              </label>
              <label className="full">
                <span>Note (optional)</span>
                <textarea placeholder="Add any useful information for the reviewer" />
              </label>
            </div>
            <div className="upload">
              <Icon name="upload" />
              <b>Add payment receipt</b>
              <span>Optional · PDF, PNG, or JPG up to 10 MB</span>
            </div>
            <div className="modal-actions">
              <Button kind="secondary" onClick={close}>
                Cancel
              </Button>
              <Button onClick={() => setStep(2)}>
                Review payment <Icon name="arrow" />
              </Button>
            </div>
          </>
        )}
        {step === 2 && (
          <>
            <div className="review-box">
              <span>AMOUNT SUBMITTED</span>
              <strong>₦25,000</strong>
              <div>
                <span>For</span>
                <b>January 2025</b>
              </div>
              <div>
                <span>Receiving account</span>
                <b>Group custody · GTBank · 0482</b>
              </div>
              <div>
                <span>Status after submission</span>
                <Badge tone="warning">Awaiting verification</Badge>
              </div>
            </div>
            <div className="notice compact">
              <Icon name="info" />
              <span>
                Your claim does not count as received cash until an independent reviewer verifies
                it.
              </span>
            </div>
            <div className="modal-actions">
              <Button kind="secondary" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button onClick={() => setStep(3)}>Confirm & submit</Button>
            </div>
          </>
        )}
        {step === 3 && (
          <div className="success-state">
            <span className="success-icon">
              <Icon name="check" size={28} />
            </span>
            <h3>Your payment claim was submitted</h3>
            <p>
              An independent reviewer will compare it with the receiving account. You’ll be notified
              when it is verified.
            </p>
            <div className="status-path">
              <Badge tone="success">Submitted</Badge>
              <i />
              <Badge tone="warning">Awaiting verification</Badge>
              <i />
              <Badge>Unit allocation</Badge>
            </div>
            <Button onClick={close}>Return to contributions</Button>
          </div>
        )}
      </div>
    </div>
  );
}

function Notifications({ close }: { close: () => void }) {
  return (
    <div className="notification-panel">
      <div className="section-head">
        <div>
          <span className="kicker">ACTIVITY</span>
          <h2>Notifications</h2>
        </div>
        <button className="icon-btn" onClick={close}>
          <Icon name="close" />
        </button>
      </div>
      {activities
        .concat([
          {
            title: "Contribution due soon",
            detail: "February contribution · ₦25,000 due 20 Feb",
            time: "2 days ago",
            icon: "clock",
          },
        ])
        .map((a, i) => (
          <button className={`notification ${i < 2 ? "unread" : ""}`} key={a.title}>
            <span className="activity-icon">
              <Icon name={a.icon as IconName} />
            </span>
            <div>
              <b>{a.title}</b>
              <span>{a.detail}</span>
              <time>{a.time}</time>
            </div>
          </button>
        ))}
    </div>
  );
}
function Empty({ title, text }: { title: string; text: string }) {
  return (
    <div className="empty">
      <span className="icon-box">
        <Icon name="check" />
      </span>
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}

function Auth({ onEnter }: { onEnter: () => void }) {
  const [mode, setMode] = useState("signin");
  return (
    <div className="auth-shell">
      <div className="auth-brand">
        <Logo />
        <div className="auth-copy">
          <Badge tone="dark">PRIVATE WEALTH COLLECTIVE</Badge>
          <h1>
            Build wealth together.
            <br />
            <em>Track every step.</em>
          </h1>
          <p>
            A clear, accountable home for contributions, shared investments, ownership, and fund
            custody.
          </p>
          <div className="trust-points">
            <span>
              <Icon name="check" /> Every naira accounted for
            </span>
            <span>
              <Icon name="check" /> Ownership based on timing and units
            </span>
            <span>
              <Icon name="check" /> Every decision traceable
            </span>
          </div>
        </div>
        <small>Private, invitation-only access · Prototype data</small>
      </div>
      <main className="auth-form">
        <div className="mobile-auth-logo">
          <Logo />
        </div>
        {mode === "signin" ? (
          <>
            <span className="kicker">WELCOME BACK</span>
            <h2>Sign in to Poverty Die</h2>
            <p>Access your group’s verified financial position.</p>
            <label>
              <span>Email address</span>
              <input type="email" defaultValue="amara@example.com" />
            </label>
            <label>
              <span>Password</span>
              <input type="password" defaultValue="povertydie" />
            </label>
            <div className="auth-row">
              <label className="checkbox">
                <input type="checkbox" /> Keep me signed in
              </label>
              <button className="text-link" onClick={() => setMode("reset")}>
                Forgot password?
              </button>
            </div>
            <Button onClick={onEnter}>
              Sign in <Icon name="arrow" />
            </Button>
            <div className="auth-divider">
              <span>INVITED TO THE GROUP?</span>
            </div>
            <Button kind="secondary" onClick={() => setMode("invite")}>
              Accept an invitation
            </Button>
          </>
        ) : mode === "invite" ? (
          <>
            <button className="back" onClick={() => setMode("signin")}>
              ← Back to sign in
            </button>
            <span className="kicker">PRIVATE INVITATION</span>
            <h2>Join your investment group</h2>
            <p>Enter the invitation code sent by your administrator.</p>
            <label>
              <span>Invitation code</span>
              <input placeholder="PD-XXXX-XXXX" />
            </label>
            <Button onClick={onEnter}>Review invitation</Button>
          </>
        ) : (
          <>
            <button className="back" onClick={() => setMode("signin")}>
              ← Back to sign in
            </button>
            <span className="kicker">ACCOUNT RECOVERY</span>
            <h2>Reset your password</h2>
            <p>We’ll send a secure reset link to your registered email.</p>
            <label>
              <span>Email address</span>
              <input type="email" placeholder="you@example.com" />
            </label>
            <Button onClick={() => setMode("signin")}>Send reset link</Button>
          </>
        )}
        <small className="secure">
          <Icon name="lock" /> Simulated authentication for this frontend prototype
        </small>
      </main>
    </div>
  );
}

function Onboarding({ finish }: { finish: () => void }) {
  const [step, setStep] = useState(0);
  const data = [
    {
      title: "Welcome to Poverty Die",
      text: "You’ve been invited to join a private group of 24 friends building long-term wealth together.",
      icon: "users",
    },
    {
      title: "Contribute ₦25,000 each month",
      text: "Your obligation is due on the 20th. A submitted payment only counts after an independent reviewer verifies receipt.",
      icon: "wallet",
    },
    {
      title: "Your money becomes units",
      text: "At each approved monthly pricing event, eligible contributions buy units. Investing earlier can produce a different return from investing later.",
      icon: "spark",
    },
    {
      title: "See where every figure came from",
      text: "This is a transparent private club. Every member can see approved contributions, units, investment values, and earnings for everyone in the group.",
      icon: "shield",
    },
  ];
  const d = data[step];
  return (
    <div className="onboarding">
      <header>
        <Logo />
        <button className="text-link" onClick={finish}>
          Skip for now
        </button>
      </header>
      <main>
        <div className="onboard-visual">
          <div className="orbit o1" />
          <div className="orbit o2" />
          <span>
            <Icon name={d.icon as IconName} size={42} />
          </span>
          {step === 2 && (
            <div className="unit-example">
              <div>
                <b>₦100,000</b>
                <small>contribution</small>
              </div>
              <i>÷ ₦1,000</i>
              <div>
                <b>100 units</b>
                <small>ownership issued</small>
              </div>
            </div>
          )}
        </div>
        <div className="onboard-copy">
          <span className="kicker">STEP {step + 1} OF 4</span>
          <h1>{d.title}</h1>
          <p>{d.text}</p>
          {step === 0 && (
            <div className="invite-card">
              <Avatar name="Amara Okafor" />
              <div>
                <span>INVITED BY</span>
                <b>Amara Okafor</b>
                <small>Administrator · Poverty Die</small>
              </div>
            </div>
          )}
          <div className="onboard-controls">
            <div className="dots">
              {data.map((_, i) => (
                <i className={i === step ? "active" : ""} key={i} />
              ))}
            </div>
            <Button onClick={() => (step === 3 ? finish() : setStep(step + 1))}>
              {step === 3 ? "Go to dashboard" : "Continue"} <Icon name="arrow" />
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function App() {
  const [authed, setAuthed] = useState(false),
    [onboarding, setOnboarding] = useState(false),
    [page, setPage] = useState("Overview"),
    [dark, setDark] = useState(false),
    [payment, setPayment] = useState(false),
    [notifications, setNotifications] = useState(false),
    [mobileMenu, setMobileMenu] = useState(false),
    [paymentApproved, setPaymentApproved] = useState(false);
  const go = (p: string) => {
    if (p === "Submit Payment") {
      setPayment(true);
      return;
    }
    setPage(p);
    setMobileMenu(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const content = useMemo(() => {
    if (page === "Overview") return <Overview go={go} paymentApproved={paymentApproved} />;
    if (page === "Contributions")
      return <Contributions go={go} paymentApproved={paymentApproved} />;
    if (page === "My Earnings") return <Earnings />;
    if (page === "Investments") return <Investments go={go} />;
    if (page === "Performance") return <Performance />;
    if (page === "Custody") return <Custody go={go} />;
    if (page === "Members") return <Members go={go} paymentApproved={paymentApproved} />;
    if (page === "Ledger") return <Ledger />;
    if (page === "Reports") return <Reports go={go} />;
    if (page === "Approvals") return <Approvals go={go} />;
    if (page === "Payment Verification")
      return <PaymentVerification onApprove={() => setPaymentApproved(true)} />;
    if (page === "Settings")
      return <Settings go={(p) => (p === "Onboarding" ? setOnboarding(true) : go(p))} />;
    return <DetailPage page={page} go={go} />;
  }, [page, paymentApproved]);
  if (!authed)
    return (
      <Auth
        onEnter={() => {
          setAuthed(true);
          setOnboarding(true);
        }}
      />
    );
  if (onboarding) return <Onboarding finish={() => setOnboarding(false)} />;
  const mobileNav = [
    ["Overview", "home"],
    ["Contributions", "wallet"],
    ["Investments", "pie"],
    ["Members", "users"],
  ] as [string, IconName][];
  return (
    <div className={dark ? "app dark" : "app"}>
      <aside className={mobileMenu ? "sidebar open" : "sidebar"}>
        <div className="sidebar-top">
          <Logo />
          <button className="mobile-close" onClick={() => setMobileMenu(false)}>
            <Icon name="close" />
          </button>
        </div>
        <nav>
          {primaryNav.map(([x, i]) => (
            <button className={page === x ? "active" : ""} key={x} onClick={() => go(x)}>
              <Icon name={i} />
              <span>{x === "Overview" ? "Home" : x}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="verified-mini">
            <Icon name="shield" />
            <div>
              <b>Figures verified</b>
              <span>31 Jan 2025</span>
            </div>
          </div>
          <button className="profile-menu" onClick={() => go("Settings")}>
            <Avatar name="Amara Okafor" size="sm" />
            <div>
              <b>Amara Okafor</b>
              <span>Profile & group settings</span>
            </div>
            <Icon name="more" />
          </button>
        </div>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <button className="hamburger" onClick={() => setMobileMenu(true)}>
            <Icon name="menu" />
          </button>
          <div className="mobile-logo">
            <Logo small />
          </div>
          <div className="breadcrumbs">
            <span>Poverty Die</span>
            <Icon name="chevron" />
            <b>{page.startsWith("Asset:") ? "Investment details" : page}</b>
          </div>
          <div className="top-actions">
            <button className="icon-btn search-top">
              <Icon name="search" />
              <span>Search</span>
              <kbd>⌘ K</kbd>
            </button>
            <button className="icon-btn" onClick={() => setDark(!dark)} aria-label="Toggle theme">
              <Icon name={dark ? "sun" : "moon"} />
            </button>
            <button
              className="icon-btn notification-button"
              onClick={() => setNotifications(!notifications)}
              aria-label="Notifications"
            >
              <Icon name="bell" />
              <i />
            </button>
            <button className="mobile-avatar">
              <Avatar name="Amara Okafor" size="sm" />
            </button>
          </div>
        </header>
        <main className="content" id="main">
          {content}
        </main>
      </div>
      <nav className="bottom-nav">
        {mobileNav.map(([x, i]) => (
          <button className={page === x ? "active" : ""} key={x} onClick={() => go(x)}>
            <Icon name={i} />
            <span>{x === "Overview" ? "Home" : x}</span>
          </button>
        ))}
      </nav>
      {payment && (
        <SubmitPayment
          close={() => {
            setPayment(false);
            setPage("Contributions");
          }}
        />
      )}
      {notifications && (
        <>
          <div className="panel-scrim" onClick={() => setNotifications(false)} />
          <Notifications close={() => setNotifications(false)} />
        </>
      )}
    </div>
  );
}
