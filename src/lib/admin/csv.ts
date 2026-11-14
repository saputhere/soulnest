import type { AdminDelivery } from "./adminRepository";
import { STATUS_LABELS, KIND_LABELS } from "./deliveryStatus";

/** Cells starting with these characters can run as formulas in Excel or Sheets, so they get a leading apostrophe. */
const FORMULA_START = /^[=+\-@\t\r]/;

function cell(value: string | null | undefined): string {
  let text = value ?? "";
  if (FORMULA_START.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}

const HEADERS = [
  "Post on",
  "Status",
  "Type",
  "Occasion",
  "Member",
  "Email",
  "Full name",
  "Phone",
  "Address line 1",
  "Address line 2",
  "City",
  "Postal code",
  "Country",
  "Request",
];

export function toCsv(rows: readonly AdminDelivery[]): string {
  const lines = rows.map((row) =>
    [
      row.sendOn,
      STATUS_LABELS[row.status],
      KIND_LABELS[row.kind],
      row.occasion,
      row.memberName,
      row.memberEmail,
      row.ship.fullName,
      row.ship.phone,
      row.ship.line1,
      row.ship.line2,
      row.ship.city,
      row.ship.postalCode,
      row.ship.country,
      row.details,
    ]
      .map(cell)
      .join(","),
  );

  return [HEADERS.map(cell).join(","), ...lines].join("\r\n");
}