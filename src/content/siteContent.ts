export type FeatureIcon = "mail" | "sparkles" | "hourglass" | "lock" | "heart" | "gift";

export interface Feature {
  readonly icon: FeatureIcon;
  readonly title: string;
  readonly description: string;
}

export interface Step {
  readonly title: string;
  readonly description: string;
}

export interface FaqItem {
  readonly question: string;
  readonly answer: string;
}

export const siteContent = {
  brand: {
    name: "SoulNest",
    tagline: "A place where love never stops arriving.",
  },

  nav: [
    { label: "How it works", href: "#how-it-works" },
    { label: "Features", href: "#features" },
    { label: "Plans", href: "#plans" },
    { label: "FAQ", href: "#faq" },
  ],

  hero: {
    badge: "Waitlist now open",
    headline: "A Place Where Love Never Stops Arriving.",
    subheadline:
      "Someone you love is thinking of you right now. SoulNest makes sure those feelings never fade: letters that arrive when you need them, memories kept safe, and small surprises that remind you you're held.",
    primaryCta: "Start Your Journey",
    secondaryCta: "Explore SoulNest",
  },

  features: [
    {
      icon: "mail",
      title: "A box that feels like a hug",
      description:
        "Each month, a handwritten-style letter, an encouraging note, original art, and a small gift arrive at your door, like someone remembered you.",
    },
    {
      icon: "sparkles",
      title: "Surprises for your big moments",
      description:
        "Graduations, first jobs, anniversaries, the day you become a parent. Choose what should be waiting for you, and let the joy find you on the day it matters.",
    },
    {
      icon: "hourglass",
      title: "Words for the person you're becoming",
      description:
        "Write to your future self today. We keep your letter safe and deliver it months or years from now, on the day you need your own kindness most.",
    },
    {
      icon: "lock",
      title: "A private place for your memories",
      description:
        "Photos, voice notes, letters, and stories, kept in a space that belongs only to you. Your heart's collection stays yours, always.",
    },
    {
      icon: "heart",
      title: "A gentle place to remember",
      description:
        "Create a quiet memorial page for someone you miss. Keep their laughter, their stories, and their words close, and share them only when you feel ready.",
    },
    {
      icon: "gift",
      title: "Let someone feel loved",
      description:
        "Secretly send a surprise to a friend, a partner, or someone far away. Watch their face light up when it arrives, and know you made their day.",
    },
  ] satisfies readonly Feature[],

  steps: [
    {
      title: "Say yes to joy",
      description:
        "Join the waitlist and tell us you're ready for small moments that make your days softer.",
    },
    {
      title: "Choose what you'd love to receive",
      description:
        "Pick the kind of happiness that feels like you, and decide what you want to save for your future self.",
    },
    {
      title: "Open, read, and feel held",
      description:
        "Each box arrives like a little hello from someone who cares. Keep the letters, save the memories, and come back to them whenever you need a smile.",
    },
  ] satisfies readonly Step[],

  plan: {
    name: "SoulNest Membership",
    tagline: "Everything SoulNest offers, in one simple plan, so you can focus on feeling loved.",
    priceLabel: "Pricing revealed at launch",
    includes: [
      "A monthly happiness box with letters, notes, stickers, art, and a small gift",
      "Future surprises scheduled for your milestones",
      "Letters to your future self, delivered when the time is right",
      "A private Memory Vault for photos, voice notes, videos, and stories",
      "Memorial pages to keep the people you miss close to your heart",
      "Secret surprises you can send to anyone you love",
      "Printable memory books and digital postcards",
      "Seasonal surprises and affirmations to brighten your month",
    ],
    cta: "Join the waitlist",
  },

  faq: [
    {
      question: "What makes SoulNest different from a gift shop?",
      answer:
        "SoulNest isn't a store. It's a home for feelings. Every box, letter, and memory is chosen to make you feel seen, comforted, and cared for.",
    },
    {
      question: "How do letters to my future self work?",
      answer:
        "You write to the person you're becoming and choose when it should arrive. We keep it safe and deliver it on that day, whether that's next month or ten years from now.",
    },
    {
      question: "Is my Memory Vault truly private?",
      answer:
        "Yes. Everything you store is private by default. Only you can see it, unless you decide to share something with someone you trust.",
    },
    {
      question: "I'm going through a hard time. Can SoulNest help?",
      answer:
        "SoulNest can offer comfort through letters, memories, and gentle reminders. It isn't a substitute for professional support, so if you're struggling, please reach out to someone you trust or a qualified professional.",
    },
    {
      question: "Can I give SoulNest as a gift?",
      answer:
        "Gift subscriptions are coming at launch. Join the waitlist and be the first to know, so you can surprise someone you love.",
    },
    {
      question: "How do I get early access?",
      answer:
        "Join the waitlist with your email address. We'll send your early access details before we open to everyone.",
    },
  ] satisfies readonly FaqItem[],

  waitlist: {
    headline: "Be the first to feel at home.",
    description:
      "Join the waitlist for early access, a first look at new boxes, and a little warmth in your inbox.",
    placeholder: "you@example.com",
    cta: "Join the waitlist",
    successMessage: "You're on the list. We'll be in touch soon with your early access details.",
    alreadyJoinedMessage: "You're already on the list. We'll be in touch soon.",
    invalidEmailMessage: "Please enter a valid email address.",
    genericErrorMessage: "Something went wrong. Please try again in a moment.",
    unavailableMessage: "The waitlist is temporarily unavailable. Please try again later.",
  },

  footer: {
    tagline: "Made with care, for the moments that matter.",
  },
} as const;