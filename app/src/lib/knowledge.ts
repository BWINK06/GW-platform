export type KnowledgeSource =
  | { kind: "manual" }
  | { kind: "file"; fileName: string; fileType: string }
  | { kind: "url"; url: string };

export interface KnowledgeEntry {
  id: string;
  title: string;
  content: string;
  type: "brand-guidelines" | "strategy" | "process" | "client-notes" | "directive";
  source: KnowledgeSource;
  scope: {
    global: boolean;
    agentIds: string[];   // empty = all agents
    clientIds: string[];  // empty = all clients
  };
  createdAt: string;
  updatedAt: string;
}

export const knowledgeTypes: Record<KnowledgeEntry["type"], { label: string; color: string; description: string }> = {
  "brand-guidelines": {
    label: "Brand Guidelines",
    color: "#3B82F6",
    description: "Voice, tone, visual identity, and brand standards",
  },
  strategy: {
    label: "Strategy",
    color: "#10B981",
    description: "High-level strategic direction and positioning",
  },
  process: {
    label: "Process",
    color: "#8B5CF6",
    description: "Workflows, SOPs, and operational procedures",
  },
  "client-notes": {
    label: "Client Notes",
    color: "#F59E0B",
    description: "Client-specific context, history, and preferences",
  },
  directive: {
    label: "Directive",
    color: "#EF4444",
    description: "Direct instructions that override default agent behavior",
  },
};

const STORAGE_KEY = "gw-knowledge";

export function loadKnowledge(): KnowledgeEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveKnowledge(entries: KnowledgeEntry[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function addKnowledgeEntry(entry: Omit<KnowledgeEntry, "id" | "createdAt" | "updatedAt">): KnowledgeEntry {
  const entries = loadKnowledge();
  const now = new Date().toISOString();
  const newEntry: KnowledgeEntry = {
    ...entry,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
  };
  entries.push(newEntry);
  saveKnowledge(entries);
  return newEntry;
}

export function updateKnowledgeEntry(id: string, updates: Partial<Omit<KnowledgeEntry, "id" | "createdAt">>): KnowledgeEntry | null {
  const entries = loadKnowledge();
  const idx = entries.findIndex((e) => e.id === id);
  if (idx === -1) return null;
  entries[idx] = { ...entries[idx], ...updates, updatedAt: new Date().toISOString() };
  saveKnowledge(entries);
  return entries[idx];
}

export function deleteKnowledgeEntry(id: string) {
  const entries = loadKnowledge().filter((e) => e.id !== id);
  saveKnowledge(entries);
}

/**
 * Get all knowledge entries relevant to a given agent + client context.
 * An entry matches if:
 *  - It's global, OR
 *  - Its agentIds includes this agent (or is empty = all agents), AND
 *  - Its clientIds includes this client (or is empty = all clients)
 */
export function getRelevantKnowledge(agentId: string, clientId: string | null): KnowledgeEntry[] {
  const entries = loadKnowledge();
  return entries.filter((entry) => {
    if (entry.scope.global) return true;
    const agentMatch = entry.scope.agentIds.length === 0 || entry.scope.agentIds.includes(agentId);
    const clientMatch =
      entry.scope.clientIds.length === 0 ||
      (clientId !== null && entry.scope.clientIds.includes(clientId));
    return agentMatch && clientMatch;
  });
}
