import { connection } from "next/server";
import { notFound } from "next/navigation";
import { addDays, todayInColombo } from "@/lib/account/deliveryRules";
import { listAdminDeliveries, type AdminDelivery } from "@/lib/admin/adminRepository";
import { getAdminViewer } from "@/lib/admin/requireAdmin";
import { formatIsoDate, KIND_LABELS, STATUS_LABELS } from "@/lib/admin/deliveryStatus";
import { parseFilters } from "@/lib/admin/filters";

interface PackingContentProps {
  readonly searchParams: Promise<{ from?: string; to?: string }>;
}

function groupByDate(rows: readonly AdminDelivery[]): [string, AdminDelivery[]][] {
  const groups = new Map<string, AdminDelivery[]>();
  for (const row of rows) {
    const list = groups.get(row.sendOn) ?? [];
    list.push(row);
    groups.set(row.sendOn, list);
  }
  return [...groups.entries()];
}

/** Admin-only packing list. Rendered inside Suspense by the page. */
export async function PackingContent({ searchParams }: PackingContentProps) {
  await connection();

  const admin = await getAdminViewer();
  if (!admin) notFound();

  const params = await searchParams;
  const today = todayInColombo();
  const filters = parseFilters({
    from: params.from ?? today,
    to: params.to ?? addDays(today, 7),
  });

  // Cancelled deliveries aren't packed, so they're left off the list.
  const deliveries = (await listAdminDeliveries(filters)).filter((d) => d.status !== "cancelled");
  const groups = groupByDate(deliveries);

  return (
    <>
      <header className="mt-8">
        <h1 className="font-serif text-4xl font-semibold text-white">Packing list</h1>
        <p className="mt-2 text-sm text-white/55">
          {formatIsoDate(filters.from ?? today)} to {formatIsoDate(filters.to ?? addDays(today, 7))} ·{" "}
          {deliveries.length} {deliveries.length === 1 ? "item" : "items"}
        </p>
        <form method="get" className="mt-4 flex flex-wrap items-end gap-3 print:hidden">
          <label className="flex flex-col gap-1 text-xs text-white/55">
            From
            <input
              type="date"
              name="from"
              defaultValue={filters.from ?? today}
              className="rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2 text-sm text-white [color-scheme:dark]"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-white/55">
            To
            <input
              type="date"
              name="to"
              defaultValue={filters.to ?? addDays(today, 7)}
              className="rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2 text-sm text-white [color-scheme:dark]"
            />
          </label>
          <button
            type="submit"
            className="rounded-full bg-gradient-to-r from-[#c9f7e3] to-[#cfeaff] px-5 py-2 text-sm font-semibold text-[#2a1f4a]"
          >
            Update
          </button>
        </form>
      </header>

      {groups.length === 0 ? (
        <p className="mt-10 text-white/55">Nothing to pack in this range.</p>
      ) : (
        groups.map(([date, rows]) => (
          <section key={date} className="packing-section mt-10">
            <h2 className="border-b border-white/15 pb-2 font-serif text-2xl text-white">
              Post on {formatIsoDate(date)}
            </h2>
            <ol className="mt-4 space-y-4">
              {rows.map((row, index) => (
                <li
                  key={row.id}
                  className="rounded-2xl border border-white/10 bg-[#241a40]/60 p-5 text-sm leading-relaxed text-white/85"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-semibold text-white">
                      {index + 1}. {row.memberName}
                    </p>
                    <p className="text-xs text-white/55">
                      {KIND_LABELS[row.kind]} · {STATUS_LABELS[row.status]}
                    </p>
                  </div>
                  {row.occasion ? <p className="mt-1 text-xs text-[#ffe9b0]">Occasion: {row.occasion}</p> : null}
                  <address className="mt-3 not-italic text-white/75">
                    {row.ship.fullName} · {row.ship.phone}
                    <br />
                    {row.ship.line1}
                    {row.ship.line2 ? `, ${row.ship.line2}` : ""}
                    <br />
                    {row.ship.city} {row.ship.postalCode}, {row.ship.country}
                  </address>
                  <p className="mt-3 whitespace-pre-line rounded-xl bg-white/[0.04] p-3 text-white/80">
                    {row.details}
                  </p>
                </li>
              ))}
            </ol>
          </section>
        ))
      )}
    </>
  );
}