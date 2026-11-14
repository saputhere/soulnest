const ADJECTIVES = ["Gentle", "Quiet", "Sunny", "Velvet", "Moonlit", "Honey", "Starry", "Soft", "Misty", "Kind"];
const NOUNS = ["Lantern", "Willow", "Comet", "Meadow", "Feather", "Harbor", "Ember", "Fern", "Dove", "Pebble"];

/** Generates a soft, anonymous display name such as "Gentle Willow 42". Safe to use on the client. */
export function randomDisplayName(): string {
  const adjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const number = Math.floor(Math.random() * 90) + 10;
  return `${adjective} ${noun} ${number}`;
}