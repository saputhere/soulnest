import { getSql } from "@/lib/db";
import type { CreatePostInput, PostKind, ReportReason } from "./postSchema";
import type { Viewer } from "./viewer";

/** A post is hidden automatically once this many different members have reported it. */
export const REPORT_HIDE_THRESHOLD = 3;

const FEED_LIMIT = 50;

export interface FeedComment {
  readonly id: string;
  readonly displayName: string;
  readonly body: string;
  /** Only populated for admins. */
  readonly realName: string | null;
  readonly canDelete: boolean;
  /** True when the signed-in viewer wrote this message. */
  readonly isMine: boolean;
}

export interface FeedPost {
  readonly id: string;
  readonly kind: PostKind;
  readonly body: string;
  readonly imageUrl: string | null;
  readonly displayName: string;
  readonly createdAt: string;
  /** Only populated for admins. */
  readonly realName: string | null;
  readonly likeCount: number;
  readonly likedByMe: boolean;
  readonly comments: readonly FeedComment[];
  readonly canDelete: boolean;
  readonly canReport: boolean;
}

interface PostRow {
  id: string;
  kind: PostKind;
  body: string;
  image_url: string | null;
  display_name: string;
  created_at: string;
  author_id: string;
  real_name: string | null;
  like_count: number;
  liked_by_me: boolean;
}

interface CommentRow {
  id: string;
  post_id: string;
  display_name: string;
  body: string;
  author_id: string;
  real_name: string | null;
}

export type SetNameResult = { status: "saved" } | { status: "already_set" } | { status: "taken" };
export type CommentResult = { status: "created"; id: string } | { status: "no_name" } | { status: "unavailable" };

function canModify(authorId: string, viewer: Viewer | null): boolean {
  return viewer !== null && (viewer.isAdmin || viewer.id === authorId);
}

function isUniqueViolation(error: unknown): boolean {
  return typeof error === "object" && error !== null && (error as { code?: string }).code === "23505";
}

/** Returns the member's chosen name, or null if they haven't chosen one yet. */
export async function getMemberName(userId: string): Promise<string | null> {
  const sql = getSql();
  const rows = (await sql`
    SELECT display_name FROM users WHERE id = ${userId}::uuid
  `) as { display_name: string | null }[];

  return rows[0]?.display_name ?? null;
}

/**
 * Saves the member's name once. The WHERE clause only matches members who have no name yet,
 * so a second request can never change it. The unique index blocks names already in use.
 */
export async function setMemberName(userId: string, name: string): Promise<SetNameResult> {
  const sql = getSql();
  try {
    const rows = (await sql`
      UPDATE users
      SET display_name = ${name}, display_name_set_at = now()
      WHERE id = ${userId}::uuid AND display_name IS NULL
      RETURNING id
    `) as { id: string }[];

    return rows.length > 0 ? { status: "saved" } : { status: "already_set" };
  } catch (error) {
    if (isUniqueViolation(error)) return { status: "taken" };
    throw error;
  }
}

/**
 * Returns the latest visible posts with likes, comments, and permissions for this viewer.
 * Names come from the member's saved name. Legacy posts without a member name keep their stored name.
 */
export async function listVisiblePosts(viewer: Viewer | null): Promise<FeedPost[]> {
  const sql = getSql();
  const viewerId = viewer?.id ?? null;

  const posts = (await sql`
    SELECT
      p.id,
      p.kind,
      p.body,
      p.image_url,
      COALESCE(u.display_name, p.display_name) AS display_name,
      p.created_at,
      p.user_id AS author_id,
      u.full_name AS real_name,
      (SELECT count(*)::int FROM post_likes l WHERE l.post_id = p.id) AS like_count,
      EXISTS (
        SELECT 1 FROM post_likes l WHERE l.post_id = p.id AND l.user_id = ${viewerId}::uuid
      ) AS liked_by_me
    FROM posts p
    JOIN users u ON u.id = p.user_id
    WHERE p.status = 'visible'
    ORDER BY p.created_at DESC
    LIMIT ${FEED_LIMIT}
  `) as PostRow[];

  if (posts.length === 0) return [];

  const comments = (await sql`
    SELECT
      c.id,
      c.post_id,
      COALESCE(u.display_name, c.display_name) AS display_name,
      c.body,
      c.user_id AS author_id,
      u.full_name AS real_name
    FROM comments c
    JOIN users u ON u.id = c.user_id
    WHERE c.post_id IN (
      SELECT id FROM posts WHERE status = 'visible' ORDER BY created_at DESC LIMIT ${FEED_LIMIT}
    )
    ORDER BY c.created_at ASC
  `) as CommentRow[];

  const commentsByPost = new Map<string, FeedComment[]>();
  for (const row of comments) {
    const list = commentsByPost.get(row.post_id) ?? [];
      list.push({
      id: row.id,
      displayName: row.display_name,
      body: row.body,
      realName: viewer?.isAdmin ? row.real_name : null,
      canDelete: canModify(row.author_id, viewer),
      isMine: viewer?.id === row.author_id,
    });
    commentsByPost.set(row.post_id, list);
  }

  return posts.map((row) => ({
    id: row.id,
    kind: row.kind,
    body: row.body,
    imageUrl: row.image_url,
    displayName: row.display_name,
    createdAt: row.created_at,
    realName: viewer?.isAdmin ? row.real_name : null,
    likeCount: row.like_count,
    likedByMe: row.liked_by_me,
    comments: commentsByPost.get(row.id) ?? [],
    canDelete: canModify(row.author_id, viewer),
    canReport: viewer !== null && viewer.id !== row.author_id,
  }));
}

/** Creates a post using the member's saved name. Returns null if the member hasn't chosen one. */
export async function createPost(userId: string, input: CreatePostInput): Promise<string | null> {
  const sql = getSql();
  const rows = (await sql`
    INSERT INTO posts (user_id, display_name, kind, body)
    SELECT u.id, u.display_name, ${input.kind}::text, ${input.body}::text
    FROM users u
    WHERE u.id = ${userId}::uuid AND u.display_name IS NOT NULL
    RETURNING id
  `) as { id: string }[];

  return rows[0]?.id ?? null;
}

/** Deletes a post if the viewer wrote it or is an admin. Returns true if a row was deleted. */
export async function deletePost(postId: string, viewer: Viewer): Promise<boolean> {
  const sql = getSql();
  const rows = (await sql`
    DELETE FROM posts
    WHERE id = ${postId}::uuid
      AND (user_id = ${viewer.id}::uuid OR ${viewer.isAdmin}::boolean)
    RETURNING id
  `) as { id: string }[];

  return rows.length > 0;
}

/** Likes or unlikes a post for this member. Returns the new state and count. */
export async function toggleLike(postId: string, userId: string): Promise<{ liked: boolean; likeCount: number }> {
  const sql = getSql();

  const removed = (await sql`
    DELETE FROM post_likes
    WHERE post_id = ${postId}::uuid AND user_id = ${userId}::uuid
    RETURNING post_id
  `) as { post_id: string }[];

  let liked = false;
  if (removed.length === 0) {
    const added = (await sql`
      INSERT INTO post_likes (post_id, user_id)
      SELECT p.id, ${userId}::uuid FROM posts p
      WHERE p.id = ${postId}::uuid AND p.status = 'visible'
      ON CONFLICT (post_id, user_id) DO NOTHING
      RETURNING post_id
    `) as { post_id: string }[];
    liked = added.length > 0;
  }

  const [counted] = (await sql`
    SELECT count(*)::int AS likes FROM post_likes WHERE post_id = ${postId}::uuid
  `) as { likes: number }[];

  return { liked, likeCount: counted.likes };
}

/** Adds a comment using the member's saved name. */
export async function createComment(postId: string, userId: string, body: string): Promise<CommentResult> {
  const sql = getSql();
  const rows = (await sql`
    INSERT INTO comments (post_id, user_id, display_name, body)
    SELECT p.id, u.id, u.display_name, ${body}::text
    FROM posts p
    JOIN users u ON u.id = ${userId}::uuid
    WHERE p.id = ${postId}::uuid AND p.status = 'visible' AND u.display_name IS NOT NULL
    RETURNING id
  `) as { id: string }[];

  if (rows.length > 0) return { status: "created", id: rows[0].id };

  const name = await getMemberName(userId);
  return name ? { status: "unavailable" } : { status: "no_name" };
}

/** Deletes a comment if the viewer wrote it or is an admin. */
export async function deleteComment(commentId: string, viewer: Viewer): Promise<boolean> {
  const sql = getSql();
  const rows = (await sql`
    DELETE FROM comments
    WHERE id = ${commentId}::uuid
      AND (user_id = ${viewer.id}::uuid OR ${viewer.isAdmin}::boolean)
    RETURNING id
  `) as { id: string }[];

  return rows.length > 0;
}

/**
 * Records a report once per member and hides the post when the threshold is reached.
 * Returns false if the report was already recorded, the post doesn't exist, or the member reported their own post.
 */
export async function reportPost(postId: string, reporterId: string, reason: ReportReason): Promise<boolean> {
  const sql = getSql();
  const rows = (await sql`
    WITH inserted AS (
      INSERT INTO reports (post_id, reporter_id, reason)
      SELECT p.id, ${reporterId}::uuid, ${reason}
      FROM posts p
      WHERE p.id = ${postId}::uuid AND p.user_id <> ${reporterId}::uuid
      ON CONFLICT (post_id, reporter_id) DO NOTHING
      RETURNING post_id
    )
    UPDATE posts
    SET report_count = report_count + 1,
        status = CASE
          WHEN report_count + 1 >= ${REPORT_HIDE_THRESHOLD} THEN 'hidden'
          ELSE status
        END
    WHERE id = ${postId}::uuid AND EXISTS (SELECT 1 FROM inserted)
    RETURNING id
  `) as { id: string }[];

  return rows.length > 0;
}