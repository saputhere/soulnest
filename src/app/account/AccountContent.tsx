import { connection } from "next/server";
import { AddressForm } from "@/components/account/AddressForm";
import { PlanDeliveryForm } from "@/components/account/PlanDeliveryForm";
import { getAddress, listDeliveries } from "@/lib/account/accountRepository";
import { earliestSendDate, todayInColombo } from "@/lib/account/deliveryRules";
import { getViewer } from "@/lib/community/viewer";
import { getMembership } from "@/lib/members/membershipRepository";
import { AuthDialog } from "@/components/auth/AuthDialog";
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

function formatDate(isoDate: string): string {
  return new Date(`${isoDate}T00:00:00`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
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
  const minDate = earliestSendDate(address?.isDomestic ?? false, today);
  const leadDays = address?.isDomestic ? 5 : 18;

  let blockedReason: string | null = null;
  if (!isActive) {
    blockedReason = "Planned letters and gifts are for active members. Subscribe on Patreon to unlock them.";
  } else if (!address) {
    blockedReason = "Save your shipping address below before planning a letter or gift.";
  }

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
        <p className="mt-1 text-sm text-white/55">
          Choose the day we should post it. Postal delays of a day or two can happen, and we'll keep you informed.
        </p>
        <div className="mt-6">
          <PlanDeliveryForm
            canSchedule={isActive && address !== null}
            minDate={minDate}
            leadDays={leadDays}
            blockedReason={blockedReason}
          />
        </div>
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