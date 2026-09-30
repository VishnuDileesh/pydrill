import raw from "../data/challenges.json";

export interface TestCase {
  args: unknown[];
  expected: unknown;
}

export type Difficulty = "easy" | "medium" | "hard";

export interface Challenge {
  id: string;
  title: string;
  module: string;
  moduleSlug: string;
  difficulty: Difficulty;
  prompt: string;
  funcName: string;
  params: string[];
  starter: string;
  tests: TestCase[];
  note?: string;
}

export const challenges = raw as Challenge[];

export interface ModuleInfo {
  slug: string;
  name: string;
  count: number;
  blurb: string;
}

const BLURBS: Record<string, string> = {
  strings: "Text mechanics — palindromes, ciphers, word games.",
  math: "Pure numeric logic — primes, digits, loops.",
  lists: "Arrays and sequences — search, sort, reshape.",
  dicts: "Key-value thinking — counting, grouping, lookups.",
  patterns: "Shapes, matrices, and multi-step logic puzzles.",
  bonus: "Recursion and classic algorithms, for when you want more.",
};

export const modules: ModuleInfo[] = Array.from(
  new Map(challenges.map((c) => [c.moduleSlug, c.module])).entries()
).map(([slug, name]) => ({
  slug,
  name,
  count: challenges.filter((c) => c.moduleSlug === slug).length,
  blurb: BLURBS[slug] ?? "",
}));

export function getChallenge(id: string): Challenge | undefined {
  return challenges.find((c) => c.id === id);
}

export function getModuleChallenges(slug: string): Challenge[] {
  return challenges.filter((c) => c.moduleSlug === slug);
}

export function getAdjacent(id: string): { prev?: Challenge; next?: Challenge } {
  const idx = challenges.findIndex((c) => c.id === id);
  if (idx === -1) return {};
  return { prev: challenges[idx - 1], next: challenges[idx + 1] };
}

export function renderPrompt(prompt: string): string {
  return prompt
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/`([^`]+)`/g, "<code>$1</code>");
}
