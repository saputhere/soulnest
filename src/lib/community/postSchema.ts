import { z } from "zod";

export const POST_KINDS = ["idea", "thought", "reflection"] as const;
export type PostKind = (typeof POST_KINDS)[number];

export const REPORT_REASONS = ["harmful", "harassment", "spam", "other"] as const;
export type ReportReason = (typeof REPORT_REASONS)[number];

export const MAX_POST_LENGTH = 1000;
export const MAX_COMMENT_LENGTH = 500;
export const DISPLAY_NAME_MIN = 3;
export const DISPLAY_NAME_MAX = 24;

const RESERVED_NAMES = ["admin", "administrator", "soulnest", "support", "moderator", "team"];

/** The one name a member chooses. Names are locked after the first save. */
export const displayNameSchema = z.object({
  name: z
    .string()
    .trim()
    .min(DISPLAY_NAME_MIN, `Names need at least ${DISPLAY_NAME_MIN} characters.`)
    .max(DISPLAY_NAME_MAX, `Names can be up to ${DISPLAY_NAME_MAX} characters.`)
    .regex(/^[\p{L}\p{N}][\p{L}\p{N} ._-]*$/u, "Use letters, numbers, spaces, dots, dashes, or underscores.")
    .refine((value) => !RESERVED_NAMES.includes(value.toLowerCase()), "That name is reserved."),
});

export const createPostSchema = z.object({
  kind: z.enum(POST_KINDS),
  body: z.string().trim().min(1).max(MAX_POST_LENGTH),
});

export const commentSchema = z.object({
  body: z.string().trim().min(1).max(MAX_COMMENT_LENGTH),
});

export const reportSchema = z.object({
  reason: z.enum(REPORT_REASONS),
});

export const postIdSchema = z.uuid();
export const commentIdSchema = z.uuid();

export type CreatePostInput = z.infer<typeof createPostSchema>;