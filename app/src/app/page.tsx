import Link from "next/link";
import { agents } from "@/lib/agents";
import { clients } from "@/lib/clients";
import {
  BarChart3,
  Search,
  Handshake,
  Settings,
  Activity,
  ArrowRight,
  TrendingUp,
  Users,
  DollarSign,
} from "lucide-react";

const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  BarChart3,
  Search,
  Handshake,
  Settings,
};

export default function Dashboard() {
  const activeClients = clients.filter((c) => c.status === "active").length;
  const avgHealth = Math.round(
    clients.reduce((sum, c) => sum + c.healthScore, 0) / clients.length
  );

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Welcome to GW Platform</h1>
        <p className="text-muted text-sm mt-1">
          Your AI-powered agency command center
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Active Clients"
          value={activeClients.toString()}
          icon={<Users size={18} />}
          color="#3B82F6"
        />
        <StatCard
          label="Avg Health Score"
          value={`${avgHealth}%`}
          icon={<TrendingUp size={18} />}
          color="#10B981"
        />
        <StatCard
          label="Agents Available"
          value={agents.length.toString()}
          icon={<Activity size={18} />}
          color="#8B5CF6"
        />
        <StatCard
          label="Total Monthly Budget"
          value="$80K"
          icon={<DollarSign size={18} />}
          color="#F59E0B"
        />
      </div>

      {/* Agents Grid */}
      <h2 className="text-lg font-semibold mb-4">Agents</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {agents.map((agent) => {
          const Icon = iconMap[agent.icon] || Activity;
          return (
            <Link
              key={agent.id}
              href={`/agents/${agent.slug}`}
              className="group bg-white border border-border rounded-xl p-5 hover:shadow-md hover:border-transparent transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
                  style={{ backgroundColor: agent.color }}
                >
                  <Icon size={20} />
                </div>
                <ArrowRight
                  size={16}
                  className="text-muted group-hover:text-foreground group-hover:translate-x-0.5 transition-all"
                />
              </div>
              <h3 className="font-semibold text-sm mb-1">{agent.name}</h3>
              <p className="text-xs text-muted leading-relaxed">
                {agent.description}
              </p>
            </Link>
          );
        })}
      </div>

      {/* Clients Overview */}
      <h2 className="text-lg font-semibold mb-4">Client Overview</h2>
      <div className="bg-white border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-gray-50/50">
              <th className="text-left font-medium text-muted px-5 py-3">Client</th>
              <th className="text-left font-medium text-muted px-5 py-3">Industry</th>
              <th className="text-left font-medium text-muted px-5 py-3">Budget</th>
              <th className="text-left font-medium text-muted px-5 py-3">Status</th>
              <th className="text-left font-medium text-muted px-5 py-3">Health</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client) => (
              <tr key={client.id} className="border-b border-border last:border-none hover:bg-gray-50/50">
                <td className="px-5 py-3 font-medium">{client.name}</td>
                <td className="px-5 py-3 text-muted">{client.industry}</td>
                <td className="px-5 py-3">{client.monthlyBudget}</td>
                <td className="px-5 py-3">
                  <StatusBadge status={client.status} />
                </td>
                <td className="px-5 py-3">
                  <HealthBar score={client.healthScore} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className="bg-white border border-border rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-muted font-medium">{label}</span>
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
          style={{ backgroundColor: color }}
        >
          {icon}
        </div>
      </div>
      <div className="text-2xl font-bold">{value}</div>
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

function HealthBar({ score }: { score: number }) {
  const color =
    score >= 80 ? "bg-green-500" : score >= 60 ? "bg-yellow-500" : "bg-red-500";
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${score}%` }} />
      </div>
      <span className="text-xs font-medium">{score}</span>
    </div>
  );
}
