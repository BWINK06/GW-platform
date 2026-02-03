"use client";

import { clients, Client } from "@/lib/clients";
import { Users, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface ClientSelectorProps {
  selectedClientId: string | null;
  onSelect: (client: Client | null) => void;
}

export function ClientSelector({ selectedClientId, onSelect }: ClientSelectorProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = selectedClientId
    ? clients.find((c) => c.id === selectedClientId)
    : null;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const statusColor = {
    active: "bg-green-500",
    prospect: "bg-yellow-500",
    onboarding: "bg-blue-500",
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-white hover:bg-gray-50 transition-colors text-sm"
      >
        <Users size={16} className="text-muted" />
        <span className={selected ? "text-foreground" : "text-muted"}>
          {selected ? selected.name : "Select client..."}
        </span>
        <ChevronDown size={14} className="text-muted ml-1" />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 w-72 bg-white border border-border rounded-lg shadow-lg z-50 py-1 max-h-80 overflow-y-auto">
          <button
            onClick={() => {
              onSelect(null);
              setOpen(false);
            }}
            className="w-full text-left px-3 py-2 text-sm text-muted hover:bg-gray-50"
          >
            No client (general)
          </button>
          <div className="border-t border-border my-1" />
          {clients.map((client) => (
            <button
              key={client.id}
              onClick={() => {
                onSelect(client);
                setOpen(false);
              }}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2 ${
                selectedClientId === client.id ? "bg-blue-50" : ""
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${statusColor[client.status]}`}
              />
              <div className="min-w-0">
                <div className="font-medium truncate">{client.name}</div>
                <div className="text-xs text-muted truncate">{client.industry}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
