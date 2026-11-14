import { NextResponse } from "next/server";
import { listAdminDeliveries } from "@/lib/admin/adminRepository";
import { getAdminViewer } from "@/lib/admin/requireAdmin";
import { parseFilters } from "@/lib/admin/filters";
import { toCsv } from "@/lib/admin/csv";
import { todayInColombo } from "@/lib/account/deliveryRules";

/** Admin-only CSV of deliveries with the same filters as the dashboard. Contains personal data, so it's never cached. */
export async function GET(request: Request): Promise<NextResponse> {
  const admin = await getAdminViewer();
  if (!admin) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const url = new URL(request.url);
  const filters = parseFilters({
    from: url.searchParams.get("from") ?? undefined,
    to: url.searchParams.get("to") ?? undefined,
    status: url.searchParams.get("status") ?? undefined,
  });

  const rows = await listAdminDeliveries(filters);
  const filename = `soulnest-deliveries-${todayInColombo()}.csv`;

  return new NextResponse(toCsv(rows), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}