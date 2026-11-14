import { PatreonCarousel } from "./PatreonCarousel";
import { getPublicPatreonPosts } from "@/lib/patreon/patreonPosts";

/** Server component. Loads cached posts, logs any failure, and renders nothing when there are no public posts. */
export async function PatreonPostsSection() {
  try {
    const posts = await getPublicPatreonPosts();
    if (posts.length === 0) {
      console.info("[patreon] no public posts to show");
      return null;
    }
    return <PatreonCarousel posts={posts} />;
  } catch (error) {
    console.error("[patreon] carousel hidden:", error instanceof Error ? error.message : error);
    return null;
  }
}