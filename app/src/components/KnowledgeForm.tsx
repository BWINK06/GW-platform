"use client";

import { useState, useRef } from "react";
import { X, Upload, Link2, FileText, Loader2, AlertCircle } from "lucide-react";
import { KnowledgeEntry, KnowledgeSource, knowledgeTypes } from "@/lib/knowledge";
import { agents } from "@/lib/agents";
import { clients } from "@/lib/clients";

type FormData = Omit<KnowledgeEntry, "id" | "createdAt" | "updatedAt">;

interface KnowledgeFormProps {
  initial?: KnowledgeEntry;
  onSave: (data: FormData) => void;
  onCancel: () => void;
}

type ContentTab = "write" | "upload" | "url";

export function KnowledgeForm({ initial, onSave, onCancel }: KnowledgeFormProps) {
  const [title, setTitle] = useState(initial?.title || "");
  const [content, setContent] = useState(initial?.content || "");
  const [type, setType] = useState<KnowledgeEntry["type"]>(initial?.type || "directive");
  const [scopeGlobal, setScopeGlobal] = useState(initial?.scope.global ?? true);
  const [selectedAgents, setSelectedAgents] = useState<string[]>(initial?.scope.agentIds || []);
  const [selectedClients, setSelectedClients] = useState<string[]>(initial?.scope.clientIds || []);

  const [source, setSource] = useState<KnowledgeSource>(initial?.source || { kind: "manual" });
  const [contentTab, setContentTab] = useState<ContentTab>("write");

  // URL state
  const [urlInput, setUrlInput] = useState(
    initial?.source.kind === "url" ? initial.source.url : ""
  );
  const [urlLoading, setUrlLoading] = useState(false);
  const [urlError, setUrlError] = useState<string | null>(null);

  // File state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileLoading, setFileLoading] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [fileName, setFileName] = useState(
    initial?.source.kind === "file" ? initial.source.fileName : ""
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    onSave({
      title: title.trim(),
      content: content.trim(),
      type,
      source,
      scope: {
        global: scopeGlobal,
        agentIds: scopeGlobal ? [] : selectedAgents,
        clientIds: scopeGlobal ? [] : selectedClients,
      },
    });
  }

  async function handleUrlFetch() {
    if (!urlInput.trim()) return;
    setUrlLoading(true);
    setUrlError(null);

    try {
      const res = await fetch("/api/fetch-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: urlInput.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setUrlError(data.error || "Failed to fetch URL");
        return;
      }

      setContent(data.content);
      if (!title.trim()) setTitle(data.title || "");
      setSource({ kind: "url", url: urlInput.trim() });
    } catch {
      setUrlError("Network error — could not fetch URL");
    } finally {
      setUrlLoading(false);
    }
  }

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileLoading(true);
    setFileError(null);

    try {
      if (file.size > 5 * 1024 * 1024) {
        setFileError("File too large (max 5MB)");
        setFileLoading(false);
        return;
      }

      const text = await readFileAsText(file);
      setContent(text);
      setFileName(file.name);
      if (!title.trim()) setTitle(file.name.replace(/\.[^.]+$/, ""));
      setSource({ kind: "file", fileName: file.name, fileType: file.type || "text/plain" });
    } catch {
      setFileError("Could not read file. Only text-based files are supported.");
    } finally {
      setFileLoading(false);
    }
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

          {/* Content — with tabs for write / upload / url */}
          <div>
            <label className="block text-sm font-medium mb-1.5">Content</label>

            {/* Tabs */}
            <div className="flex items-center gap-1 mb-2 bg-gray-50 rounded-lg p-1">
              <TabButton
                active={contentTab === "write"}
                onClick={() => setContentTab("write")}
                icon={<FileText size={14} />}
                label="Write"
              />
              <TabButton
                active={contentTab === "upload"}
                onClick={() => setContentTab("upload")}
                icon={<Upload size={14} />}
                label="Upload File"
              />
              <TabButton
                active={contentTab === "url"}
                onClick={() => setContentTab("url")}
                icon={<Link2 size={14} />}
                label="From URL"
              />
            </div>

            {/* Upload panel */}
            {contentTab === "upload" && (
              <div className="mb-2 p-4 border-2 border-dashed border-border rounded-xl text-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt,.md,.csv,.json,.xml,.html,.htm,.rtf"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                {fileLoading ? (
                  <div className="flex items-center justify-center gap-2 py-2 text-sm text-muted">
                    <Loader2 size={16} className="animate-spin" />
                    Reading file...
                  </div>
                ) : (
                  <>
                    <Upload size={24} className="mx-auto text-muted mb-2" />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-sm font-medium text-accent hover:underline"
                    >
                      Choose a file
                    </button>
                    <p className="text-xs text-muted mt-1">
                      .txt, .md, .csv, .json, .xml, .html, .rtf — max 5MB
                    </p>
                    {fileName && (
                      <p className="text-xs text-green-600 mt-2 flex items-center justify-center gap-1">
                        <FileText size={12} />
                        Loaded: {fileName}
                      </p>
                    )}
                    {fileError && (
                      <p className="text-xs text-red-500 mt-2 flex items-center justify-center gap-1">
                        <AlertCircle size={12} />
                        {fileError}
                      </p>
                    )}
                  </>
                )}
              </div>
            )}

            {/* URL panel */}
            {contentTab === "url" && (
              <div className="mb-2 p-4 border border-border rounded-xl">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Link2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                    <input
                      type="url"
                      value={urlInput}
                      onChange={(e) => {
                        setUrlInput(e.target.value);
                        setUrlError(null);
                      }}
                      placeholder="https://example.com/page"
                      className="w-full pl-8 pr-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleUrlFetch}
                    disabled={!urlInput.trim() || urlLoading}
                    className="px-4 py-2 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent/90 disabled:opacity-40 transition-colors shrink-0 flex items-center gap-1.5"
                  >
                    {urlLoading ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        Fetching
                      </>
                    ) : (
                      "Fetch"
                    )}
                  </button>
                </div>
                {urlError && (
                  <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                    <AlertCircle size={12} />
                    {urlError}
                  </p>
                )}
                {source.kind === "url" && !urlError && (
                  <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                    <Link2 size={12} />
                    Content loaded from {source.url}
                  </p>
                )}
              </div>
            )}

            {/* Textarea — always visible */}
            <textarea
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                if (source.kind !== "manual") setSource({ kind: "manual" });
              }}
              rows={8}
              placeholder={
                contentTab === "upload"
                  ? "File content will appear here. You can edit it after uploading..."
                  : contentTab === "url"
                    ? "Fetched content will appear here. You can edit it after fetching..."
                    : "Write the knowledge, guidelines, or directive here..."
              }
              className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent resize-y leading-relaxed"
            />
            <div className="flex items-center justify-between mt-1">
              <p className="text-xs text-muted">
                This text is injected directly into agent context. Be specific and clear.
              </p>
              {content.length > 0 && (
                <p className="text-xs text-muted">
                  {content.length.toLocaleString()} chars
                </p>
              )}
            </div>
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

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
        active
          ? "bg-white text-foreground shadow-sm"
          : "text-muted hover:text-foreground"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Could not read file as text"));
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}
