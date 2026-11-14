"use client";

import { useActionState, useState } from "react";
import { saveAddressAction, type ActionState } from "@/app/account/actions";
import { FormStatus, RequiredNote, SelectField, TextField } from "@/components/ui/FormFields";
import type { SavedAddress } from "@/lib/account/accountRepository";

const OTHER = "Other";
const COUNTRIES = [
  "Sri Lanka",
  "India",
  "Maldives",
  "United Kingdom",
  "United States",
  "Canada",
  "Australia",
  "Singapore",
  "United Arab Emirates",
  OTHER,
] as const;

const INITIAL: ActionState = { status: "idle" };

/** Pre-selects a saved country. Countries outside the list go into the "Other" text box. */
function countryFields(country: string | undefined): { select: string; other: string } {
  if (!country) return { select: "Sri Lanka", other: "" };
  if ((COUNTRIES as readonly string[]).includes(country)) return { select: country, other: "" };
  return { select: OTHER, other: country };
}

export function AddressForm({ address }: { readonly address: SavedAddress | null }) {
  const [state, formAction, isPending] = useActionState(saveAddressAction, INITIAL);
  const initial = countryFields(address?.country);
  const [countrySelect, setCountrySelect] = useState(initial.select);
  const [countryOther, setCountryOther] = useState(initial.other);

  const isOther = countrySelect === OTHER;
  const countryValue = isOther ? countryOther.trim() : countrySelect;

  return (
    <form action={formAction} className="space-y-6">
      <RequiredNote />

      <fieldset className="grid min-w-0 gap-5 border-0 p-0 sm:grid-cols-2">
        <legend className="sr-only">Shipping address</legend>

        <TextField
          label="Full name"
          name="fullName"
          required
          minLength={2}
          maxLength={80}
          autoComplete="name"
          defaultValue={address?.fullName}
          placeholder="As it should appear on the parcel"
        />

        <TextField
          label="Phone"
          name="phone"
          required
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          pattern="[+0-9 ()\-]{7,20}"
          title="Use digits, spaces, +, -, or brackets (7 to 20 characters)."
          maxLength={20}
          defaultValue={address?.phone}
          placeholder="+94 77 123 4567"
          hint="For delivery questions"
        />

        <TextField
          label="Address line 1"
          name="line1"
          required
          wide
          minLength={3}
          maxLength={120}
          autoComplete="address-line1"
          defaultValue={address?.line1}
          placeholder="House number and street"
        />

        <TextField
          label="Address line 2"
          name="line2"
          wide
          maxLength={120}
          autoComplete="address-line2"
          defaultValue={address?.line2}
          placeholder="Apartment, building, landmark"
          hint="Optional"
        />

        <TextField
          label="City"
          name="city"
          required
          minLength={2}
          maxLength={80}
          autoComplete="address-level2"
          defaultValue={address?.city}
          placeholder="e.g. Colombo"
        />

        <TextField
          label="Postal code"
          name="postalCode"
          maxLength={20}
          autoComplete="postal-code"
          defaultValue={address?.postalCode}
          placeholder="e.g. 00500"
          hint="Optional"
        />

        <SelectField
          label="Country"
          required
          wide
          options={COUNTRIES}
          value={countrySelect}
          onChange={(event) => setCountrySelect(event.target.value)}
        />

        {isOther ? (
          <TextField
            label="Country name"
            required
            wide
            minLength={2}
            maxLength={60}
            value={countryOther}
            onChange={(event) => setCountryOther(event.target.value)}
            placeholder="Type your country"
          />
        ) : null}

        <input type="hidden" name="country" value={countryValue} />
      </fieldset>

      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-5">
        <FormStatus status={state.status} message={state.status === "idle" ? undefined : state.message} />
        <button
          type="submit"
          disabled={isPending}
          className="rounded-full bg-gradient-to-r from-[#c9f7e3] to-[#cfeaff] px-7 py-2.5 text-sm font-semibold text-[#2a1f4a] shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl disabled:translate-y-0 disabled:opacity-50"
        >
          {isPending ? "Saving..." : "Save address"}
        </button>
      </div>
    </form>
  );
}