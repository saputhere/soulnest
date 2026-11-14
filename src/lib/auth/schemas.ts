import { z } from "zod";
import { displayNameSchema } from "@/lib/community/postSchema";

export const MIN_PASSWORD_LENGTH = 8;
export const MAX_PASSWORD_LENGTH = 128;
export const MAX_EMAIL_LENGTH = 254;

/** Local part and domain with single separators only, ending in a top-level domain of 2+ letters. */
const EMAIL_PATTERN = /^[a-z0-9]+([._%+-][a-z0-9]+)*@[a-z0-9]+([.-][a-z0-9]+)*\.[a-z]{2,}$/;

const COMMON_PASSWORDS = new Set([
  "password",
  "password1",
  "password123",
  "12345678",
  "123456789",
  "1234567890",
  "qwerty123",
  "qwertyuiop",
  "iloveyou",
  "letmein1",
  "welcome1",
  "admin123",
  "soulnest",
  "soulnest1",
]);

export interface PasswordCheck {
  readonly id: "length" | "letter" | "number" | "common" | "email";
  readonly label: string;
  readonly passed: boolean;
}

/**
 * One list of password rules, used for the live checklist in the browser and for server validation.
 * An empty password fails the length rule, so the checklist never shows everything as met.
 */
export function getPasswordChecks(password: string, email = ""): PasswordCheck[] {
  const emailName = (email.split("@")[0] ?? "").toLowerCase();

  return [
    {
      id: "length",
      label: `At least ${MIN_PASSWORD_LENGTH} characters`,
      passed: password.length >= MIN_PASSWORD_LENGTH && password.length <= MAX_PASSWORD_LENGTH,
    },
    { id: "letter", label: "Contains a letter", passed: /[A-Za-z]/.test(password) },
    { id: "number", label: "Contains a number", passed: /\d/.test(password) },
    {
      id: "common",
      label: "Not a common password",
      passed: !COMMON_PASSWORDS.has(password.toLowerCase()),
    },
    {
      id: "email",
      label: "Doesn't contain your email name",
      passed: emailName.length < 3 || !password.toLowerCase().includes(emailName),
    },
  ];
}

const PASSWORD_MESSAGES: Record<PasswordCheck["id"], string> = {
  length: `Use at least ${MIN_PASSWORD_LENGTH} characters.`,
  letter: "Include at least one letter.",
  number: "Include at least one number.",
  common: "That password is too common. Choose something less predictable.",
  email: "Your password can't contain the name part of your email.",
};

export const emailSchema = z
  .string({ error: "Please enter your email address." })
  .trim()
  .toLowerCase()
  .min(1, "Please enter your email address.")
  .max(MAX_EMAIL_LENGTH, "Email addresses can be up to 254 characters.")
  .refine((value) => value.split("@")[0]?.length <= 64, "The part before the @ is too long.")
  .refine((value) => EMAIL_PATTERN.test(value), "Please enter a valid email address, such as name@example.com.");

export const loginSchema = z.object({
  email: emailSchema,
  password: z
    .string({ error: "Please enter your password." })
    .min(1, "Please enter your password.")
    .max(MAX_PASSWORD_LENGTH, `Passwords can be up to ${MAX_PASSWORD_LENGTH} characters.`),
});

export const signupSchema = z
  .object({
    name: z
      .string({ error: "Please enter your name." })
      .trim()
      .min(2, "Please enter your name (at least 2 characters).")
      .max(80, "Names can be up to 80 characters."),
    displayName: displayNameSchema.shape.name,
    email: emailSchema,
    password: z
      .string({ error: "Please create a password." })
      .max(MAX_PASSWORD_LENGTH, `Passwords can be up to ${MAX_PASSWORD_LENGTH} characters.`),
  })
  .superRefine((data, ctx) => {
    for (const check of getPasswordChecks(data.password, data.email)) {
      if (!check.passed) {
        ctx.addIssue({ code: "custom", path: ["password"], message: PASSWORD_MESSAGES[check.id] });
      }
    }
  });