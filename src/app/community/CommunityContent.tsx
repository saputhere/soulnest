import { connection } from "next/server";
import { MembershipCard } from "@/components/community/MembershipCard";
import { NameSetup } from "@/components/community/NameSetup";
import { NewPostForm } from "@/components/community/NewPostForm";
import { PostCard } from "@/components/community/PostCard";
import { siteContent } from "@/content/siteContent";
import { getMemberName, listVisiblePosts } from "@/lib/community/communityRepository";
import { getViewer } from "@/lib/community/viewer";
import { getMembership } from "@/lib/members/membershipRepository";
import { signInWithPatreon } from "./actions";

/** Reads the visitor's session, name, membership, and posts on each request. */
export async function CommunityContent() {
  await connection();

  const viewer = await getViewer();
  const displayName = viewer ? await getMemberName(viewer.id) : null;
  const membership = viewer ? await getMembership(viewer.id) : null;
  const posts = await listVisiblePosts(viewer);

  return (
    <>
      <section className="mx-auto mt-8 max-w-2xl space-y-5">
        {!viewer ? (
          <div className="rounded-[2rem] border border-white/10 bg-[#241a40]/80 p-8 shadow-xl backdrop-blur">
            <p className="font-serif text-2xl text-white">Come share a little of your heart.</p>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-white/65">
              Sign in with your Patreon account to post, like, and reply. Your membership status will show here.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <form action={signInWithPatreon}>
                <button
                  type="submit"
                  className="rounded-full bg-gradient-to-r from-[#c9f7e3] to-[#cfeaff] px-7 py-3 font-semibold text-[#2a1f4a] shadow-lg transition hover:-translate-y-0.5"
                >
                  Sign in with Patreon
                </button>
              </form>
              <a
                href={siteContent.subscribeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-white/20 px-7 py-3 font-semibold text-white transition hover:bg-white/10"
              >
                Subscribe on Patreon
              </a>
            </div>
          </div>
        ) : (
          <>
            {membership && <MembershipCard membership={membership} />}
            {displayName ? <NewPostForm displayName={displayName} /> : <NameSetup />}
          </>
        )}
      </section>

      <section className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-3 xl:grid-cols-4">
        {posts.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-white/15 p-10 text-center md:col-span-full">
            <p className="font-serif text-xl text-white/80">The space is quiet for now.</p>
            <p className="mt-1 text-sm text-white/50">Be the first to share an idea or a thought.</p>
          </div>
        ) : (
          posts.map((post) => <PostCard key={post.id} post={post} isSignedIn={viewer !== null} />)
        )}
      </section>
    </>
  );
}