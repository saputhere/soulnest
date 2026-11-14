import { connection } from "next/server";
import { AddressForm } from "@/components/account/AddressForm";
import { PlanDeliveryForm } from "@/components/account/PlanDeliveryForm";
import { AuthDialog } from "@/components/auth/AuthDialog";
import { siteContent } from "@/content/siteContent";
import { getAddress, listDeliveries } from "@/lib/account/accountRepository";
import { earliestSendDate, leadDaysFor, todayInColombo } from "@/lib/account/deliveryRules";
import { getViewer } from "@/lib/community/viewer";
import { getMembership } from "@/lib/members/membershipRepository";
import { refreshMembership } from "@/app/community/actions";
import { cancelDeliveryAction } from "./actions";

const STATUS_LABEL: Record<string, string> = {
  scheduled: "Scheduled",
  packed: "Packed",
  posted: "Posted",
  delivered: "Delivered",
  delayed: "Delayed in post",
  cancelled: "Cancelled",
};

const SECTION = "rounded-3xl border border-white/10 bg-[#241a40]/75 p-6 shadow-xl backdrop-blur sm:p-8";

const BENEFITS = [
  "A monthly box of prints, Lomo cards, bookmarks, stickers, and notebooks",
  "Letters to your future self, posted on the date you choose",
  "Gifts for milestones like graduations and anniversaries",
];

function formatDate(isoDate: string): string {
  return new Date(`${isoDate}T00:00:00`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Shown in place of the planning form when the member has no active subscription. */
function NoSubscriptionCard({ status }: { readonly status: string }) {
  const isLapsed = status === "former" || status === "declined";

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
      <p className="font-serif text-xl text-white">
        {isLapsed ? "Your subscription isn't active" : "You don't have a subscription yet"}
      </p>
      <p className="mt-2 text-sm leading-relaxed text-white/60">
        {isLapsed
          ? "Planning letters and gifts is for active members. Renew on Patreon to unlock it again."
          : "Planning letters and gifts is part of the SoulNest membership. Subscribe on Patreon to unlock it."}
      </p>

      <ul className="mt-5 space-y-2 text-sm text-white/75">
        {BENEFITS.map((benefit) => (
          <li key={benefit} className="flex items-start gap-2.5">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#b5f5da]" aria-hidden="true" />
            {benefit}
          </li>
        ))}
      </ul>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <a
          href={siteContent.subscribeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full bg-gradient-to-r from-[#c9f7e3] to-[#cfeaff] px-6 py-2.5 text-sm font-semibold text-[#2a1f4a] shadow-lg transition hover:-translate-y-0.5"
        >
          {isLapsed ? "Renew on Patreon" : "Subscribe on Patreon"}
        </a>
        <form action={refreshMembership}>
          <button
            type="submit"
            className="rounded-full border border-white/15 px-5 py-2.5 text-sm text-white/80 transition hover:bg-white/10"
          >
            Already subscribed? Refresh status
          </button>
        </form>
      </div>
    </div>
  );
}

export async function AccountContent() {
  await connection();

  const viewer = await getViewer();

  if (!viewer) {
    return (
      <div className={`mt-10 text-center ${SECTION}`}>
        <p className="font-serif text-2xl text-white">Sign in to manage your SoulNest.</p>
        <p className="mt-2 text-sm text-white/55">Use Patreon or a SoulNest account.</p>
        <div className="mt-6 flex justify-center">
          <AuthDialog redirectTo="/account" />
        </div>
      </div>
    );
  }

  const [address, membership, deliveries] = await Promise.all([
    getAddress(viewer.id),
    getMembership(viewer.id),
    listDeliveries(viewer.id),
  ]);

  const today = todayInColombo();
  const isActive = viewer.isAdmin || membership.status === "active";
  const isDomestic = address?.isDomestic ?? false;
  const minDate = earliestSendDate(isDomestic, today);
  const leadDays = leadDaysFor(isDomestic);

  // Active members who haven't saved an address yet see this hint on the planning form.
  const addressHint = isActive && !address ? "Save your shipping address above to unlock planning." : null;

  return (
    <div className="mt-10 space-y-8">
      <section className={SECTION}>
        <h2 className="font-serif text-2xl font-semibold text-white">Shipping address</h2>
        <p className="mt-1 text-sm text-white/55">
          Only you and the SoulNest team can see this. Sri Lanka orders are posted 5 days ahead; international
          orders 18 days ahead.
        </p>
        <div className="mt-6">
          <AddressForm address={address} />
        </div>
      </section>

      <section className={SECTION}>
        <h2 className="font-serif text-2xl font-semibold text-white">Plan a letter or gift</h2>
        {isActive ? (
          <>
            <p className="mt-1 text-sm text-white/55">
              Choose the day we should post it. Postal delays of a day or two can happen, and we&apos;ll keep you
              informed.
            </p>
            <div className="mt-6">
              <PlanDeliveryForm
                canSchedule={address !== null}
                minDate={minDate}
                leadDays={leadDays}
                blockedReason={addressHint}
              />
            </div>
          </>
        ) : (
          <div className="mt-6">
            <NoSubscriptionCard status={membership.status} />
          </div>
        )}
      </section>

      <section className={SECTION}>
        <h2 className="font-serif text-2xl font-semibold text-white">Your planned deliveries</h2>

        {deliveries.length === 0 ? (
          <p className="mt-4 text-sm text-white/55">Nothing planned yet.</p>
        ) : (
          <ul className="mt-6 divide-y divide-white/10">
            {deliveries.map((item) => (
              <li key={item.id} className="flex flex-wrap items-start justify-between gap-4 py-4">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-white">
                    {item.kind === "letter" ? "Letter" : "Gift"}
                    {item.occasion && <span className="font-normal text-white/60"> · {item.occasion}</span>}
                  </p>
                  <p className="mt-1 line-clamp-2 text-sm text-white/65">{item.details}</p>
                  <p className="mt-1 text-xs text-white/45">
                    Post on {formatDate(item.sendOn)} · {STATUS_LABEL[item.status] ?? item.status}
                  </p>
                </div>

                {item.status === "scheduled" && (
                  <form action={cancelDeliveryAction}>
                    <input type="hidden" name="id" value={item.id} />
                    <button
                      type="submit"
                      className="rounded-full border border-white/15 px-4 py-1.5 text-xs text-white/75 transition hover:bg-white/10"
                    >
                      Cancel
                    </button>
                  </form>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}