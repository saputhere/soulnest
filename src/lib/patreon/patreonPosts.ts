import { cacheLife } from "next/cache";

export interface PatreonPost {
  readonly id: string;
  readonly title: string;
  readonly teaser: string;
  readonly url: string;
  readonly publishedAt: string | null;
  readonly imageUrl: string | null;
}

interface PatreonPostResource {
  readonly id: string;
  readonly attributes: {
    readonly title?: string | null;
    readonly teaser_text?: string | null;
    readonly url?: string | null;
    readonly published_at?: string | null;
    readonly is_public?: boolean;
    readonly image?: { readonly large_url?: string; readonly url?: string } | null;
  };
}

const MAX_POSTS = 8;
const FALLBACK_URL = "https://www.patreon.com/cw/soulnest";

/**
 * Fetches the latest public posts from the campaign. Runs on the server and is cached for an hour.
 * Only posts marked public are returned, so paid-only content never reaches the home page.
 * Returns an empty list if anything is missing or fails, so the home page still loads.
 */
export async function getPublicPatreonPosts(): Promise<PatreonPost[]> {
  "use cache";
  cacheLife("hours");

  const token = process.env.PATREON_CREATOR_ACCESS_TOKEN;
  const campaignId = process.env.PATREON_CAMPAIGN_ID;
  if (!token || !campaignId) return [];

  const params = new URLSearchParams({
    "fields[post]": "title,teaser_text,url,published_at,is_public,image",
    "page[count]": "20",
    sort: "-published_at",
  });

  try {
    const response = await fetch(
      `https://www.patreon.com/api/oauth2/v2/campaigns/${campaignId}/posts?${params}`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    if (!response.ok) return [];

    const payload = (await response.json()) as { data?: PatreonPostResource[] };

    return (payload.data ?? [])
      .filter((post) => post.attributes.is_public === true)
      .slice(0, MAX_POSTS)
      .map((post) => ({
        id: post.id,
        title: post.attributes.title ?? "Untitled post",
        teaser: post.attributes.teaser_text ?? "",
        url: post.attributes.url ?? FALLBACK_URL,
        publishedAt: post.attributes.published_at ?? null,
        imageUrl: post.attributes.image?.large_url ?? post.attributes.image?.url ?? null,
      }));
  } catch {
    return [];
  }
}