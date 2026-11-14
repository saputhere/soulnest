"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getAdminViewer } from "@/lib/admin/requireAdmin";
import { DELIVERY_STATUSES } from "@/lib/admin/deliveryStatus";
import { setDeliveryStatus } from "@/lib/admin/adminRepository";

const updateSchema = z.object({
  id: z.uuid(),
  status: z.enum(DELIVERY_STATUSES),
});

/** Changes one delivery's status. Admin-only, and the input is validated before it reaches the database. */
export async function updateDeliveryStatusAction(formData: FormData): Promise<void> {
  const admin = await getAdminViewer();
  if (!admin) return;

  const parsed = updateSchema.safeParse({
    id: formData.get("id"),
    status: formData.get("status"),
  });
  if (!parsed.success) return;

  await setDeliveryStatus(parsed.data.id, parsed.data.status);
  revalidatePath("/admin");
  revalidatePath("/admin/packing");
}