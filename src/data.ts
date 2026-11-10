export type Status =
  | "Approved"
  | "Verified"
  | "Pending"
  | "Overdue"
  | "Draft"
  | "Published"
  | "Active";

export const finance = {
  nav: 6_800_000,
  unitPrice: 1_250,
  investmentValue: 6_200_000,
  availableCash: 600_000,
  restrictedCash: 0,
  liabilities: 0,
  totalUnits: 5_440,
  capitalContributed: 6_000_000,
  expectedMonthly: 600_000,
  verifiedMonthly: 490_000,
  outstandingMonthly: 110_000,
  member: {
    contributions: 350_000,
    unitized: 325_000,
    pending: 25_000,
    units: 284.1667,
    value: 355_208,
    gain: 30_208,
    distributions: 4_500,
    ownership: 5.2237,
  },
};

export const history = [
  { month: "Jul", value: 4.72, capital: 4.5, unit: 1_105 },
  { month: "Aug", value: 5.04, capital: 4.8, unit: 1_132 },
  { month: "Sep", value: 5.33, capital: 5.1, unit: 1_151 },
  { month: "Oct", value: 5.72, capital: 5.4, unit: 1_182 },
  { month: "Nov", value: 6.08, capital: 5.65, unit: 1_208 },
  { month: "Dec", value: 6.44, capital: 5.8, unit: 1_232 },
  { month: "Jan", value: 6.8, capital: 6.0, unit: 1_250 },
];

export const holdings = [
  {
    name: "Nigerian Treasury ETF",
    symbol: "VETIVA",
    type: "ETF",
    value: 1_550_000,
    cost: 1_400_000,
    change: 10.71,
    allocation: 25,
    currency: "NGN",
    updated: "31 Jan 2025",
  },
  {
    name: "Dangote Cement",
    symbol: "DANGCEM · NGX",
    type: "Stock",
    value: 1_250_000,
    cost: 1_100_000,
    change: 13.64,
    allocation: 20.2,
    currency: "NGN",
    updated: "31 Jan 2025",
  },
  {
    name: "US Equity Index",
    symbol: "VOO · NYSE",
    type: "ETF",
    value: 1_150_000,
    cost: 1_050_000,
    change: 9.52,
    allocation: 18.5,
    currency: "USD",
    updated: "31 Jan 2025",
  },
  {
    name: "Lekki Retail Property",
    symbol: "Physical asset",
    type: "Physical",
    value: 900_000,
    cost: 850_000,
    change: 5.88,
    allocation: 14.5,
    currency: "NGN",
    updated: "28 Jan 2025",
  },
  {
    name: "Northstar Logistics",
    symbol: "Private business · 12%",
    type: "Business",
    value: 800_000,
    cost: 750_000,
    change: 6.67,
    allocation: 12.9,
    currency: "NGN",
    updated: "25 Jan 2025",
  },
  {
    name: "Bitcoin",
    symbol: "BTC · Cold custody",
    type: "Crypto",
    value: 550_000,
    cost: 500_000,
    change: 10,
    allocation: 8.9,
    currency: "USD",
    updated: "31 Jan 2025",
  },
];

const firstNames = [
  "Amara",
  "Tobi",
  "Chidi",
  "Zainab",
  "Femi",
  "Ifeoma",
  "Ade",
  "Mariam",
  "Dayo",
  "Kemi",
  "Obinna",
  "Aisha",
  "Seyi",
  "Nneka",
  "Kunle",
  "Lola",
  "Emeka",
  "Bisi",
  "Wale",
  "Adaeze",
  "Yemi",
  "Fatima",
  "Ola",
  "Ngozi",
  "Bola",
  "Uche",
  "Tunde",
  "Halima",
  "Segun",
  "Rita",
];
const lastNames = [
  "Okafor",
  "Adebayo",
  "Eze",
  "Bello",
  "Adeyemi",
  "Nwosu",
  "Balogun",
  "Yusuf",
  "Ogunleye",
  "Afolayan",
  "Ibrahim",
  "Chukwu",
  "Bakare",
  "Aliyu",
  "Daniels",
  "Obi",
  "Lawal",
  "Onwuka",
  "Sule",
  "George",
  "Ojo",
  "Okeke",
  "Musa",
  "Udo",
  "Akintola",
  "Nnamdi",
  "Salami",
  "Olowu",
  "Ekong",
  "Abubakar",
];
export const members = firstNames.slice(0, 24).map((first, i, list) => {
  const paid = i < 18 ? 25_000 : i < 22 ? 10_000 : 0;
  const earlierUnits = list
    .slice(0, i)
    .reduce((total, _, index) => total + Math.round((284.1667 - index * 5) * 10_000) / 10_000, 0);
  const units =
    i === list.length - 1
      ? finance.totalUnits - earlierUnits
      : Math.round((284.1667 - i * 5) * 10_000) / 10_000;
  const totalContributed = Math.round((units * 1_100) / 25_000) * 25_000;
  const earlierAttributedValue = list
    .slice(0, i)
    .reduce(
      (total, _, index) =>
        total +
        Math.round((Math.round((284.1667 - index * 5) * 10_000) / 10_000) * finance.unitPrice),
      0,
    );
  const attributedValue =
    i === list.length - 1
      ? finance.nav - earlierAttributedValue
      : Math.round(units * finance.unitPrice);
  return {
    id: i + 1,
    name: `${first} ${lastNames[i]}`,
    initials: `${first[0]}${lastNames[i][0]}`,
    role:
      i === 0
        ? "Administrator"
        : i === 3
          ? "Custodian"
          : i === 7
            ? "Investment Manager"
            : i === 11
              ? "Financial Verifier"
              : "Member",
    paid,
    due: 25_000 - paid,
    status: paid === 25_000 ? "Paid" : paid ? "Part-paid" : "Due",
    joined: i < 18 ? "Mar 2022" : i < 25 ? "Sep 2023" : "Feb 2024",
    units,
    totalContributed,
    attributedValue,
    gain: attributedValue - totalContributed,
    ownership: (units / finance.totalUnits) * 100,
  };
});

export const activities = [
  {
    title: "January unit price published",
    detail: "₦1,250.00 · 392 units issued",
    time: "Today, 09:42",
    icon: "spark",
  },
  {
    title: "Payment verified",
    detail: "Chidi Eze · January contribution",
    time: "Yesterday, 16:08",
    icon: "check",
  },
  {
    title: "Monthly report approved",
    detail: "January 2025 · reviewed by Aisha Ibrahim",
    time: "31 Jan, 18:20",
    icon: "doc",
  },
  {
    title: "Custody reconciliation submitted",
    detail: "₦600,000 confirmed cash position",
    time: "30 Jan, 14:11",
    icon: "shield",
  },
];

export const ledger = [
  {
    date: "31 Jan 2025",
    type: "Unit issuance",
    ref: "UI-2501-042",
    account: "Member subscriptions",
    debit: "₦490,000.00",
    credit: "—",
    status: "Posted",
    actor: "System",
  },
  {
    date: "31 Jan 2025",
    type: "Valuation",
    ref: "VAL-2501-018",
    account: "VOO · NYSE",
    debit: "₦1,240,400.00",
    credit: "—",
    status: "Posted",
    actor: "Tobi Adebayo",
  },
  {
    date: "30 Jan 2025",
    type: "Contribution",
    ref: "PAY-2501-188",
    account: "Chidi Eze",
    debit: "₦25,000.00",
    credit: "—",
    status: "Posted",
    actor: "Aisha Ibrahim",
  },
  {
    date: "29 Jan 2025",
    type: "Expense",
    ref: "EXP-2501-009",
    account: "Brokerage fees",
    debit: "—",
    credit: "₦10,000.00",
    status: "Posted",
    actor: "Tobi Adebayo",
  },
  {
    date: "28 Jan 2025",
    type: "Dividend",
    ref: "DIV-2501-004",
    account: "DANGCEM",
    debit: "₦25,000.00",
    credit: "—",
    status: "Posted",
    actor: "Tobi Adebayo",
  },
  {
    date: "24 Jan 2025",
    type: "Contribution",
    ref: "PAY-2501-171",
    account: "Zainab Bello",
    debit: "₦25,000.00",
    credit: "—",
    status: "Posted",
    actor: "Aisha Ibrahim",
  },
];

export const reports = [
  {
    period: "January 2025",
    status: "Published",
    manager: "Mariam Yusuf",
    value: "₦6.20m",
    change: "+₦110,000",
    date: "31 Jan 2025",
  },
  {
    period: "December 2024",
    status: "Published",
    manager: "Mariam Yusuf",
    value: "₦5.82m",
    change: "+₦96,000",
    date: "31 Dec 2024",
  },
  {
    period: "November 2024",
    status: "Published",
    manager: "Tobi Adebayo",
    value: "₦5.51m",
    change: "+₦84,000",
    date: "30 Nov 2024",
  },
];

export const money = (value: number, compact = false) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: compact ? 1 : 0,
    notation: compact ? "compact" : "standard",
  }).format(value);
