import type { Concept, Item, Pack, Profile } from "./types";

// Seed content. This is the ONE module the real engine replaces: swap these
// arrays (and the scheduling in engine/) for engine-produced data and the UI
// is unchanged. Two packs prove the same machinery serves an expert and a child.

const TODAY = "2026-06-23";
const SOON = "2026-06-24";
const LATER = "2026-06-27";

// ---------------------------------------------------------------------------
// Pack 1 — Trading Foundations (the §4.6 spine, lightly seeded)
// ---------------------------------------------------------------------------

const tradingItems: Item[] = [
  {
    id: "t-geo-explain",
    conceptId: "geometric-returns",
    type: "concept-explanation",
    prompt: "Why the average return lies",
    body: "Your money compounds, so what matters is the growth rate strung together over time (the geometric mean), not the simple average of yearly returns. A bumpy ride ends lower than a smooth one with the same average.",
  },
  {
    id: "t-geo-refute",
    conceptId: "geometric-returns",
    type: "refutation",
    prompt: "Down 50%, then up 50% — back to even?",
    misconception: "A 50% loss followed by a 50% gain gets you back to where you started.",
    correction: "No. $100 drops to $50, then a 50% gain is only +$25, leaving $75. You need a 100% gain to recover a 50% loss. Losses hurt more than equal-sized gains help.",
    answer: "You end at $75, not $100.",
    scheduling: { due: TODAY, learningState: "review" },
  },
  {
    id: "t-geo-apply",
    conceptId: "geometric-returns",
    type: "application",
    prompt: "Two years: +30%, then −30%. Is the account up, down, or flat?",
    choices: ["Up", "Flat", "Down"],
    answer: "Down — $100 → $130 → $91. The average return is 0%, but you lost 9%.",
    scheduling: { due: TODAY, learningState: "review" },
  },
  {
    id: "t-cagr-explain",
    conceptId: "cagr",
    type: "concept-explanation",
    prompt: "CAGR — the one true growth rate",
    body: "CAGR is the single steady rate that would take you from your starting value to your ending value over the period. It quietly accounts for compounding, so it's the honest way to compare investments.",
  },
  {
    id: "t-cagr-cloze",
    conceptId: "cagr",
    type: "cloze",
    prompt: "CAGR is the constant ___ rate that links the start value to the end value.",
    clozeMask: ["growth"],
    answer: "growth",
    scheduling: { due: TODAY, learningState: "learning" },
  },
  {
    id: "t-vol-explain",
    conceptId: "volatility-drag",
    type: "concept-explanation",
    prompt: "Volatility drag",
    body: "Swings eat compounded returns: the more an asset bounces around, the more its geometric (real) return falls below its average return. That gap is the drag.",
  },
  {
    id: "t-vol-refute",
    conceptId: "volatility-drag",
    type: "refutation",
    prompt: "Is volatility simply bad for compounding?",
    misconception: "Volatility is always the enemy of growth.",
    correction: "It's a drag on a single asset — but across uncorrelated assets, rebalancing can harvest those same swings into a bonus. Volatility is a cost you can sometimes turn into a tool.",
    answer: "Not always — rebalancing can harvest it.",
    scheduling: { due: SOON, learningState: "new" },
  },
  {
    id: "t-call-explain",
    conceptId: "call-option",
    type: "concept-explanation",
    prompt: "What a call option is",
    body: "A call gives you the right — not the obligation — to buy something at a set price (the strike) before a deadline. You pay a premium for that right. You profit if the price climbs well above the strike.",
  },
  {
    id: "t-call-apply",
    conceptId: "call-option",
    type: "application",
    prompt: "A $100 strike call costs $3. The stock goes to $108 at expiry. Profit per share?",
    answer: "$5 — worth $8 at expiry minus the $3 you paid.",
    scheduling: { due: TODAY, learningState: "review" },
  },
  {
    id: "t-delta-explain",
    conceptId: "delta",
    type: "concept-explanation",
    prompt: "Delta — how much the option moves",
    body: "Delta is roughly how many dollars the option price moves for a $1 move in the stock. A 0.50 delta call gains about $0.50 when the stock rises $1. It's also a rough sense of the odds of finishing in the money.",
  },
  {
    id: "t-theta-explain",
    conceptId: "theta",
    type: "concept-explanation",
    prompt: "Theta — time decay",
    body: "Every day that passes, an option loses a little value just because there's less time for it to pay off. That daily bleed is theta, and it speeds up as expiry approaches.",
  },
  {
    id: "t-theta-refute",
    conceptId: "theta",
    type: "refutation",
    prompt: "Does an option lose value at a steady pace each day?",
    misconception: "Time decay is a constant, straight-line drip.",
    correction: "It accelerates. An option loses value slowly when far from expiry and much faster in the final days — theta is a curve, not a line.",
    answer: "No — decay accelerates near expiry.",
    scheduling: { due: LATER, learningState: "new" },
  },
];

const tradingConcepts: Concept[] = [
  { id: "geometric-returns", packId: "trading-foundations", title: "Why the average return lies", prerequisiteIds: [], itemIds: ["t-geo-explain", "t-geo-refute", "t-geo-apply"], mastery: "solid" },
  { id: "cagr", packId: "trading-foundations", title: "CAGR, the true growth rate", prerequisiteIds: ["geometric-returns"], itemIds: ["t-cagr-explain", "t-cagr-cloze"], mastery: "getting-it" },
  { id: "volatility-drag", packId: "trading-foundations", title: "Volatility drag", prerequisiteIds: ["cagr", "geometric-returns"], itemIds: ["t-vol-explain", "t-vol-refute"], mastery: "new" },
  { id: "call-option", packId: "trading-foundations", title: "What a call option is", prerequisiteIds: [], itemIds: ["t-call-explain", "t-call-apply"], mastery: "getting-it" },
  { id: "delta", packId: "trading-foundations", title: "Delta", prerequisiteIds: ["call-option"], itemIds: ["t-delta-explain"], mastery: "new" },
  { id: "theta", packId: "trading-foundations", title: "Theta, time decay", prerequisiteIds: ["call-option"], itemIds: ["t-theta-explain", "t-theta-refute"], mastery: "new" },
];

// ---------------------------------------------------------------------------
// Pack 2 — Business for Kids (same engine, child-level content and tone)
// ---------------------------------------------------------------------------

const kidsItems: Item[] = [
  {
    id: "k-biz-explain",
    conceptId: "what-is-business",
    type: "concept-explanation",
    prompt: "What is a business?",
    body: "A business makes something people want — a toy, a snack, a haircut — and trades it for money. If people are happy and you have money left over, the business is working.",
  },
  {
    id: "k-biz-apply",
    conceptId: "what-is-business",
    type: "application",
    prompt: "You sell lemonade for 50 cents a cup. What is your business giving people?",
    answer: "A cold, tasty drink — and they give you money for it.",
    scheduling: { due: TODAY, learningState: "review" },
  },
  {
    id: "k-profit-explain",
    conceptId: "profit",
    type: "concept-explanation",
    prompt: "Profit: what's left over",
    body: "Profit is the money you keep after you pay for everything you used. Sell a cup for 50 cents, and if the lemons and cup cost you 20 cents, your profit is 30 cents.",
  },
  {
    id: "k-profit-refute",
    conceptId: "profit",
    type: "refutation",
    prompt: "Is all the money in the jar your profit?",
    misconception: "Every coin a shop takes in is profit.",
    correction: "No! First you pay for what you used — the lemons, the cups, the sugar. Profit is only the part that's left after that.",
    answer: "No — pay your costs first, then what's left is profit.",
    scheduling: { due: TODAY, learningState: "review" },
  },
  {
    id: "k-price-explain",
    conceptId: "price-vs-cost",
    type: "concept-explanation",
    prompt: "Price and cost are different",
    body: "Cost is what you pay to make something. Price is what you ask people to pay you for it. To make a profit, your price needs to be more than your cost.",
  },
  {
    id: "k-price-cloze",
    conceptId: "price-vs-cost",
    type: "cloze",
    prompt: "To earn a profit, the ___ must be higher than the cost.",
    clozeMask: ["price"],
    answer: "price",
    scheduling: { due: SOON, learningState: "new" },
  },
  {
    id: "k-cust-explain",
    conceptId: "customers",
    type: "concept-explanation",
    prompt: "Who is a customer?",
    body: "A customer is a person who buys what you sell. The more people who want what you make — and come back — the better your business does.",
  },
  {
    id: "k-cust-apply",
    conceptId: "customers",
    type: "application",
    prompt: "Your neighbor buys lemonade and tells a friend, who buys some too. How many customers do you have now?",
    answer: "Two — and the second one came from a happy first one.",
    scheduling: { due: TODAY, learningState: "review" },
  },
  {
    id: "k-save-explain",
    conceptId: "saving",
    type: "concept-explanation",
    prompt: "Save some, spend some",
    body: "When your business earns money, it's smart to save a little for later — to buy more lemons next time — and only spend some now. Saving helps your business grow.",
  },
];

const kidsConcepts: Concept[] = [
  { id: "what-is-business", packId: "business-for-kids", title: "What is a business?", prerequisiteIds: [], itemIds: ["k-biz-explain", "k-biz-apply"], mastery: "solid" },
  { id: "profit", packId: "business-for-kids", title: "Profit", prerequisiteIds: ["what-is-business"], itemIds: ["k-profit-explain", "k-profit-refute"], mastery: "getting-it" },
  { id: "price-vs-cost", packId: "business-for-kids", title: "Price vs. cost", prerequisiteIds: ["profit"], itemIds: ["k-price-explain", "k-price-cloze"], mastery: "new" },
  { id: "customers", packId: "business-for-kids", title: "Customers", prerequisiteIds: ["what-is-business"], itemIds: ["k-cust-explain", "k-cust-apply"], mastery: "getting-it" },
  { id: "saving", packId: "business-for-kids", title: "Save some, spend some", prerequisiteIds: ["profit"], itemIds: ["k-save-explain"], mastery: "new" },
];

// ---------------------------------------------------------------------------

export const SEED_PACKS: Pack[] = [
  {
    id: "trading-foundations",
    title: "Trading Foundations",
    description: "From compounding and volatility to options and the Greeks — the real mechanics, one calm step at a time.",
    emoji: "📈",
    conceptIds: tradingConcepts.map((c) => c.id),
    version: "0.1.0",
  },
  {
    id: "business-for-kids",
    title: "Business for Kids",
    description: "How money, selling, and a little shop really work — built for a curious 7-year-old.",
    emoji: "🍋",
    conceptIds: kidsConcepts.map((c) => c.id),
    version: "0.1.0",
  },
];

export const SEED_CONCEPTS: Concept[] = [...tradingConcepts, ...kidsConcepts];
export const SEED_ITEMS: Item[] = [...tradingItems, ...kidsItems];

export const SEED_PROFILES: Profile[] = [
  {
    id: "p-dad",
    displayName: "Dad",
    avatarSeed: "ember",
    readingLevel: "expert",
    activePackIds: ["trading-foundations"],
    streakDays: 23,
    lastCompletedDate: "2026-06-22",
    aiEnabled: false,
    intensity: "steady",
    createdAt: "2026-05-01T09:00:00.000Z",
  },
  {
    id: "p-partner",
    displayName: "Mara",
    avatarSeed: "frost",
    readingLevel: "general",
    activePackIds: ["business-for-kids"],
    streakDays: 6,
    lastCompletedDate: "2026-06-22",
    aiEnabled: false,
    intensity: "gentle",
    createdAt: "2026-06-10T09:00:00.000Z",
  },
  {
    id: "p-kid",
    displayName: "Sage",
    avatarSeed: "lemon",
    readingLevel: "child",
    activePackIds: ["business-for-kids"],
    streakDays: 3,
    lastCompletedDate: "2026-06-22",
    aiEnabled: false,
    intensity: "gentle",
    createdAt: "2026-06-18T09:00:00.000Z",
  },
];

export const APP_TODAY = TODAY;
