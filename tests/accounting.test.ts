import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  attributedValueKobo, formatUnitPriceNgn, parseUnits,
  previewValuation, unitsToDecimal, unrealizedGainKobo,
} from "../src/lib/accounting/units";
import { toKobo } from "../src/lib/group/money";

const verified = (id: string, member: string, amountNgn: string) => ({
  contributionId: id,
  memberId: member,
  amountNgn,
  currency: "NGN" as const,
  status: "verified" as const,
});

describe("unit-based investment ownership", () => {
  it("issues founding units at ₦1,000 with no unexplained assets", () => {
    const report = previewValuation({
      confirmedCashNgn: "75000.00", assetMarksNgn: [], liabilitiesNgn: "0.00",
      previousTotalUnits: "0.00000000",
      eligibleUnissuedContributions: [
        verified("c1", "ade", "50000.00"),
        verified("c2", "bisi", "25000.00"),
      ],
    });
    assert.equal(report.unitPriceBeforeNgn, "1000.00");
    assert.equal(report.totalUnitsAfter, "75.00000000");
    assert.deepEqual(report.allocations.map(a => a.units), ["50.00000000", "25.00000000"]);
    assert.equal(report.unitPriceAfterNgn, "1000.000000");
  });

  it("new capital does not create profit or dilute existing members", () => {
    const report = previewValuation({
      confirmedCashNgn: "100000.00",
      assetMarksNgn: [{ assetId: "holding-a", valueNgn: "100000.00" }],
      liabilitiesNgn: "0.00",
      previousTotalUnits: "100.00000000",
      eligibleUnissuedContributions: [verified("c3", "new-member", "100000.00")],
    });
    assert.equal(report.preMoneyNavNgn, "100000.00");
    assert.equal(report.totalUnitsAfter, "200.00000000");
    assert.equal(report.unitPriceBeforeNgn, "1000.000000");
    assert.equal(report.unitPriceAfterNgn, "1000.000000");
    assert.equal(attributedValueKobo(toKobo(report.netAssetsNgn), parseUnits("100.00000000"), parseUnits(report.totalUnitsAfter)), toKobo("100000.00"));
  });

  it("later contributions buy fewer units after an investment gain", () => {
    const report = previewValuation({
      confirmedCashNgn: "25000.00",
      assetMarksNgn: [{ assetId: "asset", valueNgn: "120000.00" }],
      liabilitiesNgn: "0.00",
      previousTotalUnits: "100.00000000",
      eligibleUnissuedContributions: [verified("c2", "late-investor", "25000.00")],
    });
    assert.equal(report.unitPriceBeforeNgn, "1200.000000");
    assert.equal(report.allocations[0].units, "20.83333333");
    assert.equal(report.totalUnitsAfter, "120.83333333");
    assert.equal(report.unitPriceAfterNgn, "1200.000000");
  });

  it("supports investment losses without misreporting contributions as earnings", () => {
    const report = previewValuation({
      confirmedCashNgn: "50000.00",
      assetMarksNgn: [{ assetId: "asset", valueNgn: "50000.00" }],
      liabilitiesNgn: "0.00",
      previousTotalUnits: "100.00000000",
      eligibleUnissuedContributions: [verified("new", "late", "50000.00")],
    });
    assert.equal(report.unitPriceBeforeNgn, "500.000000");
    assert.equal(report.totalUnitsAfter, "200.00000000");
    const attributed = attributedValueKobo(toKobo(report.netAssetsNgn), parseUnits("100"), parseUnits(report.totalUnitsAfter));
    assert.equal(attributed, toKobo("50000.00"));
    assert.equal(unrealizedGainKobo(attributed, toKobo("100000.00")), -toKobo("50000.00"));
  });

  it("separates liabilities and contribution claims from pre-money NAV", () => {
    const report = previewValuation({
      confirmedCashNgn: "45000.00",
      assetMarksNgn: [{ assetId: "asset", valueNgn: "100000.00" }],
      liabilitiesNgn: "20000.00",
      previousTotalUnits: "100.00000000",
      eligibleUnissuedContributions: [verified("new", "member", "25000.00")],
    });
    assert.equal(report.netAssetsNgn, "125000.00");
    assert.equal(report.preMoneyNavNgn, "100000.00");
    assert.equal(report.totalUnitsAfter, "125.00000000");
  });

  it("rejects pending contributions, duplicate claims and unsupported currency", () => {
    const base = {
      confirmedCashNgn: "10000.00", assetMarksNgn: [], liabilitiesNgn: "0.00",
      previousTotalUnits: "0.00000000",
    };
    assert.throws(() => previewValuation({
      ...base, eligibleUnissuedContributions: [{
        ...verified("c", "u", "10000.00"), status: "submitted" as "verified",
      }],
    }), /verified/);
    assert.throws(() => previewValuation({
      ...base, eligibleUnissuedContributions: [
        verified("c", "u", "5000.00"), verified("c", "u", "5000.00"),
      ],
    }), /distinct/);
    assert.throws(() => previewValuation({
      ...base, eligibleUnissuedContributions: [{
        ...verified("c", "u", "10000.00"), currency: "USD" as "NGN",
      }],
    }), /NGN/);
  });

  it("prevents over-issuance when bank cash cannot cover unallocated capital", () => {
    assert.throws(() => previewValuation({
      confirmedCashNgn: "100.00", assetMarksNgn: [], liabilitiesNgn: "0.00",
      previousTotalUnits: "0", eligibleUnissuedContributions: [verified("c", "u", "200.00")],
    }), /cash must cover/);
  });

  it("rejects orphan assets without founding units or an insolvent legacy pool", () => {
    assert.throws(() => previewValuation({
      confirmedCashNgn: "2000.00", assetMarksNgn: [], liabilitiesNgn: "0.00",
      previousTotalUnits: "0", eligibleUnissuedContributions: [verified("c", "u", "1000.00")],
    }), /unexplained/);
    assert.throws(() => previewValuation({
      confirmedCashNgn: "100.00", assetMarksNgn: [], liabilitiesNgn: "100.00",
      previousTotalUnits: "1", eligibleUnissuedContributions: [],
    }), /zero or negative/);
  });

  it("rounds issued ownership DOWN to 8 decimals", () => {
    const report = previewValuation({
      confirmedCashNgn: "1.00",
      assetMarksNgn: [{ assetId: "asset", valueNgn: "300000.00" }],
      liabilitiesNgn: "0.00", previousTotalUnits: "100.00000000",
      eligibleUnissuedContributions: [verified("c", "u", "1.00")],
    });
    assert.equal(report.allocations[0].units, "0.00033333");
    assert.equal(unitsToDecimal(parseUnits(report.allocations[0].units)), "0.00033333");
  });

  it("formats exact unit prices and guards invalid ownership claims", () => {
    assert.equal(formatUnitPriceNgn(toKobo("100000.00"), parseUnits("100.00000000")), "1000.000000");
    assert.throws(() => parseUnits("1.123456789"), /Invalid/);
    assert.throws(() => attributedValueKobo(100n, 2n, 1n), /Invalid/);
  });

  it("does not allow invented valuations from an empty portfolio", () => {
    assert.throws(() => previewValuation({
      confirmedCashNgn: "0.00", assetMarksNgn: [], liabilitiesNgn: "0.00",
      previousTotalUnits: "0", eligibleUnissuedContributions: [],
    }), /zero issued units/);
  });
});
