"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Globe,
  BookOpen,
  Filter,
  FileText,
  Link2,
} from "lucide-react";
import {
  KnowledgeEntry,
  knowledgeTypes,
  loadKnowledge,
  addKnowledgeEntry,
  updateKnowledgeEntry,
  deleteKnowledgeEntry,
} from "@/lib/knowledge";
import { agents } from "@/lib/agents";
import { clients } from "@/lib/clients";
import { KnowledgeForm } from "@/components/KnowledgeForm";

export default function KnowledgePage() {
  const [entries, setEntries] = useState<KnowledgeEntry[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<KnowledgeEntry | null>(null);
  const [filterType, setFilterType] = useState<string>("all");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  useEffect(() => {
    setEntries(loadKnowledge());
  }, []);

  function handleAdd(data: Omit<KnowledgeEntry, "id" | "createdAt" | "updatedAt">) {
    addKnowledgeEntry(data);
    setEntries(loadKnowledge());
    setShowForm(false);
  }

  function handleUpdate(data: Omit<KnowledgeEntry, "id" | "createdAt" | "updatedAt">) {
    if (!editing) return;
    updateKnowledgeEntry(editing.id, data);
    setEntries(loadKnowledge());
    setEditing(null);
  }

  function handleDelete(id: string) {
    deleteKnowledgeEntry(id);
    setEntries(loadKnowledge());
    setConfirmDelete(null);
  }

  const filtered =
    filterType === "all"
      ? entries
      : entries.filter((e) => e.type === filterType);

  const sortedEntries = [...filtered].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BookOpen size={24} />
            Knowledge Hub
          </h1>
          <p className="text-muted text-sm mt-1">
            Control what your agents know. Add guidelines, strategy docs, directives, and client
            notes that get injected into agent context.
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent/90 transition-colors shrink-0"
        >
          <Plus size={16} />
          Add Entry
        </button>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
        {(Object.entries(knowledgeTypes) as [KnowledgeEntry["type"], (typeof knowledgeTypes)[KnowledgeEntry["type"]]][]).map(
          ([key, meta]) => {
            const count = entries.filter((e) => e.type === key).length;
            return (
              <button
                key={key}
                onClick={() => setFilterType(filterType === key ? "all" : key)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm transition-all ${
                  filterType === key
                    ? "border-transparent shadow-sm bg-white ring-2"
                    : "border-border hover:bg-white"
                }`}
                style={filterType === key ? { outlineColor: meta.color, outlineStyle: "solid", outlineWidth: 2, outlineOffset: 1 } : undefined}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: meta.color }}
                />
                <span className="font-medium">{count}</span>
                <span className="text-muted text-xs hidden sm:inline">{meta.label}</span>
              </button>
            );
          }
        )}
      </div>

      {filterType !== "all" && (
        <button
          onClick={() => setFilterType("all")}
          className="flex items-center gap-1.5 text-xs text-muted hover:text-foreground mb-4 transition-colors"
        >
          <Filter size={12} />
          Clear filter — showing {knowledgeTypes[filterType as KnowledgeEntry["type"]]?.label}
        </button>
      )}

      {/* Entries */}
      {sortedEntries.length === 0 ? (
        <div className="text-center py-16">
          <BookOpen size={40} className="mx-auto text-muted mb-3" />
          <h3 className="font-semibold text-lg mb-1">
            {entries.length === 0 ? "No knowledge entries yet" : "No entries match this filter"}
          </h3>
          <p className="text-sm text-muted mb-4 max-w-md mx-auto">
            {entries.length === 0
              ? "Add brand guidelines, strategy docs, directives, and client notes to shape how your agents respond."
              : "Try a different filter or add a new entry."}
          </p>
          {entries.length === 0 && (
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent/90 transition-colors"
            >
              <Plus size={16} />
              Add your first entry
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {sortedEntries.map((entry) => {
            const meta = knowledgeTypes[entry.type];
            return (
              <div
                key={entry.id}
                className="bg-white border border-border rounded-xl p-5 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    {/* Title + type badge */}
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <h3 className="font-semibold text-sm">{entry.title}</h3>
                      <span
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium text-white"
                        style={{ backgroundColor: meta.color }}
                      >
                        {meta.label}
                      </span>
                    </div>

                    {/* Content preview */}
                    <p className="text-sm text-muted leading-relaxed line-clamp-3 mb-3">
                      {entry.content}
                    </p>

                    {/* Scope tags */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      {entry.scope.global ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-gray-100 text-muted">
                          <Globe size={10} />
                          Global
                        </span>
                      ) : (
                        <>
                          {entry.scope.agentIds.length === 0 ? (
                            <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-muted">
                              All agents
                            </span>
                          ) : (
                            entry.scope.agentIds.map((aid) => {
                              const agent = agents.find((a) => a.id === aid);
                              return agent ? (
                                <span
                                  key={aid}
                                  className="px-2 py-0.5 rounded-full text-xs font-medium text-white"
                                  style={{ backgroundColor: agent.color }}
                                >
                                  {agent.name}
                                </span>
                              ) : null;
                            })
                          )}
                          {entry.scope.clientIds.length === 0 ? (
                            <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-muted">
                              All clients
                            </span>
                          ) : (
                            entry.scope.clientIds.map((cid) => {
                              const client = clients.find((c) => c.id === cid);
                              return client ? (
                                <span
                                  key={cid}
                                  className="px-2 py-0.5 rounded-full text-xs bg-blue-50 text-blue-700"
                                >
                                  {client.name}
                                </span>
                              ) : null;
                            })
                          )}
                        </>
                      )}
                      {entry.source?.kind === "file" && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-purple-50 text-purple-700">
                          <FileText size={10} />
                          {entry.source.fileName}
                        </span>
                      )}
                      {entry.source?.kind === "url" && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-cyan-50 text-cyan-700 max-w-[200px] truncate">
                          <Link2 size={10} className="shrink-0" />
                          {entry.source.url}
                        </span>
                      )}
                      <span className="text-xs text-muted ml-2">
                        Updated {new Date(entry.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => setEditing(entry)}
                      className="p-2 rounded-lg text-muted hover:text-foreground hover:bg-gray-100 transition-colors"
                      title="Edit"
                    >
                      <Pencil size={14} />
                    </button>
                    {confirmDelete === entry.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDelete(entry.id)}
                          className="px-2 py-1 rounded-lg text-xs bg-red-500 text-white hover:bg-red-600 transition-colors"
                        >
                          Delete
                        </button>
                        <button
                          onClick={() => setConfirmDelete(null)}
                          className="px-2 py-1 rounded-lg text-xs border border-border hover:bg-gray-50 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDelete(entry.id)}
                        className="p-2 rounded-lg text-muted hover:text-red-500 hover:bg-red-50 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Form modal */}
      {(showForm || editing) && (
        <KnowledgeForm
          initial={editing || undefined}
          onSave={editing ? handleUpdate : handleAdd}
          onCancel={() => {
            setShowForm(false);
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}
