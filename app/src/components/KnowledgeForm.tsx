"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { KnowledgeEntry, knowledgeTypes } from "@/lib/knowledge";
import { agents } from "@/lib/agents";
import { clients } from "@/lib/clients";

type FormData = Omit<KnowledgeEntry, "id" | "createdAt" | "updatedAt">;

interface KnowledgeFormProps {
  initial?: KnowledgeEntry;
  onSave: (data: FormData) => void;
  onCancel: () => void;
}

export function KnowledgeForm({ initial, onSave, onCancel }: KnowledgeFormProps) {
  const [title, setTitle] = useState(initial?.title || "");
  const [content, setContent] = useState(initial?.content || "");
  const [type, setType] = useState<KnowledgeEntry["type"]>(initial?.type || "directive");
  const [scopeGlobal, setScopeGlobal] = useState(initial?.scope.global ?? true);
  const [selectedAgents, setSelectedAgents] = useState<string[]>(initial?.scope.agentIds || []);
  const [selectedClients, setSelectedClients] = useState<string[]>(initial?.scope.clientIds || []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    onSave({
      title: title.trim(),
      content: content.trim(),
      type,
      scope: {
        global: scopeGlobal,
        agentIds: scopeGlobal ? [] : selectedAgents,
        clientIds: scopeGlobal ? [] : selectedClients,
      },
    });
  }

  function toggleAgent(id: string) {
    setSelectedAgents((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  }

  function toggleClient(id: string) {
    setSelectedClients((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-lg font-semibold">
            {initial ? "Edit Entry" : "New Knowledge Entry"}
          </h2>
          <button
            onClick={onCancel}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-1.5">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Brand Voice Guidelines"
              className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
            />
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium mb-1.5">Type</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {(Object.entries(knowledgeTypes) as [KnowledgeEntry["type"], typeof knowledgeTypes[KnowledgeEntry["type"]]][]).map(
                ([key, meta]) => (
                  <button
                    type="button"
                    key={key}
                    onClick={() => setType(key)}
                    className={`text-left p-3 rounded-xl border text-sm transition-all ${
                      type === key
                        ? "border-transparent ring-2 ring-offset-1 bg-white shadow-sm"
                        : "border-border hover:bg-gray-50"
                    }`}
                    style={type === key ? { borderColor: meta.color, outlineColor: meta.color, outlineStyle: "solid", outlineWidth: 2, outlineOffset: 1 } : undefined}
                  >
                    <div className="flex items-center gap-2 mb-0.5">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: meta.color }}
                      />
                      <span className="font-medium text-xs">{meta.label}</span>
                    </div>
                    <p className="text-xs text-muted leading-snug">{meta.description}</p>
                  </button>
                )
              )}
            </div>
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium mb-1.5">Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
              placeholder="Write the knowledge, guidelines, or directive here. The agents will use this as context when responding..."
              className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent resize-y leading-relaxed"
            />
            <p className="text-xs text-muted mt-1">
              This text is injected directly into agent context. Be specific and clear.
            </p>
          </div>

          {/* Scope */}
          <div>
            <label className="block text-sm font-medium mb-1.5">Scope</label>
            <div className="space-y-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={scopeGlobal}
                  onChange={(e) => setScopeGlobal(e.target.checked)}
                  className="rounded border-border"
                />
                <span className="text-sm">
                  Global — applies to all agents and all clients
                </span>
              </label>

              {!scopeGlobal && (
                <div className="space-y-4 pl-1 border-l-2 border-border ml-2 pl-4">
                  {/* Agent scope */}
                  <div>
                    <span className="text-xs font-medium text-muted block mb-2">
                      Agents (none selected = all agents)
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {agents.map((agent) => (
                        <button
                          type="button"
                          key={agent.id}
                          onClick={() => toggleAgent(agent.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                            selectedAgents.includes(agent.id)
                              ? "text-white border-transparent"
                              : "border-border text-muted hover:bg-gray-50"
                          }`}
                          style={
                            selectedAgents.includes(agent.id)
                              ? { backgroundColor: agent.color }
                              : undefined
                          }
                        >
                          {agent.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Client scope */}
                  <div>
                    <span className="text-xs font-medium text-muted block mb-2">
                      Clients (none selected = all clients)
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {clients.map((client) => (
                        <button
                          type="button"
                          key={client.id}
                          onClick={() => toggleClient(client.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                            selectedClients.includes(client.id)
                              ? "bg-accent text-white border-transparent"
                              : "border-border text-muted hover:bg-gray-50"
                          }`}
                        >
                          {client.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm rounded-lg border border-border hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim() || !content.trim()}
              className="px-4 py-2 text-sm rounded-lg bg-accent text-white hover:bg-accent/90 disabled:opacity-40 transition-colors"
            >
              {initial ? "Save Changes" : "Add Entry"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
