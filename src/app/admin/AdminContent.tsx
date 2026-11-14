import { connection } from "next/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { DeliveryRow } from "@/components/admin/DeliveryRow";
import { todayInColombo } from "@/lib/account/deliveryRules";
import { listAdminDeliveries } from "@/lib/admin/adminRepository";
import { getAdminViewer } from "@/lib/admin/requireAdmin";
import { DELIVERY_STATUSES, STATUS_LABELS } from "@/lib/admin/deliveryStatus";
import { filtersToQuery, parseFilters } from "@/lib/admin/filters";

interface AdminContentProps {
  readonly searchParams: Promise<{ from?: string; to?: string; status?: string }>;
}

const FIELD =
  "rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2 text-sm text-white focus:border-[#b5f5da]/60 focus:outline-none [color-scheme:dark]";

/** Reads the admin check and deliveries per request. Rendered inside Suspense by the page. */
export async function AdminContent({ searchParams }: AdminContentProps) {
  await connection();

  const admin = await getAdminViewer();
  if (!admin) notFound();

  const params = await searchParams;
  const filters = parseFilters({
    from: params.from ?? todayInColombo(),
    to: params.to,
    status: params.status,
  });
  const deliveries = await listAdminDeliveries(filters);

  const counts = DELIVERY_STATUSES.reduce<Record<string, number>>((acc, status) => {
    acc[status] = deliveries.filter((d) => d.status === status).length;
    return acc;
  }, {});
  const exportQuery = filtersToQuery(filters);

  return (
    <>
      <header className="mt-8">
        <h1 className="font-serif text-4xl font-semibold text-white sm:text-5xl">Deliveries</h1>
        <p className="mt-2 text-sm text-white/55">
          Letters and gifts members have planned. Change the status as you pack and post each one.
        </p>
      </header>

      <section className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {DELIVERY_STATUSES.map((status) => (
          <div key={status} className="rounded-2xl border border-white/10 bg-[#241a40]/70 p-4">
            <p className="text-2xl font-semibold text-white">{counts[status]}</p>
            <p className="mt-1 text-xs text-white/50">{STATUS_LABELS[status]}</p>
          </div>
        ))}
      </section>

      <form
        method="get"
        className="mt-8 flex flex-wrap items-end gap-3 rounded-3xl border border-white/10 bg-[#241a40]/70 p-5"
      >
        <label className="flex flex-col gap-1.5 text-[11px] uppercase tracking-[0.18em] text-white/50">
          From
          <input type="date" name="from" defaultValue={filters.from ?? ""} className={FIELD} />
        </label>
        <label className="flex flex-col gap-1.5 text-[11px] uppercase tracking-[0.18em] text-white/50">
          To
          <input type="date" name="to" defaultValue={filters.to ?? ""} className={FIELD} />
        </label>
        <label className="flex flex-col gap-1.5 text-[11px] uppercase tracking-[0.18em] text-white/50">
          Status
          <select name="status" defaultValue={filters.status ?? ""} className={`${FIELD} pr-8`}>
            <option value="" className="bg-[#241a40]">
              All statuses
            </option>
            {DELIVERY_STATUSES.map((status) => (
              <option key={status} value={status} className="bg-[#241a40]">
                {STATUS_LABELS[status]}
              </option>
            ))}
          </select>
        </label>
        <button
          type="submit"
          className="rounded-full bg-gradient-to-r from-[#c9f7e3] to-[#cfeaff] px-5 py-2 text-sm font-semibold text-[#2a1f4a]"
        >
          Apply
        </button>
        <Link href="/admin" className="px-2 py-2 text-sm text-white/60 hover:text-white">
          Reset
        </Link>
        <a
          href={`/api/admin/deliveries/export${exportQuery ? `?${exportQuery}` : ""}`}
          className="ml-auto rounded-full border border-white/15 px-5 py-2 text-sm text-white/85 transition hover:bg-white/10"
        >
          Download CSV
        </a>
      </form>

      <section className="mt-6">
        {deliveries.length === 0 ? (
          <p className="rounded-3xl border border-dashed border-white/15 p-10 text-center text-white/55">
            Nothing matches these filters.
          </p>
        ) : (
          <ul className="divide-y divide-white/10 rounded-3xl border border-white/10 bg-[#241a40]/60 px-6">
            {deliveries.map((delivery) => (
              <DeliveryRow key={delivery.id} delivery={delivery} />
            ))}
          </ul>
        )}
        {deliveries.length === 500 ? (
          <p className="mt-3 text-xs text-[#ffe9b0]">Showing the first 500. Narrow the dates to see the rest.</p>
        ) : null}
      </section>
    </>
  );
}