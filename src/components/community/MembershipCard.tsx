import { AlertTriangle, CalendarDays, CheckCircle2, ExternalLink, RefreshCw, Sparkles } from "lucide-react";
import { refreshMembership } from "@/app/community/actions";
import { siteContent } from "@/content/siteContent";
import type { StoredMembership } from "@/lib/members/membershipRepository";

const TIME_ZONE = "Asia/Colombo";

function formatDate(value: string | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: TIME_ZONE,
  });
}

function formatAmount(cents: number | null): string {
  if (cents === null) return "—";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
}

function SubscribeLink({ label }: { readonly label: string }) {
  return (
    <a
      href={siteContent.subscribeUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#c9f7e3] to-[#cfeaff] px-5 py-2.5 text-sm font-semibold text-[#2a1f4a] shadow-lg transition hover:-translate-y-0.5"
    >
      {label}
      <ExternalLink className="h-4 w-4" aria-hidden="true" />
    </a>
  );
}

function InfoRow({ label, value }: { readonly label: string; readonly value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-t border-white/10 py-2.5 text-sm">
      <span className="text-white/55">{label}</span>
      <span className="font-medium text-white">{value}</span>
    </div>
  );
}

/** Shows the signed-in member's subscription status, plan details, and dates. */
export function MembershipCard({ membership }: { readonly membership: StoredMembership }) {
  const refreshForm = (
    <form action={refreshMembership}>
      <button
        type="submit"
        className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-xs font-medium text-white/75 transition hover:bg-white/10 hover:text-white"
      >
        <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
        Refresh status
      </button>
    </form>
  );

  if (membership.status === "active") {
    return (
      <div className="rounded-3xl border border-[#b5f5da]/25 bg-gradient-to-br from-[#c9f7e3]/10 to-[#cfeaff]/5 p-6 shadow-xl backdrop-blur">
        <div className="flex items-center justify-between gap-3">
          <p className="flex items-center gap-2 font-semibold text-[#b5f5da]">
            <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
            Active member
          </p>
          {refreshForm}
        </div>

        <div className="mt-3">
          <InfoRow label="Plan" value={`${formatAmount(membership.entitledCents)} / month`} />
          <InfoRow label="Member since" value={formatDate(membership.startedAt)} />
          <InfoRow label="Next charge" value={formatDate(membership.nextChargeAt)} />
          <InfoRow label="Last payment" value={`${formatDate(membership.lastChargeAt)}${membership.lastChargeStatus ? ` · ${membership.lastChargeStatus}` : ""}`} />
          <InfoRow label="Status checked" value={formatDate(membership.checkedAt)} />
        </div>
      </div>
    );
  }

  if (membership.status === "declined") {
    return (
      <div className="rounded-3xl border border-[#ffd98a]/30 bg-[#ffd98a]/10 p-6 shadow-xl">
        <p className="flex items-center gap-2 font-semibold text-[#ffe9b0]">
          <AlertTriangle className="h-5 w-5" aria-hidden="true" />
          Payment needs attention
        </p>
        <p className="mt-2 text-sm leading-relaxed text-white/75">
          Your last payment didn&apos;t go through. Update your payment details on Patreon to keep your membership.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <SubscribeLink label="Update on Patreon" />
          {refreshForm}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-[#241a40]/80 p-6 shadow-xl backdrop-blur">
      <p className="flex items-center gap-2 font-semibold text-white">
        <Sparkles className="h-5 w-5 text-[#ffd1e5]" aria-hidden="true" />
        {membership.status === "former" ? "Your membership has ended" : "Become a member"}
      </p>
      <p className="mt-2 text-sm leading-relaxed text-white/65">
        Subscribe on Patreon to unlock the full circle. After you subscribe, come back here and press Refresh status.
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <SubscribeLink label={siteContent.hero.primaryCta} />
        {refreshForm}
      </div>
      <p className="mt-3 flex items-center gap-1.5 text-xs text-white/40">
        <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
        Billing is handled securely by Patreon.
      </p>
    </div>
  );
}