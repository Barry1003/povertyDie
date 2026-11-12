import { BrandLogo } from "@/components/brand/brand-logo";
"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ImmersiveWealth } from "@/components/3d/immersive-wealth";
import { CustodyWorkspace } from "@/components/group/custody-workspace";
import { CharacterAvatar } from "@/components/identity/character-avatar";
import { authClient } from "@/lib/auth/client";
import type { GroupDashboard } from "@/lib/group/queries";
import { formatNaira } from "@/lib/group/money";

type Tab = "overview" | "friends" | "activity" | "custody";

async function mutation(path: string, data: Record<string, unknown>, method = "POST") {
  const response = await fetch(path, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
    cache: "no-store",
  });
  const body = await response.json();
  if (!response.ok) throw new Error(body.error || "Request failed");
  return body;
}

function Stat({ label, value, help }: { label: string; value: string; help: string }) {
  return (
    <article className="rounded-2xl border border-[#dcebe3] bg-white p-5 shadow-[0_3px_16px_rgba(17,57,44,0.03)]">
      <p className="text-xs font-semibold uppercase tracking-wider text-[#638077]">{label}</p>
      <p className="mt-3 text-2xl font-extrabold tracking-tight text-[#15382f] sm:text-3xl">{value}</p>
      <p className="mt-2 text-xs text-[#69857a]">{help}</p>
    </article>
  );
}

function Status({ status }: { status: "submitted" | "verified" | "rejected" }) {
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
    status === "verified" ? "bg-emerald-100 text-emerald-800" :
    status === "rejected" ? "bg-rose-100 text-rose-800" : "bg-amber-100 text-amber-900"
  }`}>{status === "submitted" ? "Awaiting review" : status === "verified" ? "Verified" : "Rejected"}</span>;
}

export function GroupHub({ data }: { data: GroupDashboard }) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("overview");
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState("");
  const [inviteLink, setInviteLink] = useState("");
  const [showContribution, setShowContribution] = useState(false);
  const [amount, setAmount] = useState("25000");
  const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [reference, setReference] = useState("");
  const [note, setNote] = useState("");
  const [rejectionId, setRejectionId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const reviewer = data.viewer.role === "admin" || data.viewer.role === "reviewer";
  const reviewable = data.contributions.filter(c => c.status === "submitted" && c.memberId !== data.viewer.id);
  const personalPending = data.members.find(m => m.userId === data.viewer.id)?.pending ?? "0";

  async function run(key: string, action: () => Promise<void>) {
    setBusy(key); setMessage("");
    try { await action(); }
    catch (error) { setMessage(error instanceof Error ? error.message : "Something went wrong"); }
    finally { setBusy(""); }
  }

  async function submitContribution(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await run("claim", async () => {
      await mutation("/api/contributions", {
        groupId: data.group.id, amount, month, reference, note,
      });
      setReference(""); setNote(""); setShowContribution(false);
      setMessage("Payment claim recorded. It will NOT count as received until another member independently verifies the transfer.");
      router.refresh();
    });
  }

  function createInvite() {
    void run("invite", async () => {
      const result = await mutation("/api/groups/invitations", { groupId: data.group.id });
      setInviteLink(result.link);
    });
  }

  function setRole(userId: string, role: "member" | "reviewer") {
    void run(`role-${userId}`, async () => {
      await mutation(`/api/groups/members/${encodeURIComponent(userId)}/role`, { groupId: data.group.id, role }, "PATCH");
      router.refresh();
    });
  }

  function review(id: string, decision: "verified" | "rejected", reviewNote: string | null) {
    if (decision === "verified" && !window.confirm(
      "Have you personally checked the receiving bank account and confirmed these funds arrived? This is a permanent verified contribution record.",
    )) return;
    void run(`review-${id}`, async () => {
      await mutation(`/api/contributions/${id}/review`, { groupId: data.group.id, decision, note: reviewNote });
      setRejectionId(null); setRejectionReason("");
      router.refresh();
    });
  }

  return (
    <main className="min-h-screen bg-[#f5faf7] pb-20 text-[#17362f]">
      <header className="sticky top-0 z-20 border-b border-[#dcebe3] bg-white/95 backdrop-blur-lg">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <BrandLogo compact size="sm" />
            <div className="min-w-0">
              <h1 className="truncate text-base font-extrabold sm:text-lg">{data.group.name}</h1>
              <p className="text-xs text-[#73887e]">Our shared wealth circle</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/profile" aria-label="Edit your member profile" title="My profile"><CharacterAvatar name={data.viewer.name} seed={data.viewer.avatarSeed} size="sm" /></Link>
            <button type="button" className="text-xs font-semibold text-[#507266] underline underline-offset-4" onClick={async () => {
              await authClient.signOut();
              window.location.assign("/sign-in");
            }}>Sign out</button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-8">
        <nav aria-label="Group sections" className="mb-6 inline-flex max-w-full gap-1 overflow-x-auto rounded-2xl border border-[#dcebe3] bg-white p-1.5">
          {([
            ["overview", "Overview"], ["friends", "Friends & contributions"], ["activity", "Contributions"], ["custody", "Custody & reports"],
          ] as [Tab, string][]).map(([key, label]) =>
            <button key={key} type="button" onClick={() => setTab(key)}
              aria-current={tab === key ? "page" : undefined}
              className={`whitespace-nowrap rounded-xl px-4 py-2.5 text-xs font-bold sm:text-sm ${
                tab === key ? "bg-[#16856e] text-white shadow-sm" : "text-[#4c6e62] hover:bg-[#e9f4ee]"
              }`}>{label}</button>)}
        </nav>

        {message && <div role="status" className="mb-5 rounded-xl border border-[#cbded4] bg-[#e9f5ef] px-4 py-3 text-sm text-[#245d4c]">{message}</div>}

        {tab === "overview" && <>
          <section className="relative isolate overflow-hidden rounded-3xl bg-[#143b32] p-6 text-white shadow-xl sm:p-9">
            <div className="pointer-events-none absolute -right-12 -top-16 h-80 w-[45%] opacity-80 sm:right-4 sm:top-0 sm:h-full">
              <ImmersiveWealth variant="overview" />
            </div>
            <div className="relative z-10 max-w-md">
              <span className="rounded-full border border-[#4c866e] bg-[#245446] px-3 py-1 text-xs font-semibold text-[#d1eedc]">Together, on the same page</span>
              <h2 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl">Every contribution. <span className="text-[#8de0ba]">Everyone can see.</span></h2>
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-[#c5ded2]">
                This dashboard displays actual records from your group database. Amounts count toward the verified total only after independent review.
              </p>
              <button type="button" onClick={() => { setTab("activity"); setShowContribution(true); }}
                className="mt-6 rounded-xl bg-[#e7bd75] px-5 py-3 text-sm font-extrabold text-[#17352e]">Record a contribution</button>
            </div>
          </section>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label="Verified contributions" value={formatNaira(data.groupVerified)} help="Total confirmed, not portfolio value" />
            <Stat label="Awaiting verification" value={formatNaira(data.groupPending)} help="Submitted claims, not yet confirmed cash" />
            <Stat label="Friends in the group" value={String(data.memberCount)} help="Each person sees the same group ledger" />
            <Stat label="Your verified contributions" value={formatNaira(data.personalVerified)} help={`Your pending claims: ${formatNaira(personalPending)}`} />
          </div>
          <section className="mt-5 rounded-2xl border border-[#dcebe3] bg-white p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div><h3 className="text-xl font-bold">Your people, your progress</h3>
                <p className="mt-1 text-sm text-[#668176]">Approved amounts come from the same verified records for everyone.</p>
              </div>
              <button type="button" className="text-sm font-bold text-[#138068] underline underline-offset-4" onClick={() => setTab("friends")}>View everyone’s contributions</button>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {data.members.slice(0, 6).map(member => <div key={member.userId} className="flex items-center gap-3 rounded-xl border border-[#e6eee9] p-3">
                <CharacterAvatar name={member.name} seed={member.avatarSeed} />
                <div className="min-w-0"><p className="truncate text-sm font-bold">{member.name}</p>
                  <p className="mt-1 text-xs text-[#658075]">{formatNaira(member.verified)} verified</p></div>
              </div>)}
            </div>
          </section>
          <section className="mt-5 rounded-2xl border border-[#dcebe3] bg-white p-6">
            <h3 className="text-lg font-bold">Investment earnings</h3>
            <p className="mt-2 text-sm text-[#61786f]">Not calculated yet. Contribution totals are not profit: earnings and ownership percentages will appear only after we build an approved investment valuation, unit-issuance and distribution ledger.</p>
          </section>
        </>}

        {tab === "friends" && <section className="rounded-3xl border border-[#dcebe3] bg-white p-5 sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div><h2 className="text-2xl font-extrabold">All our friends</h2>
              <p className="mt-2 text-sm text-[#61786f]">Everyone in {data.group.name} sees these exact verified and pending amounts.</p></div>
            <span className="rounded-full bg-[#e8f5ef] px-4 py-2 text-xs font-bold text-[#18816a]">{data.memberCount} members</span>
          </div>
          <div className="mt-6 space-y-3">
            {data.members.map(member => <div key={member.userId} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#e5eee8] p-4">
              <div className="flex min-w-[160px] items-center gap-3">
                <CharacterAvatar name={member.name} seed={member.avatarSeed} size="lg" />
                <div><p className="text-sm font-bold">{member.name}{member.userId === data.viewer.id ? " (you)" : ""}</p>
                  <p className="mt-1 text-xs capitalize text-[#72877d]">{member.role}</p></div>
              </div>
              <div className="flex flex-wrap gap-6">
                <div><p className="text-xs text-[#6d8479]">Verified</p><p className="font-bold">{formatNaira(member.verified)}</p></div>
                <div><p className="text-xs text-[#6d8479]">Pending</p><p className="font-bold">{formatNaira(member.pending)}</p></div>
              </div>
              {data.viewer.role === "admin" && member.role !== "admin" && <button
                type="button" disabled={!!busy} onClick={() => setRole(member.userId, member.role === "reviewer" ? "member" : "reviewer")}
                className="rounded-xl border border-[#cbded4] px-3 py-2 text-xs font-bold text-[#176f59] disabled:opacity-50">
                {member.role === "reviewer" ? "Remove reviewer role" : "Make reviewer"}</button>}
            </div>)}
          </div>
          <div className="mt-6 rounded-xl bg-[#f2f8f4] p-4 text-sm text-[#567267]">Individual profits and ownership units are intentionally not shown until a reconciled valuation model is implemented.</div>
        </section>}

        {tab === "activity" && <>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div><h2 className="text-2xl font-extrabold">Contribution register</h2>
              <p className="mt-2 text-sm text-[#61786f]">A record of submitted, verified and rejected payment claims.</p></div>
            <button type="button" onClick={() => setShowContribution(value => !value)}
              className="rounded-xl bg-[#16856e] px-4 py-3 text-sm font-extrabold text-white">
              {showContribution ? "Close form" : "+ Record a contribution"}</button>
          </div>

          {showContribution && <form onSubmit={submitContribution} className="mt-5 grid gap-4 rounded-3xl border border-[#dcebe3] bg-white p-6 sm:grid-cols-2">
            <div className="sm:col-span-2"><h3 className="text-lg font-bold">Record a bank transfer claim</h3>
              <p className="mt-1 text-sm text-[#61786f]">This does not move money or automatically verify a bank payment.</p></div>
            <label className="text-sm font-semibold">Amount (₦)
              <input required inputMode="decimal" value={amount} onChange={e => setAmount(e.target.value)} placeholder="25000.00"
                className="mt-2 block w-full rounded-xl border border-[#d2e4d9] px-4 py-3 text-sm" /></label>
            <label className="text-sm font-semibold">Contribution month
              <input required type="month" value={month} onChange={e => setMonth(e.target.value)}
                className="mt-2 block w-full rounded-xl border border-[#d2e4d9] px-4 py-3 text-sm" /></label>
            <label className="text-sm font-semibold sm:col-span-2">Transfer reference
              <input required minLength={4} maxLength={80} value={reference} onChange={e => setReference(e.target.value)}
                placeholder="Your bank's transfer reference"
                className="mt-2 block w-full rounded-xl border border-[#d2e4d9] px-4 py-3 text-sm" /></label>
            <label className="text-sm font-semibold sm:col-span-2">Optional note
              <textarea maxLength={300} value={note} onChange={e => setNote(e.target.value)} rows={2}
                className="mt-2 block w-full rounded-xl border border-[#d2e4d9] px-4 py-3 text-sm" /></label>
            <button type="submit" disabled={!!busy} className="rounded-xl bg-[#16856e] px-4 py-3 text-sm font-bold text-white disabled:opacity-60 sm:col-span-2">
              {busy === "claim" ? "Submitting…" : "Submit claim for independent review"}</button>
          </form>}

          {reviewer && reviewable.length > 0 && <section className="mt-6 rounded-3xl border border-[#edddbd] bg-[#fffaf0] p-5">
            <h3 className="text-lg font-extrabold">Needs independent verification · {reviewable.length}</h3>
            <p className="mt-2 text-sm text-[#836d4a]">Review the receiving bank account outside this app before confirming a claim. You can never verify your own claim.</p>
            <div className="mt-4 space-y-3">
              {reviewable.map(claim => <article key={claim.id} className="rounded-xl border border-[#f0e4cc] bg-white p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div><p className="text-sm font-bold">{claim.memberName} · {formatNaira(claim.amount)}</p>
                    <p className="mt-1 text-xs text-[#6c8177]">{claim.month} · Ref: {claim.reference}</p></div>
                  <div className="flex gap-2">
                    <button type="button" disabled={!!busy} onClick={() => review(claim.id, "verified", "Receiving account confirmed by reviewer")}
                      className="rounded-lg bg-emerald-700 px-3 py-2 text-xs font-bold text-white disabled:opacity-60">Verify received</button>
                    <button type="button" disabled={!!busy} onClick={() => setRejectionId(claim.id)}
                      className="rounded-lg border border-rose-200 px-3 py-2 text-xs font-bold text-rose-700 disabled:opacity-60">Reject</button>
                  </div>
                </div>
                {rejectionId === claim.id && <div className="mt-3 flex flex-wrap gap-2">
                  <input value={rejectionReason} onChange={e => setRejectionReason(e.target.value)} maxLength={300}
                    placeholder="Reason for rejection (required)"
                    className="min-w-48 flex-1 rounded-lg border border-[#d1ddd7] px-3 py-2 text-sm" />
                  <button type="button" disabled={!!busy || !rejectionReason.trim()} onClick={() => review(claim.id, "rejected", rejectionReason)}
                    className="rounded-lg bg-rose-700 px-3 py-2 text-xs font-bold text-white disabled:opacity-60">Confirm rejection</button>
                </div>}
              </article>)}
            </div>
          </section>}

          <section className="mt-6 overflow-hidden rounded-3xl border border-[#dcebe3] bg-white">
            <div className="border-b border-[#e6eee8] p-5"><h3 className="text-lg font-bold">Recent claims</h3><p className="mt-1 text-xs text-[#74897e]">Latest 100 records · shared with group members</p></div>
            {data.contributions.length === 0
              ? <p className="p-8 text-center text-sm text-[#6d8177]">No contributions recorded yet. Start by submitting a bank transfer reference.</p>
              : <div className="divide-y divide-[#e9efeb]">{data.contributions.map(claim => <div key={claim.id} className="grid gap-2 px-5 py-4 sm:grid-cols-[1.4fr_1fr_1fr] sm:items-center">
                <div><p className="text-sm font-bold">{claim.memberName}</p><p className="mt-1 text-xs text-[#708479]">Ref: {claim.reference} · {claim.month}</p></div>
                <p className="text-sm font-bold">{formatNaira(claim.amount)}</p>
                <div><Status status={claim.status} />{claim.reviewNote && <p className="mt-1 text-xs text-[#71887c]">{claim.reviewNote}</p>}</div>
              </div>)}</div>}
          </section>
        </>}

        {tab === "custody" && <CustodyWorkspace data={data} />}

        {data.viewer.role === "admin" && <section className="mt-7 rounded-2xl border border-[#d8e9df] bg-[#eaf5ee] p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div><h3 className="font-extrabold">Grow the circle</h3><p className="mt-1 text-sm text-[#59786b]">Invite another friend with a one-use link. It expires in seven days.</p></div>
            <button type="button" disabled={!!busy} onClick={createInvite}
              className="rounded-xl bg-[#16856e] px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60">
              {busy === "invite" ? "Creating…" : "Create invite link"}</button>
          </div>
          {inviteLink && <div className="mt-4 flex flex-wrap gap-2">
            <input aria-label="Invitation link" readOnly value={inviteLink}
              className="min-w-0 flex-1 rounded-xl border border-[#c2d9ce] bg-white p-3 text-xs" />
            <button type="button" onClick={() => {
              void navigator.clipboard.writeText(inviteLink).then(() => setMessage("Invite link copied. Share it privately; it works only once."))
                .catch(() => setMessage("Copy the invitation link from the text field."));
            }} className="rounded-xl border border-[#a8cdbb] bg-white px-4 py-2 text-sm font-bold text-[#1b735a]">Copy link</button>
          </div>}
        </section>}
      </div>
    </main>
  );
}
