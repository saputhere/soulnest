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

export interface Tier {
  readonly name: string;
  readonly tagline: string;
  readonly includes: readonly string[];
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
      "SoulNest keeps your memories safe, delivers letters from your past self, and sends beautiful monthly happiness boxes to the people and moments you treasure.",
    primaryCta: "Start Your Journey",
    secondaryCta: "Explore SoulNest",
  },

  features: [
    {
      icon: "mail",
      title: "Monthly happiness boxes",
      description:
        "Handwritten-style letters, inspirational notes, cute stickers, small gifts, and original artwork, delivered every month.",
    },
    {
      icon: "sparkles",
      title: "Future surprises",
      description:
        "Schedule a gift for your graduation, your birthday, your first job, or the day you become a parent. You choose what's inside.",
    },
    {
      icon: "hourglass",
      title: "Letters to your future self",
      description:
        "Write today, and SoulNest delivers your letter months or years from now, right when you need to read it.",
    },
    {
      icon: "lock",
      title: "Memory Vault",
      description:
        "A private digital journal for photos, letters, videos, voice recordings, and stories. Export them as printable memory books or digital postcards.",
    },
    {
      icon: "heart",
      title: "Forever memories",
      description:
        "Create a private memorial page for someone you've lost. Add their photos, stories, and letters, and share only when you choose.",
    },
    {
      icon: "gift",
      title: "Surprise someone",
      description:
        "Send a secret gift to a friend, partner, or family member, and let them discover it without any spoilers.",
    },
  ] satisfies readonly Feature[],

  steps: [
    {
      title: "Join the waitlist",
      description: "Leave your email and we'll let you know the moment your early access opens.",
    },
    {
      title: "Choose your plan",
      description: "Pick Starter, Premium, or Family, and decide how much you want to keep close.",
    },
    {
      title: "Receive your moments",
      description:
        "Open your monthly box, read the letters you've saved for later, and keep every memory safe in your vault.",
    },
  ] satisfies readonly Step[],

  tiers: {
    priceLabel: "Pricing revealed at launch",
    items: [
      {
        name: "Starter",
        tagline: "A gentle start for a little monthly happiness.",
        includes: [
          "Monthly happiness box",
          "Letters, notes, stickers, and a small gift",
          "Memory Vault for your personal memories",
        ],
      },
      {
        name: "Premium",
        tagline: "For the people who want to plan their future joy.",
        includes: [
          "Everything in Starter",
          "Future surprises and letters to your future self",
          "Forever memories memorial pages",
        ],
      },
      {
        name: "Family",
        tagline: "Happiness shared across your whole household.",
        includes: [
          "Everything in Premium",
          "Shared boxes for your household",
          "Family memory pages for loved ones",
        ],
      },
    ] satisfies readonly Tier[],
  },

  faq: [
    {
      question: "What is SoulNest?",
      answer:
        "SoulNest is a subscription that delivers happiness. Each month you receive a curated box of letters, art, and small gifts, and you can also keep memories, plan future surprises, and write letters to your future self.",
    },
    {
      question: "How do letters to my future self work?",
      answer:
        "You write a letter today and choose the date it should arrive. SoulNest keeps it safe and delivers it on that date, months or years from now.",
    },
    {
      question: "Is my Memory Vault private?",
      answer:
        "Yes. Everything you store in your Memory Vault is private by default. Only you can see it unless you choose to share something.",
    },
    {
      question: "How do I get early access?",
      answer:
        "Join the waitlist with your email address. We'll send you your early access details before we open to everyone.",
    },
    {
      question: "Can I give SoulNest as a gift?",
      answer:
        "Gift subscriptions are part of our plans and will be available at launch. Join the waitlist to hear about them first.",
    },
  ] satisfies readonly FaqItem[],

  waitlist: {
    headline: "Be the first to feel at home.",
    description:
      "Join the waitlist to get early access, plus first look at new boxes and features.",
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