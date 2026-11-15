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

  subscribeUrl: "https://www.patreon.com/cw/soulnest",

  nav: [
    { label: "How it works", href: "#how-it-works" },
    { label: "Features", href: "#features" },
    { label: "Plans", href: "#plans" },
    { label: "FAQ", href: "#faq" },
  ],

  hero: {
    badge: "Join our caring community",
    headline: "A Place Where Love Never Stops Arriving.",
    subheadline:
      "Someone you love is thinking of you right now. SoulNest makes sure those feelings never fade: letters that arrive when you need them, handmade prints and keepsakes, and small surprises that remind you you're held.",
    primaryCta: "Subscribe on Patreon",
    secondaryCta: "Explore SoulNest",
  },

  features: [
    {
      icon: "mail",
      title: "A monthly box made by hand",
      description:
        "Printed art, Lomo cards, bookmarks, stickers, journals, notebooks, and a small gift, packed with care and posted to your door.",
    },
    {
      icon: "sparkles",
      title: "Handwritten surprise letters",
      description:
        "Every box can include a handwritten note or a surprise letter, chosen at random, so each month feels new.",
    },
    {
      icon: "hourglass",
      title: "Letters to your future self",
      description:
        "Write what you want to read later, choose the day, and we'll post it. Postal delays of a day or two can happen, and we'll keep you informed.",
    },
    {
      icon: "gift",
      title: "Gifts for your milestones",
      description:
        "Graduations, first jobs, anniversaries, the day you become a parent. Tell us what you'd like, choose the day, and we'll post it in time.",
    },
    {
      icon: "lock",
      title: "Your address and plans, kept private",
      description:
        "Your shipping details and planned deliveries live in your own member area. Only you and the SoulNest team can see them.",
    },
    {
      icon: "heart",
      title: "Customised prints (coming soon)",
      description:
        "Soon you'll be able to turn your own photos into prints for your box. We'll announce it here when it opens.",
    },
  ] satisfies readonly Feature[],

  steps: [
    {
      title: "Subscribe on Patreon",
      description: "Choose monthly membership on Patreon. Payments are handled securely there.",
    },
    {
      title: "Set up your member area",
      description: "Save your shipping address and plan the letters or gifts you'd like us to post.",
    },
    {
      title: "Open, read, and feel held",
      description:
        "Each box arrives like a little hello from someone who cares. Keep the letters, read the notes, and come back whenever you need a smile.",
    },
  ] satisfies readonly Step[],

  plan: {
    name: "SoulNest Membership",
    tagline: "Everything SoulNest offers in one simple monthly plan.",
    priceLabel: "$29 a month · billed by Patreon",
    includes: [
      "A monthly box with printed art, Lomo cards, bookmarks, stickers, journals, and a small gift",
      "Handwritten notes and a surprise letter in your box",
      "Letters to your future self, posted on the date you choose",
      "Gifts planned for milestones like graduations and anniversaries",
      "A private member area for your address and planned deliveries",
      "Shipping planned 5 days ahead in Sri Lanka, 18 days internationally",
      "Community access to share ideas, thoughts, and reflections",
    ],
    cta: "Subscribe on Patreon",
  },

  faq: [
    {
      question: "What makes SoulNest different from a gift shop?",
      answer:
        "SoulNest isn't a store. It's a home for feelings. Every box, letter, and gift is made to help you feel seen, comforted, and cared for.",
    },
    {
      question: "How do letters to my future self work?",
      answer:
        "You write to the person you're becoming, then choose the day it should be posted. We post it on that day, with a day or two of postal delay possible.",
    },
    {
      question: "How do I subscribe?",
      answer:
        "Press Subscribe on Patreon. Payments are handled by Patreon, so your card details never reach SoulNest. Then sign in here to set up your member area.",
    },
    {
      question: "Is my address and planning private?",
      answer:
        "Yes. Your shipping address and planned deliveries are visible only to you and the SoulNest team.",
    },
    {
      question: "How far ahead do I need to plan?",
      answer:
        "Plan at least 5 days ahead for Sri Lanka and 18 days ahead for international addresses.",
    },
    {
      question: "Can I cancel?",
      answer:
        "Yes. Cancel your Patreon membership at any time there. Letters or gifts already packed can't be cancelled, so contact us if you need help.",
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