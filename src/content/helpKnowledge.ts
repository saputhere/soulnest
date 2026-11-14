import { DOMESTIC_LEAD_DAYS, INTERNATIONAL_LEAD_DAYS } from "@/lib/account/deliveryRules";

export const SUPPORT_EMAIL = "soulme@gmail.com";

export interface HelpEntry {
  readonly id: string;
  /** The question shown as a suggestion chip. */
  readonly question: string;
  /** Words or phrases that signal this topic. Matching is case-insensitive. */
  readonly keywords: readonly string[];
  readonly answer: string;
}

export const HELP_ENTRIES: readonly HelpEntry[] = [
  {
    id: "crisis",
    question: "I'm not okay",
    keywords: ["suicide", "kill myself", "hurt myself", "end my life", "self harm", "not okay", "want to die"],
    answer:
      "I'm really sorry you're feeling this way. Please reach out to someone right now. In Sri Lanka, you can call 119 for emergency help, or Sumithrayo on 1333. If you're somewhere else, please contact your local emergency number. You don't have to go through this alone.",
  },
  {
    id: "subscribe",
    question: "How do I subscribe?",
    keywords: ["subscribe", "subscription", "join", "membership", "become a member", "sign up for", "price", "cost"],
    answer:
      "Press Subscribe on Patreon on the home page or the community page. Payments are handled securely by Patreon. Once you've subscribed, go to My account and press Refresh status so SoulNest picks up your membership.",
  },
  {
    id: "refresh-membership",
    question: "I subscribed but it still says I'm not a member",
    keywords: ["not showing", "still not", "refresh", "not active", "subscribed but", "no subscription", "membership not"],
    answer:
      "Your membership is checked when you sign in. Go to My account and press Refresh status, or sign out and sign in with Patreon again. If Patreon asks you to approve the membership permission, please approve it. If it still doesn't update, contact us and include the email you used on Patreon.",
  },
  {
    id: "change-address",
    question: "How do I change my address?",
    keywords: ["address", "change address", "update address", "shipping", "delivery address", "move house", "moved"],
    answer:
      "Sign in and open My account. Edit the fields under Shipping address, then press Save address. New deliveries use the address you save. Deliveries you've already planned keep the address they were planned with, so cancel and re-plan any that need a new address.",
  },
  {
    id: "plan-letter",
    question: "How do I plan a letter or gift?",
    keywords: ["plan", "letter", "gift", "schedule", "future letter", "send me", "surprise", "graduation", "birthday"],
    answer:
      `You need an active membership and a saved address. In My account, choose Letter or Gift, pick the day we should post it, and write your request. Posts must be planned at least ${DOMESTIC_LEAD_DAYS} days ahead for Sri Lanka, or ${INTERNATIONAL_LEAD_DAYS} days ahead internationally. Postal delays of a day or two can happen, and we'll keep you informed.`,
  },
  {
    id: "lead-time",
    question: "How far ahead should I plan?",
    keywords: ["how far", "lead time", "how many days", "earliest", "ahead", "minimum"],
    answer:
      `Plan at least ${DOMESTIC_LEAD_DAYS} days ahead for Sri Lanka and ${INTERNATIONAL_LEAD_DAYS} days ahead for international addresses. The earliest allowed date is shown beside the Post on field.`,
  },
  {
    id: "cancel-delivery",
    question: "Can I cancel a planned letter or gift?",
    keywords: ["cancel", "remove", "delete plan", "undo", "stop delivery"],
    answer:
      "Yes. Under Your planned deliveries in My account, press Cancel. You can cancel until we've packed the item. After it's packed, it can't be cancelled from the site, so contact us.",
  },
  {
    id: "delivery-delay",
    question: "My parcel is late. What now?",
    keywords: ["late", "delay", "not arrived", "where is", "tracking", "lost", "missing parcel"],
    answer:
      `Postal delays of a day or two are normal. If it's been longer than that, contact us with your name and the date it was due to be posted. Include the email you used so we can find your order.`,
  },
  {
    id: "password",
    question: "I forgot my password",
    keywords: ["password", "forgot", "reset", "can't log in", "cannot log in", "locked out", "login problem"],
    answer:
      "Open Sign up / Log in, choose Forgot password, and enter your email. We'll send a reset link that works for one hour. If you signed up with Patreon, you don't need a password. Use Continue with Patreon instead.",
  },
  {
    id: "verify-email",
    question: "I didn't get the verification email",
    keywords: ["verify", "verification", "confirm email", "no email", "didn't get", "spam", "activate"],
    answer:
      "Check your spam or junk folder first. On the log-in form, press Resend verification email. Each link works for 24 hours.",
  },
  {
    id: "display-name",
    question: "Can I change my community name?",
    keywords: ["display name", "community name", "username", "change name", "rename", "nickname"],
    answer:
      "Your community name is chosen once and then stays the same, so other members can recognise you. Contact us if you have a good reason to change it.",
  },
  {
    id: "delete-post",
    question: "How do I delete my post or comment?",
    keywords: ["delete post", "delete comment", "remove post", "remove comment", "delete my", "take down"],
    answer:
      "On your own post, open the ... menu and choose Delete post. On your own message in a chat, hover over it and press Delete. Admins can also remove content that breaks the community guidelines.",
  },
  {
    id: "report",
    question: "How do I report a post?",
    keywords: ["report", "abuse", "harassment", "spam", "inappropriate", "unsafe post"],
    answer:
      "Open the ... menu on any post from another member and choose a reason under Report. Posts reported by several different members are hidden while we review them.",
  },
  {
    id: "photo-prints",
    question: "Can I order customised prints with my photos?",
    keywords: ["custom", "customised", "customized", "my photos", "photo print", "upload photo", "print my"],
    answer:
      "Customised prints using your own photos are planned but not available yet. Watch for updates on the home page, or contact us to be told when they open.",
  },
  {
    id: "payment",
    question: "Is my payment safe?",
    keywords: ["payment", "card", "pay", "paypal", "billing", "charge", "refund"],
    answer:
      "Subscriptions are billed by Patreon, so your card details never reach SoulNest. To change your payment details or cancel your subscription, manage it on Patreon. For refunds, contact us.",
  },
  {
    id: "contact",
    question: "How do I contact the team?",
    keywords: ["contact", "support", "help", "email us", "talk to someone", "human", "agent"],
    answer: `You can reach the SoulNest team at ${SUPPORT_EMAIL}. Please include the email address on your account so we can help quickly.`,
  },
];

export const FALLBACK_ANSWER =
  `I'm not sure about that one yet. Try one of the suggested questions, or email ${SUPPORT_EMAIL} and a person will help.`;