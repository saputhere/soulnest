import { cacheLife } from "next/cache";

export interface PatreonPost {
  readonly id: string;
  readonly title: string;
  readonly teaser: string;
  readonly url: string;
  readonly publishedAt: string | null;
}

interface PatreonPostResource {
  readonly id: string;
  readonly attributes: {
    readonly title?: string | null;
    readonly url?: string | null;
    readonly published_at?: string | null;
    readonly is_public?: boolean;
    readonly is_paid?: boolean;
  };
}

const MAX_POSTS = 8;
const PATREON_ORIGIN = "https://www.patreon.com";
const FALLBACK_URL = "https://www.patreon.com/cw/soulnest";

/**
 * Post fields Patreon accepts on this endpoint. Requesting any other field, such as
 * `teaser_text` or `patreon_url`, makes the whole request fail with a 400.
 */
const POST_FIELDS = ["title", "url", "published_at", "is_public", "is_paid"];

export class PatreonPostsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PatreonPostsError";
  }
}

/**
 * Patreon returns post URLs as paths such as "/soulnest/posts/slug-123". Those only work
 * on Patreon, so they must be resolved against Patreon's origin, not this site's domain.
 * Absolute URLs are kept as they are. Anything else falls back to the creator page.
 */
export function toPatreonUrl(value: string | null | undefined): string {
  if (!value) return FALLBACK_URL;
  if (value.startsWith("https://") || value.startsWith("http://")) return value;
  if (value.startsWith("/")) return `${PATREON_ORIGIN}${value}`;
  return FALLBACK_URL;
}

/**
 * Fetches the campaign's posts and keeps only the ones Patreon marks public.
 * Failures throw, so an error is never cached as "no posts".
 */
export async function getPublicPatreonPosts(): Promise<PatreonPost[]> {
  "use cache";
  cacheLife("minutes");

  const token = process.env.PATREON_CREATOR_ACCESS_TOKEN;
  const campaignId = process.env.PATREON_CAMPAIGN_ID;

  if (!token) throw new PatreonPostsError("PATREON_CREATOR_ACCESS_TOKEN is not set.");
  if (!campaignId) throw new PatreonPostsError("PATREON_CAMPAIGN_ID is not set.");

  const params = new URLSearchParams({
    "fields[post]": POST_FIELDS.join(","),
    "page[count]": "20",
    sort: "-published_at",
  });

  const response = await fetch(
    `${PATREON_ORIGIN}/api/oauth2/v2/campaigns/${campaignId}/posts?${params}`,
    { headers: { Authorization: `Bearer ${token}` } },
  );

  if (!response.ok) {
    const detail = (await response.text()).slice(0, 300);
    throw new PatreonPostsError(`Patreon returned ${response.status}: ${detail}`);
  }

  const payload = (await response.json()) as { data?: PatreonPostResource[] };
  const allPosts = payload.data ?? [];
  const publicPosts = allPosts.filter((post) => post.attributes.is_public === true);

  console.info(`[patreon] fetched ${allPosts.length} posts, ${publicPosts.length} public`);

  return publicPosts.slice(0, MAX_POSTS).map((post) => ({
    id: post.id,
    title: post.attributes.title ?? "Untitled post",
    teaser: "",
    url: toPatreonUrl(post.attributes.url),
    publishedAt: post.attributes.published_at ?? null,
  }));
}