import { getAgent, agents } from "@/lib/agents";
import { ChatInterface } from "@/components/ChatInterface";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return agents.map((agent) => ({ slug: agent.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const agent = getAgent(slug);
  if (!agent) return {};
  return {
    title: `${agent.name} Agent — GW Platform`,
    description: agent.description,
  };
}

export default async function AgentPage({ params }: Props) {
  const { slug } = await params;
  const agent = getAgent(slug);

  if (!agent) {
    notFound();
  }

  return (
    <div className="h-full">
      <ChatInterface agent={agent} />
    </div>
  );
}
