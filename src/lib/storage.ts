const COMPLETED_KEY = "pydrill:completed";
const DRAFT_PREFIX = "pydrill:draft:";

export function getCompleted(): Set<string> {
  try {
    const raw = localStorage.getItem(COMPLETED_KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

export function markCompleted(id: string): void {
  try {
    const s = getCompleted();
    s.add(id);
    localStorage.setItem(COMPLETED_KEY, JSON.stringify([...s]));
  } catch {
    /* localStorage unavailable */
  }
}

export function isCompleted(id: string): boolean {
  return getCompleted().has(id);
}

export function getDraft(id: string): string | null {
  try {
    return localStorage.getItem(DRAFT_PREFIX + id);
  } catch {
    return null;
  }
}

export function saveDraft(id: string, code: string): void {
  try {
    localStorage.setItem(DRAFT_PREFIX + id, code);
  } catch {
    /* localStorage unavailable */
  }
}

export function clearDraft(id: string): void {
  try {
    localStorage.removeItem(DRAFT_PREFIX + id);
  } catch {
    /* localStorage unavailable */
  }
}
