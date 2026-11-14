"use client";

import { useActionState, useEffect, useState, useTransition, type ChangeEvent, type FormEvent } from "react";
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

interface AddressValues {
  readonly fullName: string;
  readonly phone: string;
  readonly line1: string;
  readonly line2: string;
  readonly city: string;
  readonly postalCode: string;
  readonly countrySelect: string;
  readonly countryOther: string;
}

/** Converts a saved address (or nothing) into the values the form shows. */
function valuesFrom(address: SavedAddress | null): AddressValues {
  const isListed = address !== null && (COUNTRIES as readonly string[]).includes(address.country);

  return {
    fullName: address?.fullName ?? "",
    phone: address?.phone ?? "",
    line1: address?.line1 ?? "",
    line2: address?.line2 ?? "",
    city: address?.city ?? "",
    postalCode: address?.postalCode ?? "",
    countrySelect: address === null ? "Sri Lanka" : isListed ? address.country : OTHER,
    countryOther: address !== null && !isListed ? address.country : "",
  };
}

export function AddressForm({ address }: { readonly address: SavedAddress | null }) {
  const [state, formAction, isPending] = useActionState(saveAddressAction, INITIAL);
  const [values, setValues] = useState<AddressValues>(() => valuesFrom(address));
  const [, startTransition] = useTransition();

  // Refresh the fields only when the saved address really changes.
  const addressKey = JSON.stringify(address);
  useEffect(() => {
    setValues(valuesFrom(address));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addressKey]);

  const isOther = values.countrySelect === OTHER;
  const countryValue = isOther ? values.countryOther.trim() : values.countrySelect;

  function update(field: keyof AddressValues) {
    return (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setValues((current) => ({ ...current, [field]: event.target.value }));
  }

  /**
   * Submits the data manually instead of letting the form action run. React 19 resets the
   * form's inputs after a native form action, which clears these controlled fields.
   */
  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => {
      formAction(formData);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
          value={values.fullName}
          onChange={update("fullName")}
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
          value={values.phone}
          onChange={update("phone")}
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
          value={values.line1}
          onChange={update("line1")}
          placeholder="House number and street"
        />

        <TextField
          label="Address line 2"
          name="line2"
          wide
          maxLength={120}
          autoComplete="address-line2"
          value={values.line2}
          onChange={update("line2")}
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
          value={values.city}
          onChange={update("city")}
          placeholder="e.g. Colombo"
        />

        <TextField
          label="Postal code"
          name="postalCode"
          maxLength={20}
          autoComplete="postal-code"
          value={values.postalCode}
          onChange={update("postalCode")}
          placeholder="e.g. 00500"
          hint="Optional"
        />

        <SelectField
          label="Country"
          required
          wide
          options={COUNTRIES}
          value={values.countrySelect}
          onChange={update("countrySelect")}
        />

        {isOther ? (
          <TextField
            label="Country name"
            required
            wide
            minLength={2}
            maxLength={60}
            value={values.countryOther}
            onChange={update("countryOther")}
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