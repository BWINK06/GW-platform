import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getAgent } from "@/lib/agents";
import { getClient } from "@/lib/clients";

const anthropic = new Anthropic();

export async function POST(req: NextRequest) {
  try {
    const { messages, agentId, clientId, knowledge } = await req.json();

    const agent = getAgent(agentId);
    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    // Build system prompt with optional client context
    let systemPrompt = agent.systemPrompt;

    if (clientId) {
      const client = getClient(clientId);
      if (client) {
        systemPrompt += `\n\n--- ACTIVE CLIENT CONTEXT ---
Client: ${client.name}
Industry: ${client.industry}
Monthly Budget: ${client.monthlyBudget}
Website: ${client.website}
Status: ${client.status}
Health Score: ${client.healthScore}/100
Goals:
${client.goals.map((g) => `- ${g}`).join("\n")}
Key Contacts:
${client.contacts.map((c) => `- ${c.name} (${c.role})`).join("\n")}
--- END CLIENT CONTEXT ---

Use this client context to personalize all of your responses. Reference the client by name, tailor recommendations to their industry and goals, and consider their budget when making suggestions.`;
      }
    }

    // Inject knowledge hub entries
    if (knowledge && Array.isArray(knowledge) && knowledge.length > 0) {
      systemPrompt += "\n\n--- AGENCY KNOWLEDGE BASE ---\n";
      systemPrompt += "The following entries have been provided by agency leadership. Follow these guidelines, apply this knowledge, and respect all directives.\n\n";
      for (const entry of knowledge) {
        systemPrompt += `[${entry.type.toUpperCase()}] ${entry.title}\n${entry.content}\n\n`;
      }
      systemPrompt += "--- END KNOWLEDGE BASE ---";
    }

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      system: systemPrompt,
      messages: messages.map((m: { role: string; content: string }) => ({
        role: m.role,
        content: m.content,
      })),
    });

    const content =
      response.content[0].type === "text" ? response.content[0].text : "";

    return NextResponse.json({ content });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Failed to generate response" },
      { status: 500 }
    );
  }
}
