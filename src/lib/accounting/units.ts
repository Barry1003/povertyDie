import { koboToDecimal, toKobo } from "../group/money";

/**
 * Pure, deterministic accounting PREVIEW. No database writes, no approvals.
 *
 * Units are integer fixed-point (8 decimal places); money uses integer kobo.
 * A member's unrealized value is based on approved NAV and issued units,
 * never on total submitted/verified transfers alone.
 *
 * Existing contributors must receive the pre-money price. The NAV supplied
 * must include newly verified but UNUNITIZED contributions in its cash value;
 * subtract those deposits before pricing new units to avoid dilution.
 */
export const UNITS_SCALE = 100_000_000n;
export const BOOTSTRAP_PRICE_KOBO = 100_000n; // ₦1,000.00 per unit

export type EligibleCapital = {
  contributionId: string;
  memberId: string;
  amountNgn: string;
  status: "verified";
  currency: "NGN";
};

export type NavDraft = {
  confirmedCashNgn: string;
  assetMarksNgn: Array<{ assetId: string; valueNgn: string }>;
  liabilitiesNgn: string;
  previousTotalUnits: string;
  eligibleUnissuedContributions: EligibleCapital[];
};

export type UnitAllocationPreview = {
  contributionId: string;
  memberId: string;
  amountNgn: string;
  units: string;
};

export type ValuationPreview = {
  assetsNgn: string;
  cashNgn: string;
  liabilitiesNgn: string;
  netAssetsNgn: string;
  eligibleCapitalNgn: string;
  preMoneyNavNgn: string;
  unitPriceBeforeNgn: string;
  unitPriceAfterNgn: string;
  previousTotalUnits: string;
  totalUnitsAfter: string;
  allocations: UnitAllocationPreview[];
};

export function parseUnits(value: string): bigint {
  if (typeof value !== "string" || !/^(0|[1-9]\d{0,20})(?:\.\d{1,8})?$/.test(value)) {
    throw new Error("Invalid fixed-precision unit value");
  }
  const [whole, fractional = ""] = value.split(".");
  return BigInt(whole) * UNITS_SCALE + BigInt(fractional.padEnd(8, "0"));
}

export function unitsToDecimal(units: bigint): string {
  if (units < 0n) throw new Error("Negative units are not supported");
  return `${units / UNITS_SCALE}.${String(units % UNITS_SCALE).padStart(8, "0")}`;
}

/** Deterministic half-up rounding for DISPLAY ONLY, never issuance. */
function fixedRatio(numerator: bigint, denominator: bigint, places: number): string {
  if (numerator < 0n || denominator <= 0n || places < 0 || places > 12) {
    throw new Error("Invalid unit price ratio");
  }
  const scale = 10n ** BigInt(places);
  const scaled = (numerator * scale * 2n + denominator) / (2n * denominator);
  if (!places) return scaled.toString();
  return `${scaled / scale}.${String(scaled % scale).padStart(places, "0")}`;
}

export function formatUnitPriceNgn(navKobo: bigint, unitsScaled: bigint): string {
  if (navKobo <= 0n || unitsScaled <= 0n) throw new Error("NAV and outstanding units must be positive");
  // Price per *one* unit in naira = NAV(kobo) * 10^8 / (unitsScaled * 100).
  return fixedRatio(navKobo * UNITS_SCALE, unitsScaled * 100n, 6);
}

function nonNegativeMoney(value: string): bigint {
  const amount = toKobo(value);
  if (amount < 0n) throw new Error("Negative assets or liabilities are not valid");
  return amount;
}

export function previewValuation(input: NavDraft): ValuationPreview {
  if (!Array.isArray(input.assetMarksNgn) ||
      !Array.isArray(input.eligibleUnissuedContributions)) {
    throw new Error("Valuation lines and contributions must be arrays");
  }

  const cash = nonNegativeMoney(input.confirmedCashNgn);
  const liabilities = nonNegativeMoney(input.liabilitiesNgn);
  const previousUnits = parseUnits(input.previousTotalUnits);

  const assetsSeen = new Set<string>();
  let assets = 0n;
  for (const mark of input.assetMarksNgn) {
    if (!mark.assetId || assetsSeen.has(mark.assetId)) {
      throw new Error("Asset marks must be uniquely identified");
    }
    assetsSeen.add(mark.assetId);
    assets += nonNegativeMoney(mark.valueNgn);
  }

  const claimsSeen = new Set<string>();
  let eligible = 0n;
  for (const claim of input.eligibleUnissuedContributions) {
    if (!claim.contributionId || !claim.memberId ||
        claimsSeen.has(claim.contributionId) ||
        claim.status !== "verified" || claim.currency !== "NGN") {
      throw new Error("Only distinct, verified, NGN contributions are eligible");
    }
    claimsSeen.add(claim.contributionId);
    const contribution = toKobo(claim.amountNgn);
    if (contribution <= 0n) throw new Error("Eligible capital must be positive");
    eligible += contribution;
  }

  if (cash < eligible) {
    throw new Error("Confirmed cash must cover all unallocated contributions");
  }

  const nav = assets + cash - liabilities;
  const preMoneyNav = nav - eligible;
  if (nav < 0n || preMoneyNav < 0n) {
    throw new Error("Net assets do not cover recorded liabilities and subscriptions");
  }
  if (previousUnits === 0n && preMoneyNav !== 0n) {
    throw new Error("Founding units cannot be issued while unexplained pre-existing net assets exist");
  }
  if (previousUnits > 0n && preMoneyNav <= 0n) {
    throw new Error("Cannot price a new subscription with zero or negative pre-money NAV");
  }

  const priceNumerator = previousUnits === 0n ? BOOTSTRAP_PRICE_KOBO : preMoneyNav;
  const priceDenominator = previousUnits === 0n ? UNITS_SCALE : previousUnits;
  const allocations: UnitAllocationPreview[] = [];
  let issued = 0n;

  for (const claim of input.eligibleUnissuedContributions) {
    const amount = toKobo(claim.amountNgn);
    // Issue whole 1e-8 units at the SAME pre-money price for this event.
    const minted = (amount * priceDenominator) / priceNumerator;
    if (minted <= 0n) {
      throw new Error("Contribution is too small to issue one 1e-8 unit");
    }
    issued += minted;
    allocations.push({
      contributionId: claim.contributionId,
      memberId: claim.memberId,
      amountNgn: claim.amountNgn,
      units: unitsToDecimal(minted),
    });
  }

  const resultingUnits = previousUnits + issued;
  if (resultingUnits === 0n) {
    throw new Error("A valuation cannot have zero issued units");
  }

  return {
    assetsNgn: koboToDecimal(assets),
    cashNgn: koboToDecimal(cash),
    liabilitiesNgn: koboToDecimal(liabilities),
    netAssetsNgn: koboToDecimal(nav),
    eligibleCapitalNgn: koboToDecimal(eligible),
    preMoneyNavNgn: koboToDecimal(preMoneyNav),
    unitPriceBeforeNgn: previousUnits === 0n
      ? koboToDecimal(BOOTSTRAP_PRICE_KOBO)
      : formatUnitPriceNgn(preMoneyNav, previousUnits),
    unitPriceAfterNgn: formatUnitPriceNgn(nav, resultingUnits),
    previousTotalUnits: unitsToDecimal(previousUnits),
    totalUnitsAfter: unitsToDecimal(resultingUnits),
    allocations,
  };
}

/**
 * Rounded down to the nearest kobo; residual rounding remains in collective
 * NAV and cannot be allocated to members by repeated decimal rounding.
 */
export function attributedValueKobo(navKobo: bigint, memberUnits: bigint, totalUnits: bigint): bigint {
  if (navKobo < 0n || memberUnits < 0n || totalUnits <= 0n || memberUnits > totalUnits) {
    throw new Error("Invalid ownership or NAV");
  }
  return (navKobo * memberUnits) / totalUnits;
}

/** Unrealized gain only. Distributions/withdrawals require a separate ledger. */
export function unrealizedGainKobo(attributedValue: bigint, memberCostBasis: bigint): bigint {
  return attributedValue - memberCostBasis;
}
