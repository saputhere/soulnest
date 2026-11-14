import { z } from "zod";

export const addressSchema = z.object({
  fullName: z.string().trim().min(2, "Please enter your full name.").max(80),
  phone: z
    .string()
    .trim()
    .min(7, "Please enter a phone number.")
    .max(20)
    .regex(/^[+0-9 ()-]+$/, "Phone numbers can use digits, spaces, +, -, and brackets."),
  line1: z.string().trim().min(3, "Please enter your street address.").max(120),
  line2: z.string().trim().max(120),
  city: z.string().trim().min(2, "Please enter your city.").max(80),
  postalCode: z.string().trim().max(20),
  country: z.string().trim().min(2, "Please enter your country.").max(60),
});

export const deliverySchema = z.object({
  kind: z.enum(["letter", "gift"], { error: "Choose a letter or a gift." }),
  occasion: z.string().trim().max(80),
  sendOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Please choose a date."),
  details: z
    .string()
    .trim()
    .min(1, "Please write your letter or gift request.")
    .max(2000, "Please keep it under 2000 characters."),
});

export type AddressInput = z.infer<typeof addressSchema>;
export type DeliveryInput = z.infer<typeof deliverySchema>;