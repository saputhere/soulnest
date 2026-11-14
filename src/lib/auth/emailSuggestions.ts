/** Common mistakes, mapped to the intended domain. Pure code, so the browser and server can both use it. */
const TYPO_FIXES: Record<string, string> = {
  "gmial.com": "gmail.com",
  "gmai.com": "gmail.com",
  "gmail.co": "gmail.com",
  "gmail.lk": "gmail.com",
  "gamil.com": "gmail.com",
  "yahooo.com": "yahoo.com",
  "yaho.com": "yahoo.com",
  "hotmial.com": "hotmail.com",
  "hotmai.com": "hotmail.com",
  "outlok.com": "outlook.com",
  "iclod.com": "icloud.com",
};

/** Returns a corrected address if the domain looks like a typo, otherwise null. */
export function suggestEmailFix(email: string): string | null {
  const at = email.lastIndexOf("@");
  if (at < 1) return null;

  const domain = email.slice(at + 1).toLowerCase();
  const fixed = TYPO_FIXES[domain];
  return fixed ? `${email.slice(0, at)}@${fixed}` : null;
}