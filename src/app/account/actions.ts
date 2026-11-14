"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { cancelDelivery, createDelivery, getAddress, upsertAddress } from "@/lib/account/accountRepository";
import { requireActiveMember, requireSignedIn } from "@/lib/account/access";
import { addressSchema, deliverySchema } from "@/lib/account/accountSchemas";
import { checkSendDate, isDomesticCountry, leadDaysFor, todayInColombo } from "@/lib/account/deliveryRules";

export type ActionState =
  | { readonly status: "idle" }
  | { readonly status: "ok"; readonly message: string }
  | { readonly status: "error"; readonly message: string };

function fail(message: string): ActionState {
  return { status: "error", message };
}

/** Reads a form field as text. Missing fields become an empty string, which validation then rejects. */
function text(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

export async function saveAddressAction(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const access = await requireSignedIn();
  if (!access.ok) return fail(access.error);

  const parsed = addressSchema.safeParse({
    fullName: text(formData, "fullName"),
    phone: text(formData, "phone"),
    line1: text(formData, "line1"),
    line2: text(formData, "line2"),
    city: text(formData, "city"),
    postalCode: text(formData, "postalCode"),
    country: text(formData, "country"),
  });
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Please check your address.");

  await upsertAddress(access.viewer.id, parsed.data, isDomesticCountry(parsed.data.country));
  revalidatePath("/account");
  return { status: "ok", message: "Address saved." };
}

export async function scheduleDeliveryAction(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const access = await requireActiveMember();
  if (!access.ok) return fail(access.error);

  const userId = access.viewer.id;
  const address = await getAddress(userId);
  if (!address) return fail("Save your shipping address first.");

  const parsed = deliverySchema.safeParse({
    kind: text(formData, "kind"),
    occasion: text(formData, "occasion"),
    sendOn: text(formData, "sendOn"),
    details: text(formData, "details"),
  });
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Please check your request.");

  const dateError = checkSendDate(parsed.data.sendOn, address.isDomestic, todayInColombo());
  if (dateError) return fail(dateError);

  const { isDomestic, ...shipTo } = address;
  await createDelivery(userId, parsed.data, leadDaysFor(isDomestic), shipTo);
  revalidatePath("/account");
  return { status: "ok", message: "Scheduled. We'll post it on the date you chose." };
}

export async function cancelDeliveryAction(formData: FormData): Promise<void> {
  const access = await requireSignedIn();
  if (!access.ok) return;

  const id = z.uuid().safeParse(text(formData, "id"));
  if (!id.success) return;

  await cancelDelivery(access.viewer.id, id.data);
  revalidatePath("/account");
}