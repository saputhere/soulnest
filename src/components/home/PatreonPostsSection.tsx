import { PatreonCarousel } from "./PatreonCarousel";
import { getPublicPatreonPosts } from "@/lib/patreon/patreonPosts";

/** Server component. Loads the cached posts and renders nothing if there are none. */
export async function PatreonPostsSection() {
  const posts = await getPublicPatreonPosts();
  if (posts.length === 0) return null;
  return <PatreonCarousel posts={posts} />;
}