import { clients } from "@/lib/clients";
import Link from "next/link";
import { ExternalLink, TrendingUp, TrendingDown, Minus } from "lucide-react";

export const metadata = {
  title: "Clients — GW Platform",
  description: "Client portfolio overview",
};

export default function ClientsPage() {
  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Clients</h1>
        <p className="text-muted text-sm mt-1">
          Manage your client portfolio and monitor account health
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {clients.map((client) => (
          <div
            key={client.id}
            className="bg-white border border-border rounded-xl p-6 hover:shadow-md transition-shadow"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold">{client.name}</h3>
                  <StatusBadge status={client.status} />
                </div>
                <p className="text-sm text-muted">{client.industry}</p>
              </div>
              <HealthScore score={client.healthScore} />
            </div>

            {/* Details */}
            <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
              <div>
                <span className="text-muted text-xs block mb-0.5">Monthly Budget</span>
                <span className="font-medium">{client.monthlyBudget}</span>
              </div>
              <div>
                <span className="text-muted text-xs block mb-0.5">Website</span>
                <span className="text-accent text-xs flex items-center gap-1">
                  {client.website}
                  <ExternalLink size={10} />
                </span>
              </div>
            </div>

            {/* Goals */}
            <div className="mb-4">
              <span className="text-muted text-xs block mb-1.5">Goals</span>
              <div className="space-y-1">
                {client.goals.map((goal, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs">
                    <span className="text-muted mt-0.5 shrink-0">
                      {i === 0 ? <TrendingUp size={12} className="text-green-500" /> :
                       i === 1 ? <Minus size={12} className="text-yellow-500" /> :
                       <TrendingDown size={12} className="text-muted" />}
                    </span>
                    <span>{goal}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Contacts */}
            <div className="mb-4">
              <span className="text-muted text-xs block mb-1.5">Key Contacts</span>
              <div className="flex flex-wrap gap-2">
                {client.contacts.map((contact, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 bg-gray-50 rounded-full px-2.5 py-1 text-xs"
                  >
                    <span className="w-5 h-5 rounded-full bg-accent/10 text-accent flex items-center justify-center text-[10px] font-medium">
                      {contact.name[0]}
                    </span>
                    <span>{contact.name}</span>
                    <span className="text-muted">· {contact.role}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2 pt-3 border-t border-border">
              <Link
                href="/agents/media-strategy"
                className="text-xs px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
              >
                Media Strategy
              </Link>
              <Link
                href="/agents/seo"
                className="text-xs px-3 py-1.5 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 transition-colors"
              >
                SEO
              </Link>
              <Link
                href="/agents/sales"
                className="text-xs px-3 py-1.5 rounded-lg bg-yellow-50 text-yellow-700 hover:bg-yellow-100 transition-colors"
              >
                Sales
              </Link>
              <Link
                href="/agents/operations"
                className="text-xs px-3 py-1.5 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors"
              >
                Operations
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    active: "bg-green-50 text-green-700 border-green-200",
    prospect: "bg-yellow-50 text-yellow-700 border-yellow-200",
    onboarding: "bg-blue-50 text-blue-700 border-blue-200",
  };
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium border ${
        styles[status] || ""
      }`}
    >
      {status}
    </span>
  );
}

function HealthScore({ score }: { score: number }) {
  const color =
    score >= 80
      ? "text-green-600 bg-green-50 border-green-200"
      : score >= 60
        ? "text-yellow-600 bg-yellow-50 border-yellow-200"
        : "text-red-600 bg-red-50 border-red-200";
  return (
    <div className={`px-2.5 py-1 rounded-lg border text-sm font-bold ${color}`}>
      {score}
    </div>
  );
}
