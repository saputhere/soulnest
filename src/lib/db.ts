import { neon } from "@neondatabase/serverless";

/** Returns a Neon SQL client. Throws a clear error if the connection string is missing. */
export function getSql() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not set.");
  }
  return neon(databaseUrl);
}