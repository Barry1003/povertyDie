"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { GroupDashboard } from "@/lib/group/queries";
import { currentPeriod, nextPeriod } from "@/lib/accounting/custody";

type Currency = "NGN" | "USD" | "EUR" | "GBP" | "OTHER";
type MarkDraft = {
  assetLabel: string;
  category: string;
  sourceCurrency: Currency;
  amountInSourceCurrency: string;
  ngnFairValue: string;
  evidenceReference: string;
  fxQuoteReference: string;
};

const emptyMark = (): MarkDraft => ({
  assetLabel: "",
  category: "Stock",
  sourceCurrency: "NGN",
  amountInSourceCurrency: "",
  ngnFairValue: "",
  evidenceReference: "",
  fxQuoteReference: "",
});

async function send(path: string, data: Record<string, unknown>) {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
    cache: "no-store",
  });
  const parsed = await res.json();
  if (!res.ok) throw new Error(parsed.error || "The request could not be completed");
  return parsed;
}

export function CustodyWorkspace({ data }: { data: GroupDashboard }) {
  const router = useRouter();
  const month = currentPeriod();
  const upcoming = nextPeriod(month);
  const [scheduleMonth, setScheduleMonth] = useState(month);
  const [cash, setCash] = useState("");
  const [liabilities, setLiabilities] = useState("0.00");
  const [statement, setStatement] = useState("");
  const [notes, setNotes] = useState("");
  const [marks, setMarks] = useState<MarkDraft[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const assigned = data.custody.find(item =>
    item.custodianUserId === data.viewer.id && !item.reportStatus && item.period <= month,
  );

  async function work(task: () => Promise<void>) {
    setMessage("");
    setBusy(true);
    try { await task(); }
    catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to complete request");
    } finally { setBusy(false); }
  }

  async function scheduleCustodian() {
    await work(async () => {
      const saved = await send("/api/groups/custody", {
        groupId: data.group.id, period: scheduleMonth,
      });
      const member = data.members.find(x => x.userId === saved.custodianUserId);
      setMessage(`Custody scheduled for ${scheduleMonth}: ${member?.name ?? "assigned member"}.`);
      router.refresh();
    });
  }

  async function sendStatement(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!assigned) return;
    await work(async () => {
      await send("/api/groups/custody/reports", {
        groupId: data.group.id,
        period: assigned.period,
        cashNgn: cash,
        liabilitiesNgn: liabilities,
        statementReference: statement,
        notes,
        assetMarks: marks.map(mark => ({
          ...mark,
          ...(mark.sourceCurrency === "NGN" ? { ngnFairValue: mark.amountInSourceCurrency } : {}),
          fxQuoteReference: mark.sourceCurrency === "NGN" ? undefined : mark.fxQuoteReference,
        })),
      });
      setMessage("Monthly statement submitted. These numbers are not approved or counted as investment value.");
      router.refresh();
    });
  }

  const updateMark = (index: number, field: keyof MarkDraft, value: string) => {
    setMarks(current => current.map((mark, i) => i === index ? { ...mark, [field]: value } : mark));
  };

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-[#d8e8df] bg-white p-5 sm:p-7">
        <p className="text-xs font-bold uppercase tracking-[.15em] text-[#16856e]">Monthly accountability</p>
        <h2 className="mt-2 text-2xl font-black text-[#193a31]">Rotating custody & reports</h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#617a6f]">
          A different friend takes custody each month and submits a reconciliation statement.
          Submitting a report is not financial approval: cash, investments, profit and ownership units
          must still be independently reconciled before they can appear as earnings.
        </p>

        <div className="mt-6 space-y-3">
          {data.custody.length === 0 && (
            <p className="rounded-xl bg-[#edf5ef] p-4 text-sm text-[#517467]">
              No custodian has been scheduled yet. Your group administrator can assign the first month.
            </p>
          )}
          {data.custody.map(item => (
            <article key={item.period} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#e0ece4] px-4 py-3">
              <div>
                <p className="font-bold text-[#173a2e]">{item.period}</p>
                <p className="mt-1 text-sm text-[#648174]">{item.custodianName} · Monthly custodian</p>
              </div>
              <span className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                item.reportStatus === "submitted"
                  ? "bg-amber-100 text-amber-900"
                  : item.reportStatus === "approved"
                    ? "bg-emerald-100 text-emerald-900"
                    : item.reportStatus === "rejected"
                      ? "bg-rose-100 text-rose-800"
                      : "bg-slate-100 text-slate-700"
              }`}>
                {item.reportStatus === "submitted" ? "Statement submitted · unapproved"
                  : item.reportStatus === "approved" ? "Approved"
                    : item.reportStatus === "rejected" ? "Rejected"
                      : "Report not submitted"}
              </span>
            </article>
          ))}
        </div>
      </div>

      {data.viewer.role === "admin" && (
        <div className="rounded-3xl border border-[#d8e8df] bg-white p-5 sm:p-7">
          <h3 className="text-lg font-extrabold text-[#193a31]">Schedule the next custodian</h3>
          <p className="mt-2 text-sm text-[#6a8278]">
            Assigns the next friend in joined-date order. Existing assignments cannot be overwritten.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <label className="flex-1 text-sm font-semibold">
              Reporting month
              <select className="mt-2 block w-full rounded-xl border border-[#cfdfd5] bg-white px-4 py-3" value={scheduleMonth} onChange={event => setScheduleMonth(event.target.value)}>
                <option value={month}>{month} · Current month</option>
                <option value={upcoming}>{upcoming} · Next month</option>
              </select>
            </label>
            <button type="button" disabled={busy} onClick={() => void scheduleCustodian()}
              className="self-end rounded-xl bg-[#16856e] px-5 py-3 text-sm font-bold text-white disabled:opacity-50">
              {busy ? "Saving…" : "Schedule custodian"}
            </button>
          </div>
        </div>
      )}

      {assigned && (
        <form onSubmit={sendStatement} className="rounded-3xl border border-[#d8e8df] bg-white p-5 sm:p-7">
          <p className="text-xs font-bold uppercase tracking-[.15em] text-[#16856e]">You are the custodian · {assigned.period}</p>
          <h3 className="mt-2 text-xl font-black">Submit your monthly statement</h3>
          <p className="mt-2 text-sm leading-relaxed text-[#648075]">
            Use actual reconciled statements and external valuation evidence. This is an unapproved
            submission only; no units are created and no member earnings will change.
          </p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-semibold">Confirmed cash balance (₦)
              <input required type="text" inputMode="decimal" value={cash} onChange={e => setCash(e.target.value)} placeholder="0.00"
                className="mt-2 block w-full rounded-xl border border-[#d3e2d8] px-4 py-3 text-sm" />
            </label>
            <label className="text-sm font-semibold">Liabilities (₦)
              <input required type="text" inputMode="decimal" value={liabilities} onChange={e => setLiabilities(e.target.value)} placeholder="0.00"
                className="mt-2 block w-full rounded-xl border border-[#d3e2d8] px-4 py-3 text-sm" />
            </label>
            <label className="text-sm font-semibold sm:col-span-2">Bank-statement or reconciliation reference (do not include account credentials)
              <input required minLength={6} maxLength={300} value={statement} onChange={e => setStatement(e.target.value)}
                placeholder="e.g. custody-reconciliation-2026-11"
                className="mt-2 block w-full rounded-xl border border-[#d3e2d8] px-4 py-3 text-sm" />
            </label>
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between gap-3">
              <div><h4 className="text-base font-extrabold">Investment valuations</h4>
                <p className="mt-1 text-xs text-[#678075]">Each holding needs a value and evidence source. Foreign values require a separate FX quotation reference.</p></div>
              <button type="button" disabled={marks.length >= 30} onClick={() => setMarks(list => [...list, emptyMark()])}
                className="rounded-xl border border-[#bad7c9] px-3 py-2 text-xs font-bold text-[#166b57] disabled:opacity-50">
                + Add holding</button>
            </div>
            <div className="mt-3 space-y-4">
              {marks.length === 0 && <p className="rounded-xl bg-[#f2f7f3] p-4 text-xs text-[#61796d]">No holdings added. A cash-only report can be submitted without investment positions.</p>}
              {marks.map((mark, index) => (
                <div key={index} className="rounded-2xl border border-[#dce9e2] bg-[#fbfdfb] p-4">
                  <div className="flex items-center justify-between">
                    <strong className="text-sm">Holding {index + 1}</strong>
                    <button type="button" onClick={() => setMarks(list => list.filter((_, i) => i !== index))}
                      className="text-xs font-semibold text-rose-700 underline">Remove</button>
                  </div>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <label className="text-xs font-semibold">Asset name
                      <input required maxLength={100} value={mark.assetLabel} onChange={e => updateMark(index, "assetLabel", e.target.value)}
                        placeholder="Asset or investment name" className="mt-1 block w-full rounded-lg border border-[#d5e5da] p-2.5 text-sm" />
                    </label>
                    <label className="text-xs font-semibold">Asset category
                      <select value={mark.category} onChange={e => updateMark(index, "category", e.target.value)}
                        className="mt-1 block w-full rounded-lg border border-[#d5e5da] bg-white p-2.5 text-sm">
                        <option>Stock</option><option>ETF</option><option>Bond</option><option>Business</option><option>Property</option><option>Cash equivalent</option><option>Other</option>
                      </select>
                    </label>
                    <label className="text-xs font-semibold">Value currency
                      <select value={mark.sourceCurrency} onChange={e => updateMark(index, "sourceCurrency", e.target.value as Currency)}
                        className="mt-1 block w-full rounded-lg border border-[#d5e5da] bg-white p-2.5 text-sm">
                        <option>NGN</option><option>USD</option><option>GBP</option><option>EUR</option><option>OTHER</option>
                      </select>
                    </label>
                    <label className="text-xs font-semibold">Value in source currency
                      <input required type="text" inputMode="decimal" value={mark.amountInSourceCurrency}
                        onChange={e => updateMark(index, "amountInSourceCurrency", e.target.value)}
                        placeholder="0.00" className="mt-1 block w-full rounded-lg border border-[#d5e5da] p-2.5 text-sm" />
                    </label>
                    {mark.sourceCurrency !== "NGN" && <>
                      <label className="text-xs font-semibold">NGN converted fair value
                        <input required type="text" inputMode="decimal" value={mark.ngnFairValue}
                          onChange={e => updateMark(index, "ngnFairValue", e.target.value)}
                          placeholder="0.00" className="mt-1 block w-full rounded-lg border border-[#d5e5da] p-2.5 text-sm" />
                      </label>
                      <label className="text-xs font-semibold">FX quotation reference
                        <input required minLength={6} maxLength={300} value={mark.fxQuoteReference}
                          onChange={e => updateMark(index, "fxQuoteReference", e.target.value)}
                          placeholder="Dated FX rate and source"
                          className="mt-1 block w-full rounded-lg border border-[#d5e5da] p-2.5 text-sm" />
                      </label>
                    </>}
                    <label className="text-xs font-semibold sm:col-span-2">Valuation source reference
                      <input required minLength={6} maxLength={300} value={mark.evidenceReference}
                        onChange={e => updateMark(index, "evidenceReference", e.target.value)}
                        placeholder="Broker statement, dated quote or valuation reference"
                        className="mt-1 block w-full rounded-lg border border-[#d5e5da] p-2.5 text-sm" />
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <label className="mt-6 block text-sm font-semibold">Monthly reporting notes
            <textarea rows={3} value={notes} onChange={e => setNotes(e.target.value)}
              maxLength={1000} placeholder="What changed, any setbacks, risk or missing evidence?"
              className="mt-2 block w-full rounded-xl border border-[#d3e2d8] p-3 text-sm" />
          </label>
          <button type="submit" disabled={busy} className="mt-5 w-full rounded-xl bg-[#16856e] px-5 py-3 text-sm font-bold text-white disabled:opacity-50">
            {busy ? "Submitting…" : "Submit statement for independent review"}
          </button>
        </form>
      )}

      {message && <p role="status" className="rounded-xl border border-[#d5e5da] bg-[#f1f8f3] p-4 text-sm font-semibold text-[#226e55]">{message}</p>}
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-relaxed text-amber-900">
        <strong>Investment accounting is not active yet.</strong> Reports remain unapproved until a separate,
        audited valuation and ownership-allocation workflow is completed. No statement here should be interpreted
        as audited earnings, available cash or an instruction to transfer money.
      </div>
    </section>
  );
}
