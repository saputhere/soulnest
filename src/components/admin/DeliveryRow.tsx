import { updateDeliveryStatusAction } from "@/app/admin/actions";
import {
  DELIVERY_STATUSES,
  formatIsoDate,
  KIND_LABELS,
  STATUS_LABELS,
} from "@/lib/admin/deliveryStatus";
import type { AdminDelivery } from "@/lib/admin/adminRepository";

const SELECT =
  "cursor-pointer appearance-none rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2 pr-8 text-sm text-white focus:border-[#b5f5da]/60 focus:outline-none [color-scheme:dark]";

const BUTTON =
  "rounded-full bg-gradient-to-r from-[#c9f7e3] to-[#cfeaff] px-4 py-2 text-xs font-semibold text-[#2a1f4a] transition hover:-translate-y-0.5";

/** One delivery: who it's for, what they asked for, the address, and a status control. */
export function DeliveryRow({ delivery }: { readonly delivery: AdminDelivery }) {
  const { ship } = delivery;

  return (
    <li className="grid gap-5 py-6 lg:grid-cols-[1fr_1.3fr_auto]">
      <div className="min-w-0 space-y-1">
        <p className="text-[11px] uppercase tracking-[0.2em] text-white/45">
          Post on {formatIsoDate(delivery.sendOn)} · {KIND_LABELS[delivery.kind]}
        </p>
        <p className="font-semibold text-white">{delivery.memberName}</p>
        <p className="break-all text-xs text-white/55">{delivery.memberEmail}</p>
        {delivery.occasion ? (
          <p className="text-xs text-[#ffe9b0]">Occasion: {delivery.occasion}</p>
        ) : null}
      </div>

      <div className="min-w-0 space-y-3">
        <p className="whitespace-pre-line break-words text-sm leading-relaxed text-white/85">{delivery.details}</p>
        <address className="not-italic text-xs leading-relaxed text-white/55">
          <span className="text-white/80">{ship.fullName}</span> · {ship.phone}
          <br />
          {ship.line1}
          {ship.line2 ? `, ${ship.line2}` : ""}
          <br />
          {ship.city} {ship.postalCode}, {ship.country}
        </address>
      </div>

      <form action={updateDeliveryStatusAction} className="flex items-start gap-2 lg:flex-col lg:items-end">
        <input type="hidden" name="id" value={delivery.id} />
        <div className="relative">
          <select name="status" defaultValue={delivery.status} aria-label="Delivery status" className={SELECT}>
            {DELIVERY_STATUSES.map((status) => (
              <option key={status} value={status} className="bg-[#241a40] text-white">
                {STATUS_LABELS[status]}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className={BUTTON}>
          Save
        </button>
      </form>
    </li>
  );
}